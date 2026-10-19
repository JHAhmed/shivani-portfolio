<script>
	import { site } from '$lib/data/site.js';
	import { absoluteUrl, serializeJsonLd } from '$lib/seo/jsonld.js';

	/**
	 * @type {{
	 *   title?: string,
	 *   description: string,
	 *   path: string,
	 *   image?: string,
	 *   robots?: string,
	 *   type?: 'website' | 'article' | 'profile',
	 *   jsonLd?: object[]
	 * }}
	 */
	let {
		title,
		description,
		path,
		image = '/og.jpg',
		robots = 'index, follow',
		type = 'website',
		jsonLd = []
	} = $props();

	let fullTitle = $derived(title ? `${title} · ${site.name}` : site.title);
	let url = $derived(absoluteUrl(site.url, path));
	let imageUrl = $derived(absoluteUrl(site.url, image));
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta name="robots" content={robots} />
	<link rel="canonical" href={url} />
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={imageUrl} />
	<meta name="twitter:card" content="summary_large_image" />
	{#each jsonLd as data, i (i)}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<script type="application/ld+json">${serializeJsonLd(data)}</` + 'script>'}
	{/each}
</svelte:head>
