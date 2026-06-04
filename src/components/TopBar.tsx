import type { GameState } from '../types/game'

interface TopBarProps {
  state: GameState
  onPause: () => void
  onSpeed: () => void
  onRestart: () => void
}

export function TopBar({ state, onPause, onSpeed, onRestart }: TopBarProps) {
  const metrics = [
    { label: '生命', value: String(state.life).padStart(2, '0'), className: 'life' },
    { label: 'DP', value: String(state.dp).padStart(3, '0'), className: 'dp' },
    { label: '波次', value: `${state.currentWave + 1}/5`, className: 'wave' },
    { label: '击杀', value: String(state.kills).padStart(2, '0'), className: 'kills' },
    { label: '部署', value: `${state.deployedUnits.length}/6`, className: 'deploy' },
  ]

  return (
    <div className="top-bar">
      <div className="metrics">
        {metrics.map((metric) => (
          <div className={`metric metric-${metric.className}`} key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
      <div className="controls">
        <button onClick={onPause}>{state.isPaused ? '继续' : '暂停'}</button>
        <button className={state.speedMultiplier === 2 ? 'active' : ''} onClick={onSpeed}>
          倍速 {state.speedMultiplier}x
        </button>
        <button onClick={onRestart}>重新开始</button>
      </div>
    </div>
  )
}
