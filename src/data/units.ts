import { operatorCatalog } from './operatorCatalog'
import type { UnitDefinition, UnitId } from '../types/game'

export const UNIT_DEFINITIONS: Record<UnitId, UnitDefinition> = Object.fromEntries(
  operatorCatalog.map((unit) => [unit.id, unit]),
)

export const UNIT_LIST = operatorCatalog
