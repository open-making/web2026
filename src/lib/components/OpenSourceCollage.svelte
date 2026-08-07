<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onMount } from 'svelte';

	// Import open source images
	import Open1 from '$lib/assets/images-webp/open-1.webp';
	import Open2 from '$lib/assets/images-webp/open-2.webp';
	import Open3 from '$lib/assets/images-webp/open-3.webp';
	import Open4 from '$lib/assets/images-webp/open-4.webp';

	export let imageIndices: number[] = [0, 1, 2, 3]; // Which images to show
	export let layout: 'desktop' | 'mobile-top' | 'mobile-bottom' | 'mobile-overflow' = 'desktop';

	const openImages = [Open1, Open2, Open3, Open4];

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	// Generate positioning based on layout
	function getImageStyle(index: number, arrayIndex: number) {
		if (layout === 'desktop') {
			// Full width desktop layout - much bigger images
			const positions = [
				{ x: 5, y: 10, rotation: -6, scale: 1.2 },
				{ x: 65, y: 5, rotation: 8, scale: 1.1 },
				{ x: 15, y: 55, rotation: 4, scale: 1.15 },
				{ x: 70, y: 60, rotation: -10, scale: 1.0 }
			];
			const pos = positions[index] || { x: 50, y: 50, rotation: 0, scale: 1 };
			return `
				--x: ${pos.x}%;
				--y: ${pos.y}%;
				--rotation: ${pos.rotation}deg;
				--scale: ${pos.scale};
			`;
		} else if (layout === 'mobile-top') {
			// Two images side by side at top
			const positions = [
				{ x: 10, y: 20, rotation: -8, scale: 0.9 },
				{ x: 60, y: 25, rotation: 12, scale: 0.85 }
			];
			const pos = positions[arrayIndex] || { x: 50, y: 50, rotation: 0, scale: 1 };
			return `
				--x: ${pos.x}%;
				--y: ${pos.y}%;
				--rotation: ${pos.rotation}deg;
				--scale: ${pos.scale};
			`;
		} else if (layout === 'mobile-bottom') {
			// Two images side by side at bottom
			const positions = [
				{ x: 15, y: 30, rotation: 6, scale: 0.85 },
				{ x: 65, y: 25, rotation: -15, scale: 0.9 }
			];
			const pos = positions[arrayIndex] || { x: 50, y: 50, rotation: 0, scale: 1 };
			return `
				--x: ${pos.x}%;
				--y: ${pos.y}%;
				--rotation: ${pos.rotation}deg;
				--scale: ${pos.scale};
			`;
		} else {
			// mobile-overflow
			// Large overflowing layout similar to desktop but optimized for mobile
			const positions = [
				{ x: -10, y: -5, rotation: -12, scale: 1.1 },
				{ x: 60, y: -10, rotation: 15, scale: 1.0 },
				{ x: 5, y: 65, rotation: 8, scale: 1.05 },
				{ x: 70, y: 75, rotation: -18, scale: 0.95 }
			];
			const pos = positions[index] || { x: 50, y: 50, rotation: 0, scale: 1 };
			return `
				--x: ${pos.x}%;
				--y: ${pos.y}%;
				--rotation: ${pos.rotation}deg;
				--scale: ${pos.scale};
			`;
		}
	}
</script>

<div
	class="collage-container"
	class:desktop={layout === 'desktop'}
	class:mobile={layout !== 'desktop'}
>
	{#if mounted}
		{#each imageIndices as imageIndex, arrayIndex}
			<img
				src={openImages[imageIndex]}
				alt="Open source teaching material"
				class="collage-image"
				style={getImageStyle(imageIndex, arrayIndex)}
				in:fly={{
					x: (arrayIndex % 2 === 0 ? -1 : 1) * 100,
					y: (arrayIndex < 2 ? -1 : 1) * 50,
					duration: 800,
					delay: arrayIndex * 200,
					easing: quintOut
				}}
				out:scale={{
					duration: 400,
					delay: arrayIndex * 100,
					start: 0.7,
					easing: quintOut
				}}
			/>
		{/each}
	{/if}
</div>

<style>
	.collage-container {
		position: relative;
		width: 100%;
		transform: translateY(-30%);
		/* overflow: hidden; */
		border-radius: 6px;
	}

	.collage-container.desktop {
		height: 500px;
	}

	.collage-container.mobile {
		height: 300px;
	}

	.collage-image {
		position: absolute;
		object-fit: cover;
		background: white;
		padding: 12px;
		border-radius: 16px;
		box-shadow:
			/* 0 0 0 3px #000, */
			0 0 0 6px #fff,
			0 0 0 8px #000,
			rgba(0, 0, 0, 0.4) 0px 12px 32px;
		left: var(--x);
		top: var(--y);
		transform: rotate(var(--rotation)) scale(var(--scale));
		transition: transform 0.3s ease;
	}

	/* Desktop - much bigger images */
	.desktop .collage-image {
		width: clamp(300px, 35vw, 600px);
		height: clamp(225px, 26.25vw, 450px);
	}

	/* Mobile - large images */
	.mobile .collage-image {
		width: clamp(200px, 35vw, 300px);
		height: clamp(150px, 26.25vw, 225px);
		padding: 10px;
	}

	.collage-image:hover {
		transform: rotate(var(--rotation)) scale(calc(var(--scale) * 1.05));
		z-index: 10;
	}

	@media (max-width: 780px) {
		.mobile .collage-image {
			width: clamp(160px, 32vw, 240px);
			height: clamp(120px, 24vw, 180px);
			padding: 8px;
		}
		.collage-container {
			transform: none;
		}
	}
</style>
