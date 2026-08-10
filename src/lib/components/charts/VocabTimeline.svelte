<script lang="ts">
	// The words the course taught, dated to the first note that used each one:
	// a little subway line where you watch the vocabulary arrive over the days.
	// D3 for the day scale; the terms link back to that day's dev-note thread.
	import { scaleLinear } from 'd3';

	type Term = { term: string; day: number; date: string; issueUrl: string };
	let { vocab }: { vocab: Term[] } = $props();

	// stack terms that first appeared on the same day
	const groups = (() => {
		const m = new Map<number, Term[]>();
		for (const v of vocab) {
			if (!m.has(v.day)) m.set(v.day, []);
			m.get(v.day)!.push(v);
		}
		return [...m.entries()].map(([day, terms]) => ({ day, terms })).sort((a, b) => a.day - b.day);
	})();
	const minDay = Math.min(...vocab.map((v) => v.day));
	const maxDay = Math.max(...vocab.map((v) => v.day));
	const maxStack = Math.max(...groups.map((g) => g.terms.length));

	const PAD = 30;
	const TERM_LH = 17;
	const TOP = 6;
	const lineY = TOP + maxStack * TERM_LH + 8;
	const H = lineY + 28;

	// fill the container, but never squish below a legible min — scroll instead.
	// the early days cluster tight (html→css→flexbox in one week), so the floor
	// is generous enough to keep those stacked labels from colliding.
	let cw = $state(760);
	const W = $derived(Math.max(cw, 760));
	const x = $derived(scaleLinear().domain([minDay, maxDay]).range([PAD, W - PAD]));
</script>

<figure class="vocab" bind:clientWidth={cw}>
	<div class="scroll">
		<svg
			width={W}
			height={H}
			viewBox="0 0 {W} {H}"
			role="img"
			aria-label="The first day each web term showed up in the dev notes"
		>
			<line x1={PAD} y1={lineY} x2={W - PAD} y2={lineY} class="rule" />
			{#each groups as g (g.day)}
				{@const cx = x(g.day)}
				<line x1={cx} y1={lineY} x2={cx} y2={lineY - g.terms.length * TERM_LH} class="stem" />
				{#each g.terms as t, i (t.term)}
					<a href={t.issueUrl}>
						<text x={cx} y={lineY - 8 - i * TERM_LH} font-size="13" class="term">{t.term}</text>
					</a>
				{/each}
				<circle {cx} cy={lineY} r="4" class="dot" />
				<text x={cx} y={lineY + 20} font-size="11" class="day">d{g.day}</text>
			{/each}
		</svg>
	</div>
</figure>

<style>
	.vocab {
		width: 100%;
	}
	.scroll {
		overflow-x: auto;
		overflow-y: hidden;
	}
	svg {
		display: block;
		overflow: visible;
	}
	.rule {
		stroke: var(--color-blue);
		stroke-width: 1.5;
		stroke-dasharray: 6 4;
		opacity: 0.5;
	}
	.stem {
		stroke: var(--color-blue);
		stroke-width: 1;
		opacity: 0.3;
	}
	.dot {
		fill: var(--color-pink);
	}
	.term {
		font-family: var(--font-hand);
		fill: var(--color-blue);
		text-anchor: middle;
	}
	a:hover .term {
		fill: var(--color-pink);
	}
	.day {
		font-family: var(--font-hand);
		fill: var(--color-pink);
		text-anchor: middle;
	}
</style>
