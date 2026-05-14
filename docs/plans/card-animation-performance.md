# Card Animation Performance Plan

## Summary

Make idle card grids lightweight while preserving LootWords' card style and all special/gameplay animations. The optimization targets repeated card/list surfaces first: Collection, Learn, Reward Center card category, Shop previews, theme/cosmetic card lists, and shared card renderer output.

Primary decision: remove continuous idle animation from ordinary grid/list cards and move visual motion to interaction-only states: hover/focus on pointer devices, active/press on touch/keyboard, and existing explicit one-time reveal states.

## Key Changes

- Audit and update card animation CSS in `public/styles/main.css`, `public/styles/theme.css`, and `public/styles/animations.css`.
- Remove or disable idle continuous animation from repeated cards:
  - `.loot-card.is-new, .detail-card.is-new` should not run infinite `newCardDrift` in normal grids.
  - `.card-halo__spark` should be static at rest.
  - `.card-art__icon` should be static at rest.
  - `.card-sheen::after` should not run global repeated shimmer on card lists.
  - `.collection-card-button` and `.learn-list button` should not have broad idle `will-change: transform`.
- Keep static card visuals:
  - rarity gradients, halo/glow layers, sheen styling, shadows, badges, and image/emoji art remain visible at rest.
  - new-card badges can remain static or one-time `badgePop`, not infinite drift.
- Add interaction-only card motion:
  - Pointer devices: use `@media (hover: hover) and (pointer: fine)` for card hover selectors.
  - Keyboard: mirror lightweight effects on `:focus-visible`.
  - Touch: use `:active` and existing `.is-pressing` / `.is-rebounding`; no idle or hover-only animation.
  - Use `transform`, `opacity`, and box-shadow transitions; avoid layout-heavy animated properties.
- Preserve special animations:
  - Reward box opening.
  - Reward reveal card launch/spin/shine.
  - Newly revealed reward card animation.
  - Gameplay highlight animations in Tap the Word, Sequence Memory, Image Reveal, Memory Match, and related games.
- Respect the existing `prefers-reduced-motion` rule.

## Implementation Notes

- Treat `renderCard()` and `renderDetailCard()` as shared surfaces.
- Prefer context selectors over renderer logic unless a future issue requires a new class.
- Keep `public/scripts/core/ui-effects.js` press feedback, but avoid pointermove tilt binding on dense card grids.
- Do not change reward, inventory, speech, shop, auth, Daily Challenge, or game logic.
- Documentation updates are optional unless an existing performance/polish task is closed.

## Test Plan

- Collection grid: cards are static at idle; hovering/focusing one card animates only that card.
- Learn list: same behavior as Collection.
- Card detail modal: remains visually polished and still speaks the English word when clicked.
- Reward reveal and reward box opening animations still run.
- Game highlight animations still run during gameplay.
- Shop/Reward Center lists have no idle continuous card animation.
- Mobile at about 390px: no hover dependency; touch press gives brief feedback.
- DevTools performance/animations: Collection idle view should not show continuous card-grid animations.
- Reduced motion: interaction animations and preserved one-time animations collapse under `prefers-reduced-motion: reduce`.

## Assumptions

- The main performance issue is caused by continuous CSS animations on repeated card elements, especially `.loot-card`, `.detail-card`, `.card-halo__spark`, `.card-art__icon`, `.card-sheen`, and `.is-new` grid cards.
- Static visual layers are acceptable as long as motion is interaction-triggered.
- Reward-room and gameplay animations are intentionally higher-cost but bounded, so they should be preserved unless later profiling proves otherwise.
