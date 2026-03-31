# LootWords Content Model

## Card dataset

The starter library lives in `lootwords/scripts/data/cards.js` and currently contains 140 visual English noun cards.

Each base card entry defines stable content metadata:

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

Runtime hydration adds:

- `points`
- `rarity`
- `unlocked`
- `discoveredAt`

## Categories

Category metadata is defined in `lootwords/scripts/data/categories.js`.

Current categories:

- animals
- food
- vehicles
- home
- clothes
- nature
- toys
- school
- kitchen
- fantasy
- city
- bathroom
- people-jobs
- sports

## Persisted profile data

The browser profile currently stores:

- point assignments by card id
- unlocked card ids
- discovery timestamps
- reward-box counts
- win, streak, and bonus-star stats
- per-game play/win/loss stats
- collection filters
- learn filters
- audio settings
- parent-mode content and reward settings

## Validation rules

- card ids must be unique
- categories must exist in category metadata
- rarity is always derived from persisted points
- imported discovery timestamps must be valid ISO strings
- imported card/game/category keys must be known before they are accepted

## Parent-mode content controls

Parent settings can change child-visible content without mutating the base dataset:

- disable whole categories
- disable specific cards manually
- keep already unlocked cards safely shelved instead of deleting them

This keeps future pack activation and seasonal content filter-based instead of hard-wired into reward logic.

## Extension guidance

### Add new cards

1. Add entries to `lootwords/scripts/data/cards.js`.
2. Reuse an existing category or add the new category metadata first.
3. Keep ids stable and slug-like.
4. Reload and verify filters, reward reveals, and validation still work.

### Add a new content pack

1. Add a new `packId` grouping in the dataset.
2. Surface the pack in future parent controls instead of branching reward logic.
3. Keep pack activation as filtering, not as separate persistence structures.

## Asset replacement workflow

- Placeholder art is currently icon-backed.
- Future custom art can replace the `image` paths while keeping the same card ids.
- Audio replacement paths are documented in `lootwords/assets/audio/README.md`.
