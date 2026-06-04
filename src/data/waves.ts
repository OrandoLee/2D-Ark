import type { Wave } from '../types/game'

export const WAVES: Wave[] = [
  {
    id: 1,
    spawns: [
      { delay: 0, enemyId: 'runner' },
      { delay: 1, enemyId: 'runner' },
      { delay: 2, enemyId: 'soldier' },
      { delay: 4, enemyId: 'runner' },
      { delay: 6, enemyId: 'soldier' },
    ],
  },
  {
    id: 2,
    spawns: [
      { delay: 0, enemyId: 'runner' },
      { delay: 0.8, enemyId: 'runner' },
      { delay: 1.6, enemyId: 'runner' },
      { delay: 3, enemyId: 'soldier' },
      { delay: 4.5, enemyId: 'soldier' },
      { delay: 6, enemyId: 'runner' },
      { delay: 7, enemyId: 'soldier' },
    ],
  },
  {
    id: 3,
    spawns: [
      { delay: 0, enemyId: 'soldier' },
      { delay: 1, enemyId: 'soldier' },
      { delay: 2.5, enemyId: 'heavy' },
      { delay: 4, enemyId: 'runner' },
      { delay: 4.8, enemyId: 'runner' },
      { delay: 6, enemyId: 'heavy' },
    ],
  },
  {
    id: 4,
    spawns: [
      { delay: 0, enemyId: 'runner' },
      { delay: 0.6, enemyId: 'runner' },
      { delay: 1.2, enemyId: 'runner' },
      { delay: 2, enemyId: 'soldier' },
      { delay: 3, enemyId: 'heavy' },
      { delay: 4, enemyId: 'soldier' },
      { delay: 5, enemyId: 'runner' },
      { delay: 5.6, enemyId: 'runner' },
      { delay: 7, enemyId: 'heavy' },
    ],
  },
  {
    id: 5,
    spawns: [
      { delay: 0, enemyId: 'prototype-boss' },
      { delay: 1, enemyId: 'runner' },
      { delay: 1.5, enemyId: 'runner' },
      { delay: 2, enemyId: 'soldier' },
      { delay: 3, enemyId: 'heavy' },
      { delay: 4, enemyId: 'runner' },
      { delay: 4.5, enemyId: 'runner' },
      { delay: 5, enemyId: 'soldier' },
      { delay: 7, enemyId: 'heavy' },
      { delay: 9, enemyId: 'soldier' },
    ],
  },
]
