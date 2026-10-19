<script>
	import BaggageClaim from '$lib/components/BaggageClaim.svelte';
</script>

<!-- Prerendered to build/404.html, which static hosts serve for unknown URLs. -->
<BaggageClaim status={404} />
