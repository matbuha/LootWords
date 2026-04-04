# Project Status

This file is the quick reality check for contributors. Read this before choosing work.

## Project maturity

LootWords is an evolving MVP with a working core loop. It is no longer a bare prototype, but it is not feature-complete or fully polished.

## What currently works

- App boot and routing
- Home, Play, Reward, Collection, Learn, and Parent Mode screens
- LocalStorage persistence with backup recovery
- English, Hebrew, and Russian UI switching
- Parent-controlled active card/category filtering
- Reward box inventory and three-tap opening flow
- Reward reveal with card unlock persistence
- Card speech for visible/open cards in English
- Voice selection for English pronunciation when the browser exposes multiple English voices
- Six playable mini-games:
  - Memory Match
  - Treasure Match
  - Flash Find
  - Loot Pop
  - Tap the Word
  - Repeat After Me
- Shared 3-second countdown before game start
- Responsive layout across desktop, tablet, and phone sizes
- Contributor-facing collaboration docs:
  - `README.md`
  - `OPEN_TASKS.md`
  - `PROJECT_STATUS.md`
  - `CONTRIBUTING.md`
  - `ROADMAP.md`

## What is partially mature

- Audio system:
  - architecture is in place
  - fallback cues exist
  - final music/SFX assets are still not complete
- Card visuals:
  - layout and collectible framing exist
  - final custom art pipeline is still incomplete
- Parent Mode:
  - useful and working
  - still browser-local and intentionally lightweight
- Game feel:
  - significantly improved
  - still open for polish, consistency passes, and tuning
- Tap the Word:
  - real playable MVP is in place
  - still open for distractor tuning, pacing tweaks, and stronger mobile optimization
- Repeat After Me:
  - real playable MVP is in place
  - still open for additional speaking feedback, pacing polish, and optional future microphone-assisted validation

## What needs care

- `scripts/app.js`
  - central orchestration file
  - many shared actions and route behaviors converge here
  - changes should stay focused and carefully verified
- `scripts/ui/game-screen.js`
  - owns play selection mode, active game mode, countdown flow, and result overlays
  - game-flow regressions can affect every mini-game
- `scripts/core/rewards.js`
  - reward correctness matters for unlock progression
  - duplicate or invalid reveal bugs are high-impact
- `scripts/storage.js`
  - profile normalization and recovery logic
  - unsafe edits here can corrupt saved progress
- `scripts/data/translations.js`
  - centralized but large
  - missing or inconsistent keys can easily surface in the UI

## Known active development areas

- More learning-focused mini-games
- Better speech quality and voice handling
- Better card art and image-first presentation
- Improved mobile polish and accessibility
- More progression hooks and longer-term retention systems
- Cleaner contributor workflow and ongoing documentation

## What is intentionally lightweight right now

- No backend
- No account system
- No real server-side content management
- No secure admin authentication
- No framework migration

These are not bugs. They are current product boundaries.

## Good first contribution areas

- Small UX improvements in one screen
- One focused mini-game improvement
- Card art / visual pipeline improvements
- Documentation improvements
- Translation coverage fixes
- Mobile polish in isolated layouts

## Higher-risk areas

- Storage schema changes
- Reward flow changes
- Route model changes
- Cross-screen shared state changes
- Parent-mode import/export validation

If you touch one of these, update this file after the work lands.

## How to keep this file useful

Update this file when:

- a system moves from partial to solid
- a major bug/regression is fixed
- a previously working area becomes unstable
- a new major system is added
- a contributor should treat a file or subsystem more carefully than before
