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
        <span className="eyebrow">DELEE LAB / Level Production</span>
        <h1>Level Editor</h1>
      </div>
      <div className="editor-toolbar-actions">
        <button onClick={onBackToGame}>Back to Game</button>
        <button onClick={onNewLevel}>New Level</button>
        <button onClick={onSave}>Save</button>
        <button onClick={onSaveAsNew}>Save As New</button>
        <button onClick={onExport}>Export</button>
        <button className="primary" disabled={!validation.valid} onClick={onPlaytest}>
          Playtest
        </button>
      </div>
    </div>
  )
}
