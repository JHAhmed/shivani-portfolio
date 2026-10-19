<script>
	import { draggable } from '$lib/actions/draggable.js';

	/** @type {{ tilt?: number, color?: 'yellow' | 'blue', drag?: boolean, class?: string, children: import('svelte').Snippet }} */
	let { tilt = 0, color = 'yellow', drag = false, class: className = '', children } = $props();

	const colors = { yellow: 'bg-note text-note-ink', blue: 'bg-sky-200 text-sky-950' };
</script>

<div
	use:draggable={{ enabled: drag }}
	class="paper p-4 {colors[color]} {className}"
	style:--tilt="{tilt}deg">
	<p class="font-hand text-2xl leading-tight">{@render children()}</p>
</div>
