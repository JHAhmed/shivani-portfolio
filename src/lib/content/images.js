const pictures = import.meta.glob('/src/content/stories/*/*.{jpg,jpeg,png,webp}', {
	eager: true,
	import: 'default',
	query: { enhanced: true }
});

/**
 * Look up the enhanced image for a story image key (e.g. "/src/content/stories/x/photo-1.jpg").
 * @param {string} key
 */
export function picture(key) {
	const pic = pictures[key];
	if (!pic) throw new Error(`Unknown story image: ${key}`);
	return /** @type {import('vite-imagetools').Picture} */ (pic);
}
