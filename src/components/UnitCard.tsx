import { useRef } from 'react'
import type { HandSlot, UnitDefinition } from '../types/game'
import { UnitTypeIcon } from './UnitTypeIcon'

interface UnitCardProps {
  slot: HandSlot
  unit?: UnitDefinition
  selected: boolean
  disabled: boolean
  onSelect: () => void
  onPointerDragStart: (x: number, y: number) => void
  onPointerDragMove: (x: number, y: number) => void
  onPointerDragEnd: (x: number, y: number) => void
}

const typeNames = {
  melee: '近战',
  ranged: '远程',
  medic: '医疗',
  support: '辅助',
  trap: '陷阱',
}

const classNames = {
  vanguard: '先锋',
  guard: '近卫',
  defender: '重装',
  sniper: '狙击',
  caster: '术士',
  medic: '医疗',
  supporter: '辅助',
  specialist: '特种',
}

const rarityNames = {
  common: 'COMMON',
  uncommon: 'UNCOMMON',
  rare: 'RARE',
  epic: 'EPIC',
  prototype: 'PROTOTYPE',
}

export function UnitCard({
  slot,
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
  const refreshing = slot.refreshRemaining > 0
  const progress = Math.max(0, Math.min(1, 1 - slot.refreshRemaining / 1.2))

  if (!unit || refreshing) {
    return (
      <button className="unit-card unit-card-refreshing" disabled>
        <span className="card-refresh-title">刷新中</span>
        <span className="card-refresh-code">{slot.slotId.toUpperCase()}</span>
        <span className="refresh-track">
          <span style={{ width: `${progress * 100}%` }} />
        </span>
      </button>
    )
  }

  return (
    <button
      className={`unit-card type-${unit.type} rarity-${unit.rarity} ${selected ? 'selected' : ''}`}
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
        if (
          !isDragging.current &&
          Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6
        ) {
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
        <strong>{unit.cnName}</strong>
        <em>{unit.enName}</em>
        <small>
          <b>{classNames[unit.classType]}</b>
          <span>{typeNames[unit.type]}</span>
          <span>{rarityNames[unit.rarity]}</span>
        </small>
      </span>
      <span className="card-stat">
        <span>{unit.type === 'medic' ? `治疗 ${unit.heal}` : `攻击 ${unit.attack ?? 0}`}</span>
        <span>范围 {unit.range}</span>
      </span>
      <span className="card-trait">{unit.trait}</span>
    </button>
  )
}
