/**
 * 🔌 Miroir.js Extensions Collection
 * Ready-to-use extensions for common use cases
 * Copy and paste the ones you need!
 */

// =============================================================================
// 🎯 CONDITIONALS & VISIBILITY
// =============================================================================

// Show/hide elements based on state
// Usage: <div m-show="isVisible">Content</div>
miroir.extend('m-show', (el, prop, state) => {
  el.style.display = state[prop] ? 'block' : 'none';
});

// Inverse show - hide when true
// Usage: <div m-hide="isLoading">Content shows when not loading</div>
miroir.extend('m-hide', (el, prop, state) => {
  el.style.display = state[prop] ? 'none' : 'block';
});

// Conditional rendering with hidden attribute (more semantic)
// Usage: <div m-if="hasPermission">Sensitive content</div>
miroir.extend('m-if', (el, prop, state) => {
  if (state[prop]) {
    el.style.removeProperty('display');
    el.removeAttribute('hidden');
  } else {
    el.hidden = true;
  }
});

// Toggle CSS classes conditionally
// Usage: <div m-class="active:isSelected">Item</div>
miroir.extend('m-class', (el, expr, state) => {
  const [className, prop] = expr.split(':').map(s => s.trim());
  el.classList.toggle(className, !!state[prop]);
});

// =============================================================================
// 📝 LISTS & ARRAYS
// =============================================================================

// Display array length
miroir.extend('m-count', (el, prop, state) => {
  const value = state[prop];
  el.textContent = Array.isArray(value) ? value.length : (value || 0);
});

// Simple list rendering
miroir.extend('m-each', (el, expr, state) => {
  const [itemName, arrayProp] = expr.split(' in ').map(s => s.trim());
  const array = state[arrayProp] || [];
  const template = el.dataset.template || '<div>{{item}}</div>';
  
  el.innerHTML = array.map((item, index) => {
    return template
      .replace(/\{\{item\}\}/g, typeof item === 'object' ? JSON.stringify(item) : item)
      .replace(/\{\{index\}\}/g, index);
  }).join('');
});

// Show element when array is empty
miroir.extend('m-empty', (el, prop, state) => {
  const array = state[prop] || [];
  el.style.display = (Array.isArray(array) && array.length === 0) ? 'block' : 'none';
});

// Filter array display
miroir.extend('m-filter', (el, expr, state) => {
  const [arrayProp, filterProp] = expr.split('|').map(s => s.trim());
  const array = state[arrayProp] || [];
  const filter = (state[filterProp] || '').toString().toLowerCase();
  
  const filtered = array.filter(item => 
    item.toString().toLowerCase().includes(filter)
  );
  
  el.innerHTML = filtered.map(item => `<div>${item}</div>`).join('');
});

// =============================================================================
// 📋 FORMS & VALIDATION
// =============================================================================

// Real-time form validation
miroir.extend('m-validate', (el, rules, state) => {
  const modelAttr = el.getAttribute('m-model');
  if (!modelAttr) return;
  
  const value = state[modelAttr] || '';
  const ruleList = rules.split('|');
  let isValid = true;
  let message = '';
  
  ruleList.forEach(rule => {
    if (!isValid) return; // Stop at first error
    
    if (rule === 'required' && !value) {
      isValid = false;
      message = 'This field is required';
    } else if (rule.startsWith('min:')) {
      const min = parseInt(rule.split(':')[1]);
      if (value.length < min) {
        isValid = false;
        message = `Minimum ${min} characters required`;
      }
    } else if (rule.startsWith('max:')) {
      const max = parseInt(rule.split(':')[1]);
      if (value.length > max) {
        isValid = false;
        message = `Maximum ${max} characters allowed`;
      }
    } else if (rule === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
      }
    } else if (rule === 'number') {
      if (isNaN(value) || value === '') {
        isValid = false;
        message = 'Please enter a valid number';
      }
    }
  });
  
  // Update element classes
  el.classList.toggle('error', !isValid);
  el.classList.toggle('valid', isValid && value !== '');
  
  // Update error message if exists
  const errorEl = el.nextElementSibling;
  if (errorEl && errorEl.classList.contains('error-message')) {
    errorEl.textContent = message;
    errorEl.style.display = message ? 'block' : 'none';
  }
});

// Form submission handler
miroir.extend('m-submit', (el, handler, state) => {
  el.addEventListener('submit', (e) => {
    e.preventDefault();
    if (typeof window[handler] === 'function') {
      window[handler](state, e);
    }
  });
});

// Reset form fields
miroir.extend('m-reset', (el, props, state) => {
  el.addEventListener('click', () => {
    props.split(',').forEach(prop => {
      state[prop.trim()] = '';
    });
  });
});

// =============================================================================
// 🎨 UI & STYLING
// =============================================================================

// Dynamic inline styles
miroir.extend('m-style', (el, expr, state) => {
  const [property, prop] = expr.split(':').map(s => s.trim());
  const value = state[prop];
  if (value !== undefined) {
    el.style[property] = value;
  }
});

// CSS animation trigger
miroir.extend('m-animate', (el, expr, state) => {
  const [animation, prop] = expr.split(':');
  if (state[prop]) {
    el.style.animation = animation;
    // Auto-clear after animation
    setTimeout(() => {
      el.style.animation = '';
      state[prop] = false; // Reset trigger
    }, 1000);
  }
});

// Toggle classes on click
miroir.extend('m-toggle', (el, className, state) => {
  el.addEventListener('click', () => {
    el.classList.toggle(className);
  });
});

// Progress bar
miroir.extend('m-progress', (el, prop, state) => {
  const value = Math.min(Math.max(state[prop] || 0, 0), 100);
  el.style.width = `${value}%`;
  el.setAttribute('aria-valuenow', value);
  
  // Optional: Add text content
  if (el.dataset.showText === 'true') {
    el.textContent = `${Math.round(value)}%`;
  }
});

// =============================================================================
// 🔧 UTILITIES
// =============================================================================

// Text formatting
miroir.extend('m-format', (el, expr, state) => {
  const [type, prop] = expr.split(':').map(s => s.trim());
  const value = state[prop];
  
  switch(type) {
    case 'currency':
      el.textContent = new Intl.NumberFormat('en-US', {
        style: 'currency', 
        currency: 'USD'
      }).format(value || 0);
      break;
      
    case 'date':
      el.textContent = value ? new Date(value).toLocaleDateString() : '';
      break;
      
    case 'time':
      el.textContent = value ? new Date(value).toLocaleTimeString() : '';
      break;
      
    case 'number':
      el.textContent = new Intl.NumberFormat().format(value || 0);
      break;
      
    case 'uppercase':
      el.textContent = (value || '').toString().toUpperCase();
      break;
      
    case 'lowercase':
      el.textContent = (value || '').toString().toLowerCase();
      break;
      
    case 'capitalize':
      const str = (value || '').toString();
      el.textContent = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      break;
      
    default:
      el.textContent = value || '';
  }
});

// Click handlers
miroir.extend('m-click', (el, handler, state) => {
  el.addEventListener('click', (e) => {
    if (typeof window[handler] === 'function') {
      window[handler](state, el, e);
    }
  });
});

// Delayed state changes
miroir.extend('m-timeout', (el, expr, state) => {
  const [delay, prop] = expr.split(':').map(s => s.trim());
  
  // Watch for property changes
  miroir.watch(prop, (newVal) => {
    if (newVal) {
      setTimeout(() => {
        state[prop] = false;
      }, parseInt(delay));
    }
  });
});

// Click outside detection
miroir.extend('m-outside', (el, prop, state) => {
  const handleClick = (e) => {
    if (!el.contains(e.target)) {
      state[prop] = false;
    }
  };
  
  document.addEventListener('click', handleClick);
  
  // Cleanup on element removal (if supported)
  if (window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && 
            !document.contains(el)) {
          document.removeEventListener('click', handleClick);
          observer.disconnect();
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
});

// =============================================================================
// 🎯 DEEP MODEL BINDING
// =============================================================================

// Deep model binding for nested object properties
// Usage: <input d-deep-model="user.profile.name" placeholder="Name">
miroir.extend('d-deep-model', (el, prop, state) => {
  // Utility function to get nested property value
  const getValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };
  
  // Utility function to set nested property value
  const setValue = (obj, path, value) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (current[key] === undefined) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  };
  
  // Set initial value from nested property
  const initialValue = getValue(state, prop);
  if (initialValue !== undefined) {
    el.value = initialValue;
  }
  
  // Create bidirectional binding
  const handler = (e) => {
    setValue(state, prop, e.target.value);
  };
  
  el.addEventListener('input', handler);
  el.addEventListener('change', handler); // For select elements
  
  // Store handler for cleanup if needed
  if (!el._deepModelHandler) {
    el._deepModelHandler = handler;
  }
});

// =============================================================================
// 🚀 ADVANCED EXTENSIONS
// =============================================================================

// Lazy loading with Intersection Observer
miroir.extend('m-lazy', (el, prop, state) => {
  if (!window.IntersectionObserver) {
    state[prop] = true; // Fallback for older browsers
    return;
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        state[prop] = true;
        observer.disconnect();
      }
    });
  });
  
  observer.observe(el);
});

// Local storage synchronization
miroir.extend('m-storage', (el, key, state) => {
  // Load from storage on init
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      Object.assign(state, data);
    }
  } catch(e) {
    console.warn('Failed to load from localStorage:', e);
  }
  
  // Save to storage on any state change
  const saveToStorage = () => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch(e) {
      console.warn('Failed to save to localStorage:', e);
    }
  };
  
  // Watch all properties
  Object.keys(state).forEach(prop => {
    miroir.watch(prop, saveToStorage);
  });
});

// Debounced updates
miroir.extend('m-debounce', (el, expr, state) => {
  const [delay, prop] = expr.split(':').map(s => s.trim());
  let timeout;
  
  miroir.watch(prop, (newVal) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      el.textContent = newVal;
    }, parseInt(delay) || 300);
  });
});

// Auto-focus management
miroir.extend('m-focus', (el, prop, state) => {
  miroir.watch(prop, (shouldFocus) => {
    if (shouldFocus) {
      setTimeout(() => el.focus(), 0);
      state[prop] = false; // Reset
    }
  });
});

// Tooltip on hover
miroir.extend('m-tooltip', (el, text, state) => {
  const tooltip = document.createElement('div');
  tooltip.className = 'miroir-tooltip';
  tooltip.textContent = text;
  tooltip.style.cssText = `
    position: absolute;
    background: #333;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.2s;
  `;
  
  el.addEventListener('mouseenter', (e) => {
    document.body.appendChild(tooltip);
    const rect = el.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
    tooltip.style.opacity = '1';
  });
  
  el.addEventListener('mouseleave', () => {
    if (tooltip.parentNode) {
      tooltip.style.opacity = '0';
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 200);
    }
  });
});

// =============================================================================
// 📊 EXAMPLE USAGE FUNCTIONS
// =============================================================================

// Example functions for demos - you can delete these
window.addTodo = (state) => {
  if (state.newTodo?.trim()) {
    if (!state.todos) state.todos = [];
    state.todos.push({
      id: Date.now(),
      text: state.newTodo.trim(),
      completed: false
    });
    state.newTodo = '';
  }
};

window.deleteTodo = (state, el) => {
  const todoId = parseInt(el.dataset.id);
  if (state.todos && todoId) {
    state.todos = state.todos.filter(todo => todo.id !== todoId);
  }
};

window.showNotification = (state) => {
  state.notification = 'Action completed!';
  state.showNotification = true;
};

// =============================================================================
// 🎨 CSS HELPER STYLES (Optional)
// =============================================================================

// Add these styles to your CSS for better UX
const styles = `
<style>
  /* Form validation styles */
  .error { border-color: #e74c3c !important; }
  .valid { border-color: #27ae60 !important; }
  .error-message { 
    color: #e74c3c; 
    font-size: 0.875rem; 
    margin-top: 0.25rem;
    display: none;
  }
  
  /* Loading and animations */
  .fade-in { animation: fadeIn 0.3s ease-in; }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* Tooltip styles are inline above */
  
  /* Progress bar container */
  .progress-container {
    background: #f0f0f0;
    border-radius: 10px;
    height: 20px;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #007bff, #0056b3);
    transition: width 0.3s ease;
  }
</style>
`;

// Uncomment to auto-inject styles:
// document.head.insertAdjacentHTML('beforeend', styles);

console.log('🔌 Miroir.js extensions loaded!');
console.log('Available extensions:', [
  // UI & Conditionals
  'm-show', 'm-hide', 'm-if', 'm-class', 'm-style', 'm-animate', 'm-toggle',
  // Lists & Data
  'm-count', 'm-each', 'm-empty', 'm-filter', 'm-format', 
  // Forms & Validation
  'm-validate', 'm-submit', 'm-reset',
  // Deep Binding
  'd-deep-model', 'deep-watch',
  // Advanced Features
  'm-progress', 'm-click', 'm-timeout', 'm-outside', 'm-lazy', 'm-storage', 'm-debounce', 'm-focus', 'm-tooltip'
]);


// Built-in extensions
  
  /**
   * Deep watch extension for complex object structures
   * 
   * @description Monitors nested object changes with optimized caching using WeakMap
   * for memory efficiency. Only updates DOM when deep comparison detects actual changes.
   * 
   * @example
   * // HTML: <div deep-watch="user.profile">{{ user.profile.name }}, {{ user.profile.age }}</div>
   * // JS: app.user.profile.name = 'John'; // Triggers intelligent update
   * 
   * @performance Uses deep comparison with caching to avoid unnecessary DOM updates
   * while maintaining 60fps performance for complex nested objects.
   */
  const deepWatchCache = new WeakMap();
  
  miroir.extend('deep-watch', (el, prop, state) => {
    // Get nested property value
    const getValue = (obj, path) => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };
    
    // Optimized deep comparison with cache
    const deepCompare = (newVal, oldVal) => {
      if (newVal === oldVal) return true;
      if (newVal == null || oldVal == null) return false;
      if (typeof newVal !== 'object' || typeof oldVal !== 'object') return false;
      
      const newKeys = Object.keys(newVal);
      const oldKeys = Object.keys(oldVal);
      
      if (newKeys.length !== oldKeys.length) return false;
      
      for (let i = 0; i < newKeys.length; i++) {
        const key = newKeys[i];
        if (!oldKeys.includes(key)) return false;
        if (!deepCompare(newVal[key], oldVal[key])) return false;
      }
      
      return true;
    };
    
    const currentValue = getValue(state, prop);
    const cachedValue = deepWatchCache.get(el);
    
    // Only update if deep comparison shows difference
    if (!deepCompare(currentValue, cachedValue)) {
      deepWatchCache.set(el, JSON.parse(JSON.stringify(currentValue))); // Deep clone for cache
      
      // Update element content
      if (el.originalHTML) {
        el.innerHTML = el.originalHTML.replace(/\{\{\s*(\w+(?:\.\w+)*)\s*\}\}/g, (_, key) => {
          return getValue(state, key) ?? '';
        });
      } else {
        el.textContent = currentValue ?? '';
      }
    }
  });
