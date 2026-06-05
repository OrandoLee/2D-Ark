import { UNIT_DEFINITIONS } from '../data/units'
import type { HandSlot, UnitId } from '../types/game'
import { UnitCard } from './UnitCard'

interface UnitPanelProps {
  dp: number
  deployCount: number
  currentHand: HandSlot[]
  deployLimit: number
  selectedUnitId?: UnitId
  disabled: boolean
  onSelect: (unitId: UnitId) => void
  onPointerDragStart: (unitId: UnitId, x: number, y: number) => void
  onPointerDragMove: (x: number, y: number) => void
  onPointerDragEnd: (x: number, y: number) => void
}

export function UnitPanel({
  dp,
  deployCount,
  currentHand,
  deployLimit,
  selectedUnitId,
  disabled,
  onSelect,
  onPointerDragStart,
  onPointerDragMove,
  onPointerDragEnd,
}: UnitPanelProps) {
  return (
    <div className="unit-panel">
      <div className="panel-heading">
        <span className="eyebrow">作战模块库</span>
        <span>拖拽模块至格子，近战模块需设定朝向</span>
      </div>
      <div className="unit-card-row">
        {currentHand.map((slot) => {
          const unit = slot.operatorId ? UNIT_DEFINITIONS[slot.operatorId] : undefined
          return (
            <UnitCard
              key={slot.slotId}
              slot={slot}
              unit={unit}
              selected={Boolean(unit && selectedUnitId === unit.id)}
              disabled={disabled || !unit || dp < unit.cost || deployCount >= deployLimit}
              onSelect={() => unit && onSelect(unit.id)}
              onPointerDragStart={(x, y) => unit && onPointerDragStart(unit.id, x, y)}
              onPointerDragMove={onPointerDragMove}
              onPointerDragEnd={onPointerDragEnd}
            />
          )
        })}
      </div>
    </div>
  )
}
