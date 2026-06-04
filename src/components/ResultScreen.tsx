import type { GameState } from '../types/game'

interface ResultScreenProps {
  state: GameState
  onRestart: () => void
}

export function ResultScreen({ state, onRestart }: ResultScreenProps) {
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
        <span className="eyebrow">DELEE LAB / OPERATION REPORT</span>
        <h1>{state.phase === 'victory' ? 'OPERATION COMPLETE' : 'OPERATION FAILED'}</h1>
        <p>
          {state.phase === 'victory'
            ? 'All hostile signals neutralized. Core integrity maintained.'
            : 'Core integrity lost. Simulation terminated.'}
        </p>
        <div className="result-stats">
          <div>
            <span>Remaining Life</span>
            <strong>{state.life}</strong>
          </div>
          <div>
            <span>Total Kills</span>
            <strong>{state.kills}</strong>
          </div>
          <div>
            <span>Deploy Count</span>
            <strong>{state.deployCount}</strong>
          </div>
          <div>
            <span>Operation Time</span>
            <strong>{time}</strong>
          </div>
        </div>
        <div className="rating">
          <span>RATING</span>
          <strong>{rating}</strong>
        </div>
        <button className="start-button" onClick={onRestart}>
          <span>Restart Operation</span>
          <b>↻</b>
        </button>
      </div>
    </main>
  )
}
