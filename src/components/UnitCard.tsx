import type { UnitDefinition } from '../types/game'

interface UnitCardProps {
  unit: UnitDefinition
  selected: boolean
  disabled: boolean
  onSelect: () => void
}

export function UnitCard({ unit, selected, disabled, onSelect }: UnitCardProps) {
  const typeNames = {
    melee: '近战',
    ranged: '远程',
    medic: '医疗',
  }

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
        <small>{typeNames[unit.type]} / 范围 {unit.range}</small>
      </span>
      <span className="card-stat">
        {unit.type === 'medic' ? `治疗 ${unit.heal}` : `攻击 ${unit.attack}`}
      </span>
    </button>
  )
}
