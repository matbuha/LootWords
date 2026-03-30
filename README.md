# LootWords

LootWords is a browser-based, reward-first word-learning game for children. The player clears short mini-games, earns reward boxes, opens them in exactly three taps, and collects noun cards that double as the vocabulary material.

## Latest polish pass

- Reward boxes now build tension across three taps with stronger glow, crack, shake, and burst states.
- Card reveals have clearer collectible framing with rarity-driven halos, badges, and spotlight layouts.
- Home, reward, collection, learn, and play screens now share a more tactile game UI with faster route transitions and richer win states.
- Audio remains optional and safe: the app exposes hooks for real assets, while the current build falls back to lightweight synthesized cues if files are missing.

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
- `lootwords/scripts/core/`: state, rarity, progression, rewards, and audio placeholder logic.
- `lootwords/scripts/games/`: Memory Match and Treasure Match mini-games.
- `lootwords/scripts/ui/`: screen rendering for home, collection, reward, learn, and game hosting.

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

## Verified behavior

- Home, play, reward, collection, and learn screens all route cleanly.
- Random points are generated once and persisted per card.
- Rarity is derived from points and displayed across cards and summaries.
- Memory Match and Treasure Match both award one reward box on victory.
- Reward boxes require exactly three taps and reveal a new card or a 50-star fallback when every card is already unlocked.
- Unlocked cards persist across reloads and appear in collection and learn views.
- Collection filters update and persist in localStorage.
- Learn review filters update and persist in localStorage.
- Placeholder audio cues exist for clicks, reward taps, reward reveal, and victories.
- The reward screen keeps its reveal copy after the final box is opened, instead of dropping back to an empty-state tone.
- Learn review supports next/previous stepping through the unlocked deck.
- Collection now groups cards by category and surfaces starter-pack progress.
- Browser verification completed with zero console errors.

## Optional improvements

- Replace icon placeholders with custom generated art in `lootwords/assets/images/cards/`.
- Add sound asset packs and optional background music on top of the current synthesized placeholders.
- Add progression layers such as streaks, achievements, and themed packs.
- Add a dedicated quiz mode that reuses only unlocked cards.
