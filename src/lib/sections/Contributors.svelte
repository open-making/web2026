<script lang="ts">
	import { base } from '$app/paths';
	import { sections } from '$lib/data/section-titles';
	import studentDatabase from '$lib/data/student-database.json';

	const students = Object.values(studentDatabase.students).sort((a, b) =>
		a.name.localeCompare(b.name)
	);

	const INKS = ['blue', 'pink', 'violet'];
	// seed so neighbours never match, then let hover re-roll
	let inks = $state(students.map((_, i) => i % INKS.length));
	const reroll = (i: number) => {
		const others = [0, 1, 2].filter(
			(k) => k !== inks[i] && k !== inks[i - 1] && k !== inks[i + 1]
		);
		inks[i] = others[Math.floor(Math.random() * others.length)] ?? (inks[i] + 1) % 3;
	};
</script>

<section id="contributors" class="page">
	<h2 class="font-display text-3xl font-black misreg">
		{sections.contributors.title} <span class="h2tag font-hand">{sections.contributors.tag}</span>
	</h2>
	<p class="lede">{sections.contributors.desc}</p>

	<div class="bar">
		{#each students as s, i}
			<a
				href="{base}/{s.slug}"
				class="tile ink-{INKS[inks[i]]}"
				onpointerenter={() => reroll(i)}
			>
				<span class="tile-name font-display">{s.name.toLowerCase()}</span>
				<span class="tile-meta font-hand">{s.devNotes.length} notes</span>
			</a>
		{/each}
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
	}
	.bar {
		margin-top: calc(var(--leading) * 1.25);
		display: flex;
		flex-wrap: wrap;
		border-radius: 14px;
		overflow: hidden;
	}
	.tile {
		flex: 1 1 9rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
		padding: 1.1rem 1.4rem 1rem;
		text-decoration: none;
		color: var(--color-paper);
		transition: background 0.4s ease;
	}
	.tile:hover .tile-name {
		transform: translateY(-2px);
	}
	.ink-blue {
		background: var(--color-blue);
	}
	.ink-pink {
		background: var(--color-pink);
	}
	.ink-violet {
		background: var(--color-violet);
	}
	.tile-name {
		font-weight: 700;
		font-size: 1.5rem;
		line-height: 1.1;
		transition: transform 0.25s ease;
	}
	.tile-meta {
		font-size: 0.8rem;
		opacity: 0.85;
	}
</style>
