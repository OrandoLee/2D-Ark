import type { Direction, PendingCell } from '../types/game'

interface DirectionPickerProps {
  cell: PendingCell
  onChoose: (direction: Direction) => void
  onCancel: () => void
}

export function DirectionPicker({ cell, onChoose, onCancel }: DirectionPickerProps) {
  const options: { value: Direction; symbol: string }[] = [
    { value: 'up', symbol: '↑' },
    { value: 'left', symbol: '←' },
    { value: 'right', symbol: '→' },
    { value: 'down', symbol: '↓' },
  ]

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="direction-picker" onClick={(event) => event.stopPropagation()}>
        <span className="eyebrow">Orientation Required</span>
        <h2>Select attack vector</h2>
        <p>
          Target cell {String.fromCharCode(65 + cell.row)}
          {String(cell.col + 1).padStart(2, '0')}
        </p>
        <div className="direction-grid">
          {options.map((option) => (
            <button key={option.value} onClick={() => onChoose(option.value)}>
              <b>{option.symbol}</b>
              <span>{option.value}</span>
            </button>
          ))}
        </div>
        <button className="text-button" onClick={onCancel}>
          Cancel deployment
        </button>
      </div>
    </div>
  )
}
