interface StartScreenProps {
  onStart: () => void
  onOpenEditor?: () => void
}

export function StartScreen({ onStart, onOpenEditor }: StartScreenProps) {
  return (
    <main className="start-screen">
      <div className="start-grid" aria-hidden="true">
        {Array.from({ length: 96 }, (_, index) => (
          <span key={index} className={index % 13 === 0 || index % 17 === 0 ? 'lit' : ''} />
        ))}
      </div>
      <div className="start-content">
        <span className="start-index">Experiment / 001</span>
        <div className="title-lockup">
          <span>DELEE LAB PRESENTS</span>
          <h1>
            GRID DEFENSE
            <b>LAB-01</b>
          </h1>
        </div>
        <div className="briefing">
          <span>Directive</span>
          <p>Deploy tactical modules, resist hostile waves, and keep the core intact.</p>
        </div>
        <div className="start-actions">
          <button className="start-button" onClick={onStart}>
            <span>Start Operation</span>
            <b>-&gt;</b>
          </button>
          {onOpenEditor && (
            <button className="start-button start-button-secondary" onClick={onOpenEditor}>
              <span>Level Editor</span>
              <b>-&gt;</b>
            </button>
          )}
        </div>
        <div className="start-footer">
          <span>Version / 01.26</span>
          <span>Status / Ready</span>
          <span>Frontend simulation only</span>
        </div>
      </div>
    </main>
  )
}
