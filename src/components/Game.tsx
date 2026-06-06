import { useEffect, useState } from 'react'
import { UNIT_DEFINITIONS } from '../data/units'
import { useGameState } from '../hooks/useGameState'
import type { GamePhase, GameState, UnitId } from '../types/game'
import type { LevelDefinition } from '../types/level'
import { DirectionPicker } from './DirectionPicker'
import { GameBoard } from './GameBoard'
import { ResultScreen } from './ResultScreen'
import { StartScreen } from './StartScreen'
import { TopBar } from './TopBar'
import { UnitInfoPanel } from './UnitInfoPanel'
import { UnitPanel } from './UnitPanel'
import { UnitTypeIcon } from './UnitTypeIcon'

interface DragState {
  unitId: UnitId
  x: number
  y: number
  cell?: { row: number; col: number }
}

interface GridDefenseGameProps {
  level?: LevelDefinition
  mode?: 'game' | 'playtest'
  onExitPlaytest?: () => void
  onOpenEditor?: () => void
}

function getCellAtPointer(x: number, y: number) {
  const element = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-row][data-col]')
  if (!element) return undefined
  return {
    row: Number(element.dataset.row),
    col: Number(element.dataset.col),
  }
}

export function GridDefenseGame({
  level,
  mode = 'game',
  onExitPlaytest,
  onOpenEditor,
}: GridDefenseGameProps) {
  const { state, actions } = useGameState(level, mode === 'playtest' ? 'playing' : 'start')
  const [dragState, setDragState] = useState<DragState>()
  const [displayedPhase, setDisplayedPhase] = useState<GamePhase>(state.phase)
  const [phaseTransition, setPhaseTransition] = useState<'idle' | 'entering' | 'exiting'>(
    'entering',
  )

  useEffect(() => {
    if (state.pendingDirectionCell || !state.selectedUnitId) setDragState(undefined)
  }, [state.pendingDirectionCell, state.selectedUnitId])

  useEffect(() => {
    const enterTimer = window.setTimeout(() => setPhaseTransition('idle'), 420)
    return () => window.clearTimeout(enterTimer)
  }, [])

  useEffect(() => {
    if (state.phase === displayedPhase) return
    setPhaseTransition('exiting')
    const exitTimer = window.setTimeout(() => {
      setDisplayedPhase(state.phase)
      setPhaseTransition('entering')
      window.setTimeout(() => setPhaseTransition('idle'), 420)
    }, 220)
    return () => window.clearTimeout(exitTimer)
  }, [displayedPhase, state.phase])

  if (displayedPhase === 'start') {
    return (
      <div className={`phase-view phase-view-${phaseTransition}`}>
        <StartScreen onStart={actions.startGame} onOpenEditor={onOpenEditor} />
      </div>
    )
  }

  if (displayedPhase === 'victory' || displayedPhase === 'defeat') {
    const resultState: GameState = { ...state, phase: displayedPhase }
    return (
      <div className={`phase-view phase-view-${phaseTransition}`}>
        <ResultScreen
          state={resultState}
          onRestart={actions.restartGame}
          onExitPlaytest={mode === 'playtest' ? onExitPlaytest : undefined}
        />
      </div>
    )
  }

  const selectedUnit = state.deployedUnits.find(
    (unit) => unit.instanceId === state.selectedDeployedId,
  )
  const nextWaveDelay = state.waves[state.currentWave + 1]?.delayAfterPreviousWave ?? 3

  return (
    <main
      className={`game-shell phase-view phase-view-${phaseTransition}`}
      onClick={actions.cancelSelection}
    >
      <section className="game-terminal" onClick={(event) => event.stopPropagation()}>
        {mode === 'playtest' && (
          <div className="playtest-ribbon">
            <span>试玩中：{state.level.name}</span>
            <button onClick={onExitPlaytest}>返回编辑器</button>
          </div>
        )}
        <div className="terminal-heading">
          <div>
            <span className="eyebrow">DELEE LAB / GRID DEFENSE</span>
            <h1>GRID DEFENSE: LAB-01</h1>
          </div>
          <div className="heading-actions">
            {onOpenEditor && <button onClick={onOpenEditor}>关卡编辑器</button>}
            <div className="signal">
              <span />
              在线
            </div>
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
              isDraggingUnit={Boolean(dragState)}
              dragOverCell={dragState?.cell}
              onCellClick={actions.clickCell}
            />
            {dragState && <div className="drag-instruction">拖拽到高亮格子完成部署</div>}
            {state.isPaused && (
              <div className="pause-screen">
                <span>模拟已暂停</span>
                <button onClick={actions.togglePause}>继续</button>
              </div>
            )}
            {state.message && <div className="system-message">{state.message}</div>}
          </div>

          <aside className="side-rail">
            <div className="rail-block">
              <span className="rail-label">行动监测</span>
              <strong>
                {state.waveElapsed < 0
                  ? `战术准备 / ${Math.ceil(-state.waveElapsed)} 秒`
                  : state.intermission > 0
                    ? `下一波 / ${Math.max(0, nextWaveDelay - state.intermission).toFixed(1)} 秒`
                    : `场上敌人 / ${String(state.enemies.length).padStart(2, '0')}`}
              </strong>
              <div className="wave-track">
                <span
                  style={{
                    width: `${((state.currentWave + 1) / Math.max(1, state.waves.length)) * 100}%`,
                  }}
                />
              </div>
            </div>
            <UnitInfoPanel unit={selectedUnit} onRetreat={actions.retreatSelected} />
          </aside>
        </div>

        <UnitPanel
          dp={state.dp}
          deployCount={state.deployedUnits.length}
          deployLimit={state.level.deployLimit}
          currentHand={state.currentHand}
          selectedUnitId={state.selectedUnitId}
          disabled={state.isPaused}
          onSelect={actions.selectUnit}
          onPointerDragStart={(unitId, x, y) => {
            actions.beginUnitDrag(unitId)
            setDragState({ unitId, x, y, cell: getCellAtPointer(x, y) })
          }}
          onPointerDragMove={(x, y) => {
            setDragState((current) =>
              current ? { ...current, x, y, cell: getCellAtPointer(x, y) } : current,
            )
          }}
          onPointerDragEnd={(x, y) => {
            const cell = getCellAtPointer(x, y)
            if (cell) actions.clickCell(cell.row, cell.col)
            setDragState(undefined)
          }}
        />
      </section>

      {dragState && (
        <div className="unit-drag-ghost" style={{ left: dragState.x, top: dragState.y }}>
          <span className={`type-${UNIT_DEFINITIONS[dragState.unitId].type}`}>
            <UnitTypeIcon type={UNIT_DEFINITIONS[dragState.unitId].type} />
          </span>
          <strong>{UNIT_DEFINITIONS[dragState.unitId].name}</strong>
        </div>
      )}

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
