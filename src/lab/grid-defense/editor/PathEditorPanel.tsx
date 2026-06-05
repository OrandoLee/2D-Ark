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
  if (path.points.length === 0) return '空路径'
  return `${path.points.length} 个点`
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
        <span>路径编辑</span>
        <button onClick={onAddPath}>新增路径</button>
      </div>
      <div className="path-list">
        {level.paths.map((path) => (
          <div className={`path-card ${activePathId === path.id ? 'active' : ''}`} key={path.id}>
            <label>
              名称
              <input value={path.name} onChange={(event) => onRenamePath(path.id, event.target.value)} />
            </label>
            <div className="path-card-meta">
              <button onClick={() => onActivePathChange(path.id)}>选择</button>
              <button onClick={() => onUndoPathPoint(path.id)}>撤销一步</button>
              <button onClick={() => onClearPath(path.id)}>清空</button>
              <button onClick={() => onDeletePath(path.id)}>删除</button>
            </div>
            <small>
              {path.id} / {pathStatus(path)}
            </small>
          </div>
        ))}
        {level.paths.length === 0 && <p className="empty-note">还没有路径。先新增路径，再使用路径画笔绘制。</p>}
      </div>
    </section>
  )
}
