import { defaultLevel } from '../../../data/defaultLevel'
import type { CellType, EnemyId, OperatorRarity, Point } from '../../../types/game'
import type {
  EnemyPath,
  HandConfig,
  LevelCell,
  LevelDefinition,
  LevelDifficulty,
  LevelWave,
  WaveEnemy,
} from '../../../types/level'

export const LEVEL_VERSION = 1
export const MIN_ROWS = 6
export const MIN_COLS = 6
export const MAX_ROWS = 14
export const MAX_COLS = 20
export const STORAGE_KEY = 'grid-defense-custom-levels'

const difficultyValues: LevelDifficulty[] = ['easy', 'normal', 'hard', 'extreme']
const rarityKeys: OperatorRarity[] = ['common', 'uncommon', 'rare', 'epic', 'prototype']

export function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function clampLevelSize(rows: number, cols: number) {
  return {
    rows: Math.min(MAX_ROWS, Math.max(MIN_ROWS, Math.round(rows || defaultLevel.rows))),
    cols: Math.min(MAX_COLS, Math.max(MIN_COLS, Math.round(cols || defaultLevel.cols))),
  }
}

export function createGrid(rows = defaultLevel.rows, cols = defaultLevel.cols, fill: CellType = 'red') {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col): LevelCell => ({
      row,
      col,
      type: fill,
      isPath: false,
      pathIds: [],
    })),
  )
}

function cloneDefaultLevel(): LevelDefinition {
  return JSON.parse(JSON.stringify(defaultLevel)) as LevelDefinition
}

export function markGridPaths(level: LevelDefinition): LevelDefinition {
  const pathMap = new Map<string, string[]>()
  for (const path of level.paths) {
    for (const point of path.points) {
      const key = `${point.row}-${point.col}`
      pathMap.set(key, [...(pathMap.get(key) ?? []), path.id])
    }
  }

  return {
    ...level,
    grid: level.grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        const pathIds = pathMap.get(`${rowIndex}-${colIndex}`) ?? []
        return {
          ...cell,
          row: rowIndex,
          col: colIndex,
          isPath: pathIds.length > 0,
          pathIds,
        }
      }),
    ),
  }
}

export function createNewLevel(): LevelDefinition {
  const now = new Date().toISOString()
  return markGridPaths({
    ...cloneDefaultLevel(),
    id: createId('level'),
    name: '未命名行动',
    description: '自定义战术网格行动。',
    author: 'DELEE LAB',
    createdAt: now,
    updatedAt: now,
    tags: ['custom'],
  })
}

export function resizeLevelGrid(level: LevelDefinition, rows: number, cols: number): LevelDefinition {
  const size = clampLevelSize(rows, cols)
  const nextGrid = createGrid(size.rows, size.cols, 'red')
  for (let row = 0; row < size.rows; row += 1) {
    for (let col = 0; col < size.cols; col += 1) {
      const current = level.grid[row]?.[col]
      if (current) nextGrid[row][col] = { ...current, row, col }
    }
  }

  const inBounds = (point: Point) => point.row < size.rows && point.col < size.cols
  const paths = level.paths
    .map((path) => ({
      ...path,
      points: path.points.filter(inBounds),
    }))
    .filter((path) => path.points.length > 0)
    .map((path) => ({
      ...path,
      spawnCell: path.points[0],
      baseCell: path.points[path.points.length - 1],
    }))

  return markGridPaths({
    ...level,
    rows: size.rows,
    cols: size.cols,
    grid: nextGrid,
    paths,
    updatedAt: new Date().toISOString(),
  })
}

function normalizeHandConfig(value: Partial<HandConfig> | undefined): HandConfig {
  const source = value ?? {}
  return {
    initialHandSize: Number(source.initialHandSize ?? defaultLevel.handConfig.initialHandSize),
    slotRefreshMs: Number(source.slotRefreshMs ?? defaultLevel.handConfig.slotRefreshMs),
    rarityWeights: rarityKeys.reduce(
      (weights, key) => ({
        ...weights,
        [key]: Number(source.rarityWeights?.[key] ?? defaultLevel.handConfig.rarityWeights[key]),
      }),
      {} as Record<OperatorRarity, number>,
    ),
    allowedClasses: Array.isArray(source.allowedClasses) ? source.allowedClasses : undefined,
    bannedOperatorIds: Array.isArray(source.bannedOperatorIds) ? source.bannedOperatorIds : undefined,
  }
}

function normalizeGrid(input: Partial<LevelDefinition>, rows: number, cols: number) {
  const grid = createGrid(rows, cols, 'red')
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell = input.grid?.[row]?.[col]
      if (cell) {
        grid[row][col] = {
          row,
          col,
          type: cell.type ?? 'red',
          isPath: Boolean(cell.isPath),
          pathIds: Array.isArray(cell.pathIds) ? cell.pathIds : [],
          label: cell.label,
        }
      }
    }
  }
  return grid
}

function normalizePaths(paths: EnemyPath[] | undefined): EnemyPath[] {
  if (!Array.isArray(paths)) return []
  return paths
    .filter((path) => Array.isArray(path.points) && path.points.length > 0)
    .map((path, index) => ({
      id: path.id || `path-${index + 1}`,
      name: path.name || `路径 ${index + 1}`,
      points: path.points.map((point) => ({ row: Number(point.row), col: Number(point.col) })),
      spawnCell: path.spawnCell ?? path.points[0],
      baseCell: path.baseCell ?? path.points[path.points.length - 1],
    }))
}

function normalizeWaves(waves: LevelWave[] | undefined): LevelWave[] {
  if (!Array.isArray(waves)) return []
  return waves.map((wave, waveIndex) => ({
    id: wave.id || `wave-${waveIndex + 1}`,
    name: wave.name || `第 ${waveIndex + 1} 波`,
    delayAfterPreviousWave: Number(wave.delayAfterPreviousWave ?? 0),
    enemies: Array.isArray(wave.enemies)
      ? wave.enemies.map((enemy, enemyIndex): WaveEnemy => ({
          id: enemy.id || `enemy-${waveIndex + 1}-${enemyIndex + 1}`,
          enemyType: (enemy.enemyType || 'runner') as EnemyId,
          delay: Number(enemy.delay ?? 0),
          count: Number(enemy.count ?? 1),
          interval: Number(enemy.interval ?? 1000),
          pathId: enemy.pathId || 'main',
          spawnPointId: enemy.spawnPointId,
        }))
      : [],
  }))
}

export function normalizeLevelDefinition(raw: unknown): LevelDefinition {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Partial<LevelDefinition>
  const { rows, cols } = clampLevelSize(Number(input.rows ?? defaultLevel.rows), Number(input.cols ?? defaultLevel.cols))
  const now = new Date().toISOString()
  const level: LevelDefinition = {
    id: input.id || createId('level'),
    name: input.name || '未命名行动',
    description: input.description || '自定义战术网格行动。',
    version: Number(input.version ?? LEVEL_VERSION),
    author: input.author || 'DELEE LAB',
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
    difficulty: difficultyValues.includes(input.difficulty as LevelDifficulty)
      ? (input.difficulty as LevelDifficulty)
      : 'normal',
    rows,
    cols,
    initialLife: Number(input.initialLife ?? 10),
    initialDp: Number(input.initialDp ?? 20),
    dpRegenPerSecond: Number(input.dpRegenPerSecond ?? 1),
    deployLimit: Number(input.deployLimit ?? 6),
    grid: normalizeGrid(input, rows, cols),
    paths: normalizePaths(input.paths),
    waves: normalizeWaves(input.waves),
    handConfig: normalizeHandConfig(input.handConfig),
    tags: Array.isArray(input.tags) ? input.tags : [],
  }
  return markGridPaths(level)
}

export function migrateLevelDefinition(raw: unknown): LevelDefinition {
  return normalizeLevelDefinition(raw)
}
