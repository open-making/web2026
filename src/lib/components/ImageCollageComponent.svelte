<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import Scroller from '$lib/components/Scroller.svelte';
	import HeaderSticker from '$lib/assets/header.webp';
	import devNotesData from '$lib/assets/images/web2025-dev-notes-issue-1/metadata.json';
	import studentDatabase from '$lib/data/student-database.json';

	// Import metaphor images
	import Garden1 from '$lib/assets/images-webp/garden-2.webp';
	import Garden2 from '$lib/assets/images-webp/garden-3.webp';
	import Shelf1 from '$lib/assets/images-webp/shelf-1.webp';
	import Shelf2 from '$lib/assets/images-webp/shelf-2.webp';
	import City1 from '$lib/assets/images-webp/city-1.webp';
	import City2 from '$lib/assets/images-webp/city-2.webp';
	import Same from '$lib/assets/images-webp/same.webp';
	import Artisanal from '$lib/assets/images-webp/artisinal.webp';

	const devNotesImages = import.meta.glob(
		'$lib/assets/images/web2025-dev-notes-issue-1/optimized/*.webp',
		{
			eager: true,
			import: 'default'
		}
	);

	function shuffleArray(array: any[]) {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	// Extract and sort student names
	const studentNames = Object.values(studentDatabase.students)
		.map((student) => {
			if (student.name) {
				// Extract first name and capitalize
				const firstName = student.name.split(' ')[0];
				return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
			}
			return student.username;
		})
		.filter((name) => name !== 'thedivtagguy') // Filter out instructor
		.sort();

	// Process the images data to get image sources
	const allImageSources = shuffleArray(
		devNotesData.images
			.filter((item) => item.filename)
			.map(
				(image) =>
					devNotesImages[
						`/src/lib/assets/images/web2025-dev-notes-issue-1/optimized/${image.filename}`
					]
			)
			.filter(Boolean)
	);

	// Preload first few images for instant visibility
	if (typeof window !== 'undefined') {
		allImageSources.slice(0, 8).forEach((src) => {
			const img = new Image();
			img.src = src;
		});
	}

	// Define the unified scrollytelling steps (metaphor + collage)
	const steps = [
		{
			text: 'The guiding metaphor for this module was of the web as a physical space. The internet today has become boring and more or less the same.',
			type: 'metaphor',
			image: Same,
			className: 'contain'
		},
		{
			text: 'If it were to be thought of as a patch of land to grow things...',
			type: 'metaphor',
			image: Garden1
		},
		{
			text: "...we'd much rather have it be the more organic, interesting, and messy garden.",
			type: 'metaphor',
			image: Garden2
		},
		{
			text: 'If it were a bookshelf...',
			type: 'metaphor',
			image: Shelf1
		},
		{
			text: "...we'd prefer one that wasn't the same old stuff we see everywhere.",
			type: 'metaphor',
			image: Shelf2
		},
		{
			text: 'If it were a city...',
			type: 'metaphor',
			image: City1
		},
		{
			text: "...we'd want it to be welcoming and vibrant, not a boring suburb of content.",
			type: 'metaphor',
			image: City2
		},
		{
			text: 'This was the point. Not for optimizing user "conversions" and sales, or thinking in terms of sterile "user-centricity" but a handmade space that reflected and accommodated us and our tastes.',
			type: 'metaphor',
			image: Artisanal,
			className: 'contain'
		},
		{
			text: 'To do this effectively, we needed to draw ourselves out of Behance, Dribbble, Pinterest and all of these places and look at a different kind of web, the early and the small web.',
			type: 'collage',
			images: allImageSources.slice(0, 4)
		},
		{
			text: 'We set out to be digital archaeologists...',
			type: 'collage',
			images: allImageSources.slice(0, 8)
		},
		{
			text: '...roaming the ruins of Geocities and exploring the Internet Archive...',
			type: 'collage',
			images: allImageSources.slice(0, 12)
		},
		{
			text: '...collecting interesting things we found along the way that we could learn from.',
			type: 'collage',
			images: allImageSources
		}
	];

	let scrollIndex = -1;
	let visibleImages: any[] = [];

	// Find where collage steps start
	const collageStartIndex = steps.findIndex((step) => step.type === 'collage');

	// Calculate how many images to show based on scroll progress
	$: {
		if (scrollIndex < collageStartIndex) {
			// During metaphor section - no collage images
			visibleImages = [];
		} else if (scrollIndex >= steps.length - 1) {
			// At final step - show all images
			visibleImages = allImageSources;
		} else {
			// During collage section - interpolate between steps
			const collageScrollIndex = scrollIndex - collageStartIndex;
			const currentStep = Math.floor(collageScrollIndex);
			const stepProgress = collageScrollIndex - currentStep;

			const collageSteps = steps.filter((step) => step.type === 'collage');
			const currentStepImages = collageSteps[currentStep]?.images?.length || 0;
			const nextStepImages =
				collageSteps[Math.min(currentStep + 1, collageSteps.length - 1)]?.images?.length ||
				currentStepImages;

			// Smoothly interpolate between current and next step image count
			const imageCount = Math.floor(
				currentStepImages + (nextStepImages - currentStepImages) * stepProgress
			);
			visibleImages = allImageSources.slice(0, Math.max(imageCount, currentStepImages));
		}
	}
</script>

<section class="scrolly-container bg-none">
	<header
		class="relative z-2 flex min-h-screen flex-col items-center justify-center px-8 text-center"
	>
		<img src={HeaderSticker} alt="hacker scenes" class="max-h-56 rotate-16 drop-shadow-sm" />
		<h1 class="mb-6 font-heading text-7xl font-bold text-foreground md:text-9xl">WEB2025</h1>
		<p class="max-w-4xl font-body leading-relaxed text-balance text-foreground md:text-xl">
			The M.DES (2024) students at DAIICT just wrapped up an intense crash course in web design and
			development. With little to no prior experience in HTML, CSS, Git, or Astro, we threw
			ourselves into the <a href="https://teaching.aman.bh/web2025">web2025</a> module and made it through
			pretty nicely! Here is a gallery of (almost) all our work made during this ambitious undertaking.
		</p>
		<p class="mt-6 max-w-sm border-t border-black/50 pt-6 font-body text-sm text-black/50">
			ft. {studentNames.join(', ')}
		</p>
	</header>
</section>

<!-- Unified Scrolly Section -->
<section class="scrolly-container bg-none">
	<!-- Fixed sticky background -->
	<div class="sticky-background bg-none">
		<!-- Metaphor images -->
		<div class="metaphor-image-container">
			{#each steps.filter((step) => step.type === 'metaphor') as step, index}
				{#if step.image}
					{@const isActive = Math.floor(scrollIndex) === index}
					{@const nextIsActive = Math.floor(scrollIndex) === index - 1}
					{@const opacity =
						index === 0 && scrollIndex <= 0 ? 1 : isActive ? 1 : nextIsActive ? scrollIndex % 1 : 0}
					<img
						src={step.image}
						alt="Web metaphor"
						class="metaphor-image"
						class:contain={step.className === 'contain'}
						style="opacity: {opacity};"
					/>
				{/if}
			{/each}
		</div>

		<!-- Collage images -->
		<div class="image-canvas">
			{#each allImageSources as imageSrc, index}
				{@const totalMaxImages = allImageSources.length}
				{@const maxCols = Math.min(6, Math.ceil(Math.sqrt(totalMaxImages * 1.2)))}
				{@const maxRows = Math.ceil(totalMaxImages / maxCols)}
				{@const baseX = (index % maxCols) * (100 / maxCols)}
				{@const baseY = Math.floor(index / maxCols) * (85 / maxRows)}
				{@const seed = index * 0.618033988749}
				{@const randomX = (((seed * 9999) % 1) - 0.5) * (80 / maxCols)}
				{@const randomY = (((seed * 7777) % 1) - 0.5) * (60 / maxRows)}
				{@const gridX = Math.max(0, Math.min(95, baseX + randomX))}
				{@const gridY = Math.max(2, Math.min(82, baseY + randomY))}
				{@const rotation = (((seed * 3333) % 1) - 0.5) * 15}
				{@const scaleVal = 0.85 + ((seed * 1111) % 1) * 0.25}
				{@const isVisible = index < visibleImages.length}
				{@const transitionDelay = ((seed * 5555) % 1) * 600}
				{@const transitionOffsetX = (((seed * 8888) % 1) - 0.5) * 200}
				{@const transitionOffsetY = (((seed * 6666) % 1) - 0.5) * 200}
				{#if isVisible}
					<img
						src={imageSrc}
						alt="Web design screenshot"
						class="collage-image"
						style="
							--rotation: {rotation}deg;
							--x: {gridX}%;
							--y: {gridY}%;
							--scale: {scaleVal};
						"
						in:fly={index === 0
							? { duration: 0, delay: 0 }
							: {
									x: transitionOffsetX,
									y: transitionOffsetY,
									duration: 800,
									delay: transitionDelay,
									easing: quintOut
								}}
						out:scale={{
							duration: 400,
							delay: ((seed * 2222) % 1) * 200,
							start: 0.7,
							easing: quintOut
						}}
					/>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Scrollable content -->
	<div class="scroll-content">
		<Scroller bind:value={scrollIndex} top={200} bottom={200}>
			{#each steps as step}
				<div class="narrative-step">
					<div class="text-block">
						<p>{step.text}</p>
					</div>
				</div>
			{/each}
		</Scroller>
		<div class="spacer-bottom"></div>
	</div>
</section>

<style>
	/* Metaphor image styles */
	.metaphor-image-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.metaphor-image {
		position: absolute;
		width: 70vw;
		max-width: 800px;
		height: 60vh;
		max-height: 600px;
		object-fit: cover;
		border-radius: 20px;
		box-shadow: rgba(0, 0, 0, 0.3) 0px 10px 40px;
		transition: opacity 0.6s ease-in-out;
		background-color: white;
		padding: 10px;
	}

	.metaphor-image.contain {
		object-fit: contain;
	}

	.scrolly-container {
		position: relative;
		width: 100vw;
		overflow-x: clip;
		margin-bottom: 10rem;
	}

	.sticky-background {
		position: sticky;
		top: 0;
		width: 100%;
		height: 100vh;
		z-index: 1;
		pointer-events: none;
	}

	.image-canvas {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.collage-image {
		position: absolute;
		width: clamp(250px, 30vw, 500px);
		height: clamp(188px, 22.5vw, 375px);
		object-fit: cover;
		background: white;
		color: #333;
		padding: 10px;
		border-radius: 20px;
		box-shadow:
			0 0 0 3px #000,
			/* Inner outline */ 0 0 0 6px #fff,
			/* Middle layer */ 0 0 0 9px #000; /* Outer outline */

		box-shadow: rgba(0, 0, 0, 0.25) 0px 6px 20px;
		left: var(--x);
		top: var(--y);
		transform: rotate(var(--rotation)) scale(var(--scale));
	}

	.scroll-content {
		position: relative;
		z-index: 2;
	}

	.spacer-bottom {
		height: 50vh;
	}

	.narrative-step {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding: 2rem;
	}

	.text-block {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: 1rem;
		border-radius: 6px;
		border: 1px solid var(--color-accent-foreground);
		box-shadow: rgba(0, 0, 0, 0.5) 0px 8px 32px;
		max-width: 400px;
		margin-right: 10%;
	}

	.text-block p {
		font-family: 'Atkinson Hyperlegible', sans-serif;
		font-size: 1.1rem;
		line-height: 1.6;
		color: var(--color-neutral);
		margin: 0;
	}

	@media (max-width: 768px) {
		.metaphor-image-container {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
		}

		.metaphor-image {
			width: 85vw;
			height: 50vh;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		.collage-image {
			width: clamp(180px, 25vw, 300px);
			height: clamp(135px, 18.75vw, 225px);
		}

		.narrative-step {
			justify-content: center;
			padding: 1rem;
		}

		.text-block {
			padding: 2rem 1.5rem;
			margin-right: 0;
			max-width: 350px;
		}

		.text-block p {
			font-size: 1rem;
		}
	}

	@media (max-width: 480px) {
		.metaphor-image {
			width: 90vw;
			height: 45vh;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		.collage-image {
			width: clamp(150px, 30vw, 200px);
			height: clamp(113px, 22.5vw, 150px);
			padding: 5px;
		}

		.text-block {
			padding: 1.5rem 1.25rem;
			max-width: 300px;
		}

		.text-block p {
			font-size: 0.95rem;
		}
	}
</style>
