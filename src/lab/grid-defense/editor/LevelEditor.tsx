import { useMemo, useState } from 'react'
import { GridDefenseGame } from '../../../components/Game'
import type { CellType, Point } from '../../../types/game'
import type { EnemyPath, LevelDefinition } from '../../../types/level'
import { BrushPanel } from './BrushPanel'
import { EditorBoard } from './EditorBoard'
import { EditorToolbar } from './EditorToolbar'
import type { BrushType } from './editorTypes'
import { exportLevelJson, exportLevelTypeScript, importLevelJson } from './levelExport'
import {
  createId,
  createNewLevel,
  markGridPaths,
  normalizeLevelDefinition,
  resizeLevelGrid,
} from './levelSchema'
import { deleteSavedLevel, loadSavedLevels, saveLevel } from './levelStorage'
import { validateLevel } from './levelValidation'
import { LevelImportExportPanel } from './LevelImportExportPanel'
import { LevelSettingsPanel } from './LevelSettingsPanel'
import { LevelValidationPanel } from './LevelValidationPanel'
import { PathEditorPanel } from './PathEditorPanel'
import { SavedLevelsPanel } from './SavedLevelsPanel'
import { WaveEditorPanel } from './WaveEditorPanel'

interface LevelEditorProps {
  onBackToGame: () => void
}

function samePoint(a: Point, b: Point) {
  return a.row === b.row && a.col === b.col
}

function adjacent(a: Point, b: Point) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1
}

function recalcPathEnds(path: EnemyPath): EnemyPath {
  const first = path.points[0] ?? { row: 0, col: 0 }
  const last = path.points[path.points.length - 1] ?? first
  return {
    ...path,
    spawnCell: first,
    baseCell: last,
  }
}

export function LevelEditor({ onBackToGame }: LevelEditorProps) {
  const [level, setLevel] = useState<LevelDefinition>(() => createNewLevel())
  const [activeBrush, setActiveBrush] = useState<BrushType>('blue')
  const [activePathId, setActivePathId] = useState<string | undefined>(level.paths[0]?.id)
  const [savedLevels, setSavedLevels] = useState<LevelDefinition[]>(() => {
    try {
      return loadSavedLevels()
    } catch {
      return []
    }
  })
  const [exportText, setExportText] = useState('')
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState('Editor ready.')
  const [isPlaytesting, setIsPlaytesting] = useState(false)
  const validation = useMemo(() => validateLevel(level), [level])

  const refreshSavedLevels = () => {
    try {
      setSavedLevels(loadSavedLevels())
      setMessage('Saved levels refreshed.')
    } catch (error) {
      setMessage(`Storage error: ${String(error)}`)
    }
  }

  const commitLevel = (nextLevel: LevelDefinition) => {
    setLevel(markGridPaths({ ...nextLevel, updatedAt: new Date().toISOString() }))
  }

  const addPath = () => {
    const path: EnemyPath = {
      id: createId('path'),
      name: `Path ${level.paths.length + 1}`,
      spawnCell: { row: 0, col: 0 },
      baseCell: { row: 0, col: 0 },
      points: [],
    }
    commitLevel({ ...level, paths: [...level.paths, path] })
    setActivePathId(path.id)
    setActiveBrush('path')
  }

  const applyTileBrush = (row: number, col: number, type: CellType) => {
    commitLevel({
      ...level,
      grid: level.grid.map((gridRow, rowIndex) =>
        gridRow.map((cell, colIndex) =>
          rowIndex === row && colIndex === col ? { ...cell, type } : cell,
        ),
      ),
    })
  }

  const erasePathAt = (row: number, col: number) => {
    commitLevel({
      ...level,
      paths: level.paths.map((path) =>
        recalcPathEnds({
          ...path,
          points: path.points.filter((point) => point.row !== row || point.col !== col),
        }),
      ),
    })
  }

  const drawPathAt = (row: number, col: number) => {
    const cell = level.grid[row]?.[col]
    if (!cell) return
    if (cell.type === 'yellow' || cell.type === 'red') {
      setMessage('Path cannot cross yellow or red cells.')
      return
    }

    let pathId = activePathId
    let paths = level.paths
    if (!pathId || !paths.some((path) => path.id === pathId)) {
      const newPath: EnemyPath = {
        id: createId('path'),
        name: `Path ${paths.length + 1}`,
        spawnCell: { row: 0, col: 0 },
        baseCell: { row: 0, col: 0 },
        points: [],
      }
      paths = [...paths, newPath]
      pathId = newPath.id
      setActivePathId(pathId)
    }

    const path = paths.find((item) => item.id === pathId)
    if (!path) return
    const point = { row, col }
    if (path.points.some((existing) => samePoint(existing, point))) return
    if (path.points.length === 0 && cell.type !== 'spawn') {
      setMessage('First path point must be a spawn cell.')
      return
    }
    const last = path.points[path.points.length - 1]
    if (last && level.grid[last.row]?.[last.col]?.type === 'base') {
      setMessage('This path already reaches a base. Clear or undo before extending.')
      return
    }
    if (last && !adjacent(last, point)) {
      setMessage('Path steps must be adjacent. Diagonal jumps are blocked.')
      return
    }

    const nextPath = recalcPathEnds({ ...path, points: [...path.points, point] })
    commitLevel({ ...level, paths: paths.map((item) => (item.id === pathId ? nextPath : item)) })
    setMessage(cell.type === 'base' ? 'Path reached base.' : 'Path point added.')
  }

  const paintCell = (row: number, col: number) => {
    if (activeBrush === 'path') {
      drawPathAt(row, col)
      return
    }
    if (activeBrush === 'erase-path') {
      erasePathAt(row, col)
      return
    }
    applyTileBrush(row, col, activeBrush)
  }

  const resize = (rows: number, cols: number) => {
    if (rows === level.rows && cols === level.cols) return
    if (!window.confirm('Resize the map? Cells outside the new size will be trimmed.')) return
    commitLevel(resizeLevelGrid(level, rows, cols))
  }

  const exportJson = () => {
    if (!validation.valid) setMessage('Level has errors. JSON export is shown for repair or forced copy.')
    setExportText(exportLevelJson(level))
  }

  const exportTypeScript = () => {
    setExportText(exportLevelTypeScript(level))
  }

  const copyJson = async () => {
    const text = exportText || exportLevelJson(level)
    await navigator.clipboard.writeText(text)
    setMessage('JSON copied to clipboard.')
  }

  const downloadJson = () => {
    if (!validation.valid && !window.confirm('This level has errors. Download anyway?')) return
    const blob = new Blob([exportLevelJson(level)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${level.id}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importJson = () => {
    try {
      const imported = importLevelJson(importText)
      setLevel(imported)
      setActivePathId(imported.paths[0]?.id)
      setMessage('Level imported.')
    } catch (error) {
      setMessage(`Import failed: ${String(error)}`)
    }
  }

  const saveCurrentLevel = () => {
    try {
      if (savedLevels.some((item) => item.id === level.id) && !window.confirm('Overwrite saved level?')) return
      const saved = saveLevel(level)
      setLevel(saved)
      refreshSavedLevels()
      setMessage('Level saved to localStorage.')
    } catch (error) {
      setMessage(`Storage error: ${String(error)}`)
    }
  }

  const saveAsNewLevel = () => {
    try {
      const saved = saveLevel({
        ...level,
        id: createId('level'),
        name: `${level.name} Copy`,
        createdAt: new Date().toISOString(),
      })
      setLevel(saved)
      refreshSavedLevels()
      setMessage('Level saved as a new local copy.')
    } catch (error) {
      setMessage(`Storage error: ${String(error)}`)
    }
  }

  const playtest = () => {
    if (!validation.valid) {
      setMessage('Fix validation errors before playtest.')
      return
    }
    setIsPlaytesting(true)
  }

  if (isPlaytesting) {
    return (
      <GridDefenseGame
        level={normalizeLevelDefinition(level)}
        mode="playtest"
        onExitPlaytest={() => setIsPlaytesting(false)}
      />
    )
  }

  return (
    <main className="level-editor-shell">
      <EditorToolbar
        validation={validation}
        onBackToGame={onBackToGame}
        onNewLevel={() => {
          const next = createNewLevel()
          setLevel(next)
          setActivePathId(next.paths[0]?.id)
          setMessage('New level created.')
        }}
        onSave={saveCurrentLevel}
        onSaveAsNew={saveAsNewLevel}
        onExport={exportJson}
        onPlaytest={playtest}
      />
      <div className="editor-status-line">{message}</div>
      <div className="level-editor-layout">
        <div className="editor-left">
          <BrushPanel activeBrush={activeBrush} onBrushChange={setActiveBrush} />
          <EditorBoard level={level} activePathId={activePathId} onPaintCell={paintCell} />
        </div>
        <div className="editor-right">
          <LevelSettingsPanel level={level} onChange={commitLevel} onResize={resize} />
          <PathEditorPanel
            level={level}
            activePathId={activePathId}
            onActivePathChange={(pathId) => {
              setActivePathId(pathId)
              setActiveBrush('path')
            }}
            onAddPath={addPath}
            onRenamePath={(pathId, name) =>
              commitLevel({
                ...level,
                paths: level.paths.map((path) => (path.id === pathId ? { ...path, name } : path)),
              })
            }
            onUndoPathPoint={(pathId) =>
              commitLevel({
                ...level,
                paths: level.paths.map((path) =>
                  path.id === pathId ? recalcPathEnds({ ...path, points: path.points.slice(0, -1) }) : path,
                ),
              })
            }
            onClearPath={(pathId) =>
              commitLevel({
                ...level,
                paths: level.paths.map((path) =>
                  path.id === pathId ? { ...path, points: [], spawnCell: { row: 0, col: 0 }, baseCell: { row: 0, col: 0 } } : path,
                ),
              })
            }
            onDeletePath={(pathId) => {
              if (!window.confirm('Delete this path?')) return
              const paths = level.paths.filter((path) => path.id !== pathId)
              commitLevel({ ...level, paths })
              setActivePathId(paths[0]?.id)
            }}
          />
          <WaveEditorPanel level={level} onChange={commitLevel} />
          <LevelValidationPanel validation={validation} />
          <LevelImportExportPanel
            level={level}
            validation={validation}
            exportText={exportText}
            importText={importText}
            onExportJson={exportJson}
            onExportTypeScript={exportTypeScript}
            onCopy={copyJson}
            onDownload={downloadJson}
            onImportTextChange={setImportText}
            onImport={importJson}
          />
          <SavedLevelsPanel
            savedLevels={savedLevels}
            onRefresh={refreshSavedLevels}
            onLoad={(saved) => {
              setLevel(saved)
              setActivePathId(saved.paths[0]?.id)
              setMessage('Saved level loaded.')
            }}
            onDuplicate={(saved) => {
              const duplicate = {
                ...saved,
                id: createId('level'),
                name: `${saved.name} Copy`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              const stored = saveLevel(duplicate)
              setLevel(stored)
              refreshSavedLevels()
              setMessage('Saved level duplicated.')
            }}
            onDelete={(levelId) => {
              if (!window.confirm('Delete this saved level?')) return
              deleteSavedLevel(levelId)
              refreshSavedLevels()
            }}
          />
        </div>
      </div>
    </main>
  )
}
