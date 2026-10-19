<script>
	import { draggable } from '$lib/actions/draggable.js';

	/** @type {{ src: import('vite-imagetools').Picture, alt: string, caption?: string, tilt?: number, drag?: boolean, class?: string }} */
	let { src, alt, caption, tilt = 0, drag = false, class: className = '' } = $props();
</script>

<figure
	use:draggable={{ enabled: drag }}
	class="paper bg-receipt p-2.5 pb-3 {className}"
	style:--tilt="{tilt}deg">
	<enhanced:img
		{src}
		{alt}
		sizes="256px"
		class="pointer-events-none aspect-square w-full object-cover" />
	{#if caption}
		<figcaption class="mt-2 text-center font-hand text-2xl leading-none">{caption}</figcaption>
	{/if}
</figure>
