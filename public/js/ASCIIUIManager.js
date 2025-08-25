// ASCII UI Manager - Terminal-style UI system for game interface
class ASCIIUIManager {
    constructor(container) {
        this.container = container;
        this.panels = {};
        this.messageHistory = [];
        
        // Terminal colors
        this.colors = {
            border: '#008000',
            player: '#ffff00',
            health: '#ff0000',
            healthLow: '#ffff00',
            healthFull: '#00ff00',
            ap: '#00ffff',
            available: '#ffffff',
            unavailable: '#808080',
            enemy: '#ff0000',
            ally: '#00ff00',
            item: '#ff00ff'
        };
        
        this.initializePanels();
        this.setupAccessibility();
    }
    
    initializePanels() {
        // Create panel structure
        this.container.innerHTML = `
            <div id="ascii-player-stats" class="ascii-panel"></div>
            <div id="ascii-turn-order" class="ascii-panel"></div>
            <div id="ascii-action-menu" class="ascii-panel"></div>
            <div id="ascii-inventory" class="ascii-panel"></div>
            <div id="ascii-messages" class="ascii-panel"></div>
            <div id="sr-announcer" style="position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;" aria-live="polite" aria-atomic="true"></div>
        `;
        
        // Get panel references
        this.panels = {
            stats: document.getElementById('ascii-player-stats'),
            turnOrder: document.getElementById('ascii-turn-order'),
            actions: document.getElementById('ascii-action-menu'),
            inventory: document.getElementById('ascii-inventory'),
            messages: document.getElementById('ascii-messages')
        };
        
        this.announcer = document.getElementById('sr-announcer');
        
        // Apply styling
        Object.values(this.panels).forEach(panel => {
            panel.style.fontFamily = '"Courier New", "Lucida Console", monospace';
            panel.style.fontSize = '11px';
            panel.style.lineHeight = '1.1';
            panel.style.color = '#00ff41';
            panel.style.backgroundColor = '#000000';
            panel.style.whiteSpace = 'pre';
            panel.style.margin = '0';
            panel.style.padding = '0';
            panel.style.border = 'none';
        });
    }
    
    // Progress bar generation
    generateHealthBar(current, max, width = 16) {
        const percentage = Math.max(0, Math.min(1, current / max));
        const filled = Math.floor(percentage * width);
        const empty = width - filled;
        
        let color = this.colors.healthFull;
        if (percentage < 0.25) color = this.colors.health;
        else if (percentage < 0.5) color = this.colors.healthLow;
        
        return `<span style="color: ${color};">${'█'.repeat(filled)}${'░'.repeat(empty)}</span>`;
    }
    
    generateAPBar(current, max = 8, width = 12) {
        const filled = Math.floor((current / max) * width);
        const empty = width - filled;
        return `<span style="color: ${this.colors.ap};">${'█'.repeat(filled)}${'░'.repeat(empty)}</span>`;
    }
    
    generateSkillStars(level) {
        const stars = Math.floor(level / 20); // 0-5 stars for levels 0-100
        return '★'.repeat(Math.min(stars, 5)) + '☆'.repeat(Math.max(5 - stars, 0));
    }
    
    generateAPCostBar(cost, maxAP = 8) {
        const bars = Math.floor((cost / maxAP) * 4);
        return '▒'.repeat(bars) + '░'.repeat(4 - bars);
    }
    
    // Utility functions
    padString(str, length) {
        if (!str) str = '';
        return str.length > length ? str.substring(0, length) : str.padEnd(length);
    }
    
    padNumber(num, length) {
        return num.toString().padStart(length);
    }
    
    // Update player stats panel
    updatePlayerStats(player) {
        const healthBar = this.generateHealthBar(player.health, player.maxHealth);
        const apBar = this.generateAPBar(player.currentAP, player.maxAP || 8);
        
        const statsHTML = `<span style="color: ${this.colors.border};">┌──────────────────────────────────────┐
│             PLAYER STATS             │
├──────────────────────────────────────┤</span>
│ Name: <span style="color: ${this.colors.player};">${this.padString(player.name, 20)}</span> │
│ HP: ${this.padNumber(player.health, 3)}/${this.padNumber(player.maxHealth, 3)} ${healthBar} │
│ AP: ${this.padNumber(player.currentAP, 3)}/${player.maxAP || 8}   ${apBar} │
│ Move: ${player.movement?.remainingMovement || 3}/${player.movement?.maxMovement || 3}   ${'▶'.repeat(player.movement?.remainingMovement || 3).padEnd(3)} │
│ Pos: (${this.padNumber(player.position?.x || 0, 2)},${this.padNumber(player.position?.y || 0, 2)})        Turn: ${this.padNumber(1, 3)} │
<span style="color: ${this.colors.border};">├──────────────────────────────────────┤</span>
│ Combat:     ${this.padNumber(player.skills?.combat || 85, 3)} ${this.generateSkillStars(player.skills?.combat || 85)} │
│ Swords:     ${this.padNumber(player.skills?.swords || 92, 3)} ${this.generateSkillStars(player.skills?.swords || 92)} │
│ Fire Mag:   ${this.padNumber(player.skills?.fire_magic || 67, 3)} ${this.generateSkillStars(player.skills?.fire_magic || 67)} │
│ Healing:    ${this.padNumber(player.skills?.healing_magic || 34, 3)} ${this.generateSkillStars(player.skills?.healing_magic || 34)} │
<span style="color: ${this.colors.border};">├──────────────────────────────────────┤</span>
│ <span style="color: ${this.colors.item};">Wpn: ${this.padString(player.equipment?.weapon?.name || 'Steel Sword', 25)}</span> │
│ <span style="color: ${this.colors.item};">Arm: ${this.padString(player.equipment?.armor?.name || 'Leather Armor', 25)}</span> │
│ Ini: +4   Def: 15   Speed: 30ft     │
<span style="color: ${this.colors.border};">└──────────────────────────────────────┘</span>`;
        
        this.panels.stats.innerHTML = statsHTML;
        
        // Announce critical changes
        if (player.health / player.maxHealth < 0.25) {
            this.announce(`Warning: ${player.name} health critical at ${player.health}`, 'assertive');
        }
    }
    
    // Update turn order panel
    updateTurnOrder(turnOrder, currentPlayer) {
        const maxEntries = 6;
        const entries = turnOrder.slice(0, maxEntries);
        
        const entryLines = entries.map(entry => {
            const isMe = entry.playerId === currentPlayer;
            const isCurrent = entry.playerId === currentPlayer;
            const healthBar = this.generateHealthBar(entry.health || 100, entry.maxHealth || 100, 5);
            
            const indicator = isCurrent ? `<span style="color: ${this.colors.player};">►</span>` : ' ';
            const name = isMe ? `<span style="color: ${this.colors.player};">${this.padString(entry.playerName || entry.playerId, 8)}</span>` : this.padString(entry.playerName || entry.playerId, 8);
            const initiative = `[${this.padNumber(entry.initiative || 15, 2)}]`;
            const apIndicator = '●●●'.slice(0, Math.min(3, Math.floor((entry.currentAP || 4) / 3))) + '○○○'.slice(0, 3 - Math.min(3, Math.floor((entry.currentAP || 4) / 3)));
            
            return `│ ${indicator} ${name} ${initiative} ${apIndicator} AP:${entry.currentAP || 4} HP:${healthBar} │`;
        }).join('\n');
        
        const turnOrderHTML = `<span style="color: ${this.colors.border};">┌──────────────────────────────────────┐
│           TURN ORDER                 │
├──────────────────────────────────────┤</span>
${entryLines}
<span style="color: ${this.colors.border};">├──────────────────────────────────────┤</span>
│ Round: 01    Phase: Actions          │
│ Time: 30s <span style="color: ${this.colors.healthFull};">███████████████</span> │
<span style="color: ${this.colors.border};">└──────────────────────────────────────┘</span>`;
        
        this.panels.turnOrder.innerHTML = turnOrderHTML;
    }
    
    // Update action menu panel
    updateActionMenu(currentAP) {
        const actions = [
            { key: 'M', name: 'Move', cost: 0, desc: 'Free' },
            { key: 'A', name: 'Attack', cost: 2, desc: this.generateAPCostBar(2) },
            { key: 'D', name: 'Defend', cost: 1, desc: this.generateAPCostBar(1) },
            { key: 'C', name: 'Cast Spell', cost: 3, desc: '[3-6 AP]' },
            { key: 'R', name: 'Rest/End Turn', cost: 0, desc: 'Free' }
        ];
        
        const abilities = [
            { key: '1', name: 'Flame Strike', cost: 4 },
            { key: '2', name: 'Multi-Attack', cost: 5 },
            { key: '3', name: 'Heal Wounds', cost: 3 },
            { key: '4', name: 'Shield Wall', cost: 2 },
            { key: '5', name: 'Fire Ball', cost: 6 },
            { key: '6', name: 'Ice Bolt', cost: 3 },
            { key: '7', name: 'Lightning', cost: 4 },
            { key: '8', name: 'Teleport', cost: 5 },
            { key: '9', name: 'Time Stop', cost: 8 }
        ];
        
        const actionLines = actions.map(action => {
            const available = currentAP >= action.cost;
            const color = available ? this.colors.available : this.colors.unavailable;
            return `│ <span style="color: ${color};">[${action.key}] ${this.padString(action.name, 14)} [${action.cost} AP] ${action.desc}</span> │`;
        }).join('\n');
        
        const abilityLines = abilities.map(ability => {
            const available = currentAP >= ability.cost;
            const color = available ? this.colors.available : this.colors.unavailable;
            const costBar = this.generateAPCostBar(ability.cost);
            return `│ <span style="color: ${color};">[${ability.key}] ${this.padString(ability.name, 14)} [${ability.cost} AP] ${costBar}</span> │`;
        }).join('\n');
        
        const actionHTML = `<span style="color: ${this.colors.border};">┌──────────────────────────────────────┐
│             ACTIONS                  │
├──────────────────────────────────────┤</span>
${actionLines}
│ ──────────────────────────────────── │
│ ABILITIES:                           │
${abilityLines}
│ ──────────────────────────────────── │
│ <span style="color: ${this.colors.ap};">COMBO Available: [F] Flame Burst</span>    │
│ Partners: Available                  │
<span style="color: ${this.colors.border};">└──────────────────────────────────────┘</span>`;
        
        this.panels.actions.innerHTML = actionHTML;
    }
    
    // Update inventory panel
    updateInventory() {
        const inventoryHTML = `<span style="color: ${this.colors.border};">┌──────────────────────────────────────┐
│            INVENTORY                 │
├──────────────────────────────────────┤</span>
│ <span style="color: ${this.colors.item};">[Q] Health Potion x3    (Instant)</span>   │
│ <span style="color: ${this.colors.item};">[W] Mana Draught x1     (Instant)</span>   │
│ <span style="color: ${this.colors.item};">[E] Smoke Bomb x2       (1 AP)</span>      │
│ <span style="color: ${this.colors.item};">[T] Rope (50ft)         (Free)</span>      │
│ <span style="color: ${this.colors.item};">[Y] Thieves' Tools      (varies)</span>     │
│ ──────────────────────────────────── │
│ Gold: 347    Weight: 28/45 kg       │
<span style="color: ${this.colors.border};">└──────────────────────────────────────┘</span>`;
        
        this.panels.inventory.innerHTML = inventoryHTML;
    }
    
    // Update messages panel
    updateMessages(messages) {
        this.messageHistory = [...messages];
        const recentMessages = this.messageHistory.slice(-8);
        
        while (recentMessages.length < 8) {
            recentMessages.unshift('');
        }
        
        const messageLines = recentMessages.map(msg => {
            const displayMsg = msg ? `> ${msg}` : '';
            return `│ ${this.padString(displayMsg, 36)} │`;
        }).join('\n');
        
        const messagesHTML = `<span style="color: ${this.colors.border};">┌──────────────────────────────────────┐
│            MESSAGE LOG               │
├──────────────────────────────────────┤</span>
${messageLines}
<span style="color: ${this.colors.border};">└──────────────────────────────────────┘</span>`;
        
        this.panels.messages.innerHTML = messagesHTML;
    }
    
    // Accessibility support
    announce(message, priority = 'polite') {
        if (this.announcer) {
            this.announcer.setAttribute('aria-live', priority);
            this.announcer.textContent = message;
        }
    }
    
    setupAccessibility() {
        // Make panels focusable for keyboard navigation
        Object.values(this.panels).forEach((panel, index) => {
            panel.tabIndex = 0;
            panel.setAttribute('role', 'region');
            panel.setAttribute('aria-label', `Game panel ${index + 1}`);
        });
        
        // Set up keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
                const panelIndex = parseInt(e.key) - 1;
                const panelNames = ['stats', 'turnOrder', 'actions', 'inventory', 'messages'];
                const panel = this.panels[panelNames[panelIndex]];
                if (panel) {
                    panel.focus();
                    this.announce(`Focused on ${panelNames[panelIndex]} panel`);
                }
                e.preventDefault();
            }
        });
        
        // Initialize inventory panel
        this.updateInventory();
    }
}

// Make available globally
window.ASCIIUIManager = ASCIIUIManager;