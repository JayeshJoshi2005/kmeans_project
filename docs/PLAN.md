# Implementation plan

3–5 ordered stages as required by the student problem. Checkpoints are the definition of “this stage is done.” If the sequence changes, record why here and in `DECISIONS.md`.

---

## Stage 1 — Project foundation and data

**Objective:** Runnable TypeScript/Vite/React shell, explicit domain types, demo and test collections, pure validation. No K-Means engine yet.

**Work:**

- Scaffold React + TypeScript + Vite with only necessary dependencies
- Domain types independent of React
- Main demo dataset meeting all pedagogical constraints
- `validateCollection` for every validation rule
- Tests for validation and demo data assumptions
- Independently document expected demo iterations in `DEMO_RESULTS.md` (app must not import it)

**Dependencies:** Source-of-truth specs only.

**Checkpoint:** Types and validation exist; demo collection is valid and documented; validation tests pass.

**Verification:** `tsc --noEmit`; Vitest for validation and data assumptions; manual review of demo constraints vs `REQUIREMENTS.md`.

---

## Stage 2 — Pure K-Means engine

**Objective:** Deterministic iteration matching the exact algorithm rules, isolated from UI.

**Work:**

- `squaredDistance`, assign, update, SSE, signature, movement, `runIteration`
- Empty-centre retention; 1e-12 ties; source-order tie-break; iteration-1 never converged; 20-iteration guard
- Focused algorithm tests (including squared distance `(0,0)` vs `(3,4)` = `25`)
- Confirm engine output matches independently documented demo iterations

**Dependencies:** Stage 1 types, demo data, validation.

**Checkpoint:** Mathematical tests pass; demo expected iterations reproduced by the engine.

**Verification:** Vitest on engine and demo-iteration assertions (expected numbers live in tests or docs, **not** imported by `src/` app runtime).

---

## Stage 3 — Replay and application state

**Objective:** One iteration operation driving Step and Run to End; edit/reset/status without stale state.

**Work:**

- Keep original collection separate from live algorithm state
- Step, Run to End, Reset, valid-edit restart, invalid-edit clear
- Status: ready / in progress / converged / not converged / invalid

**Dependencies:** Stage 2 `runIteration` and `validateCollection`.

**Checkpoint:** N Step clicks and Run to End produce identical histories; edit and reset match the contracts.

**Verification:** State/interaction tests for Step vs Run to End, edit restart, invalid edit clearing, Reset.

---

## Stage 4 — Visualization and workspace UI

**Objective:** One workspace that makes the algorithm visible.

**Work:**

- Header, controls, SVG warmth/sparkle map, assignment lines, initial vs current centres, colour-independent legend
- Iteration summary, panel cards, sticker inspector, limited edit UI, validation messages

**Dependencies:** Stage 3 state; engine unchanged.

**Checkpoint:** UI state matches engine state for the demo walkthrough.

**Verification:** Manual walkthrough of Load Demo → Step → inspect → Run to End → edit → Reset; compare on-screen values to engine/docs (display rounding only).

---

## Stage 5 — Edge cases, evidence, interview readiness

**Objective:** Empty-panel and validation UX, polish, documentation, acceptance checklist.

**Work:**

- Empty-panel scenario in UI (retained reason, movement 0)
- Invalid edit UX; responsive polish
- Complete `DECISIONS.md` / `AI_LOG.md` for real choices
- Test evidence (test output, screenshots or samples)
- Walk the acceptance checklist in `REQUIREMENTS.md`

**Dependencies:** Stages 1–4.

**Checkpoint:** All required acceptance criteria can be demonstrated.

**Verification:** Full test suite; acceptance checklist; confirm no runtime dependency on `DEMO_RESULTS.md`.
