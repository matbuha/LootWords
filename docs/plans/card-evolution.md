# Card Evolution Plan

## Goal

Plan a simple Card Evolution MVP where authenticated users can grow owned/unlocked cards through meaningful learning actions. The system should be account-specific, preserve existing collection/reward/game/speech behavior, and stay small enough to extend later without adding combat, trading, monetization, or complex skill trees.

## Relevant Existing Systems and Files to Inspect

- `docs/CODEX_SYSTEM.md`
  - PLAN/EXECUTE workflow, account isolation, child-friendly UI, English speech rule.
- `docs/FEATURES.md`
  - Card Evolution is an approved direction; learning loop is image + sound + rewards.
- `public/scripts/data/cards.js`
  - `CARD_LIBRARY`, card ids, `hydrateCards(profile)`, current card runtime shape.
- `public/scripts/core/card-utils.js`
  - card definition validation, sorting, rarity/category behavior.
- `public/scripts/storage.js`
  - `createInitialProfile()`, `normalizeProfile()`, per-user Firestore persistence, guest session behavior, `STORAGE_VERSION`.
- `public/scripts/core/content-validator.js`
  - import validation and known profile fields.
- `public/scripts/core/progression.js`
  - collection summaries, unlocked card filtering, strongest/weakest card calculations.
- `public/scripts/core/game-session-manager.js`
  - win/loss summaries and existing reward box progression.
- `public/scripts/core/loot-manager.js`
  - card unlock rewards, duplicate card reward handling, reward application.
- `public/scripts/core/box-opening-manager.js`
  - reward box opening flow that calls `applyLootReward()`.
- `public/scripts/ui/ui-kit.js`
  - `renderCard()`/`renderDetailCard()`, English speech attributes, compact/detail card surfaces.
- `public/scripts/ui/collection-screen.js`
  - card collection grid and detail modal where level badges/progress should appear.
- `public/scripts/ui/reward-screen.js`
  - duplicate card reveal and new-card reveal presentation.
- `public/scripts/ui/game-screen.js`
  - game mount API and `finishGame()` result path.
- `public/scripts/games/tap-the-word-game.js`
  - correct target selection event; currently returns aggregate details only.
- `public/scripts/games/sequence-memory-game.js`
  - correct sequence inputs; currently keeps per-card sequence state internally.
- `public/scripts/games/repeat-after-me-game.js`
  - per-card repeat/listen rounds if present in current game set.
- `public/scripts/games/image-reveal-game.js`
  - correct identified target card; currently returns aggregate details only.
- `public/scripts/core/speech-manager.js`
  - English speech playback; useful if speech-click XP is added.
- `public/scripts/app.js`
  - central actions, `finishGame()`, `openCardModal()`, card speech callback wiring, `commitState()`.
- `public/scripts/data/translations.js`
  - visible labels in English, Hebrew, and Russian.
- `firestore.rules`
  - per-user progress isolation.
- `README.md`, `PROJECT_STATUS.md`, `OPEN_TASKS.md`, `docs/architecture.md`, `docs/content-model.md`
  - contributor docs to update after implementation.

## Current Foundation

- Cards already have stable ids.
- Unlocked cards are stored per profile in `unlockedCardIds`.
- Existing per-card `pointsByCardId` is a card score/value system, not a learning XP/evolution system.
- Guest and authenticated profiles are already separated.
- Authenticated profiles persist in per-user Firestore/local fallback.
- Card rendering is centralized enough for small badges/progress indicators.
- Game modules know per-card choices internally, but the app-level `finishGame()` currently receives mostly aggregate details.
- Duplicate card rewards currently convert to bonus stars through `loot-manager.js`.

Main implementation risk:

- XP should not be inferred from aggregate win/loss totals alone. The clean path is to emit explicit per-card learning events from games or include per-card event summaries in game result details.

## Proposed Card Evolution Data Model

Add a new profile field:

```js
cardEvolutionByCardId: {
  [cardId]: {
    xp: 0,
    level: 1,
    lastXpAt: null,
    sourceCounts: {
      "tap-the-word.correct": 0,
      "sequence-memory.correct": 0,
      "repeat-after-me.round": 0,
      "image-reveal.correct": 0,
      "collection.listen": 0,
      "duplicate-card": 0
    },
    cooldowns: {
      "collection.listen": "2026-05-07T..."
    }
  }
}
```

MVP rules:

- Only unlocked cards can have persisted evolution entries.
- Missing unlocked-card entries are treated as level 1 with 0 XP.
- Locked cards always show no evolution progress or a locked state.
- Level is derived from XP and config thresholds, not trusted blindly.
- Store `level` only if it simplifies UI; normalize it from XP on load to avoid drift.
- Keep evolution independent from existing `pointsByCardId`.
- Do not rename or repurpose existing `points`.

Suggested defaults:

- `maxLevel: 5`
- thresholds:
  - level 1: 0 XP
  - level 2: 30 XP
  - level 3: 80 XP
  - level 4: 150 XP
  - level 5: 250 XP

Visual evolution state:

- `sprout` or `level-1`
- `shine` or `level-2`
- `glow` or `level-3`
- `star` or `level-4`
- `mastered` or `level-5`

Keep names child-friendly and cosmetic only. Evolution should not change game difficulty, reward odds, combat stats, or monetization.

## Centralized Configuration

Add a focused config file in EXECUTE mode:

```text
public/scripts/data/card-evolution.js
```

Recommended exports:

```js
export const CARD_EVOLUTION_CONFIG = Object.freeze({
  enabled: true,
  authenticatedOnly: true,
  maxLevel: 5,
  thresholds: [0, 30, 80, 150, 250],
  xpEvents: {
    "tap-the-word.correct": 5,
    "sequence-memory.correct": 4,
    "sequence-memory.round-complete": 8,
    "repeat-after-me.round-complete": 4,
    "image-reveal.correct": 6,
    "collection.listen": 1,
    "duplicate-card": 20
  },
  dailyCaps: {
    "collection.listen": 5,
    "per-card-total": 60
  },
  cooldownMs: {
    "collection.listen": 300000
  },
  duplicateCardBehavior: "xp",
});
```

Create a core manager:

```text
public/scripts/core/card-evolution-manager.js
```

Recommended functions:

- `createEmptyCardEvolutionState()`
- `normalizeCardEvolution(raw, unlockedCardIds)`
- `getCardEvolution(cardId, profile)`
- `getEvolutionLevel(xp)`
- `getEvolutionProgress(xp)`
- `getEvolutionVisualState(level)`
- `awardCardXp(profile, authState, events, context)`
- `applyDuplicateCardEvolution(profile, cardId, rarity, context)`

The manager should be the only place that mutates evolution state.

## Per-User Persistence Strategy

Authenticated users:

- Persist `cardEvolutionByCardId` in the authenticated profile document.
- Save through the existing `commitState()` and `saveScopedProfile()` flow.
- Normalize on load so unknown card ids and locked-card evolution entries are discarded.
- Update `STORAGE_VERSION` only if project convention requires it for new profile fields.

Guests:

- Do not persist Card Evolution.
- Do not award persistent evolution XP.
- UI should show a locked/motivational account state where evolution details are promoted.
- Guest gameplay should continue unchanged.

Storage normalization:

- Add `cardEvolutionByCardId: {}` to `createInitialProfile()`.
- In `normalizeProfile()`:
  - accept only known card ids.
  - keep entries only for currently unlocked cards.
  - clamp XP to a safe integer range.
  - derive level from XP and thresholds.
  - normalize timestamps.
  - normalize source counts and cooldown data.
- In `content-validator.js`:
  - add `cardEvolutionByCardId` to known profile fields.
  - validate keys against known cards.
  - validate non-negative XP and sane levels.

Firestore rules:

- No rules change expected because user progress is already owner-only.

## Proposed XP Sources

Use explicit learning events. Do not infer per-card XP from generic wins unless per-card details are present.

MVP recommended sources:

- `tap-the-word.correct`
  - Award XP to the target card when the user chooses the correct card.
  - Requires `tap-the-word-game.js` to report the correct target card id through a learning-event callback or result detail.
- `sequence-memory.correct`
  - Award small XP for each correct card in the sequence.
  - Optionally award a round-complete bonus for each card in a completed sequence.
- `repeat-after-me.round-complete`
  - Award XP when the user completes the round for a card.
  - Keep it modest because current browser speech/mic behavior may vary.
- `image-reveal.correct`
  - Award XP to the target card when correctly identified.
- `collection.listen`
  - Optional. Award tiny XP when a logged-in user opens/listens to an unlocked card.
  - Must use cooldowns and daily caps.
- `duplicate-card`
  - Award XP when a reward box rolls a duplicate card if configured.

Nice-to-have later, not required for MVP:

- XP for Memory Match matched pairs.
- XP for Picture Match target choices.
- XP for Learn review sessions.
- XP streak bonuses.
- Parent-visible learning summaries.

## Game Event Flow

Preferred approach:

1. Add an optional `onLearningEvent(event)` callback to the game mount context.
2. Games emit small event objects when meaningful per-card learning actions happen:

```js
{
  source: "tap-the-word.correct",
  cardId: "dog",
  gameId: "tap-the-word",
  roundId: "tap-the-word:2",
  occurredAt: "..."
}
```

3. `game-screen.js` passes `onLearningEvent` to mounted games.
4. `app.js` handles it through an action like `awardCardEvolutionXp(events)`.
5. The action checks:
   - auth is authenticated.
   - card is known.
   - card is unlocked.
   - event source is configured.
   - cooldown/cap allows XP.
6. The action commits the updated profile.

Alternative approach:

- Games collect `learningEvents` internally and include them in `onWin(details)` and `onLose(details)`.
- `finishGame()` applies eligible XP once per final result.

Preferred for MVP:

- Use result-bundled `learningEvents` for games with discrete rounds to reduce save frequency.
- Use immediate callback only for collection/speech XP if that source is enabled.

## Duplicate-Card Handling

Current behavior:

- Duplicate card rewards convert to `bonusStars` through `applyLootReward()`.

Plan config options:

- `duplicateCardBehavior: "stars"`
  - Preserve current behavior.
- `duplicateCardBehavior: "xp"`
  - Convert duplicate cards to Card Evolution XP instead of bonus stars for authenticated users.
- `duplicateCardBehavior: "xp-and-stars"`
  - Split value between XP and stars.
- `duplicateCardBehavior: "coins"`
  - Future-compatible option if card duplicates move to coins.

Recommended MVP:

- Keep current duplicate-to-stars behavior by default for safety.
- Add config and manager support for duplicate-to-XP, but only enable it if UI/reward copy is updated and verified.
- If enabled:
  - apply only for authenticated users.
  - apply only if the duplicate card is unlocked.
  - route mutation through `card-evolution-manager.js`.
  - update reward reveal copy to say the duplicate helped that card grow.
  - cap XP if the card is already max level.

Do not change duplicate handling for stickers/cosmetics.

## Proposed UI Changes

Keep UI changes small and non-disruptive.

Collection grid:

- Add a compact level badge on unlocked cards:
  - `Lv 1`, `Lv 2`, etc.
- Add an optional tiny progress ring/bar only if it does not clutter the card.
- Do not show evolution badges on locked cards.
- Do not remove existing points, rarity, category, or speech behavior.

Card detail modal:

- Add:
  - level label.
  - XP progress bar to next level.
  - visual state name.
  - short "Keep practicing" copy.
- Keep the English word and card artwork prominent.
- Clicking/listening behavior must still speak the English word.

Reward Center:

- For the card category, show evolution level beside owned card entries.
- Do not add a full customization/equip workflow.

Reward reveal:

- If duplicate-to-XP is enabled, show XP gained for the duplicate card.
- If duplicate-to-stars remains default, no reward reveal change is required.

Game result overlay:

- Optional small XP summary:
  - "Cards practiced: 4"
  - "+18 XP"
- Avoid listing many card names on mobile.

Guest UI:

- In collection card detail, show an account-only evolution prompt for unlocked guest cards.
- Do not show fake XP or fake levels as persisted progress.

Multilingual labels needed:

- Card Level
- Level {level}
- XP
- {current}/{target} XP
- Max level
- Evolved
- Keep practicing
- Sign in to grow cards
- Card growth is saved to your account
- Duplicate helped this card
- +{xp} XP
- Today’s XP limit reached

Add labels for English, Hebrew, and Russian.

## Auth and Guest Behavior

Authenticated:

- Can earn and persist Card Evolution XP.
- Can see real per-card progress.
- Only unlocked cards can gain XP.
- Progress is tied to the current Firebase user profile.

Logged out:

- Can keep playing existing games.
- Does not persist evolution progress.
- Does not earn account evolution XP.
- Sees locked/motivational state where evolution UI appears.
- Speech playback remains available where it already is.

Auth transitions:

- On sign-in, load authenticated evolution state with the profile.
- Do not merge guest session evolution progress into the account in MVP.
- On sign-out, clear authenticated evolution display and fall back to guest locked state.

## Anti-Spam and Farming Considerations

General:

- Award XP only for configured sources.
- Award XP only once per event id/round where practical.
- Clamp XP gains per card and per session/day.
- Ignore unknown card ids, locked cards, repeated stale events, and disabled sources.

Gameplay:

- Tap the Word:
  - Award only for correct answer.
  - Award once per round.
- Sequence Memory:
  - Award only for the expected correct input.
  - Award each card at most once per sequence occurrence.
- Repeat After Me:
  - Award once per completed round.
  - Do not require unreliable speech recognition unless already available.
- Image Reveal:
  - Award only for correct target identification.
  - Award once per round.

Speech-click XP:

- Make this optional and low value.
- Award only for authenticated users.
- Award only when the card is unlocked.
- Use per-card cooldown, suggested 5 minutes.
- Use daily cap, suggested 5 XP per card from listening.
- Do not award XP for rapid repeated clicks or automatic speech replay.
- Preserve English speech regardless of XP outcome.

Duplicate rewards:

- Do not let duplicate-card XP exceed max level.
- If card is maxed, use configured fallback:
  - current stars behavior, or
  - coins if a future config enables that.

## Edge Cases

- Card is locked:
  - no XP award; no persisted evolution entry.
- Card id is unknown:
  - ignore and optionally warn in dev.
- Guest completes XP-worthy action:
  - no persistence; gameplay unchanged.
- Auth state is loading:
  - do not award XP until authenticated state is confirmed.
- User signs out mid-game:
  - XP should not be committed to the signed-out session.
- User switches accounts:
  - show only the active user's evolution state.
- Parent Mode disables a card/category:
  - existing playable-pool rules apply; existing evolution entries remain but hidden/inactive if card is not shown.
- Duplicate card reward for max-level card:
  - use configured fallback.
- Multiple rapid callbacks from a game:
  - event ids/caps prevent double XP.
- Refresh after event but before save:
  - accepted risk for local session events; Firestore save follows existing profile persistence behavior.
- Daily Challenge completion:
  - Daily Challenge reward flow unchanged; any XP events from the underlying game should follow normal authenticated XP rules.
- Existing `pointsByCardId`:
  - leave unchanged; evolution XP is separate.
- Import payload includes invalid evolution:
  - normalize or reject invalid entries.

## Verification Steps

Run locally:

```powershell
python -m http.server 8123 --bind 127.0.0.1 --directory public
```

Authenticated verification:

1. Sign in as user A.
2. Unlock at least one card.
3. Play Tap the Word and answer correctly for an unlocked card.
4. Confirm that card gains XP and level/progress displays in collection detail.
5. Play Sequence Memory and confirm only correctly used cards gain XP.
6. Play Repeat After Me and confirm completed card rounds gain XP if source is implemented.
7. Play Image Reveal and confirm correctly identified target gains XP.
8. Confirm locked cards do not gain XP.
9. Refresh and confirm XP persists for user A.

Guest verification:

1. Sign out.
2. Play the same games.
3. Confirm gameplay still works.
4. Confirm evolution progress is locked/not persisted.
5. Refresh and confirm no guest evolution state appears.

Anti-spam verification:

1. Rapidly click/listen to the same unlocked card.
2. Confirm speech still plays according to existing behavior.
3. Confirm XP respects cooldown and daily caps.
4. Trigger repeated game callbacks if possible and confirm XP is not duplicated.

Duplicate-card verification:

1. Configure duplicate behavior as current default.
2. Confirm duplicate card rewards still grant stars.
3. If duplicate-to-XP is enabled, confirm duplicate card rewards grant XP once, update reveal copy, and do not overfill max-level cards.

Account isolation:

1. Earn XP as user A.
2. Sign out and sign in as user B.
3. Confirm user B has independent evolution state.
4. Sign back into user A and confirm user A's state is restored.

Regression:

1. Open reward boxes and confirm card unlocks still work.
2. Confirm non-card rewards still work.
3. Confirm Daily Challenge still grants one reward per day.
4. Confirm card click still speaks English.
5. Confirm Collection, Reward Center, Learn, and games remain mobile-friendly.
6. Test English, Hebrew, and Russian labels.

## Documentation Updates After Implementation

- `README.md`
  - Add Card Evolution to existing features if implemented.
  - Clarify that it is authenticated-only and separate from card points.
- `PROJECT_STATUS.md`
  - Move Card Evolution from future/open work to current MVP status.
  - Note XP sources implemented and any sources deferred.
- `OPEN_TASKS.md`
  - Mark the MVP as done or narrow remaining work:
    - more XP sources.
    - richer visual states.
    - parent summaries.
    - duplicate-to-XP tuning.
- `docs/architecture.md`
  - Document `cardEvolutionByCardId`, manager responsibilities, and auth-only persistence.
- `docs/content-model.md`
  - Document how cards can evolve without changing base card metadata.
- Contributor notes
  - Mention new config file and how to add XP events safely.

## Out of Scope

- Battle/combat mechanics.
- Skill trees.
- Trading.
- Monetization.
- Shop changes.
- Full card UI redesign.
- Card Evolution for guests.
- Merging guest progress into accounts.
- Changing English speech behavior.
- Rebalancing the entire loot system.
