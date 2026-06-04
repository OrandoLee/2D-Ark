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
        <span className="rail-label">模块检查器</span>
        <div className="inspector-reticle" />
        <p>选择已部署模块，查看实时状态并执行撤回。</p>
      </div>
    )
  }

  const definition = UNIT_DEFINITIONS[unit.definitionId]
  return (
    <div className="unit-info">
      <span className="rail-label">模块检查器</span>
      <div className="info-title">
        <span>{definition.callsign}</span>
        <div>
          <strong>{definition.name}</strong>
          <small>{definition.description}</small>
        </div>
      </div>
      <div className="info-grid">
        <span>生命</span>
        <strong>
          {Math.ceil(unit.hp)} / {definition.maxHp}
        </strong>
        <span>{definition.type === 'medic' ? '治疗' : '攻击'}</span>
        <strong>{definition.heal ?? definition.attack}</strong>
        <span>间隔</span>
        <strong>{(definition.attackInterval / 1000).toFixed(1)} 秒</strong>
        <span>范围</span>
        <strong>{definition.range}</strong>
        <span>阻挡</span>
        <strong>
          {unit.blockedEnemyIds.length} / {definition.block}
        </strong>
      </div>
      <button className="retreat-button" onClick={onRetreat}>
        撤回 / +{Math.floor(definition.cost * 0.5)} DP
      </button>
    </div>
  )
}
