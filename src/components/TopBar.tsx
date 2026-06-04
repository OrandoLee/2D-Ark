import type { GameState } from '../types/game'

interface TopBarProps {
  state: GameState
  onPause: () => void
  onSpeed: () => void
  onRestart: () => void
}

export function TopBar({ state, onPause, onSpeed, onRestart }: TopBarProps) {
  const metrics = [
    ['Life', String(state.life).padStart(2, '0')],
    ['DP', String(state.dp).padStart(3, '0')],
    ['Wave', `${state.currentWave + 1}/5`],
    ['Kills', String(state.kills).padStart(2, '0')],
    ['Deploy', `${state.deployedUnits.length}/6`],
  ]

  return (
    <div className="top-bar">
      <div className="metrics">
        {metrics.map(([label, value]) => (
          <div className={`metric metric-${label.toLowerCase()}`} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={onPause}>{state.isPaused ? 'Resume' : 'Pause'}</button>
        <button className={state.speedMultiplier === 2 ? 'active' : ''} onClick={onSpeed}>
          Speed {state.speedMultiplier}x
        </button>
        <button onClick={onRestart}>Restart</button>
      </div>
    </div>
  )
}
