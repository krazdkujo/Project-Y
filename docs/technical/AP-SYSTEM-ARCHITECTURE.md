# Refined AP System Architecture: Turn-Based Tactical Coordination

**Document Version**: 2.0 (Complete AP System Overhaul)  
**Date**: 2025-08-22  
**Status**: Technical Specification  
**Maintained By**: Development-Manager Agent

---

## System Overview

**Turn-Based Coordination** - All players act within 5-10 second turns with initiative order
**Free Basic Actions** - Movement, basic attacks, and defense cost no AP and execute immediately
**AP Special Abilities** - Strategic abilities cost 1-8 AP with enhanced effects
**Initiative System** - Turn order based on skills and equipment for tactical positioning
**8-Player Lobbies** - Each lobby runs independent turn processing on Hathora server
**Quality Gate Integration** - Checkpoints at weeks 2, 4, and 6 for system validation

---

## Core AP Architecture

### Turn-Based Timing System
```typescript
interface APSystem {
  readonly TURN_DURATION_MS: 8000  // 5-10 seconds per turn (8s default)
  readonly MAX_PLAYERS: 8
  readonly AP_PER_TURN: 3          // Players gain 2-3 AP per turn
  
  private turnCounter: number
  private gameState: GameState
  private actionQueue: Map<PlayerId, QueuedAction[]>
  private initiativeOrder: PlayerId[]
  private turnTimer: NodeJS.Timeout
  
  startTurn(): void
  processTurn(): void
  queueAction(playerId: PlayerId, action: Action): void
  broadcastState(): void
}
```

### Action Classification System
```typescript
interface ActionCost {
  apCost: number
  executionTiming: 'immediate' | 'turn_end' | 'next_turn'
  interruptible: boolean
  requiresInitiative: boolean
}

enum ActionType {
  // Free Basic Actions (0 AP, immediate)
  MOVE = 'move',
  BASIC_ATTACK = 'basic_attack', 
  DEFEND = 'defend',
  INTERACT = 'interact',
  
  // Low AP Abilities (1-2 AP)
  POWER_ATTACK = 'power_attack',
  PRECISE_STRIKE = 'precise_strike',
  QUICK_SPELL = 'quick_spell',
  
  // Medium AP Abilities (3-5 AP)
  COMBO_ATTACK = 'combo_attack',
  AREA_SPELL = 'area_spell',
  TACTICAL_MANEUVER = 'tactical_maneuver',
  
  // High AP Abilities (6-8 AP)
  ULTIMATE_ATTACK = 'ultimate_attack',
  MASTER_SPELL = 'master_spell',
  GROUP_COORDINATION = 'group_coordination'
}

class ActionCostCalculator {
  private actionCosts: Map<ActionType, ActionCost> = new Map([
    [ActionType.MOVE, { apCost: 0, executionTiming: 'immediate', interruptible: true, requiresInitiative: false }],
    [ActionType.BASIC_ATTACK, { apCost: 0, executionTiming: 'immediate', interruptible: false, requiresInitiative: false }],
    [ActionType.DEFEND, { apCost: 0, executionTiming: 'immediate', interruptible: true, requiresInitiative: false }],
    [ActionType.POWER_ATTACK, { apCost: 2, executionTiming: 'turn_end', interruptible: false, requiresInitiative: true }],
    [ActionType.COMBO_ATTACK, { apCost: 4, executionTiming: 'turn_end', interruptible: false, requiresInitiative: true }],
    [ActionType.ULTIMATE_ATTACK, { apCost: 7, executionTiming: 'next_turn', interruptible: false, requiresInitiative: true }]
  ])
  
  getActionCost(actionType: ActionType, player: Player): ActionCost {
    const baseCost = this.actionCosts.get(actionType)
    // Apply skill-based cost reductions
    const skillReduction = this.calculateSkillReduction(actionType, player)
    const equipmentReduction = this.calculateEquipmentReduction(actionType, player)
    
    return {
      ...baseCost,
      apCost: Math.max(0, baseCost.apCost - skillReduction - equipmentReduction)
    }
  }
}
```

### Initiative & Turn Order System
```typescript
interface InitiativeCalculator {
  calculateInitiative(player: Player): number {
    const baseInitiative = 10
    const skillBonus = Math.floor(player.skills.athletics / 3) + Math.floor(player.skills.perception / 4)
    const equipmentPenalty = this.calculateArmorPenalty(player.equipment.armor)
    const randomFactor = Math.floor(Math.random() * 6) + 1 // 1d6
    
    return baseInitiative + skillBonus - equipmentPenalty + randomFactor
  }
  
  private calculateArmorPenalty(armor: ArmorItem): number {
    switch (armor.type) {
      case 'light': return 0
      case 'medium': return 2
      case 'heavy': return 4
      default: return 0
    }
  }
}

class TurnOrderManager {
  private initiativeOrder: Array<{playerId: PlayerId, initiative: number}> = []
  private currentPlayerIndex: number = 0
  
  calculateTurnOrder(players: Map<PlayerId, Player>): void {
    this.initiativeOrder = Array.from(players.entries())
      .map(([id, player]) => ({
        playerId: id,
        initiative: this.initiativeCalculator.calculateInitiative(player)
      }))
      .sort((a, b) => b.initiative - a.initiative) // Highest first
  }
  
  getCurrentPlayer(): PlayerId {
    return this.initiativeOrder[this.currentPlayerIndex].playerId
  }
  
  advanceToNextPlayer(): PlayerId {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.initiativeOrder.length
    return this.getCurrentPlayer()
  }
}
```

---

## AP Accumulation & Management

### AP Generation System
```typescript
interface APManager {
  private playerAP: Map<PlayerId, number> = new Map()
  private maxAP: Map<PlayerId, number> = new Map()
  
  generateAP(playerId: PlayerId, player: Player): void {
    const baseAPGain = 2
    const skillBonus = Math.floor(player.skills.leadership / 20) // 0-5 bonus AP
    const equipmentBonus = this.calculateEquipmentAPBonus(player.equipment)
    const situationalBonus = this.calculateSituationalBonus(player)
    
    const totalGain = Math.min(
      baseAPGain + skillBonus + equipmentBonus + situationalBonus,
      this.getMaxAPGain(player)
    )
    
    this.addAP(playerId, totalGain)
  }
  
  private calculateSituationalBonus(player: Player): number {
    let bonus = 0
    
    // Bonus for being in tactical formation
    if (this.isInFormation(player)) bonus += 1
    
    // Bonus for protecting weaker allies
    if (this.isProtectingAllies(player)) bonus += 1
    
    // Bonus for successful coordination last turn
    if (this.hadSuccessfulCoordination(player)) bonus += 1
    
    return bonus
  }
  
  spendAP(playerId: PlayerId, amount: number): boolean {
    const current = this.playerAP.get(playerId) || 0
    if (current >= amount) {
      this.playerAP.set(playerId, current - amount)
      return true
    }
    return false
  }
  
  getCurrentAP(playerId: PlayerId): number {
    return this.playerAP.get(playerId) || 0
  }
}
```

### AP Ability Integration
```typescript
interface APAbility {
  id: string
  name: string
  apCost: number
  skillRequirements: Map<SkillType, number>
  equipmentRequirements?: EquipmentType[]
  executionTime: 'immediate' | 'turn_end' | 'next_turn'
  canCombine: boolean
  effects: AbilityEffect[]
}

class APAbilitySystem {
  private abilities: Map<string, APAbility> = new Map()
  
  constructor() {
    this.loadAbilitiesFromConfig()
  }
  
  getAvailableAbilities(player: Player): APAbility[] {
    return Array.from(this.abilities.values())
      .filter(ability => this.canPlayerUseAbility(player, ability))
  }
  
  private canPlayerUseAbility(player: Player, ability: APAbility): boolean {
    // Check skill requirements
    for (const [skill, requiredLevel] of ability.skillRequirements) {
      if (player.skills[skill] < requiredLevel) return false
    }
    
    // Check equipment requirements
    if (ability.equipmentRequirements) {
      for (const reqEquip of ability.equipmentRequirements) {
        if (!this.hasRequiredEquipment(player, reqEquip)) return false
      }
    }
    
    // Check AP availability
    const currentAP = this.apManager.getCurrentAP(player.id)
    if (currentAP < ability.apCost) return false
    
    return true
  }
  
  executeAbility(playerId: PlayerId, abilityId: string, targets: Target[]): AbilityResult {
    const ability = this.abilities.get(abilityId)
    const player = this.gameState.getPlayer(playerId)
    
    if (!this.canPlayerUseAbility(player, ability)) {
      return { success: false, reason: 'REQUIREMENTS_NOT_MET' }
    }
    
    // Spend AP
    if (!this.apManager.spendAP(playerId, ability.apCost)) {
      return { success: false, reason: 'INSUFFICIENT_AP' }
    }
    
    // Execute ability effects
    const results = ability.effects.map(effect => 
      this.executeAbilityEffect(effect, player, targets)
    )
    
    return {
      success: true,
      effects: results,
      apSpent: ability.apCost,
      executionTime: ability.executionTime
    }
  }
}
```

---

## Turn Processing Pipeline

### Turn Resolution Flow
```typescript
class TurnProcessor {
  processTurn(): void {
    console.log(`Processing turn ${this.turnCounter} for ${this.currentLobby.size} players`)
    
    // 1. Generate AP for all players
    this.generateAPForAllPlayers()
    
    // 2. Process immediate free actions
    this.processImmediateActions()
    
    // 3. Queue AP abilities for resolution
    this.queueAPAbilities()
    
    // 4. Resolve all AP abilities by initiative order
    this.resolveAPAbilitiesByInitiative()
    
    // 5. Update game state
    this.updateGameState()
    
    // 6. Check for end-of-turn effects
    this.processEndOfTurnEffects()
    
    // 7. Broadcast new state to all players
    this.broadcastState()
    
    // 8. Advance turn counter and schedule next turn
    this.turnCounter++
    this.scheduleNextTurn()
  }
  
  private processImmediateActions(): void {
    const immediateActions = this.actionQueue.getActionsByTiming('immediate')
    
    // Free actions execute immediately and simultaneously
    for (const action of immediateActions) {
      this.executeImmediateAction(action)
    }
  }
  
  private resolveAPAbilitiesByInitiative(): void {
    const apActions = this.actionQueue.getActionsByTiming('turn_end')
    
    // Sort by initiative order for consistent resolution
    apActions.sort((a, b) => {
      const aInitiative = this.turnOrder.getInitiative(a.playerId)
      const bInitiative = this.turnOrder.getInitiative(b.playerId)
      return bInitiative - aInitiative
    })
    
    for (const action of apActions) {
      this.executeAPAbility(action)
    }
  }
}
```

### Free Action Processing
```typescript
interface FreeActionProcessor {
  processMovement(playerId: PlayerId, direction: Direction): MovementResult {
    const player = this.gameState.getPlayer(playerId)
    const newPosition = this.calculateNewPosition(player.position, direction)
    
    // Validate movement
    if (!this.isValidPosition(newPosition)) {
      return { success: false, reason: 'INVALID_POSITION' }
    }
    
    if (this.isPositionOccupied(newPosition)) {
      return { success: false, reason: 'POSITION_OCCUPIED' }
    }
    
    // Execute movement immediately
    player.position = newPosition
    this.gameState.updatePlayerPosition(playerId, newPosition)
    
    return {
      success: true,
      newPosition: newPosition,
      movementCost: 0 // Free action
    }
  }
  
  processBasicAttack(playerId: PlayerId, targetId: EntityId): AttackResult {
    const attacker = this.gameState.getPlayer(playerId)
    const target = this.gameState.getEntity(targetId)
    
    // Validate attack
    if (!this.isInMeleeRange(attacker.position, target.position)) {
      return { success: false, reason: 'OUT_OF_RANGE' }
    }
    
    // Calculate basic attack (skills + equipment only)
    const hitChance = this.calculateHitChance(attacker, target)
    const damage = this.calculateBasicDamage(attacker)
    
    const roll = Math.random() * 100
    if (roll <= hitChance) {
      target.health -= damage
      return {
        success: true,
        damage: damage,
        critical: roll <= attacker.equipment.weapon.criticalChance,
        apCost: 0 // Free action
      }
    }
    
    return { success: false, reason: 'ATTACK_MISSED', apCost: 0 }
  }
}
```

---

## 8-Player Coordination Systems

### Group Communication
```typescript
interface GroupCoordinationManager {
  private activeCoordinations: Map<string, GroupCoordination> = new Map()
  
  initiateGroupCoordination(initiator: PlayerId, coordinationType: CoordinationType, participants: PlayerId[]): string {
    const coordination = {
      id: this.generateCoordinationId(),
      initiator: initiator,
      participants: participants,
      type: coordinationType,
      status: 'proposed',
      apContribution: new Map<PlayerId, number>(),
      turnDeadline: this.turnCounter + 2 // 2 turns to execute
    }
    
    this.activeCoordinations.set(coordination.id, coordination)
    
    // Notify all participants
    for (const participantId of participants) {
      this.notifyPlayer(participantId, {
        type: 'COORDINATION_PROPOSAL',
        coordination: coordination
      })
    }
    
    return coordination.id
  }
  
  contributeToCoordination(playerId: PlayerId, coordinationId: string, apContribution: number): boolean {
    const coordination = this.activeCoordinations.get(coordinationId)
    if (!coordination || !coordination.participants.includes(playerId)) {
      return false
    }
    
    if (this.apManager.getCurrentAP(playerId) < apContribution) {
      return false
    }
    
    coordination.apContribution.set(playerId, apContribution)
    
    // Check if coordination is ready
    if (this.isCoordinationReady(coordination)) {
      this.executeGroupCoordination(coordination)
    }
    
    return true
  }
  
  private executeGroupCoordination(coordination: GroupCoordination): void {
    const totalAP = Array.from(coordination.apContribution.values())
      .reduce((sum, ap) => sum + ap, 0)
    
    // More participants and AP = stronger effect
    const coordinationPower = totalAP * coordination.participants.length
    
    switch (coordination.type) {
      case 'COMBINED_ATTACK':
        this.executeCombinedAttack(coordination, coordinationPower)
        break
      case 'TACTICAL_FORMATION':
        this.executeTacticalFormation(coordination, coordinationPower)
        break
      case 'GROUP_DEFENSE':
        this.executeGroupDefense(coordination, coordinationPower)
        break
      case 'SYNCHRONIZED_ABILITIES':
        this.executeSynchronizedAbilities(coordination, coordinationPower)
        break
    }
    
    // Deduct AP from all participants
    for (const [playerId, apCost] of coordination.apContribution) {
      this.apManager.spendAP(playerId, apCost)
    }
  }
}
```

### Tactical Formation System
```typescript
interface FormationManager {
  private activeFormations: Map<string, Formation> = new Map()
  
  createFormation(leader: PlayerId, formationType: FormationType, members: PlayerId[]): Formation {
    const formation = {
      id: this.generateFormationId(),
      leader: leader,
      members: members,
      type: formationType,
      positions: this.calculateFormationPositions(formationType, members.length),
      bonuses: this.getFormationBonuses(formationType),
      apUpkeep: this.calculateAPUpkeep(formationType, members.length)
    }
    
    this.activeFormations.set(formation.id, formation)
    return formation
  }
  
  private getFormationBonuses(formationType: FormationType): FormationBonuses {
    switch (formationType) {
      case 'PHALANX':
        return {
          meleeDefense: +3,
          rangedDefense: -1,
          moveSpeed: -1,
          groupInitiative: +2
        }
      case 'SKIRMISH_LINE':
        return {
          rangedAccuracy: +2,
          meleeDefense: -1,
          moveSpeed: +1,
          spreadFormation: true
        }
      case 'WEDGE':
        return {
          chargeBonus: +4,
          meleeAttack: +2,
          vulnerability: -2,
          breakthrough: true
        }
      case 'CIRCLE':
        return {
          allAroundDefense: +3,
          magicalDefense: +2,
          moveSpeed: -2,
          noBlindSpots: true
        }
    }
  }
  
  maintainFormation(formationId: string): boolean {
    const formation = this.activeFormations.get(formationId)
    if (!formation) return false
    
    // Check if all members can afford upkeep
    const canAffordUpkeep = formation.members.every(memberId => 
      this.apManager.getCurrentAP(memberId) >= formation.apUpkeep
    )
    
    if (!canAffordUpkeep) {
      this.disbandFormation(formationId)
      return false
    }
    
    // Deduct upkeep AP
    formation.members.forEach(memberId => {
      this.apManager.spendAP(memberId, formation.apUpkeep)
    })
    
    return true
  }
}
```

---

## State Synchronization for 8 Players

### Optimized State Management
```typescript
interface GameState {
  turn: number
  players: Map<PlayerId, Player>
  npcs: Map<EntityId, NPC>
  map: DungeonMap
  items: Map<ItemId, Item>
  effects: ActiveEffect[]
  formations: Map<string, Formation>
  coordinations: Map<string, GroupCoordination>
}

class StateManager {
  private currentState: GameState
  private stateHistory: GameState[] = []
  
  updateState(actions: ResolvedAction[]): void {
    // Create new state based on action results
    const newState = this.cloneState(this.currentState)
    
    // Apply all action results in initiative order
    const sortedActions = this.sortActionsByInitiative(actions)
    for (const result of sortedActions) {
      this.applyActionResult(result, newState)
    }
    
    // Update AP for all players
    this.updatePlayerAP(newState)
    
    // Update formations and coordinations
    this.updateGroupSystems(newState)
    
    // Store state history for rollback if needed
    this.stateHistory.push(this.currentState)
    if (this.stateHistory.length > 5) {
      this.stateHistory.shift() // Keep only recent history
    }
    
    this.currentState = newState
  }
  
  broadcastState(): void {
    // Send personalized state to each player
    for (const playerId of this.currentState.players.keys()) {
      const playerView = this.createPlayerView(this.currentState, playerId)
      this.networkManager.sendToPlayer(playerId, playerView)
    }
  }
  
  private createPlayerView(state: GameState, playerId: PlayerId): PlayerViewState {
    const player = state.players.get(playerId)
    return {
      turn: state.turn,
      currentAP: this.apManager.getCurrentAP(playerId),
      maxAP: this.apManager.getMaxAP(playerId),
      availableAbilities: this.abilitySystem.getAvailableAbilities(player),
      visibleArea: this.calculateVisibleArea(player.position, player.skills.perception),
      playerStatus: player,
      visibleEntities: this.getVisibleEntities(player),
      activeFormations: this.getPlayerFormations(playerId),
      pendingCoordinations: this.getPendingCoordinations(playerId),
      turnOrder: this.turnOrder.getCurrentOrder(),
      turnTimeRemaining: this.getTurnTimeRemaining()
    }
  }
}
```

### Hathora Integration for 8-Player Lobbies
```typescript
class HathoraAPNetworkManager {
  private connections: Map<PlayerId, WebSocket> = new Map()
  private lobbyId: string
  private maxPlayers: number = 8
  
  constructor(lobbyId: string) {
    this.lobbyId = lobbyId
  }
  
  sendToPlayer(playerId: PlayerId, data: PlayerViewState): void {
    const connection = this.connections.get(playerId)
    if (connection && connection.readyState === WebSocket.OPEN) {
      const message = {
        type: 'STATE_UPDATE',
        turn: data.turn,
        lobbyId: this.lobbyId,
        data: data
      }
      connection.send(JSON.stringify(message))
    }
  }
  
  broadcastTurnStart(turnData: TurnStartData): void {
    const message = {
      type: 'TURN_START',
      lobbyId: this.lobbyId,
      turnNumber: turnData.turnNumber,
      currentPlayer: turnData.currentPlayer,
      turnDuration: turnData.turnDuration,
      turnOrder: turnData.turnOrder,
      timestamp: Date.now()
    }
    
    this.broadcastToLobby(message)
  }
  
  handlePlayerAction(playerId: PlayerId, action: Action): void {
    // Validate action timing and AP costs
    if (this.isValidActionTiming(action)) {
      if (action.apCost === 0) {
        // Free action - execute immediately
        this.apSystem.executeImmediateAction(playerId, action)
      } else {
        // AP ability - queue for turn resolution
        this.apSystem.queueAPAction(playerId, action)
      }
    }
  }
  
  // Handle 8-player lobby lifecycle
  addPlayerConnection(playerId: PlayerId, socket: WebSocket): void {
    if (this.connections.size >= this.maxPlayers) {
      socket.close(1013, 'Lobby full')
      return
    }
    
    this.connections.set(playerId, socket)
    
    // Send lobby sync data to new player
    socket.send(JSON.stringify({
      type: 'LOBBY_SYNC',
      lobbyId: this.lobbyId,
      currentTurn: this.apSystem.currentTurn,
      playerCount: this.connections.size,
      maxPlayers: this.maxPlayers,
      gameState: this.getCurrentState()
    }))
    
    // If lobby is now full, start the game
    if (this.connections.size === this.maxPlayers) {
      this.startGame()
    }
  }
  
  private startGame(): void {
    this.apSystem.initializeGame(Array.from(this.connections.keys()))
    this.broadcastToLobby({
      type: 'GAME_START',
      lobbyId: this.lobbyId,
      players: Array.from(this.connections.keys())
    })
  }
}
```

---

## Performance Optimization for 8-Player Coordination

### Efficient Turn Processing
```typescript
class PerformanceOptimizer {
  // Cache frequently calculated values
  private initiativeCache = new Map<PlayerId, number>()
  private abilityCache = new Map<PlayerId, APAbility[]>()
  
  optimizeCalculations(): void {
    // Pre-calculate initiative for all players
    this.precalculateInitiative()
    
    // Cache available abilities for each player
    this.precalculateAvailableAbilities()
    
    // Optimize formation calculations
    this.optimizeFormationProcessing()
  }
  
  private precalculateInitiative(): void {
    for (const [playerId, player] of this.gameState.players) {
      const initiative = this.initiativeCalculator.calculateInitiative(player)
      this.initiativeCache.set(playerId, initiative)
    }
  }
  
  // Batch process actions for efficiency
  batchProcessActions(actions: QueuedAction[]): void {
    // Group actions by type for batch processing
    const actionsByType = this.groupActionsByType(actions)
    
    // Process all movement actions together
    if (actionsByType.movement.length > 0) {
      this.batchProcessMovement(actionsByType.movement)
    }
    
    // Process all attacks together
    if (actionsByType.attacks.length > 0) {
      this.batchProcessAttacks(actionsByType.attacks)
    }
    
    // Process all AP abilities together
    if (actionsByType.abilities.length > 0) {
      this.batchProcessAbilities(actionsByType.abilities)
    }
  }
  
  // Network optimization for 8 players
  optimizeNetworkUpdates(): void {
    // Send only delta updates instead of full state
    // Prioritize updates based on proximity to players
    // Compress large state updates
    // Use message batching for non-critical updates
  }
}
```

### Scalability Considerations
```yaml
Memory_Management:
  - Limit state history to last 5 turns (8-player coordination requires recent history)
  - Clear old cached calculations every 10 turns
  - Use object pooling for frequently created 8-player action objects

Network_Optimization:
  - Send only changed state data per player view
  - Compress formation and coordination updates
  - Prioritize immediate actions over queued AP abilities
  - Use delta compression for 8-player state synchronization

CPU_Optimization:
  - Pre-calculate initiative and ability availability
  - Use lookup tables for AP cost calculations
  - Batch similar 8-player operations together
  - Optimize formation bonus calculations

Turn_Processing_Targets:
  - Turn resolution: <500ms for 8 players
  - Free action execution: <50ms immediate response
  - AP ability queueing: <100ms validation and queue
  - State synchronization: <200ms for all 8 players
```

This AP system architecture provides the foundation for smooth turn-based 8-player tactical gameplay while maintaining the balance between immediate free actions and strategic AP abilities. The system supports the full complexity of the 34-skill system and enables meaningful group coordination through formations, coordinations, and initiative-based turn resolution.