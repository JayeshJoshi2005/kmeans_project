import { Collection, ValidationIssue, ValidationResult } from '../types';

export function validateCollection(collection: Collection): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!collection) {
    return {
      isValid: false,
      issues: [{ code: 'MISSING_COLLECTION', message: 'Collection is required.' }],
    };
  }

  const { k, stickers = [], centers = [] } = collection;

  // 1. Check k integer and range [2, 4]
  if (!Number.isInteger(k) || k < 2 || k > 4) {
    issues.push({
      code: 'INVALID_K',
      message: `k must be an integer between 2 and 4 (received ${k}).`,
      field: 'k',
    });
  }

  // 2. Check sticker count range [2, 30]
  if (stickers.length < 2 || stickers.length > 30) {
    issues.push({
      code: 'INVALID_STICKER_COUNT',
      message: `Sticker count must be between 2 and 30 (received ${stickers.length}).`,
      field: 'stickers',
    });
  }

  // 3. Check k <= sticker count
  if (k > stickers.length) {
    issues.push({
      code: 'K_EXCEEDS_STICKERS',
      message: `k (${k}) cannot exceed sticker count (${stickers.length}).`,
      field: 'k',
    });
  }

  // 4. Exactly k initial centres
  if (centers.length !== k) {
    issues.push({
      code: 'CENTER_COUNT_MISMATCH',
      message: `Exactly k (${k}) initial centres are required (received ${centers.length}).`,
      field: 'centers',
    });
  }

  // 5. Sticker IDs non-empty and unique
  const stickerIdSet = new Set<string>();
  stickers.forEach((sticker, index) => {
    if (!sticker.id || sticker.id.trim() === '') {
      issues.push({
        code: 'EMPTY_STICKER_ID',
        message: `Sticker at index ${index} has an empty ID.`,
        field: `stickers[${index}].id`,
        itemId: sticker.id,
      });
    } else if (stickerIdSet.has(sticker.id)) {
      issues.push({
        code: 'DUPLICATE_STICKER_ID',
        message: `Duplicate sticker ID "${sticker.id}" found.`,
        field: `stickers[${index}].id`,
        itemId: sticker.id,
      });
    } else {
      stickerIdSet.add(sticker.id);
    }
  });

  // 6. Centre IDs non-empty and unique
  const centerIdSet = new Set<string>();
  centers.forEach((center, index) => {
    if (!center.id || center.id.trim() === '') {
      issues.push({
        code: 'EMPTY_CENTER_ID',
        message: `Centre at index ${index} has an empty ID.`,
        field: `centers[${index}].id`,
        itemId: center.id,
      });
    } else if (centerIdSet.has(center.id)) {
      issues.push({
        code: 'DUPLICATE_CENTER_ID',
        message: `Duplicate centre ID "${center.id}" found.`,
        field: `centers[${index}].id`,
        itemId: center.id,
      });
    } else {
      centerIdSet.add(center.id);
    }
  });

  // 7. Sticker coordinates finite and in [0, 10]
  stickers.forEach((sticker, index) => {
    if (
      typeof sticker.warmth !== 'number' ||
      !Number.isFinite(sticker.warmth) ||
      sticker.warmth < 0 ||
      sticker.warmth > 10
    ) {
      issues.push({
        code: 'INVALID_STICKER_WARMTH',
        message: `Sticker "${sticker.id || index}" warmth must be a finite number between 0 and 10 (received ${sticker.warmth}).`,
        field: `stickers[${index}].warmth`,
        itemId: sticker.id,
      });
    }
    if (
      typeof sticker.sparkle !== 'number' ||
      !Number.isFinite(sticker.sparkle) ||
      sticker.sparkle < 0 ||
      sticker.sparkle > 10
    ) {
      issues.push({
        code: 'INVALID_STICKER_SPARKLE',
        message: `Sticker "${sticker.id || index}" sparkle must be a finite number between 0 and 10 (received ${sticker.sparkle}).`,
        field: `stickers[${index}].sparkle`,
        itemId: sticker.id,
      });
    }
  });

  // 8. Centre coordinates finite and in [0, 10]
  centers.forEach((center, index) => {
    if (
      typeof center.warmth !== 'number' ||
      !Number.isFinite(center.warmth) ||
      center.warmth < 0 ||
      center.warmth > 10
    ) {
      issues.push({
        code: 'INVALID_CENTER_WARMTH',
        message: `Centre "${center.id || index}" warmth must be a finite number between 0 and 10 (received ${center.warmth}).`,
        field: `centers[${index}].warmth`,
        itemId: center.id,
      });
    }
    if (
      typeof center.sparkle !== 'number' ||
      !Number.isFinite(center.sparkle) ||
      center.sparkle < 0 ||
      center.sparkle > 10
    ) {
      issues.push({
        code: 'INVALID_CENTER_SPARKLE',
        message: `Centre "${center.id || index}" sparkle must be a finite number between 0 and 10 (received ${center.sparkle}).`,
        field: `centers[${index}].sparkle`,
        itemId: center.id,
      });
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
  };
}
