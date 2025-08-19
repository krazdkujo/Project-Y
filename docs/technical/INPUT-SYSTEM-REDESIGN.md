# Input System Redesign: Arrow Keys + Numpad

**Document Version**: 1.0  
**Date**: 2025-08-19  
**Status**: Technical Specification  
**Maintained By**: Development-Manager Agent

---

## Input Philosophy

**Accessibility First** - Arrow keys and numpad are universally familiar
**Real-Time Buffering** - Handle key spam by using last command before tick
**Context-Sensitive** - Same keys perform different actions based on game state
**Consistent Mapping** - Logical key assignments that work across all scenarios

---

## Core Input Layout

### Movement Controls
```yaml
Arrow_Keys: Primary movement (all users familiar)
  ↑ (Up Arrow):    Move North
  ↓ (Down Arrow):  Move South  
  ← (Left Arrow):  Move West
  → (Right Arrow): Move East

Numpad: Extended movement with diagonals
  8: Move North
  2: Move South
  4: Move West  
  6: Move East
  7: Move Northwest
  9: Move Northeast
  1: Move Southwest
  3: Move Southeast
  5: Wait/Rest in place

Shift + Movement: Running (2 squares, +25% noise)
  Shift + ↑: Run North
  Shift + Numpad: Run in any direction
  
Ctrl + Movement: Careful movement (silent, costs 2 ticks)
  Ctrl + ↑: Sneak North
  Ctrl + Numpad: Sneak in any direction
```

### Combat Controls
```yaml
Spacebar: Basic attack (context-sensitive)
  - With melee weapon: Attack adjacent enemy
  - With ranged weapon: Shoot at targeted enemy
  - Unarmed: Punch/kick attack

Enter: Block/Defend stance
  - With shield: Active blocking
  - With weapon: Parry stance
  - Continuous action (0 ticks per turn)

Tab: Target next enemy
  - Cycles through visible enemies
  - Shows target highlighting
  - Required for ranged attacks

Shift + Spacebar: Power attack
  - Higher damage, longer tick cost
  - Uses more stamina/mana
  - Specific to weapon type
```

### Action Keys
```yaml
Primary_Actions:
  E: Use/Interact
    - Open/close doors
    - Pick up items
    - Activate switches
    - Examine objects
  
  I: Inventory management
    - Opens inventory screen
    - Drag and drop items
    - Equipment management
  
  C: Character sheet
    - Skills and abilities display
    - Equipment status
    - Health/mana information
  
  M: Map display
    - Show explored areas
    - Mark important locations
    - Party member positions

Secondary_Actions:
  R: Reload/Ready
    - Reload crossbow
    - Prepare spell components
    - Ready special ammunition
  
  T: Talk/Chat
    - Open chat interface
    - Send messages to party
    - Communicate with NPCs
  
  L: Look/Examine
    - Detailed examination mode
    - Cursor for targeting
    - Information about objects
  
  H: Help/Commands
    - Display available commands
    - Show keybinding reference
    - Context-sensitive help
```

### Function Keys
```yaml
Magic_and_Abilities:
  F1-F12: Quick-cast spells and abilities
    - Customizable by player
    - Shows ability name and tick cost
    - Grayed out if requirements not met
    - Can assign any learned ability
  
  Alt + F1-F12: Secondary ability bar
    - Additional 12 slots
    - For advanced players with many abilities
    - Same functionality as primary bar

Utility_Functions:
  F: Search current location
    - Look for hidden objects
    - Detect traps
    - Find secret doors
    - Takes 3 ticks to complete
  
  G: Get/Grab items
    - Pick up items from ground
    - Auto-select most valuable
    - Requires inventory space
  
  D: Drop item
    - Quick-drop selected item
    - Opens drop menu for multiple items
    - Items fall to current position
```

---

## Input Processing Architecture

### Command Buffer System
```typescript
interface InputManager {
  private keyBuffer: Map<PlayerId, KeyCommand>
  private keyTimestamp: Map<PlayerId, number>
  private contextState: Map<PlayerId, InputContext>
  
  handleKeyPress(playerId: PlayerId, key: KeyCode, modifiers: KeyModifiers): void
  processBufferedInputs(): Map<PlayerId, GameCommand>
  updateContext(playerId: PlayerId, newContext: InputContext): void
}

enum InputContext {
  EXPLORATION,    // Normal movement and interaction
  COMBAT,         // Fighting enemies
  INVENTORY,      // Managing items
  SPELLCASTING,   // Targeting spells
  DIALOGUE,       // Talking to NPCs
  MENU            // In game menus
}

interface KeyCommand {
  key: KeyCode
  modifiers: KeyModifiers
  context: InputContext
  timestamp: number
}
```

### Key Mapping System
```typescript
class KeyMapper {
  private static readonly DEFAULT_BINDINGS = {
    // Movement
    'ArrowUp': 'MOVE_NORTH',
    'ArrowDown': 'MOVE_SOUTH', 
    'ArrowLeft': 'MOVE_WEST',
    'ArrowRight': 'MOVE_EAST',
    'Numpad8': 'MOVE_NORTH',
    'Numpad2': 'MOVE_SOUTH',
    'Numpad4': 'MOVE_WEST',
    'Numpad6': 'MOVE_EAST',
    'Numpad7': 'MOVE_NORTHWEST',
    'Numpad9': 'MOVE_NORTHEAST',
    'Numpad1': 'MOVE_SOUTHWEST',
    'Numpad3': 'MOVE_SOUTHEAST',
    'Numpad5': 'WAIT',
    
    // Combat
    'Space': 'BASIC_ATTACK',
    'Enter': 'BLOCK_DEFEND',
    'Tab': 'TARGET_NEXT',
    
    // Actions
    'KeyE': 'USE_INTERACT',
    'KeyI': 'INVENTORY',
    'KeyC': 'CHARACTER_SHEET',
    'KeyM': 'MAP',
    'KeyR': 'RELOAD_READY',
    'KeyT': 'TALK_CHAT',
    'KeyL': 'LOOK_EXAMINE',
    'KeyH': 'HELP',
    'KeyF': 'SEARCH',
    'KeyG': 'GET_ITEMS',
    'KeyD': 'DROP_ITEM',
    
    // Function keys
    'F1': 'QUICK_ABILITY_1',
    'F2': 'QUICK_ABILITY_2',
    // ... F3-F12
  }
  
  translateKey(key: KeyCode, modifiers: KeyModifiers, context: InputContext): GameCommand | null {
    // Handle modifier combinations
    if (modifiers.shift && this.isMovementKey(key)) {
      return this.createRunCommand(key)
    }
    
    if (modifiers.ctrl && this.isMovementKey(key)) {
      return this.createSneakCommand(key)
    }
    
    // Context-sensitive commands
    const baseCommand = DEFAULT_BINDINGS[key]
    if (!baseCommand) return null
    
    return this.contextualizeCommand(baseCommand, context)
  }
  
  private contextualizeCommand(command: string, context: InputContext): GameCommand {
    switch (context) {
      case InputContext.COMBAT:
        return this.adaptForCombat(command)
      case InputContext.SPELLCASTING:
        return this.adaptForSpellcasting(command)
      default:
        return this.createBaseCommand(command)
    }
  }
}
```

### Context-Sensitive Behavior
```typescript
class ContextManager {
  determineContext(player: Player, gameState: GameState): InputContext {
    // Check if player is in combat
    if (this.isInCombat(player, gameState)) {
      return InputContext.COMBAT
    }
    
    // Check if player is casting a spell
    if (this.isCastingSpell(player)) {
      return InputContext.SPELLCASTING
    }
    
    // Check if player has inventory open
    if (player.uiState.inventoryOpen) {
      return InputContext.INVENTORY
    }
    
    // Check if player is in dialogue
    if (player.uiState.inDialogue) {
      return InputContext.DIALOGUE
    }
    
    // Default to exploration
    return InputContext.EXPLORATION
  }
  
  private isInCombat(player: Player, gameState: GameState): boolean {
    // Player is in combat if:
    // - Enemies are visible and hostile
    // - Player has attacked recently
    // - Player is being attacked
    const nearbyEnemies = this.findNearbyEnemies(player.position, gameState)
    return nearbyEnemies.length > 0 && nearbyEnemies.some(e => e.isHostile)
  }
}
```

---

## Command Processing Pipeline

### Input Validation
```typescript
class InputValidator {
  validateCommand(command: GameCommand, player: Player, gameState: GameState): ValidationResult {
    // Check if player can act
    if (!this.canPlayerAct(player)) {
      return { valid: false, reason: 'PLAYER_CANNOT_ACT' }
    }
    
    // Validate specific command types
    switch (command.type) {
      case 'MOVE':
        return this.validateMovement(command as MoveCommand, player, gameState)
      case 'ATTACK':
        return this.validateAttack(command as AttackCommand, player, gameState)
      case 'CAST_SPELL':
        return this.validateSpell(command as SpellCommand, player)
      case 'USE_ABILITY':
        return this.validateAbility(command as AbilityCommand, player)
      default:
        return { valid: true }
    }
  }
  
  private validateMovement(command: MoveCommand, player: Player, gameState: GameState): ValidationResult {
    const targetPos = this.calculateTargetPosition(player.position, command.direction)
    
    // Check bounds
    if (!gameState.map.isValidPosition(targetPos)) {
      return { valid: false, reason: 'OUT_OF_BOUNDS' }
    }
    
    // Check for obstacles
    if (gameState.map.isBlocked(targetPos)) {
      return { valid: false, reason: 'POSITION_BLOCKED' }
    }
    
    // Check for other players (if not allowed)
    if (this.isPositionOccupied(targetPos, gameState)) {
      return { valid: false, reason: 'POSITION_OCCUPIED' }
    }
    
    return { valid: true }
  }
}
```

### Command to Action Translation
```typescript
class CommandProcessor {
  translateToAction(command: GameCommand, player: Player): Action | null {
    switch (command.type) {
      case 'MOVE':
        return this.createMoveAction(command as MoveCommand, player)
      case 'BASIC_ATTACK':
        return this.createAttackAction(player)
      case 'USE_ABILITY':
        return this.createAbilityAction(command as AbilityCommand, player)
      case 'CAST_SPELL':
        return this.createSpellAction(command as SpellCommand, player)
      default:
        return null
    }
  }
  
  private createMoveAction(command: MoveCommand, player: Player): MoveAction {
    const tickCost = command.modifiers.running ? 1 : 
                    command.modifiers.sneaking ? 2 : 1
    
    return {
      type: 'MOVE',
      direction: command.direction,
      tickCost: tickCost,
      playerId: player.id,
      modifiers: command.modifiers
    }
  }
  
  private createAttackAction(player: Player): AttackAction | null {
    const weapon = player.equipment.mainHand
    if (!weapon) {
      return {
        type: 'UNARMED_ATTACK',
        tickCost: 1,
        playerId: player.id
      }
    }
    
    const skillLevel = player.skills[weapon.requiredSkill] || 0
    const tickCost = this.calculateAttackTicks(weapon, skillLevel)
    
    return {
      type: 'WEAPON_ATTACK',
      weapon: weapon.id,
      tickCost: tickCost,
      playerId: player.id
    }
  }
}
```

---

## UI Integration

### Key Display System
```typescript
interface KeyPromptDisplay {
  showAvailableCommands(context: InputContext, player: Player): void
  highlightUsableKeys(): void
  showTickCosts(): void
  updateContextHelp(newContext: InputContext): void
}

class UIKeyHelper {
  displayContextualHelp(context: InputContext): string {
    switch (context) {
      case InputContext.EXPLORATION:
        return `
        Movement: Arrow Keys / Numpad
        Interact: E    Search: F    Inventory: I
        Character: C   Map: M       Help: H
        `
      
      case InputContext.COMBAT:
        return `
        Move: Arrow Keys    Attack: Space    Block: Enter
        Target: Tab         Abilities: F1-F12
        Run: Shift+Move     Power Attack: Shift+Space
        `
      
      case InputContext.SPELLCASTING:
        return `
        Target: Arrow Keys  Cast: Space      Cancel: Esc
        Change Spell: F1-F12               Look: L
        `
      
      default:
        return "Press H for help"
    }
  }
  
  showAbilityKeys(player: Player): void {
    // Display F1-F12 with assigned abilities
    // Show tick costs and resource requirements
    // Gray out unavailable abilities
    for (let i = 1; i <= 12; i++) {
      const ability = player.quickbar[`F${i}`]
      if (ability) {
        this.displayAbilitySlot(i, ability, player.canUseAbility(ability))
      }
    }
  }
}
```

### Accessibility Features
```yaml
Visual_Feedback:
  - Key presses show visual confirmation
  - Invalid commands show error messages
  - Available actions highlighted in UI
  - Tick costs displayed for all actions

Audio_Feedback:
  - Different sounds for different action types
  - Audio confirmation for successful actions
  - Warning sounds for invalid actions
  - Combat audio cues for timing

Customization:
  - Key remapping for personal preference
  - Color-blind friendly indicators
  - Font size adjustment for key displays
  - High contrast mode for better visibility
```

This input system provides intuitive, accessible controls while supporting the full complexity of the combat and ability systems. The familiar arrow key and numpad layout ensures new players can jump in immediately while providing the depth needed for advanced gameplay.