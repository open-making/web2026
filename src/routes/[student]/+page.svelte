<script lang="ts">
	import { marked } from 'marked';
	let { data } = $props();
	const s = $derived(data.student);

	const totalWords = $derived(
		s.devNotes.reduce((sum: number, n: { wordCount: number }) => sum + n.wordCount, 0)
	);
</script>

<svelte:head>
	<title>{s.name} · the web2026 bulletin</title>
</svelte:head>

<article class="insert">
	<p class="back"><a href="/#contributors">← the web2026 bulletin</a></p>

	<h1 class="font-display misreg">{s.name}</h1>
	<p class="stats font-hand">
		{s.devNotes.length} dev notes · {totalWords.toLocaleString()} words
	</p>

	<section class="notes">
		<h2 class="font-display text-xl font-bold">dev notes</h2>
		{#each s.devNotes as note}
			<details>
				<summary>
					<span class="day">day {note.day}</span>
					<span class="title">{note.issueTitle.replace(/^Day \d+:\s*/i, '')}</span>
					<span class="meta font-hand">{note.wordCount} words</span>
				</summary>
				<div class="note-body">
					<!-- eslint-disable-next-line svelte/no-at-html-tags — trusted course content -->
					{@html marked(note.content)}
					<p class="source"><a href={note.commentUrl}>on github ↗</a></p>
				</div>
			</details>
		{/each}
	</section>
</article>

<style>
	.insert {
		max-width: var(--measure);
		margin-inline: auto;
		padding: calc(var(--leading) * 2) 1.25rem calc(var(--leading) * 4);
	}
	.back a {
		font-family: var(--font-hand);
		font-size: 0.9rem;
		text-decoration: none;
		color: var(--color-pink);
	}
	h1 {
		font-weight: 900;
		font-size: clamp(2.4rem, 7vw, 4.2rem);
		line-height: 1.05;
		margin-top: var(--leading);
	}
	.stats {
		color: var(--color-pink);
		margin-top: 0.5rem;
	}
	.notes {
		margin-top: calc(var(--leading) * 2);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	details {
		border: 2px solid var(--color-blue);
		padding: 0.6rem 0.9rem;
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
	.day {
		font-family: var(--font-hand);
		font-size: 0.85rem;
		color: var(--color-pink);
		min-width: 3.5rem;
	}
	.title {
		font-family: var(--font-display);
		font-weight: 700;
	}
	.meta {
		margin-left: auto;
		font-size: 0.8rem;
		opacity: 0.7;
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
		filter: url(#riso-duotone);
	}
	.source {
		font-family: var(--font-hand);
		font-size: 0.85rem;
	}
</style>
