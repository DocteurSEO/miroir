# 🪞 Miroir.js

[![Version](https://img.shields.io/badge/version-2.1.0-green.svg)](https://github.com/miroir-js/miroir)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Size](https://img.shields.io/badge/size-3.8%20KB%20gzipped-orange.svg)](https://bundlephobia.com/package/miroir)
[![Performance](https://img.shields.io/badge/performance-60%20FPS-brightgreen.svg)](https://github.com/miroir-js/miroir)

**Ultra-lightweight reactive data binding library with zero dependencies**

Miroir.js provides simple, powerful, and fast two-way data binding for modern web applications. At just ~3.8 KB gzipped, it delivers enterprise-grade reactivity without the bloat.

## ✨ Features

- 🚀 **Ultra-lightweight**: ~3.8 KB gzipped, zero dependencies
- ⚡ **60 FPS Performance**: Optimized batch updates with requestAnimationFrame
- 🔄 **Reactive Data Binding**: Automatic DOM updates when data changes
- 🎯 **Two Binding Modes**: HTML templates `{{ variable }}` or JavaScript bindings
- 🔌 **Extensible**: 25+ ready-to-use extensions for common patterns
- 🪶 **Memory Efficient**: WeakMap-based caching prevents memory leaks
- 🛡️ **Type Safe**: Built with modern JavaScript, works everywhere
- 📱 **Mobile Optimized**: Touch-friendly with minimal overhead

## 🚀 Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <script src="./miroir.js"></script>
</head>
<body>
    <div class="bind">Hello {{ name }}!</div>
    <input d-model="name" placeholder="Enter your name">
    
    <script>
        const app = miroir.create({
            name: 'World'
        });
    </script>
</body>
</html>
```

### JavaScript Bindings

```javascript
const app = miroir.create({
    count: 0,
    message: 'Hello'
}, {
    bindings: [
        { '.counter': 'count' },
        { '#message': 'message' }
    ]
});

// Watch for changes
miroir.watch('count', (newVal, oldVal) => {
    console.log(`Count changed from ${oldVal} to ${newVal}`);
});
```

## 📖 API Reference

### `miroir.create(state, options)`

Creates a reactive proxy object with automatic DOM binding.

**Parameters:**
- `state` (Object): Initial state object
- `options` (Object): Configuration options
  - `root` (Element): Root element for DOM queries (default: document.body)
  - `bindSelector` (String): CSS selector for template elements (default: '.bind')
  - `modelAttribute` (String): Attribute for two-way binding (default: 'd-model')
  - `bindings` (Array): JavaScript binding configurations

**Returns:** Reactive proxy with `destroy()` method

### `miroir.watch(property, callback)`

Watches a property for changes and calls callback when it changes.

**Parameters:**
- `property` (String): Property name to watch
- `callback` (Function): Function called with (newValue, oldValue)

### `miroir.extend(name, handler)`

Registers a custom extension/directive.

**Parameters:**
- `name` (String): Extension attribute name (e.g., 'm-show')
- `handler` (Function): Handler function called with (element, expression, state)

## 🔌 Extensions

Miroir.js includes 25+ powerful extensions for common use cases:

### Conditional Rendering
```html
<div m-show="isVisible">Shown when true</div>
<div m-hide="isLoading">Hidden when loading</div>
<div m-if="hasPermission">Conditional content</div>
<div m-class="active:isSelected">Toggle classes</div>
```

### Lists & Arrays
```html
<span m-count="items">0</span>
<div m-each="item in items" data-template="<div>{{item}}</div>"></div>
<div m-filter="products|searchTerm"></div>
<div m-empty="todos">No tasks</div>
```

### Forms & Validation
```html
<input d-model="email" m-validate="required|email">
<div class="error-message"></div>
<form m-submit="handleSubmit">...</form>
<button m-reset="email,password">Reset</button>
```

### Advanced Features
```html
<!-- Deep object binding -->
<input d-deep-model="user.profile.name">
<div deep-watch="user">{{ user.profile.name }}</div>

<!-- LocalStorage persistence -->
<div m-storage="my-app-state"></div>

<!-- Performance optimized -->
<div m-debounce="300:searchTerm">{{ searchTerm }}</div>
<div m-lazy="shouldLoad">Lazy loaded content</div>
```

## 📋 Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <script src="./miroir.js"></script>
    <script src="./extensions.js"></script>
</head>
<body>
    <!-- User Profile with Deep Binding -->
    <input d-deep-model="user.profile.name" placeholder="Name">
    <input d-deep-model="user.profile.age" type="number" placeholder="Age">
    
    <!-- Reactive Display -->
    <div deep-watch="user">
        Hello {{ user.profile.name }}, age {{ user.profile.age }}!
    </div>
    
    <!-- Todo List with Validation -->
    <input d-model="newTodo" m-validate="required|min:3" placeholder="New task">
    <div class="error-message"></div>
    <button onclick="addTodo()">Add Task</button>
    
    <!-- Conditional Rendering -->
    <div m-count="todos">0</div> tasks
    <div m-show="todos.length > 0">
        <div m-each="todo in todos" data-template="<div>{{todo.text}}</div>"></div>
    </div>
    <div m-empty="todos">No tasks yet!</div>
    
    <!-- Auto-persistence -->
    <div m-storage="todo-app"></div>
    
    <script>
        const app = miroir.create({
            user: {
                profile: { name: '', age: '' }
            },
            todos: [],
            newTodo: ''
        });
        
        function addTodo() {
            if (app.newTodo.trim()) {
                app.todos.push({
                    id: Date.now(),
                    text: app.newTodo.trim(),
                    completed: false
                });
                app.newTodo = '';
            }
        }
        
        // Watch for changes
        miroir.watch('user', (newUser) => {
            console.log('User updated:', newUser);
        });
    </script>
</body>
</html>
```

## 🎯 Demos

- **[Basic Demo](demo.html)**: Core features and performance showcase
- **[Extensions Demo](demo-extensions.html)**: Advanced features with code examples
- **[Interactive Tutorial](cookbook.html)**: Step-by-step learning guide

## ⚡ Performance

Miroir.js is optimized for real-world performance:

- **Batch Updates**: Uses requestAnimationFrame for 60 FPS rendering
- **Smart Caching**: WeakMap-based element and DOM query caching
- **Dirty Checking**: Only updates when values actually change
- **Memory Efficient**: Automatic cleanup prevents memory leaks
- **Minimal Overhead**: ~3.8 KB gzipped, zero dependencies

### Benchmark Results
```
10,000 Updates: ~15ms (667 updates/ms)
Memory Usage: <5MB for typical applications
Bundle Size: 3.8 KB gzipped, 12 KB minified
```

## 🔧 Advanced Usage

### Custom Extensions

```javascript
// Create a custom tooltip extension
miroir.extend('m-tooltip', (el, text, state) => {
    el.addEventListener('mouseenter', () => {
        showTooltip(el, text);
    });
    el.addEventListener('mouseleave', () => {
        hideTooltip();
    });
});

// Use in HTML
// <button m-tooltip="Click to save">Save</button>
```

### Performance Monitoring

```javascript
const app = miroir.create(state);

// Monitor update frequency
let updateCount = 0;
miroir.watch('myProperty', () => updateCount++);
setInterval(() => {
    console.log(`${updateCount} updates/sec`);
    updateCount = 0;
}, 1000);
```

### Memory Management

```javascript
const app = miroir.create(state);

// Clean up when done
app.destroy(); // Removes all event listeners and clears caches
```

## 🛠️ Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📦 Installation

### CDN
```html
<script src="https://unpkg.com/miroir@latest/miroir.js"></script>
<script src="https://unpkg.com/miroir@latest/extensions.js"></script>
```

### NPM
```bash
npm install miroir
```

### Download
Download the latest version from [GitHub Releases](https://github.com/miroir-js/miroir/releases)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by modern reactive frameworks
- Built for performance and simplicity
- Community-driven development

---

**Made with ❤️ by the Miroir.js community**

[📚 Documentation](https://miroir.dev) • [🐛 Report Bug](https://github.com/miroir-js/miroir/issues) • [💡 Request Feature](https://github.com/miroir-js/miroir/issues) • [💬 Community](https://discord.gg/miroir)