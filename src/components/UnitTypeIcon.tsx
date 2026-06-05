import type { UnitType } from '../types/game'

interface UnitTypeIconProps {
  type: UnitType
}

export function UnitTypeIcon({ type }: UnitTypeIconProps) {
  if (type === 'melee') {
    return (
      <svg className="type-icon" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M22.8 4.5 27.5 9 14 22.5l-5.2 1.3 1.3-5.2L22.8 4.5Z" />
        <path d="m8 24-3 3M7.5 19.5l5 5" />
      </svg>
    )
  }

  if (type === 'ranged') {
    return (
      <svg className="type-icon" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="8" />
        <circle cx="16" cy="16" r="2.5" />
        <path d="M16 3v7M16 22v7M3 16h7M22 16h7" />
      </svg>
    )
  }

  if (type === 'support') {
    return (
      <svg className="type-icon" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M7 17h6l3-7 4 14 3-7h2" />
        <path d="M8 8h16M8 24h16" />
      </svg>
    )
  }

  if (type === 'trap') {
    return (
      <svg className="type-icon" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M7 24 16 6l9 18H7Z" />
        <path d="M16 13v5M16 22h.01" />
      </svg>
    )
  }

  return (
    <svg className="type-icon" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M12 5h8v7h7v8h-7v7h-8v-7H5v-8h7V5Z" />
      <path className="type-icon-pulse" d="M3 16h5l2-4 4 8 3-6 2 2h10" />
    </svg>
  )
}
