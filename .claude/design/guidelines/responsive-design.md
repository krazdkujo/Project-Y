# Responsive Design Guidelines

## Overview
Comprehensive responsive design guidelines ensuring optimal user experience across all devices and screen sizes, following mobile-first principles and accessibility best practices.

## Breakpoint System

### Primary Breakpoints
```css
/* Mobile First Approach */
:root {
  --breakpoint-xs: 320px;   /* Small phones */
  --breakpoint-sm: 640px;   /* Large phones */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Small laptops */
  --breakpoint-xl: 1280px;  /* Laptops */
  --breakpoint-2xl: 1536px; /* Desktops */
}

/* Media Query Mixins */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Container Constraints
```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

/* Container max-widths */
@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { 
    max-width: 768px;
    padding-left: var(--space-6);
    padding-right: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container { 
    max-width: 1024px;
    padding-left: var(--space-8);
    padding-right: var(--space-8);
  }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

@media (min-width: 1536px) {
  .container { max-width: 1536px; }
}
```

## Grid System

### Flexible Grid Layout
```css
.grid {
  display: grid;
  gap: var(--space-4);
  width: 100%;
}

/* Mobile: Single column */
.grid {
  grid-template-columns: 1fr;
}

/* Tablet: Two columns */
@media (min-width: 768px) {
  .grid {
    gap: var(--space-6);
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop: Multiple columns */
@media (min-width: 1024px) {
  .grid {
    gap: var(--space-8);
  }
  
  .grid-4 {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .grid-6 {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* Grid span utilities */
.col-span-1 { grid-column: span 1; }
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }
.col-span-full { grid-column: 1 / -1; }

/* Responsive spans */
@media (min-width: 768px) {
  .md\:col-span-2 { grid-column: span 2; }
  .md\:col-span-3 { grid-column: span 3; }
}

@media (min-width: 1024px) {
  .lg\:col-span-2 { grid-column: span 2; }
  .lg\:col-span-3 { grid-column: span 3; }
  .lg\:col-span-4 { grid-column: span 4; }
}
```

## Dashboard Layout Patterns

### Mobile Layout (320px - 767px)
```css
/* Mobile dashboard structure */
.dashboard-mobile {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-neutral-200);
  z-index: 50;
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
}

.mobile-content {
  margin-top: 56px; /* Header height */
  margin-bottom: 60px; /* Bottom nav height */
  padding: var(--space-4);
  flex: 1;
}

.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--color-white);
  border-top: 1px solid var(--color-neutral-200);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 50;
}

/* Mobile metric cards - stacked */
.mobile-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.mobile-metric-card {
  padding: var(--space-4);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
```

### Tablet Layout (768px - 1023px)
```css
/* Tablet dashboard structure */
.dashboard-tablet {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar content";
  grid-template-rows: 64px 1fr;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

.tablet-header {
  grid-area: header;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-neutral-200);
  display: flex;
  align-items: center;
  padding: 0 var(--space-6);
}

.tablet-sidebar {
  grid-area: sidebar;
  background: var(--color-neutral-50);
  border-right: 1px solid var(--color-neutral-200);
  overflow-y: auto;
}

.tablet-content {
  grid-area: content;
  padding: var(--space-6);
  overflow-y: auto;
}

/* Tablet metric cards - 2x2 grid */
.tablet-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}
```

### Desktop Layout (1024px+)
```css
/* Desktop dashboard structure */
.dashboard-desktop {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar content aside";
  grid-template-rows: 64px 1fr;
  grid-template-columns: 240px 1fr 300px;
  min-height: 100vh;
}

.desktop-header {
  grid-area: header;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-neutral-200);
  display: flex;
  align-items: center;
  padding: 0 var(--space-8);
}

.desktop-sidebar {
  grid-area: sidebar;
  background: var(--color-neutral-50);
  border-right: 1px solid var(--color-neutral-200);
  overflow-y: auto;
}

.desktop-content {
  grid-area: content;
  padding: var(--space-8);
  overflow-y: auto;
}

.desktop-aside {
  grid-area: aside;
  background: var(--color-neutral-50);
  border-left: 1px solid var(--color-neutral-200);
  padding: var(--space-6);
  overflow-y: auto;
}

/* Desktop metric cards - 3 or 4 column grid */
.desktop-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
  margin-bottom: var(--space-12);
}

@media (min-width: 1280px) {
  .desktop-metrics {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

## Component Responsive Patterns

### Navigation Patterns
```css
/* Mobile hamburger menu */
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-white);
  transform: translateX(-100%);
  transition: transform var(--duration-300) var(--timing-ease-in-out);
  z-index: 60;
}

.mobile-nav.open {
  transform: translateX(0);
}

.mobile-nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all var(--duration-300) var(--timing-ease-in-out);
  z-index: 55;
}

.mobile-nav-overlay.visible {
  opacity: 1;
  visibility: visible;
}

/* Tablet+ sidebar navigation */
@media (min-width: 768px) {
  .mobile-nav {
    position: static;
    transform: none;
    width: 240px;
    height: auto;
  }
  
  .mobile-nav-overlay {
    display: none;
  }
}
```

### Form Responsive Design
```css
/* Mobile forms - stacked layout */
.form-responsive {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Tablet+ forms - side-by-side layout */
@media (min-width: 768px) {
  .form-group-row {
    flex-direction: row;
  }
  
  .form-group-row .form-group {
    flex: 1;
  }
  
  .form-group-row .form-group:not(:last-child) {
    margin-right: var(--space-4);
  }
}

/* Desktop forms - multi-column layout */
@media (min-width: 1024px) {
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }
  
  .form-group-full {
    grid-column: 1 / -1;
  }
}
```

### Chart Responsive Design
```css
/* Mobile charts - simplified view */
.chart-responsive {
  width: 100%;
  height: 200px;
}

.chart-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

/* Tablet charts - increased height */
@media (min-width: 768px) {
  .chart-responsive {
    height: 300px;
  }
  
  .chart-controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

/* Desktop charts - full functionality */
@media (min-width: 1024px) {
  .chart-responsive {
    height: 400px;
  }
  
  .chart-with-sidebar {
    display: grid;
    grid-template-columns: 1fr 200px;
    gap: var(--space-6);
  }
}
```

## Typography Scaling

### Responsive Typography
```css
/* Mobile typography */
.responsive-heading-1 {
  font-size: var(--text-2xl);
  line-height: var(--leading-tight);
}

.responsive-heading-2 {
  font-size: var(--text-xl);
  line-height: var(--leading-tight);
}

.responsive-body {
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

/* Tablet typography scaling */
@media (min-width: 768px) {
  .responsive-heading-1 {
    font-size: var(--text-3xl);
  }
  
  .responsive-heading-2 {
    font-size: var(--text-2xl);
  }
  
  .responsive-body {
    font-size: var(--text-lg);
  }
}

/* Desktop typography scaling */
@media (min-width: 1024px) {
  .responsive-heading-1 {
    font-size: var(--text-4xl);
  }
  
  .responsive-heading-2 {
    font-size: var(--text-3xl);
  }
}

/* Large desktop scaling */
@media (min-width: 1536px) {
  .responsive-heading-1 {
    font-size: var(--text-5xl);
  }
}
```

## Touch and Interaction Guidelines

### Touch Target Sizing
```css
/* Minimum touch target sizes */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Recommended touch target sizes */
.touch-target-recommended {
  min-height: 48px;
  min-width: 48px;
}

/* Spacing between touch targets */
.touch-group {
  display: flex;
  gap: var(--space-2); /* 8px minimum */
}

@media (min-width: 768px) {
  .touch-group {
    gap: var(--space-1); /* Reduced spacing on larger screens */
  }
}
```

### Hover and Focus States
```css
/* Mobile - no hover states */
@media (hover: none) and (pointer: coarse) {
  .hover-effect:hover {
    /* Disable hover effects on touch devices */
    transform: none;
    box-shadow: var(--shadow-sm);
  }
}

/* Desktop - full hover effects */
@media (hover: hover) and (pointer: fine) {
  .hover-effect:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

/* Focus always visible */
.focus-visible:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

## Performance Optimization

### Critical CSS
```css
/* Above-the-fold critical styles */
.critical-header {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-neutral-200);
  height: 64px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

.critical-content {
  margin-top: 64px;
  padding: var(--space-4);
}

/* Non-critical styles loaded asynchronously */
.non-critical-sidebar {
  /* Loaded after critical CSS */
}
```

### Image Optimization
```css
/* Responsive images */
.responsive-image {
  max-width: 100%;
  height: auto;
  object-fit: cover;
}

/* Different image sizes for different breakpoints */
.hero-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

@media (min-width: 768px) {
  .hero-image {
    height: 300px;
  }
}

@media (min-width: 1024px) {
  .hero-image {
    height: 400px;
  }
}
```

## Testing Guidelines

### Responsive Testing Checklist

#### Mobile Testing (320px - 767px)
- [ ] Navigation is accessible via hamburger menu
- [ ] Content is readable without horizontal scrolling
- [ ] Touch targets meet 44px minimum size
- [ ] Forms are easy to complete on small screens
- [ ] Charts display simplified but informative views

#### Tablet Testing (768px - 1023px)
- [ ] Layout transitions smoothly from mobile
- [ ] Sidebar navigation is accessible
- [ ] Content makes use of available space
- [ ] Touch and mouse interactions both work
- [ ] Charts show more detail than mobile version

#### Desktop Testing (1024px+)
- [ ] Full feature set is available
- [ ] Layout makes efficient use of screen space
- [ ] Hover states provide helpful feedback
- [ ] Keyboard navigation works throughout
- [ ] Charts display full functionality

### Cross-Device Testing
```javascript
// JavaScript for responsive testing
function testResponsiveBreakpoints() {
  const breakpoints = [320, 375, 414, 768, 1024, 1280, 1536];
  
  breakpoints.forEach(width => {
    // Simulate different screen sizes
    window.resizeTo(width, 800);
    
    // Test critical functionality at each breakpoint
    testNavigation();
    testFormUsability();
    testChartDisplay();
    testAccessibility();
  });
}

function testAccessibility() {
  // Test keyboard navigation
  const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
  
  focusableElements.forEach(element => {
    element.focus();
    // Verify focus is visible
    const computedStyle = window.getComputedStyle(element, ':focus');
    // Test outline visibility
  });
}
```

## Progressive Enhancement Strategy

### Core Experience (No JavaScript)
- Basic navigation works
- Forms submit and validate
- Content is accessible and readable
- Essential functionality available

### Enhanced Experience (With JavaScript)
- Smooth animations and transitions
- Real-time data updates
- Interactive charts and visualizations
- Advanced form validation

### Advanced Experience (Modern Browsers)
- CSS Grid and Flexbox layouts
- Advanced animations with CSS transforms
- Service worker for offline functionality
- Push notifications and PWA features

## Accessibility in Responsive Design

### Screen Reader Navigation
- Consistent heading structure across all breakpoints
- Skip links adapt to layout changes
- ARIA landmarks remain meaningful
- Focus management handles layout changes

### Motor Accessibility
- Touch targets remain accessible on all devices
- Keyboard navigation works at all breakpoints
- Voice control compatibility maintained
- Switch navigation support preserved

### Visual Accessibility
- Text contrast ratios maintained across themes
- Focus indicators scale appropriately
- High contrast mode compatibility
- Reduced motion preferences respected