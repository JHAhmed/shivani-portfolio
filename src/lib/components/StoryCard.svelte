<script>
	import { picture } from '$lib/content/images.js';
	import { TYPE_META } from '$lib/content/types.js';
	import { formatMonthYear, splitRoute } from '$lib/format.js';

	/** @type {{ story: import('$lib/content/parse.js').StoryCardData, tilt?: number, level?: 2 | 3 }} */
	let { story, tilt = 0, level = 2 } = $props();

	let label = $derived(TYPE_META[story.type].label);
	let when = $derived(formatMonthYear(story.date));
	let route = $derived(story.type === 'travel' ? splitRoute(story.venue) : null);

	const containers = {
		food: 'edge-zigzag pb-3',
		culture: 'rounded-md bg-ticket text-ticket-ink',
		travel: 'rounded-xl bg-receipt'
	};
</script>

<a
	href="/stories/{story.slug}"
	aria-label="{story.title}, {label} story, {when}"
	class="block h-full paper"
	style:--tilt="{tilt}deg">
	<div class="flex h-full overflow-hidden {containers[story.type]}">
		<div class="flex min-w-0 flex-1 flex-col">
			<enhanced:img
				src={picture(story.cover)}
				alt=""
				sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
				class="aspect-[3/2] w-full object-cover" />
			<div class="flex flex-1 flex-col gap-2 p-5">
				{#if route}
					<p aria-hidden="true" class="flex items-center gap-2 font-mono text-xs text-muted">
						{route[0]}
						<span class="flex-1 border-t border-dashed border-muted/50"></span>✈<span
							class="flex-1 border-t border-dashed border-muted/50"></span>
						{route[1]}
					</p>
				{/if}
				<p class="font-mono text-xs tracking-wider uppercase">{label} · {when}</p>
				<svelte:element this={`h${level}`} class="text-xl leading-tight font-semibold">
					{story.title}
				</svelte:element>
				<p class="line-clamp-3 {story.type === 'culture' ? '' : 'text-muted'}">{story.dek}</p>
				{#if story.type === 'food'}
					<dl aria-hidden="true" class="mt-auto space-y-0.5 pt-3 font-mono text-xs text-muted">
						{#if story.venue}
							<div class="flex gap-2">
								<dt>Venue</dt>
								<dd class="flex-1 truncate text-right">{story.venue}</dd>
							</div>
						{/if}
						<div class="flex gap-2">
							<dt>Read time</dt>
							<dd class="flex-1 text-right">{story.readTime} min</dd>
						</div>
					</dl>
				{/if}
			</div>
		</div>
		{#if story.type === 'culture'}
			<div
				aria-hidden="true"
				class="flex w-10 shrink-0 items-center justify-center border-l-2 border-dashed border-ticket-ink/30">
				<span class="rotate-90 font-mono text-xs tracking-widest whitespace-nowrap opacity-50"
					>ADMIT ONE</span>
			</div>
		{/if}
	</div>
</a>
