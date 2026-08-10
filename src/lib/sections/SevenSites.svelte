<script lang="ts">
	import { base } from '$app/paths';
	import { sections } from '$lib/data/section-titles';
	import PrintImage from '$lib/components/PrintImage.svelte';
	import Tape from '$lib/components/Tape.svelte';
	import manifest from '../../content/screenshots.json';
	import index from '$lib/assets/images/final/index.json';
	import { mulberry32, hashSeed } from '$lib/components/prng';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

	const images = import.meta.glob('$lib/assets/images/final/processed/*.webp', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;

	const sites = manifest.final
		.map((e) => {
			const file = (index as Record<string, string>)[e.url];
			const img = file ? Object.entries(images).find(([p]) => p.endsWith(file))?.[1] : undefined;
			return { ...e, img };
		})
		.filter((e) => e.img);

	const tilt = (key: string, range = 1.6) =>
		((mulberry32(hashSeed(key))() * 2 - 1) * range).toFixed(2);
</script>

<section id="sites" class="page">
	<h2 class="font-display flex flex-col gap-2 justify-center items-center text-3xl font-black misreg">
		{sections.sites.title} <span class="h2tag font-hand">{sections.sites.tag}</span>
	</h2>
	<p class="lede">{sections.sites.desc}</p>

	<div class="wall">
		{#each sites as site, i}
			<article class="feature scrap" style="--tilt: {tilt(site.slug)}deg">
				<Tape
					color={i % 2 ? 'blue' : 'pink'}
					tilt="{tilt(site.slug + 't', 7)}deg"
					style="left: {16 + (i % 3) * 24}%; top: -0.9rem"
				/>
				<PrintImage src={site.img!} alt="{site.name}'s website" href={site.url} />
				<footer>
					<a class="name font-display" href="{base}/{site.slug}">{site.name}</a>
					<a class="visit font-hand" href={site.url}
					>visit <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2} /></a
				>
				</footer>
			</article>
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
	.wall {
		margin-top: calc(var(--leading) * 1.5);
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr));
		gap: 2.5rem 2rem;
	}
	.feature {
		position: relative;
		padding: 0.8rem 0.8rem 0.6rem;
	}
	footer {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		padding-top: 0.6rem;
	}
	.name {
		font-weight: 700;
		font-size: 1.15rem;
		color: var(--color-blue);
		text-decoration: none;
	}
	.name:hover {
		color: var(--color-pink);
	}
	.visit {
		font-size: 0.85rem;
		color: var(--color-pink);
		text-decoration: none;
	}
	.visit :global(svg) {
		display: inline-block;
		vertical-align: -0.12em;
	}
	.visit:hover {
		text-decoration: underline;
	}
	.stamp {
		margin-left: auto;
		font-weight: 700;
		font-size: 0.8rem;
		letter-spacing: 0.06em;
		color: var(--color-pink);
		border: 2px solid var(--color-pink);
		border-radius: 4px;
		padding: 0.05em 0.45em;
		transform: rotate(-6deg);
		text-transform: uppercase;
	}
</style>
