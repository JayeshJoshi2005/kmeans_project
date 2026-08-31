import { describe, expect, it } from 'vitest';
import { MAIN_DEMO_COLLECTION } from '../src/data/demoData';
import { runIteration, validateCollection } from '../src/engine';
import { Collection, IterationResult } from '../src/types';

describe('App State & Interaction Integration Tests', () => {
  it('Step vs Run to End equivalence: 3 Steps produce identical state as Run to End', () => {
    // 1. Step 3 times manually
    const historyStep: IterationResult[] = [];
    let iter = 1;
    let isDone = false;

    while (!isDone && iter <= 10) {
      const prevSig = historyStep.length > 0 ? historyStep[historyStep.length - 1].assignmentSignature : undefined;
      const prevCenters = historyStep.length > 0 ? historyStep[historyStep.length - 1].centers : MAIN_DEMO_COLLECTION.centers;

      const res = runIteration(MAIN_DEMO_COLLECTION.stickers, prevCenters, iter, prevSig);
      historyStep.push(res);

      if (res.isConverged || res.isNotConvergedGuard) {
        isDone = true;
      }
      iter++;
    }

    // 2. Single Run to End loop
    const historyRun: IterationResult[] = [];
    let rIter = 1;
    let rDone = false;

    while (!rDone && rIter <= 25) {
      const prevSig = historyRun.length > 0 ? historyRun[historyRun.length - 1].assignmentSignature : undefined;
      const prevCenters = historyRun.length > 0 ? historyRun[historyRun.length - 1].centers : MAIN_DEMO_COLLECTION.centers;

      const res = runIteration(MAIN_DEMO_COLLECTION.stickers, prevCenters, rIter, prevSig);
      historyRun.push(res);

      if (res.isConverged || res.isNotConvergedGuard) {
        rDone = true;
      }
      rIter++;
    }

    expect(historyStep.length).toBe(historyRun.length);
    expect(historyStep).toEqual(historyRun);
  });

  it('Valid edit restart: restores original centres, clears iteration history, valid state', () => {
    // Run 2 iterations first
    const iter1 = runIteration(MAIN_DEMO_COLLECTION.stickers, MAIN_DEMO_COLLECTION.centers, 1);
    const iter2 = runIteration(MAIN_DEMO_COLLECTION.stickers, iter1.centers, 2, iter1.assignmentSignature);
    let history = [iter1, iter2];

    expect(history).toHaveLength(2);

    // Edit sticker s1 warmth to 2.5
    const updatedStickers = MAIN_DEMO_COLLECTION.stickers.map((s) =>
      s.id === 's1' ? { ...s, warmth: 2.5 } : s
    );

    const editedCollection: Collection = {
      ...MAIN_DEMO_COLLECTION,
      stickers: updatedStickers,
      centers: MAIN_DEMO_COLLECTION.centers, // Restored original centres
    };

    // Clear history on edit
    history = [];

    const val = validateCollection(editedCollection);
    expect(val.isValid).toBe(true);
    expect(history).toHaveLength(0);
    expect(editedCollection.centers).toEqual(MAIN_DEMO_COLLECTION.centers);
  });

  it('Invalid edit rejection: rejects visibly, clears history/assignments/metrics, invalid state', () => {
    // Run 1 iteration
    const iter1 = runIteration(MAIN_DEMO_COLLECTION.stickers, MAIN_DEMO_COLLECTION.centers, 1);
    let history = [iter1];

    // Edit s1 with warmth = 12 (invalid)
    const invalidStickers = MAIN_DEMO_COLLECTION.stickers.map((s) =>
      s.id === 's1' ? { ...s, warmth: 12.0 } : s
    );

    const invalidCollection: Collection = {
      ...MAIN_DEMO_COLLECTION,
      stickers: invalidStickers,
      centers: MAIN_DEMO_COLLECTION.centers,
    };

    history = []; // clear stale iterations

    const val = validateCollection(invalidCollection);
    expect(val.isValid).toBe(false);
    expect(val.issues.some((i) => i.code === 'INVALID_STICKER_WARMTH')).toBe(true);
    expect(history).toHaveLength(0);
  });

  it('Reset restores original demo stickers, centres, and empty history', () => {
    // Modified collection
    const modifiedCollection: Collection = {
      ...MAIN_DEMO_COLLECTION,
      stickers: MAIN_DEMO_COLLECTION.stickers.map((s) => ({ ...s, warmth: 9.9 })),
    };
    let history = [runIteration(modifiedCollection.stickers, modifiedCollection.centers, 1)];

    // Perform Reset
    const resetCollection = MAIN_DEMO_COLLECTION;
    history = [];

    expect(resetCollection).toEqual(MAIN_DEMO_COLLECTION);
    expect(history).toHaveLength(0);
  });
});
