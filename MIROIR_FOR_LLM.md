# 🤖 Miroir.js for LLM/AI Development

**Complete guide for AI models and LLMs to understand and use Miroir.js effectively**

## Quick Overview

Miroir.js is a **2KB ultra-lightweight reactive data binding library** with zero dependencies. It provides two binding approaches:

1. **HTML Templates**: `{{ variable }}` syntax in HTML
2. **JavaScript Bindings**: CSS selector-based configuration

## Core API (3 functions only)

```javascript
// 1. Create reactive state
const app = miroir.create(stateObject, options)

// 2. Watch property changes  
miroir.watch(propertyName, callback)

// 3. Extend with custom directives
miroir.extend(attributeName, handlerFunction)
```

## Basic Usage Pattern

### HTML Template Approach
```html
<!-- HTML -->
<div class="bind">
  <h1>Hello {{ name }}!</h1>
  <p>Age: {{ age }}</p>
</div>
<input d-model="name" placeholder="Name">
<input d-model="age" type="number">

<script>
// JavaScript
const state = miroir.create({
  name: 'John',
  age: 25
});
</script>
```

### JavaScript Binding Approach  
```html
<!-- HTML -->
<div class="title"></div>
<div id="counter"></div>
<input id="name-input">

<script>
// JavaScript
const app = miroir.create({
  name: 'John',
  count: 0
}, {
  bindings: [
    { '.title': 'name' },      // CSS class -> property
    { '#counter': 'count' },   // ID -> property
    { '#name-input': 'name' }  // Input -> bidirectional
  ]
});
</script>
```

## Configuration Options

```javascript
miroir.create(stateObject, {
  root: document.getElementById('app'),           // Default: document.body
  bindSelector: '.reactive',                      // Default: '.bind'  
  modelAttribute: 'data-model',                   // Default: 'd-model'
  bindings: [                                     // Default: []
    { 'selector': 'propertyName' }
  ]
})
```

## Automatic Binding Rules

### Element Type Detection
- **INPUT/TEXTAREA/SELECT**: Bidirectional binding (changes update state)
- **Other elements**: Unidirectional binding (state updates element)

### Binding Types
```javascript
// Bidirectional (form elements)
{ '#email-input': 'email' }        // input.value ↔ state.email

// Unidirectional (display elements)  
{ '.username': 'name' }             // state.name → element.textContent
{ '#score': 'points' }              // state.points → element.textContent
```

## Watchers

```javascript
// Watch single property
miroir.watch('count', (newValue, oldValue) => {
  console.log(`Count: ${oldValue} → ${newValue}`);
});

// Multiple watchers
miroir.watch('name', (name) => updateTitle(name));
miroir.watch('score', (score) => checkHighScore(score));
```

## Extensions System

Create custom directives for common patterns:

```javascript
// Show/hide elements
miroir.extend('m-show', (el, prop, state) => {
  el.style.display = state[prop] ? 'block' : 'none';
});

// Usage: <div m-show="isVisible">Content</div>

// CSS classes
miroir.extend('m-class', (el, expr, state) => {
  const [className, prop] = expr.split(':');
  el.classList.toggle(className, !!state[prop]);
});

// Usage: <div m-class="active:isSelected">Item</div>
```

## Common Extensions Library

### Conditionals
```javascript
miroir.extend('m-show', (el, prop, state) => {
  el.style.display = state[prop] ? 'block' : 'none';
});

miroir.extend('m-hide', (el, prop, state) => {
  el.style.display = state[prop] ? 'none' : 'block';  
});

miroir.extend('m-class', (el, expr, state) => {
  const [className, prop] = expr.split(':');
  el.classList.toggle(className, !!state[prop]);
});
```

### Lists & Arrays
```javascript
miroir.extend('m-count', (el, prop, state) => {
  const value = state[prop];
  el.textContent = Array.isArray(value) ? value.length : (value || 0);
});

miroir.extend('m-each', (el, expr, state) => {
  const [itemName, arrayProp] = expr.split(' in ');
  const array = state[arrayProp] || [];
  const template = el.dataset.template || '<div>{{item}}</div>';
  
  el.innerHTML = array.map(item => 
    template.replace(/\{\{item\}\}/g, item)
  ).join('');
});
```

### Forms
```javascript
miroir.extend('m-validate', (el, rules, state) => {
  const value = state[el.getAttribute('d-model')] || '';
  const isValid = validateRules(value, rules);
  el.classList.toggle('error', !isValid);
});

miroir.extend('m-submit', (el, handler, state) => {
  el.addEventListener('submit', (e) => {
    e.preventDefault();
    window[handler](state, e);
  });
});
```

## Complete Examples

### Todo Application
```html
<!DOCTYPE html>
<html>
<head>
  <title>Todo App</title>
</head>
<body>
  <div id="app">
    <h1>Tasks (<span class="count">0</span>)</h1>
    
    <form class="add-form">
      <input d-model="newTodo" placeholder="Add task...">
      <button type="submit">Add</button>
    </form>
    
    <div class="todo-list"></div>
    
    <div class="empty-state" m-show="isEmpty">
      No tasks yet!
    </div>
  </div>

  <script src="miroir.js"></script>
  <script>
    // Extensions
    miroir.extend('m-show', (el, prop, state) => {
      el.style.display = state[prop] ? 'block' : 'none';
    });
    
    miroir.extend('m-each', (el, expr, state) => {
      const [item, arrayProp] = expr.split(' in ');
      const array = state[arrayProp] || [];
      el.innerHTML = array.map((todo, i) => `
        <div class="todo-item">
          <span>${todo.text}</span>
          <button onclick="deleteTodo(${i})">Delete</button>
        </div>
      `).join('');
    });

    // State
    const app = miroir.create({
      newTodo: '',
      todos: [],
      isEmpty: true
    }, {
      bindings: [
        { '.count': 'todoCount' },
        { '.todo-list': 'todos' }
      ]
    });

    // Form submission
    document.querySelector('.add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (app.newTodo.trim()) {
        app.todos.push({ text: app.newTodo.trim() });
        app.todoCount = app.todos.length;
        app.isEmpty = app.todos.length === 0;
        app.newTodo = '';
      }
    });

    // Delete function
    window.deleteTodo = (index) => {
      app.todos.splice(index, 1);
      app.todoCount = app.todos.length;
      app.isEmpty = app.todos.length === 0;
    };
  </script>
</body>
</html>
```

### Dashboard with Real-time Updates
```html
<!DOCTYPE html>
<html>
<body>
  <div id="dashboard">
    <div class="stats">
      <div class="stat-card">
        <h3>Users</h3>
        <div class="value users-count">0</div>
      </div>
      <div class="stat-card">
        <h3>Revenue</h3>
        <div class="value revenue">$0</div>
      </div>
    </div>
    
    <div class="controls">
      <button onclick="updateStats()">Refresh</button>
      <input d-model="refreshInterval" type="number" placeholder="Interval (ms)">
    </div>
  </div>

  <script src="miroir.js"></script>
  <script>
    // Currency formatting extension
    miroir.extend('m-currency', (el, prop, state) => {
      const value = state[prop] || 0;
      el.textContent = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    });

    // Dashboard state
    const dashboard = miroir.create({
      users: 1250,
      revenue: 25000,
      refreshInterval: 5000
    }, {
      bindings: [
        { '.users-count': 'users' },
        { '.revenue': 'revenue' }
      ]
    });

    // Auto-refresh
    let refreshTimer;
    miroir.watch('refreshInterval', (interval) => {
      clearInterval(refreshTimer);
      if (interval > 0) {
        refreshTimer = setInterval(updateStats, interval);
      }
    });

    function updateStats() {
      dashboard.users += Math.floor(Math.random() * 10);
      dashboard.revenue += Math.floor(Math.random() * 1000);
    }
  </script>
</body>
</html>
```

## Performance Features

1. **Dirty Checking**: Skips updates when value unchanged
2. **Batch Updates**: Uses requestAnimationFrame for 60fps
3. **WeakMap Caching**: Prevents memory leaks
4. **Smart DOM Updates**: textContent vs innerHTML optimization
5. **Pre-compiled Regex**: Template parsing optimization

## Memory Management

```javascript
// Always cleanup when done
const app = miroir.create(state, options);

// Later...
app.destroy(); // Removes listeners, clears maps
```

## When to Use Miroir.js

### ✅ Perfect for:
- Simple reactive UIs
- Prototypes and demos  
- Adding reactivity to existing HTML
- Lightweight widgets
- Learning reactive programming

### ❌ Consider alternatives for:
- Complex SPAs with routing
- Component-based architectures
- Large teams needing tooling
- Heavy computational state

## Integration Patterns

### With existing HTML
```javascript
// Enhance existing page
const pageState = miroir.create({
  userName: getCurrentUser(),
  notifications: 0
}, {
  bindings: [
    { '.user-name': 'userName' },
    { '.notification-count': 'notifications' }
  ]
});
```

### With build tools
```javascript
// ES modules
import { miroir } from './miroir.js';

// CommonJS  
const { miroir } = require('./miroir.js');
```

### With TypeScript
```typescript
interface AppState {
  count: number;
  name: string;
}

const app = miroir.create<AppState>({
  count: 0,
  name: 'Test'
});
```

## Debugging Tips

```javascript
// Watch all changes
const originalCreate = miroir.create;
miroir.create = function(state, options) {
  const proxy = originalCreate(state, options);
  
  // Log all changes
  Object.keys(state).forEach(key => {
    miroir.watch(key, (newVal, oldVal) => {
      console.log(`${key}: ${oldVal} → ${newVal}`);
    });
  });
  
  return proxy;
};
```

## Error Handling

```javascript
// Wrap in try-catch for safety
try {
  const app = miroir.create(state, {
    bindings: [
      { '.invalid-selector': 'prop' } // May throw if selector invalid
    ]
  });
} catch (error) {
  console.error('Miroir initialization failed:', error);
}
```

## Best Practices for AI/LLM

1. **Use JavaScript bindings** for programmatic control
2. **Keep state flat** - avoid deep nesting
3. **Create extensions** for repeated patterns
4. **Use watchers** for side effects
5. **Clean up** with destroy() method
6. **Validate selectors** before binding
7. **Handle edge cases** in extensions

## Code Generation Guidelines

When generating code with Miroir.js:

```javascript
// Template for basic reactive component
const component = miroir.create({
  // State properties
  ${stateProperties}
}, {
  bindings: [
    // CSS selector bindings
    ${bindings}
  ]
});

// Watchers for side effects
${watchers.map(w => `miroir.watch('${w.prop}', ${w.callback});`)}

// Extensions for custom behavior  
${extensions.map(e => `miroir.extend('${e.name}', ${e.handler});`)}
```

## File Size & Performance

- **miroir.js**: ~6KB uncompressed, ~2KB gzipped
- **extensions.js**: ~8KB with 25+ common extensions
- **Zero dependencies**
- **60fps performance** with requestAnimationFrame batching
- **Memory efficient** with WeakMap usage

---

**This guide provides everything an AI/LLM needs to understand and generate effective Miroir.js code.**