import type { CellType, GridCellData, Point, UnitType } from '../types/game'

export const MAP_COLS = 12
export const MAP_ROWS = 8

export const PATH: Point[] = [
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
  '1-1', '1-3', '1-5', '1-7', '1-9', '1-10',
  '5-1', '5-2', '5-5', '5-8', '5-9', '5-10',
])

const redCells = new Set([
  '0-0', '0-3', '0-4', '0-7', '0-8', '0-11',
  '6-0', '6-3', '6-6', '6-7', '6-11',
  '7-0', '7-1', '7-5', '7-6', '7-10', '7-11',
])

const pathKeys = new Set(PATH.map(({ row, col }) => `${row}-${col}`))

function getType(row: number, col: number): CellType {
  if (row === PATH[0].row && col === PATH[0].col) return 'spawn'
  const end = PATH[PATH.length - 1]
  if (row === end.row && col === end.col) return 'base'
  const key = `${row}-${col}`
  if (yellowCells.has(key)) return 'yellow'
  if (redCells.has(key)) return 'red'
  return 'blue'
}

function getDeployableTypes(type: CellType, isPath: boolean): UnitType[] {
  if (type === 'yellow') return ['melee', 'ranged', 'medic', 'support']
  if (type === 'blue') return isPath ? ['melee', 'trap'] : ['melee', 'medic', 'support', 'trap']
  return []
}

export const MAP_CELLS: GridCellData[] = Array.from(
  { length: MAP_ROWS * MAP_COLS },
  (_, index) => {
    const row = Math.floor(index / MAP_COLS)
    const col = index % MAP_COLS
    const type = getType(row, col)
    const isPath = pathKeys.has(`${row}-${col}`)
    return { row, col, type, isPath, deployableTypes: getDeployableTypes(type, isPath) }
  },
)

export const getCell = (row: number, col: number) =>
  MAP_CELLS.find((cell) => cell.row === row && cell.col === col)
