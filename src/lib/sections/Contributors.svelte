<script lang="ts">
	import studentDatabase from '$lib/data/student-database.json';

	const students = Object.values(studentDatabase.students).sort((a, b) =>
		a.name.localeCompare(b.name)
	);
</script>

<section id="contributors" class="page">
	<h2 class="font-display text-2xl font-bold">contributors</h2>
	<!-- becomes the word-tile strip -->
	<ul>
		{#each students as s}
			<li><a href="/{s.slug}">{s.name}</a></li>
		{/each}
	</ul>
</section>

<style>
	.page {
		max-width: var(--page-max);
		margin-inline: auto;
		padding-inline: 1.25rem;
	}
	ul {
		margin-top: var(--leading);
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	a {
		font-family: var(--font-display);
		font-weight: 700;
		color: var(--color-paper);
		background: var(--color-blue);
		padding: 0.2em 0.5em;
		text-decoration: none;
	}
	li:nth-child(3n) a {
		background: var(--color-pink);
	}
	li:nth-child(3n + 2) a {
		background: var(--color-violet);
	}
	a:hover {
		background: var(--color-pink);
	}
</style>
