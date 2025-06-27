/**
 * 🪞 Miroir.js - Ultra-lightweight reactive data binding library
 * 
 * @description Provides simple, powerful, and fast two-way data binding with zero dependencies.
 * Choose between HTML templates or JavaScript bindings - both work seamlessly together.
 * 
 * @version 0.5.1
 * @author Ahmed SENEINA
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
  
  // Pre-compiled regex pattern for optimal performance
  /** @type {RegExp} Template variable matching and replacement regex */
  const TEMPLATE_REGEX = /\{\{\s*(\w+)\s*\}\}/g;
  
  // Core data structures using Maps for O(1) performance
  /** @type {Map<string, Array>} Property bindings storage */
  const bindings = new Map();
  /** @type {Map<string, Array>} Property watchers storage */
  const watchers = new Map();
  /** @type {Map<string, Function>} Custom extensions storage */
  const extensions = new Map();
  /** @type {WeakMap<Element, *>} Element cache to prevent memory leaks */
  const elementCache = new WeakMap();
  /** @type {WeakMap<Element, Array>} DOM query cache per root element */
  const domCache = new WeakMap();
  
  // Batch update system for 60fps performance
  /** @type {Array<string>} Queue of properties to update (order matters) */
  let batchQueue = [];
  /** @type {boolean} Flag to prevent multiple animation frame requests */
  let batchScheduled = false;

  /**
   * Creates a reactive proxy with automatic DOM binding
   * 
   * @param {Object} stateObj - Initial state object to make reactive
   * @param {Object} [options={}] - Configuration options
   * @param {Element} [options.root=document.body] - Root element for DOM queries
   * @param {string} [options.bindSelector='.bind'] - CSS selector for HTML template elements
   * @param {string} [options.modelAttribute='m-model'] - Attribute name for two-way binding
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
      modelAttribute: options.modelAttribute || 'm-model',
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

        // Add to batch queue for optimized 60fps updates (avoid duplicates)
        if (!batchQueue.includes(key)) {
          batchQueue.push(key);
        }
        
        // Schedule batch processing using requestAnimationFrame
        if (!batchScheduled) {
          batchScheduled = true;
          requestAnimationFrame(() => {
            processBatch(target);
            batchQueue.length = 0;
            batchScheduled = false;
          });
        }

        // Trigger watchers immediately for real-time callbacks
        const keyWatchers = watchers.get(key);
        if (keyWatchers) {
          for (let i = 0; i < keyWatchers.length; i++) {
            keyWatchers[i](value, oldVal);
          }
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
    for (let i = 0; i < batchQueue.length; i++) {
      const key = batchQueue[i];
      const keyBindings = bindings.get(key);
      if (keyBindings) {
        for (let j = 0; j < keyBindings.length; j++) {
          const binding = keyBindings[j];
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
        }
      }
    }
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
    for (let i = 0; i < bindingsConfig.length; i++) {
      const bindingObj = bindingsConfig[i];
      const entries = Object.entries(bindingObj);
      for (let j = 0; j < entries.length; j++) {
        const [selector, prop] = entries[j];
        const elements = getCachedElements(root, selector);
        for (let k = 0; k < elements.length; k++) {
          const el = elements[k];
          // Initialize binding array if needed
          if (!bindings.has(prop)) {
            bindings.set(prop, []);
          }
          
          // Cache element type check for performance
          let cached = elementCache.get(el);
          let isInput;
          if (!cached || cached.isInput === undefined) {
            const tag = el.tagName;
            isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
            if (cached) {
              cached.isInput = isInput;
            } else {
              elementCache.set(el, { isInput });
            }
          } else {
            isInput = cached.isInput;
          }
          
          if (isInput) {
            // Bidirectional binding for form elements
            el.value = state[prop] || '';
            const handler = e => { state[prop] = e.target.value; };
            el.addEventListener('input', handler);
            
            // Store handler in WeakMap for cleanup
            cached = elementCache.get(el);
            cached.handler = handler;
            
            bindings.get(prop).push({ type: 'model', el });
          } else {
            // Unidirectional binding for text elements
            el.textContent = state[prop] || '';
            bindings.get(prop).push({ type: 'text', el });
          }
        }
      }
    }
  }

  /**
   * Automatically binds HTML template elements and m-model attributes
   * 
   * @private
   * @param {Element} root - Root element for DOM queries
   * @param {Proxy} state - Reactive state proxy
   * @param {Object} config - Configuration object
   * 
   * @description Scans for elements with .bind class and m-model attributes,
   * creating appropriate bindings with template variable replacement
   */
  function autoBind(root, state, config) {
    // Bind HTML template elements with {{ variable }} syntax
    const templateElements = getCachedElements(root, config.bindSelector);
    for (let i = 0; i < templateElements.length; i++) {
      const el = templateElements[i];
      // Store original HTML for template replacement
      el.originalHTML = el.innerHTML;

      // Find all template variables in the HTML
      const matches = [...el.innerHTML.matchAll(TEMPLATE_REGEX)];
      for (let j = 0; j < matches.length; j++) {
        const key = matches[j][1];
        if (!bindings.has(key)) {
          bindings.set(key, []);
        }
        bindings.get(key).push({ type: 'text', el });
      }

      // Initial render
      updateText(el, state);
    }

    // Bind form inputs with m-model attribute
    const modelElements = getCachedElements(root, `[${config.modelAttribute}]`);
    for (let i = 0; i < modelElements.length; i++) {
      const input = modelElements[i];
      const key = input.getAttribute(config.modelAttribute);
      
      // Set initial value
      input.value = state[key] || '';

      // Create bidirectional binding with lighter handler
      const handler = e => { state[key] = e.target.value; };
      input.addEventListener('input', handler);
      
      // Store handler in WeakMap for cleanup
      elementCache.set(input, { isInput: true, handler });

      // Register binding
      if (!bindings.has(key)) {
        bindings.set(key, []);
      }
      bindings.get(key).push({ type: 'model', el: input });
    }
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
    let cached = elementCache.get(el);
    if (!cached || cached.hasHTML === undefined) {
      const hasHTML = el.originalHTML.indexOf('<') !== -1;
      if (cached) {
        cached.hasHTML = hasHTML;
      } else {
        elementCache.set(el, { hasHTML });
      }
      cached = elementCache.get(el);
    }
    
    // Replace template variables with actual values
    const content = el.originalHTML.replace(TEMPLATE_REGEX, (_, key) => state[key] ?? '');
    
    // Use appropriate update method based on content type
    if (cached.hasHTML) {
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
    const extensionEntries = [...extensions.entries()];
    for (let i = 0; i < extensionEntries.length; i++) {
      const [attr, handler] = extensionEntries[i];
      const elements = getCachedElements(root, `[${attr}]`);
      for (let j = 0; j < elements.length; j++) {
        const el = elements[j];
        const expr = el.getAttribute(attr);
        handler(el, expr, state);
      }
    }
  }

  /**
   * Gets cached DOM elements or queries and caches them for performance
   * 
   * @private
   * @param {Element} root - Root element for DOM queries
   * @param {string} selector - CSS selector to query
   * @returns {Array<Element>} Array of matching elements
   * 
   * @description Caches querySelectorAll results per root element to avoid
   * repeated DOM queries during initialization
   */
  function getCachedElements(root, selector) {
    let cache = domCache.get(root);
    if (!cache) {
      cache = new Map();
      domCache.set(root, cache);
    }
    
    if (!cache.has(selector)) {
      cache.set(selector, [...root.querySelectorAll(selector)]);
    }
    
    return cache.get(selector);
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
    const formElements = getCachedElements(root, 'input, textarea, select');
    for (let i = 0; i < formElements.length; i++) {
      const el = formElements[i];
      const cached = elementCache.get(el);
      if (cached && cached.handler) {
        el.removeEventListener('input', cached.handler);
      }
    }
    
    // Clear data structures (WeakMap cleans itself automatically)
    bindings.clear();
    watchers.clear();
    domCache.delete(root);
    
    // Reset batch system
    batchQueue.length = 0;
    batchScheduled = false;
  }

  // Public API
  return { 
    create, 
    watch, 
    extend 
  };
})();



