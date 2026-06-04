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
  selectedUnitId: undefined,
  selectedDeployedId: undefined,
  pendingDirectionCell: undefined,
  speedMultiplier: 1,
  isPaused: false,
  effects: [],
  message: phase === 'playing' ? 'Wave 01 initialized' : undefined,
  elapsedTime: 0,
  deployCount: 0,
  waveElapsed: 0,
  waveSpawnIndex: 0,
  intermission: 0,
  dpAccumulator: 0,
})

function addEffect(
  effects: CombatEffect[],
  id: string,
  type: CombatEffect['type'],
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
) {
  effects.push({ id, type, fromX, fromY, toX, toY, ttl: 0.22 })
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const idCounter = useRef(0)
  const nextId = useCallback((prefix: string) => `${prefix}-${++idCounter.current}`, [])

  const advanceGame = useCallback(
    (dt: number) => {
      setState((previous) => {
        if (previous.phase !== 'playing' || previous.isPaused) return previous

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
              if (definition.type === 'ranged') {
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
              definition.attack ?? 0,
              enemyDefinition.defense,
              definition.damageType ?? 'physical',
            )
            target.hp -= damage
            unit.cooldown = definition.attackInterval
            addEffect(
              next.effects,
              nextId('fx'),
              definition.damageType === 'arts' ? 'arts' : 'attack',
              unit.col,
              unit.row,
              target.x,
              target.y,
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
              next.message = `Wave ${String(next.currentWave + 1).padStart(2, '0')} initialized`
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
    state.phase === 'playing' && !state.isPaused,
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
      if (current.deployedUnits.length >= DEPLOY_LIMIT) {
        return { ...current, message: 'Deploy limit reached' }
      }
      if (current.dp < definition.cost) {
        return { ...current, message: 'Not enough DP' }
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

  const validateDeployment = (current: GameState, unitId: UnitId, row: number, col: number) => {
    const definition = UNIT_DEFINITIONS[unitId]
    const cell = getCell(row, col)
    if (!cell || !cell.deployableTypes.includes(definition.type)) return 'Invalid deployment cell'
    if (current.deployedUnits.some((unit) => unit.row === row && unit.col === col)) {
      return 'Cell already occupied'
    }
    if (current.dp < definition.cost) return 'Not enough DP'
    if (current.deployedUnits.length >= DEPLOY_LIMIT) return 'Deploy limit reached'
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
    return {
      ...current,
      dp: current.dp - definition.cost,
      deployedUnits: [...current.deployedUnits, unit],
      deployCount: current.deployCount + 1,
      selectedUnitId: undefined,
      selectedDeployedId: unit.instanceId,
      pendingDirectionCell: undefined,
      message: `${definition.name} online`,
    }
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
            message: 'Select module direction',
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
      const refund = Math.floor(UNIT_DEFINITIONS[unit.definitionId].cost * 0.5)
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
        message: `Module recalled / +${refund} DP`,
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
      clickCell,
      chooseDirection,
      retreatSelected,
      togglePause,
      toggleSpeed,
      cancelSelection,
    },
  }
}
