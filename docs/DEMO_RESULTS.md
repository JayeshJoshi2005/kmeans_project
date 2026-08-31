# Demo Results — Main Collection (`MAIN_DEMO_COLLECTION`)

Independently documented expected iteration results for the main demonstration collection ("Festival Mascot Collection", $k = 2$). The application **must calculate** these results dynamically at runtime and **must not import** this document.

---

## Dataset Summary

- **$k$**: 2
- **Initial Centres**:
  - `c1` ("Berry Panel"): (2.000, 2.000)
  - `c2` ("Citrus Panel"): (8.000, 8.000)
- **Stickers**:
  - `s1` ("Cloud Puff"): (1.000, 1.000)
  - `s2` ("Mallow Pop"): (5.000, 5.000) — *Tied in Iteration 1*
  - `s3` ("Solar Spark"): (6.000, 5.000)
  - `s4` ("Glow Ray"): (7.000, 7.000)
  - `s5` ("Neon Nova"): (9.000, 8.000)
  - `s6` ("Teal Wave"): (2.000, 3.000)
  - `s7` ("Sky Twinkle"): (3.000, 2.000)
  - `s8` ("Amber Beam"): (6.000, 6.000)

---

## Expected Iterations

### Iteration 1

- **Assignments**:
  - `s1` ➔ `c1` ($d^2_{c1} = 2$, $d^2_{c2} = 98$)
  - `s2` ➔ `c1` ($d^2_{c1} = 18$, $d^2_{c2} = 18$; **Exact Tie**, $18 = 18$. `c1` wins as earlier centre in source order)
  - `s3` ➔ `c2` ($d^2_{c1} = 25$, $d^2_{c2} = 13$)
  - `s4` ➔ `c2` ($d^2_{c1} = 50$, $d^2_{c2} = 2$)
  - `s5` ➔ `c2` ($d^2_{c1} = 85$, $d^2_{c2} = 1$)
  - `s6` ➔ `c1` ($d^2_{c1} = 1$, $d^2_{c2} = 61$)
  - `s7` ➔ `c1` ($d^2_{c1} = 1$, $d^2_{c2} = 61$)
  - `s8` ➔ `c2` ($d^2_{c1} = 32$, $d^2_{c2} = 8$)
- **Panel Memberships**:
  - `c1`: `s1`, `s2`, `s6`, `s7` (4 stickers)
  - `c2`: `s3`, `s4`, `s5`, `s8` (4 stickers)
- **Updated Centres**:
  - `c1`: (2.750, 2.750)
  - `c2`: (7.000, 6.500)
- **Total Squared Error (SSE)**: 28.500
- **Centre Movements**:
  - `c1`: 1.061
  - `c2`: 1.803
- **Assignment Signature**: `c1:c1:c2:c2:c2:c1:c1:c2`
- **Convergence Status**: `false` (Iteration 1 is never converged)

---

### Iteration 2

- **Assignments**:
  - `s1` ➔ `c1` ($d^2_{c1} = 6.125$, $d^2_{c2} = 66.250$)
  - `s2` ➔ `c2` ($d^2_{c1} = 10.125$, $d^2_{c2} = 6.250$; **Reassigned / Panel Change**)
  - `s3` ➔ `c2` ($d^2_{c1} = 15.625$, $d^2_{c2} = 3.250$)
  - `s4` ➔ `c2` ($d^2_{c1} = 36.125$, $d^2_{c2} = 0.250$)
  - `s5` ➔ `c2` ($d^2_{c1} = 66.625$, $d^2_{c2} = 6.250$)
  - `s6` ➔ `c1` ($d^2_{c1} = 0.625$, $d^2_{c2} = 37.250$)
  - `s7` ➔ `c1` ($d^2_{c1} = 0.625$, $d^2_{c2} = 36.250$)
  - `s8` ➔ `c2` ($d^2_{c1} = 21.125$, $d^2_{c2} = 1.250$)
- **Panel Memberships**:
  - `c1`: `s1`, `s6`, `s7` (3 stickers)
  - `c2`: `s2`, `s3`, `s4`, `s5`, `s8` (5 stickers)
- **Updated Centres**:
  - `c1`: (2.000, 2.000)
  - `c2`: (6.600, 6.200)
- **Total Squared Error (SSE)**: 20.000
- **Centre Movements**:
  - `c1`: 1.061
  - `c2`: 0.500
- **Assignment Signature**: `c1:c2:c2:c2:c2:c1:c1:c2`
- **Convergence Status**: `false` (differs from Iteration 1 signature)

---

### Iteration 3

- **Assignments**: Same assignments as Iteration 2.
- **Panel Memberships**:
  - `c1`: `s1`, `s6`, `s7` (3 stickers)
  - `c2`: `s2`, `s3`, `s4`, `s5`, `s8` (5 stickers)
- **Updated Centres**:
  - `c1`: (2.000, 2.000)
  - `c2`: (6.600, 6.200)
- **Total Squared Error (SSE)**: 20.000
- **Centre Movements**:
  - `c1`: 0.000
  - `c2`: 0.000
- **Assignment Signature**: `c1:c2:c2:c2:c2:c1:c1:c2`
- **Convergence Status**: `true` (`CONVERGED` — matches Iteration 2 signature)
