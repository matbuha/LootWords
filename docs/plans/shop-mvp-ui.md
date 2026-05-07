# Shop MVP UI Plan

## Goal

Plan a basic child-friendly Shop MVP UI that uses the existing LootWords shop foundation. Authenticated users should be able to browse purchasable cosmetic rewards and buy them with coins. Logged-out users should see a locked signup/login state and must not be able to purchase.

This task should not add real-money payments, subscriptions, external payment integrations, daily rotation, discounts, limited-time offers, cards for sale, or a complex marketplace.

## Relevant Existing Systems and Files to Inspect

- `docs/CODEX_SYSTEM.md`
  - PLAN/EXECUTE workflow, child-friendly UI rules, account isolation rules.
- `docs/FEATURES.md`
  - product rules for account-specific features and no fake reward states.
- `public/scripts/data/shop.js`
  - current `SHOP_CATALOG`, item ids, reward types, reward item ids, prices, availability.
- `public/scripts/core/shop-manager.js`
  - existing `buildShopViewModel()` and `purchaseShopItem()` validation/deduction/ownership logic.
- `public/scripts/data/loot.js`
  - reward type metadata, inventory keys, reward catalogs, default-owned items.
- `public/scripts/core/inventory-manager.js`
  - Reward Center inventory/customization view-model patterns and coin/category handling.
- `public/scripts/storage.js`
  - `coins`, `inventory`, selected fields, authenticated profile save, guest session handling, normalization.
- `public/scripts/app.js`
  - `commitState()`, `actions.purchaseShopItem()`, auth/profile sync, route state, `render_game_to_text()`.
- `public/scripts/router.js`
  - hash route parsing with `section` and `mode`.
- `public/scripts/ui/collection-screen.js`
  - existing minimal shop panel, item card markup, Reward Center modes, locked states, purchase button wiring.
- `public/scripts/ui/auth-modal.js`
  - existing signup/signin triggers.
- `public/scripts/data/translations.js`
  - existing `collection.shop*` labels and multilingual patterns.
- `public/styles/main.css`, `public/styles/responsive.css`, `public/styles/i18n.css`, `public/styles/theme.css`
  - existing shop card, Reward Center, mobile, and RTL styling.
- `firestore.rules`
  - owner-only authenticated progress path.
- `README.md`, `PROJECT_STATUS.md`, `OPEN_TASKS.md`
  - contributor docs to update after implementation.

## Current Foundation

The codebase already has:

- `SHOP_CATALOG` entries for:
  - stickers
  - cursor skins
  - profile avatars
  - profile backgrounds
  - UI theme packs
- `buildShopViewModel(profile, authState)` with states:
  - `locked`
  - `owned`
  - `unavailable`
  - `insufficient`
  - `purchasable`
- `purchaseShopItem(profile, authState, shopItemId)` that:
  - blocks guests.
  - blocks missing items.
  - blocks unavailable items.
  - blocks invalid reward types.
  - blocks already-owned unique items.
  - blocks insufficient coins.
  - clamps coin deduction to non-negative.
  - adds ownership to the correct inventory array.
  - auto-equips the first owned cosmetic where foundation exists.
- A minimal Collection-screen shop panel.

The MVP should promote this foundation into a clearer user-facing shop surface, not rebuild purchase logic.

## Proposed UI Structure

Use the existing Collection/Reward Center route family to avoid adding another cramped bottom-nav item.

Preferred route:

- `#/collection?section=shop`

Alternative:

- `#/collection?section=inventory&mode=shop`

Preferred approach:

- Add a top-level in-screen mode switch for:
  - Cards
  - Reward Center
  - Customize
  - Shop
- Keep the current bottom nav unchanged.
- Move or reuse the existing Collection shop panel as the dedicated Shop section.
- If the old shop panel remains in the card-album section, de-emphasize or remove it during execution so there is one clear shop entry point.

Shop screen structure:

1. Header
   - Title: Coin Shop
   - Short child-friendly note about spending saved coins.
   - No real-money wording.

2. Coin balance
   - Large, clear `profile.coins`.
   - Show a small note that coins come from rewards.
   - For guests, do not show guest coin purchasing state as usable account balance.

3. Category chips
   - All
   - Stickers
   - Cursor skins
   - Avatars
   - Backgrounds
   - Theme packs

4. Item grid
   - preview/icon
   - item name
   - category/type
   - rarity
   - price
   - owned state
   - buy button when available

5. Locked guest state
   - Motivational text.
   - Signup and login buttons using existing `data-open-auth` handling.
   - No active buy buttons.

6. Purchase feedback
   - Lightweight inline status after purchase:
     - bought successfully.
     - already owned.
     - not enough coins.
     - login required.
   - Use transient session state; do not add persistence fields.

## Proposed Data and State Flow

View model:

- Continue using `buildShopViewModel(profile, authState)` as the source of truth for item state.
- Optionally extend it to include:
  - `categoryLabelKey`
  - `typeLabel`
  - `rarity`
  - `price`
  - `displayName`
  - `previewIcon`
  - `disabledReason`
- Keep `SHOP_CATALOG` as the source for what is sold.
- Keep `data/loot.js` catalogs as the source for item names, rarity, icons, and inventory keys.

Screen state:

- Add transient session state in `app.js` only if needed:
  - selected shop category.
  - last purchase result/status.
- Prefer route query for category if simple, for example `#/collection?section=shop&category=sticker`.
- Do not persist filters unless the existing app pattern strongly favors persisted UI filters.

Purchase action:

- Keep `actions.purchaseShopItem(shopItemId)` in `app.js`.
- Have it call `purchaseShopItem(currentState.profile, currentState.auth, shopItemId)`.
- If result is ok:
  - write `purchaseResult.profile` through `commitState()`.
  - show success feedback from transient session state if implemented.
- If result is not ok:
  - do not mutate profile.
  - show a localized reason if the UI supports purchase feedback.

Persistence:

- Authenticated profile writes continue through `saveScopedProfile(profile, authState)`.
- Guest profile must not be used for shop purchases.
- Firestore owner-only rules remain unchanged.

## Purchase Validation Flow

Use the existing `purchaseShopItem()` flow as authoritative:

1. Confirm `authState.mode === "authenticated"` and `authState.user.uid` exists.
2. Resolve shop item by `shopItemId`.
3. Confirm item `availability === "available"`.
4. Confirm `rewardType` is ownable and has an inventory key.
5. Resolve reward catalog item.
6. Confirm the current authenticated profile does not already own the unique item.
7. Confirm `profile.coins >= price`.
8. Deduct price with non-negative clamp.
9. Add the reward item id to the correct inventory array using a unique list.
10. Auto-equip only according to existing foundation logic.
11. Return profile and purchase metadata.

The UI must treat button state as advisory only. The manager remains the source of truth.

## Auth and Guest Behavior

Authenticated users:

- See real account coin balance.
- See item states based on real account inventory.
- Can buy purchasable, available, not-owned items when they have enough coins.
- See owned and insufficient states clearly.
- Purchases persist only for the current authenticated user.

Logged-out users:

- See locked shop state.
- Cannot buy.
- Should not see guest-session coins as spendable account balance.
- Signup/login buttons should reuse existing auth modal triggers.

Loading state:

- While auth/profile state is loading, show a loading state instead of zero coins or disabled items that look final.

## Coin Deduction and Ownership Update Approach

- Do not write coin/inventory changes in UI code.
- Use `purchaseShopItem()` to produce a next profile.
- Use `commitState()` to persist the returned profile.
- Confirm `coins` never goes below zero.
- Confirm ownership is added only to:
  - `inventory.stickers`
  - `inventory.cursorSkins`
  - `inventory.profileAvatars`
  - `inventory.profileBackgrounds`
  - `inventory.uiThemePacks`
- Do not add cards to shop inventory in this MVP.
- Do not add real-money fields, transaction ids, payment state, or subscription state.

## Duplicate and Owned Item Handling

- Shop items are unique purchases.
- If the user already owns the item:
  - show `Owned`.
  - disable the buy button.
  - manager must still reject direct/repeated purchase attempts.
- If the user lacks coins:
  - show `Need more coins`.
  - disable the buy button.
  - manager must still reject direct/repeated purchase attempts.
- If an item is unavailable:
  - show `Coming later` only if the catalog includes unavailable items.
  - disable purchase.
- Default-owned items should generally not appear as purchasable shop entries.
- Duplicate reward conversion from loot boxes is separate and should not be changed.

## Mobile and Responsive Considerations

- Target 390px wide first.
- Keep coin balance visible near the top.
- Use large, touch-friendly category chips.
- Use one-column cards on narrow phones and two-column cards where space allows.
- Keep buy buttons full-width inside item cards on mobile.
- Avoid long explanatory text; use clear labels and status chips.
- Ensure price, owned state, and buy button do not wrap into unreadable layouts.
- Add RTL adjustments for category chips and item-card footers if needed.

## Multilingual Labels Needed

Reuse existing `collection.shop*` labels where appropriate. Add a dedicated `shop` namespace if creating a dedicated shop section.

Likely labels:

- Coin Shop
- Spend coins
- Your coins
- All
- Stickers
- Cursor skins
- Avatars
- Backgrounds
- Theme packs
- Owned
- Buy
- Buy now
- Need more coins
- Coming later
- Account only
- Log in to shop
- Sign up to shop
- Shop locked title
- Shop locked body
- Purchased
- Added to inventory
- Already owned
- Not enough coins
- Purchase unavailable
- Price: {coins} coins

Languages:

- English
- Hebrew
- Russian

Keep labels short enough for mobile buttons.

## Edge Cases

- Auth unavailable or Firebase config missing:
  - locked state; no buying.
- Auth/profile still loading:
  - loading state; no buying.
- Guest has session coins:
  - do not show them as spendable shop balance.
- Item exists in `SHOP_CATALOG` but missing from reward catalog:
  - hide or skip it in view model; no broken card.
- Item has invalid reward type:
  - manager rejects; view model skips.
- Item price is invalid or negative:
  - plan execution should normalize or reject catalog entry; never let negative prices add coins.
- User owns item but clicks stale buy button:
  - manager rejects as owned.
- User has exactly enough coins:
  - purchase succeeds and coin balance becomes zero.
- User has insufficient coins:
  - no profile mutation.
- Repeated rapid clicks:
  - result should remain one ownership entry and no negative coins.
- Firestore save fails:
  - existing per-user local fallback behavior applies; do not mix users.
- User switches accounts after purchase:
  - second account sees its own coins/inventory.
- Existing Reward Center inventory and Customize modes:
  - purchased item should appear in inventory and be available to customization if supported.
- Existing reward generation and duplicate conversion:
  - unchanged.

## Implementation Sequence for EXECUTE Mode

1. Read this plan and inspect all files listed above.
2. Decide route shape, preferably `#/collection?section=shop`.
3. In `public/scripts/ui/collection-screen.js`, extract the existing shop panel into a dedicated render path for the shop section.
4. Keep `buildShopViewModel()` as the item-state source.
5. Add category filtering using shop item reward types.
6. Add locked/loading/authenticated shop states.
7. Wire buy buttons to existing `actions.purchaseShopItem(shopItemId)`.
8. Add transient purchase feedback if it can be done without clutter.
9. Add or refine multilingual labels in `public/scripts/data/translations.js`.
10. Add responsive and RTL styling as needed.
11. Update debug output in `render_game_to_text()` with active shop state if useful.
12. Do not change reward generation, loot box logic, real-money payment code, or Firestore rules.

## Verification Steps

Run locally:

```powershell
python -m http.server 8123 --bind 127.0.0.1 --directory public
```

Verify:

1. Guest locked state
   - Open the shop route as logged out.
   - Confirm locked signup/login state appears.
   - Confirm no buy button can purchase anything.

2. Authenticated catalog visibility
   - Sign in.
   - Confirm coin balance matches the authenticated profile.
   - Confirm stickers, cursor skins, avatars, backgrounds, and theme packs appear from the catalog.
   - Confirm cards are not sold.

3. Successful purchase
   - Use an account with enough coins.
   - Buy an available not-owned item.
   - Confirm coins decrease by exact price.
   - Confirm item appears in the correct inventory category.
   - Confirm coin balance never goes negative.

4. Owned item handling
   - Try to buy the same item again.
   - Confirm UI shows owned and manager rejects duplicate purchase.
   - Confirm inventory id is not duplicated.

5. Insufficient coins
   - Use an account with too few coins.
   - Confirm item shows need-more-coins state.
   - Confirm clicking cannot mutate profile.

6. Account isolation
   - Sign out and sign in as another account.
   - Confirm purchase and coin changes do not leak.

7. Reward Center integration
   - Confirm purchased item appears in Reward Center inventory.
   - Confirm purchased cosmetics are available in Customize where that category is supported.

8. Regression checks
   - Open reward boxes and confirm reward flow is unchanged.
   - Confirm guest reward behavior remains auth-safe.
   - Confirm no payment/subscription/external integration exists.

9. Responsive and multilingual
   - Test desktop, tablet, and around 390x844 mobile.
   - Test English, Hebrew, and Russian.
   - Confirm labels, prices, status chips, and buy buttons do not overlap or clip.

## Documentation Updates After Implementation

- `PROJECT_STATUS.md`
  - Promote shop from foundation/minimal panel to Shop MVP if implemented and verified.
  - Mention auth-only purchases, coin deduction, unique ownership, and supported categories.
- `OPEN_TASKS.md`
  - Update "Expand shop into a fuller marketplace" to note that Shop MVP is done.
  - Keep daily rotation, discounts, limited-time offers, richer marketplace UX, and pricing iteration open.
- `README.md`
  - Add Shop MVP to "What already exists".
  - Mention no real-money payments and auth-only coin purchases.
- Consider `docs/architecture.md` if a dedicated shop route/section becomes a core screen pattern.

## Out of Scope

- Selling cards.
- Real-money payments.
- Subscriptions.
- External payment integrations.
- Daily rotation.
- Discounts or limited-time offers.
- Complex marketplace or featured-item systems.
- New reward generation or loot-box logic.
- Firestore rule changes.
- Profile customization beyond showing purchased cosmetics in existing inventory/customize surfaces.
