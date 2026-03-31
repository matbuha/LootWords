# LootWords Visual Language

## Direction

LootWords should feel like a collectible treasure-toy game, not a worksheet. The UI direction blends:

- glossy treasure-room energy
- collectible card game framing
- clean casual-game readability
- gentle magical glow instead of noisy particle chaos

The current visual system leans on deep navy surfaces, cyan/mint highlight light, and warm amber reward moments. Those three color families are the baseline for future art.

## Surface Rules

- Main screens use layered glassy navy panels with soft internal highlights.
- Important reward and progression surfaces get warmer accent light.
- Buttons should read as physical controls with depth, gloss, and a clear press state.
- Cards should feel premium: rounded, framed, lit from above, and slightly reflective.

## Motion Rules

- Ambient motion stays subtle: idle float, shimmer, glow pulse, light breathing.
- Interaction motion is short and tactile: compress, rebound, slight lift, shadow shift.
- Reward motion is staged: pressure build, impact, burst, launch, settle.
- Higher rarity can be more energetic, but readability always wins over spectacle.

## Reward Box Behavior

- Idle: float slightly, breathe, pulse aura softly.
- Tap 1: mild squash, short left-right hit, light impact flash.
- Tap 2: stronger shake, more pressure-ring energy, more visible stress.
- Tap 3: strongest hit, opening burst, reveal flash, card launch.

The box should always feel like a physical magical object reacting to force.

## Card Reveal Behavior

- Card launches upward and outward from the box.
- Card rotates in 3D before settling into a hero pose.
- Shadow grows underneath during launch so the motion reads as depth.
- Shine and aura appear after the card settles so the reward stays readable.

Rarity scaling:

- Common: cleaner, shorter spin and calmer settle
- Rare / Super Rare: stronger spin and glow
- Epic: stronger aura and more dramatic settle
- Legendary: brightest aura, longest spin, strongest premium feel

## Future Asset Guidance

Future custom assets should match these assumptions:

- reward box art: chunky, toy-like, readable silhouette, warm highlight edges
- card art: centered hero object on a simple readable stage, not busy backgrounds
- category icons: bold silhouettes with friendly shape language
- rarity effects: readable glow and frame changes first, particles second
- backgrounds: scene-like gradients and soft atmosphere, not detailed illustration walls

## Implementation Notes

- `styles/theme.css` owns additive theme tokens and premium surface overrides.
- `styles/animations.css` owns ambient motion, tactile responses, and reward/reveal sequences.
- `scripts/core/ui-effects.js` owns shared press, rebound, and pointer-tilt behavior.

Keep future changes in those layers when possible instead of scattering one-off animation rules across screen files.
