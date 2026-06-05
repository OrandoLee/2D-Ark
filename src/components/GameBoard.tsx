import { useState } from 'react'
import { ENEMY_DEFINITIONS } from '../data/enemies'
import { UNIT_DEFINITIONS } from '../data/units'
import type { GameState } from '../types/game'
import { getFacingCell, manhattanDistance } from '../utils/range'
import { GridCell } from './GridCell'

interface GameBoardProps {
  state: GameState
  isDraggingUnit: boolean
  dragOverCell?: { row: number; col: number }
  onCellClick: (row: number, col: number) => void
}

export function GameBoard({ state, isDraggingUnit, dragOverCell, onCellClick }: GameBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number }>()
  const selectedDefinition = state.selectedUnitId
    ? UNIT_DEFINITIONS[state.selectedUnitId]
    : undefined
  const selectedDeployedUnit = state.deployedUnits.find(
    (unit) => unit.instanceId === state.selectedDeployedId,
  )
  const selectedDeployedDefinition = selectedDeployedUnit
    ? UNIT_DEFINITIONS[selectedDeployedUnit.definitionId]
    : undefined
  const previewCell = dragOverCell ?? hoveredCell
  const previewOrigin =
    selectedDefinition && previewCell && selectedDefinition.type !== 'melee'
      ? state.mapCells.find(
          (cell) =>
            cell.row === previewCell.row &&
            cell.col === previewCell.col &&
            cell.deployableTypes.includes(selectedDefinition.type) &&
            selectedDefinition.deployOn.includes(cell.type) &&
            !state.deployedUnits.some(
              (unit) => unit.row === previewCell.row && unit.col === previewCell.col,
            ),
        )
      : undefined
  const rangeOrigin = previewOrigin ?? selectedDeployedUnit
  const rangeDefinition = previewOrigin ? selectedDefinition : selectedDeployedDefinition
  const rangeSource = previewOrigin ? 'placement' : selectedDeployedUnit ? 'selected' : undefined

  const isCellInRange = (cell: { row: number; col: number }) => {
    if (!rangeOrigin || !rangeDefinition) return false
    if (rangeDefinition.type === 'melee') {
      const facing = getFacingCell(rangeOrigin, selectedDeployedUnit?.direction ?? 'right')
      return cell.row === facing.row && cell.col === facing.col
    }
    return manhattanDistance(cell, rangeOrigin) <= rangeDefinition.range
  }

  return (
    <div className="board-frame">
      <div
        className="board-coordinates board-coordinates-x"
        style={{ gridTemplateColumns: `repeat(${state.level.cols}, 1fr)` }}
      >
        {Array.from({ length: state.level.cols }, (_, index) => (
          <span key={index}>{String(index + 1).padStart(2, '0')}</span>
        ))}
      </div>
      <div
        className="board-coordinates board-coordinates-y"
        style={{ gridTemplateRows: `repeat(${state.level.rows}, 1fr)` }}
      >
        {Array.from({ length: state.level.rows }, (_, index) => (
          <span key={index}>{String.fromCharCode(65 + index)}</span>
        ))}
      </div>

      <div
        className="game-board"
        role="grid"
        aria-label={`${state.level.cols} 列 ${state.level.rows} 行战术网格`}
        style={{ gridTemplateColumns: `repeat(${state.level.cols}, 1fr)` }}
      >
        {state.mapCells.map((cell) => {
          const unit = state.deployedUnits.find(
            (item) => item.row === cell.row && item.col === cell.col,
          )
          const isLegal = selectedDefinition
            ? cell.deployableTypes.includes(selectedDefinition.type) &&
              selectedDefinition.deployOn.includes(cell.type) &&
              !unit
            : undefined
          const isInPreviewRange = isCellInRange(cell)
          return (
            <GridCell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              unit={unit}
              isLegal={isLegal}
              isInPreviewRange={isInPreviewRange}
              isPreviewOrigin={rangeOrigin?.row === cell.row && rangeOrigin.col === cell.col}
              previewType={rangeDefinition?.type}
              rangeSource={rangeSource}
              isDragging={isDraggingUnit}
              isDragOver={dragOverCell?.row === cell.row && dragOverCell?.col === cell.col}
              isSelected={unit?.instanceId === state.selectedDeployedId}
              onPointerEnter={() => setHoveredCell({ row: cell.row, col: cell.col })}
              onPointerLeave={() =>
                setHoveredCell((current) =>
                  current?.row === cell.row && current.col === cell.col ? undefined : current,
                )
              }
              onClick={() => onCellClick(cell.row, cell.col)}
            />
          )
        })}

        <div className="enemy-layer" aria-hidden="true">
          {state.enemies.map((enemy) => {
            const hp = Math.max(0, enemy.hp)
            const maxHp = ENEMY_HP[enemy.definitionId]
            return (
              <div
                className={`enemy enemy-${enemy.definitionId} ${
                  enemy.blockedByUnitId ? 'enemy-blocked' : ''
                }`}
                key={enemy.instanceId}
                style={{
                  left: `${((enemy.x + 0.5) / state.level.cols) * 100}%`,
                  top: `${((enemy.y + 0.5) / state.level.rows) * 100}%`,
                }}
              >
                <span className="hp-track">
                  <span style={{ width: `${(hp / maxHp) * 100}%` }} />
                </span>
                <i />
              </div>
            )
          })}
        </div>

        <svg
          className="effect-layer"
          viewBox={`0 0 ${state.level.cols} ${state.level.rows}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {state.effects.map((effect) => (
            <g key={effect.id} className={`effect effect-${effect.type}`}>
              {effect.type === 'shot' && (
                <line
                  className="effect-line effect-line-bloom"
                  x1={effect.fromX + 0.5}
                  y1={effect.fromY + 0.5}
                  x2={effect.toX + 0.5}
                  y2={effect.toY + 0.5}
                />
              )}
              <line
                className="effect-line"
                x1={effect.fromX + 0.5}
                y1={effect.fromY + 0.5}
                x2={effect.toX + 0.5}
                y2={effect.toY + 0.5}
              />
              {effect.type === 'shot' && (
                <circle
                  className="effect-muzzle"
                  cx={effect.fromX + 0.5}
                  cy={effect.fromY + 0.5}
                  r="0.2"
                />
              )}
              {(effect.type === 'shot' || effect.type === 'arts') && (
                <>
                  <circle
                    className="effect-hit effect-hit-bloom"
                    cx={effect.toX + 0.5}
                    cy={effect.toY + 0.5}
                    r="0.26"
                  />
                  <circle
                    className="effect-hit"
                    cx={effect.toX + 0.5}
                    cy={effect.toY + 0.5}
                    r="0.16"
                  />
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

const ENEMY_HP = {
  runner: ENEMY_DEFINITIONS.runner.maxHp,
  soldier: ENEMY_DEFINITIONS.soldier.maxHp,
  heavy: ENEMY_DEFINITIONS.heavy.maxHp,
  'prototype-boss': ENEMY_DEFINITIONS['prototype-boss'].maxHp,
}
