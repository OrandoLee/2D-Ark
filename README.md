# GRID DEFENSE: LAB-01

An original, engine-free 2D grid defense experiment built for the DELEE LAB section of a personal site. It uses React, TypeScript, CSS geometry, and a `requestAnimationFrame` game loop.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Create a production build with:

```bash
npm run build
```

## Game rules

- Preserve the core through five configured hostile waves.
- Select a module card, then select a highlighted legal grid cell.
- Melee modules require an attack direction and can block enemies.
- Ranged modules attack the hostile closest to the core within range.
- Medics heal the lowest-health friendly module within range.
- DP increases over time and is awarded for kills. Deployment consumes DP.
- Select a deployed module to inspect or recall it for a 50% DP refund.
- Hostiles that reach the core reduce Life. Reach zero Life and the operation fails.

## Project structure

- `src/data/map.ts`: 12×8 cell configuration and fixed hostile path.
- `src/data/units.ts`: deployable module definitions.
- `src/data/enemies.ts`: hostile definitions.
- `src/data/waves.ts`: all wave spawn schedules.
- `src/hooks/useGameState.ts`: simulation state and game rules.
- `src/hooks/useGameLoop.ts`: `requestAnimationFrame` loop.
- `src/components/`: independent UI and game-board components.
- `src/utils/`: combat, path interpolation, and range helpers.

## Add a map

Create a new map configuration following the structures in `src/data/map.ts`. A map needs dimensions, a `GridCellData[]`, and an ordered `Point[]` path from spawn to base. Every path point must correspond to a walkable cell.

## Add a module

1. Add the new ID to `UnitId` in `src/types/game.ts`.
2. Add a `UnitDefinition` entry in `src/data/units.ts`.
3. Add a small CSS geometry variant in `src/styles.css`.
4. Extend the behavior branch in `useGameState.ts` only if the module introduces a new role.

## Add a hostile

1. Add the new ID to `EnemyId` in `src/types/game.ts`.
2. Add an `EnemyDefinition` entry in `src/data/enemies.ts`.
3. Add its max HP to the board display map in `GameBoard.tsx`.
4. Add a CSS geometry variant in `src/styles.css`.

## Add or change waves

Edit the configuration array in `src/data/waves.ts`. Each spawn contains an `enemyId` and a delay in seconds from the start of its wave.

## Embed in a LAB page

The main game component is exported as `GridDefenseGame`:

```tsx
import { GridDefenseGame } from './components/Game'

export function LabExperiment() {
  return <GridDefenseGame />
}
```

The component does not force full-screen mode and does not depend on a backend, database, external image asset, or game engine. Its styles are rooted in game-specific class names; for stricter host isolation, import the project stylesheet only on the LAB route.
