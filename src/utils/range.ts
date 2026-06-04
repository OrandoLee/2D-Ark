import type { Direction, Point } from '../types/game'

export const manhattanDistance = (a: Point, b: Point) =>
  Math.abs(a.row - b.row) + Math.abs(a.col - b.col)

export function getFacingCell(point: Point, direction: Direction): Point {
  const offsets: Record<Direction, Point> = {
    up: { row: -1, col: 0 },
    down: { row: 1, col: 0 },
    left: { row: 0, col: -1 },
    right: { row: 0, col: 1 },
  }
  return {
    row: point.row + offsets[direction].row,
    col: point.col + offsets[direction].col,
  }
}
