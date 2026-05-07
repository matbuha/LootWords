# Equip / Customize UI Plan

## Goal

Add a simple user-facing customization interface where authenticated LootWords users can equip owned cosmetic rewards:

- profile avatar
- profile background
- cursor skin
- UI theme pack

This should build on the shipped Reward Center / Inventory view instead of creating a full profile page. The task should not add shop UI, reward generation, loot-box logic, or advanced profile customization.

## Key Assumptions

- The current Reward Center at `#/collection?section=inventory` is the best integration point.
- Authenticated profile state is already account-scoped through `loadScopedProfile(authState)` and saved through `commitState()`.
- Existing selected fields are the source of truth:
  - `selectedProfileAvatarId`
  - `selectedProfileBackgroundId`
  - `selectedCursorSkinId`
  - `selectedUiThemePackId`
- `selectedUiThemePackId: "default"` is already the default UI theme.
- `null` is the current default for cursor, avatar, and profile background selections.
- Avatar/background application is currently limited to visible profile preview/state; there is no broad profile surface yet.

## Existing Systems and Files to Inspect

- `docs/CODEX_SYSTEM.md`
  - PLAN/EXECUTE rules, guest persistence rule, production-safety constraints.
- `docs/FEATURES.md`
  - product rules for child-friendly UI, account-specific features, and no fake completion states.
- `docs/plans/reward-center.md`
  - current Reward Center plan and constraints.
- `public/scripts/app.js`
  - `commitState()`, `actions`, `renderShell()`, `SCREEN_RENDERERS`, route context, profile persistence, and current `equipUiThemePack()` action.
- `public/scripts/core/inventory-manager.js`
  - Reward Center view model, current cosmetic categories, equipped flags, default-owned theme handling.
- `public/scripts/ui/collection-screen.js`
  - Reward Center rendering, item cards, category chips, locked guest state, current theme-pack equip UI in the card-album section.
- `public/scripts/data/loot.js`
  - cosmetic catalogs, reward type metadata, inventory keys, default-owned theme pack.
- `public/scripts/storage.js`
  - default selected fields, `normalizeProfile()` ownership validation, account/guest persistence.
- `public/scripts/core/theme-manager.js`
  - `getEquippedThemePack()` and `applyUiTheme()`.
- `public/scripts/core/cursor-skin-manager.js`
  - `getEquippedCursorSkin()` and `applyCursorSkin()`.
- `public/scripts/core/loot-manager.js`
  - current auto-equip behavior when the first cosmetic is awarded. Inspect only; do not change generation.
- `public/scripts/core/shop-manager.js` and `public/scripts/data/shop.js`
  - inspect only to avoid duplicating or invoking shop purchase logic.
- `public/scripts/ui/auth-modal.js`
  - existing account and signup/signin modal triggers.
- `public/scripts/data/translations.js`
  - add all user-facing labels in English, Hebrew, and Russian.
- `public/styles/main.css`, `public/styles/responsive.css`, `public/styles/i18n.css`, `public/styles/theme.css`
  - Reward Center, theme preview, responsive, RTL, and selected-card styling.
- `README.md`, `PROJECT_STATUS.md`, `OPEN_TASKS.md`
  - update after implementation if the feature ships.

## Proposed UI Structure

Integrate customization into the Reward Center:

- Keep `#/collection?section=inventory` as the main surface.
- Add a secondary mode inside Reward Center:
  - Inventory
  - Customize
- Use `#/collection?section=inventory&mode=customize` if route query support is extended, or keep mode as transient screen state if the router should remain unchanged. Prefer route support if it is small and consistent with existing `section`.

Customize view layout:

1. Header
   - Title: Customize
   - Short note: choose what your account wears.
   - Account chip when signed in.

2. Profile preview
   - Shows selected avatar icon/name.
   - Shows selected background as a simple preview panel.
   - Shows selected cursor skin name/icon.
   - Shows selected UI theme pack preview using existing theme preview style helpers.
   - This is a preview only, not a full profile page.

3. Equip category chips
   - Avatar
   - Background
   - Cursor
   - Theme

4. Category item grid
   - Each item is image-first with icon/art preview, name, rarity, and status.
   - Owned items show an Equip button if not currently selected.
   - Equipped item shows a clear Equipped badge and disabled/current button.
   - Default option appears at the start of every category and is always available.
   - Locked/unowned catalog items may be omitted from Customize, or shown as disabled "Locked" if the Reward Center already shows locked/inventory context clearly. Prefer showing only default + owned items to avoid shop-like browsing.

5. Return-to-default
   - The default item is the safe way to reset each category:
     - default avatar
     - default profile background
     - default cursor
     - default UI theme
   - No separate destructive reset confirmation is needed because the user can immediately re-equip an owned item.

Do not add:

- Shop prices or buy buttons.
- Profile bio/name editing.
- Sticker equip behavior.
- Card equip behavior.
- New loot/reward generation controls.

## Proposed Data and State Flow

Use one pure customization view model plus one validated equip action.

Recommended view-model changes:

1. Extend `public/scripts/core/inventory-manager.js`, or create `public/scripts/core/customization-manager.js` if the logic grows.
2. Add `buildCustomizationViewModel({ profile, authState })`.
3. Return:
   - `isLocked`
   - `equippedByType`
   - `categories`
   - `itemsByCategory`
   - `preview`
4. Each category should include a default item:
   - `profile-avatar/default`
   - `profile-background/default`
   - `cursor-skin/default`
   - `ui-theme-pack/default`
5. For `ui-theme-pack/default`, reuse the existing catalog item.
6. For avatar/background/cursor defaults, either:
   - add default-owned catalog entries in `public/scripts/data/loot.js`, or
   - create virtual default entries only in the customization view model.

Preferred approach:

- Add real `defaultOwned: true` catalog entries for cursor, avatar, and background if this can be done without changing reward generation.
- Ensure `loot-manager.js` candidate generation continues to exclude `defaultOwned` items.
- Keep `normalizeProfile()` compatible with `null` defaults unless a data migration is intentionally planned.

Equip action:

- Add a generalized action in `public/scripts/app.js`, for example `equipCosmetic(rewardType, itemId)`.
- Validate before writing:
  - user must be authenticated.
  - reward type must be one of `profile-avatar`, `profile-background`, `cursor-skin`, `ui-theme-pack`.
  - item must be default/free or owned by the current profile.
  - item id must exist in catalog or be the known virtual default.
- Update only the matching selected field:
  - avatar default -> `selectedProfileAvatarId: null`
  - background default -> `selectedProfileBackgroundId: null`
  - cursor default -> `selectedCursorSkinId: null`
  - theme default -> `selectedUiThemePackId: "default"`
- Use `commitState()` so the account profile is persisted through existing storage.

Applying selected state:

- Theme changes should continue to apply through `applyUiTheme(profile)` during render.
- Cursor changes should continue to apply through `applyCursorSkin(profile)` during render.
- Avatar/background changes should update Reward Center/profile preview state immediately.
- If shell/account trigger preview is added, render it from the selected avatar/background safely and keep email readability.

## Auth and Guest Behavior

Authenticated users:

- See only their real account-owned cosmetics plus default options.
- Can equip owned/default cosmetics.
- Changes persist to the authenticated profile and survive reload/sign-out/sign-in.

Logged-out users:

- See a locked motivational state in Customize mode.
- Do not see guest selected cosmetics or guest-owned cosmetics in the customize UI.
- Cannot click equip controls.
- Signup/signin buttons should reuse existing `data-open-auth="signup"` and `data-open-auth="signin"` handling.

Loading state:

- While auth/profile state is loading, show loading copy.
- Do not show empty customization categories until the auth/profile boundary is known.

## Equip, Unequip, and Default Behavior

- "Equip" means selecting the item id into the matching profile field.
- "Unequip" should be represented as equipping the category default.
- Default avatar:
  - always available.
  - stores `selectedProfileAvatarId: null` unless the project intentionally migrates to `"default"`.
- Default profile background:
  - always available.
  - stores `selectedProfileBackgroundId: null` unless the project intentionally migrates to `"default"`.
- Default cursor:
  - always available.
  - stores `selectedCursorSkinId: null`.
  - should remove custom cursor styles through existing `applyCursorSkin()`.
- Default UI theme:
  - always available.
  - stores `selectedUiThemePackId: "default"`.
  - should remove override tokens through existing `applyUiTheme()`.
- Re-equipping the currently equipped item should be a no-op.
- Equip controls must not mutate inventory arrays.

## Mobile and Responsive Considerations

- Target around 390px wide first.
- Keep the preview above the item grid on phones.
- Use wrapping or horizontally scrollable category chips with large touch targets.
- Item cards should be two columns where space allows and one column on very narrow screens.
- Equip buttons must stay inside cards without clipping in English, Hebrew, or Russian.
- Keep the preview compact; do not create a full hero/profile page.
- Cursor category should explain visually that custom cursors only apply on fine-pointer devices if needed, but avoid technical wording for children.
- Add RTL rules for preview layout, category chips, and item-card footer alignment if the default flex behavior is awkward.

## Multilingual Labels Needed

Add labels under a dedicated namespace such as `customize` or `rewardCenter.customize` in `public/scripts/data/translations.js` for English, Hebrew, and Russian:

- Customize
- Inventory
- Customize your rewards
- Choose what your account wears
- Locked customize title
- Locked customize body
- Sign up to customize
- Log in to customize
- Loading customization
- Profile preview
- Avatar
- Profile background
- Cursor
- UI theme
- Default avatar
- Default background
- Default cursor
- Default theme
- Equipped
- Equip
- Use default
- Always available
- Owned
- Locked
- No owned items in this category
- Play to find more cosmetics
- Cursor works on mouse/trackpad devices, if this note is shown

Use existing `reward.types.*`, `collection.*`, and `rewardCenter.*` labels where they are already clear to avoid duplicate wording.

## Edge Cases

- Auth unavailable or Firebase config missing: locked state, no persistence promise.
- Authenticated profile still loading: loading state.
- Guest has session-only cosmetic fields: do not expose or persist them through Customize.
- Item id is not in catalog: skip in view model and reject equip.
- Item exists in catalog but is not owned/default: reject equip.
- Default theme catalog item missing: fall back safely to no theme override and flag in verification.
- Default avatar/background/cursor represented virtually: ensure validation recognizes only those exact defaults.
- Selected id no longer owned after catalog/profile normalization: show default selected and do not display a false equipped badge.
- Current theme-pack picker in Collection card-album section overlaps with new Customize theme controls: either remove/de-emphasize the old picker during execution or leave it as a secondary shortcut only if behavior is identical.
- Cursor skin on touch-only devices: selected state can persist, but `applyCursorSkin()` will not apply the custom cursor due to existing fine-pointer guard.
- Multiple accounts on same browser: selected cosmetics must not leak across accounts.
- Firestore unavailable with per-user local fallback: equip changes should still persist to the per-user local fallback.
- Rapid category switching or repeated equip clicks: no duplicate writes to inventory and no broken UI state.
- RTL languages: equipped badges and buttons remain readable.

## Implementation Sequence for EXECUTE Mode

1. Read this plan and the current `docs/plans/reward-center.md`.
2. In `public/scripts/core/inventory-manager.js` or a new `customization-manager.js`, add a pure customization view model with default + owned items and equipped flags.
3. Decide default representation:
   - Prefer catalog `defaultOwned` entries for avatar/background/cursor if compatible with existing normalization and reward generation.
   - Otherwise use virtual default entries in the customization view model and action validation.
4. In `public/scripts/app.js`, replace or supplement `equipUiThemePack()` with a generic authenticated `equipCosmetic()` action; keep `equipUiThemePack()` as a wrapper if existing UI still calls it.
5. In `public/scripts/ui/collection-screen.js`, add Customize mode inside Reward Center with locked/loading/authenticated states.
6. Add item-card equip controls wired to `actions.equipCosmetic(type, itemId)`.
7. Ensure theme equip uses existing `applyUiTheme()` indirectly through normal render.
8. Ensure cursor equip uses existing `applyCursorSkin()` indirectly through normal render.
9. Add a compact profile preview for selected avatar/background/cursor/theme.
10. Add multilingual labels in `public/scripts/data/translations.js`.
11. Add styling in `public/styles/main.css`.
12. Add mobile rules in `public/styles/responsive.css`.
13. Add RTL adjustments in `public/styles/i18n.css` if needed.
14. Update `render_game_to_text()` debug output if useful for checking equipped fields.
15. Do not change `loot-manager.js`, reward weights, shop catalog, shop manager, Firestore rules, or card collection behavior unless a blocking validation issue is found.

## Verification Steps

Run locally from the repository root:

```powershell
python -m http.server 8123 --bind 127.0.0.1 --directory public
```

Verify:

1. Guest locked state
   - Open `#/collection?section=inventory&mode=customize` or the chosen Customize entry.
   - Confirm signup/login state appears.
   - Confirm no guest cosmetic selections or inventory are shown.

2. Authenticated owned-only equip
   - Sign in with a test account that owns at least one theme, cursor, avatar, and background.
   - Confirm each category shows default + owned items only.
   - Confirm unowned items cannot be equipped.

3. Default behavior
   - Equip a non-default item in each category.
   - Equip the default option.
   - Confirm selected fields become:
     - `selectedProfileAvatarId: null`
     - `selectedProfileBackgroundId: null`
     - `selectedCursorSkinId: null`
     - `selectedUiThemePackId: "default"`

4. Theme application
   - Equip a non-default UI theme.
   - Confirm global theme tokens update through `applyUiTheme()`.
   - Return to default and confirm custom tokens are removed.

5. Cursor application
   - On a fine-pointer device, equip a cursor skin.
   - Confirm custom cursor applies through `applyCursorSkin()`.
   - Return to default and confirm cursor styles are removed.

6. Avatar/background preview
   - Equip avatar/background items.
   - Confirm the customization preview updates immediately.
   - Reload and confirm the selected preview persists for the signed-in account.

7. Account isolation
   - Sign out and sign in as a different account.
   - Confirm the second account does not inherit the first account selections.

8. Existing behavior regression
   - Open Reward Center inventory mode and confirm browsing still works.
   - Open card collection mode and confirm filters, card modal, and English card speech still work.
   - Open reward boxes and confirm reward generation/application is unchanged.
   - Confirm shop UI was not added to Customize.

9. Responsive and language checks
   - Test desktop, tablet, and around 390x844 mobile.
   - Test English, Hebrew, and Russian.
   - Confirm labels, buttons, badges, and preview cards do not overlap or clip.

## Documentation Updates After Implementation

- `PROJECT_STATUS.md`
  - Mark authenticated cosmetic equip/customize UI as shipped.
  - Mention supported categories and default options.
- `OPEN_TASKS.md`
  - Update "Expand cosmetic and inventory application systems" to reflect that equip controls for avatar/background/cursor/theme are done.
  - Keep shop expansion, sticker usage, richer profile pages, and advanced customization open.
- `README.md`
  - Add the Customize UI to "What already exists".
  - Clarify that authenticated users can equip owned cosmetics and guests see a locked state.
- Consider `docs/architecture.md` if execution adds a new `customization-manager.js` or meaningful new route state.

## Out of Scope

- Shop UI, prices, purchases, discounts, or marketplace browsing.
- New reward generation or loot-box logic.
- Sticker placement or sticker equip behavior.
- Full profile page, profile bio/name editing, social profile sharing, or account management.
- New backend APIs or Firestore rule changes.
- Card collection redesign.
- New art pipeline or generated asset work.
