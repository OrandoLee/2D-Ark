import type { CellType, GridCellData, Point, UnitType, Wave } from '../types/game'
import type { LevelDefinition } from '../types/level'

export function getDeployableTypes(type: CellType, isPath: boolean): UnitType[] {
  if (type === 'yellow') return ['melee', 'ranged', 'medic', 'support']
  if (type === 'blue') return isPath ? ['melee', 'trap'] : ['melee', 'medic', 'support', 'trap']
  return []
}

export function getLevelCells(level: LevelDefinition): GridCellData[] {
  return level.grid.flatMap((row) =>
    row.map((cell) => ({
      row: cell.row,
      col: cell.col,
      type: cell.type,
      isPath: cell.isPath,
      deployableTypes: getDeployableTypes(cell.type, cell.isPath),
    })),
  )
}

export function getPrimaryPath(level: LevelDefinition): Point[] {
  return level.paths[0]?.points ?? []
}

export function expandLevelWaves(level: LevelDefinition): Wave[] {
  return level.waves.map((wave, index) => ({
    id: index + 1,
    delayAfterPreviousWave: wave.delayAfterPreviousWave / 1000,
    spawns: wave.enemies
      .flatMap((enemy) =>
        Array.from({ length: Math.max(0, enemy.count) }, (_, spawnIndex) => ({
          delay: (enemy.delay + enemy.interval * spawnIndex) / 1000,
          enemyId: enemy.enemyType,
          pathId: enemy.pathId,
        })),
      )
      .sort((a, b) => a.delay - b.delay),
  }))
}

export function positionOnPath(path: Point[], progress: number) {
  const fallback = path[0] ?? { row: 0, col: 0 }
  if (path.length === 0) {
    return { x: fallback.col, y: fallback.row, row: fallback.row, col: fallback.col }
  }
  const clamped = Math.max(0, Math.min(progress, path.length - 1))
  const index = Math.floor(clamped)
  const nextIndex = Math.min(index + 1, path.length - 1)
  const fraction = clamped - index
  const current = path[index]
  const next = path[nextIndex]
  const x = current.col + (next.col - current.col) * fraction
  const y = current.row + (next.row - current.row) * fraction
  return {
    x,
    y,
    row: Math.round(y),
    col: Math.round(x),
  }
}

export function pathIndexForCell(path: Point[], row: number, col: number) {
  return path.findIndex((point) => point.row === row && point.col === col)
}
