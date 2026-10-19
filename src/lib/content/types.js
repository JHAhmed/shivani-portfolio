export const STORY_TYPES = ['food', 'culture', 'travel'];

/** @type {Record<string, { label: string }>} */
export const TYPE_META = {
	food: { label: 'Food' },
	culture: { label: 'Culture' },
	travel: { label: 'Travel' }
};

/** Resting tilt (degrees) for cards, cycled by position so grids look hand-placed. */
export const TILTS = [-1.2, 0.8, -0.6, 1.1];
