import type { LevelDefinition } from '../../../types/level'

interface SavedLevelsPanelProps {
  savedLevels: LevelDefinition[]
  onRefresh: () => void
  onLoad: (level: LevelDefinition) => void
  onDuplicate: (level: LevelDefinition) => void
  onDelete: (levelId: string) => void
}

const difficultyNames = {
  easy: '简单',
  normal: '普通',
  hard: '困难',
  extreme: '极限',
}

export function SavedLevelsPanel({
  savedLevels,
  onRefresh,
  onLoad,
  onDuplicate,
  onDelete,
}: SavedLevelsPanelProps) {
  return (
    <section className="editor-panel">
      <div className="editor-panel-heading">
        <span>本地关卡</span>
        <button onClick={onRefresh}>刷新</button>
      </div>
      <div className="saved-list">
        {savedLevels.map((level) => (
          <div className="saved-card" key={level.id}>
            <strong>{level.name}</strong>
            <small>
              {difficultyNames[level.difficulty]} / {level.cols}x{level.rows} / {level.waves.length} 波
            </small>
            <small>{new Date(level.updatedAt).toLocaleString()}</small>
            <div>
              <button onClick={() => onLoad(level)}>读取</button>
              <button onClick={() => onDuplicate(level)}>复制</button>
              <button onClick={() => onDelete(level.id)}>删除</button>
            </div>
          </div>
        ))}
        {savedLevels.length === 0 && <p className="empty-note">还没有保存到本地的关卡。</p>}
      </div>
    </section>
  )
}
