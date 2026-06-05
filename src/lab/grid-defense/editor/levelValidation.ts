import { ENEMY_DEFINITIONS } from '../../../data/enemies'
import type { Point } from '../../../types/game'
import type { LevelDefinition, ValidationIssue, ValidationResult } from '../../../types/level'

function issue(
  severity: ValidationIssue['severity'],
  id: string,
  message: string,
  target?: string,
): ValidationIssue {
  return { severity, id, message, target }
}

function samePoint(a: Point, b: Point) {
  return a.row === b.row && a.col === b.col
}

function adjacent(a: Point, b: Point) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1
}

function cellAt(level: LevelDefinition, point: Point) {
  return level.grid[point.row]?.[point.col]
}

export function validateLevel(level: LevelDefinition): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  if (level.rows < 6 || level.rows > 14 || level.cols < 6 || level.cols > 20) {
    errors.push(issue('error', 'size-invalid', 'Map size must be between 6x6 and 20x14.', 'grid'))
  }

  const cells = level.grid.flat()
  const spawnCells = cells.filter((cell) => cell.type === 'spawn')
  const baseCells = cells.filter((cell) => cell.type === 'base')
  const blueCells = cells.filter((cell) => cell.type === 'blue')
  const yellowCells = cells.filter((cell) => cell.type === 'yellow')

  if (spawnCells.length === 0) errors.push(issue('error', 'spawn-missing', 'Add at least one spawn cell.', 'grid'))
  if (baseCells.length === 0) errors.push(issue('error', 'base-missing', 'Add at least one base cell.', 'grid'))
  if (level.paths.length === 0) errors.push(issue('error', 'path-missing', 'Add at least one enemy path.', 'paths'))

  for (const path of level.paths) {
    if (path.points.length < 2) {
      errors.push(issue('error', `${path.id}-too-short`, `${path.name} must have at least 2 points.`, path.id))
      continue
    }

    const start = path.points[0]
    const end = path.points[path.points.length - 1]
    if (!samePoint(start, path.spawnCell) || cellAt(level, start)?.type !== 'spawn') {
      errors.push(issue('error', `${path.id}-spawn`, `${path.name} must start on a spawn cell.`, path.id))
    }
    if (!samePoint(end, path.baseCell) || cellAt(level, end)?.type !== 'base') {
      errors.push(issue('error', `${path.id}-base`, `${path.name} must end on a base cell.`, path.id))
    }

    path.points.forEach((point, index) => {
      const cell = cellAt(level, point)
      if (!cell) {
        errors.push(issue('error', `${path.id}-bounds-${index}`, `${path.name} leaves the map.`, path.id))
        return
      }
      if (cell.type === 'yellow' || cell.type === 'red') {
        errors.push(
          issue('error', `${path.id}-blocked-${index}`, `${path.name} crosses ${cell.type} at ${point.row},${point.col}.`, path.id),
        )
      }
      if (index > 0 && !adjacent(path.points[index - 1], point)) {
        errors.push(issue('error', `${path.id}-gap-${index}`, `${path.name} has a non-adjacent step.`, path.id))
      }
    })
  }

  if (level.waves.length === 0) errors.push(issue('error', 'waves-missing', 'Add at least one wave.', 'waves'))
  const pathIds = new Set(level.paths.map((path) => path.id))
  const enemyIds = new Set(Object.keys(ENEMY_DEFINITIONS))
  level.waves.forEach((wave, waveIndex) => {
    if (wave.enemies.length === 0) {
      errors.push(issue('error', `${wave.id}-empty`, `${wave.name} needs at least one enemy group.`, wave.id))
    }
    wave.enemies.forEach((enemy, enemyIndex) => {
      const target = `${wave.id}.enemies.${enemyIndex}`
      if (!enemyIds.has(enemy.enemyType)) {
        errors.push(issue('error', `${enemy.id}-enemy`, `Unknown enemy type: ${enemy.enemyType}.`, target))
      }
      if (!pathIds.has(enemy.pathId)) {
        errors.push(issue('error', `${enemy.id}-path`, `Unknown path id: ${enemy.pathId}.`, target))
      }
      if (enemy.delay < 0) errors.push(issue('error', `${enemy.id}-delay`, 'Delay cannot be negative.', target))
      if (enemy.count <= 0) errors.push(issue('error', `${enemy.id}-count`, 'Count must be greater than 0.', target))
      if (enemy.interval < 0) errors.push(issue('error', `${enemy.id}-interval`, 'Interval cannot be negative.', target))
    })
    if (waveIndex === 0 && wave.enemies.some((enemy) => enemy.enemyType === 'prototype-boss')) {
      warnings.push(issue('warning', 'boss-early', 'Boss appears in the first wave.', wave.id))
    }
  })

  if (level.initialLife <= 0) errors.push(issue('error', 'life-invalid', 'Initial life must be greater than 0.', 'settings'))
  if (level.initialDp < 0) errors.push(issue('error', 'dp-invalid', 'Initial DP cannot be negative.', 'settings'))
  if (level.dpRegenPerSecond < 0) errors.push(issue('error', 'regen-invalid', 'DP regen cannot be negative.', 'settings'))
  if (level.deployLimit <= 0) errors.push(issue('error', 'deploy-invalid', 'Deploy limit must be greater than 0.', 'settings'))
  if (level.handConfig.initialHandSize < 1 || level.handConfig.initialHandSize > 8) {
    errors.push(issue('error', 'hand-size-invalid', 'Initial hand size must be between 1 and 8.', 'handConfig'))
  }
  if (level.handConfig.slotRefreshMs <= 0) {
    errors.push(issue('error', 'refresh-invalid', 'Slot refresh time must be greater than 0.', 'handConfig'))
  }
  const rarityTotal = Object.values(level.handConfig.rarityWeights).reduce((sum, value) => sum + value, 0)
  if (rarityTotal <= 0) {
    errors.push(issue('error', 'rarity-invalid', 'Rarity weights must total more than 0.', 'handConfig'))
  }

  if (yellowCells.length === 0) warnings.push(issue('warning', 'no-yellow', 'No yellow tiles; ranged deployment may be limited.', 'grid'))
  if (blueCells.length < 8) warnings.push(issue('warning', 'low-blue', 'Few blue tiles; ground deployment may be tight.', 'grid'))
  if (level.waves.length < 2) warnings.push(issue('warning', 'few-waves', 'Only one wave is configured.', 'waves'))
  if (level.paths.some((path) => path.points.length < 8)) {
    warnings.push(issue('warning', 'short-path', 'One or more paths are very short.', 'paths'))
  }

  return { valid: errors.length === 0, errors, warnings }
}
