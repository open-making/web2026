<script lang="ts">
	import { base } from '$app/paths';
	import { sections } from '$lib/data/section-titles';
	import { awards } from '$lib/data/awards';
	import Tape from '$lib/components/Tape.svelte';
	import { mulberry32, hashSeed } from '$lib/components/prng';

	import rosettePink from '$lib/assets/images/awards/rosette-pink.webp';
	import rosettePearl from '$lib/assets/images/awards/rosette-pearl.webp';
	import htPinkBlue from '$lib/assets/images/awards/ht-pink-blue.webp';
	import htPinkViolet from '$lib/assets/images/awards/ht-pink-violet.webp';
	import htPearlPink from '$lib/assets/images/awards/ht-pearl-pink.webp';
	import htPearlViolet from '$lib/assets/images/awards/ht-pearl-violet.webp';
	import htPearlBlue from '$lib/assets/images/awards/ht-pearl-blue.webp';

	const MEDAL: Record<string, { img: string; ink: 'blue' | 'pink' | 'violet' }> = {
		commits: { img: rosettePink, ink: 'pink' },
		words: { img: htPearlViolet, ink: 'violet' },
		push: { img: htPinkBlue, ink: 'blue' },
		emoji: { img: htPearlPink, ink: 'pink' },
		improved: { img: rosettePearl, ink: 'blue' },
		steadiest: { img: htPinkViolet, ink: 'violet' },
		songs: { img: htPearlBlue, ink: 'blue' }
	};

	const rand = (key: string) => mulberry32(hashSeed(key))();
	const tilt = (key: string, range = 2) => ((rand(key) * 2 - 1) * range).toFixed(2);
</script>

<section id="awards" class="page">
	<h2 class="font-display flex flex-col gap-2 justify-center items-center text-3xl font-black misreg">
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
			<article class="award scrap ink-{MEDAL[a.id].ink}" style="--tilt: {tilt(a.id, 1.8)}deg">
				<Tape
					color={i % 2 ? 'blue' : 'pink'}
					tilt="{tilt(a.id + 't', 7)}deg"
					seedKey={a.id}
					style="left: 50%; top: -0.85rem; transform: translateX(-50%) rotate({tilt(
						a.id + 't',
						7
					)}deg)"
				/>
				<div class="medal">
					<img
						class="flower"
						src={MEDAL[a.id].img}
						alt=""
						style="--ftilt: {tilt(a.id + 'f', 4)}deg"
						loading="lazy"
					/>
					{#if a.id === 'emoji'}
						<span class="face" aria-hidden="true">🤪</span>
					{/if}
					<span class="tag" style="--rot: {tilt(a.id + 't', 5)}deg">
						<b class="num font-body">{a.stamp}</b>
						<span class="u font-hand">{a.unit}</span>
					</span>
				</div>
				<h3 class="title font-display font-black">{a.title}</h3>
				<p class="winner font-display font-bold">
					{#each a.winners as w, wi (w.slug)}<a href="{base}/{w.slug}">{w.name}</a
						>{#if wi < a.winners.length - 1}
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
		gap: calc(var(--leading) * 1.6) 1.6rem;
	}

	/* a solid paper card (scrap gives the stock, grain, shadow and --tilt) */
	.award {
		flex: 0 1 14.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1.4rem 1.2rem 1.5rem;
		border-radius: 10px;
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
		width: 9.5rem;
		margin-bottom: 0.8rem;
	}
	.flower {
		display: block;
		width: 100%;
		height: auto;
		mix-blend-mode: multiply;
		transform: rotate(var(--ftilt, 0deg));
	}
	.face {
		position: absolute;
		top: 52%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 2.7rem;
		height: 2.7rem;
		display: grid;
		place-items: center;
		font-size: 1.9rem;
		line-height: 1;
		border-radius: 50%;
		background: radial-gradient(
			closest-side,
			rgba(250, 247, 239, 0.95) 55%,
			rgba(250, 247, 239, 0) 100%
		);
	}

	/* the score pinned to the rosette like a prize tag */
	.tag {
		position: absolute;
		bottom: -0.55rem;
		left: 50%;
		transform: translateX(-50%) rotate(var(--rot, 0deg));
		display: inline-flex;
		align-items: baseline;
		gap: 0.3rem;
		white-space: nowrap;
		padding: 0.16rem 0.7rem 0.2rem;
		border-radius: 999px;
		background: var(--ink);
		color: var(--color-paper);
		box-shadow: 0 2px 5px rgba(50, 24, 113, 0.22);
	}
	.tag .num {
		font-weight: 700;
		font-size: 1.05rem;
		line-height: 1;
		letter-spacing: -0.01em;
		font-variant-numeric: tabular-nums;
	}
	.tag .u {
		font-size: 0.72rem;
		opacity: 0.9;
	}

	.title {
		font-size: 1.45rem;
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
		font-size: 0.9rem;
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
		top: -1.7rem;
		left: 6%;
		transform: rotate(-12deg);
	}
	.s2 {
		top: 30%;
		right: 4%;
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
