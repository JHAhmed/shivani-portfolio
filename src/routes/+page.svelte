<script>
	import portrait from '$lib/assets/portrait.jpg?enhanced&quality=80';
	import Polaroid from '$lib/components/Polaroid.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import Signature from '$lib/components/Signature.svelte';
	import StickyNote from '$lib/components/StickyNote.svelte';
	import StoryCard from '$lib/components/StoryCard.svelte';
	import { TILTS } from '$lib/content/types.js';
	import { profile } from '$lib/data/profile.js';
	import { site } from '$lib/data/site.js';
	import { formatRange } from '$lib/format.js';
	import { personRefJsonLd } from '$lib/seo/jsonld.js';

	let { data } = $props();

	const recentRoles = profile.experience.slice(0, 3);
</script>

<Seo description={site.description} path="/" jsonLd={[personRefJsonLd(site, profile)]} />

<section class="grid items-center gap-12 pt-10 pb-16 md:grid-cols-[1.3fr_1fr] md:pt-20">
	<div>
		<h1 class="text-5xl font-semibold tracking-tight sm:text-6xl">{profile.name}</h1>
		<div class="mt-3"><Signature /></div>
		<p class="mt-5 max-w-xl text-2xl leading-snug text-balance sm:text-3xl">
			Food, travel and culture stories from Chennai.
		</p>
		<p class="mt-4 max-w-xl text-lg text-muted">
			{profile.headline} at <em>Indulge</em>, The New Indian Express.
		</p>
		<div class="mt-8 flex flex-wrap gap-3">
			<a
				href="/stories"
				class="inline-flex min-h-11 items-center rounded-full bg-ink px-6 font-semibold text-paper hover:bg-ink/85"
				>Read my stories</a>
			<a
				href="/resume"
				class="inline-flex min-h-11 items-center rounded-full border border-ink/25 px-6 font-semibold hover:border-ink"
				>View resume</a>
		</div>
	</div>

	<div data-drag-bounds class="relative mx-auto h-80 w-full max-w-sm">
		<Polaroid
			drag
			src={portrait}
			alt="Portrait of Shivani Illakiya"
			caption="that's me!"
			tilt={-5}
			class="absolute top-0 left-2 w-52" />
		<StickyNote drag tilt={4} class="absolute top-44 right-0 w-40"
			>{profile.highlights[0]}</StickyNote>
		<StickyNote drag tilt={-3} color="blue" class="absolute top-4 right-1 w-36"
			>{profile.highlights[1]}</StickyNote>
	</div>
</section>

<section class="py-12" aria-labelledby="featured-title">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<h2 id="featured-title" class="text-3xl font-semibold tracking-tight">Featured stories</h2>
		<a href="/stories" class="font-semibold underline underline-offset-4">All stories →</a>
	</div>
	<ul class="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.stories as story, i (story.slug)}
			<li><StoryCard {story} level={3} tilt={TILTS[i % TILTS.length]} /></li>
		{/each}
	</ul>
</section>

<section class="grid gap-12 py-12 md:grid-cols-2">
	<div>
		<h2 class="text-3xl font-semibold tracking-tight">About</h2>
		<p class="mt-4 text-lg leading-relaxed">{profile.bio[0]}</p>
		<a href="/about" class="mt-4 inline-block font-semibold underline underline-offset-4"
			>More about me →</a>
	</div>
	<div>
		<h2 class="text-3xl font-semibold tracking-tight">Experience</h2>
		<ol class="mt-4 divide-y divide-line">
			{#each recentRoles as role (role.org + role.start)}
				<li class="py-3">
					<p class="font-semibold">{role.org}</p>
					<p class="text-muted">{role.role} · {formatRange(role.start, role.end)}</p>
				</li>
			{/each}
		</ol>
		<a href="/resume" class="mt-4 inline-block font-semibold underline underline-offset-4"
			>Full resume →</a>
	</div>
</section>
