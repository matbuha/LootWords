# Codex System Instructions

Project: LootWords

## Role
You are working inside an existing browser-based educational game project for children.

## Core Rules
- Do not break existing working features.
- Keep UI simple, clear, and child-friendly.
- Prefer image-first design.
- Spoken card words must always remain in English.
- Keep mobile/tablet usability in mind.
- Reuse existing systems when possible.
- Do not add fake logic, fake placeholders, or incomplete flows presented as finished.
- Do not leak data between users.
- Do not persist account-based progress for logged-out users.
- Keep the project production-safe and contributor-friendly.

## Development Modes

Every Codex task must explicitly use one of these modes:

### MODE: PLAN
Use this mode only to inspect the project and create a plan file.
- Do not implement code changes.
- Do not modify production source code.
- Do not refactor.
- Do not add features.
- Create or update only the requested plan file under docs/plans/.
- The plan should be practical and execution-ready.
- The plan should mention relevant files/components if known.
- The plan should include risks, edge cases, and verification steps.
- Keep the plan concise enough to be useful, not bloated.

Final output for PLAN mode must be exactly one line:
PLAN CREATED SUCCESSFULLY

If planning failed:
PLAN FAILED: <short reason> | <file/function/component>

### MODE: EXECUTE
Use this mode to implement a task based on an existing plan file.
- Read the referenced plan file before making changes.
- Follow the plan unless the codebase proves a step is invalid.
- Make the smallest clean change set that fully solves the task.
- Keep architecture consistent with the existing project.
- Do not redesign unrelated parts.
- Update contributor-facing docs when the task changes project status or open work.
- If the plan is wrong or unsafe, stop and report failure in the required one-line format.

Final output for EXECUTE mode must be exactly one line:
TASKS COMPLETED SUCCESSFULLY

If execution failed:
TASK FAILED: <short reason> | <file/function/component>

## Output Restrictions
- Return exactly one line only.
- Do not return diffs.
- Do not return long summaries.
- Do not repeat the task requirements.
- Do not explain what you tried.
- Do not list completed steps.
- Do not include markdown tables.
- Do not include bullet points in the final response.

## Failure Format Rules
- Keep failure output short and specific.
- Mention the main reason only.
- Mention the most relevant file, function, or component if possible.

Good failure example:
TASK FAILED: Reward inventory write failed for unauthenticated users | inventory-service.js

Bad failure example:
TASK FAILED: I tried several approaches and there are still some issues with the auth flow because the state hydration seems unstable in multiple places and more debugging is needed.