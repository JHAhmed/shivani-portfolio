<script>
	/** @type {{ src: import('vite-imagetools').Picture, alt: string, caption?: string, tilt?: number, class?: string }} */
	let { src, alt, caption, tilt = 0, class: className = '' } = $props();
</script>

<figure class="paper bg-receipt p-2.5 pb-3 {className}" style:--tilt="{tilt}deg">
	<enhanced:img {src} {alt} sizes="256px" class="aspect-square w-full object-cover" />
	{#if caption}
		<figcaption class="mt-2 text-center font-hand text-2xl leading-none">{caption}</figcaption>
	{/if}
</figure>
