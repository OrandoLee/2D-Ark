import type { LevelDefinition } from '../../../types/level'
import { MAX_COLS, MAX_ROWS, MIN_COLS, MIN_ROWS } from './levelSchema'

interface LevelSettingsPanelProps {
  level: LevelDefinition
  onChange: (level: LevelDefinition) => void
  onResize: (rows: number, cols: number) => void
}

const difficulties = ['easy', 'normal', 'hard', 'extreme'] as const
const rarityKeys = ['common', 'uncommon', 'rare', 'epic', 'prototype'] as const
const difficultyNames = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
  extreme: '极限',
}
const rarityNames = {
  common: '普通权重',
  uncommon: '优秀权重',
  rare: '稀有权重',
  epic: '史诗权重',
  prototype: '原型权重',
}

export function LevelSettingsPanel({ level, onChange, onResize }: LevelSettingsPanelProps) {
  const update = <K extends keyof LevelDefinition>(key: K, value: LevelDefinition[K]) => {
    onChange({ ...level, [key]: value, updatedAt: new Date().toISOString() })
  }

  const updateHand = (key: keyof LevelDefinition['handConfig'], value: unknown) => {
    onChange({
      ...level,
      handConfig: { ...level.handConfig, [key]: value },
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <section className="editor-panel">
      <div className="editor-panel-heading">
        <span>关卡设置</span>
        <strong>{difficultyNames[level.difficulty]}</strong>
      </div>
      <div className="form-grid">
        <label>
          关卡 ID
          <input value={level.id} onChange={(event) => update('id', event.target.value)} />
        </label>
        <label>
          关卡名
          <input value={level.name} onChange={(event) => update('name', event.target.value)} />
        </label>
        <label className="wide">
          描述
          <textarea value={level.description} onChange={(event) => update('description', event.target.value)} />
        </label>
        <label>
          作者
          <input value={level.author} onChange={(event) => update('author', event.target.value)} />
        </label>
        <label>
          难度
          <select value={level.difficulty} onChange={(event) => update('difficulty', event.target.value as LevelDefinition['difficulty'])}>
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficultyNames[difficulty]}
              </option>
            ))}
          </select>
        </label>
        <label>
          行数
          <input
            type="number"
            min={MIN_ROWS}
            max={MAX_ROWS}
            value={level.rows}
            onChange={(event) => onResize(Number(event.target.value), level.cols)}
          />
        </label>
        <label>
          列数
          <input
            type="number"
            min={MIN_COLS}
            max={MAX_COLS}
            value={level.cols}
            onChange={(event) => onResize(level.rows, Number(event.target.value))}
          />
        </label>
        <label>
          初始生命
          <input type="number" value={level.initialLife} onChange={(event) => update('initialLife', Number(event.target.value))} />
        </label>
        <label>
          初始 DP
          <input type="number" value={level.initialDp} onChange={(event) => update('initialDp', Number(event.target.value))} />
        </label>
        <label>
          DP 回复 / 秒
          <input
            type="number"
            step="0.1"
            value={level.dpRegenPerSecond}
            onChange={(event) => update('dpRegenPerSecond', Number(event.target.value))}
          />
        </label>
        <label>
          部署上限
          <input type="number" value={level.deployLimit} onChange={(event) => update('deployLimit', Number(event.target.value))} />
        </label>
        <label>
          初始手牌数
          <input
            type="number"
            min={1}
            max={8}
            value={level.handConfig.initialHandSize}
            onChange={(event) => updateHand('initialHandSize', Number(event.target.value))}
          />
        </label>
        <label>
          槽位刷新时间（毫秒）
          <input
            type="number"
            value={level.handConfig.slotRefreshMs}
            onChange={(event) => updateHand('slotRefreshMs', Number(event.target.value))}
          />
        </label>
        {rarityKeys.map((rarity) => (
          <label key={rarity}>
            {rarityNames[rarity]}
            <input
              type="number"
              value={level.handConfig.rarityWeights[rarity]}
              onChange={(event) =>
                updateHand('rarityWeights', {
                  ...level.handConfig.rarityWeights,
                  [rarity]: Number(event.target.value),
                })
              }
            />
          </label>
        ))}
        <label className="wide">
          允许职业
          <input
            value={level.handConfig.allowedClasses?.join(',') ?? ''}
            onChange={(event) =>
              updateHand(
                'allowedClasses',
                event.target.value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>
        <label className="wide">
          禁用单位
          <input
            value={level.handConfig.bannedOperatorIds?.join(',') ?? ''}
            onChange={(event) =>
              updateHand(
                'bannedOperatorIds',
                event.target.value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>
      </div>
    </section>
  )
}
