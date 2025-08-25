// ASCII Frame System - Foundation for creating UI screens with ASCII templates
class ASCIIFrameSystem {
    constructor() {
        this.templates = new Map();
        this.activeScreen = null;
        this.screenHistory = [];
        this.screenCallbacks = new Map();
        
        // Default colors
        this.colors = {
            border: '#008000',
            title: '#00ff00',
            text: '#ffffff',
            highlight: '#ffff00',
            button: '#00ffff',
            buttonHover: '#ffffff',
            error: '#ff0000',
            success: '#00ff00',
            disabled: '#808080'
        };
        
        // Initialize core templates
        this.initializeCoreTemplates();
    }

    initializeCoreTemplates() {
        // Basic frame template - 80x25 standard terminal size
        this.registerTemplate('basic_frame', {
            width: 80,
            height: 25,
            template: `
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘`.trim(),
            regions: {
                main: { row: 2, col: 2, width: 76, height: 20 },
                footer: { row: 23, col: 2, width: 76, height: 1 }
            }
        });

        // Dialog box template - smaller centered frame
        this.registerTemplate('dialog_box', {
            width: 60,
            height: 15,
            template: `
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘`.trim(),
            regions: {
                message: { row: 3, col: 2, width: 56, height: 8 },
                buttons: { row: 12, col: 2, width: 56, height: 1 }
            }
        });

        // Menu template with dividers
        this.registerTemplate('menu_frame', {
            width: 70,
            height: 20,
            template: `
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                            TITLE HERE                              │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                                                                    │
│                                                                    │
│                                                                    │
│                                                                    │
│                                                                    │
│                                                                    │
│                                                                    │
│                                                                    │
│                                                                    │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘`.trim(),
            regions: {
                title: { row: 2, col: 2, width: 66, height: 1 },
                main: { row: 5, col: 2, width: 66, height: 11 },
                footer: { row: 17, col: 2, width: 66, height: 2 }
            }
        });
    }

    /**
     * Register a new ASCII template
     */
    registerTemplate(name, template) {
        this.templates.set(name, {
            ...template,
            name: name,
            regions: template.regions || {},
            interactions: template.interactions || {}
        });
    }

    /**
     * Create a new screen from a template
     */
    createScreen(templateName, options = {}) {
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }

        const screen = new ASCIIScreen(template, options, this);
        return screen;
    }

    /**
     * Display a screen
     */
    showScreen(screen, containerId = 'ascii-screen-container') {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container '${containerId}' not found`);
        }

        // Store previous screen for navigation
        if (this.activeScreen) {
            this.screenHistory.push(this.activeScreen);
        }

        this.activeScreen = screen;
        screen.render(container);
        
        // Set up event listeners
        this.setupScreenEventListeners(screen, container);
    }

    /**
     * Go back to previous screen
     */
    goBack() {
        if (this.screenHistory.length > 0) {
            const previousScreen = this.screenHistory.pop();
            this.activeScreen = previousScreen;
            previousScreen.refresh();
        }
    }

    /**
     * Set up event listeners for a screen
     */
    setupScreenEventListeners(screen, container) {
        // Remove existing listeners
        const oldHandler = container._asciiFrameHandler;
        if (oldHandler) {
            document.removeEventListener('keydown', oldHandler);
        }

        // Create new handler
        const handler = (event) => {
            screen.handleInput(event);
        };

        document.addEventListener('keydown', handler);
        container._asciiFrameHandler = handler;

        // Set up mouse interactions
        container.addEventListener('click', (event) => {
            screen.handleClick(event);
        });
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.activeScreen) {
            this.activeScreen.cleanup();
        }
        this.screenHistory.forEach(screen => screen.cleanup());
        this.screenHistory = [];
        this.activeScreen = null;
    }
}

class ASCIIScreen {
    constructor(template, options, frameSystem) {
        this.template = template;
        this.options = options;
        this.frameSystem = frameSystem;
        this.content = this.template.template.split('\n');
        this.regions = new Map();
        this.interactables = [];
        this.selectedIndex = 0;
        this.onAction = options.onAction || (() => {});
        
        // Initialize regions from template
        this.initializeRegions();
    }

    initializeRegions() {
        // Process template regions
        Object.entries(this.template.regions || {}).forEach(([name, region]) => {
            this.regions.set(name, {
                ...region,
                content: ''
            });
        });
    }

    /**
     * Set text in a specific region
     */
    setText(regionName, text, options = {}) {
        const region = this.regions.get(regionName);
        if (!region) {
            console.warn(`Region '${regionName}' not found`);
            return;
        }

        const lines = this.wrapText(text, region.width || 50);
        const color = options.color || this.frameSystem.colors.text;
        const align = options.align || 'left';

        region.content = lines.map(line => this.alignText(line, region.width, align)).join('\n');
        region.color = color;
        
        this.updateDisplay();
    }

    /**
     * Add button to screen
     */
    addButton(text, action, position = null) {
        const button = {
            type: 'button',
            text: text,
            action: action,
            position: position,
            selected: false,
            id: `btn_${this.interactables.length}`
        };
        
        this.interactables.push(button);
        return button;
    }

    /**
     * Add text input field
     */
    addInput(placeholder, position, options = {}) {
        const input = {
            type: 'input',
            placeholder: placeholder,
            value: '',
            position: position,
            selected: false,
            maxLength: options.maxLength || 50,
            id: `input_${this.interactables.length}`
        };
        
        this.interactables.push(input);
        return input;
    }

    /**
     * Render the screen to a container
     */
    render(container) {
        this.container = container;
        
        // Clear container
        container.innerHTML = '';
        
        // Create main display element
        const display = document.createElement('div');
        display.className = 'ascii-screen';
        display.style.fontFamily = '"Courier New", "Lucida Console", monospace';
        display.style.fontSize = '12px';
        display.style.lineHeight = '14.4px'; // Match line height exactly
        display.style.color = this.frameSystem.colors.text;
        display.style.backgroundColor = '#000000';
        display.style.whiteSpace = 'pre';
        display.style.padding = '20px';
        display.style.overflow = 'hidden'; // Prevent scrolling
        display.style.width = `${this.template.width * 7.2}px`; // Fixed width based on char width
        display.style.height = `${this.template.height * 14.4}px`; // Fixed height based on line height
        display.style.margin = '0 auto'; // Center the screen
        display.style.letterSpacing = '0px';
        display.style.wordSpacing = '0px';
        
        this.display = display;
        container.appendChild(display);
        
        this.updateDisplay();
    }

    /**
     * Update the display with current content
     */
    updateDisplay() {
        if (!this.display) return;

        // Start with static frame template
        let output = [...this.content];
        
        // Only update dynamic content regions - frame stays static
        this.regions.forEach((region, name) => {
            if (region.content !== undefined) {
                this.updateRegionContent(output, region);
            }
        });
        
        // Only update interactable states - positions are static
        this.interactables.forEach((item, index) => {
            this.updateInteractableState(output, item, index === this.selectedIndex);
        });
        
        // Apply colors with HTML
        const coloredOutput = output.map(line => this.applyLineColors(line)).join('\n');
        this.display.innerHTML = coloredOutput;
    }

    /**
     * Update only the content within a region, preserving frame
     */
    updateRegionContent(output, region) {
        // Clear the region first (fill with spaces but preserve frame)
        for (let i = 0; i < (region.height || 1); i++) {
            const row = region.row + i;
            if (row >= 0 && row < output.length) {
                const line = output[row];
                const before = line.substring(0, region.col);
                const after = line.substring(region.col + (region.width || 20));
                const cleared = ' '.repeat(region.width || 20);
                output[row] = before + cleared + after;
            }
        }

        // Insert new content
        if (region.content) {
            this.insertTextAtPosition(output, region.content, region.row, region.col, region.color);
        }
    }

    /**
     * Update interactable state without changing position
     */
    updateInteractableState(output, item, selected) {
        if (!item.position) return;

        // Clear the item area first
        const itemWidth = this.getInteractableWidth(item);
        const row = item.position.row;
        const col = item.position.col;
        
        if (row >= 0 && row < output.length) {
            const line = output[row];
            const before = line.substring(0, col);
            const after = line.substring(col + itemWidth);
            const cleared = ' '.repeat(itemWidth);
            output[row] = before + cleared + after;
        }

        // Render the item in its current state
        this.renderInteractable(output, item, selected);
    }

    /**
     * Get the display width of an interactable
     */
    getInteractableWidth(item) {
        switch (item.type) {
            case 'button':
                return item.text.length + 4; // "[ text ]"
            case 'input':
                return (item.maxLength || 20) + 2; // "[content]"
            default:
                return 10;
        }
    }

    /**
     * Apply colors to a line of text
     */
    applyLineColors(line) {
        // Handle color tags properly
        return line.replace(/\[color:([#\w]+)\](.*?)\[\/color\]/g, 
            '<span style="color: $1;">$2</span>');
    }

    /**
     * Insert text at specific position in output
     */
    insertTextAtPosition(output, text, row, col, color) {
        if (!text) return;
        
        const lines = text.split('\n');
        lines.forEach((line, lineIndex) => {
            const targetRow = row + lineIndex;
            if (targetRow >= 0 && targetRow < output.length) {
                const currentLine = output[targetRow];
                
                // Add color tags if specified
                const displayText = color ? `[color:${color}]${line}[/color]` : line;
                
                // Simple replacement - just replace the characters at the position
                if (col >= 0 && col < currentLine.length) {
                    const lineArray = currentLine.split('');
                    
                    // Replace character by character
                    for (let i = 0; i < displayText.length && (col + i) < lineArray.length; i++) {
                        lineArray[col + i] = displayText[i];
                    }
                    
                    output[targetRow] = lineArray.join('');
                }
            }
        });
    }

    /**
     * Render an interactive element
     */
    renderInteractable(output, item, selected) {
        if (!item.position) return;

        let displayText = '';
        let color = this.frameSystem.colors.text;

        switch (item.type) {
            case 'button':
                displayText = `[ ${item.text} ]`;
                color = selected ? this.frameSystem.colors.buttonHover : this.frameSystem.colors.button;
                break;
            case 'input':
                const value = item.value || item.placeholder;
                displayText = `[${value.padEnd(item.maxLength || 20)}]`;
                color = selected ? this.frameSystem.colors.highlight : this.frameSystem.colors.text;
                break;
        }

        this.insertTextAtPosition(output, displayText, item.position.row, item.position.col, color);
        
        // Add cursor for selected input
        if (selected && item.type === 'input') {
            const cursorCol = item.position.col + 1 + (item.value?.length || 0);
            this.insertTextAtPosition(output, '_', item.position.row, cursorCol, this.frameSystem.colors.highlight);
        }
    }

    /**
     * Handle keyboard input
     */
    handleInput(event) {
        const key = event.key;
        
        switch (key) {
            case 'ArrowUp':
                this.selectedIndex = Math.max(0, this.selectedIndex - 1);
                this.updateDisplay();
                event.preventDefault();
                break;
                
            case 'ArrowDown':
                this.selectedIndex = Math.min(this.interactables.length - 1, this.selectedIndex + 1);
                this.updateDisplay();
                event.preventDefault();
                break;
                
            case 'Enter':
                this.activateSelected();
                event.preventDefault();
                break;
                
            case 'Escape':
                this.frameSystem.goBack();
                event.preventDefault();
                break;
                
            default:
                // Handle text input
                this.handleTextInput(key);
                break;
        }
    }

    /**
     * Handle text input for input fields
     */
    handleTextInput(key) {
        const selected = this.interactables[this.selectedIndex];
        if (!selected || selected.type !== 'input') return;

        if (key === 'Backspace') {
            selected.value = selected.value.slice(0, -1);
            this.updateDisplay();
        } else if (key.length === 1 && selected.value.length < (selected.maxLength || 50)) {
            selected.value += key;
            this.updateDisplay();
        }
    }

    /**
     * Handle mouse clicks
     */
    handleClick(event) {
        // Calculate click position relative to text
        // This is a simplified implementation
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Find clicked interactable (simplified)
        this.interactables.forEach((item, index) => {
            if (item.position) {
                // Simple bounding box check
                this.selectedIndex = index;
                this.updateDisplay();
            }
        });
    }

    /**
     * Activate currently selected item
     */
    activateSelected() {
        const selected = this.interactables[this.selectedIndex];
        if (!selected) return;

        if (selected.type === 'button') {
            if (selected.action) {
                selected.action();
            }
            this.onAction('button', selected);
        } else if (selected.type === 'input') {
            this.onAction('input', selected);
        }
    }

    /**
     * Wrap text to fit within specified width
     */
    wrapText(text, width) {
        if (!text) return [''];
        
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
            if ((currentLine + word).length <= width) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        
        if (currentLine) lines.push(currentLine);
        return lines;
    }

    /**
     * Align text within specified width
     */
    alignText(text, width, align) {
        if (align === 'center') {
            const padding = Math.max(0, width - text.length);
            const leftPad = Math.floor(padding / 2);
            return ' '.repeat(leftPad) + text + ' '.repeat(padding - leftPad);
        } else if (align === 'right') {
            return text.padStart(width);
        } else {
            return text.padEnd(width);
        }
    }

    /**
     * Refresh the screen
     */
    refresh() {
        this.updateDisplay();
    }

    /**
     * Clean up resources
     */
    cleanup() {
        if (this.container && this.container._asciiFrameHandler) {
            document.removeEventListener('keydown', this.container._asciiFrameHandler);
            this.container._asciiFrameHandler = null;
        }
    }
}

// Make available globally
window.ASCIIFrameSystem = ASCIIFrameSystem;
window.ASCIIScreen = ASCIIScreen;