# 🪞 Miroir.js

**Ultra-lightweight reactive data binding library (~2KB gzipped)**

[![Size](https://img.shields.io/badge/size-2KB-brightgreen.svg)](.) 
[![Performance](https://img.shields.io/badge/performance-60fps-blue.svg)](.)
[![License](https://img.shields.io/badge/license-MIT-orange.svg)](LICENSE)

Simple, fast, and extensible reactive data binding with **zero dependencies**. Choose your style: HTML templates `{{}}` or JavaScript bindings.

## ✨ Why Choose Miroir.js?

- **🚀 Blazing Fast**: 60fps with requestAnimationFrame + dirty checking
- **🪶 Ultra Light**: Just 2KB gzipped, zero dependencies  
- **🎯 Simple**: 3 functions API - learn in minutes
- **🔧 Flexible**: HTML templates OR JavaScript bindings (or both!)
- **🔌 Extensible**: 25+ extensions available + create your own
- **💾 Memory Safe**: WeakMap usage prevents leaks

## 📦 Installation

```bash
# CDN
<script src="https://cdn.jsdelivr.net/npm/miroir@latest/miroir.min.js"></script>

# NPM
npm install miroir

# Download
wget https://github.com/your-repo/miroir/raw/main/miroir.js
```

## 🚀 Quick Start

### Option 1: HTML Templates
```html
<div class="bind">
  <h1>Hello {{ name }}!</h1>
  <p>Count: {{ count }}</p>
</div>
<input d-model="name" placeholder="Your name">
<button onclick="app.count++">+1</button>

<script>
const app = miroir.create({
  name: 'John',
  count: 0
});
</script>
```

### Option 2: JavaScript Bindings  
```html
<div class="title"></div>
<div id="counter"></div>
<input id="name-input">

<script>
const app = miroir.create({ 
  name: 'John', 
  count: 0 
}, {
  bindings: [
    { '.title': 'name' },        // class → property
    { '#counter': 'count' },     // ID → property  
    { '#name-input': 'name' }    // input ↔ property
  ]
});
</script>
```

**That's it!** Changes to `app.name` or `app.count` automatically update the DOM.

## 📖 Simple API (3 functions)

```javascript
// 1. Create reactive state
const app = miroir.create(state, options)

// 2. Watch changes  
miroir.watch('property', (newVal, oldVal) => {})

// 3. Add custom directives
miroir.extend('m-show', (el, expr, state) => {})
```

**Configuration Options:**
```javascript
miroir.create(state, {
  root: document.getElementById('app'),  // Root element
  bindings: [{ '.class': 'property' }]   // JS bindings
  // bindSelector: '.bind',              // HTML template selector  
  // modelAttribute: 'd-model'           // Input binding attribute
})
```

## 🎯 JavaScript Bindings

The `bindings` array accepts objects mapping CSS selectors to state properties:

```javascript
const app = miroir.create(state, {
  bindings: [
    // Element types
    { '.class-name': 'property' },    // Class selector
    { '#element-id': 'property' },    // ID selector  
    { 'tag-name': 'property' },       // Tag selector
    { '[attribute]': 'property' },    // Attribute selector
    
    // Complex selectors
    { '.parent .child': 'property' },
    { 'input[type="email"]': 'property' }
  ]
});
```

**Automatic behavior:**
- **Input elements** (`input`, `textarea`, `select`) → **Bidirectional binding**
- **Other elements** → **Unidirectional binding** (updates text content)

## 🔌 Extensions System - The Real Power!

Miroir.js becomes truly powerful with **extensions** - custom directives that handle common patterns:

### Built-in Extension Collection (25+ extensions)

```javascript
// Load the extensions library
<script src="extensions.js"></script>

// Now you have 25+ ready-to-use extensions:
```

#### Conditionals
```html
<div m-show="isVisible">Show when true</div>
<div m-hide="isHidden">Hide when true</div> 
<div m-class="active:isSelected">Toggle CSS class</div>
```

#### Lists & Arrays
```html
<span m-count="todos">0</span> tasks
<div m-each="item in items" data-template="<li>{{item}}</li>"></div>
<div m-empty="todos">No items yet!</div>
```

#### Forms & Validation
```html
<input d-model="email" m-validate="required|email">
<form m-submit="handleSubmit">...</form>
<button m-reset="email,password">Reset</button>
```

#### UI & Formatting
```html
<span m-format="currency:price">$0.00</span>
<span m-format="date:createdAt">Today</span>
<div m-progress="completion" style="width: 0%"></div>
```

#### Advanced Features
```html
<div m-lazy="loadContent">Loads when visible</div>
<div m-outside="dropdownOpen">Click outside to close</div>
<div m-storage="myApp">Auto-saves to localStorage</div>
```

### Create Your Own Extensions

```javascript
// Custom show/hide directive
miroir.extend('m-show', (el, prop, state) => {
  el.style.display = state[prop] ? 'block' : 'none';
});

// Custom click handler
miroir.extend('m-click', (el, handler, state) => {
  el.addEventListener('click', () => window[handler](state));
});

// Usage
<div m-show="isVisible">Content</div>
<button m-click="handleClick">Click me</button>
```

### Complete Todo App with Extensions
```html
<div class="todo-app">
  <h1>Tasks (<span m-count="todos">0</span>)</h1>
  
  <form m-submit="addTodo">
    <input d-model="newTodo" m-validate="required" placeholder="New task...">
    <button type="submit">Add</button>
  </form>
  
  <div m-each="todo in todos" data-template='
    <div class="todo-item" m-class="completed:todo.done">
      <span>{{item.text}}</span>
      <button m-click="deleteTodo">×</button>
    </div>
  '></div>
  
  <div m-empty="todos">No tasks yet! Add one above.</div>
  <div m-storage="todo-app"></div> <!-- Auto-save -->
</div>

<script>
const app = miroir.create({
  newTodo: '',
  todos: []
});

window.addTodo = (state) => {
  if (state.newTodo.trim()) {
    state.todos.push({ text: state.newTodo.trim(), done: false });
    state.newTodo = '';
  }
};
</script>
```

**See [extensions.md](extensions.md) for complete documentation and [cookbook.html](cookbook.html) for interactive examples.**

## ⚡ Performance Features

- **Dirty Checking**: Skips updates when values don't change
- **60fps Batching**: Uses `requestAnimationFrame` for smooth updates
- **WeakMap Caching**: Prevents memory leaks, caches element properties
- **Regex Pre-compilation**: Templates parsed once, not per update
- **Smart DOM Updates**: Uses `textContent` vs `innerHTML` intelligently

## 📊 Performance Comparison

| Library | Size | Performance | Use Case |
|---------|------|-------------|----------|
| **Miroir.js** | **2KB** | **60fps** | Simple reactivity, widgets, prototypes |
| Alpine.js | 15KB | Good | Small-medium apps, Progressive enhancement |
| Vue.js | 34KB | Good | Medium-large SPAs, Component-based |
| React | 42KB | Good | Large SPAs, Complex state management |

## 🚀 Get Started

### 1. **Simple Prototype** → Use HTML templates
### 2. **More Control** → Use JavaScript bindings  
### 3. **Complex Logic** → Add extensions
### 4. **Production** → Load extensions.js for full power

## 📚 Documentation

- **[extensions.md](extensions.md)** - Complete extensions guide (25+ directives)
- **[cookbook.html](cookbook.html)** - Interactive examples and demos
- **[demo.html](demo.html)** - Performance showcase
- **[MIROIR_FOR_LLM.md](MIROIR_FOR_LLM.md)** - AI/LLM integration guide

## 🤝 Contributing

```bash
git clone https://github.com/your-repo/miroir
cd miroir
# Test with demo.html and cookbook.html
# Add extensions to extensions.js
# Submit PR
```

## 📄 License

MIT © Miroir.js Team

---

**🪞 "Simple reactivity, infinite possibilities with extensions"** ✨