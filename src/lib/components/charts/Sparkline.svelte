<script lang="ts">
	// One student's sentiment line across their notes, with their best and
	// roughest days called out by date. D3 for the math, Svelte for the DOM.
	import { scaleLinear, line as d3line, curveMonotoneX } from 'd3';

	type Point = { day: number; sentiment: number; date: string | null };
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
	const fmt = (d: Point) =>
		d.date
			? new Date(d.date + 'T00:00:00')
					.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
					.toLowerCase()
			: `day ${d.day}`;
	// keep annotation text inside the frame even when the point sits at an edge
	const clampX = (v: number, m = 58) => Math.max(m, Math.min(width - m, v));
</script>

<figure class="spark" bind:clientWidth={width}>
	<svg
		viewBox="0 0 {width} {H}"
		role="img"
		aria-label="Sentiment across their notes: best on {fmt(best)}, roughest on {fmt(worst)}"
	>
		<path d={path} />
		<circle cx={x(series.indexOf(worst))} cy={y(worst.sentiment)} r="4" class="lo" />
		<circle cx={x(series.indexOf(best))} cy={y(best.sentiment)} r="4" class="hi" />
		<text x={clampX(x(series.indexOf(best)))} y={y(best.sentiment) - 12} class="note hi-note">
			{fmt(best)}, their best day
		</text>
		<text x={clampX(x(series.indexOf(worst)))} y={y(worst.sentiment) + 20} class="note lo-note">
			{fmt(worst)}, the roughest
		</text>
		<text x={PAD.left} y={H - 4} class="axis">day {series[0].day}</text>
		<text x={width - PAD.right} y={H - 4} class="axis end">day {series[series.length - 1].day} →</text>
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
</style>
