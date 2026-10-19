<script>
	import { picture } from '$lib/content/images.js';

	/** @type {{ image: { key: string, alt: string, caption: string | null, credit: string | null }, eager?: boolean }} */
	let { image, eager = false } = $props();
</script>

<figure class="my-10">
	<enhanced:img
		src={picture(image.key)}
		alt={image.alt}
		sizes="(min-width: 768px) 768px, 100vw"
		loading={eager ? 'eager' : 'lazy'}
		fetchpriority={eager ? 'high' : 'auto'}
		class="w-full rounded-sm" />
	{#if image.caption || image.credit}
		<figcaption class="mt-2 text-sm text-muted">
			{image.caption ?? ''}{#if image.caption && image.credit}
				·
			{/if}{#if image.credit}Photo: {image.credit}{/if}
		</figcaption>
	{/if}
</figure>
