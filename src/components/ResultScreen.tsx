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
        <span className="eyebrow">DELEE LAB / 行动报告</span>
        <h1>{state.phase === 'victory' ? '行动完成' : '行动失败'}</h1>
        <p>
          {state.phase === 'victory'
            ? '所有敌对信号均已清除，核心保持完整。'
            : '核心完整度归零，模拟行动已终止。'}
        </p>
        <div className="result-stats">
          <div>
            <span>剩余生命</span>
            <strong>{state.life}</strong>
          </div>
          <div>
            <span>总击杀数</span>
            <strong>{state.kills}</strong>
          </div>
          <div>
            <span>部署次数</span>
            <strong>{state.deployCount}</strong>
          </div>
          <div>
            <span>行动用时</span>
            <strong>{time}</strong>
          </div>
        </div>
        <div className="rating">
          <span>评级</span>
          <strong>{rating}</strong>
        </div>
        <button className="start-button" onClick={onRestart}>
          <span>重新开始行动</span>
          <b>↻</b>
        </button>
      </div>
    </main>
  )
}
