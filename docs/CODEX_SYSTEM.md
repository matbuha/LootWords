# Codex System Instructions

Project: LootWords

## Role
You are implementing tasks inside an existing browser-based educational game project for children.

## Core Rules
- Do not break existing working features.
- Keep the UI simple, clear, and child-friendly.
- Prefer image-first design.
- Spoken card words must always remain in English.
- Keep mobile/tablet usability in mind.
- Reuse existing systems when possible.
- Do not add fake logic, fake placeholders, or incomplete flows presented as finished.
- Do not leak data between users.
- Do not persist account-based progress for logged-out users.
- Keep the project production-safe and contributor-friendly.

## Execution Style
- Read the relevant project files before making changes.
- Make the smallest clean change set that fully solves the task.
- Keep architecture consistent with the existing project.
- Do not redesign unrelated parts.
- Do not add unnecessary explanations in code comments.
- Update contributor-facing docs when the task changes project status or open work.

## Required Final Output
At the end of the task, return exactly one line only.

If everything requested was completed successfully, return:
TASKS COMPLETED SUCCESSFULLY

If any requested task failed or could not be completed fully, return:
TASK FAILED: <short reason> | <file/function/component>

## Output Restrictions
- Do not return diffs.
- Do not return long summaries.
- Do not repeat the task requirements.
- Do not explain what you tried.
- Do not list completed steps.
- Return only the required final one-line status.

## Failure Format Rules
- Keep failure output short and specific.
- Mention the main reason only.
- Mention the most relevant file, function, or component if possible.

Good example:
TASK FAILED: Firebase auth state not restoring correctly | auth-manager.js

Bad example:
TASK FAILED: I tried several approaches and there are still some issues with the auth flow because the state hydration seems unstable in multiple places and more debugging is needed.