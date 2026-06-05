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
        name: `Wave ${level.waves.length + 1}`,
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
        <span>Wave Editor</span>
        <button onClick={addWave}>Add Wave</button>
      </div>
      <div className="wave-list">
        {level.waves.map((wave) => (
          <div className="wave-card" key={wave.id}>
            <div className="wave-card-top">
              <input value={wave.name} onChange={(event) => updateWave(wave.id, { name: event.target.value })} />
              <label>
                Delay ms
                <input
                  type="number"
                  value={wave.delayAfterPreviousWave}
                  onChange={(event) => updateWave(wave.id, { delayAfterPreviousWave: Number(event.target.value) })}
                />
              </label>
              <button onClick={() => addEnemy(wave.id)}>Add Enemy</button>
              <button
                onClick={() =>
                  updateWaves([
                    ...level.waves,
                    {
                      ...wave,
                      id: createId('wave'),
                      name: `${wave.name} Copy`,
                      enemies: wave.enemies.map((enemy) => ({ ...enemy, id: createId('enemy') })),
                    },
                  ])
                }
              >
                Copy
              </button>
              <button onClick={() => updateWaves(level.waves.filter((item) => item.id !== wave.id))}>Delete</button>
            </div>
            <div className="enemy-row enemy-row-head">
              <span>Type</span>
              <span>Delay</span>
              <span>Count</span>
              <span>Interval</span>
              <span>Path</span>
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
