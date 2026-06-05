import type { GameState } from '../types/game'

interface ResultScreenProps {
  state: GameState
  onRestart: () => void
  onExitPlaytest?: () => void
}

export function ResultScreen({ state, onRestart, onExitPlaytest }: ResultScreenProps) {
  const rating =
    state.phase === 'defeat' ? 'D' : state.life >= 9 ? 'S' : state.life >= 6 ? 'A' : 'B'
  const time = `${Math.floor(state.elapsedTime / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(state.elapsedTime % 60)
    .toString()
    .padStart(2, '0')}`

  return (
    <main className={`result-screen result-${state.phase}`}>
      <div className="result-panel">
        <span className="eyebrow">DELEE LAB / Operation Report</span>
        <h1>{state.phase === 'victory' ? 'Operation Complete' : 'Operation Failed'}</h1>
        <p>
          {state.phase === 'victory'
            ? 'All hostile signals were cleared and the core remained intact.'
            : 'Core integrity reached zero. The simulation has stopped.'}
        </p>
        <div className="result-stats">
          <div>
            <span>Life</span>
            <strong>{state.life}</strong>
          </div>
          <div>
            <span>Kills</span>
            <strong>{state.kills}</strong>
          </div>
          <div>
            <span>Deploys</span>
            <strong>{state.deployCount}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{time}</strong>
          </div>
        </div>
        <div className="rating">
          <span>Rating</span>
          <strong>{rating}</strong>
        </div>
        <div className="result-actions">
          <button className="start-button" onClick={onRestart}>
            <span>Restart</span>
            <b>-&gt;</b>
          </button>
          {onExitPlaytest && (
            <button className="start-button start-button-secondary" onClick={onExitPlaytest}>
              <span>Back to Editor</span>
              <b>-&gt;</b>
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
