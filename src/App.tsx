import { useState } from 'react'
import { GridDefenseGame } from './components/Game'
import { LevelEditor } from './lab/grid-defense/editor/LevelEditor'

type AppMode = 'game' | 'editor'

function getInitialMode(): AppMode {
  return window.location.pathname.endsWith('/lab/grid-defense/editor') ? 'editor' : 'game'
}

export default function App() {
  const [mode, setMode] = useState<AppMode>(() => getInitialMode())

  const switchMode = (nextMode: AppMode) => {
    setMode(nextMode)
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
    const path =
      nextMode === 'editor' ? `${basePath}/lab/grid-defense/editor` : `${basePath || '/'}`
    window.history.pushState(null, '', path)
  }

  if (mode === 'editor') {
    return <LevelEditor onBackToGame={() => switchMode('game')} />
  }

  return <GridDefenseGame onOpenEditor={() => switchMode('editor')} />
}
