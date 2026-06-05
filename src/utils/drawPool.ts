import { operatorCatalog } from '../data/operatorCatalog'
import type { HandConfig } from '../types/level'
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
  handConfig?: HandConfig
}

function getWeights(handConfig?: HandConfig) {
  return handConfig?.rarityWeights ?? rarityWeights
}

function getPool(handConfig?: HandConfig) {
  return operatorCatalog.filter((operator) => {
    if (handConfig?.allowedClasses?.length && !handConfig.allowedClasses.includes(operator.classType)) {
      return false
    }
    if (handConfig?.bannedOperatorIds?.includes(operator.id)) return false
    return true
  })
}

function weightedRandomDraw(candidates = operatorCatalog, handConfig?: HandConfig) {
  const weights = getWeights(handConfig)
  const totalWeight = candidates.reduce((total, operator) => total + weights[operator.rarity], 0)
  let roll = Math.random() * totalWeight
  for (const operator of candidates) {
    roll -= weights[operator.rarity]
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
  const pool = getPool(options.handConfig)
  const candidates = pool.filter((operator) => !reservedIds.has(operator.id))
  const fallbackCandidates = pool.filter(
    (operator) => operator.rarity === 'common' && !options.excludeIds?.includes(operator.id),
  )

  return weightedRandomDraw(
    candidates.length > 0 ? candidates : fallbackCandidates.length > 0 ? fallbackCandidates : pool,
    options.handConfig,
  )
}

export function refillHandSlot(
  slot: HandSlot,
  hand: HandSlot[],
  deployedUnitIds: UnitId[] = [],
  handConfig?: HandConfig,
) {
  if (slot.locked) return slot
  const operator = drawOperator({
    hand,
    deployedUnitIds,
    excludeIds: [slot.lastOperatorId, slot.operatorId].filter((id): id is UnitId => Boolean(id)),
    handConfig,
  })
  return {
    ...slot,
    operatorId: operator.id,
    refreshRemaining: 0,
    lastOperatorId: operator.id,
  }
}

export function initializeHand(deployedUnitIds: UnitId[] = [], handConfig?: HandConfig) {
  return Array.from({ length: handConfig?.initialHandSize ?? 5 }, (_, index) => ({
    slotId: `hand-${index + 1}`,
    operatorId: null,
    refreshRemaining: 0,
  })).reduce<HandSlot[]>((hand, slot) => {
    const filledSlot = refillHandSlot(slot, hand, deployedUnitIds, handConfig)
    hand.push(filledSlot)
    return hand
  }, [])
}

export function consumeHandSlot(hand: HandSlot[], operatorId: UnitId, handConfig?: HandConfig) {
  const refreshSeconds = (handConfig?.slotRefreshMs ?? HAND_REFRESH_SECONDS * 1000) / 1000
  return hand.map((slot) =>
    slot.operatorId === operatorId && !slot.locked
      ? {
          ...slot,
          operatorId: null,
          refreshRemaining: refreshSeconds,
        }
      : slot,
  )
}

export function tickHandSlots(
  hand: HandSlot[],
  dt: number,
  deployedUnitIds: UnitId[] = [],
  handConfig?: HandConfig,
) {
  const nextHand = hand.map((slot) =>
    slot.refreshRemaining > 0
      ? { ...slot, refreshRemaining: Math.max(0, slot.refreshRemaining - dt) }
      : slot,
  )

  return nextHand.reduce<HandSlot[]>((updated, slot) => {
    const currentHand = [...updated, ...nextHand.slice(updated.length + 1)]
    updated.push(
      slot.operatorId === null && slot.refreshRemaining === 0
        ? refillHandSlot(slot, currentHand, deployedUnitIds, handConfig)
        : slot,
    )
    return updated
  }, [])
}
