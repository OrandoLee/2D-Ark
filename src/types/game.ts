export type CellType = 'blue' | 'yellow' | 'red' | 'spawn' | 'base'
export type UnitType = 'melee' | 'ranged' | 'medic' | 'support' | 'trap'
export type DamageType = 'physical' | 'arts' | 'heal' | 'none'
export type Direction = 'up' | 'down' | 'left' | 'right'
export type EnemyId = 'runner' | 'soldier' | 'heavy' | 'prototype-boss'
export type UnitId = string
export type ClassType =
  | 'vanguard'
  | 'guard'
  | 'defender'
  | 'sniper'
  | 'caster'
  | 'medic'
  | 'supporter'
  | 'specialist'
export type OperatorRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'prototype'
export type GamePhase = 'start' | 'playing' | 'victory' | 'defeat'

export interface Point {
  row: number
  col: number
}

export interface GridCellData extends Point {
  type: CellType
  isPath: boolean
  deployableTypes: UnitType[]
}

export interface UnitDefinition {
  id: UnitId
  cnName: string
  enName: string
  name: string
  callsign: string
  classType: ClassType
  type: UnitType
  rarity: OperatorRarity
  deployOn: CellType[]
  cost: number
  maxHp: number
  attack?: number
  heal?: number
  attackInterval: number
  range: number
  block: number
  damageType?: DamageType
  trait: string
  tags: string[]
  description: string
}

export interface DeployedUnit extends Point {
  instanceId: string
  definitionId: UnitId
  direction?: Direction
  hp: number
  blockedEnemyIds: string[]
  cooldown: number
}

export interface EnemyDefinition {
  id: EnemyId
  name: string
  maxHp: number
  attack: number
  attackInterval: number
  speed: number
  defense: number
  leakDamage: number
  rewardDp: number
}

export interface Enemy {
  instanceId: string
  definitionId: EnemyId
  hp: number
  pathProgress: number
  x: number
  y: number
  row: number
  col: number
  blockedByUnitId?: string
  cooldown: number
}

export interface WaveSpawn {
  delay: number
  enemyId: EnemyId
}

export interface Wave {
  id: number
  spawns: WaveSpawn[]
}

export interface CombatEffect {
  id: string
  type: 'attack' | 'shot' | 'arts' | 'heal' | 'impact'
  fromX: number
  fromY: number
  toX: number
  toY: number
  ttl: number
}

export interface PendingCell extends Point {
  unitId: UnitId
}

export interface HandSlot {
  slotId: string
  operatorId: UnitId | null
  refreshRemaining: number
  lastOperatorId?: UnitId
  locked?: boolean
}

export interface GameState {
  phase: GamePhase
  life: number
  dp: number
  currentWave: number
  kills: number
  deployedUnits: DeployedUnit[]
  enemies: Enemy[]
  currentHand: HandSlot[]
  selectedUnitId?: UnitId
  selectedDeployedId?: string
  pendingDirectionCell?: PendingCell
  speedMultiplier: 1 | 2
  isPaused: boolean
  effects: CombatEffect[]
  message?: string
  elapsedTime: number
  deployCount: number
  waveElapsed: number
  waveSpawnIndex: number
  intermission: number
  dpAccumulator: number
}
