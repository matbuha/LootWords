# Better Assets / Art Pipeline Plan

## Goal

Plan a clean, contributor-friendly visual asset pipeline for LootWords rewards and content without adding large final art packs in this task. The pipeline should keep the game image-first, child-friendly, mobile-friendly, account-safe, and production-safe while allowing future art replacement without scattered code changes.

## Relevant Existing Files and Systems to Inspect

- `docs/CODEX_SYSTEM.md`
  - PLAN/EXECUTE workflow, image-first rule, child-friendly UI rule, production safety.
- `docs/FEATURES.md`
  - product goal, card image + sound association, no fake reward/completion states.
- `public/assets/images/cards/`
  - current intended card image folder. It exists but currently has no files.
- `public/assets/images/ui/`
  - current intended UI image folder. It exists but currently has no files.
- `public/scripts/data/cards.js`
  - card word definitions and emoji icons.
- `public/scripts/core/card-utils.js`
  - `createCardDefinition()` currently assigns `image: assets/images/cards/{id}.png` and `imageMode: "placeholder-icon"`.
- `public/scripts/ui/ui-kit.js`
  - `renderCard()`/`renderDetailCard()` currently render visual cards with emoji placeholders and `data-image-mode`.
- `public/scripts/data/loot.js`
  - reward catalogs for stickers, cursor skins, UI theme packs, profile backgrounds, profile avatars, rarity, icons, theme tokens, cursor colors.
- `public/scripts/data/shop.js`
  - shop catalog references reward catalog ids for item previews.
- `public/scripts/core/inventory-manager.js`
  - Reward Center and Customize view models that expose reward items and equipped state.
- `public/scripts/core/shop-manager.js`
  - shop view model that joins shop catalog entries to reward catalog items.
- `public/scripts/core/cursor-skin-manager.js`
  - cursor skins currently generated from SVG data URLs using reward metadata.
- `public/scripts/core/theme-manager.js`
  - UI theme packs currently applied through theme tokens.
- `public/scripts/ui/collection-screen.js`
  - card collection, Reward Center, Customize, shop, theme preview, reward item cards.
- `public/scripts/ui/reward-screen.js` or reward rendering location if separate from `app.js`
  - reward box visual and reveal UI. If no separate file exists, inspect reward markup in `public/scripts/app.js`.
- `public/styles/main.css`, `public/styles/theme.css`, `public/styles/responsive.css`
  - current CSS-generated card, reward box, rarity, theme preview, shop, inventory visuals.
- `public/scripts/core/content-validator.js`
  - current content validation entry point that can be extended or mirrored for asset validation.
- `scripts/simulate-reward-balance.mjs`
  - example of a dev-only script pattern under `scripts/`.
- `README.md`, `PROJECT_STATUS.md`, `OPEN_TASKS.md`
  - contributor-facing docs to update after implementation.

## Current Foundation

The project already has a useful partial foundation:

- Card definitions include stable ids and default image paths.
- The card UI is image-first in layout, but currently uses emoji icons as placeholder art.
- Reward and shop catalogs have stable reward item ids, types, rarity, labels, and icons.
- Cursor skins are generated locally from metadata, avoiding remote assets.
- UI theme previews are generated from theme tokens, avoiding screenshots.
- Existing `public/assets/images/cards/` and `public/assets/images/ui/` folders can be expanded without changing public hosting assumptions.
- Audio already has a manifest-style pattern in `AUDIO_ASSET_MANIFEST`/`AUDIO_ASSET_PATHS`, which can inform visual asset design.

The main gap is that visual asset references are scattered across card definitions, reward catalogs, UI renderers, and CSS-generated placeholders instead of flowing through one visual asset resolver.

## Proposed Folder Structure

Keep core assets under `public/assets/images/` so they work with the current static server and Firebase Hosting-style deployment.

Proposed folders:

```text
public/assets/images/
  cards/
    animals/
    food/
    vehicles/
    home/
    clothes/
    nature/
    toys/
    school/
    kitchen/
    fantasy/
    city/
    bathroom/
    people-jobs/
    sports/
  rewards/
    boxes/
    rarity/
    stickers/
    avatars/
    backgrounds/
    cursors/
    themes/
  shop/
    previews/
  placeholders/
    cards/
    rewards/
    shop/
```

Notes:

- `cards/{category}/` keeps large card art browsable as the library grows.
- `rewards/boxes/` holds reward box states if CSS-only boxes are replaced or enhanced.
- `rewards/rarity/` holds rarity badges, glows, frames, or small icons if CSS alone is insufficient.
- `rewards/stickers/`, `avatars/`, `backgrounds/`, `cursors/`, and `themes/` mirror reward catalog types.
- `shop/previews/` is optional. Prefer reusing the reward asset for shop previews; only use this folder for shop-specific composite previews.
- `placeholders/` contains lightweight local fallback art, not remote URLs.

Do not add final bulk art in this planning task. In EXECUTE mode, add only small placeholders if needed for resolver and validation tests.

## Proposed Asset Naming Convention

Use lowercase kebab-case and stable ids already used by the data model.

Card assets:

```text
public/assets/images/cards/{category}/{card-id}.webp
public/assets/images/cards/{category}/{card-id}@2x.webp
```

Reward assets:

```text
public/assets/images/rewards/stickers/{item-id}.webp
public/assets/images/rewards/avatars/{item-id}.webp
public/assets/images/rewards/backgrounds/{item-id}.webp
public/assets/images/rewards/cursors/{item-id}.png
public/assets/images/rewards/themes/{item-id}-preview.webp
public/assets/images/rewards/boxes/{rarity}-box.webp
public/assets/images/rewards/rarity/{rarity}-badge.svg
```

Shop preview assets:

```text
public/assets/images/shop/previews/{reward-type}-{item-id}.webp
```

Placeholder assets:

```text
public/assets/images/placeholders/cards/{category}.svg
public/assets/images/placeholders/cards/default.svg
public/assets/images/placeholders/rewards/{reward-type}.svg
public/assets/images/placeholders/shop/default.svg
```

Rules:

- Prefer `.webp` for raster art.
- Use `.svg` only for simple local placeholders, badges, masks, or small vector UI assets created by the project.
- Use `.png` for cursor assets when browser cursor behavior needs pixel precision or transparency compatibility.
- Avoid spaces, uppercase letters, dates, version suffixes, and descriptive phrases that diverge from ids.
- Do not include copyrighted character names, brand names, or source-site names in filenames.

## Proposed Manifest and Resolver Approach

Add a centralized visual asset manifest and resolver in EXECUTE mode.

Recommended files:

- `public/scripts/data/visual-assets.js`
  - static manifest of known asset paths, dimensions, alt labels, and fallback keys.
- `public/scripts/core/asset-resolver.js`
  - resolver functions used by UI and data systems.

Manifest shape:

```js
export const VISUAL_ASSET_MANIFEST = Object.freeze({
  cards: {
    dog: {
      src: "assets/images/cards/animals/dog.webp",
      fallback: "card:animals",
      width: 512,
      height: 512,
    },
  },
  rewards: {
    sticker: {
      "happy-rainbow": {
        src: "assets/images/rewards/stickers/happy-rainbow.webp",
        fallback: "reward:sticker",
        width: 256,
        height: 256,
      },
    },
  },
  rarity: {
    common: { src: "assets/images/rewards/rarity/common-badge.svg" },
  },
  boxes: {
    common: { src: "assets/images/rewards/boxes/common-box.webp" },
  },
});
```

Resolver API:

```js
resolveCardAsset(card)
resolveRewardAsset(type, item)
resolveShopPreviewAsset(shopEntry)
resolveRarityAsset(rarity)
resolveRewardBoxAsset(rarity, state)
```

Returned shape:

```js
{
  src,
  srcSet,
  width,
  height,
  alt,
  mode,
  fallbackIcon,
  fallbackClass,
}
```

Resolver behavior:

- Prefer an explicit manifest asset when present.
- Fall back to existing `card.image` path only if the file is known or validation has approved it.
- Fall back to lightweight local placeholder art.
- Fall back to existing emoji icon only if no local asset exists.
- Never use remote image URLs for core assets unless a future explicit project decision accepts that pattern.
- Return stable `alt` text for `<img>` elements, but keep decorative reward effects `aria-hidden`.

Keep the manifest small and hand-editable. If the asset list becomes large later, plan a generated manifest step from folders, but do not require a build pipeline for the current static app.

## Fallback Placeholder Strategy

Fallbacks should be honest placeholders, not fake final art.

Card fallback:

- Use category-specific placeholder SVGs where available.
- Use the existing emoji icon centered in the card if no local image exists.
- Keep the word visible only where existing card behavior already shows it.
- Preserve English `data-speak-word` for unlocked visual cards.

Reward fallback:

- Use reward-type placeholders:
  - sticker: simple sticker shape with icon.
  - profile avatar: simple badge circle with icon.
  - profile background: simple landscape/gradient swatch with icon.
  - cursor skin: local generated cursor preview from existing cursor metadata.
  - UI theme pack: existing token-based theme preview.
  - reward box: current CSS box.
  - rarity: current CSS rarity badge.

Shop fallback:

- Reuse `resolveRewardAsset()` first.
- Use shop placeholder only if the reward asset and reward icon are unavailable.

Graceful failure:

- Broken `<img>` loads should swap to the resolver-provided fallback class/icon.
- Missing manifest entries should not break rendering.
- Dev validation should report missing assets without blocking runtime for placeholders.

## Asset Validation Strategy

Add a dev-only audit script in EXECUTE mode, for example:

```text
scripts/audit-visual-assets.mjs
```

Audit responsibilities:

- Import or parse card definitions and reward/shop catalogs.
- Verify every card has a resolvable visual path or accepted placeholder mode.
- Verify every reward catalog item has a resolvable reward visual or accepted placeholder mode.
- Verify every shop item has a reward visual or shop preview fallback.
- Verify every manifest path exists under `public/`.
- Verify image file extensions are allowed.
- Flag files over agreed size limits.
- Flag orphan files not referenced by manifest or known placeholder folders.
- Flag remote URLs in core visual asset fields.
- Flag duplicate filenames or duplicate manifest keys.
- Flag asset paths outside `public/assets/images/`.

Suggested command:

```powershell
node scripts/audit-visual-assets.mjs
```

If the repo intentionally has no `package.json`, keep the script dependency-free and use Node standard library only.

Optional browser verification:

- In a local server, collect failed image requests via Playwright or Browser Use.
- Check `render_game_to_text()` debug output if extended to include missing visual counts.

## UI Areas Affected

Card collection:

- `renderCard()` and `renderDetailCard()` should use `resolveCardAsset(card)`.
- Unlocked cards remain image-first.
- Clicking unlocked visual cards must keep speaking the English word through the existing speech system.
- Locked cards should keep mystery/locked behavior.

Mini-games:

- Games that render card visuals should use the same card visual component or resolver output where practical.
- Avoid different fallback behavior between Collection, Learn, and games.

Reward opening:

- Reward box visuals can keep CSS-generated boxes initially.
- Add resolver hooks for future box art by rarity/state.
- Rarity effects should remain performant and not depend on large animation sprites.

Reward Center and Customize:

- Reward item cards should use `resolveRewardAsset(type, item)` for image-first previews.
- Equipped/default states should remain driven by existing inventory/customization view models.
- UI theme packs can continue to use token previews, with optional manifest thumbnail support later.
- Cursor skins can continue to use generated cursor previews, with optional image preview support later.

Shop:

- Shop item cards should use `resolveShopPreviewAsset(entry)` so shop and inventory visuals stay consistent.
- Do not create separate shop-only art unless a composite preview is truly needed.

Profile cosmetics:

- Avatar and background previews should use the same reward asset entries.
- Default avatar/background should use built-in local placeholders.

## Performance and Repo-Size Considerations

- Prefer small `.webp` raster assets for cards and reward previews.
- Target card art around 512x512 source size unless a larger size is justified.
- Target reward/shop preview art around 256x256.
- Keep profile background previews small thumbnails; full background art can be planned separately if needed.
- Use `loading="lazy"` for offscreen collection, inventory, and shop images.
- Use explicit `width`/`height` or aspect-ratio wrappers to prevent layout shifts.
- Avoid animated GIFs for core UI; prefer CSS effects or short optimized WebP/AVIF only if future testing supports it.
- Do not commit large packs without an asset size review.
- Consider a soft per-file limit such as:
  - card art: 150 KB target, 250 KB warning.
  - reward preview: 80 KB target, 150 KB warning.
  - placeholder SVG: under 10 KB target.
- Do not add paid/proprietary asset dependencies.
- Do not add copyrighted third-party art.
- Document acceptable sources: original project art, generated art with clear rights, public-domain/CC0 assets after license review, or contributor-created assets.

## Contributor Workflow for Adding Assets

Recommended workflow:

1. Choose or create the data id first.
   - Cards use `card.id`.
   - Rewards use reward catalog `item.id`.
2. Add the image file in the correct folder using kebab-case naming.
3. Add or update the manifest entry in `public/scripts/data/visual-assets.js`.
4. Include dimensions and fallback key in the manifest.
5. Run `node scripts/audit-visual-assets.mjs`.
6. Start a local server and inspect affected UI:
   - Collection cards.
   - Reward Center.
   - Customize.
   - Shop.
   - Reward box screen if reward visuals changed.
7. Confirm mobile layouts do not shift or crop important art.
8. Update asset documentation if adding a new asset category or naming rule.

Contributor documentation should include:

- Folder map.
- Naming rules.
- Allowed formats.
- Size targets.
- Licensing rules.
- How placeholders work.
- How to run the audit script.
- How to replace placeholders safely.

## Edge Cases

- Empty asset folders:
  - app should continue using existing emoji/CSS placeholders.
- Manifest references a missing file:
  - audit reports it; runtime falls back gracefully.
- File exists but manifest omits it:
  - audit reports orphan file.
- Card id changes:
  - audit should report stale image files and missing new references.
- Reward item id changes:
  - audit should report stale reward/shop preview references.
- Remote image URL accidentally added:
  - audit should fail or warn strongly.
- Large image committed:
  - audit should warn with file size.
- Unsupported extension:
  - audit should fail or warn.
- SVG includes unsafe scripting:
  - contributor docs should prohibit scripts/external references in SVG; audit can scan for `<script`, `onload=`, `href="http`.
- Broken image load in browser:
  - `onerror` fallback or component state should prevent broken image icons.
- RTL languages:
  - image placement should not depend on text direction.
- Slow mobile networks:
  - lazy loading and small previews should keep screens usable.
- High-DPI screens:
  - optional `@2x` or `srcSet` support should be handled by resolver.
- Reduced motion:
  - rarity effects and reward box visuals should respect existing reduced-motion behavior if present.
- Account isolation:
  - assets are public and shared; ownership/equipped state remains profile-specific and unchanged.
- Existing card speech:
  - replacing emoji art with images must not remove `data-speak-word` from unlocked cards.

## Verification Steps

Static verification:

```powershell
node scripts/audit-visual-assets.mjs
```

Expected results after initial implementation:

- No missing required manifest paths.
- Placeholder-backed items are clearly reported as placeholders, not failures.
- No remote core asset URLs.
- No unsupported formats.
- No oversize files above warning threshold unless explicitly accepted.

Local browser verification:

```powershell
python -m http.server 8123 --bind 127.0.0.1 --directory public
```

Then verify:

1. Collection cards still render with image-first card layouts.
2. Cards without real art show a child-friendly placeholder, not a broken image icon.
3. Unlocked card click still speaks the English word.
4. Mini-games using cards still show consistent visuals.
5. Reward box screen still renders and opens rewards.
6. Rarity badges/effects remain visible.
7. Reward Center shows stickers, avatars, backgrounds, cursor skins, and theme packs with consistent previews.
8. Customize previews still show equipped/default states.
9. Shop item previews match Reward Center assets.
10. Missing asset simulation falls back gracefully.
11. Mobile width around 390px has no clipped images, overlapping buttons, or layout jumps.
12. Tablet/desktop grids lazy-load without obvious jank.
13. English, Hebrew, and Russian text remains readable around image previews.

Regression checks:

- Reward generation unchanged.
- Shop purchase logic unchanged.
- Inventory ownership/equipped state unchanged.
- Theme manager unchanged except optional preview asset use.
- Cursor skin application unchanged except optional preview asset use.
- No production data migration required.

## Documentation Updates After Implementation

- `README.md`
  - Add a short section describing the visual asset folder structure, manifest, audit command, and licensing rule.
- `PROJECT_STATUS.md`
  - Mark the visual asset pipeline foundation as implemented if resolver/audit/docs are completed.
  - Mention whether real art is still placeholder-backed.
- `OPEN_TASKS.md`
  - Replace broad "better assets" notes with specific follow-ups:
    - add final card art by category.
    - add reward box art.
    - add reward cosmetic thumbnails.
    - improve rarity visual effects if needed.
    - review asset size budgets.
- `docs/assets.md` or `docs/ASSETS.md`
  - Create dedicated contributor documentation for naming, folders, manifest entries, placeholders, validation, size budgets, and licensing.
- Existing plan docs
  - No update needed unless a later EXECUTE task depends on this pipeline.

## Out of Scope

- Adding large final art packs.
- Generating full card art sets.
- Replacing all emoji placeholders with final art.
- Remote image hosting.
- Copyrighted third-party art.
- Paid/proprietary asset dependencies.
- Reward generation changes.
- Shop purchase changes.
- Inventory/auth/profile persistence changes.
- Full animation pipeline for reward boxes or rarity effects.
