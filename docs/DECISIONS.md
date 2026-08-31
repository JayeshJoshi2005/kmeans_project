# Decision log

Record real choices only. Do not add hypothetical or “AI would have…” entries.

## Template

```text
### D-NNN — short title
- Date:
- Decision:
- Context:
- Options considered:
- Chosen option:
- Reason:
- Trade-off:
- Follow-up (optional):
```

## Entries

### D-001 — Five-layer pipeline, no extra architectural patterns
- Date: 2026-08-31
- Decision: Structure the app as domain data → validation → pure K-Means → React state → UI.
- Context: Interview project; specs require a React-independent engine and forbid hidden ML libraries. Repo had no `src/` yet, so this is the layout to implement rather than a refactor.
- Options considered: (1) This pipeline with flat modules; (2) Redux/Context + services/repositories; (3) Put clustering inside React components.
- Chosen option: (1)
- Reason: Matches `AGENTS.md` and the specs; each layer is one interview talking point; validation can block iteration without living inside `kmeans.ts`.
- Trade-off: Call sites must remember to validate before `runIteration`. That is preferable to a facade that hides the rule.

### D-002 — Algorithm state lives in `App.tsx`, not a global store
- Date: 2026-08-31
- Decision: Use `useState` in `App.tsx`. Do not add Redux, Zustand, or React Context for K-Means state. Do not add `useStickerWall` until `App.tsx` is actually unwieldy.
- Context: One workspace, no routes, tiny dataset.
- Options considered: (1) App-owned state; (2) custom hook from day one; (3) Context provider; (4) Redux.
- Chosen option: (1)
- Reason: Fewest moving parts to explain in 30–40 minutes. A hook is an extract, not a prerequisite.
- Trade-off: `App.tsx` may grow in Stage 4. If it becomes hard to navigate, extract a hook without changing engine or UI contracts.

### D-003 — Display rounding is not part of the engine
- Date: 2026-08-31
- Decision: Keep `format` (≤ 3 decimal places) out of `kmeans.ts`. Inspector distances use engine `squaredDistance`, then format in the UI.
- Context: Spec forbids using displayed values for assignment, ties, updates, movement, convergence, or tests.
- Options considered: (1) Separate UI formatter; (2) Engine returns both raw and rounded fields.
- Chosen option: (1)
- Reason: Rounded fields on `IterationResult` would tempt tests and UI to use the wrong number.
- Trade-off: Every view must format explicitly.

### D-004 — `iterationHistory` is the algorithm source of truth
- Date: 2026-08-31
- Decision: Store an array of `IterationResult`. Derive current centres, assignments, metrics, and previous signature from the last item (or originals if empty).
- Context: Step, Run to End, Reset, and edit-restart must not leave stale clusters on screen.
- Options considered: (1) History array; (2) Only “current” centres/assignments in state, overwrite each step.
- Chosen option: (1)
- Reason: Run to End vs N× Step is a straightforward array compare; Reset/invalid edit is `history = []`.
- Trade-off: Slightly more state than a single current snapshot; negligible for ≤ 20 iterations.

### D-005 — Primary Themed Dataset Design ("Festival Mascot Collection")
- Date: 2026-08-31
- Decision: Author an 8-sticker collection ($k = 2$) with starting centres `c1` (2,2) and `c2` (8,8) that explicitly triggers a first-iteration tie at (5,5), a panel reassignment in iteration 2, non-empty final panels, and converges at iteration 3.
- Context: Requirement to provide a themed demonstration satisfying precise algorithm conditions without using the problem statement illustration.
- Options considered: (1) 8-sticker $k=2$ dataset with tie and reassignment; (2) 12-sticker $k=3$ dataset.
- Chosen option: (1)
- Reason: Minimizes mathematical visual complexity for interview demonstration while proving all mandatory edge cases (exact tie, source order tie break, reassignment, convergence in 2–8 steps).
- Trade-off: None. Fully satisfies all acceptance criteria.


