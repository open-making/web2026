<script lang="ts">
	import { sections } from '$lib/data/section-titles';
	import stats from '$lib/data/season-stats.json';
	import PrintImage from '$lib/components/PrintImage.svelte';
	import Tape from '$lib/components/Tape.svelte';
	import index from '$lib/assets/images/open/index.json';
	import { mulberry32, hashSeed } from '$lib/components/prng';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

	const images = import.meta.glob('$lib/assets/images/open/processed/*.webp', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;

	const materials = [
		{ url: 'https://teaching.aman.bh/web2026', label: 'the course site' },
		{ url: 'https://teaching.aman.bh/web2026/day-1-the-small-web', label: 'day 1 · the small web' },
		{ url: 'https://teaching.aman.bh/web2026/assignments', label: 'the assignments' },
		{ url: 'https://teaching.aman.bh/web2026/library', label: 'the library' },
		{ url: 'https://github.com/open-making/web2026-dev-notes', label: 'the dev notes repo' }
	]
		.map((e) => {
			const file = (index as Record<string, string>)[e.url];
			const img = file ? Object.entries(images).find(([p]) => p.endsWith(file))?.[1] : undefined;
			return { ...e, img };
		})
		.filter((e) => e.img);

	const tilt = (key: string, range = 3) =>
		((mulberry32(hashSeed(key))() * 2 - 1) * range).toFixed(2);
</script>

<section id="colophon" class="back">
	<h2 class="font-display text-3xl font-black misreg">
		{sections.colophon.title} <span class="h2tag font-hand">{sections.colophon.tag}</span>
	</h2>
	<p class="lede">{sections.colophon.desc}</p>

	<div class="fan">
		{#each materials as m, i (m.url)}
			<a class="card scrap" href={m.url} style="--tilt: {tilt(m.url)}deg; z-index: {i + 1}">
				<Tape
					color={i % 2 ? 'blue' : 'pink'}
					tilt="{tilt(m.url + 't', 8)}deg"
					seedKey={m.url}
					style="left: {22 + ((i * 17) % 40)}%; top: -0.85rem"
				/>
				<PrintImage src={m.img!} alt={m.label} />
				<span class="caption font-hand"
					>{m.label} <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2} /></span
				>
			</a>
		{/each}
	</div>

	<div class="ctas">
		<a class="cta cta-blue font-display" href="https://teaching.aman.bh/web2026">
			browse the course site
		</a>
		<a class="cta cta-pink font-display" href="https://github.com/open-making/web2026-dev-notes">
			read the dev notes
		</a>
	</div>

	<dl class="colophon">
		<div>
			<dd>
				<a href="https://teaching.aman.bh/web2026"
					>Introduction to Making for the Web (web2026, DA-IICT)</a
				>
			</dd>
		</div>

		<div>
			<dt>facilitated by</dt>
			<dd>
				<a href="https://aman.bh">Aman Bhargava</a>
			</dd>
		</div>
	</dl>
</section>

<style>
	/* the back cover runs wider than the inner pages, like the wrap of the zine */
	.back {
		max-width: 76rem;
		margin-inline: auto;
		padding: calc(var(--leading) * 2) 1.25rem calc(var(--leading) * 3);
	}
	.lede {
		max-width: var(--measure);
		margin-top: var(--leading);
		font-size: 1.1rem;
	}

	/* the open materials, pasted down in an overlapping fan */
	.fan {
		margin-top: calc(var(--leading) * 1.75);
		display: flex;
		align-items: flex-start;
	}
	.card {
		position: relative;
		width: 17.5rem;
		flex-shrink: 1;
		min-width: 0;
		padding: 0.65rem 0.65rem 0.4rem;
		text-decoration: none;
		transition:
			transform 0.25s ease,
			z-index 0s;
	}
	.card + .card {
		margin-left: -3.25rem;
	}
	.card:nth-child(even) {
		margin-top: 1.4rem;
	}
	.card:hover,
	.card:focus-visible {
		z-index: 10 !important;
		transform: rotate(var(--tilt, 0deg)) translateY(-0.5rem);
	}
	.caption {
		display: block;
		padding-top: 0.4rem;
		font-size: 0.85rem;
		color: var(--color-violet);
	}
	.caption :global(svg) {
		display: inline-block;
		vertical-align: -0.12em;
	}
	.card:hover .caption {
		color: var(--color-pink);
	}

	.ctas {
		margin-top: calc(var(--leading) * 1.5);
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.cta {
		font-weight: 700;
		font-size: 1.05rem;
		padding: 0.45em 1.1em;
		border-radius: 10px;
		text-decoration: none;
		border: 2.5px solid transparent;
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}
	.cta-blue {
		background: var(--color-blue);
		color: var(--color-paper);
	}
	.cta-blue:hover {
		background: var(--color-violet);
	}
	.cta-pink {
		border-color: var(--color-pink);
		color: var(--color-pink);
	}
	.cta-pink:hover {
		background: var(--color-pink);
		color: var(--color-paper);
	}

	/* compact colophon: label–value pairs flowing on one or two lines */
	.colophon {
		margin-top: calc(var(--leading) * 2);
		padding-top: var(--leading);
		border-top: 1.5px dashed rgba(50, 24, 113, 0.25);
		display: flex;
		flex-wrap: wrap;
		column-gap: 0.75rem;
		row-gap: 0.4rem;
		font-size: 0.9rem;
	}
	.colophon > div {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
	}
	dt {
		font-family: var(--font-hand);
		font-size: 0.8rem;
		color: var(--color-pink);
		white-space: nowrap;
	}
	.colophon a {
		text-decoration-color: var(--color-pink);
	}

	@media (max-width: 44rem) {
		.fan {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 1.5rem 1rem;
		}
		.card + .card {
			margin-left: 0;
		}
		.card:nth-child(even) {
			margin-top: 0;
		}
		.card {
			width: auto;
		}
	}
</style>
