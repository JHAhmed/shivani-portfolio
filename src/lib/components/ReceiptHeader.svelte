<script>
	import { formatDate } from '$lib/format.js';

	/** @type {{ story: import('$lib/content/parse.js').Story }} */
	let { story } = $props();
</script>

<header
	class="mx-auto max-w-xl paper stamp-in px-6 pt-8 pb-12 font-mono text-sm text-food-ink edge-zigzag [--paper-color:var(--color-food)] sm:px-10"
	style:--tilt="-0.6deg">
	<p class="text-center tracking-[0.2em] uppercase">{story.publication ?? 'Shivani Illakiya'}</p>
	{#if story.venue}<p class="mt-1 text-center text-muted">{story.venue}</p>{/if}
	<p aria-hidden="true" class="my-5 overflow-hidden text-center whitespace-nowrap text-muted">
		- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	</p>
	<h1
		class="font-sans text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
		{story.title}
	</h1>
	<dl class="mt-6 space-y-1">
		<div class="flex justify-between gap-4">
			<dt>Date</dt>
			<dd><time datetime={story.date}>{formatDate(story.date)}</time></dd>
		</div>
		<div class="flex justify-between gap-4">
			<dt>Served by</dt>
			<dd>Shivani Illakiya</dd>
		</div>
		<div class="flex justify-between gap-4">
			<dt>Read time</dt>
			<dd>{story.readTime} min</dd>
		</div>
	</dl>
	<p
		class="mt-6 border-t border-dashed border-muted/40 pt-3 text-center tracking-[0.2em] uppercase">
		Thank you, visit again
	</p>
</header>
