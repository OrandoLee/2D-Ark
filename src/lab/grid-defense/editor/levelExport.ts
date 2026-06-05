import type { LevelDefinition } from '../../../types/level'
import { migrateLevelDefinition } from './levelSchema'

export function exportLevelJson(level: LevelDefinition) {
  return JSON.stringify(level, null, 2)
}

export function exportLevelTypeScript(level: LevelDefinition) {
  const constName = `level_${level.id.replace(/[^a-zA-Z0-9]+/g, '_')}`
  return `import type { LevelDefinition } from '../../types/level'\n\nexport const ${constName}: LevelDefinition = ${exportLevelJson(level)}\n`
}

export function importLevelJson(text: string): LevelDefinition {
  return migrateLevelDefinition(JSON.parse(text))
}
