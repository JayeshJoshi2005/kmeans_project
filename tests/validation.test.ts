import { describe, expect, it } from 'vitest';
import { MAIN_DEMO_COLLECTION } from '../src/data/demoData';
import {
  DUPLICATE_STICKER_ID_COLLECTION,
  EMPTY_PANEL_COLLECTION,
  INVALID_COORDINATE_COLLECTION,
} from '../src/data/testScenarios';
import { validateCollection } from '../src/engine/validation';

describe('validateCollection', () => {
  it('should accept valid MAIN_DEMO_COLLECTION', () => {
    const result = validateCollection(MAIN_DEMO_COLLECTION);
    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should accept valid EMPTY_PANEL_COLLECTION', () => {
    const result = validateCollection(EMPTY_PANEL_COLLECTION);
    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should reject invalid k values (< 2, > 4, non-integer)', () => {
    const invalidK1 = validateCollection({ ...MAIN_DEMO_COLLECTION, k: 1 });
    expect(invalidK1.isValid).toBe(false);
    expect(invalidK1.issues.some((i) => i.code === 'INVALID_K')).toBe(true);

    const invalidK5 = validateCollection({ ...MAIN_DEMO_COLLECTION, k: 5 });
    expect(invalidK5.isValid).toBe(false);

    const invalidKFloat = validateCollection({ ...MAIN_DEMO_COLLECTION, k: 2.5 });
    expect(invalidKFloat.isValid).toBe(false);
  });

  it('should reject when k exceeds sticker count', () => {
    const res = validateCollection({
      k: 3,
      centers: [
        { id: 'c1', name: 'P1', warmth: 1, sparkle: 1 },
        { id: 'c2', name: 'P2', warmth: 5, sparkle: 5 },
        { id: 'c3', name: 'P3', warmth: 8, sparkle: 8 },
      ],
      stickers: [{ id: 's1', name: 'Only One', warmth: 2, sparkle: 2 }],
    });
    expect(res.isValid).toBe(false);
    expect(res.issues.some((i) => i.code === 'K_EXCEEDS_STICKERS')).toBe(true);
  });

  it('should reject duplicate sticker IDs', () => {
    const result = validateCollection(DUPLICATE_STICKER_ID_COLLECTION);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.code === 'DUPLICATE_STICKER_ID')).toBe(true);
    expect(result.issues[0].itemId).toBe('dup1');
  });

  it('should reject out-of-bounds sticker coordinates', () => {
    const result = validateCollection(INVALID_COORDINATE_COLLECTION);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.code === 'INVALID_STICKER_WARMTH')).toBe(true);
    expect(result.issues[0].itemId).toBe('s1');
  });

  it('should reject non-finite coordinates', () => {
    const res = validateCollection({
      ...MAIN_DEMO_COLLECTION,
      stickers: [
        ...MAIN_DEMO_COLLECTION.stickers.slice(1),
        { id: 'nanSticker', name: 'NaN', warmth: NaN, sparkle: 5 },
      ],
    });
    expect(res.isValid).toBe(false);
    expect(res.issues.some((i) => i.code === 'INVALID_STICKER_WARMTH')).toBe(true);
  });
});
