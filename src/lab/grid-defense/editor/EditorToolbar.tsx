import type { ValidationResult } from '../../../types/level'

interface EditorToolbarProps {
  validation: ValidationResult
  onBackToGame: () => void
  onNewLevel: () => void
  onSave: () => void
  onSaveAsNew: () => void
  onExport: () => void
  onPlaytest: () => void
}

export function EditorToolbar({
  validation,
  onBackToGame,
  onNewLevel,
  onSave,
  onSaveAsNew,
  onExport,
  onPlaytest,
}: EditorToolbarProps) {
  return (
    <div className="editor-toolbar">
      <div>
        <span className="eyebrow">DELEE LAB / 关卡生产</span>
        <h1>关卡编辑器</h1>
      </div>
      <div className="editor-toolbar-actions">
        <button onClick={onBackToGame}>返回游戏</button>
        <button onClick={onNewLevel}>新建关卡</button>
        <button onClick={onSave}>保存</button>
        <button onClick={onSaveAsNew}>另存为新关卡</button>
        <button onClick={onExport}>导出</button>
        <button className="primary" disabled={!validation.valid} onClick={onPlaytest}>
          试玩
        </button>
      </div>
    </div>
  )
}
