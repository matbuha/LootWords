# LootWords Architecture

## App shape

- `index.html` mounts a single root.
- `scripts/app.js` is the orchestration layer for routing, rendering, cross-screen actions, and persistence.
- `scripts/router.js` keeps navigation hash-based and framework-free.

## State model

The app uses one in-memory store with two areas:

- `profile`: persisted browser data
- `session`: transient UI state such as overlays, reward reveal progress, modal selection, and the parent gate

All persisted writes flow through `commitState()` in `app.js`, which updates the store, saves the normalized profile, and re-renders the shell.

## Persistence and recovery

- `scripts/storage.js` is the only localStorage entry point.
- Main profile key: `lootwords-profile`
- Backup key: `lootwords-profile:backup`
- `normalizeProfile()` is the single shape guard for stored and imported state.
- If the primary record is unreadable, the app now attempts recovery from the backup copy before falling back to a new profile.

## Rendering flow

- Screens are plain render functions under `scripts/ui/`.
- `app.js` selects a renderer from `SCREEN_RENDERERS`.
- Active screens can optionally return:
  - `destroy()`
  - `advanceTime(ms)`
  - `getDebugState()`
- `scripts/core/error-boundary.js` now contains screen destroy/render failures and replaces bad screens with a safe fallback panel instead of blanking the app.

## Game architecture

- `scripts/games/game-registry.js` is the single registration point for mini-games.
- Each game definition provides metadata plus a `mount()` function.
- Games report outcomes through callbacks supplied by `renderGameScreen()`.
- `scripts/core/game-session-manager.js` owns shared per-game stats, recommendation rules, and milestone summaries.

### Add a new mini-game

1. Create a module in `scripts/games/`.
2. Export a mount function that receives a host element plus `onWin`, `onLose`, and `playSound`.
3. Return optional `destroy`, `advanceTime`, and `getDebugState` hooks.
4. Register the game in `scripts/games/game-registry.js`.
5. Verify play -> result -> reward flow in the browser.

## Reward flow

- `scripts/core/rewards.js` is the source of truth for reward outcomes.
- Reward selection always uses the active child-mode pool from `parent-mode.js`.
- The three-tap reward-box sequence is transient session UI state; reward inventory and unlock outcomes remain persisted profile data.

## Parent mode

- `scripts/core/parent-mode.js` owns category toggles, manual card disable state, reward tuning, active child-mode filtering, and parent summaries.
- Parent UI is split into section renderers under `scripts/ui/parent-sections/`.
- Import/export and reset logic are centralized in:
  - `import-export-manager.js`
  - `content-validator.js`
  - `reset-manager.js`

## QA/debug hooks

- `window.render_game_to_text()` exposes route, progression, reward state, audio debug state, active screen debug state, and the latest captured render error.
- `window.advanceTime(ms)` forwards deterministic stepping into the active mini-game when supported.
