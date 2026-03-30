# LootWords Next Roadmap

## Recommended next phase

The next practical phase is learning-mode expansion on top of the stabilized content and mini-game foundations.

Best candidates:

- image-to-word review rounds using unlocked cards only
- strongest-card / weakest-card comparisons using persisted points
- category sorting games using the existing category metadata
- rarity-identification rounds using the current visual/audio rarity treatment

## Medium-priority product work

- replace placeholder card art with custom illustrations
- replace synth fallback audio with final music and SFX
- add pack-level parent controls on top of existing `packId` metadata
- add achievements or album milestones beyond the current win-based star bonuses

## Technical follow-ups

- add an explicit saved-state migration table if profile changes become more frequent
- add focused browser smoke scripts for parent import/export and reset scenarios
- add a lightweight automated regression pass around play -> reward -> collection persistence

## Guardrails for future work

- keep the reward loop fast; mini-games should remain short and replayable
- keep parent controls centralized instead of scattering content flags across UI modules
- prefer extending registry/config patterns over route-specific special cases
- preserve stable card ids so points, rarity, unlock state, and future analytics remain consistent
