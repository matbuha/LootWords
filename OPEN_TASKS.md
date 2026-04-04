# Open Tasks

This file lists open contribution opportunities at the feature and development-area level.

It is intentionally high-level. These are not tiny engineering tickets.

## How to use this page

- Choose one meaningful task area.
- Check [PROJECT_STATUS.md](PROJECT_STATUS.md) before starting.
- Keep your change focused.
- When finished, update the status of the relevant entry here.

Suggested status labels:

- `Idea only`
- `Not started`
- `Partial`
- `Needs redesign`
- `Buggy`

---

## Tier S

### Tap the Word
- Status: `Partial`
- Why it matters: direct image-to-word recognition is one of the strongest learning loops in the project, especially for children who rely on sound + image more than reading.
- Idea: the MVP now exists as a full selectable mini-game. The next contribution area is polish, tuning, and extension rather than first implementation.
- Suggested area: `scripts/games/`, `scripts/ui/game-screen.js`, `scripts/core/speech-manager.js`
- Notes: keep it low-text, touch-friendly, and sound-led. Good follow-up work includes difficulty tuning, stronger feedback, and smarter distractor selection.

### Repeat After Me
- Status: `Partial`
- Why it matters: hearing and repeating the word builds pronunciation confidence and supports children who learn mainly from sound + image.
- Idea: the MVP now exists as a calm, trust-based speaking game with replayable English speech and manual continue flow. The next work is refinement rather than first implementation.
- Suggested area: `scripts/core/speech-manager.js`, `scripts/ui/learn-screen.js`, possible new mini-game module
- Notes: keep it browser-safe and optional. Good follow-up work includes richer speaking feedback, pacing polish, and future-ready hooks for optional microphone validation without making it mandatory.

---

## Tier A

### Sequence Memory
- Status: `Partial`
- Why it matters: strengthens visual order memory and sound + image recall using the existing card pool.
- Idea: the MVP now exists as a real selectable sequence-recall game. The next contribution area is polish, tuning, and difficulty expansion rather than first implementation.
- Suggested area: `scripts/games/`, `scripts/ui/game-screen.js`
- Notes: keep it clear, rhythmic, and image-first. Good follow-up work includes preview pacing polish, stronger phase transitions, and optional harder sequence modes.

### Image Reveal
- Status: `Partial`
- Why it matters: strong fit for image-first vocabulary learning and a different pacing style from the memory and listening games.
- Idea: the MVP now exists as a real selectable reveal-and-guess game. The next work is polish, reveal-mode variety, and tuning rather than first implementation.
- Suggested area: `scripts/games/`, `styles/`, card render helpers
- Notes: prioritize clear, readable visuals over effects. Good follow-up work includes alternate reveal styles, stronger reward for earlier guesses, and smarter distractor tuning.

---

## Optional Fun / Importable Games

These are optional contribution ideas. They should not replace the core vocabulary loop.

### Tetris clone
- Status: `Idea only`
- Why it matters: highly familiar replayable game that could sit as an optional side activity.
- Suggested area: separate module under `scripts/games/` or isolated optional integration
- Notes: if attempted, keep it isolated from the core game architecture and reward it carefully.

### 2048
- Status: `Idea only`
- Why it matters: simple, fast, and widely understood.
- Suggested area: isolated optional mini-game module
- Notes: should not overtake the vocabulary loop.

### Snake
- Status: `Idea only`
- Why it matters: low-complexity classic that many contributors can implement well.
- Suggested area: isolated optional mini-game module
- Notes: keep controls touch-friendly if added.

### Flappy Bird clone
- Status: `Idea only`
- Why it matters: strong replay value for quick sessions.
- Suggested area: isolated optional mini-game module
- Notes: avoid making it too frustrating for the target audience.

---

## Special Systems

### Daily Challenge
- Status: `Not started`
- Why it matters: gives children and parents a clear reason to return regularly.
- Idea: one small rotating challenge with a reward bonus or featured card goal.
- Suggested area: `scripts/core/progression.js`, `scripts/app.js`, Home screen UI
- Notes: keep it local/browser-based unless the architecture changes later.

### Card Evolution
- Status: `Idea only`
- Why it matters: could deepen attachment to cards and make repeated exposure feel meaningful.
- Idea: cards gain visual upgrades or milestones based on review/play progress.
- Suggested area: card metadata model, collection UI, progression systems
- Notes: should not clutter the main card face.

---

## Gameplay / Learning Improvements

### Improve Memory Match game feel and clarity
- Status: `Partial`
- Why it matters: it is a core visible game and must feel strong.
- Idea: better pacing, stronger feedback, cleaner matching cadence, and more reliable accessibility/touch behavior.
- Suggested area: `scripts/games/memory-game.js`, `styles/main.css`

### Improve Flash Find difficulty tuning
- Status: `Partial`
- Why it matters: the game now works, but preview duration, option count, and feedback pacing can still be tuned.
- Suggested area: `scripts/games/quick-select-game.js`

### Expand learning-linked mini-games
- Status: `Not started`
- Why it matters: the current mini-games are playable, but the project needs more game loops that directly reinforce vocabulary.
- Idea: new games should use the unlocked card pool and image-first recognition.
- Suggested area: `scripts/games/`, `scripts/games/game-registry.js`

---

## Speech and Pronunciation

### Improve speech/voice quality
- Status: `Partial`
- Why it matters: English pronunciation is a core learning mechanic.
- Idea: improve voice selection UX, browser fallbacks, and pronunciation responsiveness.
- Suggested area: `scripts/core/speech-manager.js`, `scripts/ui/voice-selector.js`
- Notes: speech must stay English-only for card words, regardless of UI language.

### Add better pronunciation feedback in learn mode
- Status: `Idea only`
- Why it matters: the Learn screen is a natural place for repeated listening.
- Idea: clearer replay controls, guided listening patterns, or lightweight “listen again” interactions.
- Suggested area: `scripts/ui/learn-screen.js`

---

## Cards, Art, and Visual Systems

### Expand card visuals and image pipeline
- Status: `Partial`
- Why it matters: the project is image-driven, and current visuals still rely partly on placeholder/icon art.
- Idea: define a cleaner art pipeline for replacing placeholders with real illustrations.
- Suggested area: `assets/images/cards/`, `scripts/data/cards.js`, card rendering helpers

### Improve reward animations and reveal polish
- Status: `Partial`
- Why it matters: the reward reveal is central to motivation.
- Idea: refine box opening, reveal timing, rarity-specific effects, and visual payoff.
- Suggested area: Reward UI, animation CSS, feedback/audio coupling

### Improve collection browsing feel
- Status: `Partial`
- Why it matters: browsing the collection should feel rewarding, not administrative.
- Idea: better album feel, milestones, featured sets, recent pulls, or stronger card-detail presentation.
- Suggested area: `scripts/ui/collection-screen.js`, card UI helpers

---

## UX, Mobile, and Accessibility

### Improve mobile UX
- Status: `Partial`
- Why it matters: many children will use tablets or phones.
- Idea: continue reducing layout friction, shorten interaction paths, and improve content-first screens on small devices.
- Suggested area: `styles/responsive.css`, screen-specific UI modules

### Accessibility and touch polish
- Status: `Partial`
- Why it matters: the product should stay easy to use for children across input types.
- Idea: improve focus handling, touch sizing, motion sensitivity, and clearer control states.
- Suggested area: global UI, button systems, game surfaces

---

## Parent Mode and Contributor Infrastructure

### Improve Parent Mode safety and usability
- Status: `Partial`
- Why it matters: parents need predictable control without breaking child mode.
- Idea: better summaries, safer import/export workflows, clearer warnings, or simpler content-management UX.
- Suggested area: `scripts/ui/parent-screen.js`, `scripts/ui/parent-sections/`, validation and reset helpers

### Improve contributor infrastructure
- Status: `Partial`
- Why it matters: the project is now open to outside contributors and needs ongoing documentation discipline.
- Idea: keep docs current, improve architecture notes, and add clearer contribution examples.
- Suggested area: root docs and `docs/`

---

## Updating task status

When you finish meaningful work:

1. Update the relevant entry in this file.
2. Update [PROJECT_STATUS.md](PROJECT_STATUS.md) if the maturity of a system changed.
3. Update [README.md](README.md) if new contributor-facing docs or major systems were added.
