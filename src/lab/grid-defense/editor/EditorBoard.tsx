import { useMemo, useRef, useState } from 'react'
import type { LevelDefinition } from '../../../types/level'
import { EditorCell } from './EditorCell'

interface EditorBoardProps {
  level: LevelDefinition
  activePathId?: string
  onPaintCell: (row: number, col: number) => void
}

export function EditorBoard({ level, activePathId, onPaintCell }: EditorBoardProps) {
  const [isPainting, setIsPainting] = useState(false)
  const lastPaintedRef = useRef<string | undefined>(undefined)
  const pathOrder = useMemo(() => {
    const path = level.paths.find((item) => item.id === activePathId) ?? level.paths[0]
    const order = new Map<string, number>()
    path?.points.forEach((point, index) => order.set(`${point.row}-${point.col}`, index))
    return order
  }, [activePathId, level.paths])

  const paint = (row: number, col: number) => {
    const key = `${row}-${col}`
    if (lastPaintedRef.current === key) return
    lastPaintedRef.current = key
    onPaintCell(row, col)
  }

  return (
    <section className="editor-board-panel">
      <div className="editor-board-meta">
        <span>
          {level.cols} x {level.rows}
        </span>
        <span>悬停格子查看行列坐标</span>
      </div>
      <div className="editor-board-scroll">
        <div
          className="editor-board"
          style={{ gridTemplateColumns: `repeat(${level.cols}, minmax(38px, 1fr))` }}
          onPointerUp={() => {
            setIsPainting(false)
            lastPaintedRef.current = undefined
          }}
          onPointerLeave={() => {
            setIsPainting(false)
            lastPaintedRef.current = undefined
          }}
        >
          {level.grid.flat().map((cell) => (
            <EditorCell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              pathOrder={pathOrder.get(`${cell.row}-${cell.col}`)}
              onPaint={onPaintCell}
              onPointerStart={(row, col) => {
                setIsPainting(true)
                paint(row, col)
              }}
              onPointerMove={(row, col) => {
                if (isPainting) paint(row, col)
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
