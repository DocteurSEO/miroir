const miroir = (() => {
  // Pré-compilation des regex pour de meilleures performances
  const TEMPLATE_REGEX = /\{\{\s*(\w+)\s*\}\}/g;
  const TEMPLATE_REPLACE_REGEX = /\{\{\s*(\w+)\s*\}\}/g;
  
  const bindings = new Map();
  const watchers = new Map();
  const extensions = new Map();
  const elementCache = new WeakMap(); // WeakMap pour éviter fuites mémoire DOM
  
  // Système de batch pour optimiser les mises à jour multiples
  let batchQueue = new Set();
  let batchScheduled = false;

  function create(stateObj, options = {}) {
    const config = {
      root: options.root || document.body,
      bindSelector: options.bindSelector || '.bind',
      modelAttribute: options.modelAttribute || 'd-model',
      bindings: options.bindings || []
    };

    const proxy = new Proxy(stateObj, {
      set(target, key, value) {
        const oldVal = target[key];
        
        // Dirty checking - évite les mises à jour inutiles
        if (oldVal === value) {
          return true;
        }
        
        target[key] = value;

        // Ajoute à la queue de batch pour optimiser les mises à jour (60fps)
        batchQueue.add(key);
        
        if (!batchScheduled) {
          batchScheduled = true;
          requestAnimationFrame(() => {
            processBatch(target);
            batchQueue.clear();
            batchScheduled = false;
          });
        }

        // Déclenche les watchers immédiatement
        const keyWatchers = watchers.get(key);
        if (keyWatchers) {
          keyWatchers.forEach(cb => cb(value, oldVal));
        }

        return true;
      }
    });

    // Bindings JavaScript explicites
    bindFromConfig(config.bindings, proxy, config.root);
    
    // Bindings HTML classiques
    autoBind(config.root, proxy, config);
    
    runExtensions(config.root, proxy);
    
    // Ajoute une méthode destroy au proxy
    proxy.destroy = () => destroy(config.root);
    
    return proxy;
  }

  function processBatch(state) {
    batchQueue.forEach(key => {
      const keyBindings = bindings.get(key);
      if (keyBindings) {
        keyBindings.forEach(binding => {
          if (binding.type === 'text') {
            if (binding.el.originalHTML) {
              // Template HTML binding
              updateText(binding.el, state);
            } else {
              // JavaScript binding - simple text update
              binding.el.textContent = state[key] ?? '';
            }
          } else if (binding.type === 'model') {
            binding.el.value = state[key];
          }
        });
      }
    });
  }

  function bindFromConfig(bindingsConfig, state, root) {
    bindingsConfig.forEach(bindingObj => {
      Object.entries(bindingObj).forEach(([selector, prop]) => {
        const elements = root.querySelectorAll(selector);
        elements.forEach(el => {
          // Initialise le binding
          if (!bindings.has(prop)) {
            bindings.set(prop, []);
          }
          
          // Cache et optimise la vérification du type d'élément
          let isInput = elementCache.get(el);
          if (isInput === undefined) {
            const tag = el.tagName;
            isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
            elementCache.set(el, isInput);
          }
          
          if (isInput) {
            // Binding bidirectionnel pour les inputs
            el.value = state[prop] || '';
            const handler = e => state[prop] = e.target.value;
            el.addEventListener('input', handler);
            el._mitoirHandler = handler;
            bindings.get(prop).push({ type: 'model', el });
          } else {
            // Binding unidirectionnel pour le texte  
            el.textContent = state[prop] || '';
            bindings.get(prop).push({ type: 'text', el });
          }
        });
      });
    });
  }

  function autoBind(root, state, config) {
    // Bind text: {{ var }}
    root.querySelectorAll(config.bindSelector).forEach(el => {
      el.originalHTML = el.innerHTML;

      [...el.innerHTML.matchAll(TEMPLATE_REGEX)].forEach(match => {
        const key = match[1];
        if (!bindings.has(key)) {
          bindings.set(key, []);
        }
        bindings.get(key).push({ type: 'text', el });
      });

      updateText(el, state);
    });

    // Bind inputs: d-model
    root.querySelectorAll(`[${config.modelAttribute}]`).forEach(input => {
      const key = input.getAttribute(config.modelAttribute);
      input.value = state[key];

      const handler = e => state[key] = e.target.value;
      input.addEventListener('input', handler);
      input._mitoirHandler = handler;

      if (!bindings.has(key)) {
        bindings.set(key, []);
      }
      bindings.get(key).push({ type: 'model', el: input });
    });
  }

  function updateText(el, state) {
    // Vérification de sécurité pour originalHTML
    if (!el.originalHTML) {
      el.textContent = state[Object.keys(state)[0]] ?? '';
      return;
    }
    
    // Cache la détection HTML pour éviter indexOf répétitifs
    let hasHTML = elementCache.get(el);
    if (hasHTML === undefined) {
      hasHTML = el.originalHTML.indexOf('<') !== -1;
      elementCache.set(el, hasHTML);
    }
    
    // Optimisation: utilise textContent si pas de HTML, sinon innerHTML
    TEMPLATE_REPLACE_REGEX.lastIndex = 0;
    const content = el.originalHTML.replace(TEMPLATE_REPLACE_REGEX, (_, key) => state[key] ?? '');
    
    if (hasHTML) {
      el.innerHTML = content;
    } else {
      el.textContent = content;
    }
  }

  function watch(prop, callback) {
    if (!watchers.has(prop)) {
      watchers.set(prop, []);
    }
    watchers.get(prop).push(callback);
  }

  function extend(name, handler) {
    extensions.set(name, handler);
  }

  function runExtensions(root, state) {
    extensions.forEach((handler, attr) => {
      root.querySelectorAll(`[${attr}]`).forEach(el => {
        const expr = el.getAttribute(attr);
        handler(el, expr, state);
      });
    });
  }

  function destroy(root) {
    // Nettoie les event listeners
    root.querySelectorAll('input, textarea, select').forEach(el => {
      el.removeEventListener('input', el._mitoirHandler);
    });
    
    // Vide les maps (WeakMap se nettoie automatiquement)
    bindings.clear();
    watchers.clear();
    
    // Nettoie le batch
    batchQueue.clear();
    batchScheduled = false;
  }

  return { create, watch, extend };
})();
