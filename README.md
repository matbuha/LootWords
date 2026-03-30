# LootWords

LootWords is a browser-based, reward-first word-learning game for children. The player clears short mini-games, earns reward boxes, opens them in exactly three taps, and collects noun cards that double as the vocabulary material.

## Latest polish pass

- Reward boxes now build tension across three taps with stronger glow, crack, shake, and burst states.
- Card reveals have clearer collectible framing with rarity-driven halos, badges, and spotlight layouts.
- Home, reward, collection, learn, and play screens now share a more tactile game UI with faster route transitions and richer win states.
- Audio remains optional and safe: the app now uses a modular audio manager, feedback manager, and persisted settings layer, while the current build falls back to lightweight synthesized cues if files are missing.

## Replayability and progression pass

- The play loop now runs through a shared game registry, so mini-games are mounted and selected from one extensible source instead of hardcoded screen branches.
- Two new lightweight mini-games were added:
  - `Flash Find`: a quick visual-memory round that flashes a target card, then asks the player to tap the same card from a spread.
  - `Loot Pop`: a fast reaction round that asks the player to tap the active glowing pad before it expires.
- Home now supports recommended play, random play, and a fuller game shelf with per-game stats and first-win bonus visibility.
- Play now shows session streak, milestone progress, per-game win counts, and better replay actions after each result.
- Progression is stronger and persisted:
  - every win still awards 1 reward box
  - the first win in a new mini-game grants +1 bonus reward box
  - every 5 total wins grants +20 bonus stars
  - losses now persist and reset the live streak

## Audio and feedback pass

- Audio now initializes only after valid user interaction, so the game stays compliant with browser autoplay restrictions.
- Music state is route-aware:
  - Home, collection, and learn point at the menu track.
  - Play points at the gameplay track.
  - Reward points at the reward track.
- Important events now flow through a shared feedback layer instead of direct scattered cue calls:
  - button clicks
  - menu open
  - screen transitions
  - mini-game win and fail
  - reward taps 1, 2, and 3
  - reward opening burst
  - card reveal
  - Epic and Legendary reveal accents
  - collection card select
  - filter changes
  - progress milestones
  - new-card unlocks
- The current asset workflow is documented in [lootwords/assets/audio/README.md](C:\Users\ariel\Projects\LootWords\lootwords\assets\audio\README.md). Final files can be dropped into the listed paths later without changing the gameplay flow.

## Content foundation

- The starter library now contains 140 curated, image-friendly English nouns.
- Cards are grouped into 14 consistent categories: animals, food, vehicles, home, clothes, nature, toys, school, kitchen, fantasy, city, bathroom, people/jobs, and sports.
- Every card is defined with stable content metadata before profile hydration:
  - `id`
  - `word`
  - `category`
  - `packId`
  - `icon`
  - `image`
  - `imageMode`
  - `difficultyLevel`
  - `tags`
  - `sortOrder`
- Profile hydration then adds runtime progression data:
  - `points`
  - `rarity`
  - `unlocked`
  - `discoveredAt`

## Starter packs

- `starter-daily`: home, clothes, school, kitchen, bathroom
- `starter-world`: animals, food, nature, city, people/jobs
- `starter-adventure`: vehicles, toys, fantasy, sports

These pack ids are already part of every card, so future parent-controlled pack selection and seasonal content can build on the existing model instead of replacing it.

## Parent Mode

- The child-facing flow now has a dedicated parent/admin layer behind a separate `Parent` entry in the top bar and a simple phrase gate (`LOOT` in the current MVP).
- Parent Mode uses a neutral dashboard shell instead of the child-facing reward UI and is split into practical sections:
  - Content
  - Categories
  - Rewards & Progression
  - Child Progress
  - Import / Export
  - Reset Tools
  - Settings
- Parents can now:
  - search and filter the full card library
  - toggle individual cards on or off for child mode
  - enable or disable whole categories
  - tune reward settings such as boxes per win, fallback behavior, and milestone toggles
  - inspect child progress by category, rarity, and mini-game
  - export or import the saved browser profile as JSON
  - run confirmed reset actions for progress, collection, rewards, or settings

## Parent-mode safety rules

- Parent settings persist in localStorage as part of the main profile, so child mode and admin mode always read from the same normalized source of truth.
- Disabled categories and cards are removed from reward generation, collection browsing, learn review, and game card pools without deleting unlocked history.
- If no active cards remain, the child UI now falls back to safe empty states instead of breaking reward or collection flows.
- Import validation now rejects malformed payloads before state is applied.
- Profile normalization now strips unknown fields instead of silently preserving them across future exports.

## Run locally

From `C:\Users\ariel\Projects\LootWords`:

```powershell
python -m http.server 8123 --bind 127.0.0.1
```

Then open:

- `http://127.0.0.1:8123/lootwords/`

## Architecture

- `lootwords/index.html`: static shell and module entry.
- `lootwords/styles/main.css`: global theme, layout, responsive rules, and game/reward animations.
- `lootwords/scripts/app.js`: app bootstrap, shared shell, state actions, persistence wiring, and debug hooks.
- `lootwords/scripts/router.js`: hash-based screen routing.
- `lootwords/scripts/storage.js`: profile initialization, normalization, and localStorage persistence.
- `lootwords/scripts/data/categories.js`: category metadata, pack metadata, and legacy category aliases.
- `lootwords/scripts/data/cards.js`: 140-card visual noun dataset with stable ids, packs, tags, and placeholder icon art.
- `lootwords/scripts/data/config.js`: routes, rarity labels, filter options, game config, and shared constants.
- `lootwords/scripts/core/card-utils.js`: card validation, slug creation, shared sorting, and category grouping helpers.
- `lootwords/scripts/core/audio-manager.js`: safe audio startup, synth fallback cues, music track control, and asset registration.
- `lootwords/scripts/core/feedback-manager.js`: event-to-feedback mapping for sounds and route-level visual pulses.
- `lootwords/scripts/core/settings-manager.js`: normalized audio settings and persistence helpers.
- `lootwords/scripts/core/event-bus.js`: lightweight pub/sub for future event-driven systems.
- `lootwords/scripts/core/game-session-manager.js`: per-game stat normalization, recommended/random game logic, and progression milestone helpers.
- `lootwords/scripts/core/parent-mode.js`: parent settings normalization, active-card filtering, and parent dashboard summaries.
- `lootwords/scripts/core/content-validator.js`: validation for imported admin data and content-related state.
- `lootwords/scripts/core/import-export-manager.js`: JSON export/import helpers for the browser profile.
- `lootwords/scripts/core/reset-manager.js`: confirmed reset actions for child progress, collection, rewards, and settings.
- `lootwords/scripts/core/`: state, rarity, progression, rewards, and supporting gameplay systems.
- `lootwords/scripts/games/game-registry.js`: single registration point for playable mini-games.
- `lootwords/scripts/games/`: Memory Match, Treasure Match, Flash Find, and Loot Pop.
- `lootwords/scripts/ui/parent-screen.js`: parent/admin dashboard shell and section routing.
- `lootwords/scripts/ui/parent-sections/`: content, category, progression, progress, import/export, and reset admin panels.
- `lootwords/scripts/ui/`: screen rendering for home, collection, reward, learn, play, and parent hosting.

## Docs

- [Architecture](C:\Users\ariel\Projects\LootWords\lootwords\docs\architecture.md)
- [Content model](C:\Users\ariel\Projects\LootWords\lootwords\docs\content-model.md)
- [Future roadmap](C:\Users\ariel\Projects\LootWords\lootwords\docs\future-roadmap.md)

## QA and hardening notes

- Saved profiles now write to a primary key plus a backup key so corrupted localStorage can recover without discarding progress immediately.
- Screen destroy/render failures are now contained by a small error boundary instead of taking the whole app down.
- `window.render_game_to_text()` now exposes both total unlocked cards and active unlocked cards so future QA can distinguish parent-shelved content from real progress loss.

## Completed checklist

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

## Verified behavior

- Home, play, reward, collection, and learn screens all route cleanly.
- Random points are generated once and persisted per card.
- Rarity is derived from points and displayed across cards and summaries.
- Memory Match and Treasure Match both award one reward box on victory.
- Flash Find and Loot Pop also award reward boxes cleanly and use the same reward pipeline.
- Reward boxes require exactly three taps and reveal a new card or a 50-star fallback when every card is already unlocked.
- Unlocked cards persist across reloads and appear in collection and learn views.
- Collection filters update and persist in localStorage.
- Learn review filters update and persist in localStorage.
- Placeholder audio cues exist for clicks, reward taps, reward reveal, and victories.
- Audio settings now persist with master mute plus separate music and SFX toggles.
- Missing audio files no longer trigger console errors or break the app.
- Route-aware music state switches cleanly without stacking tracks.
- Reward audio now escalates across tap 1, tap 2, tap 3, opening burst, and reveal.
- Legendary reveal feedback is distinct from lower-rarity reveals and was verified in-browser.
- The reward screen keeps its reveal copy after the final box is opened, instead of dropping back to an empty-state tone.
- Learn review supports next/previous stepping through the unlocked deck.
- Collection now groups cards by category and surfaces starter-pack progress.
- Recommended and random play actions route to valid mini-games.
- Per-game wins, losses, streaks, total plays, and reward-box totals persist after reload.
- Parent Mode opens through a separate gate and does not leak admin panels into the child navigation.
- Category toggles remove inactive vocabulary cleanly from reward, collection, learn, and play flows.
- With all categories disabled, child mode falls back to stable empty states and a blocked reward room instead of crashing or revealing invalid rewards.
- Reset tools require a second confirmation before applying destructive changes.
- Invalid import payloads are blocked and surfaced in the Parent Mode UI instead of being applied.
- Export/import roundtrip works with the validated JSON format.
- A corrupted primary localStorage record now recovers from the backup profile instead of immediately wiping progress.
- Parent Mode now keeps showing total unlocked cards even when some unlocked cards are shelved by disabled categories.
- Render failures are now contained by a safe fallback panel, and the latest captured error is exposed in the debug payload for QA.
- Browser verification completed with zero console errors.

## Optional improvements

- Replace icon placeholders with custom generated art in `lootwords/assets/images/cards/`.
- Drop in final music and sound files using the manifest in `lootwords/scripts/data/config.js` and `lootwords/assets/audio/README.md`.
- Add per-screen music mixing, more layered stingers, and optional ambience on top of the current synthesized placeholders.
- Add progression layers such as streaks, achievements, and themed packs.
- Add a dedicated quiz mode that reuses only unlocked cards.
- Add future learning games that use the same registry: strongest-card comparison, category sorting, point-memory, rarity identification, and image-to-word review rounds.
