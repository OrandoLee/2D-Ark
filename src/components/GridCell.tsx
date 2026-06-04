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
      aria-label={`${cell.type} cell ${cell.row + 1}, ${cell.col + 1}`}
    >
      {cell.isPath && <span className="path-node" />}
      {cell.type === 'spawn' && <span className="cell-code">IN</span>}
      {cell.type === 'base' && <span className="cell-code">CORE</span>}
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
