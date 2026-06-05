import type { CellType } from '../../../types/game'

export type BrushType = CellType | 'path' | 'erase-path'

export const BRUSHES: Array<{ id: BrushType; label: string; hint: string }> = [
  { id: 'blue', label: '地面', hint: '可通行地面格' },
  { id: 'yellow', label: '高台', hint: '高台部署格' },
  { id: 'red', label: '禁用', hint: '不可用格' },
  { id: 'spawn', label: '入口', hint: '敌人入口' },
  { id: 'base', label: '核心', hint: '目标核心' },
  { id: 'path', label: '路径', hint: '绘制敌人路线' },
  { id: 'erase-path', label: '擦除路径', hint: '移除路径标记' },
]
