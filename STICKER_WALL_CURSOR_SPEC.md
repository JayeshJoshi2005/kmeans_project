# Sticker Wall K-Means Curator — Cursor Implementation Specification

## 0. Purpose

Build the **Sticker Wall K-Means Curator**, a local browser application that visually explains a deterministic K-Means clustering process on a small collection of stickers.

This document is the implementation source of truth. **Do not add features that conflict with these requirements. Do not change the K-Means rules.**

Priorities: correctness, simplicity, maintainability, deterministic behavior, testability, clear visualization, and interview explainability.

---

## 1. Technology and Scope

Recommended stack:

- React
- TypeScript
- Vite
- CSS or Tailwind CSS
- Vitest for focused unit tests
- SVG for the 2D warmth/sparkle visualization

Keep the K-Means calculation engine completely independent from React/UI code.

Suggested structure:

```text
src/
├── data/
│   ├── demoData.ts
│   └── testScenarios.ts
├── types/
│   └── index.ts
├── engine/
│   ├── validation.ts
│   ├── kmeans.ts
│   └── index.ts
├── components/
│   ├── ScatterPlot.tsx
│   ├── Controls.tsx
│   ├── StickerDetails.tsx
│   ├── PanelCards.tsx
│   ├── IterationDetails.tsx
│   └── ValidationMessage.tsx
├── App.tsx
└── main.tsx

tests/
├── kmeans.test.ts
├── validation.test.ts
└── interaction.test.ts

docs/
├── implementation-plan.md
├── demo-expected-results.md
└── ai-prompts.md
```

Exact filenames may differ if there is a good reason, but preserve the separation:

**domain data → pure calculation engine → React state/UI**

Do NOT add:

- backend
- database
- authentication
- external APIs
- external AI services
- image recognition
- cloud services
- automatic/random centre initialization
- general-purpose file importer/editor
- Python ML service
- ML library that hides the K-Means calculation

All computation must happen locally in the browser.

---

## 2. User Experience

The application represents stickers using:

- `warmth`: 0–10
- `sparkle`: 0–10

The user should be able to:

1. Load the themed demo collection with one click.
2. See stickers on a labelled warmth/sparkle map.
3. See original starting centres and current centres.
4. Click **Step** to perform exactly one K-Means iteration.
5. Click **Run to End** to execute the same iteration operation repeatedly until convergence or the 20-iteration guard.
6. Select a sticker and inspect its squared distance to every current centre.
7. See the selected sticker's chosen centre and tie explanation when applicable.
8. Edit at least one sticker's warmth and sparkle values.
9. After a valid edit, restart from the collection's original centres with cleared iteration history.
10. Click **Reset** to restore the exact documented demonstration.
11. See validation errors clearly.
12. Understand the current iteration, assignments, centre movement, squared error, and convergence state.

---

## 3. Main Demo Dataset

Create the main collection yourself.

It MUST:

- contain 8–12 stickers
- use `k = 2` or `k = 3`
- have exactly `k` fixed starting centres
- have an appealing coherent theme
- contain at least one sticker exactly tied between two centres during iteration 1
- have at least one sticker change panel during a later iteration
- have every panel non-empty when converged
- converge in 2–8 iterations, counting the repeated assignment iteration that proves convergence

Do NOT use the small illustration from the problem statement as the main demonstration.

The expected iteration results must be independently documented and must NOT be used as application input.

---

## 4. Data Model

Use explicit TypeScript types. Suggested model:

```ts
type Sticker = {
  id: string;
  warmth: number;
  sparkle: number;
};

type Center = {
  id: string;
  warmth: number;
  sparkle: number;
};

type Collection = {
  k: number;
  stickers: Sticker[];
  centers: Center[];
};

type Assignment = {
  stickerId: string;
  centerId: string;
};

type CenterMovement = {
  centerId: string;
  distance: number;
  retained: boolean;
};

type IterationResult = {
  iteration: number;
  assignments: Assignment[];
  centers: Center[];
  movements: CenterMovement[];
  totalSquaredError: number;
  assignmentSignature: string;
  converged: boolean;
};
```

Improve types if useful, but keep the model simple.

---

## 5. Collection Validation

Before the first iteration validate the complete collection.

Requirements:

- `k` is an integer from 2 through 4.
- sticker count is from 2 through 30.
- `k` cannot exceed sticker count.
- exactly `k` initial centres exist.
- sticker IDs are non-empty and unique among stickers.
- centre IDs are non-empty and unique among centres.
- sticker coordinates are finite numeric values in `[0, 10]`.
- centre coordinates are finite numeric values in `[0, 10]`.
- preserve sticker source order.
- preserve centre source order.

Invalid data must:

- be visibly rejected
- identify the affected field/item where possible
- clear stale iterations
- clear stale assignments/groups
- clear stale metrics

Do not continue K-Means using invalid data.

Create repeatable tests for:

- an empty-panel collection
- at least two different validation failures

A general-purpose collection editor/file importer is NOT required.

---

## 6. Exact K-Means Algorithm

This section is authoritative. Implement exactly these rules.

### Stage 1 — Assign

For every sticker and current centre:

```text
squared_distance =
    (warmth - centre_warmth)^2
  + (sparkle - centre_sparkle)^2
```

Use squared Euclidean distance.

Do not take a square root for assignment.

Choose the centre with the smallest **unrounded** squared distance.

Tie rule:

```text
If two values differ by at most 1e-12,
they are considered tied.

The earlier centre in source order wins.
```

Never use displayed/rounded values for assignment.

### Stage 2 — Update

For each centre:

- if it has assigned stickers, replace coordinates with their arithmetic mean
- if it receives zero stickers, retain previous coordinates **exactly**

Never divide by zero.

### Stage 3 — Measure

After updating centres calculate:

```text
totalSquaredError =
    sum(
      squared distance from each sticker
      to the UPDATED centre
      of its current assignment
    )
```

Use current assignments and updated centres.

Do NOT reassign stickers during this stage.

### Stage 4 — Check convergence

Build an assignment signature from centre IDs in sticker source order.

Example:

```text
["panel-a", "panel-a", "panel-b", "panel-b"]
```

The first iteration can NEVER be converged.

After an update:

```text
if currentSignature === previousIterationSignature:
    status = CONVERGED
```

Compare only with the immediately preceding iteration.

If 20 iterations complete without a match:

```text
status = NOT_CONVERGED
```

Keep the twentieth state visible.

---

## 7. Centre Movement

After every update calculate display-only movement:

```text
movement =
  sqrt(
    (newWarmth - oldWarmth)^2 +
    (newSparkle - oldSparkle)^2
  )
```

If a centre was empty and retained:

```text
movement = 0
```

Movement is display-only.

Do NOT use movement to determine convergence.

Do NOT use rounded movement for any calculation.

---

## 8. Rounding

Display:

- coordinates
- movements
- distances
- total squared error

to at most 3 decimal places.

Rounding is display-only.

Never use displayed values for:

- assignment
- tie detection
- centre updates
- movement
- convergence
- tests

---

## 9. Step / Run to End / Reset

### Step

One click performs exactly one call to the common iteration operation.

### Run to End

Repeatedly use that exact same iteration operation until:

- `CONVERGED`, or
- `NOT_CONVERGED` after iteration 20

Do not create a second K-Means implementation for Run to End.

### Edit sticker

When the user edits a sticker:

1. Validate the edited collection.
2. If invalid:
   - reject it visibly
   - clear stale groups/iterations/metrics
3. If valid:
   - update sticker data
   - restore all centres to original centres
   - clear iteration history
   - clear assignments
   - clear metrics
   - return to ready state

### Reset

Restore:

- original demo stickers
- original demo centres
- original order
- empty iteration history
- no stale assignments
- no stale metrics
- ready state

Reset must reproduce the documented demonstration exactly.

---

## 10. Main Workspace UI

Create one primary visual workspace.

### Header

- application title
- short explanation of K-Means

### Controls

- Load Demo
- Step
- Run to End
- Reset

### Warmth/Sparkle map

Show:

- labelled X-axis: Warmth
- labelled Y-axis: Sparkle
- sticker markers
- initial centres
- current centres
- assignment lines
- legend

The legend MUST remain understandable without relying on colour alone. Use labels/shapes/text as well as colour.

### Iteration summary

Show:

- current iteration
- status
- total squared error
- centre movement

### Panel cards

For each centre/panel show:

- centre ID
- current coordinates
- movement
- whether retained because the panel was empty
- member stickers in original sticker source order

### Sticker inspector

Clicking a sticker shows:

- sticker ID
- warmth
- sparkle
- squared distance to every current centre
- chosen centre
- tie explanation when applicable

Distances are rounded only for display; decisions use unrounded values.

### Edit UI

Allow editing at least one sticker's:

- warmth
- sparkle

Inputs must visibly reject invalid coordinates.

Do NOT build a general-purpose dataset editor.

---

## 11. Visual Design

Make the application polished but not over-engineered.

Desired characteristics:

- clean modern dashboard
- clear hierarchy
- responsive browser layout
- readable cards
- obvious controls
- accessible contrast
- useful empty/error states
- subtle animations acceptable but not required

The visualization is the main product. Decorative UI must not obscure the algorithm.

---

## 12. State Design

Keep source data separate from current algorithm state.

Conceptually:

```text
originalCollection
editedCollection
originalCenters
iterationHistory
currentIteration
currentAssignments
currentMetrics
status
selectedStickerId
```

Prefer immutable state updates.

The calculation engine receives data and returns results rather than mutating React state.

---

## 13. Pure Engine API

Aim for a small pure API similar to:

```ts
validateCollection(collection): ValidationResult

squaredDistance(sticker, center): number

runIteration(
  stickers,
  currentCenters,
  previousAssignmentSignature?
): IterationResult
```

Possible helpers:

```ts
assignStickers(...)
updateCenters(...)
calculateSquaredError(...)
calculateMovement(...)
createAssignmentSignature(...)
```

Engine functions must not depend on:

- React
- DOM
- browser APIs
- component state
- rendering libraries

They must be deterministic and independently testable.

---

## 14. Testing Requirements

Use focused tests for:

1. Squared distance
2. Exact tie
3. Source-order tie breaking
4. Mean centre updates
5. Later reassignment
6. Empty-panel retention
7. Squared error
8. Signature-based convergence
9. 20-iteration non-convergence guard
10. Invalid `k`
11. Duplicate/empty IDs
12. Invalid coordinates
13. Edit restart
14. Invalid edit clears stale state
15. Reset
16. Main demo expected iterations

Example basic test:

```text
point = (0,0)
centre = (3,4)
expected squared distance = 25
```

The main demo's expected results must be independently calculated and documented.

---

## 15. Independent Expected Results

Create:

```text
docs/demo-expected-results.md
```

Record for EVERY iteration of the main demo:

- iteration number
- membership/assignment for every sticker
- updated centre coordinates
- total squared error
- convergence flag

This is reference/test evidence only.

The application must NOT import it or use it to determine results.

---

## 16. Candidate-Authored Edge Cases

Create repeatable scenarios.

### Empty panel

A valid collection where one centre receives zero stickers.

Expected:

- no division by zero
- no NaN
- empty centre remains exactly unchanged
- movement is 0
- UI explains the retained-centre reason

### Validation scenario 1

Example:

```text
warmth = 11
```

Expected rejection.

### Validation scenario 2

Example:

```text
duplicate sticker ID
```

Expected rejection.

---

## 17. Implementation Plan

Create:

```text
docs/implementation-plan.md
```

Use this 4-step plan.

### Step 1 — Domain model + engine

- define TypeScript types
- create demo/test datasets
- implement validation
- implement pure K-Means functions
- write algorithm tests

Checkpoint: mathematical tests pass.

### Step 2 — Replay/state system

- iteration history
- Step
- Run to End
- convergence
- Reset
- edit/restart

Checkpoint: Step and Run to End produce identical states.

### Step 3 — Visualization/UI

- warmth/sparkle map
- centres
- assignment lines
- panel cards
- sticker inspector
- metrics
- controls

Checkpoint: UI state matches engine state.

### Step 4 — Edge cases + polish

- empty panel
- invalid edit
- validation messages
- reset
- responsive polish
- final acceptance tests

Checkpoint: all acceptance criteria demonstrated.

If implementation deviates, document why.

---

## 18. AI-Assisted Development

Use Cursor/AI as a coding assistant, not a black-box project generator.

Recommended workflow:

1. Ask AI to analyze requirements.
2. Ask AI to propose architecture.
3. Review architecture yourself.
4. Implement the engine in small steps.
5. Ask AI to generate focused tests.
6. Run and inspect tests.
7. Build UI around the tested engine.
8. Use AI for debugging/polish.
9. Keep important prompts and decisions in `docs/ai-prompts.md`.

Do not blindly accept AI-generated architecture.

Do not add libraries just because AI suggests them.

For important AI recommendations record:

- what was suggested
- whether it was accepted/rejected
- why

---

## 19. Suggested Cursor Prompt Sequence

Save these in `docs/ai-prompts.md`.

### Prompt 1 — Requirement decomposition

> Analyze the Sticker Wall K-Means Curator specification. Extract exact functional requirements, algorithm rules, validation rules, edge cases, UI requirements, and acceptance criteria. Do not write implementation code.

### Prompt 2 — Architecture

> Design a minimal React + TypeScript architecture for this application. Keep the K-Means engine pure and independent from React. No backend, database, external API, or ML library. Explain each module and trade-off.

### Prompt 3 — Engine

> Implement the pure TypeScript K-Means engine according to the exact specification. Do not change the mathematical rules. Include squared distance, 1e-12 tie handling, source-order tie breaking, mean updates, empty-centre retention, squared error, assignment-signature convergence, movement, and the 20-iteration guard.

### Prompt 4 — Tests

> Create focused unit tests for the exact K-Means contract: squared distance, exact tie, source-order tie breaking, mean update, later reassignment, empty-centre retention, squared error, convergence, validation, edit restart, and reset.

### Prompt 5 — UI

> Build the React UI around the existing pure K-Means engine. Do not change engine behavior. Create the warmth/sparkle visualization, centres, assignment lines, panel cards, sticker inspector, metrics, Step, Run to End, Load Demo, Reset, and sticker editing.

### Prompt 6 — Verification

> Review the implementation against every acceptance criterion in the specification. Identify missing behavior, incorrect edge cases, stale state issues, rounding issues, or architectural violations. Do not rewrite working code unnecessarily.

---

## 20. Interview Technology Decisions

Be prepared to explain:

### Why React?

The application is an interactive, state-driven browser UI.

### Why TypeScript?

The project has structured domain objects and TypeScript makes contracts between the UI and calculation engine explicit.

### Why Vite?

Lightweight local browser development setup without unnecessary framework complexity.

### Why SVG?

The dataset is tiny (8–12 stickers in the main demo), so SVG provides full control over the visualization without unnecessary chart-library abstraction.

### Why no backend?

The requirements explicitly keep computation local and do not require persistence, accounts, or external services.

### Why no scikit-learn/ML library?

The task requires exposing each K-Means operation and deterministic iteration state. A small direct TypeScript implementation is more transparent and testable.

### Why separate engine and UI?

To isolate mathematical/business logic, make it deterministic, and test it independently.

### Why fixed starting centres?

The specification requires supplied fixed centres and forbids automatic/random centre selection.

---

## 21. Live Modification Preparation

Keep the codebase ready for a small focused modification.

Good examples:

- add a "Show only selected panel" visualization toggle
- add a metric showing sticker count per panel
- add an iteration-history list
- add maximum-distance display for selected sticker
- add a display-only sort option for panel cards

Do not over-engineer the core architecture for these.

---

## 22. Acceptance Checklist

Before declaring the project complete:

- [ ] Main demo has 8–12 stickers.
- [ ] Main demo has k=2 or k=3.
- [ ] Exactly k initial centres.
- [ ] Main demo has an exact first-iteration tie.
- [ ] Tie resolves using source-order centre.
- [ ] At least one sticker changes panel later.
- [ ] Every final panel is non-empty.
- [ ] Convergence occurs in 2–8 iterations.
- [ ] Repeated assignment iteration proves convergence.
- [ ] Expected results documented independently.
- [ ] Application calculates results rather than reading expected results.
- [ ] Warmth/sparkle axes visible.
- [ ] Initial and current centres visible.
- [ ] Assignment lines visible.
- [ ] Panel cards visible.
- [ ] Iteration number visible.
- [ ] Centre movement visible.
- [ ] Total squared error visible.
- [ ] Validation feedback visible.
- [ ] Load Demo works.
- [ ] Step works.
- [ ] Run to End works.
- [ ] Reset works.
- [ ] Sticker selection works.
- [ ] Distances to all current centres shown.
- [ ] Tie explanation shown.
- [ ] Sticker editing works.
- [ ] Valid edit restarts from original centres.
- [ ] Invalid edit is rejected.
- [ ] Invalid edit clears stale groups/metrics.
- [ ] Empty-panel scenario tested.
- [ ] Empty panel retains centre exactly.
- [ ] Empty panel movement is 0.
- [ ] At least two validation failures tested.
- [ ] Squared distance tested.
- [ ] Exact tie tested.
- [ ] Mean update tested.
- [ ] Later reassignment tested.
- [ ] Squared error tested.
- [ ] Signature convergence tested.
- [ ] Edit/reset tested.
- [ ] Step and Run to End use the same iteration operation.
- [ ] Display rounding never affects calculations.
- [ ] No backend/external service/random centre selection.
- [ ] AI prompts documented.
- [ ] Implementation plan documented.
- [ ] Design/technology decisions documented.
- [ ] Test evidence/screenshots/output samples prepared.

---

## 23. Definition of Done

The project is done only when:

1. The application works locally.
2. The main demo satisfies every deliberate dataset condition.
3. The mathematical engine passes focused tests.
4. The UI visibly demonstrates the algorithm rather than only showing final clusters.
5. Editing, invalid input, empty clusters, convergence, and reset work correctly.
6. Expected iteration results are independently documented.
7. AI prompts and key design decisions are recorded.
8. The codebase is small enough that the candidate can explain every important part in an interview.
9. No unnecessary infrastructure has been introduced.

**Most important principle: correctness and explainability over feature count.**
