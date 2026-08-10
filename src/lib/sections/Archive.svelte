<script lang="ts">
	import { base } from '$app/paths';
	import { sections } from '$lib/data/section-titles';
	import PrintImage from '$lib/components/PrintImage.svelte';
	import Tape from '$lib/components/Tape.svelte';
	import manifest from '../../content/screenshots.json';
	import clockIndex from '$lib/assets/images/clocks/index.json';
	import bohemianIndex from '$lib/assets/images/bohemian/index.json';
	import printIndex from '$lib/assets/images/print/index.json';
	import { mulberry32, hashSeed } from '$lib/components/prng';

	const clockImages = import.meta.glob('$lib/assets/images/clocks/processed/*.webp', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;
	const bohemianImages = import.meta.glob('$lib/assets/images/bohemian/processed/*.webp', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;
	const printImages = import.meta.glob('$lib/assets/images/print/processed/*.webp', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;

	const resolve = (
		entries: { slug: string; name: string; url: string }[],
		index: Record<string, string>,
		images: Record<string, string>
	) =>
		entries
			.map((e) => {
				const file = index[e.url];
				const img = file ? Object.entries(images).find(([p]) => p.endsWith(file))?.[1] : undefined;
				return { ...e, img };
			})
			.filter((e) => e.img);

	const strips = [
		{
			title: 'bohemian rhapsody, but make it ugly',
			caption: 'day 2: learn CSS by styling a song lyric as hideously as possible',
			items: resolve(manifest.bohemian, bohemianIndex, bohemianImages)
		},
		{
			title: 'fit to print',
			caption: 'day 4: typeset a fairy tale or a historical newspaper page',
			items: resolve(manifest.print, printIndex, printImages)
		},
		{
			title: 'the clocks',
			caption: 'day 6: sketch a way to measure time, then build it with an LLM as pair',
			items: resolve(manifest.clocks, clockIndex, clockImages)
		}
	];

	const tilt = (key: string, range = 2) => ((mulberry32(hashSeed(key))() * 2 - 1) * range).toFixed(2);
</script>

<section id="archive" class="page">
	<h2 class="font-display flex flex-col gap-2 justify-center items-center text-3xl font-black misreg">
		{sections.archive.title} <span class="h2tag font-hand">{sections.archive.tag}</span>
	</h2>
	<p class="lede">{sections.archive.desc}</p>

	{#each strips as strip}
		<div class="strip">
			<h3 class="font-display font-bold">{strip.title}</h3>
			<p class="caption font-hand">{strip.caption}</p>
			<div class="tiles">
				{#each strip.items as item, i}
					<figure class="tile scrap" style="--tilt: {tilt(strip.title + item.url)}deg">
						<Tape
							color={i % 2 ? 'blue' : 'pink'}
							tilt="{tilt(item.url, 8)}deg"
							style="left: {20 + (i % 3) * 18}%; top: -0.75rem"
						/>
						<PrintImage src={item.img!} alt="{item.name}'s {strip.title}" href={item.url} />
						<figcaption class="font-hand">
							<a href="{base}/{item.slug}">{item.name}</a>
						</figcaption>
					</figure>
				{/each}
			</div>
		</div>
	{/each}
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
	.strip {
		margin-top: calc(var(--leading) * 1.5);
	}
	h3 {
		font-size: 1.35rem;
		color: var(--color-blue);
	}
	.caption {
		font-size: 0.9rem;
		color: var(--color-pink);
		margin-top: 0.2rem;
	}
	.tiles {
		margin-top: var(--leading);
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
		gap: 1.75rem 1.5rem;
	}
	.tile {
		position: relative;
		padding: 0.55rem 0.55rem 0.35rem;
	}
	figcaption {
		padding-top: 0.4rem;
		font-size: 0.9rem;
	}
	figcaption a {
		color: var(--color-blue);
		text-decoration: none;
	}
	figcaption a:hover {
		color: var(--color-pink);
	}
</style>
