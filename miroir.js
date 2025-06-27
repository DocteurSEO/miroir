/**
 * 🪞 Miroir.js - Ultra-lightweight reactive data binding library
 * 
 * @description Provides simple, powerful, and fast two-way data binding with zero dependencies.
 * Choose between HTML templates or JavaScript bindings - both work seamlessly together.
 * 
 * @version 1.0.0
 * @author Miroir.js Team
 * @license MIT
 * 
 * @example
 * // Basic usage with HTML templates
 * const state = miroir.create({
 *   name: 'John',
 *   age: 25
 * });
 * 
 * @example
 * // Advanced usage with JavaScript bindings
 * const app = miroir.create(state, {
 *   bindings: [
 *     { '.title': 'name' },
 *     { '#counter': 'count' }
 *   ]
 * });
 */
const miroir = (() => {
  
  // Pre-compiled regex patterns for optimal performance
  /** @type {RegExp} Template variable matching regex */
  const TEMPLATE_REGEX = /\{\{\s*(\w+)\s*\}\}/g;
  /** @type {RegExp} Template replacement regex */
  const TEMPLATE_REPLACE_REGEX = /\{\{\s*(\w+)\s*\}\}/g;
  
  // Core data structures using Maps for O(1) performance
  /** @type {Map<string, Array>} Property bindings storage */
  const bindings = new Map();
  /** @type {Map<string, Array>} Property watchers storage */
  const watchers = new Map();
  /** @type {Map<string, Function>} Custom extensions storage */
  const extensions = new Map();
  /** @type {WeakMap<Element, *>} Element cache to prevent memory leaks */
  const elementCache = new WeakMap();
  
  // Batch update system for 60fps performance
  /** @type {Set<string>} Queue of properties to update */
  let batchQueue = new Set();
  /** @type {boolean} Flag to prevent multiple animation frame requests */
  let batchScheduled = false;

  /**
   * Creates a reactive proxy with automatic DOM binding
   * 
   * @param {Object} stateObj - Initial state object to make reactive
   * @param {Object} [options={}] - Configuration options
   * @param {Element} [options.root=document.body] - Root element for DOM queries
   * @param {string} [options.bindSelector='.bind'] - CSS selector for HTML template elements
   * @param {string} [options.modelAttribute='d-model'] - Attribute name for two-way binding
   * @param {Array<Object>} [options.bindings=[]] - JavaScript binding configurations
   * 
   * @returns {Proxy} Reactive proxy object with destroy() method
   * 
   * @example
   * const app = miroir.create({ count: 0 }, {
   *   root: document.getElementById('app'),
   *   bindings: [{ '.counter': 'count' }]
   * });
   */
  function create(stateObj, options = {}) {
    // Merge default configuration with user options
    const config = {
      root: options.root || document.body,
      bindSelector: options.bindSelector || '.bind',
      modelAttribute: options.modelAttribute || 'd-model',
      bindings: options.bindings || []
    };

    // Create reactive proxy with optimized setter
    const proxy = new Proxy(stateObj, {
      /**
       * Proxy setter with dirty checking and batch updates
       * 
       * @param {Object} target - The target object
       * @param {string} key - Property name being set
       * @param {*} value - New property value
       * @returns {boolean} Always returns true for successful set
       */
      set(target, key, value) {
        const oldVal = target[key];
        
        // Dirty checking - skip updates if value hasn't changed
        if (oldVal === value) {
          return true;
        }
        
        // Update the target property
        target[key] = value;

        // Add to batch queue for optimized 60fps updates
        batchQueue.add(key);
        
        // Schedule batch processing using requestAnimationFrame
        if (!batchScheduled) {
          batchScheduled = true;
          requestAnimationFrame(() => {
            processBatch(target);
            batchQueue.clear();
            batchScheduled = false;
          });
        }

        // Trigger watchers immediately for real-time callbacks
        const keyWatchers = watchers.get(key);
        if (keyWatchers) {
          keyWatchers.forEach(cb => cb(value, oldVal));
        }

        return true;
      }
    });

    // Initialize JavaScript bindings first
    bindFromConfig(config.bindings, proxy, config.root);
    
    // Initialize HTML template bindings
    autoBind(config.root, proxy, config);
    
    // Run custom extensions
    runExtensions(config.root, proxy);
    
    // Add cleanup method to proxy
    proxy.destroy = () => destroy(config.root);
    
    return proxy;
  }

  /**
   * Processes batched updates for optimal performance
   * 
   * @private
   * @param {Object} state - Current state object
   * 
   * @description Updates all DOM elements associated with changed properties
   * in a single animation frame for smooth 60fps performance
   */
  function processBatch(state) {
    batchQueue.forEach(key => {
      const keyBindings = bindings.get(key);
      if (keyBindings) {
        keyBindings.forEach(binding => {
          if (binding.type === 'text') {
            if (binding.el.originalHTML) {
              // HTML template binding - complex replacement
              updateText(binding.el, state);
            } else {
              // JavaScript binding - simple text update
              binding.el.textContent = state[key] ?? '';
            }
          } else if (binding.type === 'model') {
            // Two-way form input binding
            binding.el.value = state[key];
          }
        });
      }
    });
  }

  /**
   * Binds JavaScript configuration objects to DOM elements
   * 
   * @private
   * @param {Array<Object>} bindingsConfig - Array of binding objects
   * @param {Proxy} state - Reactive state proxy
   * @param {Element} root - Root element for DOM queries
   * 
   * @description Processes bindings like [{ '.title': 'name' }] and creates
   * appropriate unidirectional or bidirectional bindings based on element type
   */
  function bindFromConfig(bindingsConfig, state, root) {
    bindingsConfig.forEach(bindingObj => {
      Object.entries(bindingObj).forEach(([selector, prop]) => {
        const elements = root.querySelectorAll(selector);
        elements.forEach(el => {
          // Initialize binding array if needed
          if (!bindings.has(prop)) {
            bindings.set(prop, []);
          }
          
          // Cache element type check for performance
          let isInput = elementCache.get(el);
          if (isInput === undefined) {
            const tag = el.tagName;
            isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
            elementCache.set(el, isInput);
          }
          
          if (isInput) {
            // Bidirectional binding for form elements
            el.value = state[prop] || '';
            const handler = e => state[prop] = e.target.value;
            el.addEventListener('input', handler);
            el._mitoirHandler = handler; // Store for cleanup
            bindings.get(prop).push({ type: 'model', el });
          } else {
            // Unidirectional binding for text elements
            el.textContent = state[prop] || '';
            bindings.get(prop).push({ type: 'text', el });
          }
        });
      });
    });
  }

  /**
   * Automatically binds HTML template elements and d-model attributes
   * 
   * @private
   * @param {Element} root - Root element for DOM queries
   * @param {Proxy} state - Reactive state proxy
   * @param {Object} config - Configuration object
   * 
   * @description Scans for elements with .bind class and d-model attributes,
   * creating appropriate bindings with template variable replacement
   */
  function autoBind(root, state, config) {
    // Bind HTML template elements with {{ variable }} syntax
    root.querySelectorAll(config.bindSelector).forEach(el => {
      // Store original HTML for template replacement
      el.originalHTML = el.innerHTML;

      // Find all template variables in the HTML
      [...el.innerHTML.matchAll(TEMPLATE_REGEX)].forEach(match => {
        const key = match[1];
        if (!bindings.has(key)) {
          bindings.set(key, []);
        }
        bindings.get(key).push({ type: 'text', el });
      });

      // Initial render
      updateText(el, state);
    });

    // Bind form inputs with d-model attribute
    root.querySelectorAll(`[${config.modelAttribute}]`).forEach(input => {
      const key = input.getAttribute(config.modelAttribute);
      
      // Set initial value
      input.value = state[key];

      // Create bidirectional binding
      const handler = e => state[key] = e.target.value;
      input.addEventListener('input', handler);
      input._mitoirHandler = handler; // Store for cleanup

      // Register binding
      if (!bindings.has(key)) {
        bindings.set(key, []);
      }
      bindings.get(key).push({ type: 'model', el: input });
    });
  }

  /**
   * Updates text content of template elements with variable replacement
   * 
   * @private
   * @param {Element} el - Element to update
   * @param {Object} state - Current state object
   * 
   * @description Replaces {{ variable }} patterns with actual values,
   * with smart detection of HTML vs text content for optimal performance
   */
  function updateText(el, state) {
    // Safety check for originalHTML property
    if (!el.originalHTML) {
      el.textContent = state[Object.keys(state)[0]] ?? '';
      return;
    }
    
    // Cache HTML detection to avoid repeated indexOf calls
    let hasHTML = elementCache.get(el);
    if (hasHTML === undefined) {
      hasHTML = el.originalHTML.indexOf('<') !== -1;
      elementCache.set(el, hasHTML);
    }
    
    // Replace template variables with actual values
    TEMPLATE_REPLACE_REGEX.lastIndex = 0;
    const content = el.originalHTML.replace(TEMPLATE_REPLACE_REGEX, (_, key) => state[key] ?? '');
    
    // Use appropriate update method based on content type
    if (hasHTML) {
      el.innerHTML = content;
    } else {
      el.textContent = content; // Faster for plain text
    }
  }

  /**
   * Watches a property for changes and calls callback when it changes
   * 
   * @param {string} prop - Property name to watch
   * @param {Function} callback - Function to call when property changes
   * @param {Function} callback.newValue - New property value
   * @param {Function} callback.oldValue - Previous property value
   * 
   * @example
   * miroir.watch('count', (newVal, oldVal) => {
   *   console.log(`Count changed from ${oldVal} to ${newVal}`);
   * });
   */
  function watch(prop, callback) {
    if (!watchers.has(prop)) {
      watchers.set(prop, []);
    }
    watchers.get(prop).push(callback);
  }

  /**
   * Extends Miroir.js with custom directives
   * 
   * @param {string} name - Attribute name for the extension (e.g., 'm-show')
   * @param {Function} handler - Handler function for the extension
   * @param {Element} handler.el - DOM element with the attribute
   * @param {string} handler.expr - Attribute value/expression
   * @param {Proxy} handler.state - Reactive state object
   * 
   * @example
   * miroir.extend('m-show', (el, prop, state) => {
   *   el.style.display = state[prop] ? 'block' : 'none';
   * });
   */
  function extend(name, handler) {
    extensions.set(name, handler);
  }

  /**
   * Runs all registered extensions on the specified root element
   * 
   * @private
   * @param {Element} root - Root element to scan for extension attributes
   * @param {Proxy} state - Reactive state object
   * 
   * @description Scans for elements with extension attributes and executes
   * the corresponding handler functions
   */
  function runExtensions(root, state) {
    extensions.forEach((handler, attr) => {
      root.querySelectorAll(`[${attr}]`).forEach(el => {
        const expr = el.getAttribute(attr);
        handler(el, expr, state);
      });
    });
  }

  /**
   * Cleans up all bindings and event listeners for memory management
   * 
   * @private
   * @param {Element} root - Root element to clean up
   * 
   * @description Removes event listeners, clears data structures,
   * and resets batch state. WeakMap cleans itself automatically.
   */
  function destroy(root) {
    // Remove event listeners to prevent memory leaks
    root.querySelectorAll('input, textarea, select').forEach(el => {
      if (el._mitoirHandler) {
        el.removeEventListener('input', el._mitoirHandler);
        delete el._mitoirHandler;
      }
    });
    
    // Clear data structures (WeakMap cleans itself automatically)
    bindings.clear();
    watchers.clear();
    
    // Reset batch system
    batchQueue.clear();
    batchScheduled = false;
  }

  // Public API
  return { 
    create, 
    watch, 
    extend 
  };
})();