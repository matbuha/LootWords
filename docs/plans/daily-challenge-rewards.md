# Daily Challenge Rewards Plan

## Goal

Plan a safe Daily Challenge reward integration that keeps Daily Challenge authenticated-only, grants exactly one daily reward per user per day, and routes the earned reward through the existing loot box and inventory pipeline without weakening reward balancing or leaking state between users.

The current code already has a Daily Challenge MVP and transactional reward-box grant. This plan focuses on making the integration explicit, idempotent, clearer in UI, and ready for a clean Daily Reward Box type if the architecture supports it during execution.

## Relevant Existing Systems and Files to Inspect

- `docs/CODEX_SYSTEM.md`
  - PLAN/EXECUTE workflow, account isolation, no guest persistence for account features, child-friendly UI.
- `docs/FEATURES.md`
  - Daily Challenge direction, reward/card collection system, authenticated-feature rules.
- `public/scripts/core/daily-challenge-manager.js`
  - deterministic daily definition, Firestore loading, `dailyChallenge` state, `startCurrentChallenge()`, `resolveCurrentAttempt()`.
- `public/scripts/app.js`
  - action wiring for `startDailyChallenge()`, `finishGame()`, `tapRewardBox()`, `commitState()`, Daily Challenge snapshot syncing.
- `public/scripts/ui/home-screen.js`
  - Daily Challenge panel states and home CTA.
- `public/scripts/ui/game-screen.js`
  - Daily Challenge route lock, completed state, victory/loss overlay.
- `public/scripts/ui/reward-screen.js`
  - existing reward box opening UX that should be preserved.
- `public/scripts/core/box-opening-manager.js`
  - five-tap box opening, rarity base weights, upgrade chances, reward application.
- `public/scripts/core/loot-manager.js`
  - reward generation, account-only reward gating, inventory application, duplicate conversion.
- `public/scripts/data/reward-balance.js`
  - central rarity weights, early-game guards, upgrade chances, coin/duplicate tuning.
- `public/scripts/data/loot.js`
  - reward types, catalogs, inventory keys, ownable reward rules.
- `public/scripts/data/config.js`
  - `DAILY_CHALLENGE_TIME_ZONE`, `DAILY_CHALLENGE_REWARD_BOXES`, `DAILY_CHALLENGE_GAME_IDS`, `STORAGE_VERSION`.
- `public/scripts/storage.js`
  - authenticated profile persistence, guest session persistence, profile normalization.
- `public/scripts/core/content-validator.js`
  - known profile fields and import validation if new persisted fields are added.
- `firestore.rules`
  - per-user progress isolation.
- `public/scripts/data/translations.js`
  - Daily Challenge, reward, home, play multilingual labels.
- `README.md`, `PROJECT_STATUS.md`, `OPEN_TASKS.md`, `docs/architecture.md`
  - contributor-facing docs to update after implementation.

## Current Foundation

Confirmed current behavior:

- Guests see a locked Daily Challenge state and cannot start from the normal UI.
- Daily Challenge state is stored in the authenticated user's `users/{uid}/progress/main` document under `dailyChallenge`.
- `daily-challenge-manager.js` builds a deterministic daily definition from a UTC date key.
- `resolveCurrentAttempt()` uses a Firestore transaction.
- Successful completion marks the state `completed`, sets `rewardGrantedAt`, and increments `profile.rewardBoxes` and `profile.rewardBoxesEarned`.
- Repeated successful resolution checks `rewardGrantedAt` and does not grant again.
- Failed attempts return the state to `available` and increment attempts.
- The Reward Room opens boxes through the existing box opening and loot pipeline.
- Guest reward openings are already limited to guest-safe reward outcomes because `tapRewardBox()` passes `allowAccountInventoryRewards: auth.mode === "authenticated"`.

Gaps to address in execution:

- Daily reward state should distinguish "completed and reward earned but unopened" from "completed and reward already claimed/opened" more clearly.
- Normal `rewardBoxes` are not source-typed, so the UI cannot reliably know whether the pending box is today's daily reward after it enters the shared box count.
- The current manager and storage normalizers do not have a typed reward-box queue.
- The Daily Challenge UI currently uses `progress.rewardBoxes > 0` as a proxy for "open rewards", which can mix daily and non-daily boxes.

## Proposed Daily Challenge Reward State Model

Keep the existing `dailyChallenge` document field as the source of daily idempotency. Extend it conservatively if needed.

Recommended state shape:

```js
dailyChallenge: {
  dateKey,
  challengeId,
  gameId,
  status: "available" | "in_progress" | "completed",
  startedAt,
  completedAt,
  attempts,
  lastAttemptAt,
  rewardGrantedAt,
  rewardBoxesGranted,
  rewardBoxId,
  rewardBoxType,
  rewardOpenedAt,
  rewardClaimState,
}
```

Recommended derived `rewardClaimState` values:

- `none`
  - challenge not completed or reward not granted.
- `earned`
  - challenge completed and reward box granted, but the daily reward has not been opened yet.
- `opened`
  - the daily reward box has been opened.

Implementation notes:

- `rewardClaimState` can be stored or derived from `rewardGrantedAt` and `rewardOpenedAt`.
- Prefer deriving where possible to reduce mismatch risk.
- `rewardBoxId` should be deterministic and idempotency-friendly, for example `daily:{dateKey}:{uid}:{challengeId}` or `daily:{dateKey}:{challengeId}` stored only inside the user's document.
- Do not store rewards in guest profile or guest Daily Challenge state.

## Reward Box Inventory Model Options

### Option A: Keep Current Count-Based Boxes

Use existing `profile.rewardBoxes` and `profile.rewardBoxesEarned`.

Pros:

- Smallest change.
- Preserves current reward box UX exactly.
- Current transaction already grants once per user per day.

Cons:

- Cannot reliably show "daily reward earned but not opened" once mixed with other box sources.
- Cannot mark the exact daily box opened if the user has multiple boxes.
- Hard to introduce Daily Reward Box behavior.

Use this only if execution must stay extremely small.

### Option B: Add a Lightweight Typed Box Queue

Add a profile field such as:

```js
rewardBoxQueue: [
  {
    id: "daily:2026-05-07:daily:2026-05-07:memory-match:win-run",
    source: "daily-challenge",
    boxType: "daily",
    earnedAt: "2026-05-07T...",
    dateKey: "2026-05-07",
  }
]
```

Keep `profile.rewardBoxes` as the count for backwards compatibility, but treat it as derived from or kept in sync with the queue during migration.

Pros:

- Enables clear "open daily reward" state.
- Enables a special Daily Reward Box type cleanly.
- Supports future source-aware boxes without changing the reward UI again.

Cons:

- Requires storage normalization, import validation, reset behavior, and careful migration.
- Requires `tapRewardBox()` to consume queue entries safely.

Recommended execution path:

- Implement Option B only if it can be done cleanly and narrowly.
- If not, implement Option A plus explicit UI copy that says "open a reward box" rather than promising the next box is definitely daily.

## Proposed Reward Granting Flow

Completion flow:

1. `actions.finishGame(result)` detects a valid Daily Challenge run:
   - route challenge is `daily`.
   - result game id matches today's definition.
   - auth mode is authenticated.
2. Normal win progression is calculated by `recordGameWin()` first.
3. `dailyChallenge.resolveCurrentAttempt(authState, { gameId, succeeded: true, profile: baseProfile })` runs a Firestore transaction.
4. Transaction reads current per-user progress document.
5. Transaction normalizes current `dailyChallenge` state and profile.
6. If today's state already has `rewardGrantedAt`, return the existing state and do not mutate reward boxes.
7. If reward has not been granted:
   - mark status `completed`.
   - set `completedAt`.
   - set `rewardGrantedAt`.
   - set `rewardBoxesGranted: 1`.
   - for Option A, increment `profile.rewardBoxes` and `profile.rewardBoxesEarned`.
   - for Option B, append one unique daily box entry and keep counts in sync.
8. Commit profile and daily state in the same transaction.
9. App state uses the returned profile and challenge state.
10. Victory UI shows a Daily Reward chip only when `rewardGranted` is true.
11. Home/Game UI shows either completed/claimed or open daily reward based on claim state.

Failure flow:

1. `actions.finishGame(result)` detects Daily Challenge run.
2. `resolveCurrentAttempt(..., succeeded: false)` runs transaction.
3. State returns to `available`, increments attempts, updates `lastAttemptAt`.
4. No reward fields are set.
5. Existing retry behavior remains available if current rules allow it.

## Duplicate-Prevention and Idempotency Strategy

Use multiple layers. UI disabled state is not enough.

Transaction-level rules:

- One per-user progress document remains the atomic boundary.
- Daily grant transaction must check:
  - authenticated uid exists.
  - current date key matches today's definition.
  - challenge id matches today's definition.
  - game id matches today's definition.
  - completion succeeded.
  - `rewardGrantedAt` is empty before grant.
- If `rewardGrantedAt` exists, return `rewardGranted: false` without incrementing boxes.

Typed queue rules if Option B is implemented:

- Generate a deterministic daily box id.
- Before adding, check the queue does not already contain that id.
- Add exactly one queue item.
- Keep `rewardBoxes` consistent with queue length or increment only when the queue insert actually happens.

App-level safeguards:

- `finishGame()` should ignore duplicate completion callbacks for the same active result if a matching `session.gameResult` already exists.
- Victory UI should not grant rewards directly.
- Home/Game "open reward" buttons should only navigate to Reward Room.
- Refresh and auth resync should read Firestore state and not grant again.

Reward opening safeguards:

- If typed daily boxes exist, `tapRewardBox()` should consume one queued box only when opening resolves.
- Mark `dailyChallenge.rewardOpenedAt` only when the consumed box source is today's daily challenge.
- If opening is interrupted before resolution, do not mark opened.
- If the user refreshes during opening, the unresolved queued box should still be available or the current count should remain consistent.

Concurrency cases to explicitly test:

- Two tabs complete the same daily challenge at the same time.
- User refreshes on victory screen.
- `onWin` fires twice from a mini-game.
- User retries after a failed attempt.
- User opens the completed challenge route again.

## Guest and Auth Behavior

Authenticated users:

- Can see today's challenge.
- Can start and retry if not completed.
- Can earn one daily reward per date key.
- Daily state, reward grant, reward box, and opened/claimed state are tied to the authenticated uid.
- Reward opening can award account-owned reward types through existing inventory logic.

Guests:

- See locked signup/login state.
- Cannot start Daily Challenge.
- Cannot receive Daily Challenge rewards.
- Cannot persist Daily Challenge state.
- Direct `#/play?...&challenge=daily` route should show locked/unavailable state.
- Any accidental call to `resolveCurrentAttempt()` while guest must return `matched: false` and mutate nothing.

Auth loading/unavailable:

- Show loading state while auth or Daily Challenge state is loading.
- If Firestore unavailable, show unavailable state; do not grant locally.
- Do not fall back to localStorage for Daily Challenge grants, because once-per-day account rewards need the server-backed transaction.

## Daily Reward Box Behavior

Preferred if typed box queue is implemented:

- Add `boxType: "daily"` with `source: "daily-challenge"`.
- Reward Room keeps the same five-tap opening UX.
- Daily box can have distinct copy and visual accent:
  - "Daily Reward Box"
  - "Today’s box"
  - small sun/calendar badge.
- Daily box may use slightly distinct base weights only if added through `reward-balance.js` and simulation proves it remains conservative.

Recommended balancing for Daily Reward Box:

- Default to the same `getBoxBaseRarityWeights()` and `getBoxUpgradeChance()` as normal boxes for MVP.
- If distinct behavior is added, make it modest:
  - slightly more uncommon/rare than normal.
  - no increased legend odds.
  - keep early-game guard exactly as strict as normal boxes.
  - do not bypass duplicate conversion limits.
- Preserve the staged upgrade animation logic.
- Preserve current final reward balancing rules.

If typed box queue is not implemented:

- Use the current normal reward box count.
- Label the earned state as "Open reward box" rather than guaranteeing "Open daily box".
- Do not add distinct Daily Reward Box behavior.

## UI States

Home Daily Challenge panel:

- Guest locked:
  - signup/login CTA.
  - no reward claim or start action.
- Loading:
  - checking today's challenge.
- Unavailable:
  - Firestore/config unavailable; no local grant.
- Available:
  - game name, reward chip, start action.
- In progress:
  - continue action.
- Failed but retryable:
  - retry action if state returned to available.
- Completed and reward earned but unopened:
  - clear "Open daily reward" CTA.
  - if using Option A, copy should avoid implying exact source if multiple boxes exist.
- Completed and reward opened/claimed:
  - "Done today" or "Come back tomorrow".
  - no start/retry action.

Game screen:

- Direct daily route while guest:
  - locked state with sign-in CTA.
- Completed route after claim:
  - completed/claimed state and back-tomorrow CTA.
- Victory overlay:
  - show Daily Reward chip only if grant happened in this result.
  - show "Open daily reward" when earned.
- Loss overlay:
  - show retry copy if retries remain allowed.

Reward Room:

- Preserve current box opening UX.
- If typed daily box is active, show Daily Reward Box label/accent for the next queued daily box.
- If no boxes are ready, keep existing empty/refill state.

Multilingual labels needed:

- Daily reward earned.
- Open daily reward.
- Daily reward claimed.
- Done today.
- Come back tomorrow.
- Daily Reward Box.
- Today’s reward box.
- Reward already claimed.
- Checking reward.
- Reward unavailable.
- Retry daily challenge.

Add labels in English, Hebrew, and Russian using the existing `dailyChallenge` and `reward` namespaces.

## Edge Cases

- Guest tries direct Daily Challenge route:
  - locked state; no write.
- Authenticated user has no Firestore config/backend:
  - unavailable state; no reward grant.
- User completes after local date changes:
  - transaction should use manager's current definition; avoid granting for stale route if definition no longer matches.
- User starts before midnight and wins after midnight:
  - decide in execution whether the route is stale; safest behavior is no grant unless current definition still matches route/challenge state.
- Two tabs win simultaneously:
  - only one transaction grants.
- Repeated `onWin` callback:
  - only one grant.
- Refresh on victory screen:
  - reward remains granted but not duplicated.
- Refresh during reward opening:
  - if typed queue exists, do not mark opened until resolved.
- Multiple pending normal boxes plus daily box:
  - UI must not falsely claim all boxes are daily.
- User fails:
  - no reward grant; retry allowed according to current rules.
- User reopens completed challenge route:
  - completed/claimed state; no gameplay start.
- Parent Mode disables the daily game or active card pool:
  - do not grant without a valid win; show existing no-playable-pool or unavailable path.
- All rewards/cards exhausted:
  - existing fallback reward behavior applies.
- Duplicate cosmetic reward:
  - existing duplicate conversion applies.
- Account switch:
  - Daily Challenge state and reward queue/count must reload per uid.
- Import/export:
  - if new persisted fields are added, normalize and validate them.

## Verification Steps

Manual setup:

```powershell
python -m http.server 8123 --bind 127.0.0.1 --directory public
```

Verify authenticated flow:

1. Sign in as user A.
2. Start today's Daily Challenge.
3. Fail the challenge.
4. Confirm no reward box is granted and retry remains available.
5. Complete the challenge.
6. Confirm exactly one reward box or one daily box is added.
7. Confirm victory overlay shows the daily reward chip once.
8. Refresh the page.
9. Confirm no second reward is granted.
10. Open the reward.
11. Confirm existing five-tap reward UX is preserved.
12. Confirm the reward applies through normal loot/inventory logic.
13. Return home and confirm completed/claimed state.

Verify guest flow:

1. Sign out.
2. Confirm Daily Challenge panel is locked.
3. Attempt direct daily route.
4. Confirm no challenge starts and no reward persists.

Verify duplicate prevention:

1. Trigger repeated completion callback if possible through dev tools or a test hook.
2. Open the app in two tabs and complete/resolve close together.
3. Confirm Firestore profile grants only one daily reward.
4. Confirm `rewardBoxes`/queue does not increase twice.

Verify account isolation:

1. User A completes and claims.
2. Sign out and sign in as user B.
3. Confirm user B has independent Daily Challenge state and no leaked reward.
4. Complete as user B and confirm user A's state is unchanged.

Verify UI states:

1. Loading.
2. Guest locked.
3. Available.
4. In progress.
5. Retryable after loss.
6. Earned but unopened.
7. Completed/claimed.
8. Backend unavailable.

Verify responsive and multilingual:

1. Test around 390px wide mobile.
2. Test tablet and desktop.
3. Test English, Hebrew, and Russian.
4. Confirm CTAs and reward chips do not overlap or clip.

Optional automated tests/dev checks:

- Add a small dev-only test harness or unit-style script for `normalizeState()` and grant idempotency if those functions are made testable.
- Add a seeded/simulated opening check if Daily Reward Box gets distinct balance.
- Use `render_game_to_text()` to confirm daily state transitions in debug output.

## Documentation Updates After Implementation

- `README.md`
  - Clarify Daily Challenge reward behavior:
    - authenticated only.
    - one reward per user per day.
    - reward uses existing loot box pipeline.
    - guests do not receive daily rewards.
- `PROJECT_STATUS.md`
  - Update Daily Challenge section with earned/unopened/claimed state and Daily Reward Box support if implemented.
- `OPEN_TASKS.md`
  - Remove or narrow the Daily Challenge reward integration task.
  - Keep richer challenge types, streak rewards, and Card Evolution as future work.
- `docs/architecture.md`
  - Document Daily Challenge state, Firestore transaction boundary, and reward-box/queue model if new fields are added.
- `public/scripts/core/content-validator.js` notes or contributor docs
  - Update known profile/import fields if `rewardBoxQueue` or new daily state fields are added.

## Out of Scope

- Card Evolution.
- Full streak rewards.
- Shop changes.
- New reward types.
- Broad reward balancing changes.
- A new marketplace or daily shop.
- Real-money payments.
- Guest Daily Challenge persistence.
- Replacing the existing reward box opening UX.
