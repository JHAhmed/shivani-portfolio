<script>
	import { picture } from '$lib/content/images.js';

	/** @type {{ key: string, title: string }} */
	let { key, title } = $props();

	let pic = $derived(picture(key));
</script>

<figure class="my-14">
	<a
		href={pic.img.src}
		class="relative mx-auto block max-w-md paper bg-receipt p-3"
		style:--tilt="1.5deg">
		<span
			aria-hidden="true"
			class="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 bg-note/80"></span>
		<enhanced:img
			src={pic}
			alt="Print clipping of “{title}”"
			sizes="(min-width: 768px) 448px, 100vw"
			class="w-full" />
	</a>
	<figcaption class="mt-3 text-center text-sm text-muted">
		As it appeared in print. Select the clipping to view it full size.
	</figcaption>
</figure>
