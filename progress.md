Original prompt: Build LootWords as a browser-based children's word-learning game in plain HTML, CSS, and JavaScript, with two internal mini-games, reward boxes that open in exactly three taps, collectible noun cards with persisted random points and rarity, localStorage persistence, modular architecture, and a phase-by-phase checklist that stays updated.

Current prompt: Upgrade LootWords so it feels more like a real reward-driven game, with stronger reward-box anticipation, richer card reveals, clearer rarity presentation, more tactile interactions, better transitions, collection and learn screen polish, and safe audio hooks without destabilizing the existing MVP.

Latest prompt: Improve the card content system, educational structure, and long-term scalability so LootWords has a stronger collectible English noun foundation with 100-150 visual noun cards, richer metadata, better category support, and future-ready content utilities.

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

## Notes

- MVP card art uses embedded icon-based placeholders so the app is playable before custom images are added.
- The browser verification used a local static server at `http://127.0.0.1:8123/lootwords/`.
- Audio asset paths are prepared in config, but the current polish pass still uses placeholder synthesized cues because no final sound files were provided.
- The card library now uses category-backed starter packs:
  - `starter-daily`: home, clothes, school, kitchen, bathroom
  - `starter-world`: animals, food, nature, city, people/jobs
  - `starter-adventure`: vehicles, toys, fantasy, sports
