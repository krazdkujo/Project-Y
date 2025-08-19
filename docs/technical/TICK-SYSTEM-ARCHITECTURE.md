# Real-Time Tick System Architecture

**Document Version**: 1.0  
**Date**: 2025-08-19  
**Status**: Technical Specification  
**Maintained By**: Development-Manager Agent

---

## System Overview

**Real-Time Coordination** - All players and NPCs act simultaneously every 2 seconds
**Variable Action Costs** - Different actions consume different numbers of ticks
**Input Buffering** - Handle key spam by using last command entered before tick
**Deterministic Execution** - Ensure consistent results across all clients
**Scalable Architecture** - Support 1-8 players with identical performance

---

## Core Tick Architecture

### Tick Timing System
```typescript
interface TickSystem {
  readonly TICK_INTERVAL_MS: 2000  // 2 seconds per tick
  readonly MAX_PLAYERS: 8
  
  private tickCounter: number
  private gameState: GameState
  private actionQueue: Map<PlayerId, QueuedAction[]>
  private tickTimer: NodeJS.Timeout
  
  startTick(): void
  processTick(): void
  queueAction(playerId: PlayerId, action: Action): void
  broadcastState(): void
}
```

### Action Queue Management
```typescript
interface QueuedAction {
  playerId: PlayerId
  action: Action
  ticksRemaining: number
  startTick: number
  priority: ActionPriority
  canInterrupt: boolean
}

enum ActionPriority {
  EMERGENCY = 0,    // Instant actions like dropping items
  DEFENSIVE = 1,    // Blocking, dodging
  MOVEMENT = 2,     // Position changes
  BASIC_ATTACK = 3, // Standard weapon attacks
  ABILITIES = 4,    // Special abilities
  MAGIC = 5,        // Spell casting
  UTILITY = 6       // Non-combat actions
}

class ActionQueue {
  private actions: Map<PlayerId, QueuedAction[]> = new Map()
  
  addAction(playerId: PlayerId, action: Action): boolean {
    // Validate action is legal for current player state
    // Check if action can interrupt current action
    // Add to queue with appropriate tick cost
  }
  
  getReadyActions(currentTick: number): QueuedAction[] {
    // Return all actions that complete this tick
    // Sort by priority for consistent resolution order
  }
  
  updateProgress(): void {
    // Decrement ticks remaining for all queued actions
    // Remove completed actions
  }
}
```

### Input Handling System
```typescript
interface InputBuffer {
  private lastCommand: Map<PlayerId, Command>
  private commandTimestamp: Map<PlayerId, number>
  
  bufferCommand(playerId: PlayerId, command: Command): void {
    // Store most recent command from each player
    // Overwrite previous buffered command (handles key spam)
    this.lastCommand.set(playerId, command)
    this.commandTimestamp.set(playerId, Date.now())
  }
  
  flushCommands(): Map<PlayerId, Command> {
    // Return all buffered commands at tick boundary
    // Clear buffer for next tick
    const commands = new Map(this.lastCommand)
    this.lastCommand.clear()
    return commands
  }
}
```

---

## Action Resolution Pipeline

### Tick Processing Flow
```typescript
class TickProcessor {
  processTick(): void {
    console.log(`Processing tick ${this.tickCounter}`)
    
    // 1. Collect new player inputs
    const newCommands = this.inputBuffer.flushCommands()
    this.processNewCommands(newCommands)
    
    // 2. Update action progress
    this.actionQueue.updateProgress()
    
    // 3. Execute completed actions
    const readyActions = this.actionQueue.getReadyActions(this.tickCounter)
    this.executeActions(readyActions)
    
    // 4. Update game state
    this.updateGameState()
    
    // 5. Broadcast to all clients
    this.broadcastState()
    
    // 6. Schedule next tick
    this.tickCounter++
    this.scheduleNextTick()
  }
  
  private processNewCommands(commands: Map<PlayerId, Command>): void {
    for (const [playerId, command] of commands) {
      const action = this.commandToAction(command, playerId)
      if (this.validateAction(action, playerId)) {
        this.actionQueue.addAction(playerId, action)
      }
    }
  }
  
  private executeActions(actions: QueuedAction[]): void {
    // Sort by priority to ensure consistent execution order
    actions.sort((a, b) => a.priority - b.priority)
    
    for (const queuedAction of actions) {
      this.executeAction(queuedAction)
    }
  }
}
```

### Action Validation System
```typescript
class ActionValidator {
  validateAction(action: Action, playerId: PlayerId): boolean {
    const player = this.gameState.getPlayer(playerId)
    
    // Check if player can perform this action
    if (!this.canPlayerAct(player)) return false
    
    // Check action-specific requirements
    switch (action.type) {
      case 'MOVE':
        return this.validateMovement(action, player)
      case 'ATTACK':
        return this.validateAttack(action, player)
      case 'CAST_SPELL':
        return this.validateSpellCast(action, player)
      case 'USE_ABILITY':
        return this.validateAbility(action, player)
      default:
        return false
    }
  }
  
  private validateAttack(action: AttackAction, player: Player): boolean {
    // Check if target is in range
    // Check if player has appropriate weapon
    // Check if player has required skills
    // Check if action can interrupt current action
    return this.isTargetInRange(action.target, player) &&
           this.hasRequiredWeapon(action.attackType, player) &&
           this.hasRequiredSkills(action.attackType, player)
  }
}
```

---

## Combat Action Implementation

### Weapon Attack Processing
```typescript
interface AttackAction extends Action {
  type: 'ATTACK'
  attackType: 'BASIC' | 'POWER' | 'PRECISE' | 'COMBO'
  target: Position | EntityId
  weaponUsed: ItemId
  tickCost: number
}

class CombatProcessor {
  executeAttack(action: AttackAction, attacker: Player): AttackResult {
    const weapon = attacker.equipment.weapon
    const target = this.findTarget(action.target)
    
    if (!target) return { type: 'MISS', reason: 'NO_TARGET' }
    
    // Calculate hit chance using skill + equipment formula
    const hitChance = this.calculateHitChance(attacker, weapon, target)
    const roll = Math.random() * 100
    
    if (roll > hitChance) {
      return { type: 'MISS', reason: 'ATTACK_MISSED' }
    }
    
    // Calculate damage
    const damage = this.calculateDamage(attacker, weapon, action.attackType)
    const finalDamage = this.applyDefenses(damage, target)
    
    // Apply damage and effects
    target.health -= finalDamage
    this.checkForStatusEffects(action, attacker, target)
    
    return {
      type: 'HIT',
      damage: finalDamage,
      critical: roll <= weapon.criticalChance,
      target: target.id
    }
  }
  
  private calculateHitChance(attacker: Player, weapon: Weapon, target: Entity): number {
    const baseHit = 50
    const weaponAccuracy = weapon.accuracy
    const skillBonus = Math.floor(attacker.skills[weapon.skillType] / 2)
    const situationalMods = this.getSituationalModifiers(attacker, target)
    
    return baseHit + weaponAccuracy + skillBonus + situationalMods
  }
}
```

### Magic Casting System
```typescript
interface SpellAction extends Action {
  type: 'CAST_SPELL'
  spellId: string
  target?: Position | EntityId
  tickCost: number
  manaCost: number
}

class SpellProcessor {
  executeCastSpell(action: SpellAction, caster: Player): SpellResult {
    const spell = this.spellDatabase.getSpell(action.spellId)
    
    // Check mana requirements
    if (caster.mana < action.manaCost) {
      return { type: 'FAILED', reason: 'INSUFFICIENT_MANA' }
    }
    
    // Consume mana
    caster.mana -= action.manaCost
    
    // Apply spell effects
    switch (spell.type) {
      case 'DAMAGE':
        return this.castDamageSpell(spell, action.target, caster)
      case 'HEALING':
        return this.castHealingSpell(spell, action.target, caster)
      case 'BUFF':
        return this.castBuffSpell(spell, action.target, caster)
      case 'AREA':
        return this.castAreaSpell(spell, action.target, caster)
    }
  }
  
  private castDamageSpell(spell: Spell, target: Position | EntityId, caster: Player): SpellResult {
    const targetEntity = this.findTarget(target)
    if (!targetEntity) return { type: 'FAILED', reason: 'NO_TARGET' }
    
    // Calculate spell damage based on caster's magic skills
    const baseDamage = spell.baseDamage
    const skillBonus = Math.floor(caster.skills[spell.school] / 4)
    const staffBonus = caster.equipment.weapon?.type === 'STAFF' ? 
                      Math.floor(caster.skills.staves / 5) : 0
    
    const totalDamage = baseDamage + skillBonus + staffBonus
    targetEntity.health -= totalDamage
    
    return {
      type: 'SUCCESS',
      damage: totalDamage,
      target: targetEntity.id
    }
  }
}
```

---

## State Synchronization

### Game State Management
```typescript
interface GameState {
  tick: number
  players: Map<PlayerId, Player>
  npcs: Map<EntityId, NPC>
  map: DungeonMap
  items: Map<ItemId, Item>
  effects: ActiveEffect[]
}

class StateManager {
  private currentState: GameState
  private stateHistory: GameState[] = []
  
  updateState(actions: ResolvedAction[]): void {
    // Create new state based on action results
    const newState = this.cloneState(this.currentState)
    
    // Apply all action results
    for (const result of actions) {
      this.applyActionResult(result, newState)
    }
    
    // Update environmental effects
    this.updateEnvironmentalEffects(newState)
    
    // Store state history for rollback if needed
    this.stateHistory.push(this.currentState)
    if (this.stateHistory.length > 10) {
      this.stateHistory.shift()
    }
    
    this.currentState = newState
  }
  
  broadcastState(): void {
    const stateUpdate = this.createStateUpdate()
    
    // Send personalized state to each player
    for (const playerId of this.currentState.players.keys()) {
      const playerView = this.createPlayerView(stateUpdate, playerId)
      this.networkManager.sendToPlayer(playerId, playerView)
    }
  }
  
  private createPlayerView(state: GameState, playerId: PlayerId): PlayerViewState {
    const player = state.players.get(playerId)
    return {
      tick: state.tick,
      visibleArea: this.calculateVisibleArea(player.position, player.skills.perception),
      playerStatus: player,
      visibleEntities: this.getVisibleEntities(player),
      actionFeedback: this.getActionFeedback(playerId),
      uiState: this.calculateUIState(player)
    }
  }
}
```

### Network Synchronization
```typescript
class NetworkManager {
  private connections: Map<PlayerId, WebSocket> = new Map()
  
  sendToPlayer(playerId: PlayerId, data: PlayerViewState): void {
    const connection = this.connections.get(playerId)
    if (connection && connection.readyState === WebSocket.OPEN) {
      const message = {
        type: 'STATE_UPDATE',
        tick: data.tick,
        data: data
      }
      connection.send(JSON.stringify(message))
    }
  }
  
  broadcastToAll(message: any): void {
    for (const [playerId, connection] of this.connections) {
      if (connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(message))
      }
    }
  }
  
  handlePlayerInput(playerId: PlayerId, command: Command): void {
    // Add command to input buffer
    this.tickSystem.inputBuffer.bufferCommand(playerId, command)
  }
}
```

---

## Performance Optimization

### Efficient Action Processing
```typescript
class PerformanceOptimizer {
  // Cache frequently calculated values
  private hitChanceCache = new Map<string, number>()
  private skillBonusCache = new Map<PlayerId, Map<string, number>>()
  
  optimizeCalculations(): void {
    // Pre-calculate commonly used values at state changes
    this.precalculateHitChances()
    this.precalculateSkillBonuses()
    this.optimizePathfinding()
  }
  
  private precalculateHitChances(): void {
    // Calculate hit chances for common weapon/skill combinations
    // Cache results to avoid repeated calculations during combat
  }
  
  // Batch similar operations for efficiency
  batchProcessActions(actions: QueuedAction[]): void {
    // Group actions by type for batch processing
    const actionsByType = this.groupActionsByType(actions)
    
    // Process movement actions together
    if (actionsByType.movement.length > 0) {
      this.batchProcessMovement(actionsByType.movement)
    }
    
    // Process attacks together
    if (actionsByType.attacks.length > 0) {
      this.batchProcessAttacks(actionsByType.attacks)
    }
  }
}
```

### Scalability Considerations
```yaml
Memory_Management:
  - Limit state history to last 10 ticks
  - Clear old cached calculations periodically
  - Use object pooling for frequently created objects

Network_Optimization:
  - Send only changed state data, not full state
  - Compress large state updates
  - Prioritize critical updates over cosmetic ones

CPU_Optimization:
  - Pre-calculate static values during initialization
  - Use lookup tables for common calculations
  - Batch similar operations together
  - Avoid unnecessary deep object cloning
```

This tick system architecture provides the foundation for smooth real-time gameplay while maintaining deterministic results and supporting the full complexity of the skill and combat systems.