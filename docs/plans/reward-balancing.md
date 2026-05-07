# Reward Balancing Plan

## Goal

Plan a reward balancing pass that makes LootWords rewards feel meaningful and maintainable without changing the current reward flow, adding reward types, adding UI, or weakening auth-safe inventory behavior.

The main outcome should be centralized reward tuning plus a verification harness that can simulate many box openings and report approximate rarity, reward type, coin, and duplicate outcomes.

## Relevant Files and Systems to Inspect

- `docs/CODEX_SYSTEM.md`
  - PLAN/EXECUTE workflow and reward/auth safety rules.
- `docs/FEATURES.md`
  - product rules for game-like rewards, account-specific features, and no fake outcomes.
- `public/scripts/data/loot.js`
  - current reward type metadata, rarity weights, box base weights, upgrade chances, reward type weights, coin amounts, duplicate coin amounts, and cosmetic catalogs.
- `public/scripts/core/loot-manager.js`
  - candidate construction, rarity-weight filtering, reward type selection, reward creation, duplicate conversion, coin application, and auto-equip side effects.
- `public/scripts/core/box-opening-manager.js`
  - staged box-opening architecture, base rarity roll, upgrade chance roll, final rarity lock-in, and final `generateLootRewardForRarity()` call.
- `public/scripts/core/rewards.js`
  - game win reward-box grants and legacy/direct `openRewardBox()` path.
- `public/scripts/core/rarity.js`
  - `RARITY_ORDER`, weighted rarity picker, and card rarity foundations.
- `public/scripts/core/parent-mode.js`
  - parent reward settings, duplicate card rewards, fallback stars, reward boxes per win.
- `public/scripts/core/daily-challenge-manager.js`
  - daily challenge reward box grants and idempotency.
- `public/scripts/data/config.js`
  - `BOX_TAP_COUNT`, `FIRST_WIN_BONUS_BOXES`, `WIN_MILESTONE_*`, `DAILY_CHALLENGE_*`, `RARITY_ORDER`.
- `public/scripts/data/shop.js` and `public/scripts/core/shop-manager.js`
  - existing prices and coin spending assumptions; inspect only unless balancing reveals obvious reward-price mismatch.
- `public/scripts/storage.js`
  - profile fields for boxes, coins, inventory, and account-scoped persistence.
- `README.md`, `PROJECT_STATUS.md`, `OPEN_TASKS.md`
  - contributor-facing docs that should be updated after implementation.

## Current Architecture Notes

- The current box-opening path separates staged animation rarity from final reward generation:
  - `beginBoxOpeningSession()` rolls a base rarity from `LOOT_BOX_BASE_RARITY_WEIGHTS`.
  - `advanceBoxOpeningSession()` can upgrade to the next available rarity using `LOOT_BOX_UPGRADE_CHANCES`.
  - Final reward generation calls `generateLootRewardForRarity()` with `opening.currentRarity`.
- The older/direct `openRewardBox()` path still calls `generateLootReward()` using `LOOT_RARITY_WEIGHTS`, so execution should confirm whether that path is still reachable before removing or rebalancing it.
- Guest reward openings are protected by `allowAccountInventoryRewards`; this must remain unchanged.
- Duplicate handling currently differs by reward type:
  - duplicate cards can become bonus stars only if parent duplicate rewards are enabled.
  - duplicate owned cosmetics convert into coins.
  - direct coin rewards add coins by rarity.

## Proposed Balancing Model

Create a central balance module and make existing loot code consume it.

Recommended file:

- `public/scripts/data/reward-balance.js`

Recommended exports:

- `REWARD_RARITY_ORDER`
  - import or re-export `RARITY_ORDER` to keep ordering explicit.
- `REWARD_BALANCE`
  - base final-rarity target weights for box starts.
  - staged upgrade chances.
  - reward type weights by rarity.
  - coin reward amounts by rarity.
  - duplicate conversion amounts by type and rarity.
  - optional early-game guard settings.
- `getRewardBalance()`
  - returns frozen balance config.
- `getCoinRewardAmount(rarity)`
- `getDuplicateConversionAmount(rewardType, rarity)`
- `getRewardTypeWeights(rarity)`
- `getBoxBaseRarityWeights(profileOrContext)`
  - optional context hook for early-game guardrails.
- `getBoxUpgradeChance(fromRarity, context)`

Then update:

- `public/scripts/data/loot.js`
  - keep reward catalogs and type metadata here.
  - move numeric balancing constants to `reward-balance.js` or re-export them temporarily for compatibility.
- `public/scripts/core/loot-manager.js`
  - consume balance helpers for rarity weights, type weights, coin amounts, and duplicate conversion.
- `public/scripts/core/box-opening-manager.js`
  - consume balance helpers for base box weights and upgrade chances.

Do not change:

- inventory keys.
- reward type ids.
- persistence shape.
- auth/guest gating.
- reward reveal UI.

## Proposed Rarity Target Distribution

Use final reward distribution targets, not just base rarity weights. The simulation should enforce that the final distribution lands near these ranges after upgrades:

- common: 78% to 86%
- uncommon: 10% to 16%
- rare: 2.5% to 5.5%
- mythic: 0.45% to 1.25%
- epic: 0.15% to 0.55%
- legend: 0.02% to 0.10%

Rationale:

- Common should dominate normal play.
- Uncommon should happen often enough to feel reachable.
- Rare should be a noticeable event, not a routine outcome.
- Mythic and epic should be hard to get.
- Legend should be extremely rare and should not be expected after only a few games.

Initial proposed base box weights:

- common: 8500
- uncommon: 1200
- rare: 260
- mythic: 32
- epic: 7
- legend: 1

These are starting values only. The simulation should determine final values because upgrade chances shift the final distribution upward.

## Proposed Upgrade-Chance Tuning

Keep staged upgrades exciting but mostly cosmetic/anticipatory rather than a frequent high-rarity escalator.

Current code uses a 0 to 10000 roll scale. Proposed first pass:

- common -> uncommon: 700 to 900, meaning 7% to 9%
- uncommon -> rare: 180 to 260, meaning 1.8% to 2.6%
- rare -> mythic: 35 to 65, meaning 0.35% to 0.65%
- mythic -> epic: 8 to 18, meaning 0.08% to 0.18%
- epic -> legend: 1 to 4, meaning 0.01% to 0.04%
- legend -> none: 0

Rules:

- Upgrade chance should apply only to the next available rarity, as it does now.
- Upgrade loops should remain possible but rare because each successful upgrade resets the five-tap stage.
- The final distribution simulation, not intuition, should approve the exact numbers.
- If the early-game guard is added, upgrades to mythic/epic/legend should be blocked or heavily reduced until the player has opened enough boxes.

## Preventing High Rarity Too Early

Add an optional early-game guard in the balance layer. Keep it simple and transparent:

- Before `rewardBoxesOpened < 5`:
  - no legend.
  - no epic.
  - mythic disabled or capped to extremely low probability.
- Before `rewardBoxesOpened < 12`:
  - legend disabled.
  - epic allowed only through very low base odds or late upgrade.
- Before `rewardBoxesOpened < 25`:
  - legend allowed only at the normal extremely rare rate.

Recommended implementation pattern:

- Do not mutate reward catalogs.
- Filter or scale rarity weights in `getBoxBaseRarityWeights(context)` and `getBoxUpgradeChance(context)`.
- Preserve fallback behavior when no candidates exist.
- Simulate both fresh accounts and mature accounts separately.

This guard should apply to box-opening rarity, not to already-owned inventory display or account persistence.

## Proposed Reward Type Weights

Keep cards dominant while the card pool is not complete, and keep cosmetics meaningful without flooding account inventory.

Suggested first-pass target by final rarity:

- common:
  - card: 94
  - coins: 6
- uncommon:
  - card: 86
  - coins: 10
  - sticker: 4
- rare:
  - card: 76
  - coins: 12
  - sticker: 7
  - profile-avatar: 3
  - cursor-skin: 2
- mythic:
  - card: 58
  - coins: 12
  - sticker: 8
  - profile-avatar: 8
  - cursor-skin: 6
  - profile-background: 4
  - ui-theme-pack: 4
- epic:
  - card: 54
  - coins: 12
  - sticker: 8
  - profile-avatar: 8
  - cursor-skin: 7
  - profile-background: 5
  - ui-theme-pack: 6
- legend:
  - card: 38
  - coins: 8
  - sticker: 8
  - profile-avatar: 14
  - cursor-skin: 14
  - profile-background: 9
  - ui-theme-pack: 9

Rules:

- Candidate filtering should continue to remove unavailable reward types/items.
- When high-rarity cosmetic candidates are exhausted, the type distribution will naturally shift to cards/coins/duplicates/fallback; simulation should report this separately.
- Guest boxes must continue to remove account-inventory rewards through `allowAccountInventoryRewards = false`.

## Proposed Coin Reward Ranges

Coin rewards should feel useful but should not make the auth-only shop economy trivial after a few boxes.

Suggested direct coin rewards:

- common: 15 to 25
- uncommon: 30 to 45
- rare: 65 to 90
- mythic: 110 to 150
- epic: 170 to 230
- legend: 300 to 420

Suggested first-pass fixed values:

- common: 20
- uncommon: 40
- rare: 75
- mythic: 130
- epic: 200
- legend: 360

Shop sanity check:

- Current visible prices include 40, 90, 160, 170, 180, and 260 coins.
- With proposed coin values and rarity rates, a player should not buy multiple premium cosmetics after only a few normal wins.
- Simulation should report expected coins per box for:
  - fresh authenticated account.
  - account with most cards unlocked.
  - account with all cosmetics owned.

## Duplicate Reward Handling

Goals:

- Duplicates should soften bad luck, not become the best way to earn currency.
- Duplicate cosmetics should convert to less than direct coin rewards of the same rarity.
- Duplicate cards should remain controlled by parent settings and should not inflate reward economy by default.

Suggested duplicate conversion values:

- sticker duplicates:
  - common: 8
  - uncommon: 16
  - rare: 32
  - mythic: 55
  - epic: 90
  - legend: 150
- profile/cursor/theme/background duplicates:
  - common: 10
  - uncommon: 20
  - rare: 45
  - mythic: 80
  - epic: 125
  - legend: 220

Rules:

- Keep duplicate conversions centralized in the balance config.
- Keep unique inventory de-duplication unchanged.
- Keep parent-controlled card duplicate rewards separate from cosmetic duplicate coins.
- If all unique cosmetic candidates are exhausted, simulation should show the economy impact clearly.
- Avoid raising fallback stars or duplicate card stars in this pass unless simulation proves a problem.

## Simulation and Verification Approach

Add a dev-only simulation script or test. Preferred location:

- `scripts/simulate-reward-balance.mjs`

Alternative if the repo avoids root scripts:

- `public/scripts/dev/reward-balance-simulation.js`

Simulation requirements:

- Seedable deterministic RNG, for example `mulberry32(seed)` or `sfc32`.
- Simulate at least 100,000 box openings per scenario.
- Use real reward functions where practical:
  - `beginBoxOpeningSession()`
  - repeated `advanceBoxOpeningSession()` until resolved.
  - `generateLootRewardForRarity()`
  - `applyLootReward()`
- Report:
  - base rarity distribution.
  - final rarity distribution.
  - upgrade count distribution.
  - total taps per box.
  - reward type distribution.
  - direct coin rewards.
  - duplicate conversion coins.
  - total expected coins per box.
  - first legend open index percentiles if any legends appear.
  - distribution for guest-safe openings.
- Include scenarios:
  - fresh authenticated account.
  - account after 10 opened boxes.
  - account after 50 opened boxes.
  - near-complete card collection.
  - all cosmetics owned.
  - guest account.
  - parent duplicate card rewards enabled and disabled.

Acceptance gates:

- Final distribution should land within the target ranges above for mature accounts.
- Fresh account should not produce epic/legend at meaningful rates in the first few boxes.
- Guest simulation should not produce account inventory reward types.
- Duplicate conversion should not exceed direct coin reward EV.
- Simulation output should be deterministic for a fixed seed.

Implementation note:

- If importing browser modules from Node is awkward, create pure helper functions for weighted picks and balance math that both runtime and simulation can import.
- Do not use fake success output; simulation should print measured percentages and fail or warn when outside configured ranges.

## Edge Cases

- No active cards available:
  - preserve blocked reward behavior.
- All cards unlocked:
  - ensure fallback or duplicate behavior is still controlled by parent settings.
- Guest openings:
  - account-owned rewards and coins should stay gated out as currently implemented.
- No candidates for a high rarity:
  - available rarity weights must filter that rarity out before rolling.
- Upgrade target unavailable:
  - existing next-available rarity behavior should remain safe.
- Very small catalogs:
  - high-rarity cosmetics can exhaust quickly; duplicate and fallback economics must remain bounded.
- Direct `openRewardBox()`:
  - confirm whether reachable; if kept, it must use the same centralized balance assumptions as cinematic opening.
- Parent settings:
  - `rewardBoxesPerWin`, duplicate card settings, and fallback stars can distort economy; simulation should include default parent settings and at least one duplicate-enabled scenario.
- Daily challenge:
  - grants extra boxes, not direct rewards; include it in economy discussion but do not change idempotency.
- Existing profiles:
  - no migration should be required because balancing constants affect future openings only.
- Shop:
  - do not implement shop changes; only flag if current prices become clearly inconsistent with coin EV.

## Implementation Sequence for EXECUTE Mode

1. Read this plan and inspect all files listed above.
2. Add `public/scripts/data/reward-balance.js` with frozen balance config and helper functions.
3. Update `public/scripts/data/loot.js` to keep catalogs/type metadata and either re-export balance constants temporarily or remove duplicated numeric constants safely.
4. Update `public/scripts/core/loot-manager.js` to consume balance helpers for reward type weights, direct coins, and duplicate conversions.
5. Update `public/scripts/core/box-opening-manager.js` to consume balance helpers for base rarity weights and upgrade chances.
6. Confirm or update the legacy/direct `openRewardBox()` path so it cannot use stale probability constants.
7. Add seedable simulation tooling under `scripts/` or another dev-only location.
8. Run the simulation, tune constants, and repeat until target distributions are met.
9. Run browser smoke checks for reward opening and guest/auth behavior.
10. Update contributor docs if the balancing pass ships.

## Verification Steps

Run static and simulation verification:

```powershell
node scripts/simulate-reward-balance.mjs --seed 12345 --boxes 100000
```

Expected verification output should include measured distributions, not only a pass/fail line.

Then run the app locally:

```powershell
python -m http.server 8123 --bind 127.0.0.1 --directory public
```

Manual checks:

1. Open reward boxes on a fresh guest profile and confirm only guest-safe outcomes occur.
2. Sign in and open boxes; confirm account-owned rewards still persist correctly.
3. Confirm duplicate cosmetics still convert to coins and do not create duplicate inventory ids.
4. Confirm UI reward reveal still matches final reward type and rarity.
5. Confirm Daily Challenge still grants only its intended extra box once per day.
6. Confirm no shop UI or reward UI changes were introduced.

## Documentation Updates After Implementation

- `PROJECT_STATUS.md`
  - Mention centralized reward balancing config and simulation-backed rarity tuning.
  - Note that reward flow and auth-safe inventory behavior were preserved.
- `OPEN_TASKS.md`
  - Update reward-balancing/reward-foundation notes if a new balancing task is completed.
  - Keep future shop economy and broader progression tuning open if not addressed.
- `README.md`
  - Update "What already exists" or "Main folders" to mention the balance config and simulation script if added.
- Consider `docs/architecture.md` if `reward-balance.js` becomes a core architecture file.

## Out of Scope

- New reward types.
- New UI.
- New loot-box interaction mechanics.
- Shop feature changes, rotating inventory, discounts, or purchase UX.
- Persistence migrations.
- Backend or Firestore rule changes.
- Changes to card speech, learning games, or collection browsing.
