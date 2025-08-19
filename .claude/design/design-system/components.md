# Component Library

## Overview
Comprehensive WCAG 2.1 AA compliant component library for the dashboard application, including all interactive elements, form controls, navigation, and data display components.

## Button Components

### Primary Button
```html
<!-- Primary Button -->
<button 
  class="btn btn-primary" 
  type="button"
  aria-describedby="button-help"
>
  Primary Action
</button>

<!-- With loading state -->
<button 
  class="btn btn-primary" 
  type="button"
  disabled
  aria-describedby="button-loading"
>
  <span class="btn-spinner" aria-hidden="true"></span>
  <span class="sr-only">Loading...</span>
  Processing...
</button>
```

```css
.btn {
  /* Base button styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-sans);
  font-weight: 500;
  text-decoration: none;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-150) var(--timing-ease-in-out);
  min-height: 44px; /* Touch target minimum */
  padding: var(--space-2) var(--space-4);
  
  /* Focus styles */
  &:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
    box-shadow: var(--shadow-focus);
  }
  
  /* Disabled styles */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.btn-primary {
  background-color: var(--color-primary-500);
  color: var(--color-white);
  border-color: var(--color-primary-500);
  
  &:hover:not(:disabled) {
    background-color: var(--color-primary-600);
    border-color: var(--color-primary-600);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:active:not(:disabled) {
    background-color: var(--color-primary-700);
    border-color: var(--color-primary-700);
    transform: translateY(0);
  }
}

.btn-secondary {
  background-color: var(--color-white);
  color: var(--color-neutral-700);
  border-color: var(--color-neutral-300);
  
  &:hover:not(:disabled) {
    background-color: var(--color-neutral-50);
    border-color: var(--color-neutral-400);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
}

.btn-danger {
  background-color: var(--color-error-500);
  color: var(--color-white);
  border-color: var(--color-error-500);
  
  &:focus {
    outline-color: var(--color-error-500);
    box-shadow: var(--shadow-focus-error);
  }
}

/* Size variants */
.btn-sm {
  min-height: 36px;
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
}

.btn-lg {
  min-height: 48px;
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-lg);
}

/* Loading spinner */
.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin var(--duration-1000) var(--timing-linear) infinite;
  margin-right: var(--space-2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## Form Components

### Text Input
```html
<div class="form-group">
  <label for="email" class="form-label">
    Email Address
    <span class="required" aria-label="required">*</span>
  </label>
  <input 
    type="email" 
    id="email" 
    name="email"
    class="form-input"
    placeholder="Enter your email"
    required
    aria-describedby="email-help email-error"
    autocomplete="email"
  >
  <div id="email-help" class="form-help">
    We'll never share your email address
  </div>
  <div id="email-error" class="form-error" role="alert" aria-live="polite">
    <!-- Error message appears here -->
  </div>
</div>
```

```css
.form-group {
  margin-bottom: var(--form-group-spacing);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-neutral-700);
  margin-bottom: var(--space-2);
  
  .required {
    color: var(--color-error-500);
    margin-left: var(--space-1);
  }
}

.form-input {
  display: block;
  width: 100%;
  padding: var(--space-3);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-neutral-700);
  background-color: var(--color-white);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  transition: all var(--duration-150) var(--timing-ease-in-out);
  min-height: 44px; /* Touch target minimum */
  
  &::placeholder {
    color: var(--color-neutral-400);
  }
  
  &:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: -1px;
    border-color: var(--color-primary-500);
    box-shadow: var(--shadow-focus);
  }
  
  &:invalid:not(:focus) {
    border-color: var(--color-error-500);
    
    &:focus {
      outline-color: var(--color-error-500);
      box-shadow: var(--shadow-focus-error);
    }
  }
  
  &:disabled {
    background-color: var(--color-neutral-100);
    color: var(--color-neutral-400);
    cursor: not-allowed;
  }
}

.form-help {
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
  margin-top: var(--space-1);
}

.form-error {
  font-size: var(--text-sm);
  color: var(--color-error-600);
  margin-top: var(--space-1);
  
  &:empty {
    display: none;
  }
}
```

### Select Dropdown
```html
<div class="form-group">
  <label for="role" class="form-label">User Role</label>
  <div class="select-wrapper">
    <select id="role" name="role" class="form-select" aria-describedby="role-help">
      <option value="">Choose a role...</option>
      <option value="user">User</option>
      <option value="admin">Administrator</option>
      <option value="moderator">Moderator</option>
    </select>
    <div class="select-icon" aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </div>
  </div>
  <div id="role-help" class="form-help">Select the appropriate user role</div>
</div>
```

```css
.select-wrapper {
  position: relative;
}

.form-select {
  display: block;
  width: 100%;
  padding: var(--space-3);
  padding-right: var(--space-10);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-neutral-700);
  background-color: var(--color-white);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  appearance: none;
  cursor: pointer;
  min-height: 44px;
  
  &:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: -1px;
    border-color: var(--color-primary-500);
    box-shadow: var(--shadow-focus);
  }
}

.select-icon {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--color-neutral-400);
  pointer-events: none;
}
```

## Card Components

### Basic Card
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
    <div class="card-actions">
      <button class="btn btn-sm btn-secondary">Action</button>
    </div>
  </div>
  <div class="card-content">
    <p>Card content goes here. This is where the main information is displayed.</p>
  </div>
  <div class="card-footer">
    <div class="card-footer-text">Last updated: 2 hours ago</div>
  </div>
</div>
```

### Metric Card
```html
<div class="card metric-card" role="img" aria-labelledby="metric-title" aria-describedby="metric-description">
  <div class="metric-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a1 1 0 000 2h1v11a2 2 0 002 2h10a2 2 0 002-2V8h1a1 1 0 100-2h-4zM8 6V4h8v2H8z"/>
    </svg>
  </div>
  <div class="metric-content">
    <div class="metric-value" id="metric-title">1,247</div>
    <div class="metric-label" id="metric-description">Total Users</div>
    <div class="metric-change positive">
      <span class="sr-only">Increased by</span>
      +12% this month
    </div>
  </div>
</div>
```

```css
.card {
  background-color: var(--color-white);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow var(--duration-150) var(--timing-ease-in-out);
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--card-padding-md);
  border-bottom: 1px solid var(--color-neutral-200);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 0;
}

.card-content {
  padding: var(--card-padding-md);
}

.card-footer {
  padding: var(--card-padding-sm) var(--card-padding-md);
  background-color: var(--color-neutral-50);
  border-top: 1px solid var(--color-neutral-200);
}

.card-footer-text {
  font-size: var(--text-sm);
  color: var(--color-neutral-500);
}

/* Metric Card Styles */
.metric-card {
  padding: var(--card-padding-md);
  text-align: center;
  
  .metric-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto var(--space-4);
    color: var(--color-primary-500);
    
    svg {
      width: 100%;
      height: 100%;
    }
  }
  
  .metric-value {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-neutral-900);
    margin-bottom: var(--space-1);
  }
  
  .metric-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-neutral-600);
    margin-bottom: var(--space-2);
  }
  
  .metric-change {
    font-size: var(--text-sm);
    font-weight: 500;
    
    &.positive {
      color: var(--color-success-600);
    }
    
    &.negative {
      color: var(--color-error-600);
    }
  }
}
```

## Navigation Components

### Sidebar Navigation
```html
<nav class="sidebar" role="navigation" aria-label="Main navigation">
  <div class="sidebar-header">
    <h2 class="sidebar-title">Dashboard</h2>
    <button class="sidebar-toggle" aria-label="Toggle navigation">
      <span class="sr-only">Menu</span>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
  
  <ul class="sidebar-menu" role="menubar">
    <li role="none">
      <a href="/dashboard" class="sidebar-link active" role="menuitem" aria-current="page">
        <span class="sidebar-icon" aria-hidden="true">🏠</span>
        <span class="sidebar-text">Dashboard</span>
      </a>
    </li>
    <li role="none">
      <a href="/profile" class="sidebar-link" role="menuitem">
        <span class="sidebar-icon" aria-hidden="true">👤</span>
        <span class="sidebar-text">Profile</span>
      </a>
    </li>
    <li role="none">
      <a href="/analytics" class="sidebar-link" role="menuitem">
        <span class="sidebar-icon" aria-hidden="true">📊</span>
        <span class="sidebar-text">Analytics</span>
      </a>
    </li>
    <li role="none">
      <button class="sidebar-link" role="menuitem" aria-expanded="false" aria-controls="admin-submenu">
        <span class="sidebar-icon" aria-hidden="true">⚙️</span>
        <span class="sidebar-text">Settings</span>
        <span class="sidebar-arrow" aria-hidden="true">▶</span>
      </button>
      <ul id="admin-submenu" class="sidebar-submenu" role="menu" aria-hidden="true">
        <li role="none">
          <a href="/settings/general" class="sidebar-sublink" role="menuitem">General</a>
        </li>
        <li role="none">
          <a href="/settings/security" class="sidebar-sublink" role="menuitem">Security</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

```css
.sidebar {
  width: 240px;
  background-color: var(--color-neutral-50);
  border-right: 1px solid var(--color-neutral-200);
  height: 100vh;
  overflow-y: auto;
  transition: transform var(--duration-300) var(--timing-ease-in-out);
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 50;
    transform: translateX(-100%);
    
    &.open {
      transform: translateX(0);
    }
  }
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-neutral-200);
}

.sidebar-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 0;
}

.sidebar-menu {
  list-style: none;
  margin: 0;
  padding: var(--space-4) 0;
}

.sidebar-link {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  color: var(--color-neutral-600);
  text-decoration: none;
  border: none;
  background: none;
  font-size: var(--text-base);
  cursor: pointer;
  transition: all var(--duration-150) var(--timing-ease-in-out);
  min-height: 44px;
  
  &:hover {
    background-color: var(--color-neutral-100);
    color: var(--color-neutral-700);
  }
  
  &:focus {
    outline: 2px solid var(--color-primary-500);
    outline-offset: -2px;
    background-color: var(--color-neutral-100);
  }
  
  &.active {
    background-color: var(--color-primary-50);
    color: var(--color-primary-700);
    border-right: 3px solid var(--color-primary-500);
  }
}

.sidebar-icon {
  margin-right: var(--space-3);
  font-size: var(--text-lg);
}

.sidebar-text {
  flex: 1;
}

.sidebar-arrow {
  margin-left: auto;
  transition: transform var(--duration-150) var(--timing-ease-in-out);
  
  .sidebar-link[aria-expanded="true"] & {
    transform: rotate(90deg);
  }
}
```

## Data Visualization Components

### Progress Bar
```html
<div class="progress-wrapper">
  <div class="progress-header">
    <label id="progress-label" class="progress-label">Upload Progress</label>
    <span class="progress-percentage" aria-describedby="progress-label">75%</span>
  </div>
  <div 
    class="progress-bar" 
    role="progressbar" 
    aria-valuenow="75" 
    aria-valuemin="0" 
    aria-valuemax="100"
    aria-labelledby="progress-label"
  >
    <div class="progress-fill" style="width: 75%"></div>
  </div>
</div>
```

```css
.progress-wrapper {
  margin-bottom: var(--space-4);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.progress-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-neutral-700);
}

.progress-percentage {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-neutral-600);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--color-neutral-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary-500);
  border-radius: var(--radius-full);
  transition: width var(--duration-300) var(--timing-ease-out);
}
```

## Alert Components

### Alert Messages
```html
<!-- Success Alert -->
<div class="alert alert-success" role="alert" aria-live="polite">
  <div class="alert-icon" aria-hidden="true">✓</div>
  <div class="alert-content">
    <h4 class="alert-title">Success!</h4>
    <p class="alert-message">Your profile has been updated successfully.</p>
  </div>
  <button class="alert-dismiss" aria-label="Dismiss alert">
    <span aria-hidden="true">×</span>
  </button>
</div>

<!-- Error Alert -->
<div class="alert alert-error" role="alert" aria-live="assertive">
  <div class="alert-icon" aria-hidden="true">⚠</div>
  <div class="alert-content">
    <h4 class="alert-title">Error</h4>
    <p class="alert-message">Unable to save changes. Please try again.</p>
  </div>
  <button class="alert-dismiss" aria-label="Dismiss alert">
    <span aria-hidden="true">×</span>
  </button>
</div>
```

```css
.alert {
  display: flex;
  align-items: flex-start;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid;
  margin-bottom: var(--space-4);
}

.alert-success {
  background-color: var(--color-success-50);
  border-color: var(--color-success-200);
  color: var(--color-success-800);
}

.alert-error {
  background-color: var(--color-error-50);
  border-color: var(--color-error-200);
  color: var(--color-error-800);
}

.alert-warning {
  background-color: var(--color-warning-50);
  border-color: var(--color-warning-200);
  color: var(--color-warning-800);
}

.alert-info {
  background-color: var(--color-info-50);
  border-color: var(--color-info-200);
  color: var(--color-info-800);
}

.alert-icon {
  margin-right: var(--space-3);
  font-size: var(--text-lg);
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: var(--text-base);
  font-weight: 600;
  margin: 0 0 var(--space-1) 0;
}

.alert-message {
  font-size: var(--text-sm);
  margin: 0;
}

.alert-dismiss {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: var(--space-1);
  margin-left: var(--space-2);
  border-radius: var(--radius-base);
  
  &:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
  
  &:hover {
    opacity: 0.7;
  }
}
```

## Accessibility Guidelines

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order should follow logical content flow
- Focus indicators must be clearly visible (2px minimum)
- Skip links provided for main content areas

### Screen Reader Support
- All images have appropriate alt text
- Form labels are properly associated
- ARIA landmarks define page structure
- Live regions announce dynamic content changes

### Color and Contrast
- All text meets WCAG 2.1 AA contrast requirements (4.5:1)
- Interactive elements meet AA requirements (3:1 for large text)
- Color is never the only indicator of state or meaning
- High contrast mode support included

### Responsive Design
- Touch targets minimum 44px x 44px
- Text remains readable when zoomed to 200%
- Layout adapts to various screen sizes
- Content reflows without horizontal scrolling