# LootWords Audio Assets

Drop final music and sound files into these folders when they are ready:

## Music

- `music/menu-loop.mp3`
- `music/gameplay-loop.mp3`
- `music/reward-loop.mp3`

## SFX

- `sfx/button-click.mp3`
- `sfx/button-hover.mp3`
- `sfx/menu-open.mp3`
- `sfx/screen-transition.mp3`
- `sfx/victory.mp3`
- `sfx/failure.mp3`
- `sfx/reward-tap-1.mp3`
- `sfx/reward-tap-2.mp3`
- `sfx/reward-tap-3.mp3`
- `sfx/reward-open.mp3`
- `sfx/card-reveal.mp3`
- `sfx/epic-reveal.mp3`
- `sfx/legendary-reveal.mp3`
- `sfx/card-select.mp3`
- `sfx/filter-change.mp3`
- `sfx/progress-milestone.mp3`
- `sfx/new-card-unlocked.mp3`

Current MVP behavior:

- The game does not require these files to run.
- `scripts/data/config.js` keeps the expected asset manifest.
- `scripts/core/audio-manager.js` uses lightweight synthesized fallback cues until real files are registered.
