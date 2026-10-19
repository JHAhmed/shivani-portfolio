<script>
	import { formatDate, splitRoute } from '$lib/format.js';

	/** @type {{ story: import('$lib/content/parse.js').Story }} */
	let { story } = $props();

	let route = $derived(splitRoute(story.venue));
	// Repeated down the stub: the route codes (e.g. MASCBE), or a generic label without a route.
	let stubLines = $derived(Array(6).fill(route ? `${route[0]}${route[1]}` : 'TRAVEL'));
</script>

<header class="mx-auto max-w-2xl paper stamp-in rounded-2xl" style:--tilt="-0.5deg">
	<div class="flex overflow-hidden rounded-2xl bg-receipt">
		<div class="flex-1 px-6 py-8 sm:px-10">
			<p class="font-mono text-xs tracking-[0.2em] text-muted uppercase">Boarding pass · Travel</p>
			{#if route}
				<p class="sr-only">Route: {route[0]} to {route[1]}</p>
				<div aria-hidden="true" class="mt-4 flex items-center gap-3 font-mono text-2xl font-medium">
					<span>{route[0]}</span>
					<span class="flex-1 border-t-2 border-dashed border-line"></span>
					<span class="text-muted">✈</span>
					<span class="flex-1 border-t-2 border-dashed border-line"></span>
					<span>{route[1]}</span>
				</div>
			{/if}
			<h1 class="mt-4 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
				{story.title}
			</h1>
			<dl class="mt-6 grid grid-cols-2 gap-4 font-mono text-sm sm:grid-cols-3">
				<div>
					<dt class="text-xs text-muted uppercase">Passenger</dt>
					<dd>Shivani Illakiya</dd>
				</div>
				<div>
					<dt class="text-xs text-muted uppercase">Date</dt>
					<dd><time datetime={story.date}>{formatDate(story.date)}</time></dd>
				</div>
				{#if story.venue && !route}
					<div>
						<dt class="text-xs text-muted uppercase">Destination</dt>
						<dd>{story.venue}</dd>
					</div>
				{/if}
				<div>
					<dt class="text-xs text-muted uppercase">Read time</dt>
					<dd>{story.readTime} min</dd>
				</div>
			</dl>
		</div>
		<div
			aria-hidden="true"
			class="w-12 shrink-0 items-center justify-center border-l-2 border-dashed border-paper bg-travel bg-clip-content">
			<p class="rotate-90 font-semibold tracking-widest opacity-25">
				{#each stubLines as line, i (i)}
					{line}
				{/each}
			</p>
		</div>
	</div>
</header>
