import type { LevelCell } from '../../../types/level'

interface EditorCellProps {
  cell: LevelCell
  pathOrder?: number
  onPaint: (row: number, col: number) => void
  onPointerStart: (row: number, col: number) => void
  onPointerMove: (row: number, col: number) => void
}

export function EditorCell({
  cell,
  pathOrder,
  onPaint,
  onPointerStart,
  onPointerMove,
}: EditorCellProps) {
  return (
    <button
      className={`editor-cell cell-${cell.type} ${cell.isPath ? 'cell-path' : ''}`}
      title={`第 ${cell.row + 1} 行，第 ${cell.col + 1} 列`}
      onClick={() => onPaint(cell.row, cell.col)}
      onPointerDown={() => onPointerStart(cell.row, cell.col)}
      onPointerEnter={() => onPointerMove(cell.row, cell.col)}
      data-row={cell.row}
      data-col={cell.col}
    >
      {cell.type === 'spawn' && <span className="cell-code">入口</span>}
      {cell.type === 'base' && <span className="cell-code">核心</span>}
      {pathOrder !== undefined && <span className="editor-path-order">{pathOrder + 1}</span>}
    </button>
  )
}
