# 🔌 Miroir.js Extensions Cookbook

Transform Miroir.js from simple to powerful with these common extensions. Each extension is a one-liner that extends the library's capabilities.

## 📋 Table of Contents

- [🎯 Conditionals](#-conditionals)
- [📝 Lists & Arrays](#-lists--arrays) 
- [📋 Forms](#-forms)
- [🎨 UI & Styling](#-ui--styling)
- [🔧 Utilities](#-utilities)
- [🚀 Advanced](#-advanced)

---

## 🎯 Conditionals

### `m-show` - Show/Hide Elements
```javascript
miroir.extend('m-show', (el, prop, state) => {
  el.style.display = state[prop] ? 'block' : 'none';
});
```
**Usage:**
```html
<div m-show="isVisible">This appears when isVisible is true</div>
```

### `m-hide` - Inverse Show
```javascript
miroir.extend('m-hide', (el, prop, state) => {
  el.style.display = state[prop] ? 'none' : 'block';
});
```

### `m-if` - Conditional Rendering
```javascript
miroir.extend('m-if', (el, prop, state) => {
  if (state[prop]) {
    el.style.removeProperty('display');
    el.removeAttribute('hidden');
  } else {
    el.hidden = true;
  }
});
```

### `m-class` - Conditional CSS Classes
```javascript
miroir.extend('m-class', (el, expr, state) => {
  const [className, prop] = expr.split(':');
  el.classList.toggle(className.trim(), !!state[prop.trim()]);
});
```
**Usage:**
```html
<div m-class="active:isSelected">Toggle active class</div>
```

---

## 📝 Lists & Arrays

### `m-count` - Array Length Display
```javascript
miroir.extend('m-count', (el, prop, state) => {
  const value = state[prop];
  el.textContent = Array.isArray(value) ? value.length : (value || 0);
});
```
**Usage:**
```html
<span m-count="todos">0</span> tasks remaining
```

### `m-each` - Simple List Rendering
```javascript
miroir.extend('m-each', (el, expr, state) => {
  const [itemName, arrayProp] = expr.split(' in ').map(s => s.trim());
  const array = state[arrayProp] || [];
  const template = el.dataset.template || '<div>{{item}}</div>';
  
  el.innerHTML = array.map(item => 
    template.replace(/\{\{item\}\}/g, item)
  ).join('');
});
```
**Usage:**
```html
<div m-each="task in todos" data-template="<li>{{item}}</li>"></div>
```

### `m-filter` - Filtered List Display
```javascript
miroir.extend('m-filter', (el, expr, state) => {
  const [arrayProp, filterProp] = expr.split('|').map(s => s.trim());
  const array = state[arrayProp] || [];
  const filter = state[filterProp] || '';
  
  const filtered = array.filter(item => 
    item.toString().toLowerCase().includes(filter.toLowerCase())
  );
  
  el.innerHTML = filtered.map(item => `<div>${item}</div>`).join('');
});
```

### `m-empty` - Show When Array is Empty
```javascript
miroir.extend('m-empty', (el, prop, state) => {
  const array = state[prop] || [];
  el.style.display = (Array.isArray(array) && array.length === 0) ? 'block' : 'none';
});
```

---

## 📋 Forms

### `m-validate` - Real-time Validation
```javascript
miroir.extend('m-validate', (el, rules, state) => {
  const value = state[el.getAttribute('m-model')] || '';
  const ruleList = rules.split('|');
  let isValid = true;
  let message = '';
  
  ruleList.forEach(rule => {
    if (rule === 'required' && !value) {
      isValid = false;
      message = 'This field is required';
    }
    if (rule.startsWith('min:') && value.length < parseInt(rule.split(':')[1])) {
      isValid = false;
      message = `Minimum ${rule.split(':')[1]} characters`;
    }
    if (rule === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      isValid = false;
      message = 'Invalid email format';
    }
  });
  
  el.classList.toggle('error', !isValid);
  const errorEl = el.nextElementSibling;
  if (errorEl && errorEl.classList.contains('error-message')) {
    errorEl.textContent = message;
  }
});
```
**Usage:**
```html
<input m-model="email" m-validate="required|email">
<span class="error-message"></span>
```

### `m-submit` - Form Submission Handler
```javascript
miroir.extend('m-submit', (el, handler, state) => {
  el.addEventListener('submit', (e) => {
    e.preventDefault();
    if (typeof window[handler] === 'function') {
      window[handler](state, e);
    }
  });
});
```

### `m-reset` - Reset Form Fields
```javascript
miroir.extend('m-reset', (el, props, state) => {
  el.addEventListener('click', () => {
    props.split(',').forEach(prop => {
      state[prop.trim()] = '';
    });
  });
});
```

---

## 🎨 UI & Styling

### `m-style` - Dynamic Inline Styles
```javascript
miroir.extend('m-style', (el, expr, state) => {
  const [property, prop] = expr.split(':').map(s => s.trim());
  el.style[property] = state[prop] || '';
});
```
**Usage:**
```html
<div m-style="background-color:themeColor"></div>
```

### `m-animate` - CSS Animation Trigger
```javascript
miroir.extend('m-animate', (el, expr, state) => {
  const [animation, prop] = expr.split(':');
  if (state[prop]) {
    el.style.animation = animation;
    setTimeout(() => el.style.animation = '', 1000);
  }
});
```

### `m-toggle` - Toggle Classes on Click
```javascript
miroir.extend('m-toggle', (el, className, state) => {
  el.addEventListener('click', () => {
    el.classList.toggle(className);
  });
});
```

### `m-progress` - Progress Bar
```javascript
miroir.extend('m-progress', (el, prop, state) => {
  const value = Math.min(Math.max(state[prop] || 0, 0), 100);
  el.style.width = `${value}%`;
  el.setAttribute('aria-valuenow', value);
});
```

---

## 🔧 Utilities

### `m-format` - Text Formatting
```javascript
miroir.extend('m-format', (el, expr, state) => {
  const [type, prop] = expr.split(':');
  const value = state[prop];
  
  switch(type) {
    case 'currency':
      el.textContent = new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD'
      }).format(value || 0);
      break;
    case 'date':
      el.textContent = value ? new Date(value).toLocaleDateString() : '';
      break;
    case 'uppercase':
      el.textContent = (value || '').toString().toUpperCase();
      break;
    case 'lowercase':
      el.textContent = (value || '').toString().toLowerCase();
      break;
    default:
      el.textContent = value || '';
  }
});
```
**Usage:**
```html
<span m-format="currency:price">$0.00</span>
<span m-format="date:createdAt"></span>
```

### `m-timeout` - Delayed Actions
```javascript
miroir.extend('m-timeout', (el, expr, state) => {
  const [delay, prop] = expr.split(':');
  if (state[prop]) {
    setTimeout(() => {
      state[prop] = false;
    }, parseInt(delay));
  }
});
```

### `m-click` - Click Handlers
```javascript
miroir.extend('m-click', (el, handler, state) => {
  el.addEventListener('click', () => {
    if (typeof window[handler] === 'function') {
      window[handler](state, el);
    }
  });
});
```

### `m-outside` - Click Outside Detection
```javascript
miroir.extend('m-outside', (el, prop, state) => {
  document.addEventListener('click', (e) => {
    if (!el.contains(e.target)) {
      state[prop] = false;
    }
  });
});
```

---

## 🚀 Advanced

### `m-lazy` - Lazy Loading
```javascript
miroir.extend('m-lazy', (el, prop, state) => {
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
```

### `m-storage` - Local Storage Sync
```javascript
miroir.extend('m-storage', (el, key, state) => {
  // Load from storage
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      Object.assign(state, JSON.parse(stored));
    } catch(e) {}
  }
  
  // Save to storage on changes
  miroir.watch(Object.keys(state)[0], () => {
    localStorage.setItem(key, JSON.stringify(state));
  });
});
```

### `m-debounce` - Debounced Updates
```javascript
miroir.extend('m-debounce', (el, expr, state) => {
  const [delay, prop] = expr.split(':');
  let timeout;
  
  miroir.watch(prop, (newVal) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      el.textContent = newVal;
    }, parseInt(delay));
  });
});
```

---

## 🎨 Usage Examples

### Complete Todo App with Extensions
```html
<div id="todo-app">
  <!-- Header with count -->
  <h1>Tasks (<span m-count="todos">0</span>)</h1>
  
  <!-- Add new todo -->
  <form m-submit="addTodo">
    <input m-model="newTodo" m-validate="required" placeholder="New task...">
    <button type="submit">Add</button>
  </form>
  
  <!-- Filter controls -->
  <div>
    <button m-click="showAll" m-class="active:showingAll">All</button>
    <button m-click="showCompleted" m-class="active:showingCompleted">Done</button>
  </div>
  
  <!-- Todo list -->
  <div m-each="todo in filteredTodos" data-template='
    <div class="todo-item">
      <input type="checkbox" m-class="completed:todo.done">
      <span m-class="done:todo.done">{{item.text}}</span>
      <button m-click="deleteTodo">×</button>
    </div>
  '></div>
  
  <!-- Empty state -->
  <div m-empty="todos" class="empty-state">
    No tasks yet! Add one above.
  </div>
  
  <!-- Storage sync -->
  <div m-storage="todos-app" style="display:none;"></div>
</div>
```

---

## 📚 Best Practices

1. **Keep extensions simple** - One responsibility per extension
2. **Use descriptive names** - `m-show` is better than `m-s`
3. **Handle edge cases** - Check for null/undefined values
4. **Document your custom extensions** - Help your team understand
5. **Performance matters** - Avoid expensive operations in extensions

---

## 🤝 Contributing Extensions

Have a useful extension? Share it with the community! 

Create a pull request with:
- Extension code
- Usage examples  
- Edge case handling
- Performance considerations

Together we can build a powerful ecosystem around Miroir.js! 🚀