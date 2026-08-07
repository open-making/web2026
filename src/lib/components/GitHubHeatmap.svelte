<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let showOverlay = true;

	// Generate a year's worth of commit data
	const generateCommitData = () => {
		const weeks = 53;
		const daysPerWeek = 7;
		const data: number[][] = [];

		for (let week = 0; week < weeks; week++) {
			const weekData: number[] = [];
			for (let day = 0; day < daysPerWeek; day++) {
				// Create realistic commit patterns with some randomness
				const isWeekend = day === 0 || day === 6;
				const baseChance = isWeekend ? 0.1 : 0.3;
				const commits = Math.random() < baseChance ? Math.floor(Math.random() * 5) + 1 : 0;
				weekData.push(commits);
			}
			data.push(weekData);
		}
		return data;
	};

	let commitData = generateCommitData();
	let animatedCommits: Set<string> = new Set();
	let mounted = false;

	// Get commit level (0-4) based on number of commits
	const getCommitLevel = (commits: number): number => {
		if (commits === 0) return 0;
		if (commits <= 1) return 1;
		if (commits <= 2) return 2;
		if (commits <= 3) return 3;
		return 4;
	};

	// Start animating random commits
	const startAnimation = () => {
		const animateRandomCommit = () => {
			const week = Math.floor(Math.random() * commitData.length);
			const day = Math.floor(Math.random() * 7);
			const key = `${week}-${day}`;

			// Only animate commits that have activity
			if (commitData[week][day] > 0) {
				animatedCommits.add(key);
				animatedCommits = animatedCommits;

				// Remove animation after duration
				setTimeout(() => {
					animatedCommits.delete(key);
					animatedCommits = animatedCommits;
				}, 2000);
			}
		};

		// Start with immediate animation
		animateRandomCommit();

		// Continue animating every 300-800ms
		const scheduleNext = () => {
			setTimeout(
				() => {
					animateRandomCommit();
					scheduleNext();
				},
				Math.random() * 500 + 300
			);
		};
		scheduleNext();
	};

	onMount(() => {
		mounted = true;
		setTimeout(startAnimation, 1000);
	});
</script>

<section
	class="mx-auto max-w-6xl overflow-x-auto overflow-x-clip px-0 py-16 sm:px-6 sm:py-12 md:px-8 md:py-16"
>
	<div class="relative mx-auto px-4 sm:px-4 md:max-w-5xl md:px-8">
		{#if mounted}
			<div
				class="mx-auto grid min-w-max scale-110 -rotate-2 transform grid-cols-53 grid-rows-7 gap-1 opacity-90 sm:scale-100 sm:-rotate-1 sm:gap-1 md:scale-110"
				in:fly={{ y: 50, duration: 1000, delay: 800, easing: quintOut }}
			>
				{#each commitData as week, weekIndex}
					{#each week as commits, dayIndex}
						<div
							class="relative h-3 w-3 transition-all duration-300 sm:h-3 sm:w-3 md:h-4 md:w-4 md:rounded-xs"
							class:bg-gray-100={getCommitLevel(commits) === 0}
							class:border={getCommitLevel(commits) === 0}
							class:border-gray-300={getCommitLevel(commits) === 0}
							class:bg-green-900={getCommitLevel(commits) === 1}
							class:bg-green-700={getCommitLevel(commits) === 2}
							class:bg-green-500={getCommitLevel(commits) === 3}
							class:bg-green-300={getCommitLevel(commits) === 4}
							class:animate-pulse={animatedCommits.has(`${weekIndex}-${dayIndex}`)}
							class:scale-125={animatedCommits.has(`${weekIndex}-${dayIndex}`)}
							class:z-10={animatedCommits.has(`${weekIndex}-${dayIndex}`)}
							style="animation-delay: {(weekIndex + dayIndex) * 10}ms"
							in:scale={{
								duration: 600,
								delay: (weekIndex * 7 + dayIndex) * 2,
								start: 0,
								easing: quintOut
							}}
						/>
					{/each}
				{/each}
			</div>
		{/if}

		{#if showOverlay && mounted}
			<div
				class="border-opacity-10 absolute bottom-10 left-1/2 z-10 mx-2 mx-auto w-full max-w-xs -translate-x-1/2 transform rounded-sm border border-black bg-white px-3 py-3 text-center shadow-xl sm:mx-4 sm:max-w-lg sm:px-4 sm:py-4 md:mx-0 md:max-w-2xl md:px-6"
			>
				<p
					class="md:text-md text-opacity-90 text-justify text-sm leading-relaxed text-black sm:text-base"
					style="font-family: 'Atkinson Hyperlegible', sans-serif;"
				>
					At this point, since our projects (and ideas!) started getting bigger, we learnt new tools
					that could help us work better. Git, Github and Astro became parts of our toolkit.
				</p>
			</div>
		{/if}
	</div>
</section>

<style>
	/* Custom grid for GitHub heatmap - 53 columns for weeks */
	.grid-cols-53 {
		grid-template-columns: repeat(53, minmax(0, 1fr));
	}
</style>
