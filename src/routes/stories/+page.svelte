<script>
	import Seo from '$lib/components/Seo.svelte';
	import StoryCard from '$lib/components/StoryCard.svelte';
	import TypeFilter from '$lib/components/TypeFilter.svelte';
	import { TILTS } from '$lib/content/types.js';
	import { site } from '$lib/data/site.js';

	let { data } = $props();

	let active = $state('all');
	let visible = $derived(
		active === 'all' ? data.stories : data.stories.filter((s) => s.type === active)
	);
</script>

<Seo
	title="Stories"
	description="Food, travel, and culture stories reported and written by Shivani Illakiya."
	path="/stories" />

<section class="pt-12">
	<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Stories</h1>
	<p class="mt-3 max-w-2xl text-lg text-muted">
		Food, travel, and culture stories I've reported and written, mostly from Chennai.
	</p>

	<div class="mt-8"><TypeFilter bind:value={active} /></div>

	<ul class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
		{#each visible as story, i (story.slug)}
			<li><StoryCard {story} tilt={TILTS[i % TILTS.length]} /></li>
		{/each}
	</ul>

	<p class="mt-14">
		<a href={site.indulgeAuthorUrl} class="font-semibold underline underline-offset-4"
			>See all my published work on Indulge</a>
	</p>
</section>
