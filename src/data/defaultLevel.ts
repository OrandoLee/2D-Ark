import type { EnemyPath, LevelCell, LevelDefinition, LevelWave } from '../types/level'

export const DEFAULT_LEVEL_ROWS = 8
export const DEFAULT_LEVEL_COLS = 12

export const DEFAULT_PATH_POINTS = [
  { row: 3, col: 0 },
  { row: 3, col: 1 },
  { row: 3, col: 2 },
  { row: 2, col: 2 },
  { row: 2, col: 3 },
  { row: 2, col: 4 },
  { row: 3, col: 4 },
  { row: 4, col: 4 },
  { row: 4, col: 5 },
  { row: 4, col: 6 },
  { row: 4, col: 7 },
  { row: 3, col: 7 },
  { row: 2, col: 7 },
  { row: 2, col: 8 },
  { row: 2, col: 9 },
  { row: 3, col: 9 },
  { row: 3, col: 10 },
  { row: 3, col: 11 },
]

const yellowCells = new Set([
  '1-1',
  '1-3',
  '1-5',
  '1-7',
  '1-9',
  '1-10',
  '5-1',
  '5-2',
  '5-5',
  '5-8',
  '5-9',
  '5-10',
])

const redCells = new Set([
  '0-0',
  '0-3',
  '0-4',
  '0-7',
  '0-8',
  '0-11',
  '6-0',
  '6-3',
  '6-6',
  '6-7',
  '6-11',
  '7-0',
  '7-1',
  '7-5',
  '7-6',
  '7-10',
  '7-11',
])

const pathKeys = new Set(DEFAULT_PATH_POINTS.map(({ row, col }) => `${row}-${col}`))
const spawnCell = DEFAULT_PATH_POINTS[0]
const baseCell = DEFAULT_PATH_POINTS[DEFAULT_PATH_POINTS.length - 1]

function createDefaultGrid(): LevelCell[][] {
  return Array.from({ length: DEFAULT_LEVEL_ROWS }, (_, row) =>
    Array.from({ length: DEFAULT_LEVEL_COLS }, (_, col) => {
      const key = `${row}-${col}`
      const isPath = pathKeys.has(key)
      const type =
        row === spawnCell.row && col === spawnCell.col
          ? 'spawn'
          : row === baseCell.row && col === baseCell.col
            ? 'base'
            : yellowCells.has(key)
              ? 'yellow'
              : redCells.has(key)
                ? 'red'
                : 'blue'
      return {
        row,
        col,
        type,
        isPath,
        pathIds: isPath ? ['main'] : [],
      }
    }),
  )
}

export const defaultEnemyPath: EnemyPath = {
  id: 'main',
  name: '主路径',
  spawnCell,
  baseCell,
  points: DEFAULT_PATH_POINTS,
}

export const defaultLevelWaves: LevelWave[] = [
  {
    id: 'wave-1',
    name: '第 01 波',
    delayAfterPreviousWave: 0,
    enemies: [
      { id: 'enemy-1-1', enemyType: 'runner', delay: 0, count: 2, interval: 1000, pathId: 'main' },
      { id: 'enemy-1-2', enemyType: 'soldier', delay: 2000, count: 1, interval: 1000, pathId: 'main' },
      { id: 'enemy-1-3', enemyType: 'runner', delay: 4000, count: 1, interval: 1000, pathId: 'main' },
      { id: 'enemy-1-4', enemyType: 'soldier', delay: 6000, count: 1, interval: 1000, pathId: 'main' },
    ],
  },
  {
    id: 'wave-2',
    name: '第 02 波',
    delayAfterPreviousWave: 3000,
    enemies: [
      { id: 'enemy-2-1', enemyType: 'runner', delay: 0, count: 3, interval: 800, pathId: 'main' },
      { id: 'enemy-2-2', enemyType: 'soldier', delay: 3000, count: 2, interval: 1500, pathId: 'main' },
      { id: 'enemy-2-3', enemyType: 'runner', delay: 6000, count: 1, interval: 1000, pathId: 'main' },
      { id: 'enemy-2-4', enemyType: 'soldier', delay: 7000, count: 1, interval: 1000, pathId: 'main' },
    ],
  },
  {
    id: 'wave-3',
    name: '第 03 波',
    delayAfterPreviousWave: 3000,
    enemies: [
      { id: 'enemy-3-1', enemyType: 'soldier', delay: 0, count: 2, interval: 1000, pathId: 'main' },
      { id: 'enemy-3-2', enemyType: 'heavy', delay: 2500, count: 1, interval: 1000, pathId: 'main' },
      { id: 'enemy-3-3', enemyType: 'runner', delay: 4000, count: 2, interval: 800, pathId: 'main' },
      { id: 'enemy-3-4', enemyType: 'heavy', delay: 6000, count: 1, interval: 1000, pathId: 'main' },
    ],
  },
  {
    id: 'wave-4',
    name: '第 04 波',
    delayAfterPreviousWave: 3000,
    enemies: [
      { id: 'enemy-4-1', enemyType: 'runner', delay: 0, count: 3, interval: 600, pathId: 'main' },
      { id: 'enemy-4-2', enemyType: 'soldier', delay: 2000, count: 1, interval: 1000, pathId: 'main' },
      { id: 'enemy-4-3', enemyType: 'heavy', delay: 3000, count: 1, interval: 1000, pathId: 'main' },
      { id: 'enemy-4-4', enemyType: 'soldier', delay: 4000, count: 1, interval: 1000, pathId: 'main' },
      { id: 'enemy-4-5', enemyType: 'runner', delay: 5000, count: 2, interval: 600, pathId: 'main' },
      { id: 'enemy-4-6', enemyType: 'heavy', delay: 7000, count: 1, interval: 1000, pathId: 'main' },
    ],
  },
  {
    id: 'wave-5',
    name: '第 05 波',
    delayAfterPreviousWave: 3000,
    enemies: [
      { id: 'enemy-5-1', enemyType: 'prototype-boss', delay: 0, count: 1, interval: 1000, pathId: 'main' },
      { id: 'enemy-5-2', enemyType: 'runner', delay: 1000, count: 2, interval: 500, pathId: 'main' },
      { id: 'enemy-5-3', enemyType: 'soldier', delay: 2000, count: 1, interval: 1000, pathId: 'main' },
      { id: 'enemy-5-4', enemyType: 'heavy', delay: 3000, count: 1, interval: 1000, pathId: 'main' },
      { id: 'enemy-5-5', enemyType: 'runner', delay: 4000, count: 2, interval: 500, pathId: 'main' },
      { id: 'enemy-5-6', enemyType: 'soldier', delay: 5000, count: 1, interval: 1000, pathId: 'main' },
      { id: 'enemy-5-7', enemyType: 'heavy', delay: 7000, count: 1, interval: 1000, pathId: 'main' },
      { id: 'enemy-5-8', enemyType: 'soldier', delay: 9000, count: 1, interval: 1000, pathId: 'main' },
    ],
  },
]

export const defaultLevel: LevelDefinition = {
  id: 'grid-defense-lab-01-default',
  name: 'LAB-01 默认行动',
  description: '原始战术网格行动。',
  version: 1,
  author: 'DELEE LAB',
  createdAt: '2026-06-04T00:00:00.000Z',
  updatedAt: '2026-06-04T00:00:00.000Z',
  difficulty: 'normal',
  rows: DEFAULT_LEVEL_ROWS,
  cols: DEFAULT_LEVEL_COLS,
  initialLife: 10,
  initialDp: 20,
  dpRegenPerSecond: 1,
  deployLimit: 6,
  grid: createDefaultGrid(),
  paths: [defaultEnemyPath],
  waves: defaultLevelWaves,
  handConfig: {
    initialHandSize: 5,
    slotRefreshMs: 1200,
    rarityWeights: {
      common: 48,
      uncommon: 28,
      rare: 16,
      epic: 7,
      prototype: 1,
    },
  },
  tags: ['default', 'lab-01'],
}
