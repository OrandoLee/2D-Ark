import { useGameState } from '../hooks/useGameState'
import { DirectionPicker } from './DirectionPicker'
import { GameBoard } from './GameBoard'
import { ResultScreen } from './ResultScreen'
import { StartScreen } from './StartScreen'
import { TopBar } from './TopBar'
import { UnitInfoPanel } from './UnitInfoPanel'
import { UnitPanel } from './UnitPanel'

export function GridDefenseGame() {
  const { state, actions } = useGameState()

  if (state.phase === 'start') {
    return <StartScreen onStart={actions.startGame} />
  }

  if (state.phase === 'victory' || state.phase === 'defeat') {
    return <ResultScreen state={state} onRestart={actions.restartGame} />
  }

  const selectedUnit = state.deployedUnits.find(
    (unit) => unit.instanceId === state.selectedDeployedId,
  )

  return (
    <main className="game-shell" onClick={actions.cancelSelection}>
      <section className="game-terminal" onClick={(event) => event.stopPropagation()}>
        <div className="terminal-heading">
          <div>
            <span className="eyebrow">DELEE LAB / ACTIVE EXPERIMENT</span>
            <h1>GRID DEFENSE: LAB-01</h1>
          </div>
          <div className="signal">
            <span />
            LIVE
          </div>
        </div>

        <TopBar
          state={state}
          onPause={actions.togglePause}
          onSpeed={actions.toggleSpeed}
          onRestart={actions.restartGame}
        />

        <div className="operation-layout">
          <div className="board-stage">
            <GameBoard
              state={state}
              onCellClick={actions.clickCell}
            />
            {state.isPaused && (
              <div className="pause-screen">
                <span>SIMULATION PAUSED</span>
                <button onClick={actions.togglePause}>Resume Operation</button>
              </div>
            )}
            {state.message && <div className="system-message">{state.message}</div>}
          </div>

          <aside className="side-rail">
            <div className="rail-block">
              <span className="rail-label">Operation Feed</span>
              <strong>
                {state.intermission > 0
                  ? `NEXT WAVE / ${Math.max(0, 3 - state.intermission).toFixed(1)}s`
                  : `HOSTILES / ${String(state.enemies.length).padStart(2, '0')}`}
              </strong>
              <div className="wave-track">
                <span style={{ width: `${((state.currentWave + 1) / 5) * 100}%` }} />
              </div>
            </div>
            <UnitInfoPanel unit={selectedUnit} onRetreat={actions.retreatSelected} />
          </aside>
        </div>

        <UnitPanel
          dp={state.dp}
          deployCount={state.deployedUnits.length}
          selectedUnitId={state.selectedUnitId}
          disabled={state.isPaused}
          onSelect={actions.selectUnit}
        />
      </section>

      {state.pendingDirectionCell && (
        <DirectionPicker
          cell={state.pendingDirectionCell}
          onChoose={actions.chooseDirection}
          onCancel={actions.cancelSelection}
        />
      )}
    </main>
  )
}
