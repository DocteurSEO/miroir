# 🎨 Miroir.js Design System

**Official design system with glassmorphism effects and GitHub-inspired elements**

## 🎯 Philosophy

- **Miroir** = Reflet en français → Design reflects modern glassmorphism
- **Sobre & Élégant** → Black, white, grays with subtle colors
- **GitHub Heritage** → Blue (#0969da) as primary, familiar button styles
- **Performance First** → CSS optimized for smooth 60fps animations

## 📁 File Structure

```
styles/
├── miroir.css         # Core design system (variables, components, utilities)
├── components.css     # Pre-built UI components (todo, dashboard, forms)
└── README.md         # This documentation
```

## 🎨 Color Palette

### GitHub Colors (Primary)
```css
--github-blue: #0969da     /* Primary actions */
--github-green: #1a7f37    /* Success states */
--github-red: #d1242f      /* Danger/errors */
--github-orange: #fb8500   /* Warnings */
--github-purple: #8250df   /* Accents */
```

### Neutral Palette (Sober)
```css
--black: #000000           /* Pure black */
--dark-gray: #161b22       /* Dark backgrounds */
--medium-gray: #21262d     /* Cards, containers */
--light-gray: #30363d      /* Hover states */
--text-gray: #7d8590       /* Secondary text */
--white: #ffffff           /* Primary text */
```

### Glassmorphism Variables
```css
--glass-bg: rgba(255, 255, 255, 0.1)     /* Light glass */
--glass-border: rgba(255, 255, 255, 0.2) /* Glass borders */
--dark-glass-bg: rgba(0, 0, 0, 0.3)      /* Dark glass */
--glass-blur: 20px                        /* Blur amount */
```

## 🔧 Core Components

### Buttons - GitHub Style
```html
<!-- Primary (GitHub blue) -->
<button class="btn btn-primary">Save Changes</button>

<!-- Success (GitHub green) -->
<button class="btn btn-success">Create</button>

<!-- Danger (GitHub red) -->
<button class="btn btn-danger">Delete</button>

<!-- Secondary (Glass effect) -->
<button class="btn btn-secondary">Cancel</button>

<!-- Ghost (Minimal) -->
<button class="btn btn-ghost">Close</button>
```

### Glass Effects
```html
<!-- Basic glass container -->
<div class="glass">Content with light glass effect</div>

<!-- Dark glass (preferred for dark backgrounds) -->
<div class="glass-dark">Content with dark glass effect</div>

<!-- Card with glass effect -->
<div class="card card-dark">Card content</div>
```

### Form Elements
```html
<!-- Input with glass styling -->
<input class="input" placeholder="Enter text...">

<!-- With validation states -->
<input class="input error" placeholder="Invalid input">
<input class="input success" placeholder="Valid input">
```

## ✨ Special Effects

### Mirror Effects
```html
<!-- Shine reflection on hover -->
<div class="mirror-effect">
  Content with mirror reflection
</div>

<!-- Rotating shine effect -->
<div class="mirror-shine">
  Content with rotating shine
</div>
```

### Animations
```html
<!-- Fade in animation -->
<div class="fade-in">Animated content</div>

<!-- Slide in from left -->
<div class="slide-in">Sliding content</div>

<!-- Continuous pulse -->
<div class="pulse">Pulsing element</div>

<!-- Floating animation -->
<div class="float">Floating element</div>
```

## 🏗️ Layout Components

### Dashboard Grid
```html
<div class="dashboard-grid">
  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-title">Performance</div>
      <div class="stat-icon">⚡</div>
    </div>
    <div class="stat-value">98%</div>
    <div class="stat-change positive">+5% this week</div>
  </div>
</div>
```

### Todo App
```html
<div class="todo-app">
  <div class="todo-header">
    <h1 class="todo-title">My Tasks</h1>
    <div class="todo-counter">3 remaining</div>
  </div>
  
  <form class="todo-form">
    <input class="todo-input input" placeholder="Add new task...">
    <button class="btn btn-primary">Add</button>
  </form>
  
  <div class="todo-list">
    <div class="todo-item">
      <input type="checkbox" class="todo-checkbox">
      <span class="todo-text">Example task</span>
      <button class="todo-delete">×</button>
    </div>
  </div>
</div>
```

### Progress Bars
```html
<!-- Basic progress -->
<div class="progress">
  <div class="progress-bar" style="width: 75%"></div>
</div>

<!-- With shimmer effect (automatic) -->
<div class="progress">
  <div class="progress-bar" style="width: 45%">45%</div>
</div>
```

### Notifications
```html
<!-- Auto-positioned notification -->
<div class="notification show">
  <span>Action completed successfully!</span>
</div>

<!-- With variants -->
<div class="notification success show">Success message</div>
<div class="notification error show">Error message</div>
```

## 🎛️ Utility Classes

### Colors
```html
<div class="text-white">White text</div>
<div class="text-blue">Blue text (GitHub blue)</div>
<div class="text-green">Green text</div>
<div class="text-red">Red text</div>
<div class="text-gray">Gray text</div>
```

### Backgrounds
```html
<div class="bg-glass">Light glass background</div>
<div class="bg-dark-glass">Dark glass background</div>
<div class="bg-black">Pure black background</div>
```

### Spacing
```html
<div class="m-4">Margin 1rem</div>
<div class="p-3">Padding 0.75rem</div>
<div class="mb-2">Margin bottom 0.5rem</div>
```

### Borders & Shadows
```html
<div class="rounded">6px border radius</div>
<div class="rounded-lg">12px border radius</div>
<div class="shadow-glass">Glass shadow effect</div>
<div class="border-glass">Glass border</div>
```

### Display & Layout
```html
<div class="text-center">Centered text</div>
<div class="hidden">Hidden element</div>
<div class="visible">Visible element</div>
```

## 📱 Responsive Design

The system is mobile-first with automatic responsive behavior:

- **Container**: Auto-adjusts padding on mobile
- **Buttons**: Full-width on mobile
- **Cards**: Single column on mobile  
- **Notifications**: Full-width positioning on mobile

## 🎨 Customization

### CSS Custom Properties
All colors and effects use CSS custom properties, making it easy to customize:

```css
:root {
  --github-blue: #your-color;    /* Change primary color */
  --glass-blur: 15px;            /* Adjust blur amount */
  --transition-smooth: all 0.2s; /* Faster animations */
}
```

### Dark Mode Support
Automatic dark mode support via `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  body {
    background: var(--dark-gray);
    color: var(--white);
  }
}
```

## 🚀 Performance

- **Optimized CSS**: Only includes what you need
- **Hardware acceleration**: Uses `transform` and `opacity` for animations
- **Minimal repaints**: Careful use of `backdrop-filter`
- **60fps**: All animations target 60fps performance

## 📖 Usage Examples

### Complete Dashboard
```html
<div class="container">
  <div class="dashboard-grid">
    <div class="stat-card fade-in">
      <div class="stat-header">
        <div class="stat-title">Total Users</div>
        <div class="stat-icon">👥</div>
      </div>
      <div class="stat-value">1,234</div>
      <div class="stat-change positive">+12% this month</div>
    </div>
  </div>
</div>
```

### Glassmorphism Form
```html
<div class="card card-dark">
  <form>
    <div class="form-group">
      <label class="form-label">Email</label>
      <input class="input" type="email" placeholder="your@email.com">
    </div>
    
    <div class="form-group">
      <label class="form-label">Password</label>
      <input class="input" type="password" placeholder="••••••••">
    </div>
    
    <button class="btn btn-primary">Sign In</button>
  </form>
</div>
```

## 🎯 Best Practices

1. **Use GitHub colors sparingly** - Primary blue for main actions only
2. **Prefer dark glass** - Better contrast on dark backgrounds  
3. **Layer effects carefully** - Don't over-blur or over-shadow
4. **Test performance** - Glassmorphism can be expensive on older devices
5. **Maintain hierarchy** - Use color and size to guide attention

---

**🪞 The design reflects the simplicity and power of Miroir.js itself**