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
  const [message, setMessage] = useState('编辑器已就绪。')
  const [isPlaytesting, setIsPlaytesting] = useState(false)
  const validation = useMemo(() => validateLevel(level), [level])

  const refreshSavedLevels = () => {
    try {
      setSavedLevels(loadSavedLevels())
      setMessage('本地关卡列表已刷新。')
    } catch (error) {
      setMessage(`本地存储错误：${String(error)}`)
    }
  }

  const commitLevel = (nextLevel: LevelDefinition) => {
    setLevel(markGridPaths({ ...nextLevel, updatedAt: new Date().toISOString() }))
  }

  const addPath = () => {
    const path: EnemyPath = {
      id: createId('path'),
      name: `路径 ${level.paths.length + 1}`,
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
      setMessage('路径不能穿过高台格或禁用格。')
      return
    }

    let pathId = activePathId
    let paths = level.paths
    if (!pathId || !paths.some((path) => path.id === pathId)) {
      const newPath: EnemyPath = {
        id: createId('path'),
        name: `路径 ${paths.length + 1}`,
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
      setMessage('路径第一个点必须是入口格。')
      return
    }
    const last = path.points[path.points.length - 1]
    if (last && level.grid[last.row]?.[last.col]?.type === 'base') {
      setMessage('这条路径已经到达核心。继续延伸前请先清空或撤销。')
      return
    }
    if (last && !adjacent(last, point)) {
      setMessage('路径点必须上下左右相邻，不能斜向跳跃。')
      return
    }

    const nextPath = recalcPathEnds({ ...path, points: [...path.points, point] })
    commitLevel({ ...level, paths: paths.map((item) => (item.id === pathId ? nextPath : item)) })
    setMessage(cell.type === 'base' ? '路径已到达核心。' : '路径点已添加。')
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
    if (!window.confirm('确认修改地图尺寸？超出新尺寸的格子会被裁切。')) return
    commitLevel(resizeLevelGrid(level, rows, cols))
  }

  const exportJson = () => {
    if (!validation.valid) setMessage('当前关卡存在错误。JSON 已显示，可用于修复或强制复制。')
    setExportText(exportLevelJson(level))
  }

  const exportTypeScript = () => {
    setExportText(exportLevelTypeScript(level))
  }

  const copyJson = async () => {
    const text = exportText || exportLevelJson(level)
    await navigator.clipboard.writeText(text)
    setMessage('JSON 已复制到剪贴板。')
  }

  const downloadJson = () => {
    if (!validation.valid && !window.confirm('当前关卡存在错误，仍要下载吗？')) return
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
      setMessage('关卡已导入。')
    } catch (error) {
      setMessage(`导入失败：${String(error)}`)
    }
  }

  const saveCurrentLevel = () => {
    try {
      if (savedLevels.some((item) => item.id === level.id) && !window.confirm('确认覆盖已保存的关卡？')) return
      const saved = saveLevel(level)
      setLevel(saved)
      refreshSavedLevels()
      setMessage('关卡已保存到本地。')
    } catch (error) {
      setMessage(`本地存储错误：${String(error)}`)
    }
  }

  const saveAsNewLevel = () => {
    try {
      const saved = saveLevel({
        ...level,
        id: createId('level'),
        name: `${level.name} 副本`,
        createdAt: new Date().toISOString(),
      })
      setLevel(saved)
      refreshSavedLevels()
      setMessage('关卡已另存为新的本地副本。')
    } catch (error) {
      setMessage(`本地存储错误：${String(error)}`)
    }
  }

  const playtest = () => {
    if (!validation.valid) {
      setMessage('请先修复合法性错误，再进入试玩。')
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
          setMessage('新关卡已创建。')
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
              if (!window.confirm('确认删除这条路径？')) return
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
              setMessage('本地关卡已读取。')
            }}
            onDuplicate={(saved) => {
              const duplicate = {
                ...saved,
                id: createId('level'),
                name: `${saved.name} 副本`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              const stored = saveLevel(duplicate)
              setLevel(stored)
              refreshSavedLevels()
              setMessage('本地关卡已复制。')
            }}
            onDelete={(levelId) => {
              if (!window.confirm('确认删除这个本地关卡？')) return
              deleteSavedLevel(levelId)
              refreshSavedLevels()
            }}
          />
        </div>
      </div>
    </main>
  )
}
