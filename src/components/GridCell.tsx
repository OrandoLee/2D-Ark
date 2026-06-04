import { UNIT_DEFINITIONS } from '../data/units'
import type { DeployedUnit, GridCellData } from '../types/game'

interface GridCellProps {
  cell: GridCellData
  unit?: DeployedUnit
  isLegal?: boolean
  isSelected: boolean
  onClick: () => void
}

export function GridCell({ cell, unit, isLegal, isSelected, onClick }: GridCellProps) {
  const definition = unit ? UNIT_DEFINITIONS[unit.definitionId] : undefined
  const hpPercent = unit && definition ? (unit.hp / definition.maxHp) * 100 : 0
  const cellTypeNames = {
    blue: '地面',
    yellow: '高台',
    red: '禁用',
    spawn: '敌人入口',
    base: '核心',
  }

  return (
    <button
      className={[
        'grid-cell',
        `cell-${cell.type}`,
        cell.isPath ? 'cell-path' : '',
        isLegal === true ? 'deploy-legal' : '',
        isLegal === false ? 'deploy-illegal' : '',
        isSelected ? 'cell-selected' : '',
      ].join(' ')}
      onClick={onClick}
      role="gridcell"
      aria-label={`${cellTypeNames[cell.type]}格，第 ${cell.row + 1} 行，第 ${cell.col + 1} 列`}
    >
      {cell.isPath && <span className="path-node" />}
      {cell.type === 'spawn' && <span className="cell-code">入口</span>}
      {cell.type === 'base' && <span className="cell-code">核心</span>}
      {unit && definition && (
        <div className={`deployed-unit unit-${unit.definitionId}`}>
          <span className="hp-track unit-hp">
            <span style={{ width: `${hpPercent}%` }} />
          </span>
          <i className={`unit-mark direction-${unit.direction ?? 'none'}`}>
            <b>{definition.callsign}</b>
          </i>
          {definition.block > 0 && (
            <em>
              {unit.blockedEnemyIds.length}/{definition.block}
            </em>
          )}
        </div>
      )}
    </button>
  )
}
