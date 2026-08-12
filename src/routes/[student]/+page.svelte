<script lang="ts">
	import { base } from '$app/paths';
	import { marked } from 'marked';
	import RansomLine from '$lib/components/RansomLine.svelte';
	import Tape from '$lib/components/Tape.svelte';
	import PrintImage from '$lib/components/PrintImage.svelte';
	import Sparkline from '$lib/components/charts/Sparkline.svelte';
	import { mulberry32, hashSeed } from '$lib/components/prng';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowUpRight01Icon,
		ArrowLeft01Icon,
		MultiplicationSignIcon
	} from '@hugeicons/core-free-icons';
	import manifest from '../../content/screenshots.json';
	import bohemianIndex from '$lib/assets/images/bohemian/index.json';
	import printIndex from '$lib/assets/images/print/index.json';
	import clockIndex from '$lib/assets/images/clocks/index.json';
	import finalIndex from '$lib/assets/images/final/index.json';

	const bohemianImages = import.meta.glob('$lib/assets/images/bohemian/processed/*.webp', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;
	const printImages = import.meta.glob('$lib/assets/images/print/processed/*.webp', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;
	const clockImages = import.meta.glob('$lib/assets/images/clocks/processed/*.webp', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;
	const finalImages = import.meta.glob('$lib/assets/images/final/processed/*.webp', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;

	let { data } = $props();
	const s = $derived(data.student);

	// their entries in the exercise archive, chronological: same manifests and
	// screenshots the front-page Archive and SevenSites sections use
	const exerciseGroups = [
		{
			key: 'bohemian',
			title: 'bohemian rhapsody, but make it ugly',
			caption: 'day 2: learn CSS by styling a song lyric as hideously as possible',
			entries: manifest.bohemian,
			index: bohemianIndex as Record<string, string>,
			images: bohemianImages
		},
		{
			key: 'print',
			title: 'fit to print',
			caption: 'day 4: typeset a fairy tale or a historical newspaper page',
			entries: manifest.print,
			index: printIndex as Record<string, string>,
			images: printImages
		},
		{
			key: 'clocks',
			title: 'the clocks',
			caption: 'day 6: sketch a way to measure time, then build it with an LLM as pair',
			entries: manifest.clocks,
			index: clockIndex as Record<string, string>,
			images: clockImages
		},
		{
			key: 'final',
			title: 'their corner of the web',
			caption: 'the final project: a personal site, built end to end',
			entries: manifest.final,
			index: finalIndex as Record<string, string>,
			images: finalImages
		}
	];
	const made = $derived(
		exerciseGroups
			.flatMap((g) => {
				const entry = g.entries.find((e) => e.slug === s.slug);
				if (!entry) return [];
				const file = g.index[entry.url];
				const img = file
					? Object.entries(g.images).find(([p]) => p.endsWith(file))?.[1]
					: undefined;
				return img ? [{ ...g, url: entry.url, img }] : [];
			})
			// the final project leads as the hero; the exercises follow
			.sort((a, b) => (a.key === 'final' ? -1 : b.key === 'final' ? 1 : 0))
	);

	// the commit log: everything they pushed during the course, oldest first
	type Commit = { message: string; repository: string };
	const commitDays = $derived(
		Object.entries(s.commitsByDate as Record<string, Commit[]>)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([date, commits]) => ({ date, commits: [...commits].reverse() }))
	);
	const totalCommits = $derived(commitDays.reduce((n, d) => n + d.commits.length, 0));
	const repoCount = $derived(
		new Set(commitDays.flatMap((d) => d.commits.map((c) => c.repository))).size
	);
	const subject = (m: string) => m.split('\n')[0];
	const commitDateFmt = new Intl.DateTimeFormat('en-GB', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	});

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
	<title>{s.name} · web2026 showcase</title>
</svelte:head>

<article class="insert">
	<p class="back font-hand">
		<a href="{base}/#contributors"
			><HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} /> web2026 showcase</a
		>
	</p>

	<header class="head">
		<h1><RansomLine text={s.name.toLowerCase()} size="clamp(2.2rem, 6.5vw, 4.2rem)" /></h1>
		<p class="stats font-hand">
			{s.devNotes.length} dev notes
		</p>
		{#if data.sentiment.length > 1}
			<div class="spark-row">
				<Sparkline series={data.sentiment} />
			</div>
		{/if}
	</header>

	{#if data.quotes.length > 0}
		<section class="said">
			<h2 class="font-display font-bold">dev quotes</h2>
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

	{#if made.length > 0}
		<section class="made">
			<h2 class="font-display font-bold">showcase</h2>
			<div class="made-grid">
				{#each made as m, i (m.key)}
					<figure class="tile scrap" class:hero={m.key === 'final'} style="--tilt: {tilt(m.url)}deg">
						<Tape
							color={i % 2 ? 'blue' : 'pink'}
							tilt="{tilt(m.url + 't', 8)}deg"
							style="left: {22 + (i % 3) * 18}%; top: -0.8rem"
						/>
						<PrintImage src={m.img} alt="{m.title} — {s.name}" href={m.url} />
						<figcaption>
							<a class="ex-title" href={m.url}
								>{m.title} <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={2} /></a
							>
							<span class="ex-caption font-hand">{m.caption}</span>
						</figcaption>
					</figure>
				{/each}
			</div>
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
		<h2 class="font-display font-bold">complete dev notes</h2>
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
					<p class="source font-hand">
							<a href={note.commentUrl}
								>on github <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={2} /></a
							>
						</p>
				</div>
			</details>
		{/each}
	</section>

	{#if commitDays.length > 0}
		<section class="commits">
			<h2 class="font-display font-bold"> commit log</h2>
			<p class="commits-lede font-hand">
				{totalCommits} commits across {repoCount} repos
			</p>
			<div class="receipt scrap" style="--tilt: 0.5deg">
				<Tape tilt="-4deg" style="left: 12%; top: -0.85rem" />
				<Tape color="blue" tilt="5deg" style="right: 10%; top: -0.85rem" />
				{#each commitDays as d (d.date)}
					<div class="cd">
						<h3 class="font-hand">
							{commitDateFmt.format(new Date(d.date + 'T00:00:00')).toLowerCase()}
							<span class="tally" aria-hidden="true"
								>{'|'.repeat(Math.min(d.commits.length, 24))}</span
							>
							<span class="count"
								><HugeiconsIcon icon={MultiplicationSignIcon} size={12} strokeWidth={2.5}
								/>{d.commits.length}</span
							>
						</h3>
						<ul>
							{#each d.commits as c, i (d.date + i)}
								<li>
									<span class="msg">{subject(c.message)}</span>
									<span class="repo font-hand">{c.repository}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</section>
	{/if}
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
	.back :global(svg),
	.ex-title :global(svg),
	.source :global(svg) {
		display: inline-block;
		vertical-align: -0.1em;
	}
	.count :global(svg) {
		display: inline-block;
		vertical-align: -0.05em;
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

	.toc {
		display: none;
		position: fixed;
		top: 50%;
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
		opacity: 0.75;
		transform: translateY(-50%);
		pointer-events: auto;
	}
	.toc.visible:hover {
		opacity: 1;
	}
	.toc a {
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
	.notes h2,
	.made h2,
	.commits h2 {
		font-size: 1.4rem;
	}

	.made {
		margin-top: calc(var(--leading) * 2);
	}
	.made-grid {
		margin-top: var(--leading);
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.75rem 1.5rem;
	}
	/* desktop: the final project is a full-width hero, the exercises sit two-up
	   beneath it. on mobile the single column keeps the hero first. */
	@media (min-width: 40rem) {
		.made-grid {
			grid-template-columns: 1fr 1fr;
		}
		.made-grid .hero {
			grid-column: 1 / -1;
		}
	}
	.tile {
		position: relative;
		padding: 0.55rem 0.55rem 0.5rem;
	}
	.ex-title {
		display: block;
		margin-top: 0.45rem;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 0.95rem;
		color: var(--color-blue);
		text-decoration: none;
	}
	.ex-title:hover {
		color: var(--color-pink);
	}
	.ex-caption {
		display: block;
		margin-top: 0.1rem;
		font-size: 0.8rem;
		color: var(--color-pink);
	}

	.commits {
		margin-top: calc(var(--leading) * 2);
	}
	.commits-lede {
		margin-top: 0.3rem;
		font-size: 0.9rem;
		color: var(--color-pink);
	}
	.receipt {
		position: relative;
		margin-top: var(--leading);
		margin-inline: auto;
		max-width: 36rem;
		padding: 1.4rem 1.5rem 1.6rem;
	}
	.cd + .cd {
		margin-top: 1rem;
		padding-top: 0.9rem;
		border-top: 1px dashed rgba(50, 85, 164, 0.35);
	}
	.cd h3 {
		display: flex;
		align-items: baseline;
		gap: 0.55rem;
		font-size: 0.9rem;
		color: var(--color-blue);
	}
	.tally {
		color: var(--color-pink);
		font-size: 0.8rem;
		letter-spacing: 2px;
		overflow: hidden;
		white-space: nowrap;
	}
	.count {
		margin-left: auto;
		color: var(--color-pink);
		font-size: 0.85rem;
	}
	.cd ul {
		list-style: none;
		margin: 0.45rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.cd li {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		font-size: 0.92rem;
		line-height: 1.35;
	}
	.msg {
		overflow-wrap: anywhere;
	}
	.repo {
		margin-left: auto;
		flex-shrink: 0;
		font-size: 0.72rem;
		color: var(--color-violet);
		opacity: 0.75;
		text-align: right;
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
