import { useEffect, useState } from 'react'
import { MAP_COLS, MAP_ROWS } from '../data/map'
import type { Direction, PendingCell } from '../types/game'

interface DirectionPickerProps {
  cell: PendingCell
  onChoose: (direction: Direction) => void
  onCancel: () => void
}

interface ScreenPoint {
  x: number
  y: number
}

const DIRECTION_LABELS: Record<Direction, string> = {
  up: '向上',
  down: '向下',
  left: '向左',
  right: '向右',
}

const DIRECTION_SYMBOLS: Record<Direction, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
}

function directionFromPointer(anchor: ScreenPoint, pointer: ScreenPoint): Direction {
  const dx = pointer.x - anchor.x
  const dy = pointer.y - anchor.y
  if (Math.abs(dx) > Math.abs(dy)) return dx >= 0 ? 'right' : 'left'
  return dy >= 0 ? 'down' : 'up'
}

function getCellCenter(cell: PendingCell): ScreenPoint {
  const board = document.querySelector('.game-board')?.getBoundingClientRect()
  if (!board) return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  return {
    x: board.left + ((cell.col + 0.5) / MAP_COLS) * board.width,
    y: board.top + ((cell.row + 0.5) / MAP_ROWS) * board.height,
  }
}

export function DirectionPicker({ cell, onChoose, onCancel }: DirectionPickerProps) {
  const [anchor, setAnchor] = useState<ScreenPoint>(() => getCellCenter(cell))
  const [pointer, setPointer] = useState<ScreenPoint>(() => ({
    x: getCellCenter(cell).x + 100,
    y: getCellCenter(cell).y,
  }))
  const [direction, setDirection] = useState<Direction>('right')

  useEffect(() => {
    const updateAnchor = () => setAnchor(getCellCenter(cell))
    window.addEventListener('resize', updateAnchor)
    return () => window.removeEventListener('resize', updateAnchor)
  }, [cell])

  const updatePointer = (x: number, y: number) => {
    const nextPointer = { x, y }
    setPointer(nextPointer)
    setDirection(directionFromPointer(anchor, nextPointer))
  }

  const lineLength = Math.hypot(pointer.x - anchor.x, pointer.y - anchor.y)
  const lineAngle = Math.atan2(pointer.y - anchor.y, pointer.x - anchor.x)

  return (
    <div
      className="direction-overlay"
      onPointerMove={(event) => updatePointer(event.clientX, event.clientY)}
      onClick={() => onChoose(direction)}
      onContextMenu={(event) => {
        event.preventDefault()
        onCancel()
      }}
    >
      <div className="direction-help">
        <span>部署朝向 / 模拟已暂停</span>
        <strong>移动鼠标选择方向，单击确认</strong>
        <small>敌人和战斗进程已冻结，右键可取消部署</small>
      </div>

      <div
        className="direction-line"
        style={{
          left: anchor.x,
          top: anchor.y,
          width: Math.min(lineLength, 180),
          transform: `rotate(${lineAngle}rad)`,
        }}
      />

      <div className="direction-anchor" style={{ left: anchor.x, top: anchor.y }}>
        {(['up', 'right', 'down', 'left'] as Direction[]).map((item) => (
          <span
            className={`direction-option direction-option-${item} ${
              item === direction ? 'active' : ''
            }`}
            key={item}
          >
            {DIRECTION_SYMBOLS[item]}
          </span>
        ))}
        <i />
      </div>

      <div className="direction-cursor" style={{ left: pointer.x, top: pointer.y }}>
        <b>{DIRECTION_SYMBOLS[direction]}</b>
        <span>{DIRECTION_LABELS[direction]}</span>
      </div>

      <button
        className="direction-cancel"
        onClick={(event) => {
          event.stopPropagation()
          onCancel()
        }}
      >
        取消部署
      </button>
    </div>
  )
}
