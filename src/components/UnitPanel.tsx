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
  onPointerDragStart: (unitId: UnitId, x: number, y: number) => void
  onPointerDragMove: (x: number, y: number) => void
  onPointerDragEnd: (x: number, y: number) => void
}

export function UnitPanel({
  dp,
  deployCount,
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
        <span>拖拽模块至格子 → 移动鼠标设定朝向</span>
      </div>
      <div className="unit-card-row">
        {UNIT_LIST.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            selected={selectedUnitId === unit.id}
            disabled={disabled || dp < unit.cost || deployCount >= DEPLOY_LIMIT}
            onSelect={() => onSelect(unit.id)}
            onPointerDragStart={(x, y) => onPointerDragStart(unit.id, x, y)}
            onPointerDragMove={onPointerDragMove}
            onPointerDragEnd={onPointerDragEnd}
          />
        ))}
      </div>
    </div>
  )
}
