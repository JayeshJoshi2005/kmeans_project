# Requirements — Sticker Wall K-Means Curator

Implementation-oriented extract of `Student_SPR26_D2_P02-sticker-wall-k-means-curator.md` and `STICKER_WALL_CURSOR_SPEC.md`. Do not treat this file as permission to add features those documents do not require.

---

## Functional requirements

- Represent stickers with `warmth` and `sparkle` in `[0, 10]`.
- Load a themed demo collection in one action.
- Show stickers on a labelled warmth/sparkle map with original starting centres and current centres.
- **Step**: perform exactly one K-Means iteration via the shared iteration operation.
- **Run to End**: repeat that same operation until `CONVERGED` or `NOT_CONVERGED` after iteration 20.
- Select a sticker and inspect squared distance to every **current** centre, the chosen centre, and a tie explanation when applicable.
- Edit at least one sticker’s warmth and sparkle.
- After a **valid** edit: update sticker data, restore original centres, clear iteration history, assignments, and metrics, return to ready state.
- After an **invalid** edit: reject visibly, identify the field/item when possible, clear stale iterations, groups, and metrics; do not run K-Means on invalid data.
- **Reset**: restore original demo stickers, centres, and order; empty history; no stale assignments or metrics; ready state; exact documented demonstration.
- Show current iteration, assignments/groups, centre movement, total squared error, and convergence status.
- Author a main demo (8–12 stickers, `k = 2` or `3`) that is **not** the problem-statement illustration (`mint`/`coral` table).
- Independently document expected demo iterations; the app must calculate results from sticker and centre data only.

Optional (problem statement; not required): local image of the finished wall, or a compact JSON summary of panel memberships.

---

## Algorithm requirements

Perform stages in this order for every iteration.

### Assign

```text
squared_distance = (warmth - centre_warmth)^2 + (sparkle - centre_sparkle)^2
```

- Use squared Euclidean distance; do not take a square root for assignment.
- Choose the centre with the smallest **unrounded** squared distance.
- If two values differ by at most `1e-12`, they are tied; the **earlier centre in source order** wins.
- Never use displayed/rounded values for assignment.

### Update

- Non-empty centre: replace coordinates with the arithmetic mean of assigned stickers.
- Zero stickers: retain previous coordinates **exactly**. Never divide by zero.

### Measure

- `totalSquaredError` = sum of squared distance from each sticker to the **updated** centre of its **current** assignment.
- Do not reassign during this stage.

### Check convergence

- Assignment signature = assigned centre IDs in **sticker source order**.
- First iteration can **never** be converged.
- After an update: `CONVERGED` iff current signature equals the **immediately preceding** iteration’s signature.
- If 20 iterations complete without a match: `NOT_CONVERGED`; keep the twentieth state visible. No requirement to author a dataset that hits this guard.

### Centre movement (display-only)

```text
movement = sqrt((newWarmth - oldWarmth)^2 + (newSparkle - oldSparkle)^2)
```

- Empty retained centre: `movement = 0`.
- Do not use movement (or rounded movement) to decide convergence or any other calculation.

### Rounding

- Display coordinates, movements, distances, and total squared error to at most 3 decimal places.
- Rounding is display-only. Never use displayed values for assignment, ties, updates, movement calculation, convergence, or tests.

### Shared iteration

- Step and Run to End must use the same iteration operation (not two implementations).

---

## Validation requirements

Validate the complete collection before the first iteration.

- `k` is an integer from 2 through 4.
- Sticker count is from 2 through 30.
- `k` cannot exceed sticker count.
- Exactly `k` initial centres.
- Sticker IDs: non-empty, unique among stickers.
- Centre IDs: non-empty, unique among centres.
- Sticker and centre coordinates: finite numeric values in `[0, 10]` inclusive.
- Preserve sticker source order and centre source order.
- Use supplied values directly; do not normalize, randomize, or replace centres.

Invalid data: visible rejection; identify affected field/item when possible; clear stale iterations, groups, and metrics; do not continue K-Means.

Exact error-code wording is not required. A general-purpose collection editor or file importer is not required.

---

## UI requirements

One primary visual workspace.

- Header: application title; short explanation of K-Means.
- Controls: Load Demo, Step, Run to End, Reset.
- Map: labelled X = Warmth, Y = Sparkle; sticker markers; initial centres; current centres; assignment lines; legend understandable **without colour alone** (labels/shapes/text as well as colour).
- Iteration summary: current iteration, status, total squared error, centre movement.
- Panel cards: centre ID, current coordinates, movement, whether retained because empty, member stickers in original sticker source order.
- Sticker inspector: id, warmth, sparkle, squared distance to every current centre, chosen centre, tie explanation when applicable. Distances rounded only for display.
- Edit: at least one sticker’s warmth and sparkle; invalid coordinates rejected visibly. Not a general-purpose dataset editor.
- Visual design: clean dashboard, clear hierarchy, responsive browser layout, readable cards, obvious controls, accessible contrast, useful empty/error states. Decorative UI must not obscure the algorithm. Subtle animations optional.

---

## Testing requirements

Focused tests for:

1. Squared distance (example: point `(0,0)`, centre `(3,4)` → `25`)
2. Exact tie
3. Source-order tie breaking
4. Mean centre updates
5. Later reassignment
6. Empty-panel retention
7. Squared error
8. Signature-based convergence
9. 20-iteration non-convergence guard (engine behaviour; dataset that hits 20 is not required)
10. Invalid `k`
11. Duplicate/empty IDs
12. Invalid coordinates
13. Edit restart
14. Invalid edit clears stale state
15. Reset
16. Main demo expected iterations

Repeatable candidate-authored scenarios:

- Valid collection that produces an empty panel (no divide-by-zero, no NaN, centre unchanged, movement `0`, UI explains retained-centre reason)
- At least two different validation failures (examples: `warmth = 11`; duplicate sticker ID)

Main demo expected results: independently calculated and documented; application must not import that document.

---

## Constraints

- Local computation only.
- Out of scope: backend, database, authentication, external APIs, external AI services, image recognition, cloud services, automatic/random centre initialization, general-purpose file importer/editor, Python ML service, ML library that hides K-Means.
- Keep the calculation engine independent from React/UI.
- Browser app is the intended stack (React + TypeScript + Vite per implementation spec). Problem statement also allows another local interactive plot; this project uses the browser stack.
- Codebase must stay small enough to explain in an interview.
- Optional live-mod hooks should remain easy (e.g. panel filter, per-panel counts) without over-engineering the core.

---

## Main demo dataset requirements

Must:

- Contain 8–12 stickers
- Use `k = 2` or `k = 3`
- Have exactly `k` fixed starting centres
- Have an appealing coherent theme
- Have at least one sticker exactly tied between two centres in iteration 1
- Have at least one sticker change panel in a later iteration
- Have every panel non-empty when converged
- Converge in 2–8 iterations, counting the repeated assignment iteration that proves convergence

Must not use the problem-statement `button`/`star`/`flame`/`heart`/`sun` illustration as the main demonstration.

---

## Acceptance criteria

From the problem statement (required):

- [ ] Themed main collection 8–12 stickers, `k = 2` or `3`, with first-iteration tie, later reassignment, non-empty final panels, 2–8-iteration convergence
- [ ] Independently record membership, updated centres, total squared error, and convergence flag for every main-demo iteration; app reproduces them without reading the record as input
- [ ] Warmth/sparkle map with initial and current centres, assignment lines, panel cards, movements, SSE, iteration state, colour-independent legend
- [ ] Sticker inspect: decision uses unrounded values; display suitably rounded; chosen centre; source-order tie rule when relevant
- [ ] Step and Run to End produce identical states; edit at least one coordinate and restart from original centres; Reset restores the documented demonstration
- [ ] Empty-panel case: centre fixed, no division by zero / non-numeric value; retained-centre reason shown
- [ ] Invalid edited coordinate rejected without stale groups/metrics; repeatable test evidence for at least one additional validation category
- [ ] Focused tests: squared distance, exact tie, mean updates, later reassignment, empty-panel retention, squared error, signature convergence, validation, edits, reset

Implementation spec additional checks (same product): Load Demo works; validation feedback visible; 20-iteration guard implemented; display rounding never affects calculations; no backend/external service/random centres; AI prompts, plan, and design decisions documented; test evidence prepared.

Definition of done: app works locally; demo satisfies deliberate conditions; engine tests pass; UI shows the process not only the final clusters; edit/invalid/empty/convergence/reset work; expected results documented independently; AI and design records exist; no unnecessary infrastructure.
