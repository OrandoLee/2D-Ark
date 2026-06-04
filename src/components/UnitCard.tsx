import { useRef } from 'react'
import type { UnitDefinition } from '../types/game'
import { UnitTypeIcon } from './UnitTypeIcon'

interface UnitCardProps {
  unit: UnitDefinition
  selected: boolean
  disabled: boolean
  onSelect: () => void
  onPointerDragStart: (x: number, y: number) => void
  onPointerDragMove: (x: number, y: number) => void
  onPointerDragEnd: (x: number, y: number) => void
}

export function UnitCard({
  unit,
  selected,
  disabled,
  onSelect,
  onPointerDragStart,
  onPointerDragMove,
  onPointerDragEnd,
}: UnitCardProps) {
  const pointerStart = useRef<{ x: number; y: number } | undefined>(undefined)
  const isDragging = useRef(false)
  const typeNames = {
    melee: '近战',
    ranged: '远程',
    medic: '医疗',
  }

  return (
    <button
      className={`unit-card type-${unit.type} ${selected ? 'selected' : ''}`}
      disabled={disabled}
      onClick={() => {
        if (!isDragging.current) onSelect()
      }}
      onPointerDown={(event) => {
        if (disabled || event.button !== 0) return
        pointerStart.current = { x: event.clientX, y: event.clientY }
        isDragging.current = false
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        const start = pointerStart.current
        if (!start) return
        if (!isDragging.current && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) {
          isDragging.current = true
          onPointerDragStart(event.clientX, event.clientY)
        }
        if (isDragging.current) onPointerDragMove(event.clientX, event.clientY)
      }}
      onPointerUp={(event) => {
        if (isDragging.current) onPointerDragEnd(event.clientX, event.clientY)
        pointerStart.current = undefined
        window.setTimeout(() => {
          isDragging.current = false
        }, 0)
      }}
      onPointerCancel={() => {
        pointerStart.current = undefined
        isDragging.current = false
      }}
    >
      <span className="card-cost">{unit.cost} DP</span>
      <span className={`card-icon card-icon-${unit.id}`}>
        <UnitTypeIcon type={unit.type} />
      </span>
      <span className="card-copy">
        <strong>{unit.name}</strong>
        <small>
          <b>{typeNames[unit.type]}</b>
          <span>范围 {unit.range}</span>
        </small>
      </span>
      <span className="card-stat">
        {unit.type === 'medic' ? `治疗 ${unit.heal}` : `攻击 ${unit.attack}`}
      </span>
    </button>
  )
}
