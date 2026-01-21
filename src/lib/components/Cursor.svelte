<script>
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';
	import cursorSvg from '$lib/assets/cursor2.svg';
	import gsap from 'gsap';
	import DrawSVGPlugin from 'gsap/DrawSVGPlugin';
	import { quintInOut } from 'svelte/easing';
	import { cursorState } from '$lib/state.svelte';
	import { draw, scale as svelteScale } from 'svelte/transition';

	let { isActive } = $props();

	let normalCursor = $state(null);
	let customCursor = $state(null);

	let x = $state(0);
	let y = $state(0);
	let targetX = $state(0);
	let targetY = $state(0);

	let clickLines = $state(null);

	let scale = $state(0);
	let isMouseOut = $state(false);

	const isInteractiveElement = (el) => {
		if (!el) return false;

		// Check if element or any parent is interactive
		let current = el;
		while (current && current !== document.body) {
			const tagName = current.tagName?.toLowerCase();

			// Check common interactive elements
			if (
				tagName === 'a' ||
				tagName === 'button' ||
				tagName === 'input' ||
				tagName === 'select' ||
				tagName === 'textarea' ||
				current.getAttribute('role') === 'button' ||
				current.getAttribute('role') === 'link' ||
				current.hasAttribute('onclick') ||
				current.dataset.cursor === 'pointer'
			) {
				return true;
			}
			current = current.parentElement;
		}
		return false;
	};

	const moveCursor = (e) => {
		targetX = e.clientX;
		targetY = e.clientY;
		isMouseOut = false;

		// Detect if hovering over an interactive element
		cursorState.isPointer = isInteractiveElement(e.target);
	};

	const handleClick = () => {
		const clickX = targetX;
		const clickY = targetY;

		// position the wrapper
		clickLines.style.opacity = '1';
		clickLines.style.left = `${clickX - 36}px`;
		clickLines.style.top = `${clickY - 36}px`;
		clickLines.style.width = '32px';
		clickLines.style.height = '32px';

		// scope the elements so we don't hit global selectors
		const lines = clickLines.querySelectorAll('.st0');

		// stop any existing tweens on these elements
		gsap.killTweensOf(lines);

		// ensure they start from zero (clean state)
		gsap.set(lines, { drawSVG: '0' });

		// timeline: draw in, then erase, then cleanup
		const tl = gsap.timeline({
			onComplete: () => {
				clickLines.style.opacity = '0';
				// remove inline stroke-dash* so future animations start fresh
				gsap.set(lines, { clearProps: 'stroke-dasharray,stroke-dashoffset' });
			}
		});

		tl.to(lines, { duration: 0.2, drawSVG: '100%', ease: 'power2.out' }).to(
			lines,
			{
				duration: 0.2,
				drawSVG: '100% 100%',
				ease: 'power2.in'
			},
			'-=0.1'
		);
	};

	const handleMouseLeave = () => {
		isMouseOut = true;
	};

	$effect(() => {
		// Logic: Scale up to 1 if active and inside, otherwise scale to 0
		if (isActive && !isMouseOut) {
			// Small delay ensures the transition triggers from 0 -> 1
			setTimeout(() => (scale = 1), 10);
		} else {
			scale = 0;
		}
	});

	onMount(() => {

		gsap.registerPlugin(DrawSVGPlugin);

		const animate = () => {
			// Smooth movement
			x += targetX - x;
			y += targetY - y;
			requestAnimationFrame(animate);
		};
		animate();
	});
</script>

<svelte:document on:mouseleave={handleMouseLeave} />
<svelte:window on:click={handleClick} on:mousemove={moveCursor} />

<div
	bind:this={clickLines}
	class="pointer-events-none fixed top-0 left-0 z-[9998] rotate-[2deg] opacity-0">
	<svg
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		width="32px"
		height="32px"
		viewBox="0 0 32 32"
		style="overflow:visible;enable-background:new 0 0 32 32;"
		xml:space="preserve">
		<line class="st0" x1="19.3" y1="16.4" x2="10.8" y2="2.7" />
		<line class="st0" x1="13.1" y1="21.7" x2="1.5" y2="15.4" />
		<line class="st0" x1="27.6" y1="13.6" x2="27.7" y2="1.5" />
	</svg>

	<!-- <svg
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		width="32px"
		height="32px"
		viewBox="0 0 32 32"
		style="overflow:visible;enable-background:new 0 0 32 32;"
		xml:space="preserve">
		<line class="st0" x1="16.8" y1="17.4" x2="4.9" y2="5.5" />
		<line class="st0" x1="13.6" y1="29.9" x2="1.5" y2="29.9" />
		<line class="st0" x1="29.6" y1="14.2" x2="29.4" y2="1.5" />
	</svg> -->
</div>

<div
	class="pointer-events-none fixed top-0 left-0 z-[9999] transition-all duration-300 ease-out"
	style="transform: translate(calc({x}px - 50%), calc({y}px - 50%)) scale({scale}); display: block;">
	<div class="relative transition-all duration-300">
		<!-- <Icon icon="fluent:cursor-16-filled" class="size-8" /> -->
		<!-- <img src="{cursorSvg}" alt="Cursor Icon" class="size-8 mix-blend-difference border-8" /> -->

	
		<svg
		 	
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 128 128"
			class="size-8 mix-blend-difference transition-transform duration-200 {cursorState.isPointer
				? 'scale-125'
				: ''}"
			><path
				bind:this={normalCursor}
				class="cursor {cursorState.isPointer
					? 'cursor-pointer-state fill-gray-400 stroke-[7px]'
					: 'fill-secondary'}"
				d="M104.36,85.1l-37.83-.5a8.81,8.81,0,0,0-7.41,3.82l-22,32c-5.19,7.55-17,3.27-17.5-6.34L14.56,13.67c-.29-5.55,3.78-10,9.08-9.92a9.91,9.91,0,0,1,5.85,2.08L109.2,67.11C116.85,73,113.57,85.23,104.36,85.1Z" />
		</svg>

		<!-- {#if cursorState.customActive}
			<svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" class="size-8 mix-blend-difference transition-transform duration-200 {cursorState.isPointer
				? 'scale-125'
				: ''}"
				><path 
					bind:this={customCursor}
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					d="m1.5 9l16-6.535L14.7 17zm16-6.5l-11 10m0 0v5l3-3"
					stroke-width="1" /></svg>
		{/if} -->

		{#if cursorState.popupActive}
			<div
				transition:svelteScale={{ duration: 300, easing: quintInOut }}
				class="absolute top-6 left-2 w-40 rounded-full border-2 border-black bg-secondary px-4 py-2 text-center shadow-lg">
				<p class="font-medium text-black">{cursorState.message}</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.cursor {
		/* fill: #a2f442; */
		stroke: #000;
		stroke-miterlimit: 10;
		stroke-width: 6px;
		transition:
			fill 0.2s ease,
			stroke-width 0.2s ease;
	}

	.st0 {
		fill: none;
		stroke: #1b1b1b;
		stroke-width: 2px;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-miterlimit: 10;
	}
</style>
