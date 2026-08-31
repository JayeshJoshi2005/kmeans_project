import {
  Assignment,
  Center,
  CenterMovement,
  DistanceInfo,
  IterationResult,
  Sticker,
} from '../types';

export function squaredDistance(
  p1: { warmth: number; sparkle: number },
  p2: { warmth: number; sparkle: number }
): number {
  const dWarmth = p1.warmth - p2.warmth;
  const dSparkle = p1.sparkle - p2.sparkle;
  return dWarmth * dWarmth + dSparkle * dSparkle;
}

export function runIteration(
  stickers: Sticker[],
  currentCenters: Center[],
  iteration: number,
  previousSignature?: string
): IterationResult {
  // Stage 1: Assign
  const assignments: Assignment[] = stickers.map((sticker) => {
    const distances: DistanceInfo[] = currentCenters.map((center) => ({
      centerId: center.id,
      squaredDistance: squaredDistance(sticker, center),
    }));

    let minDistance = Infinity;
    distances.forEach((d) => {
      if (d.squaredDistance < minDistance) {
        minDistance = d.squaredDistance;
      }
    });

    const tiedCenterIds: string[] = [];
    distances.forEach((d) => {
      if (Math.abs(d.squaredDistance - minDistance) <= 1e-12) {
        tiedCenterIds.push(d.centerId);
      }
    });

    const isTie = tiedCenterIds.length > 1;

    // Earlier centre in source order wins. Since currentCenters maintains source order,
    // tiedCenterIds[0] is guaranteed to be the earliest centre in source order.
    const winningCenterId = tiedCenterIds[0];

    const winningReason = isTie
      ? `Exact tie between centers (${tiedCenterIds.join(', ')}); won by earlier source-order center "${winningCenterId}".`
      : `Closest center by squared distance.`;

    return {
      stickerId: sticker.id,
      centerId: winningCenterId,
      distances,
      isTie,
      tiedCenterIds,
      winningReason,
    };
  });

  // Stage 2: Update centres
  const updatedCenters: Center[] = currentCenters.map((center) => {
    const assignedStickers = stickers.filter((_, idx) => assignments[idx].centerId === center.id);

    if (assignedStickers.length === 0) {
      // Retain previous coordinates exactly
      return { ...center };
    }

    const sumWarmth = assignedStickers.reduce((acc, s) => acc + s.warmth, 0);
    const sumSparkle = assignedStickers.reduce((acc, s) => acc + s.sparkle, 0);

    return {
      ...center,
      warmth: sumWarmth / assignedStickers.length,
      sparkle: sumSparkle / assignedStickers.length,
    };
  });

  // Stage 3: Measure total squared error (SSE) to UPDATED centres using CURRENT assignments
  let totalSquaredError = 0;
  stickers.forEach((sticker, idx) => {
    const assignedCenterId = assignments[idx].centerId;
    const updatedCenter = updatedCenters.find((c) => c.id === assignedCenterId)!;
    totalSquaredError += squaredDistance(sticker, updatedCenter);
  });

  // Calculate centre movements (display-only)
  const movements: CenterMovement[] = currentCenters.map((oldCenter, idx) => {
    const newCenter = updatedCenters[idx];
    const assignedStickers = stickers.filter((_, i) => assignments[i].centerId === oldCenter.id);
    const retainedBecauseEmpty = assignedStickers.length === 0;

    let movement = 0;
    if (!retainedBecauseEmpty) {
      movement = Math.sqrt(squaredDistance(oldCenter, newCenter));
    }

    return {
      centerId: oldCenter.id,
      oldWarmth: oldCenter.warmth,
      oldSparkle: oldCenter.sparkle,
      newWarmth: newCenter.warmth,
      newSparkle: newCenter.sparkle,
      movement,
      retainedBecauseEmpty,
    };
  });

  // Stage 4: Check convergence
  const assignmentSignature = assignments.map((a) => a.centerId).join(':');

  let isConverged = false;
  if (iteration > 1 && previousSignature !== undefined) {
    isConverged = assignmentSignature === previousSignature;
  }

  const isNotConvergedGuard = iteration >= 20 && !isConverged;

  return {
    iteration,
    centers: updatedCenters,
    assignments,
    movements,
    totalSquaredError,
    assignmentSignature,
    isConverged,
    isNotConvergedGuard,
  };
}
