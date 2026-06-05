import { ENEMY_DEFINITIONS } from '../../../data/enemies'
import type { EnemyId } from '../../../types/game'
import type { LevelDefinition, LevelWave, WaveEnemy } from '../../../types/level'
import { createId } from './levelSchema'
import { EnemySpawnRow } from './EnemySpawnRow'

interface WaveEditorPanelProps {
  level: LevelDefinition
  onChange: (level: LevelDefinition) => void
}

const enemyTypes = Object.keys(ENEMY_DEFINITIONS) as EnemyId[]

export function WaveEditorPanel({ level, onChange }: WaveEditorPanelProps) {
  const updateWaves = (waves: LevelWave[]) =>
    onChange({ ...level, waves, updatedAt: new Date().toISOString() })

  const addWave = () => {
    updateWaves([
      ...level.waves,
      {
        id: createId('wave'),
        name: `第 ${level.waves.length + 1} 波`,
        delayAfterPreviousWave: level.waves.length === 0 ? 0 : 3000,
        enemies: [],
      },
    ])
  }

  const updateWave = (waveId: string, patch: Partial<LevelWave>) => {
    updateWaves(level.waves.map((wave) => (wave.id === waveId ? { ...wave, ...patch } : wave)))
  }

  const addEnemy = (waveId: string) => {
    const pathId = level.paths[0]?.id ?? 'main'
    const enemy: WaveEnemy = {
      id: createId('enemy'),
      enemyType: enemyTypes[0],
      delay: 0,
      count: 1,
      interval: 1000,
      pathId,
    }
    updateWaves(
      level.waves.map((wave) =>
        wave.id === waveId ? { ...wave, enemies: [...wave.enemies, enemy] } : wave,
      ),
    )
  }

  return (
    <section className="editor-panel">
      <div className="editor-panel-heading">
        <span>波次编辑</span>
        <button onClick={addWave}>新增波次</button>
      </div>
      <div className="wave-list">
        {level.waves.map((wave) => (
          <div className="wave-card" key={wave.id}>
            <div className="wave-card-top">
              <input value={wave.name} onChange={(event) => updateWave(wave.id, { name: event.target.value })} />
              <label>
                等待时间（毫秒）
                <input
                  type="number"
                  value={wave.delayAfterPreviousWave}
                  onChange={(event) => updateWave(wave.id, { delayAfterPreviousWave: Number(event.target.value) })}
                />
              </label>
              <button onClick={() => addEnemy(wave.id)}>新增敌人组</button>
              <button
                onClick={() =>
                  updateWaves([
                    ...level.waves,
                    {
                      ...wave,
                      id: createId('wave'),
                      name: `${wave.name} 副本`,
                      enemies: wave.enemies.map((enemy) => ({ ...enemy, id: createId('enemy') })),
                    },
                  ])
                }
              >
                复制
              </button>
              <button onClick={() => updateWaves(level.waves.filter((item) => item.id !== wave.id))}>删除</button>
            </div>
            <div className="enemy-row enemy-row-head">
              <span>类型</span>
              <span>延迟</span>
              <span>数量</span>
              <span>间隔</span>
              <span>路径</span>
              <span />
              <span />
            </div>
            {wave.enemies.map((enemy) => (
              <EnemySpawnRow
                key={enemy.id}
                enemy={enemy}
                level={level}
                enemyTypes={enemyTypes}
                onChange={(nextEnemy) =>
                  updateWave(wave.id, {
                    enemies: wave.enemies.map((item) => (item.id === enemy.id ? nextEnemy : item)),
                  })
                }
                onDuplicate={() =>
                  updateWave(wave.id, {
                    enemies: [...wave.enemies, { ...enemy, id: createId('enemy') }],
                  })
                }
                onDelete={() =>
                  updateWave(wave.id, {
                    enemies: wave.enemies.filter((item) => item.id !== enemy.id),
                  })
                }
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
