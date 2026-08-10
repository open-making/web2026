<script lang="ts">
	import { base } from '$app/paths';
	import { sections } from '$lib/data/section-titles';
	import { awards } from '$lib/data/awards';
	import rosettePink from '$lib/assets/images/awards/rosette-pink.webp';
	import rosettePearl from '$lib/assets/images/awards/rosette-pearl.webp';
	import { mulberry32, hashSeed } from '$lib/components/prng';

	const INKS = ['blue', 'pink', 'violet'] as const;
	const FLOWERS = [rosettePink, rosettePearl];
	const rand = (key: string) => mulberry32(hashSeed(key))();
	const tilt = (key: string, range = 2) => ((rand(key) * 2 - 1) * range).toFixed(2);
</script>

<section id="awards" class="page">
	<h2 class="font-display text-3xl font-black misreg">
		{sections.awards.title} <span class="h2tag font-hand">{sections.awards.tag}</span>
	</h2>
	<p class="lede">{sections.awards.desc}</p>

	<div class="board">
		<svg class="spark s1" viewBox="0 0 24 24" aria-hidden="true"
			><path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" /></svg
		>
		<svg class="spark s2" viewBox="0 0 24 24" aria-hidden="true"
			><path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" /></svg
		>

		{#each awards as a, i (a.id)}
			<article
				class="award ink-{INKS[i % INKS.length]}"
				style="--tilt: {tilt(a.id, 2.2)}deg; --dy: {(rand(a.id + 'y') * 1).toFixed(2)}rem"
			>
				<div class="medal">
					<img
						class="flower"
						src={FLOWERS[i % FLOWERS.length]}
						alt=""
						style="--ftilt: {tilt(a.id + 'f', 6)}deg"
						loading="lazy"
					/>
					<span class="tag scrap" style="--tilt: {tilt(a.id + 't', 5)}deg">
						<b class="num font-body">{a.stamp}</b>
						<span class="u font-hand">{a.unit}</span>
					</span>
				</div>
				<h3 class="title font-display font-black">{a.title}</h3>
				<p class="winner font-display font-bold">
					{#each a.winners as w, wi (w.slug)}<a href="{base}/{w.slug}">{w.name}</a>{#if wi < a.winners.length - 1}
							&amp;
						{/if}{/each}
				</p>
				<p class="blurb">{a.blurb}</p>
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
		text-wrap: pretty;
	}

	.board {
		position: relative;
		margin-top: calc(var(--leading) * 2);
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: calc(var(--leading) * 1.9) 2.2rem;
	}

	.award {
		flex: 0 1 15rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		transform: rotate(var(--tilt, 0deg)) translateY(var(--dy, 0rem));
	}
	.ink-blue {
		--ink: var(--color-blue);
	}
	.ink-pink {
		--ink: var(--color-pink);
	}
	.ink-violet {
		--ink: var(--color-violet);
	}

	.medal {
		position: relative;
		width: 11rem;
		margin-bottom: 0.7rem;
	}
	.flower {
		display: block;
		width: 100%;
		height: auto;
		mix-blend-mode: multiply;
		transform: rotate(var(--ftilt, 0deg));
		filter: drop-shadow(0 2px 4px rgba(50, 24, 113, 0.16))
			drop-shadow(0 8px 16px rgba(50, 24, 113, 0.12));
	}

	/* the score pinned to the rosette like a prize tag */
	.tag {
		position: absolute;
		bottom: -0.5rem;
		left: 50%;
		transform: translateX(-50%) rotate(var(--tilt, 0deg));
		display: inline-flex;
		align-items: baseline;
		gap: 0.3rem;
		padding: 0.15rem 0.7rem 0.2rem;
		white-space: nowrap;
	}
	.tag .num {
		font-weight: 700;
		font-size: 1.2rem;
		line-height: 1;
		letter-spacing: -0.01em;
		font-variant-numeric: tabular-nums;
		color: var(--ink);
	}
	.tag .u {
		font-size: 0.72rem;
		color: var(--color-blue);
		opacity: 0.8;
	}

	.title {
		font-size: 1.5rem;
		line-height: 1;
		color: var(--color-blue);
		text-shadow: 0.035em 0.035em 0 var(--color-pink);
	}
	.winner {
		margin-top: 0.35rem;
		font-size: 1.05rem;
	}
	.winner a {
		color: var(--ink);
		text-decoration: none;
		border-bottom: 2px solid transparent;
		transition: border-color 0.2s ease;
	}
	.winner a:hover {
		border-color: var(--ink);
	}
	.blurb {
		margin-top: 0.5rem;
		max-width: 15rem;
		font-size: 0.92rem;
		line-height: 1.4;
		color: var(--color-blue);
		text-wrap: pretty;
	}

	.spark {
		position: absolute;
		width: 1.4rem;
		fill: var(--color-blue);
		mix-blend-mode: multiply;
		opacity: 0.7;
		pointer-events: none;
	}
	.s1 {
		top: -1.6rem;
		left: 7%;
		transform: rotate(-12deg);
	}
	.s2 {
		top: 32%;
		right: 5%;
		width: 1rem;
		fill: var(--color-pink);
		transform: rotate(18deg);
	}

	@media (max-width: 30rem) {
		.spark {
			display: none;
		}
	}
</style>
