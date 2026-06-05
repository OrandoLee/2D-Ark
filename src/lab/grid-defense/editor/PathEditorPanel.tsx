import type { EnemyPath, LevelDefinition } from '../../../types/level'

interface PathEditorPanelProps {
  level: LevelDefinition
  activePathId?: string
  onActivePathChange: (pathId: string) => void
  onAddPath: () => void
  onRenamePath: (pathId: string, name: string) => void
  onUndoPathPoint: (pathId: string) => void
  onClearPath: (pathId: string) => void
  onDeletePath: (pathId: string) => void
}

function pathStatus(path: EnemyPath) {
  if (path.points.length === 0) return 'empty'
  return `${path.points.length} points`
}

export function PathEditorPanel({
  level,
  activePathId,
  onActivePathChange,
  onAddPath,
  onRenamePath,
  onUndoPathPoint,
  onClearPath,
  onDeletePath,
}: PathEditorPanelProps) {
  return (
    <section className="editor-panel">
      <div className="editor-panel-heading">
        <span>Path Editor</span>
        <button onClick={onAddPath}>Add Path</button>
      </div>
      <div className="path-list">
        {level.paths.map((path) => (
          <div className={`path-card ${activePathId === path.id ? 'active' : ''}`} key={path.id}>
            <label>
              Name
              <input value={path.name} onChange={(event) => onRenamePath(path.id, event.target.value)} />
            </label>
            <div className="path-card-meta">
              <button onClick={() => onActivePathChange(path.id)}>Select</button>
              <button onClick={() => onUndoPathPoint(path.id)}>Undo Step</button>
              <button onClick={() => onClearPath(path.id)}>Clear</button>
              <button onClick={() => onDeletePath(path.id)}>Delete</button>
            </div>
            <small>
              {path.id} / {pathStatus(path)}
            </small>
          </div>
        ))}
        {level.paths.length === 0 && <p className="empty-note">No path yet. Add one, then use the Path brush.</p>}
      </div>
    </section>
  )
}
