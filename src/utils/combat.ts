import type { DamageType } from '../types/game'

export function calculateDamage(attack: number, defense: number, type: DamageType) {
  if (type === 'arts') {
    return Math.max(attack - defense * 0.3, attack * 0.5)
  }
  return Math.max(attack - defense, attack * 0.2)
}
