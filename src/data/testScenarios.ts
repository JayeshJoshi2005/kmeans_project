import { Collection } from '../types';

export const EMPTY_PANEL_COLLECTION: Collection = {
  k: 2,
  centers: [
    { id: 'c1', name: 'Active Panel', warmth: 1.0, sparkle: 1.0 },
    { id: 'c2', name: 'Distant Panel', warmth: 9.0, sparkle: 9.0 },
  ],
  stickers: [
    { id: 's1', name: 'Near Sticker A', warmth: 0.0, sparkle: 0.0 },
    { id: 's2', name: 'Near Sticker B', warmth: 1.0, sparkle: 0.0 },
  ],
};

export const INVALID_COORDINATE_COLLECTION: Collection = {
  k: 2,
  centers: [
    { id: 'c1', name: 'Panel A', warmth: 2.0, sparkle: 2.0 },
    { id: 'c2', name: 'Panel B', warmth: 8.0, sparkle: 8.0 },
  ],
  stickers: [
    { id: 's1', name: 'Out of Bounds Sticker', warmth: 11.5, sparkle: 5.0 },
    { id: 's2', name: 'Valid Sticker', warmth: 4.0, sparkle: 4.0 },
  ],
};

export const DUPLICATE_STICKER_ID_COLLECTION: Collection = {
  k: 2,
  centers: [
    { id: 'c1', name: 'Panel A', warmth: 2.0, sparkle: 2.0 },
    { id: 'c2', name: 'Panel B', warmth: 8.0, sparkle: 8.0 },
  ],
  stickers: [
    { id: 'dup1', name: 'Sticker 1', warmth: 1.0, sparkle: 1.0 },
    { id: 'dup1', name: 'Sticker 2', warmth: 3.0, sparkle: 3.0 },
  ],
};
