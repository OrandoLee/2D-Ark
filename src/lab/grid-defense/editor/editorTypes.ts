import type { CellType } from '../../../types/game'

export type BrushType = CellType | 'path' | 'erase-path'

export const BRUSHES: Array<{ id: BrushType; label: string; hint: string }> = [
  { id: 'blue', label: 'Blue', hint: 'Ground tile' },
  { id: 'yellow', label: 'Yellow', hint: 'High tile' },
  { id: 'red', label: 'Red', hint: 'Blocked tile' },
  { id: 'spawn', label: 'Spawn', hint: 'Enemy entry' },
  { id: 'base', label: 'Base', hint: 'Core target' },
  { id: 'path', label: 'Path', hint: 'Draw route' },
  { id: 'erase-path', label: 'Erase Path', hint: 'Remove route marks' },
]
