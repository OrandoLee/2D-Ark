import { useEffect, useState } from 'react'
import labLogoUrl from './assets/lab.svg'
import { GridDefenseGame } from './components/Game'
import { LevelEditor } from './lab/grid-defense/editor/LevelEditor'

type AppMode = 'game' | 'editor'
type TransitionState = 'idle' | 'entering' | 'exiting'

function getInitialMode(): AppMode {
  return window.location.pathname.endsWith('/lab/grid-defense/editor') ? 'editor' : 'game'
}

export default function App() {
  const [mode, setMode] = useState<AppMode>(() => getInitialMode())
  const [showIntro, setShowIntro] = useState(true)
  const [transitionState, setTransitionState] = useState<TransitionState>('entering')

  useEffect(() => {
    const introTimer = window.setTimeout(() => setShowIntro(false), 1900)
    const enterTimer = window.setTimeout(() => setTransitionState('idle'), 520)
    return () => {
      window.clearTimeout(introTimer)
      window.clearTimeout(enterTimer)
    }
  }, [])

  const switchMode = (nextMode: AppMode) => {
    if (nextMode === mode || transitionState === 'exiting') return
    setTransitionState('exiting')
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
    const path =
      nextMode === 'editor' ? `${basePath}/lab/grid-defense/editor` : `${basePath || '/'}`
    window.setTimeout(() => {
      setMode(nextMode)
      setTransitionState('entering')
      window.history.pushState(null, '', path)
      window.setTimeout(() => setTransitionState('idle'), 520)
    }, 260)
  }

  return (
    <>
      {showIntro && (
        <div className="app-intro" aria-hidden="true">
          <img src={labLogoUrl} alt="" />
        </div>
      )}
      <div className={`app-view app-view-${transitionState}`}>
        {mode === 'editor' ? (
          <LevelEditor onBackToGame={() => switchMode('game')} />
        ) : (
          <GridDefenseGame onOpenEditor={() => switchMode('editor')} />
        )}
      </div>
    </>
  )
}
