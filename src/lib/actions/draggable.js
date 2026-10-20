/**
 * Make a decorative element draggable on desktop, with inertia, inside the nearest
 * [data-drag-bounds] ancestor. No-op on touch devices, with reduced motion, or when disabled.
 * GSAP is loaded lazily so pages without draggables never download it.
 * @param {HTMLElement} node
 * @param {{ enabled?: boolean }} [options]
 */
export function draggable(node, options = {}) {
	if (options.enabled === false) return;
	const allowed =
		// window.matchMedia('(pointer: fine)').matches &&
		!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!allowed) return;

	/** @type {{ kill: () => void } | undefined} */
	let instance;
	let destroyed = false;

	Promise.all([import('gsap'), import('gsap/Draggable'), import('gsap/InertiaPlugin')]).then(
		([{ gsap }, { Draggable }, { InertiaPlugin }]) => {
			if (destroyed) return;
			gsap.registerPlugin(Draggable, InertiaPlugin);
			const bounds = node.closest('[data-drag-bounds]');
			[instance] = Draggable.create(node, {
				type: 'x,y',
				bounds: bounds ?? undefined,
				inertia: true,
				edgeResistance: 0.85,
				dragClickables: true,
				zIndexBoost: true,
				// 2D transforms only: translate3d promotes the element to its own layer, which Chrome
				// rasterises flat and then rotates, blurring the tilted note's text.
				force3D: false,
				cursor: 'grab',
				activeCursor: 'grabbing'
			});
		}
	);

	return {
		destroy() {
			destroyed = true;
			instance?.kill();
		}
	};
}
