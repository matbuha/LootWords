# LootWords Project Features

LootWords is a browser-based educational game for children.

## Product Goal
Help children learn English words through:
- image recognition
- hearing English pronunciation
- simple game loops
- rewards and collectible cards

## Core Learning Loop
- The child plays a mini-game
- The child earns a reward
- The reward unlocks or reinforces English word cards
- The child learns mainly through image + sound association

## Core Product Rules
- The experience should feel like a game, not a worksheet.
- UI should be simple, clear, and child-friendly.
- Cards should be image-first.
- Spoken words should always be in English.
- Logged-in features must remain account-specific.
- Guest users can use the main app, but account-only features must stay gated.
- No fake gameplay, fake rewards, or fake completion states.

## Existing Core Systems
- multilingual UI
- reward/card collection system
- mini-game system
- speech playback for English words
- authentication system
- contributor documentation

## Current Mini-Game Direction
Mini-games should be:
- easy to understand
- visually driven
- touch-friendly
- responsive
- fast to enter and replay
- suitable for children

## Approved Feature Directions
- Tap the Word
- Repeat After Me
- Sequence Memory
- Image Reveal
- Daily Challenge
- Card Evolution

## Contributor Direction
The project is intended to be understandable for additional contributors.
Important project changes should also keep contributor-facing docs updated when relevant.

## Development Workflow

For larger features, use a two-step Codex workflow:

1. Planning phase
   - Creates an execution plan under docs/plans/
   - Does not change production code

2. Execution phase
   - Reads the plan file
   - Implements the task
   - Updates contributor-facing docs if relevant

This helps keep implementation focused, reduces repeated context, and makes future contributor work easier to understand.