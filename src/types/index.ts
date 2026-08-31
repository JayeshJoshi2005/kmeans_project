export interface Sticker {
  id: string;
  name: string;
  warmth: number;
  sparkle: number;
}

export interface Center {
  id: string;
  name: string;
  warmth: number;
  sparkle: number;
}

export interface Collection {
  k: number;
  stickers: Sticker[];
  centers: Center[];
}

export interface DistanceInfo {
  centerId: string;
  squaredDistance: number;
}

export interface Assignment {
  stickerId: string;
  centerId: string;
  distances: DistanceInfo[];
  isTie: boolean;
  tiedCenterIds: string[];
  winningReason: string;
}

export interface CenterMovement {
  centerId: string;
  oldWarmth: number;
  oldSparkle: number;
  newWarmth: number;
  newSparkle: number;
  movement: number;
  retainedBecauseEmpty: boolean;
}

export interface IterationResult {
  iteration: number;
  centers: Center[];
  assignments: Assignment[];
  movements: CenterMovement[];
  totalSquaredError: number;
  assignmentSignature: string;
  isConverged: boolean;
  isNotConvergedGuard: boolean;
}

export interface ValidationIssue {
  code: string;
  message: string;
  field?: string;
  itemId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export type RunStatus = 'empty' | 'ready' | 'running' | 'converged' | 'not_converged' | 'invalid';
