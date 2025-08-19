# Data Visualization & Dashboard Widgets

## Overview
Comprehensive data visualization components and dashboard widgets designed for accessibility, responsiveness, and clear data communication. All components follow WCAG 2.1 AA guidelines and provide multiple ways to access data.

## Core Visualization Principles

### Accessibility-First Design
- **Screen Reader Support**: Data tables accompany all charts
- **Color Independence**: Patterns, textures, and labels supplement color
- **Keyboard Navigation**: Focus management for interactive elements
- **Alternative Formats**: Tabular data views for all visualizations

### Visual Hierarchy
- **Progressive Disclosure**: Summary → Details → Raw Data
- **Clear Labeling**: Descriptive titles and axis labels
- **Consistent Styling**: Unified color palette and typography
- **Responsive Design**: Adapts to all screen sizes

## Dashboard Widget Components

### 1. Metric Cards

#### KPI Metric Card
```html
<div class="metric-card" role="img" aria-labelledby="users-metric-title" aria-describedby="users-metric-desc">
  <div class="metric-header">
    <h3 id="users-metric-title" class="metric-title">Active Users</h3>
    <div class="metric-timeframe">Last 30 days</div>
  </div>
  
  <div class="metric-content">
    <div class="metric-value">
      <span class="metric-number">1,247</span>
      <span class="metric-unit">users</span>
    </div>
    
    <div class="metric-change positive" id="users-metric-desc">
      <span class="change-icon" aria-hidden="true">↗</span>
      <span class="change-value">+12.5%</span>
      <span class="change-period">vs last month</span>
      <span class="sr-only">Increased by 12.5% compared to last month</span>
    </div>
  </div>
  
  <div class="metric-sparkline" aria-hidden="true">
    <svg viewBox="0 0 100 20" class="sparkline-svg">
      <path d="M0,15 L20,12 L40,8 L60,10 L80,6 L100,4" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2"/>
    </svg>
  </div>
  
  <!-- Accessible data table -->
  <details class="metric-details">
    <summary>View detailed data</summary>
    <table class="metric-table">
      <caption>Daily active users for the last 7 days</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Active Users</th>
          <th scope="col">Change</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2024-01-15</td>
          <td>1,247</td>
          <td>+23</td>
        </tr>
        <tr>
          <td>2024-01-14</td>
          <td>1,224</td>
          <td>+45</td>
        </tr>
        <!-- Additional rows -->
      </tbody>
    </table>
  </details>
</div>
```

#### Progress Metric Card
```html
<div class="metric-card progress-card" role="img" aria-labelledby="goal-metric-title">
  <div class="metric-header">
    <h3 id="goal-metric-title" class="metric-title">Monthly Goal</h3>
    <div class="metric-target">Target: 1,000 signups</div>
  </div>
  
  <div class="metric-content">
    <div class="metric-value">
      <span class="metric-number">847</span>
      <span class="metric-unit">signups</span>
    </div>
    
    <div class="progress-visualization">
      <div class="progress-ring" role="progressbar" aria-valuenow="84.7" aria-valuemin="0" aria-valuemax="100" aria-label="84.7% of monthly signup goal achieved">
        <svg viewBox="0 0 100 100" class="progress-svg">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" stroke-width="8"/>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" stroke-width="8" 
                  stroke-dasharray="282.7" stroke-dashoffset="43.3" 
                  transform="rotate(-90 50 50)"/>
        </svg>
        <div class="progress-percentage">84.7%</div>
      </div>
      
      <div class="progress-details">
        <div class="progress-remaining">
          <span class="remaining-value">153</span>
          <span class="remaining-label">remaining</span>
        </div>
        <div class="progress-timeline">6 days left</div>
      </div>
    </div>
  </div>
</div>
```

### 2. Chart Components

#### Line Chart Component
```html
<div class="chart-container" role="img" aria-labelledby="revenue-chart-title" aria-describedby="revenue-chart-desc">
  <div class="chart-header">
    <h3 id="revenue-chart-title" class="chart-title">Revenue Trend</h3>
    <div class="chart-controls">
      <fieldset class="chart-timeframe">
        <legend class="sr-only">Select time period</legend>
        <label class="timeframe-option">
          <input type="radio" name="revenue-period" value="7d">
          <span>7D</span>
        </label>
        <label class="timeframe-option">
          <input type="radio" name="revenue-period" value="30d" checked>
          <span>30D</span>
        </label>
        <label class="timeframe-option">
          <input type="radio" name="revenue-period" value="90d">
          <span>90D</span>
        </label>
      </fieldset>
    </div>
  </div>
  
  <div id="revenue-chart-desc" class="chart-description">
    Line chart showing revenue trends over the selected time period, 
    with current period in blue and previous period in gray for comparison.
  </div>
  
  <div class="chart-canvas-wrapper">
    <canvas 
      id="revenue-chart-canvas" 
      class="chart-canvas"
      width="800" 
      height="400"
      role="img"
      aria-label="Revenue chart"
    ></canvas>
    
    <!-- Chart legend -->
    <div class="chart-legend" role="group" aria-label="Chart legend">
      <div class="legend-item">
        <span class="legend-color current" aria-hidden="true"></span>
        <span class="legend-label">Current Period</span>
      </div>
      <div class="legend-item">
        <span class="legend-color previous" aria-hidden="true"></span>
        <span class="legend-label">Previous Period</span>
      </div>
    </div>
  </div>
  
  <!-- Accessible data table -->
  <details class="chart-data-table">
    <summary>View chart data in table format</summary>
    <table class="data-table">
      <caption>Revenue data for the last 30 days</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Current Period ($)</th>
          <th scope="col">Previous Period ($)</th>
          <th scope="col">Change (%)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2024-01-15</td>
          <td>$12,450</td>
          <td>$11,200</td>
          <td>+11.2%</td>
        </tr>
        <!-- Additional data rows -->
      </tbody>
    </table>
  </details>
</div>
```

#### Bar Chart Component
```html
<div class="chart-container bar-chart" role="img" aria-labelledby="categories-chart-title">
  <div class="chart-header">
    <h3 id="categories-chart-title" class="chart-title">Sales by Category</h3>
    <div class="chart-summary">
      Total: $45,230 across 5 categories
    </div>
  </div>
  
  <div class="chart-canvas-wrapper">
    <svg class="bar-chart-svg" viewBox="0 0 400 300" role="img" aria-labelledby="categories-chart-title" aria-describedby="bar-chart-desc">
      <desc id="bar-chart-desc">
        Bar chart showing sales distribution across product categories. 
        Electronics leads with $18,500, followed by Clothing at $12,300.
      </desc>
      
      <!-- Chart bars with patterns for accessibility -->
      <g class="chart-bars">
        <rect x="50" y="100" width="60" height="150" 
              fill="url(#pattern-electronics)" 
              stroke="#1f2937" stroke-width="1"
              role="img" aria-label="Electronics: $18,500">
        </rect>
        <rect x="130" y="140" width="60" height="110" 
              fill="url(#pattern-clothing)" 
              stroke="#1f2937" stroke-width="1"
              role="img" aria-label="Clothing: $12,300">
        </rect>
        <!-- Additional bars -->
      </g>
      
      <!-- Patterns for accessibility -->
      <defs>
        <pattern id="pattern-electronics" patternUnits="userSpaceOnUse" width="4" height="4">
          <path d="M0,4l4,-4M-1,1l2,-2M3,5l2,-2" stroke="#3b82f6" stroke-width="1"/>
        </pattern>
        <pattern id="pattern-clothing" patternUnits="userSpaceOnUse" width="4" height="4">
          <circle cx="2" cy="2" r="1" fill="#10b981"/>
        </pattern>
      </defs>
      
      <!-- Axis labels -->
      <g class="chart-labels">
        <text x="80" y="270" text-anchor="middle" class="axis-label">Electronics</text>
        <text x="160" y="270" text-anchor="middle" class="axis-label">Clothing</text>
        <!-- Additional labels -->
      </g>
    </svg>
  </div>
  
  <!-- Data table alternative -->
  <table class="chart-data-table" aria-label="Sales by category data">
    <caption>Sales breakdown by product category</caption>
    <thead>
      <tr>
        <th scope="col">Category</th>
        <th scope="col">Sales Amount</th>
        <th scope="col">Percentage</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Electronics</td>
        <td>$18,500</td>
        <td>40.9%</td>
      </tr>
      <tr>
        <td>Clothing</td>
        <td>$12,300</td>
        <td>27.2%</td>
      </tr>
      <!-- Additional rows -->
    </tbody>
  </table>
</div>
```

### 3. Activity Feed Widget

#### Real-time Activity Stream
```html
<div class="activity-feed" role="log" aria-labelledby="activity-title" aria-live="polite">
  <div class="widget-header">
    <h3 id="activity-title" class="widget-title">Recent Activity</h3>
    <div class="activity-controls">
      <button class="btn btn-sm btn-secondary" onclick="refreshActivity()" aria-label="Refresh activity feed">
        <span class="refresh-icon" aria-hidden="true">↻</span>
        Refresh
      </button>
    </div>
  </div>
  
  <div class="activity-list" tabindex="0" role="group" aria-label="Activity items">
    <div class="activity-item" role="listitem">
      <div class="activity-icon user-icon" aria-hidden="true">👤</div>
      <div class="activity-content">
        <div class="activity-message">
          <strong>John Doe</strong> updated their profile
        </div>
        <div class="activity-timestamp">
          <time datetime="2024-01-15T14:30:00Z">2 minutes ago</time>
        </div>
      </div>
    </div>
    
    <div class="activity-item" role="listitem">
      <div class="activity-icon system-icon" aria-hidden="true">⚙️</div>
      <div class="activity-content">
        <div class="activity-message">
          System backup completed successfully
        </div>
        <div class="activity-timestamp">
          <time datetime="2024-01-15T14:00:00Z">32 minutes ago</time>
        </div>
      </div>
    </div>
    
    <div class="activity-item" role="listitem">
      <div class="activity-icon data-icon" aria-hidden="true">📊</div>
      <div class="activity-content">
        <div class="activity-message">
          Monthly report generated
          <a href="/reports/monthly-2024-01" class="activity-link">View report</a>
        </div>
        <div class="activity-timestamp">
          <time datetime="2024-01-15T13:45:00Z">45 minutes ago</time>
        </div>
      </div>
    </div>
  </div>
  
  <div class="activity-footer">
    <a href="/activity/all" class="view-all-link">View all activity →</a>
  </div>
</div>
```

### 4. Status Dashboard Widget

#### System Health Overview
```html
<div class="status-widget" role="region" aria-labelledby="status-title">
  <div class="widget-header">
    <h3 id="status-title" class="widget-title">System Status</h3>
    <div class="overall-status healthy">
      <span class="status-indicator" aria-hidden="true">●</span>
      All Systems Operational
    </div>
  </div>
  
  <div class="status-grid">
    <div class="status-item" role="group" aria-labelledby="api-status">
      <div class="status-header">
        <h4 id="api-status" class="status-name">API Services</h4>
        <div class="status-badge healthy">
          <span class="sr-only">Status: </span>Operational
        </div>
      </div>
      <div class="status-metrics">
        <div class="metric">
          <span class="metric-label">Uptime:</span>
          <span class="metric-value">99.9%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Response Time:</span>
          <span class="metric-value">120ms</span>
        </div>
      </div>
    </div>
    
    <div class="status-item" role="group" aria-labelledby="database-status">
      <div class="status-header">
        <h4 id="database-status" class="status-name">Database</h4>
        <div class="status-badge warning">
          <span class="sr-only">Status: </span>Performance Issues
        </div>
      </div>
      <div class="status-metrics">
        <div class="metric">
          <span class="metric-label">Connections:</span>
          <span class="metric-value">245/300</span>
        </div>
        <div class="metric">
          <span class="metric-label">Query Time:</span>
          <span class="metric-value">450ms</span>
        </div>
      </div>
    </div>
    
    <div class="status-item" role="group" aria-labelledby="storage-status">
      <div class="status-header">
        <h4 id="storage-status" class="status-name">Storage</h4>
        <div class="status-badge healthy">
          <span class="sr-only">Status: </span>Operational
        </div>
      </div>
      <div class="status-metrics">
        <div class="metric">
          <span class="metric-label">Usage:</span>
          <span class="metric-value">67%</span>
        </div>
        <div class="metric">
          <span class="metric-label">Available:</span>
          <span class="metric-value">2.1TB</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Chart Styling and Accessibility

### CSS Framework for Charts
```css
/* Chart Container Styles */
.chart-container {
  background: var(--color-white);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.chart-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--color-neutral-900);
  margin: 0;
}

.chart-description {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  margin-bottom: var(--space-4);
}

/* Chart Canvas Styles */
.chart-canvas-wrapper {
  position: relative;
  margin-bottom: var(--space-4);
}

.chart-canvas {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-base);
}

/* Accessible Chart Patterns */
.chart-patterns {
  display: none; /* Hidden from sighted users */
}

@media (prefers-contrast: high) {
  .chart-canvas {
    filter: contrast(1.5);
  }
}

/* Focus indicators for interactive charts */
.chart-interactive:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Chart Legend */
.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-neutral-300);
}

.legend-color.current {
  background-color: var(--color-primary-500);
}

.legend-color.previous {
  background-color: var(--color-neutral-400);
}

/* Data Table Styles */
.chart-data-table {
  margin-top: var(--space-4);
}

.chart-data-table summary {
  cursor: pointer;
  font-weight: 500;
  color: var(--color-primary-600);
  margin-bottom: var(--space-2);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.data-table th,
.data-table td {
  padding: var(--space-2) var(--space-3);
  text-align: left;
  border-bottom: 1px solid var(--color-neutral-200);
}

.data-table th {
  background-color: var(--color-neutral-50);
  font-weight: 600;
  color: var(--color-neutral-700);
}
```

### JavaScript Chart Accessibility
```javascript
// Chart accessibility helpers
class AccessibleChart {
  constructor(canvasId, data, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.data = data;
    this.options = options;
    this.setupAccessibility();
  }
  
  setupAccessibility() {
    // Add keyboard navigation
    this.canvas.setAttribute('tabindex', '0');
    this.canvas.setAttribute('role', 'img');
    
    // Add description
    const description = this.generateDescription();
    this.canvas.setAttribute('aria-label', description);
    
    // Add keyboard event handlers
    this.canvas.addEventListener('keydown', this.handleKeyboard.bind(this));
  }
  
  generateDescription() {
    const { type, data } = this.options;
    let description = `${type} chart with ${data.length} data points. `;
    
    if (type === 'line') {
      const trend = this.calculateTrend(data);
      description += `Overall trend is ${trend}. `;
    }
    
    // Add min/max values
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    description += `Values range from ${min} to ${max}.`;
    
    return description;
  }
  
  handleKeyboard(event) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        // Toggle data table visibility
        this.toggleDataTable();
        break;
      case 'ArrowRight':
      case 'ArrowLeft':
        // Navigate through data points
        this.navigateDataPoints(event.key);
        break;
    }
  }
  
  announceDataPoint(index) {
    const point = this.data[index];
    const message = `Data point ${index + 1}: ${point.label}, value ${point.value}`;
    
    // Announce to screen readers
    this.announce(message);
  }
  
  announce(message) {
    const announcer = document.getElementById('chart-announcer') || this.createAnnouncer();
    announcer.textContent = message;
  }
  
  createAnnouncer() {
    const announcer = document.createElement('div');
    announcer.id = 'chart-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
    return announcer;
  }
}
```

## Responsive Design Considerations

### Mobile Optimization
- Simplified chart interactions for touch
- Collapsible data tables on small screens
- Larger touch targets for chart controls
- Horizontal scrolling for wide data tables

### Performance
- Lazy loading for below-the-fold charts
- Canvas vs SVG optimization based on data complexity
- Debounced interactions for real-time data
- Efficient data structure for large datasets

### Progressive Enhancement
- Core data accessible without JavaScript
- Enhanced interactions with JavaScript enabled
- Fallback text descriptions for all visualizations
- Print-friendly styles for reports