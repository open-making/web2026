<script lang="ts">
	// The mood of the cohort, day by day: one pink line through 14 days of notes,
	// scored in [-1, 1] by a sentiment model over each day's combined text.
	// D3 does the math (scales, line generator); Svelte draws the DOM.
	import { scaleLinear, line as d3line, curveMonotoneX } from 'd3';

	type Day = { day: number; title: string; sentiment: number | null; noteCount: number };
	let { days }: { days: Day[] } = $props();

	const scored = days.filter((d) => d.sentiment !== null);
	// sentiment scores here live in roughly [0, 1]; give the line breathing room
	const lo = Math.min(...scored.map((d) => d.sentiment!)) - 0.12;
	const hi = Math.max(...scored.map((d) => d.sentiment!)) + 0.12;

	let width = $state(920);
	const H = 260;
	const PAD = { top: 30, right: 24, bottom: 40, left: 24 };

	const x = $derived(
		scaleLinear()
			.domain([0, scored.length - 1])
			.range([PAD.left, width - PAD.right])
	);
	const y = scaleLinear()
		.domain([lo, hi])
		.range([H - PAD.bottom, PAD.top]);

	const path = $derived(
		d3line<Day>()
			.x((_, i) => x(i))
			.y((d) => y(d.sentiment!))
			.curve(curveMonotoneX)(scored) ?? ''
	);

	// label the local minima and maxima: the hard days and the good ones
	const dips = scored.filter((d, i) => {
		if (i === 0 || i === scored.length - 1) return false;
		return d.sentiment! < scored[i - 1].sentiment! && d.sentiment! < scored[i + 1].sentiment!;
	});
	const localMaxima = scored.filter((d, i) => {
		if (i === 0 || i === scored.length - 1) return false;
		return d.sentiment! > scored[i - 1].sentiment! && d.sentiment! > scored[i + 1].sentiment!;
	});
	const best = scored.reduce((m, d) => (d.sentiment! > m.sentiment! ? d : m), scored[0]);
	const peaks = localMaxima.includes(best) ? localMaxima : [best, ...localMaxima];
	const shortTitle = (t: string) => t.replace(/^Day \d+:\s*/i, '').toLowerCase();

	// on narrow screens, thin out the day ticks so they don't collide
	const tickEvery = $derived(width < 560 ? 2 : 1);
	const clampX = (v: number, m = 56) => Math.max(m, Math.min(width - m, v));
	// margin scales with the title so long labels stay inside the frame
	const half = (t: string) => Math.max(56, Math.round(shortTitle(t).length * 3.9));
</script>

<figure bind:clientWidth={width}>
	<h3 class="font-hand">how were we feeling throughout the course based on our notes? well it was a rollercoaster...</h3>

	<svg
		viewBox="0 0 {width} {H}"
		role="img"
		aria-label="Sentiment of the dev notes across the course days"
	>
		<path d={path} class="arc" />
		{#each scored as d, i}
			<circle cx={x(i)} cy={y(d.sentiment!)} r="5" class="dot" />
			{#if i % tickEvery === 0}
				<text x={x(i)} y={H - PAD.bottom + 24} class="tick">{d.day}</text>
			{/if}
		{/each}
		{#if width >= 480}
			{#each dips as d}
				<text x={clampX(x(scored.indexOf(d)), half(d.title))} y={y(d.sentiment!) + 26} class="note">
					“{shortTitle(d.title)}”
				</text>
			{/each}
			{#each peaks as d}
				{#if d !== best}
					<text
						x={clampX(x(scored.indexOf(d)), half(d.title))}
						y={y(d.sentiment!) - 14}
						class="note peak"
					>
						“{shortTitle(d.title)}”
					</text>
				{/if}
			{/each}
		{/if}
		<text x={clampX(x(scored.indexOf(best)), half(best.title))} y={y(best.sentiment!) - 14} class="note peak">
			“{shortTitle(best.title)}”
		</text>
		<text x={PAD.left} y={H - PAD.bottom + 24} class="axis-label">day</text>
	</svg>
</figure>

<style>
	figure {
		width: 100%;
	}
	svg {
		width: 100%;
		height: auto;
		overflow: visible;
	}
	.arc {
		fill: none;
		stroke: var(--color-pink);
		stroke-width: 4;
		stroke-linejoin: round;
		stroke-linecap: round;
		mix-blend-mode: multiply;
	}
	.dot {
		fill: var(--color-blue);
	}
	.tick,
	.axis-label {
		font-family: var(--font-hand);
		font-size: 13px;
		fill: var(--color-blue);
		text-anchor: middle;
	}
	.axis-label {
		text-anchor: end;
		transform: translateX(-14px);
	}
	.note {
		font-family: var(--font-hand);
		font-size: 14px;
		fill: var(--color-violet);
		text-anchor: middle;
	}
	.peak {
		fill: var(--color-pink);
	}
</style>
