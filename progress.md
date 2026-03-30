Original prompt: Build LootWords as a browser-based children's word-learning game in plain HTML, CSS, and JavaScript, with two internal mini-games, reward boxes that open in exactly three taps, collectible noun cards with persisted random points and rarity, localStorage persistence, modular architecture, and a phase-by-phase checklist that stays updated.

Current prompt: Upgrade LootWords so it feels more like a real reward-driven game, with stronger reward-box anticipation, richer card reveals, clearer rarity presentation, more tactile interactions, better transitions, collection and learn screen polish, and safe audio hooks without destabilizing the existing MVP.

Latest prompt: Improve the card content system, educational structure, and long-term scalability so LootWords has a stronger collectible English noun foundation with 100-150 visual noun cards, richer metadata, better category support, and future-ready content utilities.

Current prompt: Upgrade LootWords with a modular audio and emotional feedback system so music, sound effects, mute controls, staged reward audio, and event-based feedback all work safely in the browser with missing-asset fallbacks.

Latest prompt: Expand replayability and progression by adding more lightweight mini-games, a cleaner game registry, smoother play selection, and stronger long-term reward hooks without breaking the collectible loop.

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

## Work Log

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

## Notes

- MVP card art uses embedded icon-based placeholders so the app is playable before custom images are added.
- The browser verification used a local static server at `http://127.0.0.1:8123/lootwords/`.
- Audio file paths are now documented in `lootwords/assets/audio/README.md`, while the live app stays on synthesized fallback cues until real files are added.
- The card library now uses category-backed starter packs:
  - `starter-daily`: home, clothes, school, kitchen, bathroom
  - `starter-world`: animals, food, nature, city, people/jobs
  - `starter-adventure`: vehicles, toys, fantasy, sports
- Replayability now uses a registry-driven game layer with four active mini-games:
  - `memory-match`
  - `picture-match`
  - `flash-find`
  - `loot-pop`
