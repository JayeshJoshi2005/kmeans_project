import { describe, expect, it } from 'vitest';
import { MAIN_DEMO_COLLECTION } from '../src/data/demoData';
import { EMPTY_PANEL_COLLECTION } from '../src/data/testScenarios';
import { runIteration, squaredDistance } from '../src/engine/kmeans';

describe('K-Means Engine Tests', () => {
  it('1. squaredDistance: point (0,0) vs centre (3,4) must equal 25', () => {
    const dist = squaredDistance({ warmth: 0, sparkle: 0 }, { warmth: 3, sparkle: 4 });
    expect(dist).toBe(25);
  });

  it('2 & 3. Exact tie & source-order tie-breaking: Iteration 1 of MAIN_DEMO_COLLECTION', () => {
    const iter1 = runIteration(
      MAIN_DEMO_COLLECTION.stickers,
      MAIN_DEMO_COLLECTION.centers,
      1
    );

    // Sticker s2 (Mallow Pop, 5,5) is dist 18 from c1(2,2) and 18 from c2(8,8)
    const s2Assignment = iter1.assignments.find((a) => a.stickerId === 's2')!;
    expect(s2Assignment.isTie).toBe(true);
    expect(s2Assignment.tiedCenterIds).toEqual(['c1', 'c2']);
    expect(s2Assignment.centerId).toBe('c1'); // earlier centre in source order wins
    expect(s2Assignment.winningReason).toContain('won by earlier source-order center "c1"');

    // Updated centres
    expect(iter1.centers[0].warmth).toBe(2.75);
    expect(iter1.centers[0].sparkle).toBe(2.75);
    expect(iter1.centers[1].warmth).toBe(7.0);
    expect(iter1.centers[1].sparkle).toBe(6.5);

    // SSE
    expect(iter1.totalSquaredError).toBe(28.5);

    // Iteration 1 is never converged
    expect(iter1.isConverged).toBe(false);
  });

  it('4 & 5. Later reassignment: Iteration 2 of MAIN_DEMO_COLLECTION', () => {
    const iter1 = runIteration(
      MAIN_DEMO_COLLECTION.stickers,
      MAIN_DEMO_COLLECTION.centers,
      1
    );

    const iter2 = runIteration(
      MAIN_DEMO_COLLECTION.stickers,
      iter1.centers,
      2,
      iter1.assignmentSignature
    );

    // s2 changed panel from c1 to c2
    const s2Assignment = iter2.assignments.find((a) => a.stickerId === 's2')!;
    expect(s2Assignment.centerId).toBe('c2');

    // Updated centres
    expect(iter2.centers[0].warmth).toBe(2.0);
    expect(iter2.centers[0].sparkle).toBe(2.0);
    expect(iter2.centers[1].warmth).toBe(6.6);
    expect(iter2.centers[1].sparkle).toBe(6.2);

    // SSE
    expect(iter2.totalSquaredError).toBe(20.0);
    expect(iter2.isConverged).toBe(false);
  });

  it('6 & 7. Convergence at Iteration 3 of MAIN_DEMO_COLLECTION', () => {
    const iter1 = runIteration(
      MAIN_DEMO_COLLECTION.stickers,
      MAIN_DEMO_COLLECTION.centers,
      1
    );
    const iter2 = runIteration(
      MAIN_DEMO_COLLECTION.stickers,
      iter1.centers,
      2,
      iter1.assignmentSignature
    );
    const iter3 = runIteration(
      MAIN_DEMO_COLLECTION.stickers,
      iter2.centers,
      3,
      iter2.assignmentSignature
    );

    expect(iter3.isConverged).toBe(true);
    expect(iter3.assignmentSignature).toBe(iter2.assignmentSignature);
    expect(iter3.totalSquaredError).toBe(20.0);
  });

  it('8. Empty-panel retention: retains previous centre, movement 0, no division by zero', () => {
    const iter1 = runIteration(
      EMPTY_PANEL_COLLECTION.stickers,
      EMPTY_PANEL_COLLECTION.centers,
      1
    );

    // c2 receives 0 stickers
    const c2Movement = iter1.movements.find((m) => m.centerId === 'c2')!;
    expect(c2Movement.retainedBecauseEmpty).toBe(true);
    expect(c2Movement.movement).toBe(0);

    const c2Updated = iter1.centers.find((c) => c.id === 'c2')!;
    expect(c2Updated.warmth).toBe(9.0);
    expect(c2Updated.sparkle).toBe(9.0);
    expect(Number.isNaN(c2Updated.warmth)).toBe(false);
  });

  it('9. 20-iteration non-convergence guard', () => {
    // Calling runIteration with iteration = 20 and a non-matching previousSignature triggers guard
    const iter20 = runIteration(
      MAIN_DEMO_COLLECTION.stickers,
      MAIN_DEMO_COLLECTION.centers,
      20,
      'different_sig'
    );

    expect(iter20.isNotConvergedGuard).toBe(true);
  });
});
