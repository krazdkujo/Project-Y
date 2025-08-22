// AP System Core Types
export type PlayerId = string;
export type EntityId = string;
export type RoomId = string;

// Position and targeting
export interface Position {
  x: number;
  y: number;
}

// Free Actions (0 AP cost, immediate execution)
export interface FreeAction {
  type: 'MOVE' | 'BASIC_ATTACK' | 'BASIC_DEFENSE';
  playerId: PlayerId;
  target?: Position | EntityId;
  immediate: true;
  timestamp: number;
}

// AP Actions (1-8 AP cost)
export interface APAction {
  type: 'AP_ABILITY';
  playerId: PlayerId;
  abilityId: string;
  target?: Position | EntityId;
  apCost: number;
  timestamp: number;
}

// Action Results
export interface ActionResult {
  success: boolean;
  reason?: string;
  effects?: ActionEffect[];
  apSpent?: number;
  timestamp: number;
}

export interface ActionEffect {
  type: 'damage' | 'heal' | 'move' | 'status' | 'formation_bonus';
  target: EntityId;
  value: number;
  duration?: number;
}

// Player State
export interface Player {
  id: PlayerId;
  name: string;
  position: Position;
  health: number;
  maxHealth: number;
  currentAP: number;
  skills: SkillSet;
  equipment: Equipment;
  status: PlayerStatus;
}

export interface SkillSet {
  combat: number;
  swords: number;
  fire_magic: number;
  healing_magic: number;
  arcane_magic: number;
  // Additional skills from the 34-skill system
  [skillName: string]: number;
}

export interface Equipment {
  weapon?: {
    name: string;
    damage: string;
    initiative: number;
  };
  armor?: {
    name: string;
    defense: number;
  };
}

export type PlayerStatus = 'ready' | 'waiting' | 'acting' | 'disconnected';

// Turn Management
export interface InitiativeEntry {
  playerId: PlayerId;
  initiative: number;
  ready: boolean;
}

export interface TurnState {
  currentTurnIndex: number;
  turnOrder: InitiativeEntry[];
  turnStartTime: number;
  turnTimeLimit: number; // milliseconds
  phase: 'initiative' | 'actions' | 'resolution';
}

// AP Abilities
export interface APAbility {
  id: string;
  name: string;
  apCost: number;
  skillRequirement: SkillRequirement;
  effect: AbilityEffect;
  cooldown?: number;
  range?: number;
}

export interface SkillRequirement {
  skill: string;
  level: number;
}

export interface AbilityEffect {
  type: 'damage_multiplier' | 'area_damage' | 'heal' | 'multi_target_attack' | 'delayed_area_damage' | 'revive_ally' | 'extra_turns' | 'area_heal';
  value?: number;
  damage?: string; // dice notation like "2d6+2"
  amount?: string; // healing amount in dice notation
  radius?: number;
  targets?: string;
  delay_turns?: number;
  health_percentage?: number;
  range?: number;
  turns?: number;
  restrictions?: string[];
  damage_multiplier?: number;
}

// Formation and Coordination
export interface FormationBonus {
  type: 'protection' | 'accuracy' | 'damage' | 'ap_generation';
  value: number;
  requirements: FormationRequirement[];
}

export interface FormationRequirement {
  type: 'adjacent_back_line' | 'adjacent_melee' | 'front_line' | 'coordinated_attack';
  count: number;
}

// Combo System
export interface ComboAbility {
  id: string;
  name: string;
  participants: ParticipantRequirement[];
  totalAPCost: number;
  coordinatedEffect: AbilityEffect;
}

export interface ParticipantRequirement {
  role: 'leader' | 'supporter';
  skillRequirement: SkillRequirement;
  positionRequirement?: 'adjacent' | 'range_2' | 'any';
}

export interface ComboAttempt {
  comboId: string;
  leaderId: PlayerId;
  participants: PlayerId[];
  requiredParticipants: number;
  timeoutTurn: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

// Game Session
export interface GameSession {
  roomId: RoomId;
  players: Map<PlayerId, Player>;
  turnManager: TurnState;
  apManager: APManagerState;
  startTime: number;
  status: 'waiting' | 'active' | 'paused' | 'completed';
}

export interface APManagerState {
  playerAP: Map<PlayerId, number>;
  maxAP: number;
  apPerTurn: number;
  lastAPUpdate: number;
}

// Messages and Communication
export interface GameMessage {
  type: 'TURN_START' | 'TURN_END' | 'ACTION_RESULT' | 'AP_UPDATE' | 'INITIATIVE_ORDER' | 'GAME_STATE' | 'GAME_STARTED' | 'PLAYER_READY' | 'PLAYER_DISCONNECTED' | 'ERROR' | 'TACTICAL_SIGNAL' | 'HEARTBEAT';
  data: any;
  timestamp: number;
  recipients?: PlayerId[];
}

export interface TacticalSignal {
  type: 'target_priority' | 'formation_change' | 'retreat' | 'advance';
  sender: PlayerId;
  data: any;
  urgent: boolean;
  timestamp: number;
}

// Performance and Monitoring
export interface PerformanceMetrics {
  currentTurn: number;
  averageTurn: number;
  maxTurn: number;
  target: number;
  status: 'GOOD' | 'NEEDS_OPTIMIZATION';
}

export interface TestResult {
  scenario: string;
  passed: boolean;
  metrics: PerformanceMetrics;
  errors?: string[];
}