# Test plan

Focused tests over broad coverage. Calculations use unrounded values. Display rounding is not an oracle for engine tests.

## Core algorithm

| Case | Expectation |
| --- | --- |
| Squared distance | `(0,0)` vs `(3,4)` → `25`; no sqrt in assignment |
| Exact tie | Equal unrounded `d²`; earlier centre in source order wins |
| Near-tie | `\|Δ\| ≤ 1e-12` treated as tie; larger gap is not |
| Mean update | Non-empty centre = arithmetic mean of members |
| Later reassignment | At least one sticker changes centre after iteration 1 (demo or fixture) |
| Empty-panel retention | Previous coordinates exactly; no NaN; no divide by zero |
| Squared error | Sum of `d²` to **updated** centres of **current** assignments; no reassign |
| Signature convergence | Iteration 1 never converged; match vs **previous** signature only |
| 20-iteration guard | After 20 without a match: not converged; 20th state retained |

## Validation

| Case | Expectation |
| --- | --- |
| `k` range | Reject non-integers and values outside 2–4 |
| Sticker count | Reject outside 2–30 |
| `k` vs `n` | Reject `k >` sticker count |
| Centre count | Reject unless exactly `k` centres |
| IDs | Reject empty or duplicate sticker IDs; empty or duplicate centre IDs |
| Coordinates | Reject non-finite or outside `[0, 10]` |
| Source order | Validation does not reorder stickers or centres |

At least two distinct validation-failure fixtures (e.g. `warmth = 11`, duplicate sticker ID). Empty-panel collection must **pass** validation (it is a clustering edge case, not invalid data).

## Edge cases

- Empty panel: movement `0`; UI copy for retained centre (when UI exists)
- Invalid edit: visible rejection; stale groups/iterations/metrics cleared
- Valid edit: restart from original centres; history empty
- Reset: exact documented demo restored
- Rounding: engine/tests must not compare `toFixed(3)` strings for math

## UI / state behaviour

- Load Demo, Step, Run to End, Reset
- Step × N and Run to End produce **identical** iteration histories
- Selection shows distances to all current centres, chosen centre, tie explanation when relevant
- Limited edit of at least one sticker; not a full dataset editor
- Invalid collection never continues K-Means

## Demo verification

- Collection: 8–12 stickers; `k = 2` or `3`; exactly `k` centres; coherent theme
- Not the problem-statement illustration dataset
- Iteration 1 exact tie; later panel change; all panels non-empty at convergence; 2–8 iterations including the proving repeat
- Independently recorded values in `DEMO_RESULTS.md`
- Tests (or a non-runtime fixture) compare engine output to those values
- Application source must **never** import `DEMO_RESULTS.md`

## Evidence

Keep test command output, and later screenshots or printed iteration samples, for the interview. Record gaps here if a required case is still missing.
