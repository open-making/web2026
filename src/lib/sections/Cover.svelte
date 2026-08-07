<script lang="ts">
	import RansomLine from '$lib/components/RansomLine.svelte';
	import studentDatabase from '$lib/data/student-database.json';

	const names = Object.values(studentDatabase.students)
		.map((s) => s.name)
		.sort((a, b) => a.localeCompare(b));
</script>

<section id="cover" class="cover">
	<p class="edition font-hand">19 july – 12 august 2026 · mdes @ daiict</p>
	<h1 class="masthead">
		<RansomLine text="the web2026" />
		<RansomLine text="bulletin" />
	</h1>
	<p class="byline">ft. {names.join(', ')}</p>
</section>

<style>
	.cover {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--leading);
		min-height: 78svh;
		padding: calc(var(--leading) * 2) 1.25rem;
		text-align: center;
	}
	.edition {
		font-size: 1rem;
		letter-spacing: 0.03em;
		color: var(--color-pink);
	}
	.masthead {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
		align-items: center;
	}
	.byline {
		font-size: 1rem;
		max-width: 34rem;
		text-wrap: balance;
	}
</style>
