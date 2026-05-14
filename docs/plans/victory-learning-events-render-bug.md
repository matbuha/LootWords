# Victory Learning Events Render Bug Plan

## Summary

Fix the victory/results overlay so internal game result data, especially `learningEvents`, never renders as user-facing chips like `[object Object]`. The fix should preserve the existing game completion payload and progression flow, but make `renderVictoryStats()` defensive and explicitly user-facing.

## Relevant Files and Components to Inspect

- `public/scripts/ui/game-screen.js`
  - `renderVictoryStats(result)`
  - `formatVictoryLabel(key)`
  - `formatVictoryValue(key, value)`
  - `mountSelectedGame()` and its `onLearningEvent`, `onWin`, and `onLose` callbacks
  - result overlay markup around `renderOutcomeSummary(result)` and `renderVictoryStats(result)`
- `public/scripts/app.js`
  - `actions.finishGame(result)`
  - win path where `result.details.learningEvents` is passed to `awardEvolutionEvents()`
  - Daily Challenge result summary merge
- `public/scripts/data/card-evolution.js`
  - confirms `learningEvents` are internal progression inputs.
- Game detail producers:
  - `public/scripts/games/tap-the-word-game.js`
  - `public/scripts/games/sequence-memory-game.js`
  - `public/scripts/games/repeat-after-me-game.js`
  - `public/scripts/games/image-reveal-game.js`
  - other mini-games that call `onWin(details)` / `onLose(details)`
- `public/scripts/data/translations.js`
  - existing `play.*Label` and `play.stat*` labels in Hebrew, English, and Russian.

## Likely Root Cause

`renderVictoryStats(result)` currently calls `Object.entries(result.details)` and renders every key/value pair as a victory chip. `mountSelectedGame()` appends `learningEvents: [...learningEvents]` into `details` before calling `actions.finishGame()`. Because `learningEvents` is an array of event objects, `formatVictoryValue()` falls through to `String(value)`, which produces `[object Object],[object Object]...`.

The bug is a UI rendering leak, not a game completion or progression bug. `actions.finishGame()` intentionally reads `result.details.learningEvents` and passes it into `awardEvolutionEvents()`, so the data flow must remain intact.

## Proposed Rendering and Filtering Fix

1. In `public/scripts/ui/game-screen.js`, replace the open-ended `Object.entries(result.details)` rendering with an allowlist of user-facing result detail keys.
2. Keep the existing meaningful stats in the allowlist:
   - `timeLeftMs`
   - `roundsCleared`
   - `heartsLeft`
   - `bestChain`
   - `hits`
   - `bestCombo`
   - `moves`
   - `matches`
   - `correctAnswers`
   - `totalRounds`
   - `roundIndex`
   - `misses`
3. Explicitly exclude internal fields from victory chips:
   - `learningEvents`
   - future arrays of objects
   - future plain objects
   - callback/debug/session identifiers unless intentionally added to the allowlist
4. Update `formatVictoryValue(key, value)` to return `null` for unsafe values:
   - arrays
   - plain objects
   - functions
   - `undefined`
   - `null`
   - non-finite numbers
5. Update `renderVictoryStats(result)` so it:
   - iterates the allowlist in a stable order
   - skips missing keys
   - skips values where `formatVictoryValue()` returns `null`
   - returns an empty string if no valid user-facing detail rows remain
6. Keep `result.details` unchanged when passed through `actions.finishGame()`. Do not strip `learningEvents` before progression has consumed it.

## Multilingual Considerations

- The visible label set should continue to use existing translation keys through `formatVictoryLabel()`.
- Do not display raw detail keys as fallback labels in the victory UI, because untranslated keys are not appropriate in Hebrew, English, or Russian.
- If a new user-facing stat is added later, require adding:
  - an allowlist entry in `game-screen.js`
  - a mapped label in `formatVictoryLabel()`
  - translation strings in `public/scripts/data/translations.js` for Hebrew, English, and Russian if no existing label is suitable.
- `learningEvents` should not receive a translation key for the victory overlay because it is internal technical data.

## Regression Risks

- Accidentally removing valid detail chips if the allowlist misses an existing game stat.
- Breaking card evolution if `learningEvents` are removed from `result.details` before `actions.finishGame()` reads them.
- Hiding Daily Challenge reward information if summary chips are confused with detail chips. The summary chips in `renderOutcomeSummary()` should remain separate and unchanged.
- Rendering an empty `.victory-chip-row` if every detail is filtered out. `renderVictoryStats()` should return `""` in that case.
- Future games may add new user-facing stats and forget to register them, so the allowlist should be documented near the rendering helper.

## Verification Steps

1. Complete one game that emits learning events, such as Tap the Word, Sequence Memory, Repeat After Me, or Image Reveal.
2. On the victory overlay, confirm there is no chip with label `learningEvents`.
3. Confirm no visible value contains `[object Object]`.
4. Confirm valid user-facing stats still render, such as rounds, hearts, time, hits, combo, moves, matches, or correct answers depending on the game.
5. Confirm reward summary chips still render for wins:
   - reward boxes
   - streak
   - total wins
   - first-win bonus when applicable
   - Daily Challenge reward chip when applicable
6. Confirm card evolution/progression still receives learning events by checking that XP behavior remains unchanged for authenticated users where evolution is enabled.
7. Repeat the victory overlay check with UI language set to English, Hebrew, and Russian.
8. Complete or fail a Daily Challenge attempt and confirm the result overlay does not leak internal objects while preserving Daily Challenge completion/reward behavior.
9. Add a temporary local/dev-only object or array detail during manual testing if needed, then confirm the defensive renderer skips it instead of stringifying it.

## Docs Update Decision

No contributor-facing docs update is required for this bug fix unless implementation adds a documented convention for registering new victory stats. If that convention is added, update `docs/architecture.md` or a nearby contributor note to state that victory detail chips are allowlisted and internal `result.details` fields must not be rendered automatically.
