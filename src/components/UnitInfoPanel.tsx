import { UNIT_DEFINITIONS } from '../data/units'
import type { DeployedUnit } from '../types/game'

interface UnitInfoPanelProps {
  unit?: DeployedUnit
  onRetreat: () => void
}

export function UnitInfoPanel({ unit, onRetreat }: UnitInfoPanelProps) {
  if (!unit) {
    return (
      <div className="unit-info empty">
        <span className="rail-label">Module Inspector</span>
        <div className="inspector-reticle" />
        <p>Select a deployed module to inspect its live telemetry.</p>
      </div>
    )
  }

  const definition = UNIT_DEFINITIONS[unit.definitionId]
  return (
    <div className="unit-info">
      <span className="rail-label">Module Inspector</span>
      <div className="info-title">
        <span>{definition.callsign}</span>
        <div>
          <strong>{definition.name}</strong>
          <small>{definition.description}</small>
        </div>
      </div>
      <div className="info-grid">
        <span>HP</span>
        <strong>
          {Math.ceil(unit.hp)} / {definition.maxHp}
        </strong>
        <span>{definition.type === 'medic' ? 'HEAL' : 'ATK'}</span>
        <strong>{definition.heal ?? definition.attack}</strong>
        <span>INTERVAL</span>
        <strong>{(definition.attackInterval / 1000).toFixed(1)}s</strong>
        <span>RANGE</span>
        <strong>{definition.range}</strong>
        <span>BLOCK</span>
        <strong>
          {unit.blockedEnemyIds.length} / {definition.block}
        </strong>
      </div>
      <button className="retreat-button" onClick={onRetreat}>
        Recall / +{Math.floor(definition.cost * 0.5)} DP
      </button>
    </div>
  )
}
