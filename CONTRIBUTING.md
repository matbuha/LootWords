# Contributing to LootWords

Thanks for taking a look at LootWords.

This project is intentionally lightweight: plain HTML, CSS, and JavaScript, no backend, no framework migration, and no heavy process. The goal is to make useful contributions easy without creating contributor confusion.

## Before you start

Read these files first:

- [README.md](README.md)
- [PROJECT_STATUS.md](PROJECT_STATUS.md)
- [OPEN_TASKS.md](OPEN_TASKS.md)
- [docs/architecture.md](docs/architecture.md)

## Local setup

From the repository root:

```powershell
python -m http.server 8123 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:8123/
```

## How to choose work

1. Pick one high-level task from [OPEN_TASKS.md](OPEN_TASKS.md).
2. Check [PROJECT_STATUS.md](PROJECT_STATUS.md) to understand how mature that system already is.
3. Keep the scope focused. One meaningful improvement is better than a broad half-finished refactor.

## Contribution expectations

- Keep the app runnable.
- Prefer targeted improvements over wide rewrites.
- Do not change unrelated systems just because you are nearby.
- Preserve existing behavior unless the change is intentional and verified.
- Verify work in the browser when the task affects gameplay or UI.
- Keep documentation contributor-friendly and public-safe.

## If you touch important shared systems

Be extra careful in:

- `scripts/app.js`
- `scripts/storage.js`
- `scripts/core/rewards.js`
- `scripts/ui/game-screen.js`
- `scripts/data/translations.js`

These files affect multiple screens or persistence behavior.

## Documentation update rule

This is important:

When you complete meaningful work, update the docs that tell the next contributor what changed.

Usually that means:

1. Update [OPEN_TASKS.md](OPEN_TASKS.md)
   - change the task status
   - adjust notes if the task scope changed
2. Update [PROJECT_STATUS.md](PROJECT_STATUS.md)
   - mark a system as more stable, still partial, or needing care
3. Update [README.md](README.md)
   - if the public-facing feature set or contributor doc links changed

If you add a new doc that contributors should use, link it from the README.

## What to avoid

- giant unrelated refactors
- introducing a framework just for convenience
- leaving fake or placeholder “working” states in gameplay
- adding private machine-specific notes or paths to docs
- letting documentation drift after feature work is done

## Good contribution styles

- one focused gameplay improvement
- one new self-contained mini-game
- one targeted mobile/accessibility pass
- one speech/audio improvement
- one parent-mode safety improvement
- one documentation/system-clarity improvement

## Suggested verification

Before wrapping up:

- run the app locally
- check the screens you touched in the browser
- verify the main flow still works if your change affects shared systems
- verify docs still point to the right files

## If you are unsure

Choose the smallest reliable version of the improvement and leave the docs clearer than you found them.
