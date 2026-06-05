import { BRUSHES, type BrushType } from './editorTypes'

interface BrushPanelProps {
  activeBrush: BrushType
  onBrushChange: (brush: BrushType) => void
}

export function BrushPanel({ activeBrush, onBrushChange }: BrushPanelProps) {
  const activeBrushLabel = BRUSHES.find((brush) => brush.id === activeBrush)?.label ?? activeBrush

  return (
    <section className="editor-panel brush-panel">
      <div className="editor-panel-heading">
        <span>画笔</span>
        <strong>{activeBrushLabel}</strong>
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
