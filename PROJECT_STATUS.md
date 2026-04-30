# Project Status

This file is the quick reality check for contributors. Read this before choosing work.

## Project maturity

LootWords is an evolving MVP with a working core loop. It is no longer a bare prototype, but it is not feature-complete or fully polished.

## What currently works

- App boot and routing
- Home, Play, Reward, Collection, Learn, and Parent Mode screens
- Guest session persistence without shared cross-user leakage
- Authenticated per-user progress isolation keyed by Firebase user identity
- English, Hebrew, and Russian UI switching
- Parent-controlled active card/category filtering
- Reward box inventory and five-tap cinematic opening flow
- Reward reveal with card unlock persistence
- Centralized loot foundation with strict rarity weighting and reward-type separation
- Multi-type reward inventory foundation for cards, coins, stickers, cursor skins, UI theme packs, profile backgrounds, and profile avatars
- Card speech for visible/open cards in English
- Voice selection for English pronunciation when the browser exposes multiple English voices
- Firebase Authentication with guest fallback, auth modal UI, session bootstrap, and logout flow
- Firestore-backed Daily Challenge for authenticated users with guest lock state, retryable daily runs, and one daily bonus reward
- Eight playable mini-games:
  - Memory Match
  - Treasure Match
  - Flash Find
  - Loot Pop
  - Tap the Word
  - Repeat After Me
  - Sequence Memory
  - Image Reveal
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
- Reward foundation:
  - centralized loot generation now runs through rarity -> reward type -> reward item
  - rarity logic is now separated from reward-content selection
  - reward opening now uses a focused overlay cinematic with five taps, stronger tactile motion, rarity-tinted radial backgrounds, and a final jump-and-spin release
  - box opening now resolves through staged rarity-upgrade checks, resetting the five-tap cycle when an upgrade lands and delaying final reward resolution until the last stage locks in
  - coins and stickers are now real reward types with live reward reveal support and persisted balances/ownership
  - duplicate sticker rewards now convert into coins instead of creating duplicate inventory entries
  - cursor skins, theme packs, profile backgrounds, and profile avatars still remain foundation-only and are not yet active in the live loot pool
- Tap the Word:
  - real playable MVP is in place
  - still open for distractor tuning, pacing tweaks, and stronger mobile optimization
- Repeat After Me:
  - real playable MVP is in place
  - still open for additional speaking feedback, pacing polish, and optional future microphone-assisted validation
- Sequence Memory:
  - real playable MVP is in place
  - still open for preview pacing polish, difficulty scaling, and richer sequence-feedback presentation
- Image Reveal:
  - real playable MVP is in place
  - still open for reveal-mode variety, earlier-guess reward polish, and additional visual tuning
- Auth foundation:
  - real Firebase runtime config is now served from `public/firebase-config.js`
  - end-to-end signup, signin, signout, and refresh persistence are verified against the current Firebase project
  - guest mode still works as the fallback UX path if auth becomes unavailable
  - guest progress is now temporary and session-only instead of using one shared browser profile
  - authenticated users now load isolated per-user progress instead of sharing one global browser profile
  - auth submit flow now has a dedicated reCAPTCHA integration layer that can be activated later through `public/recaptcha-config.js`
  - the runtime uses `users/{uid}/progress/main` as the primary Firestore path and falls back to per-user local browser storage only if Firestore is unavailable
  - `firestore.rules` now includes a locked-down owner-only `users/{uid}` pattern for account data
- Daily Challenge:
  - real authenticated-user-only MVP is in place
  - guest users see a locked CTA state and cannot start the feature
  - challenge assignment is deterministic by UTC calendar day and rotates across stable existing mini-games
  - per-user challenge state is stored inside `users/{uid}/progress/main`
  - success grants one extra daily reward box exactly once per day
  - failed runs stay retryable on the same day

## What needs care

- `public/scripts/app.js`
  - central orchestration file
  - many shared actions and route behaviors converge here
  - changes should stay focused and carefully verified
- `public/scripts/ui/game-screen.js`
  - owns play selection mode, active game mode, countdown flow, and result overlays
  - game-flow regressions can affect every mini-game
- `public/scripts/core/rewards.js`
  - reward correctness matters for unlock progression
  - duplicate or invalid reveal bugs are high-impact
- `public/scripts/core/loot-manager.js`
  - central reward generation and application path
  - bad edits here can skew rarity odds or break future reward types
- `public/scripts/data/loot.js`
  - controls reward-type catalogs, rarity weights, and inventory keys
  - changes here affect long-term extensibility, not just the current reward reveal UI
- `public/scripts/storage.js`
  - guest-vs-authenticated persistence boundaries, profile normalization, and recovery logic
  - unsafe edits here can corrupt saved progress or leak user state across sessions
- `public/scripts/data/translations.js`
  - centralized but large
  - missing or inconsistent keys can easily surface in the UI
- `public/scripts/core/auth-manager.js`
  - central auth bootstrap, Firebase wiring, and future account foundation
- `public/scripts/core/daily-challenge-manager.js`
  - central daily date-key logic, deterministic challenge generation, and reward idempotency
- `firestore.rules`
  - owner-only rules must stay aligned with the `users/{uid}/progress/main` data path
- `public/firebase-config.js`
  - live browser runtime config for the current Firebase web app
  - changes here should preserve guest fallback and public-repo safety
- `public/recaptcha-config.js`
  - live browser runtime config for reCAPTCHA site-key activation
  - leave it explicit and do not commit secret verification credentials

## Known active development areas

- More learning-focused mini-games
- richer Daily Challenge types and broader account-based progression on top of the shipped MVP
- Better speech quality and voice handling
- Better card art and image-first presentation
- Improved mobile polish and accessibility
- More progression hooks and longer-term retention systems
- cinematic reward presentation, cosmetic equip systems, and shop work on top of the new loot foundation
- Cleaner contributor workflow and ongoing documentation

## What is intentionally lightweight right now

- No custom backend API
- No full profile/settings/account-management area yet
- No real server-side content management beyond Firebase-ready account foundations
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
