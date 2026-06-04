interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <main className="start-screen">
      <div className="start-grid" aria-hidden="true">
        {Array.from({ length: 96 }, (_, index) => (
          <span key={index} className={index % 13 === 0 || index % 17 === 0 ? 'lit' : ''} />
        ))}
      </div>
      <div className="start-content">
        <span className="start-index">EXPERIMENT INDEX / 001</span>
        <div className="title-lockup">
          <span>DELEE LAB PRESENTS</span>
          <h1>
            GRID DEFENSE
            <b>LAB-01</b>
          </h1>
          <p>A tactical grid experiment by DELEE LAB</p>
        </div>
        <div className="briefing">
          <span>Directive</span>
          <p>Deploy modular defenses. Contain five hostile waves. Preserve the core.</p>
        </div>
        <button className="start-button" onClick={onStart}>
          <span>Start Operation</span>
          <b>→</b>
        </button>
        <div className="start-footer">
          <span>BUILD 01.26</span>
          <span>STATUS / READY</span>
          <span>NO EXTERNAL SYSTEMS</span>
        </div>
      </div>
    </main>
  )
}
