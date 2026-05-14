# Box Opening Final Click Stuck Plan

## Summary

Fix the reward box flow so the final required click reliably moves from pre-open/waiting state into the cinematic opening, reveal, and granted reward state. Preserve the existing multi-click tension, rarity upgrade stages, reward balancing, inventory rules, Daily Challenge reward sync, and reveal animation timing.

## Relevant Files and Components to Inspect

- `public/scripts/core/box-opening-manager.js`
  - `beginBoxOpeningSession()`
  - `advanceBoxOpeningSession()`
  - `createOpeningSession()`
  - final `status: "resolved"` branch
  - upgrade branch and `stageClicks` reset behavior
- `public/scripts/app.js`
  - `createRewardSession()`
  - `tapRewardBox()`
  - `rewardRevealTimeout`
  - `clearRewardRevealTimeout()`
  - route-change reward session reset logic
  - profile persistence through `commitState()`
  - Daily Challenge `markCurrentRewardOpened()` call
- `public/scripts/ui/reward-screen.js`
  - `renderRewardScreen()`
  - `getBoxStateClass()`
  - `getPhaseCopy()`
  - disabled/clickable logic for `[data-reward-box]`
  - `getDebugState()`
- `public/scripts/core/loot-manager.js`
  - `generateLootRewardForRarity()`
  - `applyLootReward()`
  - account-only inventory reward filtering through `allowAccountInventoryRewards`
- `public/scripts/data/config.js`
  - `BOX_TAP_COUNT`
  - `REWARD_REVEAL_DELAY_MS`
- `public/styles/main.css`, `public/styles/theme.css`, `public/styles/animations.css`
  - `.reward-box--tap-*`
  - `.reward-box--upgraded`
  - `.reward-box--opening`
  - `.reward-reveal--revealing` / `.reward-reveal--revealed`
- `public/scripts/core/daily-challenge-manager.js`
  - reward-open sync and idempotency for Daily Challenge rewards.

## Current Lifecycle to Confirm

1. User clicks a reward box in `renderRewardScreen()`.
2. `actions.tapRewardBox()` calls `advanceBoxOpeningSession()`.
3. If no opening session exists, a session starts and the first click is counted.
4. Clicks below `BOX_TAP_COUNT` return `status: "progress"`.
5. At `BOX_TAP_COUNT`, the manager either:
   - returns `status: "upgraded"` and resets `stageClicks` to `0`, or
   - returns `status: "resolved"` with `reward`, `profile`, and final `opening`.
6. `tapRewardBox()` immediately commits the resolved profile and stores:
   - `opening: rewardResult.opening`
   - `pendingReveal: rewardResult.reward`
   - `reveal: null`
   - `phase: "opening"`
7. `rewardRevealTimeout` later moves `pendingReveal` into `reveal`, clears `pendingReveal`, and sets `phase: "revealed"`.

The stuck state likely occurs between steps 6 and 7.

## Likely Root Cause Candidates

- Final click resolves reward data, but `rewardRevealTimeout` does not fire or is cleared before it moves `pendingReveal` to `reveal`.
- Route/render lifecycle clears the timeout while keeping `phase: "opening"` and `pendingReveal` in session state.
- `tapRewardBox()` guard blocks further clicks while `session.reward.phase === "opening"`, leaving no user action path to recover.
- The reveal timeout callback commits `reveal: currentState.session.reward.pendingReveal` without validating that `pendingReveal` still exists.
- A render error or missing reveal data leaves the UI showing opening/anticipation copy without a visible fallback.
- Rarity upgrade logic may reset `stageClicks` repeatedly if upgrade chances or available rarities are misconfigured, making users believe they reached the final click when the state actually moved to another upgraded stage.
- A reward payload could be generated as fallback or unknown type and render poorly, but this should not block the transition if `pendingReveal` exists.
- Daily Challenge reward-open sync might fail asynchronously, but it should not block reveal because the current code does not await it.

## Proposed Fix Strategy

1. Add a small internal helper in `public/scripts/app.js`, for example `completePendingRewardReveal(source = "timer")`, that:
   - reads current session state,
   - only acts when `session.reward.phase === "opening"` and `session.reward.pendingReveal` exists,
   - moves `pendingReveal` to `reveal`,
   - clears `pendingReveal`,
   - sets `phase: "revealed"`,
   - triggers the same reveal feedback events currently fired in the timeout callback.
2. Use that helper from the existing `REWARD_REVEAL_DELAY_MS` timeout instead of duplicating transition logic inline.
3. Store enough reveal context in session state when the reward resolves so delayed completion does not depend on closed-over variables that can become stale:
   - final reward payload,
   - revealed card id/type where applicable,
   - final rarity,
   - whether the album milestone was reached.
4. Add a defensive recovery path when rendering or interacting with the reward route:
   - if `phase === "opening"` and `pendingReveal` exists but there is no active `rewardRevealTimeout`, schedule a new reveal timeout or complete with a short fallback delay.
   - if `phase === "opening"` and `pendingReveal` is missing, reset to a safe revealed message or idle state only after preserving any already committed profile changes.
5. Keep the cinematic delay as the normal path. The fallback should only recover a stale intermediate state; it should not make normal openings instant.
6. Keep `advanceBoxOpeningSession()` as the single source for click counting, rarity upgrades, final rarity, reward generation, and profile mutation.
7. Keep `applyLootReward()` and inventory/auth behavior unchanged except for any defensive null checks needed by the reveal UI.
8. Ensure `tapRewardBox()` does not allow double-spending:
   - once `status: "resolved"` commits the profile, further box clicks stay blocked until the reveal is shown or reset.
   - recovery must reveal the existing `pendingReveal`, not generate another reward.
9. Consider adding a debug-only state marker such as `openingStartedAt` or `revealDueAt` inside `session.reward` so stale `"opening"` states can be detected without guessing.

## State Machine / Lifecycle Considerations

Recommended reward session phases:

- `idle`: no current box opening; box can be clicked if `profile.rewardBoxes > 0`.
- `warming` / `charged`: click progress below current stage threshold.
- `upgraded`: upgrade animation/copy is shown; next click starts the next rarity stage.
- `opening`: final reward has already been generated and profile has already been updated; UI is waiting for cinematic reveal delay.
- `revealed`: reveal is visible; user can queue next box or leave.

Important invariants:

- `phase: "opening"` must always have a non-null `pendingReveal`.
- `phase: "revealed"` must have a non-null `reveal`, except for explicit blocked/message states.
- A resolved opening must not call `advanceBoxOpeningSession()` again for the same box.
- Route changes away from Reward Room may clear the timeout, but should not leave a stuck state if the user returns before session reset or if the route remains reward.
- `rewardBoxes` should decrement only once, at final resolution.
- Daily Challenge reward-open marking should remain best-effort and idempotent.

## Regression Risks

- Revealing twice could replay audio/feedback or duplicate milestone effects.
- Retrying recovery incorrectly could generate a second reward or decrement another box.
- Moving reveal data into session could accidentally persist transient data if routed through profile persistence.
- Over-eager fallback could shorten the intended cinematic opening delay.
- Resetting the reward session on route change could discard an already granted pending reward before the user sees it.
- Rarity upgrade stages could become confusing if `stageClicks` reset behavior is changed instead of preserved.
- Unknown reward types must still fall through to the generic reward rendering in `reward-screen.js`.

## Verification Steps

1. Normal earned box, guest:
   - earn or seed one reward box,
   - click exactly `BOX_TAP_COUNT` times per stage,
   - confirm final click switches to opening animation,
   - confirm reward reveal appears after `REWARD_REVEAL_DELAY_MS`,
   - confirm `rewardBoxes` decrements once and `rewardBoxesOpened` increments once.
2. Normal earned box, logged-in:
   - repeat the flow while authenticated,
   - confirm profile/inventory/coins/cards persist after refresh according to existing auth rules.
3. Rarity upgrade path:
   - force or seed upgrade chance if practical,
   - confirm upgrade state resets click stage and then a later final click resolves normally.
4. Reward payload coverage:
   - card reward,
   - duplicate card reward,
   - coins,
   - one account-owned cosmetic type if authenticated.
5. Defensive stuck recovery:
   - simulate `phase: "opening"` with a valid `pendingReveal` and no active timer,
   - render Reward Room,
   - confirm it schedules/completes reveal instead of staying stuck.
6. Missing pending reveal guard:
   - simulate `phase: "opening"` with no `pendingReveal`,
   - confirm UI exits the broken intermediate state without generating another reward.
7. Daily Challenge:
   - complete a Daily Challenge that grants a reward box,
   - open the reward from Reward Room,
   - confirm reveal works and `markCurrentRewardOpened()` remains idempotent.
8. Navigation:
   - click final box tap, then navigate away and back during the opening delay,
   - confirm no duplicate grant and no permanent stuck state.
9. Reduced motion:
   - verify reduced motion users still transition to reveal, even if animations are minimized.
10. Browser checks:
   - verify no console errors during final click, opening delay, reveal, reset, and next-box queue.

## Docs Update Decision

No broad documentation update is required for a targeted bug fix. Update `PROJECT_STATUS.md` or `OPEN_TASKS.md` only if there is an existing open item about reward-box reliability. If implementation formalizes the reward session state machine with new invariants, add a short note to `docs/architecture.md` explaining the transient reward opening lifecycle and the `pendingReveal` recovery rule.
