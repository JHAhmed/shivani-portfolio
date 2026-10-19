<script>
	import '@fontsource-variable/urbanist';
	import '@fontsource-variable/caveat';
	import '@fontsource/ibm-plex-mono/400.css';
	import '@fontsource/ibm-plex-mono/500.css';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SiteHeader />
<main id="main" tabindex="-1" class="mx-auto max-w-6xl px-4 outline-none sm:px-6">
	{@render children()}
</main>
<SiteFooter />
