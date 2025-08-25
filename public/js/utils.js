// Shared Utilities - Common helper functions used across game client modules

// Constants for game configuration
const GAME_CONSTANTS = {
    AP: {
        MAX_DEFAULT: 8,
        REGEN_MIN: 2,
        REGEN_MAX: 3
    },
    GRID: {
        DEFAULT_COLS: 60,
        DEFAULT_ROWS: 30,
        MIN_COLS: 40,
        MIN_ROWS: 20
    },
    TIMER: {
        DEFAULT_TURN_TIME: 10,
        WARNING_THRESHOLD: 5,
        CRITICAL_THRESHOLD: 3
    },
    COLORS: {
        PLAYER_SELF: '#00ff00',
        PLAYER_OTHER: '#ffff00',
        FLOOR: '#404040',
        WALL: '#666666',
        DOOR: '#8B4513',
        STAIRS_UP: '#FFD700',
        STAIRS_DOWN: '#FFD700',
        WATER: '#4682B4',
        LAVA: '#FF4500',
        TREE: '#228B22',
        ROCK: '#696969',
        NPC: '#FFA500',
        ITEM: '#FF00FF',
        MONSTER: '#FF0000'
    },
    TERRAIN: {
        FLOOR: '.',
        WALL: '#',
        DOOR: '+',
        STAIRS_UP: '<',
        STAIRS_DOWN: '>',
        WATER: '~',
        LAVA: '^',
        TREE: 'T',
        ROCK: '*',
        PLAYER: '@',
        NPC: '&',
        ITEM: '%',
        MONSTER: 'M'
    }
};

// Position and coordinate utilities
const PositionUtils = {
    /**
     * Calculate Manhattan distance between two positions
     */
    manhattanDistance(pos1, pos2) {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    },

    /**
     * Calculate Euclidean distance between two positions
     */
    euclideanDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Check if position is within bounds
     */
    isInBounds(position, width, height) {
        return position.x >= 0 && position.x < width && 
               position.y >= 0 && position.y < height;
    },

    /**
     * Get adjacent positions (4-directional)
     */
    getAdjacentPositions(position) {
        return [
            { x: position.x, y: position.y - 1 }, // Up
            { x: position.x + 1, y: position.y }, // Right
            { x: position.x, y: position.y + 1 }, // Down
            { x: position.x - 1, y: position.y }  // Left
        ];
    },

    /**
     * Get diagonal positions
     */
    getDiagonalPositions(position) {
        return [
            { x: position.x - 1, y: position.y - 1 }, // Up-left
            { x: position.x + 1, y: position.y - 1 }, // Up-right
            { x: position.x - 1, y: position.y + 1 }, // Down-left
            { x: position.x + 1, y: position.y + 1 }  // Down-right
        ];
    },

    /**
     * Get all 8 surrounding positions
     */
    getSurroundingPositions(position) {
        return [...this.getAdjacentPositions(position), ...this.getDiagonalPositions(position)];
    },

    /**
     * Clamp position to bounds
     */
    clampToBounds(position, width, height) {
        return {
            x: Math.max(0, Math.min(position.x, width - 1)),
            y: Math.max(0, Math.min(position.y, height - 1))
        };
    }
};

// UI and rendering utilities
const UIUtils = {
    /**
     * Calculate optimal grid dimensions based on container size
     */
    calculateGridDimensions(container, minCols = 40, minRows = 20) {
        if (!container) {
            return { cols: GAME_CONSTANTS.GRID.DEFAULT_COLS, rows: GAME_CONSTANTS.GRID.DEFAULT_ROWS };
        }
        
        const containerRect = container.getBoundingClientRect();
        const availableWidth = containerRect.width - 10; // padding
        const availableHeight = containerRect.height - 10;
        
        // Estimate character dimensions (monospace)
        const charWidth = 8; // typical monospace char width in pixels
        const lineHeight = 14; // typical line height
        
        const cols = Math.max(minCols, Math.floor(availableWidth / charWidth));
        const rows = Math.max(minRows, Math.floor(availableHeight / lineHeight));
        
        return { cols, rows };
    },

    /**
     * Generate ASCII progress bar
     */
    generateProgressBar(current, max, width = 16, filledChar = '█', emptyChar = '░') {
        const percentage = Math.max(0, Math.min(1, current / max));
        const filled = Math.floor(percentage * width);
        const empty = width - filled;
        return filledChar.repeat(filled) + emptyChar.repeat(empty);
    },

    /**
     * Pad string to specific length
     */
    padString(str, length, padChar = ' ') {
        if (!str) str = '';
        return str.length > length ? str.substring(0, length) : str.padEnd(length, padChar);
    },

    /**
     * Pad number to specific length
     */
    padNumber(num, length) {
        return num.toString().padStart(length, '0');
    },

    /**
     * Generate skill stars based on level
     */
    generateSkillStars(level, maxStars = 5) {
        const stars = Math.floor(level / 20); // 0-5 stars for levels 0-100
        const filledStars = Math.min(stars, maxStars);
        const emptyStars = maxStars - filledStars;
        return '★'.repeat(filledStars) + '☆'.repeat(emptyStars);
    },

    /**
     * Create DOM element with properties
     */
    createElement(tag, properties = {}, textContent = '') {
        const element = document.createElement(tag);
        
        Object.entries(properties).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });
        
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    },

    /**
     * Debounce function calls
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Game state utilities
const GameUtils = {
    /**
     * Calculate AP cost for action
     */
    getActionAPCost(actionType) {
        const apCosts = {
            move: 0,
            basic_attack: 0,
            defend: 0,
            rest: 0,
            power_strike: 2,
            fireball: 3,
            heal: 2,
            whirlwind: 5,
            meteor: 6,
            teleport: 4,
            shield_wall: 2,
            lightning: 4,
            time_stop: 8
        };
        return apCosts[actionType] || 0;
    },

    /**
     * Check if player has enough AP for action
     */
    canAffordAction(currentAP, actionType) {
        const cost = this.getActionAPCost(actionType);
        return currentAP >= cost;
    },

    /**
     * Generate unique player ID
     */
    generatePlayerId(prefix = 'player') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}_${timestamp}_${random}`;
    },

    /**
     * Validate coordinate
     */
    isValidCoordinate(x, y, gridWidth, gridHeight) {
        return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
    },

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX, screenY, cameraX, cameraY) {
        return {
            x: screenX + cameraX,
            y: screenY + cameraY
        };
    },

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX, worldY, cameraX, cameraY) {
        return {
            x: worldX - cameraX,
            y: worldY - cameraY
        };
    },

    /**
     * Calculate initiative roll
     */
    rollInitiative(skillLevel) {
        const d20 = Math.floor(Math.random() * 20) + 1;
        const skillBonus = Math.floor(skillLevel / 4);
        return d20 + skillBonus;
    },

    /**
     * Format time as MM:SS
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
};

// Color utilities for terminal UI
const ColorUtils = {
    /**
     * Get color based on health percentage
     */
    getHealthColor(current, max) {
        const percentage = current / max;
        if (percentage < 0.25) return '#ff0000'; // Red
        if (percentage < 0.5) return '#ffff00';  // Yellow
        return '#00ff00'; // Green
    },

    /**
     * Get AP bar color
     */
    getAPColor() {
        return '#00ffff'; // Cyan
    },

    /**
     * Get terrain color
     */
    getTerrainColor(terrainType) {
        return GAME_CONSTANTS.COLORS[terrainType.toUpperCase()] || GAME_CONSTANTS.COLORS.FLOOR;
    },

    /**
     * Create colored span for HTML
     */
    colorSpan(text, color) {
        return `<span style="color: ${color};">${text}</span>`;
    },

    /**
     * Interpolate between two colors
     */
    interpolateColor(color1, color2, factor) {
        // Simple RGB interpolation
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        if (!c1 || !c2) return color1;
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        
        return this.rgbToHex(r, g, b);
    },

    /**
     * Convert hex color to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * Convert RGB to hex
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
};

// Validation utilities
const ValidationUtils = {
    /**
     * Validate message format
     */
    isValidMessage(message) {
        return message && 
               typeof message === 'object' && 
               typeof message.type === 'string' &&
               message.type.length > 0;
    },

    /**
     * Validate position object
     */
    isValidPosition(position) {
        return position && 
               typeof position === 'object' &&
               typeof position.x === 'number' &&
               typeof position.y === 'number' &&
               !isNaN(position.x) &&
               !isNaN(position.y);
    },

    /**
     * Validate player data
     */
    isValidPlayerData(player) {
        return player &&
               typeof player === 'object' &&
               typeof player.id === 'string' &&
               this.isValidPosition(player.position) &&
               typeof player.health === 'number' &&
               typeof player.maxHealth === 'number';
    },

    /**
     * Sanitize string input
     */
    sanitizeString(input, maxLength = 100) {
        if (typeof input !== 'string') return '';
        
        return input
            .trim()
            .substring(0, maxLength)
            .replace(/[<>'"&]/g, ''); // Basic XSS protection
    },

    /**
     * Validate numeric range
     */
    clampNumber(value, min = 0, max = Infinity) {
        return Math.max(min, Math.min(max, value));
    }
};

// Performance utilities
const PerformanceUtils = {
    /**
     * Simple performance timer
     */
    timer() {
        const start = performance.now();
        return {
            end() {
                return performance.now() - start;
            }
        };
    },

    /**
     * Request animation frame with fallback
     */
    requestAnimationFrame(callback) {
        return (window.requestAnimationFrame || 
                window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame || 
                function(callback) { setTimeout(callback, 16); })(callback);
    },

    /**
     * Cancel animation frame with fallback
     */
    cancelAnimationFrame(id) {
        return (window.cancelAnimationFrame || 
                window.webkitCancelAnimationFrame || 
                window.mozCancelAnimationFrame || 
                clearTimeout)(id);
    },

    /**
     * Chunk processing for large arrays
     */
    processInChunks(array, chunkSize, processor, callback) {
        let index = 0;
        
        const processChunk = () => {
            const chunk = array.slice(index, index + chunkSize);
            if (chunk.length === 0) {
                if (callback) callback();
                return;
            }
            
            processor(chunk);
            index += chunkSize;
            
            // Use setTimeout to avoid blocking the main thread
            setTimeout(processChunk, 0);
        };
        
        processChunk();
    }
};

// Make utilities available globally
window.GAME_CONSTANTS = GAME_CONSTANTS;
window.PositionUtils = PositionUtils;
window.UIUtils = UIUtils;
window.GameUtils = GameUtils;
window.ColorUtils = ColorUtils;
window.ValidationUtils = ValidationUtils;
window.PerformanceUtils = PerformanceUtils;