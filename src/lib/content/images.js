// enhanced-img outputs AVIF, WebP and a JPG/PNG fallback. Without a `quality` directive, sharp's
// defaults apply (AVIF 50, which visibly smears photos). 80 applies to every format. Vite needs
// glob options as literals, so the same value also appears in the `?enhanced&quality=80` imports.
const pictures = import.meta.glob('/src/content/stories/*/*.{jpg,jpeg,png,webp}', {
	eager: true,
	import: 'default',
	query: { enhanced: true, quality: 80 }
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
