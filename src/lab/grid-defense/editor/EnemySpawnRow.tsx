import { ENEMY_DEFINITIONS } from '../../../data/enemies'
import type { EnemyId } from '../../../types/game'
import type { LevelDefinition, WaveEnemy } from '../../../types/level'

interface EnemySpawnRowProps {
  enemy: WaveEnemy
  level: LevelDefinition
  enemyTypes: EnemyId[]
  onChange: (enemy: WaveEnemy) => void
  onDuplicate: () => void
  onDelete: () => void
}

export function EnemySpawnRow({
  enemy,
  level,
  enemyTypes,
  onChange,
  onDuplicate,
  onDelete,
}: EnemySpawnRowProps) {
  return (
    <div className="enemy-row">
      <select value={enemy.enemyType} onChange={(event) => onChange({ ...enemy, enemyType: event.target.value as EnemyId })}>
        {enemyTypes.map((enemyType) => (
          <option key={enemyType} value={enemyType}>
            {ENEMY_DEFINITIONS[enemyType].name} / {enemyType}
          </option>
        ))}
      </select>
      <input
        type="number"
        title="延迟毫秒"
        value={enemy.delay}
        onChange={(event) => onChange({ ...enemy, delay: Number(event.target.value) })}
      />
      <input
        type="number"
        title="数量"
        value={enemy.count}
        onChange={(event) => onChange({ ...enemy, count: Number(event.target.value) })}
      />
      <input
        type="number"
        title="间隔毫秒"
        value={enemy.interval}
        onChange={(event) => onChange({ ...enemy, interval: Number(event.target.value) })}
      />
      <select value={enemy.pathId} onChange={(event) => onChange({ ...enemy, pathId: event.target.value })}>
        {level.paths.map((path) => (
          <option key={path.id} value={path.id}>
            {path.name}
          </option>
        ))}
      </select>
      <button onClick={onDuplicate}>复制</button>
      <button onClick={onDelete}>删除</button>
    </div>
  )
}
