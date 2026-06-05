import type { CellType, EnemyId, OperatorRarity, Point } from './game'

export type LevelDifficulty = 'easy' | 'normal' | 'hard' | 'extreme'

export interface LevelCell extends Point {
  type: CellType
  isPath: boolean
  pathIds: string[]
  label?: string
}

export interface EnemyPath {
  id: string
  name: string
  spawnCell: Point
  baseCell: Point
  points: Point[]
}

export interface WaveEnemy {
  id: string
  enemyType: EnemyId
  delay: number
  count: number
  interval: number
  pathId: string
  spawnPointId?: string
}

export interface LevelWave {
  id: string
  name: string
  delayAfterPreviousWave: number
  enemies: WaveEnemy[]
}

export interface HandConfig {
  initialHandSize: number
  slotRefreshMs: number
  rarityWeights: Record<OperatorRarity, number>
  allowedClasses?: string[]
  bannedOperatorIds?: string[]
}

export interface LevelDefinition {
  id: string
  name: string
  description: string
  version: number
  author: string
  createdAt: string
  updatedAt: string
  difficulty: LevelDifficulty
  rows: number
  cols: number
  initialLife: number
  initialDp: number
  dpRegenPerSecond: number
  deployLimit: number
  grid: LevelCell[][]
  paths: EnemyPath[]
  waves: LevelWave[]
  handConfig: HandConfig
  tags: string[]
}

export interface ValidationIssue {
  id: string
  message: string
  target?: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}
