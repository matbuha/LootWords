Original prompt: Build LootWords as a browser-based children's word-learning game in plain HTML, CSS, and JavaScript, with two internal mini-games, reward boxes that open in exactly three taps, collectible noun cards with persisted random points and rarity, localStorage persistence, modular architecture, and a phase-by-phase checklist that stays updated.

Current prompt: Upgrade LootWords so it feels more like a real reward-driven game, with stronger reward-box anticipation, richer card reveals, clearer rarity presentation, more tactile interactions, better transitions, collection and learn screen polish, and safe audio hooks without destabilizing the existing MVP.

Latest prompt: Improve the card content system, educational structure, and long-term scalability so LootWords has a stronger collectible English noun foundation with 100-150 visual noun cards, richer metadata, better category support, and future-ready content utilities.

Current prompt: Upgrade LootWords with a modular audio and emotional feedback system so music, sound effects, mute controls, staged reward audio, and event-based feedback all work safely in the browser with missing-asset fallbacks.

Latest prompt: Expand replayability and progression by adding more lightweight mini-games, a cleaner game registry, smoother play selection, and stronger long-term reward hooks without breaking the collectible loop.

Latest prompt: Add a dedicated Parent Mode and content-management layer so a parent can safely manage content availability, categories, rewards, progression settings, progress visibility, resets, and import/export without breaking the child-facing game flow.

Latest prompt: Perform a focused QA, cleanup, and architecture hardening pass so LootWords is more stable, storage-safe, maintainable, and ready for future development.

Latest prompt: Define and implement the visual identity, animation language, tactile interaction feel, and living UI behavior so LootWords feels more alive, responsive, magical, and game-like.

Latest prompt: Implement a complete multilingual UI system with Hebrew, English, and Russian, including a top language selector, persisted language settings, proper RTL/LTR switching, and stable flag placement that does not flip under direction changes.

Latest prompt: Fix the reward reveal framing, move the game picker above the active game, and add English-only click-to-hear pronunciation for any visible word card without breaking gameplay or language switching.

Latest prompt: Refine card speech so only truly visible cards can speak, add selectable English voice styles, fix Flash Find preview hiding and Loot Pop hit detection, and redesign cards so the image dominates while only the word and points remain visible.

Latest prompt: Fix voice list initialization after refresh, center collection card modals in the current viewport, keep the Russian top bar on one line, and replace the Memory Match plus sign with a real anonymous card-back state.

Latest prompt: Reorganize the runtime web app so Firebase Hosting serves a single clean public root, with all browser-served files under public/ and non-runtime project files kept outside it.
Latest prompt: Audit the Firebase auth infrastructure, wire the real runtime config into the actual app path, and complete production-style email/password auth verification end to end.
Latest prompt: Prepare the authentication flow for reCAPTCHA with a real integration structure, but leave the final credentials injectable later instead of hardcoding them now.

### Latest verified pass
- Reward reveal framing was corrected so the revealed card now settles fully inside the spotlight area instead of appearing clipped or edge-on.
- The Game tab hierarchy was adjusted so the game picker renders above the active arena on all routes where the play screen is shown.
- Added a centralized browser speech-synthesis manager that always speaks the card's English word, independent of the current UI language.
- Wired pronunciation to shared card renderers plus reward, collection, learn, and visible card-based mini-game surfaces.
- Verified reward reveal framing, game-tab ordering, and English speech behavior in live browser runs across Hebrew, Russian, and English UI modes.
- Tightened speech rules so locked collection cards and unrevealed Memory Match tiles stay silent, while visible revealed cards still speak.
- Added a top-bar English voice selector with persisted browser-voice choice and safe fallback if a preferred voice disappears later.
- Flash Find now swaps from a real preview card to a hidden placeholder state, and Loot Pop now uses direct target timeouts plus pointer input for more reliable hit registration.
- Simplified the shared card presentation so the artwork dominates and only the English word plus points remain in the visible info strip.
- Speech voices now repopulate on fresh page load without needing a route change, using an async voice bootstrap plus live rerender when the browser voice list arrives.
- Collection card details now render in a body-level fixed overlay, so the modal stays centered in the visible viewport even when the album is deeply scrolled.
- Desktop Russian top bar now stays on one line by tightening no-wrap header sizing and truncating long secondary labels instead of wrapping the shell.
- Memory Match hidden tiles now use a centered mystery card back with a large question mark instead of the old misplaced plus-sign placeholder.
- Moved the actual runtime app entry from the repo root into `public/index.html` and moved the browser-served `scripts/`, `styles/`, and `assets/` trees under `public/`.
- Removed the stale Firebase Hosting welcome page from `public/index.html`, leaving one clear app entry point for Hosting and local static serving.
- Kept non-runtime files outside `public/`, including contributor docs, Firebase rules/indexes, and the Firebase config example.
- Verified the app from a `python -m http.server --directory public` server root with no failed requests or console errors across Home, Play selection, launching a game, Collection, and Reward.
- Moved the real Firebase web config into `public/firebase-config.js` so the running browser app no longer depends on blank placeholder meta tags or an unused root-only config file.
- Kept the auth runtime path simple: `public/index.html` loads `public/firebase-config.js`, and `public/scripts/core/auth-manager.js` now boots directly from that served client config.
- Verified real Firebase Authentication end to end in the live app: email/password sign-up, sign-in, sign-out, guest banner visibility, and refresh persistence all passed with no failed requests or console errors.
- Removed Firestore as an auth-time dependency so account sign-in remains clean even if future per-user data storage is not available yet.
- Tightened `firestore.rules` from the default open temporary rule set to an owner-only `users/{uid}` pattern for future account-linked data.
- Added `public/recaptcha-config.js`, `recaptcha-config.example.js`, and a dedicated `public/scripts/core/recaptcha-manager.js` so auth submit actions now have a clean reCAPTCHA insertion point.
- Kept the current repo safe by leaving reCAPTCHA disabled with blank placeholders until the final real site key is added later.
- Verified the app still boots, the auth modal renders correctly, the localhost setup note is visible when reCAPTCHA is not configured, and sign-in still works without runtime errors while the site key is intentionally missing.
- Replaced the old reward-room opening feel with a five-click cinematic overlay that dims the rest of the UI, centers the box, builds stronger charge states, and ends with a jump-and-spin reveal beat before the reward lands.

## Progress Checklist

### Phase 1: Foundation
- [x] Create project folder structure
- [x] Create index.html shell
- [x] Create main CSS architecture
- [x] Create modular JS entry system
- [x] Create base app state management
- [x] Create localStorage persistence layer
- [x] Create routing/screen switching
- [x] Verify app boots without errors

### Phase 2: Data and Card System
- [x] Create initial card dataset with 60-100 visual noun words
- [x] Add category tags
- [x] Generate and persist random points for each card
- [x] Implement rarity calculation
- [x] Create card rendering UI
- [x] Create card detail view
- [x] Verify cards display correctly across rarity tiers

### Phase 3: Home and Collection UX
- [x] Build Home screen
- [x] Build Collection screen
- [x] Add filters by category and rarity
- [x] Add progress summary
- [x] Add locked/unlocked visual states
- [x] Verify collection persistence after page refresh

### Phase 4: Reward System
- [x] Implement reward box inventory/state
- [x] Build Reward Box screen
- [x] Implement 3-click box opening mechanic
- [x] Add visual progression per click
- [x] Implement card reveal animation
- [x] Prevent duplicate card unlock bugs
- [x] Handle no-more-new-cards fallback
- [x] Verify reward flow end-to-end

### Phase 5: Mini-Game 1
- [x] Build Memory Match mini-game
- [x] Add success/fail state
- [x] Reward reward-box on win
- [x] Reset/replay loop
- [x] Verify game is lightweight and fun

### Phase 6: Mini-Game 2
- [x] Build second lightweight mini-game
- [x] Integrate with progression system
- [x] Reward reward-box on win
- [x] Verify mini-game can be replayed cleanly

### Phase 7: Learn Screen
- [x] Build Learn Words screen
- [x] Show unlocked cards for review
- [x] Present word, image, points, rarity clearly
- [x] Verify this screen supports the learning loop

### Phase 8: Polish
- [x] Improve visual feedback
- [x] Add animations across reward and navigation flow
- [x] Add audio hooks / placeholder sounds
- [x] Improve child-friendly design details
- [x] Improve responsive behavior
- [x] Remove rough edges and obvious UX issues

### Phase 9: QA and Cleanup
- [x] Test full flow from first load to multiple rewards
- [x] Test localStorage persistence
- [x] Test duplicate unlock prevention
- [x] Test all screens navigation
- [x] Test edge cases and empty states
- [x] Refactor messy code
- [x] Add README with run instructions and architecture notes

## Game-Feel Upgrade Checklist

### Phase A: Reward Feel
- [x] Improve reward box visuals
- [x] Add 3-stage tap progression feedback
- [x] Add shake / pulse / crack / glow behavior
- [x] Add final reveal burst effect
- [x] Improve card reveal animation
- [x] Verify reward flow feels more exciting

### Phase B: Rarity and Cards
- [x] Upgrade rarity visual language
- [x] Add better rarity badge treatment
- [x] Add card aura/frame differences by rarity
- [x] Improve card layout hierarchy
- [x] Verify card rewards feel collectible

### Phase C: Interaction Polish
- [x] Improve main button feel
- [x] Add better hover/press states
- [x] Improve screen transitions
- [x] Improve win-state celebration
- [x] Verify app feels more game-like overall

### Phase D: Collection and Learn
- [x] Polish collection screen layout
- [x] Add progress indicators
- [x] Add recent/new card marker if useful
- [x] Polish learn screen review experience
- [x] Verify both screens feel enjoyable, not plain

### Phase E: Audio Readiness
- [x] Create audio management structure
- [x] Add sound hooks for important events
- [x] Add mute toggle or clear placeholder support
- [x] Ensure missing audio files do not break the app
- [x] Verify sound system is easy to extend

### Phase F: QA
- [x] Test reward flow after polish
- [x] Test animations across repeated use
- [x] Test collection and learn screens
- [x] Test localStorage still works
- [x] Test no regressions in mini-games
- [x] Refactor rough code where needed

## Visual Identity and Living UI Checklist

### Phase A: Visual Identity Foundation
- [x] Strengthen theme/colors/shapes/shadows
- [x] Create or improve reusable visual style system
- [x] Improve button styles
- [x] Improve panel/card/reward visual hierarchy
- [x] Verify the game looks more premium and coherent

### Phase B: Living UI and Tactile Motion
- [x] Add subtle idle motion to key UI elements
- [x] Improve button press/release feel
- [x] Add micro-interactions across the interface
- [x] Improve general UI responsiveness feel
- [x] Verify the app feels more alive overall

### Phase C: Reward Box Animation
- [x] Add reward box idle motion
- [x] Add squash/compress effect on tap
- [x] Add left-right shake behavior on tap
- [x] Add escalating tap-state reactions
- [x] Add opening burst transition
- [x] Verify reward box feels tactile and exciting

### Phase D: Card Reveal Animation
- [x] Implement dramatic card emergence from box
- [x] Add spinning/rotating reveal motion
- [x] Add outward/toward-screen movement feel
- [x] Add settle/focus hero state
- [x] Add rarity-sensitive reveal polish
- [x] Verify card reveal feels special

### Phase E: Collection and Screen Polish
- [x] Improve collection card presentation
- [x] Improve home screen visual identity
- [x] Improve screen transitions
- [x] Improve learn screen visual calm/polish
- [x] Verify overall presentation quality

### Phase F: Audio Coupling and QA
- [x] Couple key animations with sound hooks
- [x] Test repeated interactions for smoothness
- [x] Test reward flow multiple times
- [x] Test collection browsing interactions
- [x] Refactor rough animation code
- [x] Document any placeholder visual assumptions

## Content Foundation Checklist

### Phase A: Data Foundation
- [x] Expand card dataset to 100-150 words
- [x] Organize words into categories
- [x] Validate only visual noun words are included
- [x] Remove weak or abstract entries
- [x] Verify no duplicate IDs

### Phase B: Metadata and Logic
- [x] Improve card object structure
- [x] Ensure points persist correctly
- [x] Ensure rarity derives correctly from points
- [x] Add helpful card utility functions if needed
- [x] Verify data initialization is stable

### Phase C: Collection and Learn Support
- [x] Improve category support in collection screen
- [x] Add useful sorting or grouping options
- [x] Improve learn screen browsing flow
- [x] Make the content feel more collectible and review-friendly
- [x] Verify screens still perform well

### Phase D: Future-Proofing
- [x] Prepare data structure for future card packs
- [x] Prepare image replacement workflow
- [x] Prepare for future quiz/review modes
- [x] Document content structure clearly

### Phase E: QA
- [x] Test data persistence
- [x] Test category filters
- [x] Test sorting/grouping
- [x] Test newly added card content in UI
- [x] Refactor messy content logic

## Audio and Feedback Checklist

### Phase A: Audio Foundation
- [x] Create modular audio manager
- [x] Add safe initialization after user interaction
- [x] Add support for music and sfx playback
- [x] Add missing-asset-safe handling
- [x] Verify audio system does not crash the app

### Phase B: Sound Events
- [x] Define key sound events
- [x] Wire sounds to button interactions
- [x] Wire sounds to reward box interactions
- [x] Wire sounds to card reveal events
- [x] Wire sounds to win/fail states
- [x] Verify sound events trigger correctly without duplication

### Phase C: Music Support
- [x] Add background music architecture
- [x] Support menu and gameplay music states
- [x] Prevent music overlap on navigation
- [x] Support mute behavior cleanly
- [x] Verify browser-safe music startup

### Phase D: Settings Persistence
- [x] Add mute toggle UI or improve existing one
- [x] Persist audio settings in localStorage
- [x] Ensure reload preserves settings
- [x] Verify toggle behavior is stable

### Phase E: Emotional Feedback Layer
- [x] Add or improve feedback manager
- [x] Couple important sound and visual events
- [x] Improve reward opening emotional pacing
- [x] Improve card reveal emotional impact
- [x] Improve victory feedback feel
- [x] Verify the game feels more alive and rewarding

### Phase F: QA and Cleanup
- [x] Test repeated navigation between screens
- [x] Test reward box sound progression
- [x] Test rare/epic/legendary reveal behavior
- [x] Test mini-game win/fail audio behavior
- [x] Test mute persistence and reliability
- [x] Refactor rough audio code
- [x] Document where future assets should go

## Replayability and Progression Checklist

### Phase A: Mini-Game Architecture
- [x] Create or improve game registry system
- [x] Make mini-games modular and cleanly pluggable
- [x] Improve game screen integration
- [x] Verify mini-games can be entered and exited cleanly

### Phase B: Additional Mini-Games
- [x] Implement at least 1 new lightweight mini-game
- [x] Implement a second new mini-game if quality allows
- [x] Add win/fail/reset behavior
- [x] Integrate reward flow for new mini-games
- [x] Verify replayability and stability

### Phase C: Play Flow Improvements
- [x] Improve mini-game selection UX
- [x] Add random game or recommended game flow
- [x] Improve transition from Home to Play
- [x] Improve replay/next-round flow
- [x] Verify overall session flow feels smoother

### Phase D: Progression Upgrade
- [x] Add stronger visible progression stats
- [x] Add milestones or simple achievement moments
- [x] Add first-time completion handling if useful
- [x] Improve motivation after repeated wins
- [x] Verify progression feels rewarding

### Phase E: Future-Proofing
- [x] Prepare structure for future learning-based mini-games
- [x] Ensure current mini-games do not block future card integration
- [x] Document how to add new mini-games later
- [x] Refactor duplicated game logic if needed

### Phase F: QA
- [x] Test all mini-games for repeat play
- [x] Test reward integration across games
- [x] Test progression persistence
- [x] Test navigation and cleanup
- [x] Refactor rough code and update docs

## Parent Mode and Content Management Checklist

### Phase A: Parent Mode Foundation
- [x] Create parent-mode routing/entry
- [x] Build parent dashboard shell
- [x] Keep parent mode separated from child mode
- [x] Verify app remains stable

### Phase B: Content and Categories
- [x] Build card list/content manager
- [x] Add search/filter support
- [x] Build category enable/disable controls
- [x] Ensure reward pool respects active categories
- [x] Ensure learn/collection flow respects category settings
- [x] Verify category toggles work safely

### Phase C: Progress and Reward Controls
- [x] Add child progress summary panel
- [x] Add reward/progression configuration controls
- [x] Persist parent settings in localStorage
- [x] Verify settings affect gameplay safely

### Phase D: Reset and Import/Export
- [x] Add reset tools with confirmations
- [x] Add export state to JSON
- [x] Add import state from JSON
- [x] Validate imported data before applying
- [x] Verify import/export/reset flows work safely

### Phase E: Validation and Edge Cases
- [x] Add content validation layer
- [x] Handle empty pool and disabled category edge cases
- [x] Handle invalid import payloads safely
- [x] Prevent corrupted state application
- [x] Verify app remains usable after edge-case operations

### Phase F: QA and Cleanup
- [x] Test child mode after parent changes
- [x] Test reward generation after category changes
- [x] Test progress accuracy
- [x] Test reset flows
- [x] Test import/export roundtrip
- [x] Refactor rough admin code
- [x] Update documentation

## Multilingual UI Checklist

### Phase A: i18n Foundation
- [x] Create centralized translation system
- [x] Add language manager
- [x] Add translation data structure for he/en/ru
- [x] Add safe translation helper with fallback
- [x] Persist selected language in localStorage
- [x] Verify language loads correctly on startup

### Phase B: Direction Handling
- [x] Implement RTL/LTR direction switching
- [x] Apply RTL for Hebrew
- [x] Apply LTR for English and Russian
- [x] Verify document/app direction updates correctly
- [x] Prevent direction-related layout breakage

### Phase C: Language Selector
- [x] Add top language selector button
- [x] Add dropdown/menu with 3 language options
- [x] Add flags/icons for each option
- [x] Keep flag/icon on one fixed side for all options
- [x] Highlight selected language
- [x] Verify selector remains visually consistent across directions

### Phase D: Full UI Translation
- [x] Translate Home screen
- [x] Translate Game screen
- [x] Translate Reward screen
- [x] Translate Collection screen
- [x] Translate Learn screen
- [x] Translate shared buttons/messages
- [x] Translate Parent mode if present
- [x] Verify current screen updates immediately on language change

### Phase E: Layout and UX Polish
- [x] Handle text length differences safely
- [x] Check button/panel alignment in all languages
- [x] Check dropdown alignment in all languages
- [x] Improve selector polish and usability
- [x] Verify stable top-bar behavior

### Phase F: QA and Cleanup
- [x] Test repeated language switching
- [x] Test refresh persistence
- [x] Test RTL/LTR transitions thoroughly
- [x] Test missing translation fallback
- [x] Refactor rough i18n code
- [x] Document how to add new translation keys later

## QA / Cleanup Hardening Checklist

### Phase A: QA
- [x] Test first load and initialization
- [x] Test navigation across all screens
- [x] Test mini-game loops
- [x] Test reward flow end-to-end
- [x] Test persistence after refresh
- [x] Test repeated play sessions
- [x] Fix major issues found

### Phase B: State and Storage Hardening
- [x] Audit state management
- [x] Reduce duplicated state logic
- [x] Harden localStorage parsing and defaults
- [x] Add safe fallback behavior for bad state
- [x] Verify consistent updates across UI and state

### Phase C: Architecture Cleanup
- [x] Clean up rendering flow
- [x] Clean up mini-game integration
- [x] Clean up reward system structure
- [x] Improve modularity where weak
- [x] Refactor rough areas without breaking features

### Phase D: Parent Mode and Edge Cases
- [x] Test parent mode if present
- [x] Test category toggle edge cases
- [x] Test no-active-content edge cases
- [x] Test reset/import/export flows
- [x] Fix parent-related breakages safely

### Phase E: Usability and Resilience
- [x] Improve practical usability issues
- [x] Improve empty states and fallback messages
- [x] Improve missing asset resilience
- [x] Improve defensive coding around invalid data
- [x] Verify app stays stable under edge conditions

### Phase F: Documentation and Final Cleanup
- [x] Add or improve README
- [x] Add architecture notes
- [x] Add extension guidance for cards and mini-games
- [x] Remove dead code
- [x] Improve naming/comments
- [x] Final manual smoke test

## Work Log

- 2026-04-04: Added a new registry-driven mini-game, `tap-the-word`, that speaks an English target word and asks the player to tap the matching visible card from a short image-first choice set.
- 2026-04-04: Integrated `tap-the-word` into the shared active-game flow, including the universal 3-second countdown, replay/back behavior, reward payout on run success, and cross-language UI labels while keeping spoken words English-only.
- 2026-04-04: Verified in-browser after the Tap the Word pass:
  - the new game appears in the Play selection view and opens through the focused active-game route
  - target words are spoken in English in English, Hebrew, and Russian UI modes
  - repeat pronunciation works inside the round
  - five-round win and loss paths both complete cleanly
  - a successful run awards reward boxes through the existing progression pipeline
  - Tap the Word remains playable on a phone-sized viewport with compact prompt and answer-card layout
- 2026-04-04: Added a second speech-led mini-game, `repeat-after-me`, that shows one large card, auto-speaks its English word, lets the child replay the audio, and advances by pressing a manual “I said it” / finish button.
- 2026-04-04: Integrated `repeat-after-me` into the shared active-game flow, including the universal 3-second countdown, existing English voice selection, replay/back behavior, and normal reward payout after the 5-round speaking run.
- 2026-04-04: Verified in-browser after the Repeat After Me pass:
  - the new game appears in the Play selection view and opens through the focused active-game route
  - automatic and replay speech both use English in Hebrew, Russian, and English UI modes
  - the five-round manual-continue run completes cleanly and pays out reward boxes through the normal win path
  - the game remains usable on a phone viewport after a dedicated mobile compression pass, though very short mobile heights still have limited spare vertical space
- 2026-04-04: Added a new image-first memory game, `sequence-memory`, that previews a short ordered sequence of visible cards, then asks the player to reproduce the same order by tapping the cards in sequence.
- 2026-04-04: Integrated `sequence-memory` into the shared active-game flow, including the universal 3-second countdown, English preview-step speech, replay/back behavior, and normal reward payout after all three rounds are cleared.
- 2026-04-04: Verified in-browser after the Sequence Memory pass:
  - the new game appears in the Play selection view and opens through the focused active-game route
  - preview cards highlight one by one and speak English words while the UI can remain Hebrew, Russian, or English
  - taps during preview are ignored and do not corrupt the round state
  - correct ordered taps clear rounds and a wrong tap cleanly loses the run
  - the three-round run pays out reward boxes through the normal win path
  - the phone layout was compressed so the status area plus 2x2 board stay inside the initial viewport
- 2026-04-04: Added a new progressive-guessing game, `image-reveal`, that uncovers a target picture step by step behind a 3x3 tile mask while the player chooses from a small image-first answer set.
- 2026-04-04: Integrated `image-reveal` into the shared active-game flow, including the universal 3-second countdown, post-answer English speech reinforcement, replay/back behavior, and normal reward payout after a successful five-round run.
- 2026-04-04: Verified in-browser after the Image Reveal pass:
  - the new game appears in the Play selection view and opens through the focused active-game route
  - the reveal mask opens in clear steps and does not leak the answer through speech before guessing
  - correct guesses speak the English target word after resolution, and wrong/time-out rounds also reveal the answer with English speech
  - the five-round run wins at 4+ correct guesses and loses below that threshold
  - the phone layout was compressed so the reveal area plus answer row fit inside the first viewport in Hebrew, Russian, and English UI modes

- 2026-03-30: Read the repo baseline and loaded the local frontend/game workflow skills.
- 2026-03-30: Created the requested directory structure under `lootwords/`.
- 2026-03-30: Implemented the SPA shell, route handling, localStorage profile normalization, and modular screen/game architecture.
- 2026-03-30: Added a 70-card noun dataset with persisted point values, rarity tiers, reward logic, and placeholder art based on icon glyphs.
- 2026-03-30: Built Memory Match and Treasure Match, then connected wins to reward-box inventory and progression.
- 2026-03-30: Verified in-browser flows with Playwright:
  - Memory Match win -> reward box earned -> 3-tap reward reveal -> collection + learn + reload persistence.
  - Treasure Match win -> reward box earned.
  - Second reward reveal unlocked a different card, confirming duplicate prevention.
  - Collection filters persisted.
  - "All cards collected" fallback converted a reward box into 50 bonus stars.
  - Final browser refresh completed with zero console errors.
- 2026-03-30: Upgraded the visual shell with route-specific ambiance, stronger button feedback, layered hero art, and faster route motion states.
- 2026-03-30: Rebuilt reward presentation with staged tap feedback, opening anticipation, burst reveal framing, and rarity-driven card treatment.
- 2026-03-30: Polished collection and learn screens with album stats, recent-card ribbons, richer spotlight cards, and next/previous review flow.
- 2026-03-30: Expanded the audio manager so missing assets safely fall back to lightweight synthesized cues and future file-based music/sfx can be plugged in without breaking the app.
- 2026-03-30: Re-verified in-browser after polish:
  - Home screen loaded with the new collectible/game feel and no console errors.
  - Memory Match win -> reward overlay -> reward room -> 3-tap reveal -> collection/learn persistence still worked.
  - Treasure Match win still awarded a reward box cleanly.
  - Reward reveal copy stayed celebratory even when the opened box was the last box in the stash.
  - Collection rarity filter persisted after page reload.
- 2026-03-30: Rebuilt the content layer around 14 consistent categories and 3 starter packs, expanding the library to 140 curated visual noun cards.
- 2026-03-30: Added content metadata for `packId`, `difficultyLevel`, `tags`, `sortOrder`, and `imageMode`, while preserving existing card IDs so saved points and unlocks stayed intact.
- 2026-03-30: Added category/pack validation utilities and filter normalization so old saved profiles migrate from legacy category ids like `home-objects` to the new ids without losing data.
- 2026-03-30: Upgraded collection and learn to use grouped category sections, pack summaries, strongest-card highlights, and persistent learn filters.
- 2026-03-30: Re-verified after the content refactor:
  - 140-card library loaded with no duplicate ids or invalid category mappings.
  - Collection filters persisted after reload with the new category ids.
  - Learn review mode and category filters persisted after reload.
  - Memory Match still pulled cards from the expanded dataset and awarded a reward box.
  - Reward reveal successfully unlocked a newly added `train` card from the larger pool.
  - Browser console remained clean.
- 2026-03-30: Replaced the old direct cue calls with a modular audio stack:
  - `audio-manager.js` now owns browser-safe unlock behavior, music routing, synth fallback cues, and safe asset registration.
  - `feedback-manager.js` now maps gameplay events to audio and route-level visual pulses.
  - `settings-manager.js` now normalizes persisted audio settings with master mute plus separate music and SFX toggles.
- 2026-03-30: Expanded config-driven audio support with named feedback events, route-aware music targets, and an asset manifest for future real files.
- 2026-03-30: Wired new feedback events through navigation, reward taps, reward burst, card reveal, collection interactions, filter changes, and win/fail outcomes.
- 2026-03-30: Added synth-backed fallback music loops for menu, gameplay, and reward states so the MVP feels alive even with no shipped audio files.
- 2026-03-30: Documented expected future asset filenames in `lootwords/assets/audio/README.md`.
- 2026-03-30: Re-verified in-browser after the audio refactor:
  - no browser console errors with empty audio asset folders
  - mute plus music/SFX settings persisted after reload
  - route debug state switched between `menuTrack`, `gameplayTrack`, and `rewardTrack`
  - Memory Match win still granted a reward box
  - reward opening still required exactly three taps and reached the reveal state cleanly
  - loss state still triggered without breaking the play screen
  - a controlled Legendary reveal test activated the `legendary`, `new-card`, and `milestone` feedback path together
- 2026-03-30: Added replayability/progression architecture:
  - `game-registry.js` now registers every mini-game in one place and powers play-screen mounting.
  - `game-session-manager.js` now centralizes per-game stats, recommended/random game selection, milestone targets, and first-win bonus summaries.
  - Added two new mini-games:
    - `flash-find`: preview a target card, then tap the matching card from the spread before memory fades.
    - `loot-pop`: tap the active glowing pad quickly to build combo and hit the goal before time runs out.
- 2026-03-30: Expanded profile persistence with replay-focused fields:
  - `rewardBoxesEarned`
  - `currentStreak`
  - `bestStreak`
  - `firstWinGameIds`
  - `gameStats`
  - `lastPlayedGameId`
- 2026-03-30: Upgraded reward progression rules:
  - every win still grants 1 reward box
  - the first win in a new mini-game grants +1 bonus reward box
  - every 5 total wins grants +20 bonus stars
  - losses now persist so streak resets are real instead of visual-only
- 2026-03-30: Rebuilt the home/play flow around replayability:
  - Home now shows recommended and random quick-play entry points, replay motivation stats, and the full game shelf.
  - Play now shows per-game stats, streak/milestone chips, and overlay actions for replay, random next game, and reward handoff.
- 2026-03-30: Re-verified in-browser after the replayability pass:
  - all four mini-games mounted cleanly through the registry
  - Flash Find won cleanly and granted 2 reward boxes on its first win
  - reward room still required exactly 3 taps and revealed a new `backpack` card
  - Loot Pop won cleanly and granted 2 reward boxes on its first win
  - replaying Loot Pop from the result overlay cleared the overlay and a forced timeout loss reset the streak to 0
  - Treasure Match still won cleanly after the registry migration, confirming no regression in an older game
  - recommended and random play buttons routed to valid game entries
  - progression totals, streak reset, and per-game play counts persisted after reload
  - browser console remained clean
- 2026-03-30: Added Parent Mode architecture:
  - dedicated `#/parent` route and separate admin shell
  - topbar Parent entry that opens a gate instead of exposing controls directly in the child flow
  - parent dashboard sections for content, categories, rewards/progression, child progress, import/export, reset tools, and settings
- 2026-03-30: Added parent-side state and validation helpers:
  - `parent-mode.js` normalizes category/card availability and reward settings
  - `content-validator.js` validates imported payloads, category ids, card ids, and numeric progress fields
  - `reset-manager.js` and `import-export-manager.js` centralize destructive/admin data operations
- 2026-03-30: Wired child mode to respect parent settings:
  - category toggles now remove disabled categories from rewards, collection, learn, and play
  - child filters automatically fall back to `all` when a saved category becomes inactive
  - reward opening now blocks safely when no active cards are available
- 2026-03-30: Re-verified in-browser after the Parent Mode pass:
  - parent gate opened from the topbar Parent entry and kept admin UI out of the main child navigation
  - disabling the `home` category removed those cards from collection and learn while keeping unlocked cards shelved safely
  - disabling all categories produced stable child-facing empty states and a blocked reward box instead of broken reward logic
  - resetting settings restored active categories and usable child-mode screens
  - changing `rewardBoxesPerWin` to `2` and winning Loot Pop granted `+3` boxes total on the first win path, confirming live reward tuning
  - reward opening still revealed a new card after the parent-mode changes
  - invalid import payloads are now blocked instead of normalizing into a blank profile
  - exported profiles no longer keep stray unknown fields after normalization
  - browser console remained clean
- 2026-03-30: Hardened saved-state recovery:
  - `storage.js` now validates `discoveredAtByCardId` timestamps before keeping them
  - saves now write to both `lootwords-profile` and `lootwords-profile:backup`
  - load now recovers from the backup copy when the primary record is unreadable
- 2026-03-30: Added render containment:
  - `error-boundary.js` now catches screen destroy/render failures and replaces them with a safe fallback panel instead of crashing the app shell
  - `window.render_game_to_text()` now exposes the latest captured render error plus total/active/shelved unlock counts for QA
- 2026-03-30: Fixed a parent-mode progress display bug:
  - the parent top bar now shows total unlocked cards from the full collection, not just child-active unlocks
- 2026-03-30: Re-verified in-browser during the hardening pass:
  - clean first load still initializes correctly with zero progress
  - a corrupted primary storage record recovers from the backup record and restores unlocks, reward boxes, and audio settings
  - Loot Pop still wins cleanly, grants reward boxes, and updates streaks
  - reward boxes still open in exactly three taps and reveal persisted cards
  - collection, learn, and reward state persist after reload
  - parent invalid-import UI still blocks malformed JSON
  - resetting settings restores all categories and removes shelved unlocks
  - browser console remained free of runtime errors
- 2026-04-04: Added a Firebase-first auth foundation with safe guest fallback:
  - new `scripts/core/auth-manager.js` centralizes auth bootstrap, guest/authenticated state, email/password sign-up and sign-in calls, sign-out, and future per-user profile sync
  - auth now reads optional Firebase web config from blank `lootwords-firebase-*` meta tags in `index.html`, so the public repo stays runnable with no secrets committed
  - the shell now renders a compact account control and auth modal with multilingual sign-in/sign-up UI, setup messaging, and authenticated account status
  - the Home screen now shows a translated guest motivation banner and a logged-in placeholder banner for upcoming Daily Challenge/account bonuses
  - contributor docs now describe the auth setup and note that Daily Challenge can build on this new foundation
- 2026-04-04: Verified the auth fallback path in-browser:
  - with no Firebase config present, the app still booted cleanly in guest mode
  - the account button and guest-home CTA both opened the auth modal
  - the auth modal rendered correctly in English, Hebrew, and Russian
  - the top bar stayed stable at desktop widths after the new auth control was added
  - mobile guest-banner signup flow opened correctly and showed validation feedback
  - browser console remained free of runtime errors in the no-config path
- 2026-04-04: Verified real Firebase auth against the existing project config at runtime:
  - sign-up with email/password completed successfully
  - sign-out returned the app cleanly to guest mode
  - sign-in with the same account worked after logout
  - authenticated session state persisted across refresh
  - the current Firebase project does not yet have a Firestore database, so the optional per-user profile document hook remains best-effort until Firestore is created
- 2026-04-05: Fixed persistence isolation boundaries:
  - removed the old shared `lootwords-profile` runtime path from active use and archive it on boot if it still exists
  - guest progress now uses session-only storage and no longer survives as a shared pseudo-account
  - authenticated progress is now keyed per Firebase user instead of using one shared browser profile
  - the runtime now attempts `users/{uid}/progress/main` first and falls back to per-user local browser storage if Firestore is unavailable
  - verified guest/session isolation and user A vs user B isolation in the browser with real auth sessions
  - updated `firestore.rules` to the owner-only `users/{uid}` / `users/{uid}/progress/{documentId}` pattern, but the current Firebase project still needs a real Firestore database created before backend enforcement can be verified live
- 2026-04-06: Added progressive rarity-upgrade logic to reward-box openings:
  - base rarity selection and upgrade odds now live in centralized loot tuning instead of the UI layer
  - each rarity stage now runs on its own five-tap cycle, with upgrades resetting stage progress and changing the live cinematic rarity state immediately
  - final reward resolution now waits until the current stage finishes without upgrading, which keeps high-rarity outcomes meaningfully rarer
  - verified with a deterministic manager test and a live browser smoke test that both the upgrade path and the standard reveal path still work without console errors
- 2026-04-30: Shipped the first real non-card rewards:
  - coins now award a real persisted balance with rarity-scaled amounts in the live loot pipeline
  - stickers now use a safe starter catalog with icon placeholders and real owned-state persistence
  - duplicate sticker rewards now convert into coins instead of creating duplicate ownership entries
  - the live loot pool now limits active non-card rewards to cards, coins, and stickers while future cosmetics stay foundation-only
  - verified reward logic for coin rewards, sticker ownership, and duplicate-sticker conversion, plus browser rendering for coin/sticker reveal cards and collection stats
- 2026-04-30: Added profile cosmetics foundation on top of the live loot pipeline:
  - profile avatars and profile backgrounds are now real live reward types with starter catalogs, placeholder icons, and rarity-aware ownership
  - duplicate avatar/background rewards now convert into coins instead of creating duplicate ownership entries
  - profile persistence now includes `selectedProfileAvatarId` and `selectedProfileBackgroundId`
  - first-owned avatars/backgrounds now auto-equip as the minimal equipped-state foundation
  - reward reveal now renders explicit avatar/background reward states and duplicate-conversion states
  - collection now shows avatar/background ownership counts plus the currently equipped avatar/background preview
  - verified reward application, duplicate conversion, collection rendering, and reward rendering without console errors
- 2026-04-30: Added cursor-skin foundation on top of the live loot pipeline:
  - cursor skins are now real live reward types with a starter catalog, placeholder icons, and generated placeholder cursor visuals
  - duplicate cursor-skin rewards now convert into coins instead of creating duplicate ownership entries
  - profile persistence now includes `selectedCursorSkinId`
  - the first owned cursor skin now auto-equips as the minimal equipped-state foundation
  - the equipped cursor now applies globally on fine-pointer devices without affecting touch-only usability
  - reward reveal now renders explicit cursor-skin reward states and duplicate-conversion states
  - collection now shows cursor-skin ownership counts plus the currently equipped cursor preview
  - verified reward application, collection rendering, reward rendering, and live cursor application on reload without console errors

## Notes

- MVP card art uses embedded icon-based placeholders so the app is playable before custom images are added.
- The browser verification used a simple local static server during development.
- Audio file paths are now documented in `lootwords/assets/audio/README.md`, while the live app stays on synthesized fallback cues until real files are added.
- The card library now uses category-backed starter packs:
  - `starter-daily`: home, clothes, school, kitchen, bathroom
  - `starter-world`: animals, food, nature, city, people/jobs
  - `starter-adventure`: vehicles, toys, fantasy, sports
- Replayability now uses a registry-driven game layer with eight active mini-games:
  - `memory-match`
  - `picture-match`
  - `flash-find`
  - `loot-pop`
  - `tap-the-word`
  - `repeat-after-me`
  - `sequence-memory`
  - `image-reveal`
- Parent Mode now uses a dedicated admin layer with these main modules:
  - `lootwords/scripts/core/parent-mode.js`
  - `lootwords/scripts/core/content-validator.js`
  - `lootwords/scripts/core/import-export-manager.js`
  - `lootwords/scripts/core/reset-manager.js`
  - `lootwords/scripts/ui/parent-screen.js`
  - `lootwords/scripts/ui/parent-sections/`
- New docs added during hardening:
  - `lootwords/docs/architecture.md`
  - `lootwords/docs/content-model.md`
  - `lootwords/docs/future-roadmap.md`
