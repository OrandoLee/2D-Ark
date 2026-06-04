import type { UnitDefinition } from '../types/game'

interface UnitCardProps {
  unit: UnitDefinition
  selected: boolean
  disabled: boolean
  onSelect: () => void
}

export function UnitCard({ unit, selected, disabled, onSelect }: UnitCardProps) {
  return (
    <button
      className={`unit-card ${selected ? 'selected' : ''}`}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="card-cost">{unit.cost} DP</span>
      <span className={`card-icon card-icon-${unit.id}`}>
        <i>{unit.callsign}</i>
      </span>
      <span className="card-copy">
        <strong>{unit.name}</strong>
        <small>{unit.type} / R{unit.range}</small>
      </span>
      <span className="card-stat">
        {unit.type === 'medic' ? `HEAL ${unit.heal}` : `ATK ${unit.attack}`}
      </span>
    </button>
  )
}
