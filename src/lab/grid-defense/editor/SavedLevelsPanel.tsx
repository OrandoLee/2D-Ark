import type { LevelDefinition } from '../../../types/level'

interface SavedLevelsPanelProps {
  savedLevels: LevelDefinition[]
  onRefresh: () => void
  onLoad: (level: LevelDefinition) => void
  onDuplicate: (level: LevelDefinition) => void
  onDelete: (levelId: string) => void
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
        <span>Saved Levels</span>
        <button onClick={onRefresh}>Refresh</button>
      </div>
      <div className="saved-list">
        {savedLevels.map((level) => (
          <div className="saved-card" key={level.id}>
            <strong>{level.name}</strong>
            <small>
              {level.difficulty} / {level.cols}x{level.rows} / {level.waves.length} waves
            </small>
            <small>{new Date(level.updatedAt).toLocaleString()}</small>
            <div>
              <button onClick={() => onLoad(level)}>Load</button>
              <button onClick={() => onDuplicate(level)}>Duplicate</button>
              <button onClick={() => onDelete(level.id)}>Delete</button>
            </div>
          </div>
        ))}
        {savedLevels.length === 0 && <p className="empty-note">No local levels saved yet.</p>}
      </div>
    </section>
  )
}
