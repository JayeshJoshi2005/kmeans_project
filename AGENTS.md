# Agent instructions — Sticker Wall K-Means Curator

## Purpose

Local browser app that visually explains a **deterministic K-Means** run on a small sticker collection (`warmth`, `sparkle`). Priorities: correctness, simplicity, testability, and interview explainability.

## Source of truth

Read these before changing behaviour, math, validation, or UI contracts:

1. `Student_SPR26_D2_P02-sticker-wall-k-means-curator.md` — problem and acceptance criteria
2. `STICKER_WALL_CURSOR_SPEC.md` — implementation specification
3. `docs/REQUIREMENTS.md` — implementation-oriented extract (must not invent extra requirements)

Then inspect only the relevant files under `docs/` (`PLAN.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TEST_PLAN.md`, `DEMO_RESULTS.md`, `AI_LOG.md`).

If documents disagree, **do not silently pick a side**. Stop and record the conflict. Do **not** change requirements to match code.

## Technology constraints

- React + TypeScript + Vite; CSS or Tailwind; Vitest; SVG for the map
- Local browser only: **no** backend, database, auth, external APIs, cloud, Python, or ML libraries
- All computation in the browser
- **No** random / automatic centre initialization
- **No** general-purpose file importer or dataset editor

## Architecture constraints

Keep **domain data → pure engine → React state/UI**.

- K-Means and validation must not import React, DOM, or browser APIs
- Engine is `data in → result out`; do not mutate React state inside the engine
- Step and Run to End must call the **same** iteration function
- `docs/DEMO_RESULTS.md` is evidence only; **never** import it at runtime

## K-Means rules (do not change)

- Squared Euclidean distance for assignment (no sqrt)
- Unrounded comparisons; tie if `|Δ| ≤ 1e-12`; **earlier centre in source order** wins
- Empty panel: keep previous centre **exactly**; movement `0`; never divide by zero
- SSE uses **current** assignments and **updated** centres; do not reassign in the measure stage
- Convergence = assignment-signature equality vs the **immediately previous** iteration only
- Iteration 1 is **never** converged
- After 20 iterations without a match: `NOT_CONVERGED`; keep the 20th state
- Movement is display-only; **not** used for convergence
- Display rounding (≤ 3 decimal places) must never affect math, ties, updates, or tests

## Coding conventions

- Prefer small, named, testable functions
- Immutable updates for app state; preserve sticker and centre **source order**
- Keep types explicit and independent of React
- Do not add dependencies or features unless the requirements need them

## Testing

Focused tests for the contracts in `docs/TEST_PLAN.md` and `docs/REQUIREMENTS.md`. Independently documented demo iterations must be reproduced by the engine, not read from docs.

## Documentation hygiene

- Update `docs/PLAN.md` if the implementation sequence changes
- Append real entries to `docs/DECISIONS.md` and `docs/AI_LOG.md` when a choice or important AI interaction happens
- Do not invent decisions, test results, or demo numbers
