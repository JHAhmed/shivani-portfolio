<script>
	import { page } from '$app/state';
	import BaggageClaim from '$lib/components/BaggageClaim.svelte';
</script>

<BaggageClaim status={page.status} />
