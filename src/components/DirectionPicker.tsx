import type { Direction, PendingCell } from '../types/game'

interface DirectionPickerProps {
  cell: PendingCell
  onChoose: (direction: Direction) => void
  onCancel: () => void
}

export function DirectionPicker({ cell, onChoose, onCancel }: DirectionPickerProps) {
  const options: { value: Direction; symbol: string; label: string }[] = [
    { value: 'up', symbol: '↑', label: '向上' },
    { value: 'left', symbol: '←', label: '向左' },
    { value: 'right', symbol: '→', label: '向右' },
    { value: 'down', symbol: '↓', label: '向下' },
  ]

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="direction-picker" onClick={(event) => event.stopPropagation()}>
        <span className="eyebrow">需要设定朝向</span>
        <h2>选择攻击方向</h2>
        <p>
          目标格 {String.fromCharCode(65 + cell.row)}
          {String(cell.col + 1).padStart(2, '0')}
        </p>
        <div className="direction-grid">
          {options.map((option) => (
            <button key={option.value} onClick={() => onChoose(option.value)}>
              <b>{option.symbol}</b>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
        <button className="text-button" onClick={onCancel}>
          取消部署
        </button>
      </div>
    </div>
  )
}
