import type { LevelDefinition } from '../../../types/level'
import { STORAGE_KEY, migrateLevelDefinition } from './levelSchema'

interface SavedLevelState {
  levels: LevelDefinition[]
}

function readState(): SavedLevelState {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return { levels: [] }
  const parsed = JSON.parse(raw) as Partial<SavedLevelState>
  return {
    levels: Array.isArray(parsed.levels) ? parsed.levels.map(migrateLevelDefinition) : [],
  }
}

function writeState(state: SavedLevelState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadSavedLevels() {
  return readState().levels
}

export function saveLevel(level: LevelDefinition) {
  const state = readState()
  const updatedLevel = { ...level, updatedAt: new Date().toISOString() }
  const index = state.levels.findIndex((item) => item.id === updatedLevel.id)
  const levels =
    index >= 0
      ? state.levels.map((item) => (item.id === updatedLevel.id ? updatedLevel : item))
      : [updatedLevel, ...state.levels]
  writeState({ levels })
  return updatedLevel
}

export function deleteSavedLevel(levelId: string) {
  const state = readState()
  writeState({ levels: state.levels.filter((level) => level.id !== levelId) })
}
