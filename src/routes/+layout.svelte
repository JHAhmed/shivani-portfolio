<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';
	import Menu from '$components/Menu.svelte';
	import Cursor from '$components/Cursor.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Cursor isActive={true} />

<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
	<filter id="noise">
		<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
		<feComponentTransfer>
			<feFuncA type="linear" slope="1.5" />
		</feComponentTransfer>
		<feColorMatrix type="saturate" values="0" />
		<feBlend in="SourceGraphic" mode="multiply" />
	</filter>
</svg>

<!-- <Navbar /> -->

<!-- <div class="relative min-h-screen overflow-x-hidden bg-gray-50"> -->
	<div class="absolute inset-0 z-0" style="filter: url(#noise); opacity: 0.2;"></div>

	<div class="selection:bg-secondary">{@render children?.()}</div>
	<Menu />
<!-- </div> -->
