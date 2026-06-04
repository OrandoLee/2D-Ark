import { PATH } from '../data/map'

export function positionOnPath(progress: number) {
  const clamped = Math.max(0, Math.min(progress, PATH.length - 1))
  const index = Math.floor(clamped)
  const nextIndex = Math.min(index + 1, PATH.length - 1)
  const fraction = clamped - index
  const current = PATH[index]
  const next = PATH[nextIndex]
  const x = current.col + (next.col - current.col) * fraction
  const y = current.row + (next.row - current.row) * fraction
  return {
    x,
    y,
    row: Math.round(y),
    col: Math.round(x),
  }
}

export function pathIndexForCell(row: number, col: number) {
  return PATH.findIndex((point) => point.row === row && point.col === col)
}
