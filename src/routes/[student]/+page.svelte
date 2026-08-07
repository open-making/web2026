<script lang="ts">
	import { base } from '$app/paths';
	import { marked } from 'marked';
	import RansomLine from '$lib/components/RansomLine.svelte';
	import Tape from '$lib/components/Tape.svelte';
	import Sparkline from '$lib/components/charts/Sparkline.svelte';
	import { mulberry32, hashSeed } from '$lib/components/prng';

	let { data } = $props();
	const s = $derived(data.student);

	const totalWords = $derived(
		s.devNotes.reduce((sum: number, n: { wordCount: number }) => sum + n.wordCount, 0)
	);
	const hourFmt = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'Asia/Kolkata',
		hour: 'numeric',
		hour12: false
	});
	const timeFmt = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'Asia/Kolkata',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	});
	const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' });
	const afterMidnight = $derived(
		s.devNotes.filter((n: { date: { iso: string } }) => {
			const h = parseInt(hourFmt.format(new Date(n.date.iso)), 10) % 24;
			return h < 5;
		}).length
	);
	const tilt = (key: string, range = 2) =>
		((mulberry32(hashSeed(key))() * 2 - 1) * range).toFixed(2);
	const shortTitle = (t: string) => t.replace(/^Day \d+:?\s*/i, '');

	// the margin table of contents: shows once the header scrolls away,
	// tracks whichever note is nearest the top of the viewport
	let tocVisible = $state(false);
	let activeDay = $state<number | null>(null);
	$effect(() => {
		const notes = document.querySelectorAll<HTMLElement>('.notes details');
		const spy = new IntersectionObserver(
			(entries) => {
				for (const e of entries)
					if (e.isIntersecting) activeDay = Number((e.target as HTMLElement).dataset.day);
			},
			{ rootMargin: '-15% 0px -75% 0px' }
		);
		notes.forEach((n) => spy.observe(n));

		const head = document.querySelector('.head');
		const reveal = new IntersectionObserver(([e]) => (tocVisible = !e.isIntersecting));
		if (head) reveal.observe(head);

		return () => {
			spy.disconnect();
			reveal.disconnect();
		};
	});
</script>

<svelte:head>
	<title>{s.name} · the web2026 zine</title>
</svelte:head>

<article class="insert">
	<p class="back font-hand"><a href="{base}/#contributors">← the web2026 zine</a></p>

	<header class="head">
		<h1><RansomLine text={s.name.toLowerCase()} size="clamp(2.2rem, 6.5vw, 4.2rem)" /></h1>
		<p class="stats font-hand">
			{s.devNotes.length} dev notes · {totalWords.toLocaleString()} words
			{#if afterMidnight > 0}
				· {afterMidnight} posted after midnight{/if}
		</p>
		{#if data.sentiment.length > 1}
			<div class="spark-row">
				<span class="spark-label font-hand"
					>the sentiment model read their {data.sentiment.length} days of notes — the line rises on the
					better days</span
				>
				<Sparkline series={data.sentiment} />
			</div>
		{/if}
	</header>

	{#if data.quotes.length > 0}
		<section class="said">
			<h2 class="font-display font-bold">from their dev notes</h2>
			<div class="quote-wall">
				{#each data.quotes as q, i}
					<blockquote class="scrap" style="--tilt: {tilt(q.text, 3)}deg">
						<Tape
							color={i % 2 ? 'blue' : 'pink'}
							tilt="{tilt(q.text + 't', 8)}deg"
							style="left: {18 + (i % 3) * 20}%; top: -0.85rem"
						/>
						<p>{q.text.replace(/\*\*/g, '')}</p>
						<cite class="font-hand"><a href={q.commentUrl}>day {q.day}</a></cite>
					</blockquote>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.instructorNote}
		<section class="note-from scrap" style="--tilt: -0.8deg">
			<Tape tilt="-5deg" style="left: 10%; top: -0.85rem" />
			<h2 class="font-hand">a note from aman</h2>
			<!-- eslint-disable-next-line svelte/no-at-html-tags — instructor-authored markdown -->
			{@html marked(data.instructorNote)}
		</section>
	{/if}

	<nav class="toc font-hand" class:visible={tocVisible} aria-label="Their days">
		{#each s.devNotes as note (note.id)}
			<a href="#day-{note.day}" class:active={activeDay === note.day}>
				<span class="toc-day">d{note.day}</span>
				<span class="toc-title">{shortTitle(note.issueTitle).toLowerCase()}</span>
			</a>
		{/each}
	</nav>

	<section class="notes">
		<h2 class="font-display font-bold">the complete dev notes</h2>
		{#each s.devNotes as note, i}
			<details
				class="scrap"
				id="day-{note.day}"
				data-day={note.day}
				style="--tilt: {tilt(note.id, 1.1)}deg"
			>
				<summary>
					<span class="day font-hand">day {note.day}</span>
					<span class="title">{note.issueTitle.replace(/^Day \d+:?\s*/i, '')}</span>
					<span class="meta font-hand">
						{dateFmt.format(new Date(note.date.iso))}, {timeFmt.format(new Date(note.date.iso))}
					</span>
				</summary>
				<div class="note-body">
					<!-- eslint-disable-next-line svelte/no-at-html-tags — trusted course content -->
					{@html marked(note.content)}
					<p class="source font-hand"><a href={note.commentUrl}>on github ↗</a></p>
				</div>
			</details>
		{/each}
	</section>
</article>

<style>
	.insert {
		max-width: 46rem;
		margin-inline: auto;
		padding: calc(var(--leading) * 1.5) 1.25rem calc(var(--leading) * 4);
	}
	.back a {
		font-size: 0.95rem;
		text-decoration: none;
		color: var(--color-pink);
	}
	.head {
		margin-top: var(--leading);
	}
	.stats {
		color: var(--color-pink);
		margin-top: 0.75rem;
		font-size: 1rem;
	}
	.spark-row {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		margin-top: 0.75rem;
		max-width: 26rem;
	}
	.spark-label {
		font-size: 0.85rem;
		opacity: 0.75;
	}

	/* ── margin table of contents: desktop only, whisper-quiet until hovered ── */
	.toc {
		display: none;
		position: fixed;
		top: 50%;
		/* hug the left edge of the 46rem content column */
		left: calc(50% - 23rem - 14.5rem);
		transform: translateY(-50%) translateX(-0.5rem);
		width: 13rem;
		flex-direction: column;
		gap: 0.28rem;
		opacity: 0;
		transition:
			opacity 0.35s ease,
			transform 0.35s ease;
		pointer-events: none;
	}
	.toc.visible {
		opacity: 0.45;
		transform: translateY(-50%);
		pointer-events: auto;
	}
	.toc.visible:hover {
		opacity: 1;
	}
	.toc a {
		/* day numbers form a tidy rail along the column edge; titles rag left */
		display: flex;
		flex-direction: row-reverse;
		align-items: baseline;
		gap: 0.45rem;
		font-size: 0.72rem;
		line-height: 1.25;
		text-decoration: none;
		color: var(--color-blue);
	}
	.toc a:hover,
	.toc a.active {
		color: var(--color-pink);
	}
	.toc-day {
		min-width: 1.6rem;
		text-align: left;
		color: var(--color-pink);
	}
	.toc a.active .toc-title {
		text-decoration: underline;
		text-decoration-color: var(--color-pink);
	}
	.toc-title {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-align: right;
	}
	@media (min-width: 78rem) {
		.toc {
			display: flex;
		}
	}

	.said {
		margin-top: calc(var(--leading) * 2);
	}
	.said h2,
	.notes h2 {
		font-size: 1.4rem;
	}
	.quote-wall {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin-top: var(--leading);
	}
	blockquote {
		position: relative;
		padding: 1.1rem 1.25rem 0.8rem;
		max-width: 21rem;
		font-size: 1rem;
		line-height: 1.45;
	}
	blockquote p::before {
		content: '“';
		color: var(--color-pink);
	}
	blockquote p::after {
		content: '”';
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

	.note-from {
		position: relative;
		margin-top: calc(var(--leading) * 2);
		padding: 1.25rem 1.5rem;
	}
	.note-from h2 {
		font-size: 1.05rem;
		color: var(--color-pink);
		margin-bottom: 0.5rem;
	}

	.notes {
		margin-top: calc(var(--leading) * 2);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.notes h2 {
		margin-bottom: 0.25rem;
	}
	details {
		padding: 0.7rem 1rem;
	}
	summary {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		cursor: pointer;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	details[open] summary .title {
		color: var(--color-pink);
	}
	.day {
		font-size: 0.85rem;
		color: var(--color-pink);
		min-width: 3.6rem;
	}
	.title {
		font-family: var(--font-display);
		font-weight: 700;
	}
	.meta {
		margin-left: auto;
		font-size: 0.8rem;
		opacity: 0.7;
		text-align: right;
	}
	.note-body {
		margin-top: var(--leading);
		overflow-wrap: anywhere;
	}
	.note-body :global(p) {
		margin-bottom: 0.75rem;
	}
	.note-body :global(a) {
		text-decoration: underline;
		text-decoration-color: var(--color-pink);
	}
	.note-body :global(img) {
		max-width: 100%;
	}
	.source {
		font-size: 0.85rem;
	}
	.source a {
		color: var(--color-pink);
	}
</style>
