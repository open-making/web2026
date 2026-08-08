<script lang="ts">
	// One student's sentiment line across their notes, with their best and
	// roughest days called out by note title. D3 for the math, Svelte for the DOM.
	import { scaleLinear, line as d3line, curveMonotoneX } from 'd3';
	import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

	type Point = { day: number; sentiment: number; date: string | null; title: string | null };
	let { series }: { series: Point[] } = $props();

	let width = $state(340);
	const H = 110;
	const PAD = { top: 30, right: 16, bottom: 26, left: 16 };

	const lo = Math.min(...series.map((d) => d.sentiment)) - 0.1;
	const hi = Math.max(...series.map((d) => d.sentiment)) + 0.1;

	const x = $derived(
		scaleLinear()
			.domain([0, Math.max(series.length - 1, 1)])
			.range([PAD.left, width - PAD.right])
	);
	const y = scaleLinear().domain([lo, hi]).range([H - PAD.bottom, PAD.top]);

	const path = $derived(
		d3line<Point>()
			.x((_, i) => x(i))
			.y((d) => y(d.sentiment))
			.curve(curveMonotoneX)(series) ?? ''
	);

	const worst = series.reduce((m, d) => (d.sentiment < m.sentiment ? d : m), series[0]);
	const best = series.reduce((m, d) => (d.sentiment > m.sentiment ? d : m), series[0]);
	const label = (d: Point) =>
		d.title ? `“${d.title.replace(/^Day \d+:?\s*/i, '').toLowerCase()}”` : `day ${d.day}`;
	// keep annotation text inside the frame even when the point sits at an edge;
	// the margin scales with the title so long ones don't spill or collide
	const half = (t: string) => Math.max(58, Math.round(t.length * 3.6));
	const clampX = (v: number, m = 58) => Math.max(m, Math.min(width - m, v));
	const hiX = $derived(clampX(x(series.indexOf(best)), half(label(best))));
	const loX = $derived(clampX(x(series.indexOf(worst)), half(label(worst))));
	const loY = Math.min(y(worst.sentiment) + 20, H - 16);
	// the axis captions yield when the worst-day label lands on top of them
	const startAxisClear = $derived(loY < H - 22 || loX - half(label(worst)) > PAD.left + 56);
	const endAxisClear = $derived(loY < H - 22 || loX + half(label(worst)) < width - PAD.right - 64);
</script>

<figure class="spark" bind:clientWidth={width}>
	<svg
		viewBox="0 0 {width} {H}"
		role="img"
		aria-label="Sentiment across their notes: highest on {label(best)}, lowest on {label(worst)}"
	>
		<path d={path} />
		<circle cx={x(series.indexOf(worst))} cy={y(worst.sentiment)} r="4" class="lo" />
		<circle cx={x(series.indexOf(best))} cy={y(best.sentiment)} r="4" class="hi" />
		<text x={hiX} y={y(best.sentiment) - 12} class="note hi-note">
			{label(best)}
		</text>
		<text x={loX} y={loY} class="note lo-note">
			{label(worst)}
		</text>
		{#if startAxisClear}
			<text x={PAD.left} y={H - 4} class="axis">day {series[0].day}</text>
		{/if}
		{#if endAxisClear}
			<text x={width - PAD.right - 14} y={H - 4} class="axis end"
				>day {series[series.length - 1].day}</text
			>
			<g
				class="axis-arrow"
				transform="translate({width - PAD.right - 12}, {H - 14}) scale(0.5)"
				aria-hidden="true"
			>
				{#each ArrowRight01Icon as [, a]}
					<path
						d={a.d as string}
						fill="none"
						stroke-width={a.strokeWidth}
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				{/each}
			</g>
		{/if}
	</svg>
</figure>

<style>
	.spark {
		width: 100%;
		max-width: 26rem;
	}
	svg {
		width: 100%;
		height: auto;
		overflow: visible;
	}
	path {
		fill: none;
		stroke: var(--color-pink);
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		mix-blend-mode: multiply;
	}
	.lo {
		fill: var(--color-violet);
	}
	.hi {
		fill: var(--color-pink);
	}
	.note {
		font-family: var(--font-hand);
		font-size: 13px;
		text-anchor: middle;
	}
	.hi-note {
		fill: var(--color-pink);
	}
	.lo-note {
		fill: var(--color-violet);
	}
	.axis {
		font-family: var(--font-hand);
		font-size: 12px;
		fill: var(--color-blue);
		opacity: 0.8;
	}
	.axis.end {
		text-anchor: end;
	}
	.axis-arrow path {
		stroke: var(--color-blue);
		opacity: 0.8;
	}
</style>
