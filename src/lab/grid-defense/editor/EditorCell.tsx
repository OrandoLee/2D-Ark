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
      title={`row ${cell.row}, col ${cell.col}`}
      onClick={() => onPaint(cell.row, cell.col)}
      onPointerDown={() => onPointerStart(cell.row, cell.col)}
      onPointerEnter={() => onPointerMove(cell.row, cell.col)}
      data-row={cell.row}
      data-col={cell.col}
    >
      {cell.type === 'spawn' && <span className="cell-code">IN</span>}
      {cell.type === 'base' && <span className="cell-code">CORE</span>}
      {pathOrder !== undefined && <span className="editor-path-order">{pathOrder + 1}</span>}
    </button>
  )
}
