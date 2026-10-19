<script>
	import { STORY_TYPES, TYPE_META } from '$lib/content/types.js';

	let { value = $bindable('all') } = $props();

	const options = [
		{ id: 'all', label: 'All' },
		...STORY_TYPES.map((type) => ({ id: type, label: TYPE_META[type].label }))
	];
</script>

<div role="group" aria-label="Filter stories by type" class="flex flex-wrap gap-2">
	{#each options as option (option.id)}
		<button
			type="button"
			aria-pressed={value === option.id}
			onclick={() => (value = option.id)}
			class="min-h-11 rounded-full border border-ink/25 px-5 hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper">
			{option.label}
		</button>
	{/each}
</div>
