import { PATH } from '../data/map'
import {
  pathIndexForCell as pathIndexForRuntimeCell,
  positionOnPath as positionOnRuntimePath,
} from './levelRuntime'

export function positionOnPath(progress: number) {
  return positionOnRuntimePath(PATH, progress)
}

export function pathIndexForCell(row: number, col: number) {
  return pathIndexForRuntimeCell(PATH, row, col)
}
