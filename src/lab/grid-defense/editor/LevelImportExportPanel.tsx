import type { LevelDefinition, ValidationResult } from '../../../types/level'

interface LevelImportExportPanelProps {
  level: LevelDefinition
  validation: ValidationResult
  exportText: string
  importText: string
  onExportJson: () => void
  onExportTypeScript: () => void
  onCopy: () => void
  onDownload: () => void
  onImportTextChange: (value: string) => void
  onImport: () => void
}

export function LevelImportExportPanel({
  level,
  validation,
  exportText,
  importText,
  onExportJson,
  onExportTypeScript,
  onCopy,
  onDownload,
  onImportTextChange,
  onImport,
}: LevelImportExportPanelProps) {
  return (
    <section className="editor-panel import-export-panel">
      <div className="editor-panel-heading">
        <span>Import / Export</span>
        <strong>v{level.version}</strong>
      </div>
      <div className="editor-button-row">
        <button onClick={onExportJson}>Export JSON</button>
        <button onClick={onExportTypeScript}>Export TS</button>
        <button onClick={onCopy}>Copy JSON</button>
        <button disabled={!validation.valid} onClick={onDownload}>
          Download JSON
        </button>
      </div>
      <textarea readOnly value={exportText} placeholder="Exported JSON appears here." />
      <textarea
        value={importText}
        placeholder="Paste LevelDefinition JSON here."
        onChange={(event) => onImportTextChange(event.target.value)}
      />
      <button onClick={onImport}>Import JSON</button>
    </section>
  )
}
