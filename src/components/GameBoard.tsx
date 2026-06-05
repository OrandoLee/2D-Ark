import { useState } from 'react'
import { MAP_CELLS, MAP_COLS, MAP_ROWS } from '../data/map'
import { UNIT_DEFINITIONS } from '../data/units'
import type { GameState } from '../types/game'
import { manhattanDistance } from '../utils/range'
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
  const previewCell = dragOverCell ?? hoveredCell
  const previewOrigin =
    selectedDefinition &&
    previewCell &&
    (selectedDefinition.type === 'ranged' || selectedDefinition.type === 'medic')
      ? MAP_CELLS.find(
          (cell) =>
            cell.row === previewCell.row &&
            cell.col === previewCell.col &&
            cell.deployableTypes.includes(selectedDefinition.type) &&
            !state.deployedUnits.some(
              (unit) => unit.row === previewCell.row && unit.col === previewCell.col,
            ),
        )
      : undefined

  return (
    <div className="board-frame">
      <div className="board-coordinates board-coordinates-x">
        {Array.from({ length: MAP_COLS }, (_, index) => (
          <span key={index}>{String(index + 1).padStart(2, '0')}</span>
        ))}
      </div>
      <div className="board-coordinates board-coordinates-y">
        {Array.from({ length: MAP_ROWS }, (_, index) => (
          <span key={index}>{String.fromCharCode(65 + index)}</span>
        ))}
      </div>

      <div className="game-board" role="grid" aria-label="十二列八行战术格子地图">
        {MAP_CELLS.map((cell) => {
          const unit = state.deployedUnits.find(
            (item) => item.row === cell.row && item.col === cell.col,
          )
          const isLegal = selectedDefinition
            ? cell.deployableTypes.includes(selectedDefinition.type) && !unit
            : undefined
          const isInPreviewRange =
            Boolean(previewOrigin && selectedDefinition) &&
            manhattanDistance(cell, previewOrigin!) <= selectedDefinition!.range
          return (
            <GridCell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              unit={unit}
              isLegal={isLegal}
              isInPreviewRange={isInPreviewRange}
              isPreviewOrigin={previewOrigin?.row === cell.row && previewOrigin.col === cell.col}
              previewType={previewOrigin ? selectedDefinition?.type : undefined}
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
                  left: `${((enemy.x + 0.5) / MAP_COLS) * 100}%`,
                  top: `${((enemy.y + 0.5) / MAP_ROWS) * 100}%`,
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
          viewBox={`0 0 ${MAP_COLS} ${MAP_ROWS}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {state.effects.map((effect) => (
            <g key={effect.id} className={`effect effect-${effect.type}`}>
              <line
                className="effect-line"
                x1={effect.fromX + 0.5}
                y1={effect.fromY + 0.5}
                x2={effect.toX + 0.5}
                y2={effect.toY + 0.5}
              />
              {(effect.type === 'shot' || effect.type === 'arts') && (
                <circle
                  className="effect-hit"
                  cx={effect.toX + 0.5}
                  cy={effect.toY + 0.5}
                  r="0.16"
                />
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

const ENEMY_HP = {
  runner: 180,
  soldier: 350,
  heavy: 900,
  'prototype-boss': 3000,
}
