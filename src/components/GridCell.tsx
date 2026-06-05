import { UNIT_DEFINITIONS } from '../data/units'
import type { DeployedUnit, GridCellData, UnitType } from '../types/game'
import { UnitTypeIcon } from './UnitTypeIcon'

interface GridCellProps {
  cell: GridCellData
  unit?: DeployedUnit
  isLegal?: boolean
  isInPreviewRange: boolean
  isPreviewOrigin: boolean
  previewType?: UnitType
  rangeSource?: 'placement' | 'selected'
  isDragging: boolean
  isDragOver: boolean
  isSelected: boolean
  onPointerEnter: () => void
  onPointerLeave: () => void
  onClick: () => void
}

export function GridCell({
  cell,
  unit,
  isLegal,
  isInPreviewRange,
  isPreviewOrigin,
  previewType,
  rangeSource,
  isDragging,
  isDragOver,
  isSelected,
  onPointerEnter,
  onPointerLeave,
  onClick,
}: GridCellProps) {
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
        isInPreviewRange ? 'range-preview' : '',
        isInPreviewRange && previewType ? `range-preview-${previewType}` : '',
        isInPreviewRange && rangeSource ? `range-${rangeSource}` : '',
        isPreviewOrigin ? 'range-origin' : '',
        isDragging ? 'drag-active' : '',
        isDragOver ? 'drop-target' : '',
        isSelected ? 'cell-selected' : '',
      ].join(' ')}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={onClick}
      data-row={cell.row}
      data-col={cell.col}
      role="gridcell"
      aria-label={`${cellTypeNames[cell.type]}格，第 ${cell.row + 1} 行，第 ${cell.col + 1} 列`}
    >
      {cell.isPath && <span className="path-node" />}
      {cell.type === 'spawn' && <span className="cell-code">入口</span>}
      {cell.type === 'base' && <span className="cell-code">核心</span>}
      {unit && definition && (
        <div className={`deployed-unit unit-${unit.definitionId} type-${definition.type}`}>
          <span className="hp-track unit-hp">
            <span style={{ width: `${hpPercent}%` }} />
          </span>
          <i className={`unit-mark direction-${unit.direction ?? 'none'}`}>
            <UnitTypeIcon type={definition.type} />
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
