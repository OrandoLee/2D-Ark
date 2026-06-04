import { UNIT_LIST } from '../data/units'
import { DEPLOY_LIMIT } from '../hooks/useGameState'
import type { UnitId } from '../types/game'
import { UnitCard } from './UnitCard'

interface UnitPanelProps {
  dp: number
  deployCount: number
  selectedUnitId?: UnitId
  disabled: boolean
  onSelect: (unitId: UnitId) => void
}

export function UnitPanel({
  dp,
  deployCount,
  selectedUnitId,
  disabled,
  onSelect,
}: UnitPanelProps) {
  return (
    <div className="unit-panel">
      <div className="panel-heading">
        <span className="eyebrow">作战模块库</span>
        <span>选择模块 → 选择格子 → 设定朝向</span>
      </div>
      <div className="unit-card-row">
        {UNIT_LIST.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            selected={selectedUnitId === unit.id}
            disabled={disabled || dp < unit.cost || deployCount >= DEPLOY_LIMIT}
            onSelect={() => onSelect(unit.id)}
          />
        ))}
      </div>
    </div>
  )
}
