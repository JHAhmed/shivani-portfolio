<script>
	import BoardingPassHeader from '$lib/components/BoardingPassHeader.svelte';
	import Clipping from '$lib/components/Clipping.svelte';
	import Figure from '$lib/components/Figure.svelte';
	import ReceiptHeader from '$lib/components/ReceiptHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import TicketHeader from '$lib/components/TicketHeader.svelte';
	import { picture } from '$lib/content/images.js';
	import { profile } from '$lib/data/profile.js';
	import { site } from '$lib/data/site.js';
	import { absoluteUrl, articleJsonLd } from '$lib/seo/jsonld.js';

	let { data } = $props();

	const headers = { food: ReceiptHeader, culture: TicketHeader, travel: BoardingPassHeader };

	let story = $derived(data.story);
	let Header = $derived(headers[story.type]);
	let cover = $derived(picture(story.images[0].key).img.src);
	let source = $derived(story.publication ?? 'the original publication');
</script>

<Seo
	title={story.title}
	description={story.dek}
	path="/stories/{story.slug}"
	image={cover}
	type="article"
	robots={story.indexable ? 'index, follow' : 'noindex, follow'}
	jsonLd={[articleJsonLd(site, profile, story, absoluteUrl(site.url, cover))]} />

<article class="mx-auto max-w-3xl pt-12">
	<Header {story} />

	<p class="mt-12 text-xl leading-relaxed text-pretty sm:text-2xl">{story.dek}</p>
	{#if story.context}
		<p class="mt-6 border-l-4 border-note pl-4 text-muted italic">{story.context}</p>
	{/if}

	<Figure image={story.images[0]} eager />

	<div class="prose prose-lg max-w-none prose-headings:text-ink prose-p:text-ink prose-a:text-ink">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html story.html}
	</div>

	{#if story.sourceUrl && !story.fullText}
		<p class="mt-10 border border-line bg-receipt p-5">
			This is an excerpt.
			<a href={story.sourceUrl} class="font-semibold underline underline-offset-4"
				>Read the full story on {source} →</a>
		</p>
	{:else if story.sourceUrl}
		<p class="mt-10 text-muted">
			Originally published in <a href={story.sourceUrl} class="underline underline-offset-4"
				>{source}</a
			>.
		</p>
	{/if}

	{#each story.images.slice(1) as image (image.key)}
		<Figure {image} />
	{/each}

	{#if story.clipping}
		<Clipping key={story.clipping} title={story.title} />
	{/if}

	<p class="mt-14">
		<a href="/stories" class="font-semibold underline underline-offset-4">← All stories</a>
	</p>
</article>
