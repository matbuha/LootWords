# Reward Center / Inventory UI Plan

## Goal

Create a clear Reward Center where authenticated users can view their real owned rewards across cards, coins, stickers, cursor skins, UI theme packs, profile backgrounds, and profile avatars.

This task is UI and state presentation only. It must not add shop UI, profile customization, new equip workflows, reward generation changes, or changes to the existing card collection behavior.

## Key Assumptions

- Authenticated inventory is the persisted `profile` loaded through `loadScopedProfile(authState)`.
- Logged-out users should not see even session-only guest inventory in the Reward Center; they should see a locked signup/login state.
- The existing Collection screen remains the main card-album browsing surface, including its current card modal and filters.
- The Reward Center can reuse existing card rendering, reward catalogs, i18n, auth modal actions, and responsive styling patterns.

## Existing Systems and Files to Inspect

- `docs/CODEX_SYSTEM.md`
  - PLAN/EXECUTE workflow, guest persistence rule, English card speech rule.
- `docs/FEATURES.md`
  - product rules, existing reward/card/auth/i18n systems.
- `public/scripts/app.js`
  - route rendering, shared `actions`, auth/profile sync, `renderShell()`, `SCREEN_RENDERERS`, `render_game_to_text()`.
- `public/scripts/router.js`
  - hash route parsing already supports a `section` query parameter.
- `public/scripts/data/config.js`
  - `ROUTES`, `ROUTE_SEQUENCE`, route music mapping, feature constants.
- `public/scripts/storage.js`
  - `createInitialProfile()`, `normalizeProfile()`, authenticated Firestore profile loading, guest `sessionStorage`, inventory normalization, selected/equipped fields.
- `public/scripts/data/loot.js`
  - reward type metadata, inventory keys, reward catalogs, default-owned theme pack support.
- `public/scripts/core/loot-manager.js`
  - reward application to `coins`, `inventory`, and selected/equipped fields. Inspect only to preserve behavior.
- `public/scripts/core/rewards.js`
  - reward-box application path. Inspect only to avoid changing reward generation.
- `public/scripts/ui/collection-screen.js`
  - existing collection UI, card grid/modal, current cosmetic summaries, theme preview helper, and current shop panel.
- `public/scripts/ui/reward-screen.js`
  - reward room CTAs; likely place to add a Reward Center entry point after implementation.
- `public/scripts/ui/ui-kit.js`
  - `renderCard()`, `renderDetailCard()`, `renderEmptyState()`, `escapeHtml()`. `renderCard()` already emits `data-speak-word` for unlocked cards.
- `public/scripts/core/speech-manager.js`
  - English speech system used by the global click handler in `app.js`.
- `public/scripts/core/i18n.js` and `public/scripts/data/translations.js`
  - all visible labels must use existing multilingual UI patterns.
- `public/scripts/core/theme-manager.js`
  - equipped UI theme pack resolution.
- `public/scripts/core/cursor-skin-manager.js`
  - equipped cursor skin resolution and fine-pointer-only application.
- `public/styles/main.css`, `public/styles/responsive.css`, `public/styles/i18n.css`, `public/styles/theme.css`
  - existing collection, stat card, empty state, RTL, and mobile layout patterns.
- `firestore.rules`
  - owner-only `users/{uid}/progress/main` profile access.
- Contributor docs after implementation:
  - `OPEN_TASKS.md`
  - `PROJECT_STATUS.md`
  - `README.md`

## Proposed UI Structure

Use the existing Collection route as the user-facing entry point, with a clear internal section for the Reward Center:

- Keep `#/collection` as the existing card album so current card collection behavior is preserved.
- Add `#/collection?section=inventory` as the Reward Center section.
- Add a simple segmented control near the Collection header:
  - Cards
  - Reward Center
- Add contextual CTAs where useful:
  - Reward screen: "Open Reward Center"
  - Collection card-album screen: "Reward Center"
  - Optional Home stat/action surface if it does not crowd the first screen.

The Reward Center section should render:

1. Header
   - Title: Reward Center
   - Short child-friendly note about saved rewards.
   - Account chip for authenticated users, using existing auth state safely.

2. Coin balance
   - Large, clear coin count from `profile.coins`.
   - No shop CTA and no purchase controls.

3. Category tabs or chips
   - Cards
   - Coins
   - Stickers
   - Cursor skins
   - Theme packs
   - Profile backgrounds
   - Profile avatars

4. Category content
   - Cards: unlocked card grid using `renderCard(card, { compact: true })`.
   - Coins: balance-focused panel; coins are a balance, not item cards.
   - Stickers: owned sticker item grid from `profile.inventory.stickers`.
   - Cursor skins: owned cursor skin item grid from `profile.inventory.cursorSkins`.
   - Theme packs: owned theme pack grid from `profile.inventory.uiThemePacks` plus the default-owned theme marked as included.
   - Profile backgrounds: owned background item grid from `profile.inventory.profileBackgrounds`.
   - Profile avatars: owned avatar item grid from `profile.inventory.profileAvatars`.

5. Owned item cards
   - Image-first: use catalog `icon` now, with class names that can later support real images.
   - Show name/label, reward type, rarity, and owned state.
   - Show "Equipped" badge when the selected/equipped field already points to the item.
   - Do not show equip, customize, buy, or shop actions.

6. Empty states
   - Each empty category should have a friendly empty state and a non-shop action such as "Play for reward boxes" or "Open reward boxes".
   - Empty states must use i18n labels.

## Proposed Data and State Flow

Add a small inventory view-model layer rather than embedding all logic directly in render markup.

Recommended implementation:

1. Create `public/scripts/core/inventory-manager.js`.
2. Export a function such as `buildRewardCenterViewModel({ profile, cards, authState })`.
3. Return a normalized structure:
   - `isLocked`
   - `coins`
   - `categories`
   - `cards`
   - `itemsByCategory`
   - `equippedByType`
   - `counts`
4. For authenticated users:
   - `coins` comes from `profile.coins`.
   - cards come from `cards.filter((card) => card.unlocked)`.
   - owned catalog items are resolved through `getRewardCatalogItem()` and `getRewardCatalog()`.
   - invalid inventory ids should be naturally absent because `normalizeProfile()` already filters them, but the view model should still skip missing catalog entries defensively.
5. For logged-out users:
   - return `isLocked: true`.
   - do not include guest card ids, guest coins, or guest inventory values in the rendered model.
6. Keep profile persistence unchanged:
   - no new persisted fields.
   - no changes to `applyLootReward()`.
   - no changes to `generateLootReward()`.
   - no changes to `saveScopedProfile()` or Firestore rules.

Equipped-state mapping:

- `ui-theme-pack` -> `profile.selectedUiThemePackId`
- `cursor-skin` -> `profile.selectedCursorSkinId`
- `profile-avatar` -> `profile.selectedProfileAvatarId`
- `profile-background` -> `profile.selectedProfileBackgroundId`
- stickers and coins have no equipped state.
- cards have no equipped state in this task.

Default-owned handling:

- Include `ui-theme-pack/default` as an owned/included theme even though it is not stored in `profile.inventory.uiThemePacks`.
- Do not invent default-owned stickers, avatars, backgrounds, or cursor skins unless the catalog already marks them that way later.

## Auth and Guest Behavior

Authenticated users:

- Render their real account inventory only after profile persistence status is ready.
- Use `authState.mode === "authenticated"` and `authState.user.uid` as the lock boundary.
- Show account-safe text such as the signed-in email only if already available in `authState.user`.
- Inventory reflects the currently loaded profile, including Firestore-backed data or per-user local fallback if Firestore is unavailable.

Guests/logged-out users:

- Render a locked Reward Center state.
- Do not render guest `profile.coins`, `profile.inventory`, `profile.unlockedCardIds`, or card counts in Reward Center.
- Provide signup/signin buttons wired through existing `data-open-auth="signup"` and `data-open-auth="signin"` handling.
- Keep guest play, reward-room, learn, and collection behavior unchanged outside the Reward Center.

Auth loading:

- If auth/profile persistence is still loading, show a small loading state instead of a misleading empty inventory.
- Do not show zero coins or empty categories until it is known whether the user is authenticated and the account profile has loaded.

## Card Speech Requirement

- When Reward Center displays unlocked cards as visual cards, reuse `renderCard()` so each unlocked card keeps `data-speak-word` and `lang="en"`.
- Do not add translated speech for card words.
- Do not intercept card clicks in a way that prevents the global `handleCardSpeech()` listener in `app.js` from speaking the English word.
- If the cards open a detail modal, keep the detail card speakable as well.

## Mobile and Responsive Considerations

- The Reward Center must work well around 390px wide and should not rely on hover.
- Use stacked sections on phones:
  - header
  - coin balance
  - horizontally scrollable category chips or wrapping chips
  - one-column/two-column item grid depending on width
- Keep item card heights stable so switching categories does not cause confusing layout jumps.
- Do not add another bottom-nav item unless testing proves it remains readable on small phones. Prefer `#/collection?section=inventory` and in-screen tabs.
- Ensure long translated labels wrap cleanly in Hebrew and Russian.
- Add RTL checks for the segmented control, category chips, and item cards in `public/styles/i18n.css` if needed.

## Edge Cases

- Auth configured but user not signed in: locked state.
- Auth unavailable or Firebase config missing: locked state should still explain account inventory needs sign-in, without implying data was lost.
- Profile persistence loading: loading state, not empty state.
- Firestore read fails and per-user local fallback is used: show the loaded per-user fallback inventory, since storage remains account-scoped.
- Empty account inventory: show empty category states and zero coin balance.
- No unlocked cards: Cards category empty state should send user to Play or Reward Room.
- Unknown inventory ids: skip missing catalog items and avoid rendering broken cards.
- Duplicate inventory ids: view model should de-dupe defensively, matching existing normalization.
- Equipped id no longer owned or no longer in catalog: do not show an equipped badge for missing/invalid items.
- Theme default: show as included/equipped if selected, even when not in inventory.
- Parent Mode disabled cards: use the same `cards` passed to the screen so the Reward Center respects the active child-mode card pool; do not delete or mutate shelved owned cards.
- Guest session may have cards or coins from play: Reward Center remains locked and does not expose those values.
- Shop foundation exists: do not import `shop-manager.js`, `data/shop.js`, or render purchase controls in the Reward Center.

## Implementation Sequence for EXECUTE Mode

1. In `public/scripts/core/inventory-manager.js`, add a pure view-model builder for Reward Center categories, counts, default-owned items, and equipped badges.
2. In `public/scripts/ui/collection-screen.js`, split rendering into card-album and reward-center sections using `route.section` or a normalized section value from `app.js`.
3. In `public/scripts/app.js`, pass the current route/section and persistence status to the Collection renderer, and keep the existing card modal/session behavior for the card-album section.
4. In `public/scripts/ui/collection-screen.js`, add the Reward Center locked, loading, and authenticated states.
5. In `public/scripts/ui/collection-screen.js`, ensure Reward Center card items reuse `renderCard()` and do not block the global speech click handler.
6. In `public/scripts/data/translations.js`, add Reward Center labels, category names, empty states, lock-state copy, loading copy, owned/equipped/included badges, and route/CTA labels for English, Hebrew, and Russian.
7. In `public/styles/main.css`, add Reward Center layout classes using existing collection/stat-card visual language.
8. In `public/styles/responsive.css`, add mobile rules for the Reward Center header, category chips, coin balance, and item grids.
9. In `public/styles/i18n.css`, add RTL rules only where the new segmented control or item grids need direction-specific adjustment.
10. In `public/scripts/ui/reward-screen.js` and/or card-album header, add non-shop navigation to `#/collection?section=inventory`.
11. Update `window.render_game_to_text()` in `public/scripts/app.js` to include the active collection section and Reward Center debug state if helpful for verification.
12. Do not change `public/scripts/core/loot-manager.js`, `public/scripts/core/rewards.js`, `public/scripts/data/loot.js`, `public/scripts/data/shop.js`, `public/scripts/core/shop-manager.js`, `storage.js`, or `firestore.rules` unless inspection during execution reveals a blocking bug.

## Verification Steps

Run locally from the repository root:

```powershell
python -m http.server 8123 --bind 127.0.0.1 --directory public
```

Then verify:

1. Guest locked state
   - Open `http://127.0.0.1:8123/#/collection?section=inventory`.
   - Confirm the Reward Center shows a locked signup/login state.
   - Confirm no guest coins, guest cards, or guest inventory counts are visible.

2. Existing card collection preserved
   - Open `#/collection`.
   - Confirm filters, card grid, card detail modal, and current card collection behavior still work.

3. Authenticated inventory
   - Sign in with a test account that has rewards.
   - Open `#/collection?section=inventory`.
   - Confirm coin balance matches `profile.coins`.
   - Confirm owned cards and each inventory category show the correct owned items.
   - Confirm categories with no owned items show empty states.

4. Account isolation
   - Sign out and sign into a second account.
   - Confirm the second account does not see the first account inventory.
   - Sign out again and confirm the Reward Center returns to locked state.

5. Equipped badges
   - Use an account with selected/equipped theme, cursor, avatar, or background fields.
   - Confirm "Equipped" appears only on matching owned/default-owned items.
   - Confirm there are no equip buttons or customization controls.

6. Card speech
   - In authenticated Reward Center Cards category, click an unlocked visual card.
   - Confirm the existing speech system speaks the English word.
   - Repeat while UI language is Hebrew or Russian; speech should still be English.

7. No shop UI
   - Confirm Reward Center does not show prices, buy buttons, shop locked copy, or purchase actions.
   - Confirm no Reward Center click path calls `purchaseShopItem()`.

8. Responsive and multilingual checks
   - Test desktop width, tablet width, and around 390x844 mobile.
   - Test English, Hebrew, and Russian labels.
   - Confirm no overlapping text, clipped buttons, or unusable horizontal overflow.

9. Regression smoke test
   - Play a mini-game, earn a reward box, open it, and confirm reward generation and application still behave as before.
   - Confirm reward room, learn screen, parent mode entry, auth modal, language selector, and voice selector still render.

## Documentation Updates After Implementation

- `PROJECT_STATUS.md`
  - Add Reward Center as a shipped user-facing inventory surface once implemented and verified.
  - Mention locked guest behavior and that it reuses account-scoped inventory.
- `OPEN_TASKS.md`
  - Update "Expand cosmetic and inventory application systems" to mark browsing/visibility as partially addressed.
  - Keep full equip/customization and marketplace work open.
- `README.md`
  - Add Reward Center to "What already exists" after implementation.
  - Clarify that authenticated users can view account inventory and guests see a locked account-inventory state.
- Consider `docs/content-model.md` and `docs/architecture.md` if execution reveals they are stale around inventory, persistence, or reward flow, but only update them if the implemented work changes contributor-facing behavior.

## Out of Scope

- Shop UI, prices, purchases, or marketplace browsing.
- Full profile customization.
- New equip controls for cursor skins, avatars, backgrounds, stickers, or cards.
- New reward types.
- New reward generation logic or rarity tuning.
- Migration of existing account data.
- Backend/API changes.
