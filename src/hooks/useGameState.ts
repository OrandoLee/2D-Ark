import { useCallback, useEffect, useRef, useState } from 'react'
import { ENEMY_DEFINITIONS } from '../data/enemies'
import { getCell, PATH } from '../data/map'
import { UNIT_DEFINITIONS } from '../data/units'
import { WAVES } from '../data/waves'
import type {
  CombatEffect,
  DeployedUnit,
  Direction,
  GameState,
  UnitId,
} from '../types/game'
import { calculateDamage } from '../utils/combat'
import { consumeHandSlot, initializeHand, tickHandSlots } from '../utils/drawPool'
import { getFacingCell, manhattanDistance } from '../utils/range'
import { pathIndexForCell, positionOnPath } from '../utils/path'
import { useGameLoop } from './useGameLoop'

const INITIAL_LIFE = 10
const INITIAL_DP = 20
export const DEPLOY_LIMIT = 6

const createInitialState = (phase: GameState['phase'] = 'start'): GameState => ({
  phase,
  life: INITIAL_LIFE,
  dp: INITIAL_DP,
  currentWave: 0,
  kills: 0,
  deployedUnits: [],
  enemies: [],
  currentHand: phase === 'playing' ? initializeHand() : [],
  selectedUnitId: undefined,
  selectedDeployedId: undefined,
  pendingDirectionCell: undefined,
  speedMultiplier: 1,
  isPaused: false,
  effects: [],
  message: phase === 'playing' ? '战术准备：4 秒后敌人出现' : undefined,
  elapsedTime: 0,
  deployCount: 0,
  waveElapsed: -4,
  waveSpawnIndex: 0,
  intermission: 0,
  dpAccumulator: 0,
})

function isUnitInHand(state: GameState, unitId: UnitId) {
  return state.currentHand.some((slot) => slot.operatorId === unitId && slot.refreshRemaining === 0)
}

function hasTag(unitId: UnitId, tag: string) {
  return UNIT_DEFINITIONS[unitId]?.tags.includes(tag) ?? false
}

function applyDeploymentTrait(state: GameState, unit: DeployedUnit) {
  const definition = UNIT_DEFINITIONS[unit.definitionId]
  if (definition.tags.includes('dp') && definition.trait.includes('部署')) {
    state.dp += 2
  }
  if (definition.tags.includes('stun')) {
    for (const enemy of state.enemies) {
      if (manhattanDistance(unit, enemy) <= Math.max(1, definition.range)) {
        enemy.cooldown = Math.max(enemy.cooldown, 700)
      }
    }
  }
}

function traitDamageMultiplier(unitId: UnitId, enemyDefinitionId: string) {
  const definition = UNIT_DEFINITIONS[unitId]
  if (definition.tags.includes('anti-runner') && enemyDefinitionId === 'runner') return 1.45
  if (definition.tags.includes('anti-heavy') && enemyDefinitionId === 'heavy') return 1.4
  if (definition.tags.includes('anti-armor')) return 1.25
  if (definition.tags.includes('buff')) return 1.12
  return 1
}

function addEffect(
  effects: CombatEffect[],
  id: string,
  type: CombatEffect['type'],
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  ttl = 0.22,
) {
  effects.push({ id, type, fromX, fromY, toX, toY, ttl })
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const idCounter = useRef(0)
  const nextId = useCallback((prefix: string) => `${prefix}-${++idCounter.current}`, [])

  const advanceGame = useCallback(
    (dt: number) => {
      setState((previous) => {
        if (previous.phase !== 'playing' || previous.isPaused || previous.pendingDirectionCell) {
          return previous
        }

        const next: GameState = {
          ...previous,
          elapsedTime: previous.elapsedTime + dt,
          waveElapsed: previous.waveElapsed + dt,
          dpAccumulator: previous.dpAccumulator + dt,
          deployedUnits: previous.deployedUnits.map((unit) => ({
            ...unit,
            blockedEnemyIds: [...unit.blockedEnemyIds],
            cooldown: Math.max(0, unit.cooldown - dt * 1000),
          })),
          enemies: previous.enemies.map((enemy) => ({
            ...enemy,
            cooldown: Math.max(0, enemy.cooldown - dt * 1000),
          })),
          currentHand: tickHandSlots(
            previous.currentHand,
            dt,
            previous.deployedUnits.map((unit) => unit.definitionId),
          ),
          effects: previous.effects
            .map((effect) => ({ ...effect, ttl: effect.ttl - dt }))
            .filter((effect) => effect.ttl > 0),
        }

        const generatedDp = Math.floor(next.dpAccumulator)
        if (generatedDp > 0) {
          next.dp += generatedDp
          next.dpAccumulator -= generatedDp
        }

        const wave = WAVES[next.currentWave]
        while (
          next.waveSpawnIndex < wave.spawns.length &&
          wave.spawns[next.waveSpawnIndex].delay <= next.waveElapsed
        ) {
          const spawn = wave.spawns[next.waveSpawnIndex]
          const position = positionOnPath(0)
          const definition = ENEMY_DEFINITIONS[spawn.enemyId]
          next.enemies.push({
            instanceId: nextId('enemy'),
            definitionId: spawn.enemyId,
            hp: definition.maxHp,
            pathProgress: 0,
            x: position.x,
            y: position.y,
            row: position.row,
            col: position.col,
            cooldown: 0,
          })
          next.waveSpawnIndex += 1
        }

        const leakedIds = new Set<string>()
        for (const enemy of next.enemies) {
          if (enemy.blockedByUnitId) {
            const blocker = next.deployedUnits.find(
              (unit) => unit.instanceId === enemy.blockedByUnitId,
            )
            if (!blocker) enemy.blockedByUnitId = undefined
          }

          if (!enemy.blockedByUnitId) {
            const definition = ENEMY_DEFINITIONS[enemy.definitionId]
            enemy.pathProgress += definition.speed * dt
            if (enemy.pathProgress >= PATH.length - 1) {
              leakedIds.add(enemy.instanceId)
              next.life -= definition.leakDamage
              continue
            }

            Object.assign(enemy, positionOnPath(enemy.pathProgress))
            const blocker = next.deployedUnits.find((unit) => {
              const unitDefinition = UNIT_DEFINITIONS[unit.definitionId]
              const pathIndex = pathIndexForCell(unit.row, unit.col)
              return (
                unitDefinition.type === 'melee' &&
                pathIndex >= 0 &&
                Math.abs(enemy.pathProgress - pathIndex) <= 0.2 &&
                unit.blockedEnemyIds.length < unitDefinition.block
              )
            })
            if (blocker) {
              enemy.blockedByUnitId = blocker.instanceId
              enemy.pathProgress = pathIndexForCell(blocker.row, blocker.col)
              Object.assign(enemy, positionOnPath(enemy.pathProgress))
              blocker.blockedEnemyIds.push(enemy.instanceId)
            }
          }
        }
        next.enemies = next.enemies.filter((enemy) => !leakedIds.has(enemy.instanceId))

        for (const unit of next.deployedUnits) {
          if (unit.cooldown > 0) continue
          const definition = UNIT_DEFINITIONS[unit.definitionId]

          if (definition.type === 'medic') {
            const target = next.deployedUnits
              .filter(
                (candidate) =>
                  candidate.hp < UNIT_DEFINITIONS[candidate.definitionId].maxHp &&
                  manhattanDistance(unit, candidate) <= definition.range,
              )
              .sort(
                (a, b) =>
                  a.hp / UNIT_DEFINITIONS[a.definitionId].maxHp -
                  b.hp / UNIT_DEFINITIONS[b.definitionId].maxHp,
              )[0]
            if (target) {
              const targetDefinition = UNIT_DEFINITIONS[target.definitionId]
              target.hp = Math.min(targetDefinition.maxHp, target.hp + (definition.heal ?? 0))
              unit.cooldown = definition.attackInterval
              addEffect(
                next.effects,
                nextId('fx'),
                'heal',
                unit.col,
                unit.row,
                target.col,
                target.row,
              )
            }
            continue
          }

          const candidates = next.enemies
            .filter((enemy) => {
              if (
                definition.type === 'ranged' ||
                definition.type === 'support' ||
                definition.type === 'trap'
              ) {
                return (
                  Math.abs(unit.row - enemy.y) + Math.abs(unit.col - enemy.x) <= definition.range
                )
              }
              const facing = getFacingCell(unit, unit.direction ?? 'right')
              return (
                enemy.blockedByUnitId === unit.instanceId ||
                (enemy.row === facing.row && enemy.col === facing.col)
              )
            })
            .sort((a, b) => b.pathProgress - a.pathProgress)

          const target = candidates[0]
          if (target) {
            const enemyDefinition = ENEMY_DEFINITIONS[target.definitionId]
            const damage = calculateDamage(
              (definition.attack ?? 0) * traitDamageMultiplier(unit.definitionId, target.definitionId),
              hasTag(unit.definitionId, 'debuff') ? enemyDefinition.defense * 0.78 : enemyDefinition.defense,
              definition.damageType ?? 'physical',
            )
            target.hp -= damage
            if (definition.tags.includes('splash')) {
              for (const enemy of next.enemies) {
                if (enemy.instanceId !== target.instanceId && manhattanDistance(enemy, target) <= 1) {
                  enemy.hp -= damage * 0.35
                }
              }
            }
            if (definition.tags.includes('slow') || definition.tags.includes('aoe-slow')) {
              target.pathProgress = Math.max(0, target.pathProgress - 0.12)
              target.cooldown = Math.max(target.cooldown, 180)
            }
            if (definition.tags.includes('stun') || definition.tags.includes('control')) {
              target.cooldown = Math.max(target.cooldown, 550)
            }
            if (definition.tags.includes('trap')) {
              unit.hp = 0
            }
            unit.cooldown = definition.attackInterval
            addEffect(
              next.effects,
              nextId('fx'),
              definition.damageType === 'arts'
                ? 'arts'
                : definition.type === 'ranged' || definition.type === 'support'
                  ? 'shot'
                  : 'attack',
              unit.col,
              unit.row,
              target.x,
              target.y,
              definition.type === 'ranged' && definition.damageType !== 'arts' ? 0.34 : 0.22,
            )
          }
        }

        for (const enemy of next.enemies) {
          if (!enemy.blockedByUnitId || enemy.cooldown > 0 || enemy.hp <= 0) continue
          const target = next.deployedUnits.find(
            (unit) => unit.instanceId === enemy.blockedByUnitId,
          )
          if (!target) continue
          const definition = ENEMY_DEFINITIONS[enemy.definitionId]
          target.hp -= definition.attack
          enemy.cooldown = definition.attackInterval
          addEffect(next.effects, nextId('fx'), 'impact', enemy.x, enemy.y, target.col, target.row)
        }

        const defeatedEnemyIds = new Set(
          next.enemies.filter((enemy) => enemy.hp <= 0).map((enemy) => enemy.instanceId),
        )
        if (defeatedEnemyIds.size > 0) {
          for (const enemy of next.enemies) {
            if (defeatedEnemyIds.has(enemy.instanceId)) {
              next.dp += ENEMY_DEFINITIONS[enemy.definitionId].rewardDp
              next.kills += 1
              if (next.deployedUnits.some((unit) => hasTag(unit.definitionId, 'dp'))) {
                next.dp += 1
              }
            }
          }
          for (const unit of next.deployedUnits) {
            unit.blockedEnemyIds = unit.blockedEnemyIds.filter((id) => !defeatedEnemyIds.has(id))
          }
          next.enemies = next.enemies.filter((enemy) => !defeatedEnemyIds.has(enemy.instanceId))
        }

        const defeatedUnitIds = new Set(
          next.deployedUnits.filter((unit) => unit.hp <= 0).map((unit) => unit.instanceId),
        )
        if (defeatedUnitIds.size > 0) {
          next.deployedUnits = next.deployedUnits.filter(
            (unit) => !defeatedUnitIds.has(unit.instanceId),
          )
          for (const enemy of next.enemies) {
            if (enemy.blockedByUnitId && defeatedUnitIds.has(enemy.blockedByUnitId)) {
              enemy.blockedByUnitId = undefined
            }
          }
          if (next.selectedDeployedId && defeatedUnitIds.has(next.selectedDeployedId)) {
            next.selectedDeployedId = undefined
          }
        }

        for (const unit of next.deployedUnits) {
          if (hasTag(unit.definitionId, 'regen')) {
            const definition = UNIT_DEFINITIONS[unit.definitionId]
            unit.hp = Math.min(definition.maxHp, unit.hp + 8 * dt)
          }
        }

        if (next.life <= 0) {
          next.life = 0
          next.phase = 'defeat'
          next.isPaused = false
          next.selectedUnitId = undefined
          next.pendingDirectionCell = undefined
          return next
        }

        const waveComplete =
          next.waveSpawnIndex >= wave.spawns.length && next.enemies.length === 0
        if (waveComplete) {
          if (next.currentWave >= WAVES.length - 1) {
            next.phase = 'victory'
            next.selectedUnitId = undefined
            next.pendingDirectionCell = undefined
          } else {
            next.intermission += dt
            if (next.intermission >= 3) {
              next.currentWave += 1
              next.waveElapsed = 0
              next.waveSpawnIndex = 0
              next.intermission = 0
              next.message = `第 ${String(next.currentWave + 1).padStart(2, '0')} 波已启动`
            }
          }
        } else {
          next.intermission = 0
        }

        return next
      })
    },
    [nextId],
  )

  useGameLoop(
    advanceGame,
    state.phase === 'playing' && !state.isPaused && !state.pendingDirectionCell,
    state.speedMultiplier,
  )

  useEffect(() => {
    if (!state.message) return
    const timeout = window.setTimeout(
      () => setState((current) => ({ ...current, message: undefined })),
      2200,
    )
    return () => window.clearTimeout(timeout)
  }, [state.message])

  const startGame = () => setState(createInitialState('playing'))
  const restartGame = () => setState(createInitialState('playing'))

  const selectUnit = (unitId: UnitId) => {
    setState((current) => {
      if (current.phase !== 'playing' || current.isPaused) return current
      const definition = UNIT_DEFINITIONS[unitId]
      if (!definition || !isUnitInHand(current, unitId)) return current
      if (current.deployedUnits.length >= DEPLOY_LIMIT) {
        return { ...current, message: '已达到部署上限' }
      }
      if (current.dp < definition.cost) {
        return { ...current, message: 'DP 不足' }
      }
      return {
        ...current,
        selectedUnitId: current.selectedUnitId === unitId ? undefined : unitId,
        selectedDeployedId: undefined,
        pendingDirectionCell: undefined,
        message: undefined,
      }
    })
  }

  const beginUnitDrag = (unitId: UnitId) => {
    setState((current) => {
      if (current.phase !== 'playing' || current.isPaused) return current
      const definition = UNIT_DEFINITIONS[unitId]
      if (!definition || !isUnitInHand(current, unitId)) return current
      if (current.deployedUnits.length >= DEPLOY_LIMIT) {
        return { ...current, message: '已达到部署上限' }
      }
      if (current.dp < definition.cost) {
        return { ...current, message: 'DP 不足' }
      }
      return {
        ...current,
        selectedUnitId: unitId,
        selectedDeployedId: undefined,
        pendingDirectionCell: undefined,
        message: '拖拽至高亮格子部署',
      }
    })
  }

  const validateDeployment = (current: GameState, unitId: UnitId, row: number, col: number) => {
    const definition = UNIT_DEFINITIONS[unitId]
    const cell = getCell(row, col)
    if (!definition || !isUnitInHand(current, unitId)) return '模块正在刷新'
    if (
      !cell ||
      !cell.deployableTypes.includes(definition.type) ||
      !definition.deployOn.includes(cell.type)
    ) {
      return '该格无法部署此模块'
    }
    if (current.deployedUnits.some((unit) => unit.row === row && unit.col === col)) {
      return '该格已有模块'
    }
    if (current.dp < definition.cost) return 'DP 不足'
    if (current.deployedUnits.length >= DEPLOY_LIMIT) return '已达到部署上限'
    return undefined
  }

  const deploy = (
    current: GameState,
    unitId: UnitId,
    row: number,
    col: number,
    direction?: Direction,
  ): GameState => {
    const definition = UNIT_DEFINITIONS[unitId]
    const unit: DeployedUnit = {
      instanceId: nextId('unit'),
      definitionId: unitId,
      row,
      col,
      direction,
      hp: definition.maxHp,
      blockedEnemyIds: [],
      cooldown: 250,
    }
    const next = {
      ...current,
      dp: current.dp - definition.cost,
      deployedUnits: [...current.deployedUnits, unit],
      deployCount: current.deployCount + 1,
      currentHand: consumeHandSlot(current.currentHand, unitId),
      selectedUnitId: undefined,
      selectedDeployedId: unit.instanceId,
      pendingDirectionCell: undefined,
      message: `${definition.name} 已上线`,
    }
    applyDeploymentTrait(next, unit)
    return next
  }

  const clickCell = (row: number, col: number) => {
    setState((current) => {
      if (current.phase !== 'playing' || current.isPaused) return current
      if (current.selectedUnitId) {
        const error = validateDeployment(current, current.selectedUnitId, row, col)
        if (error) return { ...current, message: error }
        const definition = UNIT_DEFINITIONS[current.selectedUnitId]
        if (definition.type === 'melee') {
          return {
            ...current,
            pendingDirectionCell: { row, col, unitId: current.selectedUnitId },
            message: '请选择模块朝向',
          }
        }
        return deploy(current, current.selectedUnitId, row, col)
      }
      const unit = current.deployedUnits.find((item) => item.row === row && item.col === col)
      return {
        ...current,
        selectedDeployedId:
          current.selectedDeployedId === unit?.instanceId ? undefined : unit?.instanceId,
        pendingDirectionCell: undefined,
      }
    })
  }

  const chooseDirection = (direction: Direction) => {
    setState((current) => {
      const pending = current.pendingDirectionCell
      if (!pending || current.isPaused || current.phase !== 'playing') return current
      const error = validateDeployment(current, pending.unitId, pending.row, pending.col)
      if (error) return { ...current, pendingDirectionCell: undefined, message: error }
      return deploy(current, pending.unitId, pending.row, pending.col, direction)
    })
  }

  const retreatSelected = () => {
    setState((current) => {
      if (!current.selectedDeployedId || current.isPaused || current.phase !== 'playing') {
        return current
      }
      const unit = current.deployedUnits.find(
        (item) => item.instanceId === current.selectedDeployedId,
      )
      if (!unit) return current
      const definition = UNIT_DEFINITIONS[unit.definitionId]
      const refund = Math.floor(definition.cost * (definition.tags.includes('retreat') ? 0.8 : 0.5))
      return {
        ...current,
        dp: current.dp + refund,
        deployedUnits: current.deployedUnits.filter(
          (item) => item.instanceId !== current.selectedDeployedId,
        ),
        enemies: current.enemies.map((enemy) =>
          enemy.blockedByUnitId === current.selectedDeployedId
            ? { ...enemy, blockedByUnitId: undefined }
            : enemy,
        ),
        selectedDeployedId: undefined,
        message: `模块已撤回 / +${refund} DP`,
      }
    })
  }

  const togglePause = () =>
    setState((current) =>
      current.phase === 'playing'
        ? {
            ...current,
            isPaused: !current.isPaused,
            selectedUnitId: undefined,
            pendingDirectionCell: undefined,
          }
        : current,
    )

  const toggleSpeed = () =>
    setState((current) => ({
      ...current,
      speedMultiplier: current.speedMultiplier === 1 ? 2 : 1,
    }))

  const cancelSelection = () =>
    setState((current) => ({
      ...current,
      selectedUnitId: undefined,
      selectedDeployedId: undefined,
      pendingDirectionCell: undefined,
    }))

  return {
    state,
    actions: {
      startGame,
      restartGame,
      selectUnit,
      beginUnitDrag,
      clickCell,
      chooseDirection,
      retreatSelected,
      togglePause,
      toggleSpeed,
      cancelSelection,
    },
  }
}
