/**
 * World and Town Type Definitions
 * Inspired by Infinigen's procedural generation patterns and H3 spatial indexing
 */

// === SPATIAL TYPES (H3-inspired) ===
export interface HexCoordinate {
  q: number; // axial coordinate q
  r: number; // axial coordinate r
  s?: number; // optional third coordinate (q + r + s = 0)
}

export interface WorldPosition {
  hex: HexCoordinate;
  worldX: number;
  worldY: number;
  elevation: number;
}

// === BIOME SYSTEM (Infinigen-inspired) ===
export enum LegacyBiomeType {
  TEMPERATE_FOREST = 'temperate_forest',
  MOUNTAIN = 'mountain', 
  DESERT = 'desert',
  SWAMP = 'swamp',
  TUNDRA = 'tundra',
  COASTAL = 'coastal',
  VOLCANIC = 'volcanic'
}

// Biome types used by OverworldGenerator
export type BiomeType = 'forest' | 'mountains' | 'desert' | 'swamp' | 'plains' | 'jungle' | 'savanna' | 'snow_peaks';

// Biome data structure used by OverworldGenerator
export interface Biome {
  coordinate: HexCoordinate;
  type: BiomeType;
  elevation: number;
  moisture: number;
  temperature: number;
  resources: string[];
  encounters: string[];
  movementCost: number;
  visualChar: string;
  color: string;
}

// World location for towns, dungeons, landmarks
export interface WorldLocation {
  id: string;
  coordinate: HexCoordinate;
  type: 'town' | 'dungeon' | 'landmark';
  name: string;
  biome: BiomeType;
  discoveryRadius: number;
  isDiscovered: boolean;
  services?: string[];
  dungeonDepth?: number;
  difficulty?: number;
}

// Overworld configuration
export interface OverworldConfig {
  worldRadius: number;
  townCount: number;
  dungeonCount: number;
  minTownDistance: number;
  minDungeonDistance: number;
}

export interface BiomeProperties {
  type: LegacyBiomeType;
  temperature: number; // -1 to 1
  humidity: number; // 0 to 1
  elevation: number; // 0 to 1
  fertility: number; // 0 to 1 (affects resource generation)
  dangerLevel: number; // 0 to 1
  encounterFrequency: number; // encounters per hex
}

// === OVERWORLD SYSTEM ===
export interface OverworldHex {
  coordinate: HexCoordinate;
  biome: BiomeProperties;
  discovered: boolean;
  visibilityRange: number; // how far this hex can "see"
  
  // Location types
  settlement?: SettlementData;
  dungeon?: DungeonEntrance;
  landmark?: LandmarkData;
  resource?: ResourceNode;
  
  // Travel properties
  movementCost: number; // base movement cost
  roadConnections: HexCoordinate[]; // connected hexes via roads
  
  // Encounter data
  lastEncounterCheck: number;
  encounterSeed: string;
}

export interface DungeonEntrance {
  id: string;
  name: string;
  type: 'ruins' | 'cave' | 'tower' | 'crypt' | 'stronghold';
  recommendedLevel: number;
  maxPartySize: number;
  discovered: boolean;
  completed: boolean;
}

export interface LandmarkData {
  id: string;
  name: string;
  description: string;
  type: 'monument' | 'natural_wonder' | 'ancient_site' | 'battlefield';
  discoveryBonus: {
    experience: number;
    reputation?: number;
    lore?: string[];
  };
}

export interface ResourceNode {
  id: string;
  type: 'mine' | 'quarry' | 'forest' | 'magical_spring';
  resources: Record<string, number>; // resource type -> quantity
  regenerationRate: number; // per game day
  controlledBy?: string; // settlement ID that controls this
}

// === TOWN SYSTEM (EconML-inspired economic modeling) ===
export enum TownType {
  MEDIEVAL = 'medieval',
  DESERT_OASIS = 'desert_oasis', 
  MOUNTAIN_HOLD = 'mountain_hold',
  PORT_CITY = 'port_city',
  MAGICAL_ACADEMY = 'magical_academy'
}

export interface TownTheme {
  type: TownType;
  architecture: string[];
  commonBuildings: BuildingType[];
  specialBuildings: BuildingType[];
  culturalTraits: string[];
  economicFocus: EconomicSector[];
}

export enum BuildingType {
  // Basic services
  INN = 'inn',
  TAVERN = 'tavern', 
  GENERAL_STORE = 'general_store',
  BLACKSMITH = 'blacksmith',
  TEMPLE = 'temple',
  
  // Specialized shops
  MAGIC_SHOP = 'magic_shop',
  ALCHEMY_SHOP = 'alchemy_shop',
  WEAPON_SHOP = 'weapon_shop',
  ARMOR_SHOP = 'armor_shop',
  BOOKSTORE = 'bookstore',
  
  // Services
  BANK = 'bank',
  GUILD_HALL = 'guild_hall',
  TRAINING_GROUND = 'training_ground',
  STABLE = 'stable',
  DOCKS = 'docks',
  
  // Production
  WORKSHOP = 'workshop',
  BREWERY = 'brewery',
  MILL = 'mill',
  MINE_OFFICE = 'mine_office'
}

export enum EconomicSector {
  AGRICULTURE = 'agriculture',
  MINING = 'mining',
  CRAFTING = 'crafting',
  TRADE = 'trade',
  MAGIC = 'magic',
  MILITARY = 'military',
  RELIGION = 'religion',
  SEAFARING = 'seafaring'
}

// === SETTLEMENT DATA ===
export interface SettlementData {
  id: string;
  name: string;
  type: TownType;
  population: number;
  prosperity: number; // 0-100
  reputation: number; // -100 to 100 with party
  
  // Economic system (EconML-inspired)
  economy: EconomicState;
  
  // Buildings and NPCs
  buildings: Building[];
  npcs: NPC[];
  
  // Governance
  government: GovernmentType;
  laws: TownLaw[];
  taxes: number; // percentage
  
  // Resources and trade
  localResources: string[]; // what this town produces
  tradeRoutes: TradeRoute[];
  stockpiles: Record<string, number>;
}

// === ECONOMIC SYSTEM (EconML-inspired) ===
export interface EconomicState {
  sectors: Record<EconomicSector, SectorData>;
  overallProsperity: number;
  inflationRate: number;
  unemploymentRate: number;
  tradeBalance: number;
  
  // Supply and demand (core EconML concept)
  marketPrices: Record<string, PriceData>;
  supplyDemandFactors: Record<string, SupplyDemandFactor>;
}

export interface SectorData {
  strength: number; // 0-100
  growth: number; // percentage change per period
  employment: number; // number of jobs
  productivity: number; // output per worker
}

export interface PriceData {
  basePrice: number;
  currentPrice: number;
  volatility: number;
  trend: 'rising' | 'falling' | 'stable';
  elasticity: number; // price sensitivity to supply/demand changes
}

export interface SupplyDemandFactor {
  supply: number;
  demand: number;
  seasonalModifier: number;
  eventModifiers: Record<string, number>;
}

// === TRADE SYSTEM ===
export interface TradeRoute {
  id: string;
  origin: string; // settlement ID
  destination: string; // settlement ID  
  goods: TradeGood[];
  established: Date;
  profitability: number;
  risk: number; // chance of complications
  travelTime: number; // in game days
}

export interface TradeGood {
  item: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
  demand: number; // how much the destination wants this
}

// === NPC SYSTEM ===
export interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  personality: NPCPersonality;
  services: NPCService[];
  
  // Economic behavior (EconML-inspired)
  economicBehavior: NPCEconomicBehavior;
  
  // Relationship with party
  reputation: number; // -100 to 100
  questsAvailable: string[];
  completedQuests: string[];
}

export enum NPCRole {
  SHOPKEEPER = 'shopkeeper',
  INNKEEPER = 'innkeeper', 
  BLACKSMITH = 'blacksmith',
  GUARD = 'guard',
  NOBLE = 'noble',
  PRIEST = 'priest',
  WIZARD = 'wizard',
  MERCHANT = 'merchant',
  GUILD_MASTER = 'guild_master',
  MAYOR = 'mayor',
  FARMER = 'farmer',
  MINER = 'miner',
  SAILOR = 'sailor'
}

export interface NPCPersonality {
  friendliness: number; // -1 to 1
  greed: number; // 0 to 1
  trustworthiness: number; // 0 to 1
  bravery: number; // 0 to 1
  intelligence: number; // 0 to 1
  quirks: string[];
}

export interface NPCService {
  type: 'shop' | 'training' | 'quest' | 'information' | 'transport';
  available: boolean;
  priceModifier: number; // multiplier based on reputation/economy
  requirements?: ServiceRequirement[];
}

export interface ServiceRequirement {
  type: 'reputation' | 'level' | 'quest_complete' | 'item_owned';
  value: any;
}

export interface NPCEconomicBehavior {
  priceFlexibility: number; // 0-1, how much they adjust prices
  stockManagement: 'conservative' | 'aggressive' | 'reactive';
  marketAwareness: number; // 0-1, how much they respond to market changes
  negotiationSkill: number; // 0-1, affects final prices
}

// === GOVERNANCE ===
export enum GovernmentType {
  MONARCHY = 'monarchy',
  REPUBLIC = 'republic',
  THEOCRACY = 'theocracy',
  GUILD_COUNCIL = 'guild_council',
  TRIBAL = 'tribal',
  MILITARY_JUNTA = 'military_junta'
}

export interface TownLaw {
  id: string;
  name: string;
  description: string;
  penalty: string;
  strictness: number; // 0-1
}

// === BUILDING SYSTEM ===
export interface Building {
  id: string;
  type: BuildingType;
  name: string;
  owner: string; // NPC ID
  
  // Economic properties
  operatingCosts: number; // per day
  revenue: number; // per day
  inventory: Record<string, number>;
  services: BuildingService[];
  
  // Physical properties
  condition: number; // 0-100
  capacity: number; // for inns, storage, etc.
  
  // Upgrades and customization
  upgrades: string[];
  specialFeatures: string[];
}

export interface BuildingService {
  type: string;
  basePrice: number;
  availability: number; // 0-1
  quality: number; // 0-1
}

// === EVENTS AND ENCOUNTERS ===
export interface OverworldEncounter {
  id: string;
  type: 'combat' | 'social' | 'discovery' | 'trade' | 'environmental';
  rarity: number; // 0-1
  biomePreference: BiomeType[];
  description: string;
  
  // Encounter resolution
  requirements?: EncounterRequirement[];
  outcomes: EncounterOutcome[];
}

export interface EncounterRequirement {
  type: 'skill' | 'item' | 'reputation' | 'party_size';
  value: any;
  difficulty?: number;
}

export interface EncounterOutcome {
  condition: string; // when this outcome triggers
  effects: EncounterEffect[];
  narrative: string;
}

export interface EncounterEffect {
  type: 'experience' | 'item' | 'reputation' | 'health' | 'time' | 'discovery';
  value: any;
  target?: 'party' | 'individual' | 'settlement';
}

// === GUILD SYSTEM ===
export interface Guild {
  id: string;
  name: string;
  type: GuildType;
  headquarters: string; // settlement ID
  
  // Membership
  memberCount: number;
  partyRank: GuildRank;
  reputation: number; // -100 to 100
  
  // Resources and benefits
  treasury: number;
  communalResources: Record<string, number>;
  benefits: GuildBenefit[];
  
  // Missions and contracts
  availableMissions: GuildMission[];
  completedMissions: string[];
}

export enum GuildType {
  ADVENTURERS = 'adventurers',
  MERCHANTS = 'merchants', 
  MAGES = 'mages',
  CRAFTSMEN = 'craftsmen',
  THIEVES = 'thieves',
  MERCENARIES = 'mercenaries'
}

export enum GuildRank {
  INITIATE = 'initiate',
  APPRENTICE = 'apprentice',
  JOURNEYMAN = 'journeyman', 
  EXPERT = 'expert',
  MASTER = 'master'
}

export interface GuildBenefit {
  type: 'discount' | 'access' | 'training' | 'information';
  description: string;
  value: number;
  rankRequired: GuildRank;
}

export interface GuildMission {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  reward: MissionReward;
  timeLimit?: number; // days
  location?: HexCoordinate;
}

export interface MissionReward {
  gold: number;
  experience: number;
  reputation: number;
  items?: string[];
  guildPoints: number;
}

// === WORLD GENERATION PARAMETERS ===
export interface WorldGenerationConfig {
  // Overall world size and structure
  worldSize: number; // radius in hexes
  biomeDistribution: Record<BiomeType, number>; // relative weights
  settlementDensity: number; // settlements per 100 hexes
  dungeonDensity: number; // dungeons per 100 hexes
  
  // Procedural generation seeds (Infinigen-style)
  terrainSeed: string;
  biomeSeed: string;
  settlementSeed: string;
  economicSeed: string;
  
  // Economic parameters (EconML-inspired)
  economicComplexity: number; // 0-1
  tradeRouteFrequency: number; // 0-1
  marketVolatility: number; // 0-1
  
  // H3-inspired spatial parameters
  hexSize: number; // kilometers per hex
  visibilityRange: number; // hexes visible from any position
  
  // Gameplay parameters
  travelSpeed: number; // hexes per day
  encounterRate: number; // base encounters per hex
  discoveryBonus: number; // experience for discovering new locations
}