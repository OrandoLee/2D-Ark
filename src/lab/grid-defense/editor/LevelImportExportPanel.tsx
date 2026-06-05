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
        <span>导入 / 导出</span>
        <strong>v{level.version}</strong>
      </div>
      <div className="editor-button-row">
        <button onClick={onExportJson}>导出 JSON</button>
        <button onClick={onExportTypeScript}>导出 TS</button>
        <button onClick={onCopy}>复制 JSON</button>
        <button disabled={!validation.valid} onClick={onDownload}>
          下载 JSON
        </button>
      </div>
      <textarea readOnly value={exportText} placeholder="导出的 JSON 会显示在这里。" />
      <textarea
        value={importText}
        placeholder="在这里粘贴 LevelDefinition JSON。"
        onChange={(event) => onImportTextChange(event.target.value)}
      />
      <button onClick={onImport}>导入 JSON</button>
    </section>
  )
}
