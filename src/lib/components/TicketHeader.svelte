<script>
	import { formatDate } from '$lib/format.js';

	/** @type {{ story: import('$lib/content/parse.js').Story }} */
	let { story } = $props();

	let serial = $derived(story.date.replaceAll('-', '').slice(2));
</script>

<header class="mx-auto max-w-2xl paper stamp-in rounded-lg" style:--tilt="0.6deg">
	<div class="flex overflow-hidden rounded-lg bg-culture text-culture-ink">
		<div class="flex-1 px-6 py-8 sm:px-10">
			<p class="font-mono text-xs tracking-[0.2em] uppercase">Admit one · Culture</p>
			<h1 class="mt-3 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
				{story.title}
			</h1>
			<dl class="mt-6 grid grid-cols-2 gap-4 font-mono text-sm sm:grid-cols-3">
				{#if story.venue}
					<div>
						<dt class="text-xs uppercase">Venue</dt>
						<dd>{story.venue}</dd>
					</div>
				{/if}
				<div>
					<dt class="text-xs uppercase">Date</dt>
					<dd><time datetime={story.date}>{formatDate(story.date)}</time></dd>
				</div>
				<div>
					<dt class="text-xs uppercase">Read time</dt>
					<dd>{story.readTime} min</dd>
				</div>
			</dl>
		</div>
		<div
			aria-hidden="true"
			class="flex w-14 shrink-0 items-center justify-center border-l-2 border-dashed border-culture-ink/30">
			<span class="rotate-90 font-mono text-xs tracking-widest whitespace-nowrap"
				>No. {serial}</span>
		</div>
	</div>
</header>
