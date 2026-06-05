import { defaultLevel } from './defaultLevel'
import { getLevelCells, getPrimaryPath } from '../utils/levelRuntime'

export const MAP_COLS = defaultLevel.cols
export const MAP_ROWS = defaultLevel.rows
export const PATH = getPrimaryPath(defaultLevel)
export const MAP_CELLS = getLevelCells(defaultLevel)

export const getCell = (row: number, col: number) =>
  MAP_CELLS.find((cell) => cell.row === row && cell.col === col)
