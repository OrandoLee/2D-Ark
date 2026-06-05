import { operatorCatalog } from '../data/operatorCatalog'
import type { HandSlot, OperatorRarity, UnitId } from '../types/game'

const HAND_REFRESH_SECONDS = 1.2

export const rarityWeights: Record<OperatorRarity, number> = {
  common: 48,
  uncommon: 28,
  rare: 16,
  epic: 7,
  prototype: 1,
}

interface DrawOptions {
  hand?: HandSlot[]
  deployedUnitIds?: UnitId[]
  excludeIds?: UnitId[]
}

function weightedRandomDraw(candidates = operatorCatalog) {
  const totalWeight = candidates.reduce((total, operator) => total + rarityWeights[operator.rarity], 0)
  let roll = Math.random() * totalWeight
  for (const operator of candidates) {
    roll -= rarityWeights[operator.rarity]
    if (roll <= 0) return operator
  }
  return candidates[candidates.length - 1]
}

export function drawOperator(options: DrawOptions = {}) {
  const reservedIds = new Set<UnitId>([
    ...(options.deployedUnitIds ?? []),
    ...(options.excludeIds ?? []),
    ...(options.hand ?? [])
      .flatMap((slot) => [slot.operatorId, slot.refreshRemaining > 0 ? slot.lastOperatorId : null])
      .filter((id): id is UnitId => Boolean(id)),
  ])
  const candidates = operatorCatalog.filter((operator) => !reservedIds.has(operator.id))
  const fallbackCandidates = operatorCatalog.filter(
    (operator) => operator.rarity === 'common' && !options.excludeIds?.includes(operator.id),
  )

  return weightedRandomDraw(candidates.length > 0 ? candidates : fallbackCandidates)
}

export function refillHandSlot(slot: HandSlot, hand: HandSlot[], deployedUnitIds: UnitId[] = []) {
  if (slot.locked) return slot
  const operator = drawOperator({
    hand,
    deployedUnitIds,
    excludeIds: [slot.lastOperatorId, slot.operatorId].filter((id): id is UnitId => Boolean(id)),
  })
  return {
    ...slot,
    operatorId: operator.id,
    refreshRemaining: 0,
    lastOperatorId: operator.id,
  }
}

export function initializeHand(deployedUnitIds: UnitId[] = []) {
  return Array.from({ length: 5 }, (_, index) => ({
    slotId: `hand-${index + 1}`,
    operatorId: null,
    refreshRemaining: 0,
  })).reduce<HandSlot[]>((hand, slot) => {
    const filledSlot = refillHandSlot(slot, hand, deployedUnitIds)
    hand.push(filledSlot)
    return hand
  }, [])
}

export function consumeHandSlot(hand: HandSlot[], operatorId: UnitId) {
  return hand.map((slot) =>
    slot.operatorId === operatorId && !slot.locked
      ? {
          ...slot,
          operatorId: null,
          refreshRemaining: HAND_REFRESH_SECONDS,
        }
      : slot,
  )
}

export function tickHandSlots(hand: HandSlot[], dt: number, deployedUnitIds: UnitId[] = []) {
  const nextHand = hand.map((slot) =>
    slot.refreshRemaining > 0
      ? { ...slot, refreshRemaining: Math.max(0, slot.refreshRemaining - dt) }
      : slot,
  )

  return nextHand.reduce<HandSlot[]>((updated, slot) => {
    const currentHand = [...updated, ...nextHand.slice(updated.length + 1)]
    updated.push(
      slot.operatorId === null && slot.refreshRemaining === 0
        ? refillHandSlot(slot, currentHand, deployedUnitIds)
        : slot,
    )
    return updated
  }, [])
}
