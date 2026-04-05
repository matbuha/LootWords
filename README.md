# LootWords

LootWords is a browser-based vocabulary game for children. The player clears short mini-games, earns reward boxes, opens them in exactly three taps, and collects English noun cards that become the learning material.

The product is designed for children who respond more strongly to game loops, visual rewards, and spoken English than to worksheet-style learning.

## Live build

[Play LootWords](https://matbuha.github.io/LootWords/)

## Core loop

1. Choose a mini-game.
2. Wait for the short countdown.
3. Play a quick round.
4. Win a reward box.
5. Open the box in three taps.
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
- Reward box flow with staged three-tap opening
- Collectible English noun cards with persisted random points and rarity
- English pronunciation playback for visible/open cards
- English, Hebrew, and Russian UI
- Parent Mode for content, category, reward, and progress control
- LocalStorage persistence with backup recovery
- Real Firebase Authentication with guest fallback
- Responsive layout across desktop, tablet, and phone sizes

## Tech stack

- Plain HTML
- Plain CSS
- Plain JavaScript modules
- localStorage for persistence
- Firebase Authentication and Firestore foundation for account features
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
- reCAPTCHA-ready auth submit hooks

If you want to point the app at your own Firebase project:

1. Create a Firebase web app in your own Firebase project.
2. Enable Email/Password sign-in in the Firebase Console.
3. Create a Cloud Firestore database if you plan to build per-user progression or Daily Challenge data next.
4. Replace the values in [public/firebase-config.js](public/firebase-config.js) with your project’s web config.
5. Use [firebase-config.example.js](firebase-config.example.js) as the field reference.
6. Replace the values in [public/recaptcha-config.js](public/recaptcha-config.js):
   - `enabled`
   - `provider`
   - `siteKey`
   Use [recaptcha-config.example.js](recaptcha-config.example.js) as the field reference.
7. Deploy [firestore.rules](firestore.rules) before adding any account-linked Firestore data.

Notes:

- Firebase web config is public client configuration, not an admin secret.
- The reCAPTCHA site key is also public client configuration, not a server secret.
- Do not put service-account credentials or Admin SDK keys into the frontend.
- The app still remains playable in guest mode if auth is unavailable at runtime.
- The current implementation collects reCAPTCHA tokens in the auth flow when enabled. If you later want strong abuse verification, add a server-side or Firebase-hosted verification path after inserting the real site key.

## Main folders

- `public/index.html`: the single browser-served app entry point
- `public/styles/`: theme, responsive rules, i18n, and animation layers
- `public/scripts/app.js`: app bootstrap, actions, shell rendering, and shared wiring
- `public/scripts/core/`: persistence, rewards, progression, i18n, audio, parent mode, and support systems
- `public/scripts/data/`: cards, categories, config, and translations
- `public/scripts/core/auth-manager.js`: centralized Firebase auth bootstrap and session handling
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
