<script lang="ts">
	import { sections } from '$lib/data/section-titles';
	import TimeOfDay from '$lib/components/charts/TimeOfDay.svelte';
	import NoteLengths from '$lib/components/charts/NoteLengths.svelte';
	import SentimentArc from '$lib/components/charts/SentimentArc.svelte';
	import stats from '$lib/data/season-stats.json';
	import Tape from '$lib/components/Tape.svelte';
	import curated from '../../content/quotes.json';
	import { mulberry32, hashSeed } from '$lib/components/prng';

	const t = stats.totals;
	const days = stats.days.filter((d) => d.day > 0);
	const quotesByDay = new Map<number, typeof curated.quotes>();
	for (const q of curated.quotes) {
		if (!quotesByDay.has(q.day)) quotesByDay.set(q.day, []);
		quotesByDay.get(q.day)!.push(q);
	}

	const fmtDate = (iso: string) =>
		new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
	const shortTitle = (t: string) => t.replace(/^Day \d+:?\s*/i, '');
	const rand = (key: string) => mulberry32(hashSeed(key))();
	const tilt = (key: string, range = 2.4) => ((rand(key) * 2 - 1) * range).toFixed(2);
	const mood = (s: number | null) => {
		if (s === null) return '';
		if (s < 0.35) return 'rough';
		if (s > 0.75) return 'great';
		return 'fine';
	};
</script>

<section id="season" class="page">
	<h2 class="font-display text-3xl font-black misreg">
		{sections.notes.title} <span class="h2tag font-hand">{sections.notes.tag}</span>
	</h2>

	<p class="lede">
		{sections.notes.desc}
	</p>

	<ol class="timeline">
		{#each days as d, i}
			<li class="day" class:flip={i % 2 === 1} style="--tilt: {tilt('day' + d.day, 0.7)}deg">
				<header class="head">
					<p class="daynum font-display font-black {mood(d.sentiment)}">
						<span class="word font-hand">day</span>{d.day}
					</p>
					<h3 class="font-display font-bold">
						<a href={d.issueUrl}>{shortTitle(d.title)}</a>
					</h3>
					<p class="meta font-hand">
						{fmtDate(d.date)}<br />{d.noteCount} notes
					</p>
				</header>
				{#if quotesByDay.has(d.day)}
					<div class="quotes">
						{#each quotesByDay.get(d.day)! as q, qi}
							<blockquote
								class="scrap"
								style="--tilt: {tilt(q.text, 3)}deg; --dy: {(rand(q.text + 'y') * 1.2).toFixed(
									2
								)}rem; flex-basis: {(13 + rand(q.text + 'w') * 6).toFixed(1)}rem"
							>
								<Tape
									color={qi % 2 ? 'blue' : 'pink'}
									tilt="{tilt(q.text + 't', 8)}deg"
									style="left: {(10 + rand(q.text + 'x') * 55).toFixed(0)}%; top: -0.85rem"
								/>
								<p>{q.text.replace(/\*\*/g, '')}</p>
								<cite class="font-hand"><a href={q.commentUrl}>{q.author}</a></cite>
							</blockquote>
						{/each}
					</div>
				{/if}
			</li>
		{/each}
	</ol>

	<div class="arc-card scrap" style="--tilt: -0.6deg">
		<Tape tilt="-5deg" style="left: 8%; top: -0.8rem" />
		<Tape color="blue" tilt="4deg" style="right: 6%; top: -0.7rem" />
		<SentimentArc days={stats.days} />
	</div>

	<div class="charts">
		<figure class="chart scrap" style="--tilt: -0.8deg">
			<Tape tilt="-6deg" style="left: 40%; top: -0.8rem" />
			<h3 class="font-hand">a lot of sleepless nights posting these everyday</h3>
			<TimeOfDay
				hours={stats.hoursIST}
				annotation="{t.afterMidnight} of {t.notes} notes were posted after midnight"
			/>
		</figure>

		<figure class="chart scrap" style="--tilt: 0.9deg">
			<Tape color="blue" tilt="5deg" style="left: 38%; top: -0.8rem" />
			<h3 class="font-hand">some wrote essays, some wrote two lines</h3>
			<NoteLengths buckets={stats.lengthBuckets} />
		</figure>
	</div>
</section>

<style>
	.page {
		max-width: var(--page-max);
		margin-inline: auto;
		padding-inline: 1.25rem;
	}
	.lede {
		max-width: var(--measure);
		margin-top: var(--leading);
		font-size: 1.1rem;
		text-wrap: pretty;
	}
	.arc-card {
		position: relative;
		margin-top: calc(var(--leading) * 1.25);
		padding: 1.5rem 1.75rem 1rem;
	}

	/* ── the day-by-day clusters ── */
	.timeline {
		margin-top: calc(var(--leading) * 2.5);
		display: flex;
		flex-direction: column;
		gap: calc(var(--leading) * 2);
	}
	.day {
		display: grid;
		grid-template-columns: 12rem 1fr;
		gap: 1.75rem;
		align-items: start;
		transform: rotate(var(--tilt, 0deg));
	}
	.day.flip {
		grid-template-columns: 1fr 12rem;
	}
	.day.flip .head {
		order: 2;
		text-align: right;
	}
	.day.flip .quotes {
		order: 1;
		justify-content: flex-end;
	}
	.daynum {
		font-size: 4.5rem;
		line-height: 0.85;
		letter-spacing: -0.02em;
		color: var(--color-blue);
		text-shadow: 0.03em 0.03em 0 var(--color-pink);
	}
	.daynum.rough {
		color: var(--color-violet);
	}
	.daynum.great {
		color: var(--color-pink);
		text-shadow: 0.03em 0.03em 0 var(--color-blue);
	}
	.daynum .word {
		display: block;
		font-size: 1.1rem;
		letter-spacing: 0;
		color: var(--color-pink);
		text-shadow: none;
		margin-bottom: 0.1rem;
	}
	.daynum.great .word {
		color: var(--color-blue);
	}
	h3 {
		margin-top: 0.5rem;
		font-size: 1.55rem;
		line-height: 1.15;
		text-wrap: balance;
	}
	h3 a {
		text-decoration: none;
		color: var(--color-blue);
	}
	h3 a:hover {
		color: var(--color-pink);
	}
	.meta {
		margin-top: 0.35rem;
		font-size: 0.85rem;
		line-height: 1.5;
		opacity: 0.75;
	}
	.quotes {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 1.25rem 1.4rem;
		padding-top: 0.9rem;
	}
	blockquote {
		position: relative;
		flex: 1 1 15rem;
		max-width: 24rem;
		padding: 1rem 1.15rem 0.7rem;
		font-size: 0.95rem;
		line-height: 1.45;
		transform: rotate(var(--tilt, -1deg)) translateY(var(--dy, 0rem));
	}

	@media (max-width: 44rem) {
		.day,
		.day.flip {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}
		.day.flip .head {
			order: 0;
			text-align: left;
		}
		.day.flip .quotes {
			order: 0;
			justify-content: flex-start;
		}
	}
	blockquote p {
		quotes: '“' '”';
	}
	blockquote p::before {
		content: open-quote;
		color: var(--color-pink);
	}
	blockquote p::after {
		content: close-quote;
		color: var(--color-pink);
	}
	cite {
		display: block;
		margin-top: 0.4rem;
		font-style: normal;
		font-size: 0.85rem;
	}
	cite a {
		color: var(--color-pink);
		text-decoration: none;
	}
	cite a:hover {
		text-decoration: underline;
	}

	.charts {
		margin-top: calc(var(--leading) * 2);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
		gap: calc(var(--leading) * 1.5) 3rem;
	}
	.chart {
		position: relative;
		padding: 1.25rem 1.5rem;
	}
	.chart h3 {
		font-size: 1.05rem;
		color: var(--color-blue);
		margin-bottom: var(--leading);
	}
</style>
