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

const cellTypeNames = {
  blue: '地面',
  yellow: '高台',
  red: '禁用',
  spawn: '入口',
  base: '核心',
}

export function validateLevel(level: LevelDefinition): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  if (level.rows < 6 || level.rows > 14 || level.cols < 6 || level.cols > 20) {
    errors.push(issue('error', 'size-invalid', '地图尺寸必须在 6x6 到 20x14 之间。', 'grid'))
  }

  const cells = level.grid.flat()
  const spawnCells = cells.filter((cell) => cell.type === 'spawn')
  const baseCells = cells.filter((cell) => cell.type === 'base')
  const blueCells = cells.filter((cell) => cell.type === 'blue')
  const yellowCells = cells.filter((cell) => cell.type === 'yellow')

  if (spawnCells.length === 0) errors.push(issue('error', 'spawn-missing', '至少需要一个入口格。', 'grid'))
  if (baseCells.length === 0) errors.push(issue('error', 'base-missing', '至少需要一个核心格。', 'grid'))
  if (level.paths.length === 0) errors.push(issue('error', 'path-missing', '至少需要一条敌人路径。', 'paths'))

  for (const path of level.paths) {
    if (path.points.length < 2) {
      errors.push(issue('error', `${path.id}-too-short`, `${path.name} 至少需要 2 个路径点。`, path.id))
      continue
    }

    const start = path.points[0]
    const end = path.points[path.points.length - 1]
    if (!samePoint(start, path.spawnCell) || cellAt(level, start)?.type !== 'spawn') {
      errors.push(issue('error', `${path.id}-spawn`, `${path.name} 必须从入口格开始。`, path.id))
    }
    if (!samePoint(end, path.baseCell) || cellAt(level, end)?.type !== 'base') {
      errors.push(issue('error', `${path.id}-base`, `${path.name} 必须以核心格结束。`, path.id))
    }

    path.points.forEach((point, index) => {
      const cell = cellAt(level, point)
      if (!cell) {
        errors.push(issue('error', `${path.id}-bounds-${index}`, `${path.name} 超出了地图范围。`, path.id))
        return
      }
      if (cell.type === 'yellow' || cell.type === 'red') {
        errors.push(
          issue('error', `${path.id}-blocked-${index}`, `${path.name} 在 ${point.row},${point.col} 穿过了 ${cellTypeNames[cell.type]}格。`, path.id),
        )
      }
      if (index > 0 && !adjacent(path.points[index - 1], point)) {
        errors.push(issue('error', `${path.id}-gap-${index}`, `${path.name} 存在不相邻的路径点。`, path.id))
      }
    })
  }

  if (level.waves.length === 0) errors.push(issue('error', 'waves-missing', '至少需要一个波次。', 'waves'))
  const pathIds = new Set(level.paths.map((path) => path.id))
  const enemyIds = new Set(Object.keys(ENEMY_DEFINITIONS))
  level.waves.forEach((wave, waveIndex) => {
    if (wave.enemies.length === 0) {
      errors.push(issue('error', `${wave.id}-empty`, `${wave.name} 至少需要一个敌人组。`, wave.id))
    }
    wave.enemies.forEach((enemy, enemyIndex) => {
      const target = `${wave.id}.enemies.${enemyIndex}`
      if (!enemyIds.has(enemy.enemyType)) {
        errors.push(issue('error', `${enemy.id}-enemy`, `未知敌人类型：${enemy.enemyType}。`, target))
      }
      if (!pathIds.has(enemy.pathId)) {
        errors.push(issue('error', `${enemy.id}-path`, `未知路径 ID：${enemy.pathId}。`, target))
      }
      if (enemy.delay < 0) errors.push(issue('error', `${enemy.id}-delay`, '延迟不能为负数。', target))
      if (enemy.count <= 0) errors.push(issue('error', `${enemy.id}-count`, '数量必须大于 0。', target))
      if (enemy.interval < 0) errors.push(issue('error', `${enemy.id}-interval`, '间隔不能为负数。', target))
    })
    if (waveIndex === 0 && wave.enemies.some((enemy) => enemy.enemyType === 'prototype-boss')) {
      warnings.push(issue('warning', 'boss-early', '首领敌人在第一波出现，难度可能过高。', wave.id))
    }
  })

  if (level.initialLife <= 0) errors.push(issue('error', 'life-invalid', '初始生命必须大于 0。', 'settings'))
  if (level.initialDp < 0) errors.push(issue('error', 'dp-invalid', '初始 DP 不能为负数。', 'settings'))
  if (level.dpRegenPerSecond < 0) errors.push(issue('error', 'regen-invalid', 'DP 回复不能为负数。', 'settings'))
  if (level.deployLimit <= 0) errors.push(issue('error', 'deploy-invalid', '部署上限必须大于 0。', 'settings'))
  if (level.handConfig.initialHandSize < 1 || level.handConfig.initialHandSize > 8) {
    errors.push(issue('error', 'hand-size-invalid', '初始手牌数必须在 1 到 8 之间。', 'handConfig'))
  }
  if (level.handConfig.slotRefreshMs <= 0) {
    errors.push(issue('error', 'refresh-invalid', '槽位刷新时间必须大于 0。', 'handConfig'))
  }
  const rarityTotal = Object.values(level.handConfig.rarityWeights).reduce((sum, value) => sum + value, 0)
  if (rarityTotal <= 0) {
    errors.push(issue('error', 'rarity-invalid', '稀有度权重总和必须大于 0。', 'handConfig'))
  }

  if (yellowCells.length === 0) warnings.push(issue('warning', 'no-yellow', '没有高台格，远程部署可能受限。', 'grid'))
  if (blueCells.length < 8) warnings.push(issue('warning', 'low-blue', '地面格较少，地面部署空间可能紧张。', 'grid'))
  if (level.waves.length < 2) warnings.push(issue('warning', 'few-waves', '当前只配置了一个波次。', 'waves'))
  if (level.paths.some((path) => path.points.length < 8)) {
    warnings.push(issue('warning', 'short-path', '存在较短路径，难度可能偏高。', 'paths'))
  }

  return { valid: errors.length === 0, errors, warnings }
}
