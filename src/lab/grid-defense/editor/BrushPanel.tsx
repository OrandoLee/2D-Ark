import { BRUSHES, type BrushType } from './editorTypes'

interface BrushPanelProps {
  activeBrush: BrushType
  onBrushChange: (brush: BrushType) => void
}

export function BrushPanel({ activeBrush, onBrushChange }: BrushPanelProps) {
  return (
    <section className="editor-panel brush-panel">
      <div className="editor-panel-heading">
        <span>Brush</span>
        <strong>{activeBrush}</strong>
      </div>
      <div className="brush-grid">
        {BRUSHES.map((brush) => (
          <button
            key={brush.id}
            className={`brush-button brush-${brush.id} ${activeBrush === brush.id ? 'active' : ''}`}
            title={brush.hint}
            onClick={() => onBrushChange(brush.id)}
          >
            <span />
            <b>{brush.label}</b>
          </button>
        ))}
      </div>
    </section>
  )
}
