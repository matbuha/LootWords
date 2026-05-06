# LootWords

LootWords is a browser-based vocabulary game for children. The player clears short mini-games, earns reward boxes, opens them through a focused staged cinematic sequence, and collects English noun cards that become the learning material.

The product is designed for children who respond more strongly to game loops, visual rewards, and spoken English than to worksheet-style learning.

## Live build

[Play LootWords](https://dg-expert.github.io/LootWords/)

## Core loop

1. Choose a mini-game.
2. Wait for the short countdown.
3. Play a quick round.
4. Win a reward box.
5. Open the box through staged five-tap rarity cycles until the reward locks in.
6. Reveal a collectible English word card.
7. Review the card in the collection or learn screens, with English pronunciation support.

## Current state

LootWords is an evolving MVP. The core loop is working and playable, but the project is still actively growing. Some systems are stable enough for contributors to extend, while others still need polish or redesign.

Use these docs before starting work:

- [PROJECT_STATUS.md](PROJECT_STATUS.md)
- [OPEN_TASKS.md](OPEN_TASKS.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [ROADMAP.md](ROADMAP.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/content-model.md](docs/content-model.md)
- [docs/visual-language.md](docs/visual-language.md)

## What already exists

- Browser-based SPA in plain HTML, CSS, and JavaScript
- Eight internal mini-games:
  - Memory Match
  - Treasure Match
  - Flash Find
  - Loot Pop
  - Tap the Word
  - Repeat After Me
  - Sequence Memory
  - Image Reveal
- Reward box flow with staged five-tap cinematic opening and progressive rarity upgrades before the final reward resolves
- Centralized loot pipeline with rarity -> reward type -> reward item generation
- Multi-type reward foundation for cards, coins, stickers, cursor skins, UI theme packs, profile backgrounds, and profile avatars
- Real non-card rewards for:
  - coins
  - stickers
  - cursor skins
  - profile avatars
  - profile backgrounds
- Duplicate sticker rewards safely convert into coins instead of creating duplicate ownership entries
- Duplicate cursor-skin rewards safely convert into coins instead of creating duplicate ownership entries
- Duplicate profile avatar and background rewards safely convert into coins instead of creating duplicate ownership entries
- Minimal equipped-state foundation for:
  - selected cursor skin
  - selected profile avatar
  - selected profile background
- Collectible English noun cards with persisted random points and the current six-tier rarity model:
  - common
  - uncommon
  - rare
  - mythic
  - epic
  - legend
- English pronunciation playback for visible/open cards
- English, Hebrew, and Russian UI
- Parent Mode for content, category, reward, and progress control
- Authenticated Daily Challenge with per-user daily state and one daily bonus reward
- Isolated persistence boundaries:
  - guest progress is session-only
  - authenticated progress is keyed per Firebase user
  - legacy shared local progress is archived and ignored
- Real Firebase Authentication with guest fallback
- Responsive layout across desktop, tablet, and phone sizes

## Tech stack

- Plain HTML
- Plain CSS
- Plain JavaScript modules
- sessionStorage for guest progress
- Firebase Authentication plus Firestore-backed per-user progress and Daily Challenge state
- per-user localStorage fallback only if Firestore is temporarily unavailable
- Browser-native speech synthesis for English card pronunciation
- Hash-based routing

## Run locally

From the repository root:

```powershell
python -m http.server 8123 --bind 127.0.0.1 --directory public
```

Then open:

```text
http://127.0.0.1:8123/
```

## Firebase auth setup

LootWords now runs with a real Firebase web config at [public/firebase-config.js](public/firebase-config.js). The current runtime supports:

- email/password sign up
- email/password sign in
- sign out
- refresh persistence
- guest vs logged-in UI
- Firestore-backed per-user progress at `users/{uid}/progress/main`
- authenticated Daily Challenge with one rewardable completion per calendar day
- reCAPTCHA-ready auth submit hooks

If you want to point the app at your own Firebase project:

1. Create a Firebase web app in your own Firebase project.
2. Enable Email/Password sign-in in the Firebase Console.
3. Create a Cloud Firestore database in the Firebase Console.
4. Deploy [firestore.rules](firestore.rules) so the `users/{uid}/progress/main` path is owner-only.
5. Replace the values in [public/firebase-config.js](public/firebase-config.js) with your project’s web config.
6. Use [firebase-config.example.js](firebase-config.example.js) as the field reference.
7. Replace the values in [public/recaptcha-config.js](public/recaptcha-config.js):
   - `enabled`
   - `provider`
   - `siteKey`
   Use [recaptcha-config.example.js](recaptcha-config.example.js) as the field reference.
8. If you enable reCAPTCHA enforcement, add the matching allowed domains in Google Cloud / Firebase Console.

Notes:

- Firebase web config is public client configuration, not an admin secret.
- The reCAPTCHA site key is also public client configuration, not a server secret.
- Do not put service-account credentials or Admin SDK keys into the frontend.
- The app still remains playable in guest mode if auth is unavailable at runtime.
- Guest progress is intentionally temporary and session-only.
- Authenticated progress and Daily Challenge state are isolated per user under `users/{uid}/progress/main`. If Firestore is temporarily unavailable, the app falls back to per-user local browser storage instead of mixing users together.
- The current implementation collects reCAPTCHA tokens in the auth flow when enabled. If you later want strong abuse verification, add a server-side or Firebase-hosted verification path after inserting the real site key.

## Main folders

- `public/index.html`: the single browser-served app entry point
- `public/styles/`: theme, responsive rules, i18n, and animation layers
- `public/scripts/app.js`: app bootstrap, actions, shell rendering, and shared wiring
- `public/scripts/core/`: rewards, progression, rarity, loot generation, i18n, audio, parent mode, auth, and support systems
- `public/scripts/storage.js`: guest session persistence, per-user progress loading/saving, and legacy shared-storage cleanup
- `public/scripts/data/`: cards, categories, config, and translations
- `public/scripts/core/loot-manager.js`: centralized loot generation and reward application
- `public/scripts/data/loot.js`: reward-type catalogs, rarity weights, and inventory foundations
- `public/scripts/core/auth-manager.js`: centralized Firebase auth bootstrap and session handling
- `public/scripts/core/daily-challenge-manager.js`: deterministic daily challenge generation, per-user daily state, and daily reward idempotency
- `public/firebase-config.js`: browser-served Firebase web config used by the running app
- `public/recaptcha-config.js`: browser-served reCAPTCHA runtime config used by the auth flow
- `public/scripts/games/`: mini-game implementations and registry
- `public/scripts/ui/`: screen rendering and shared UI components
- `public/assets/`: browser-served runtime media paths
- `docs/`: supporting architecture and design docs

## How contributors can help

The most useful contribution areas right now are:

- new learning-focused mini-games
- speech and pronunciation quality improvements
- card art and image pipeline improvements
- reward/game feel polish
- richer profile customization UX, cosmetic browsing, and equip controls on top of the shipped loot foundation
- mobile UX and accessibility improvements
- parent-mode quality and safety improvements

Start with [OPEN_TASKS.md](OPEN_TASKS.md) for the high-level idea pool.

## Contribution workflow

Use [CONTRIBUTING.md](CONTRIBUTING.md) before starting work.

Important rule:

- when you complete meaningful work, update the relevant status docs so the next contributor does not repeat the same work blindly

Usually that means updating:

- [OPEN_TASKS.md](OPEN_TASKS.md)
- [PROJECT_STATUS.md](PROJECT_STATUS.md)
- README links if you add new contributor-facing docs

## Notes

- Card visuals are still partly placeholder-based. The system is ready for custom art.
- Audio file support exists, but the app must also work safely when assets are missing.
- English pronunciation is intentionally separate from UI language. The interface can be Hebrew or Russian while card speech stays in English.
- Parent Mode is local/browser-only. It is a practical content-management layer, not a secure backend admin system.
