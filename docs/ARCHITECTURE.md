# Architecture

Last reviewed against the repository on 2026-08-31.

**Current repo state:** Documentation and problem specs only. There is no `src/` implementation yet. Nothing to rewrite. The modules below represent the planned architecture for Stage 1 through Stage 5.

**Goal:** Simple, deterministic, testable, explainable in 30–40 minutes—not maximum abstraction.

## Pipeline

```text
domain data
    ↓
validation          (pure; reject before any iteration)
    ↓
pure K-Means engine (data in → IterationResult out)
    ↓
React state         (history, status, selection, edits)
    ↓
visualization/UI    (SVG map + cards; display rounding only)
```

K-Means and validation must not import React, the DOM, or browser APIs.

---

## 1. Proposed modules

```text
src/
  types/index.ts              domain + validation + run status
  data/demoData.ts            main themed collection
  data/testScenarios.ts       empty-panel + invalid fixtures
  engine/validation.ts        validateCollection
  engine/kmeans.ts            squaredDistance, runIteration, helpers
  engine/index.ts             re-exports for tests/UI
  format.ts                   display rounding (UI only; not used by kmeans)
  App.tsx                     owns React state + wires controls
  main.tsx                    Vite entry
  components/
    ScatterPlot.tsx
    Controls.tsx
    StickerDetails.tsx
    PanelCards.tsx
    IterationDetails.tsx
    ValidationMessage.tsx
  index.css

tests/
  kmeans.test.ts
  validation.test.ts
  interaction.test.ts         Step vs Run, edit, reset (after Stage 3)
```

No `services/`, `repositories/`, `context/`, or `store/` directories.

---

## 2. Responsibility of each module

| Module | Does | Does not |
| --- | --- | --- |
| `types` | `Sticker`, `Center`, `Collection`, `Assignment`, `CenterMovement`, `IterationResult`, `ValidationResult`, run status | React types, DOM |
| `demoData` | One frozen themed collection (8–12 stickers, fixed centres) | Expected iteration answers |
| `testScenarios` | Repeatable empty-panel and invalid collections | Production UI loading every fixture (empty-panel may be loaded later only if needed for Stage 5 demo) |
| `validation` | All collection rules; issues with field/item when possible; preserve source order | Clustering; mutating inputs |
| `kmeans` | One iteration: assign → update → SSE → signature → movement; tie `1e-12`; empty retain | Convergence loop of 20 (caller loops); React; rounding for display |
| `format` | Round numbers to ≤ 3 dp for the screen | Assignment, ties, tests of math |
| `App.tsx` | Original vs live collection, history, selection, status; Load/Step/Run/Reset/edit | Recalculating K-Means rules |
| Components | Render props from App; SVG map; inspector + limited edit fields | Own copy of the algorithm |

`runToEnd` is a short loop in App (or a tiny pure helper that only calls `runIteration`). It is **not** a second clustering implementation.

Inspector distances: call `squaredDistance` from the engine (unrounded), format in the UI. Tie explanation: same `1e-12` + source-order rule, preferably via a small engine helper so UI does not re-code the rule.

---

## 3. Data flow

```text
demoData ──────────────────────────────────────────────► originalCollection (immutable snapshot)

live Collection (stickers may be edited; centres stay originals until iterations run)
        │
        ▼
validateCollection
        │
        ├─ invalid → issues to UI; history/assignments/metrics cleared; stop
        │
        └─ valid → runIteration(stickers, currentCentres, previousSignature?)
                         │
                         ▼
                   IterationResult
                         │
                         ▼
                   append to iterationHistory
```

`docs/DEMO_RESULTS.md` is never on this path.

Current centres for the next Step = last result’s `centers`, else original centres.

---

## 4. State flow

**Stored in `App.tsx` (one component, `useState`):**

- `originalCollection` — Reset target
- `collection` — current stickers + `k` + original centre identities; live centre **coordinates** come from history
- `iterationHistory: IterationResult[]`
- `selectedStickerId: string | null`
- `validationIssues` — empty when valid

**Derived (do not duplicate as writable source of truth):**

- `currentCenters` = last history item’s centres, else `originalCollection.centers`
- `currentAssignments` / metrics / iteration number = last history item, else empty / 0
- `previousSignature` = last item’s `assignmentSignature` when stepping again
- `status`: `empty` | `ready` | `running` | `converged` | `not_converged` | `invalid`

**Events:**

| Event | State |
| --- | --- |
| Load Demo | snapshot demo; clear history; clear issues; ready |
| Step | if valid and not finished: append one `runIteration` |
| Run to End | same `runIteration` until `converged` or iteration 20 |
| Valid edit | patch sticker; restore original centre coordinates; clear history; ready |
| Invalid edit | keep issues visible; clear history/assignments/metrics |
| Reset | clone original demo; clear history and issues; ready |
| Select sticker | set `selectedStickerId` only |

Immutable updates: replace arrays/objects, do not mutate engine outputs.

---

## 5. Why this is sufficient

The product is one screen, one algorithm, one demo, no persistence. A five-layer folder split plus `App` state covers every acceptance criterion:

- Determinism and tests sit in `engine/` without a browser
- Step and Run to End share `runIteration`
- Stale UI is a state-clearing problem in `App`, not a new framework
- Live-mod (filter one panel, counts) is a derived view over existing history

That is enough for a 30–40 minute explanation: types → validate → one iteration → history array → SVG.

---

## 6. Deliberately not building

- Backend, DB, auth, APIs, Python, ML libraries, random/k-means++ init
- File importer / general dataset editor
- Redux, Zustand, React Query, React Context for algorithm state
- Repository/service/controller layers, DI containers, class hierarchies
- Chart libraries, Canvas as default, D3
- Router, workers, IndexedDB
- Importing `DEMO_RESULTS.md` into the app
- A `useStickerWall` hook **until** `App.tsx` is actually hard to read (extract then, not before)

---

## 7. Trade-offs

| Choice | Gain | Cost |
| --- | --- | --- |
| State in `App.tsx` | One place to point at in an interview | Large file later; extract hook only if needed |
| Validation separate from `kmeans.ts` | Invalid data never mixed into clustering | One extra import at the call site |
| History array as source of truth | Trivial Reset; Step vs Run comparison | Slightly more memory (tiny n) |
| Display `format` outside engine | Rounding cannot leak into tests | UI must remember to format |
| SVG not a chart lib | Full control, no extra dependency | Manual axes/legend |

---

## Gap vs current code

**None.** No application modules exist yet. Smallest correction: implement Stage 1 (`PLAN.md`) using this layout; do not introduce extra folders “for later.”

`AGENTS.md` names the stack as data → engine → UI. Validation is still a **pure module next to K-Means**, not a React layer and not a service class. That is D-001, not a spec conflict.
