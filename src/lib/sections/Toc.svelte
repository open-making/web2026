<script lang="ts">
	import { sections } from '$lib/data/section-titles';
	import Tape from '$lib/components/Tape.svelte';

	// each contents entry is a scrap pinned to the page — a small paste-up that
	// echoes the cover collage. tilt / tape / ink are fixed per slot so the board
	// looks identical on the server and after hydration.
	type Ink = 'pink' | 'blue' | 'violet';
	type Slot = { tilt: number; tape: 'pink' | 'blue' | 'paper'; ink: Ink };
	const slots: Slot[] = [
		{ tilt: -2.4, tape: 'pink', ink: 'blue' },
		{ tilt: 1.9, tape: 'blue', ink: 'pink' },
		{ tilt: -1.3, tape: 'paper', ink: 'violet' },
		{ tilt: 2.6, tape: 'pink', ink: 'blue' },
		{ tilt: -2.1, tape: 'blue', ink: 'pink' },
		{ tilt: 1.4, tape: 'paper', ink: 'violet' }
	];

	const entries = [
		{ href: '#sites', ...sections.sites },
		{ href: '#season', ...sections.notes },
		{ href: '#archive', ...sections.archive },
		{ href: '#columns', ...sections.columns },
		{ href: '#contributors', ...sections.contributors },
		{ href: '#awards', ...sections.awards }
	].map((e, i) => ({ ...e, ...slots[i], num: String(i + 1).padStart(2, '0') }));

	// the numeral is printed one ink off-register: a hair of the other ink shows
	const INK: Record<Ink, string> = {
		pink: 'var(--color-pink)',
		blue: 'var(--color-blue)',
		violet: 'var(--color-violet)'
	};
	const MISREG: Record<Ink, string> = {
		pink: 'var(--color-blue)',
		blue: 'var(--color-pink)',
		violet: 'var(--color-pink)'
	};
</script>

<section id="toc" class="toc">
	<h2 class="font-display text-2xl flex flex-col gap-2 justify-center items-center font-bold">
		{sections.toc.title} <span class="h2tag font-hand">{sections.toc.tag}</span>
	</h2>

	<ol>
		{#each entries as e, i (e.href)}
			<li>
				<a class="card scrap" href={e.href} style="--tilt: {e.tilt}deg">
					<Tape
						color={e.tape}
						tilt="{(-e.tilt * 1.5).toFixed(1)}deg"
						seedKey="toc-{i}"
						style="left: 24%; top: -0.75rem"
					/>
					<span
						class="folio font-display"
						style="color: {INK[e.ink]}; text-shadow: 0.045em 0.05em 0 {MISREG[e.ink]}"
						aria-hidden="true">{e.num}</span
					>
					<span class="text">
						<span class="title font-display">{e.title}</span>
						<span class="tag font-hand">{e.tag}</span>
					</span>
					<span class="go font-hand" aria-hidden="true">→</span>
				</a>
			</li>
		{/each}
	</ol>
</section>

<style>
	.toc {
		max-width: var(--page-max);
		margin-inline: auto;
		padding-inline: 1.25rem;
	}

	ol {
		margin-top: calc(var(--leading) * 1.5);
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: 1.75rem 1.4rem;
		list-style: none;
	}

	.card {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 0.15rem 0.95rem;
		min-height: 6.6rem;
		padding: 1.15rem 1.2rem 1.3rem;
		text-decoration: none;
		color: var(--color-blue);
		/* .scrap supplies the paper texture, contact shadow and rotate(var(--tilt)) */
		transition:
			transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1),
			box-shadow 0.28s ease;
	}

	.folio {
		font-size: clamp(2.5rem, 7vw, 3.3rem);
		font-weight: 900;
		line-height: 0.85;
		letter-spacing: -0.02em;
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}
	.title {
		font-size: 1.32rem;
		font-weight: 700;
		line-height: 1.08;
		text-wrap: balance;
		transition: color 0.2s ease;
	}
	.tag {
		font-size: 0.9rem;
		color: var(--color-pink);
	}

	.go {
		position: absolute;
		right: 0.9rem;
		bottom: 0.65rem;
		font-size: 1.1rem;
		color: var(--color-pink);
		opacity: 0;
		transform: translateX(-0.35rem);
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	/* lift and straighten the scrap, like a pinned card pulled forward to read */
	li:hover .card,
	.card:focus-visible {
		transform: rotate(0deg) scale(1.035);
		z-index: 5;
		box-shadow:
			0 2px 4px rgba(50, 24, 113, 0.18),
			0 12px 26px rgba(50, 24, 113, 0.16),
			0 20px 40px rgba(50, 24, 113, 0.1);
		outline: none;
	}
	li:hover .title,
	.card:focus-visible .title {
		color: var(--color-pink);
	}
	li:hover .go,
	.card:focus-visible .go {
		opacity: 1;
		transform: translateX(0);
	}

	/* break the grid baseline so the board reads pinned-by-hand, not typeset */
	@media (min-width: 48rem) {
		li:nth-child(3n - 1) {
			margin-top: 1.9rem;
		}
	}

	/* single column: keep the scraps, weave them left and right down the page */
	@media (max-width: 34rem) {
		ol {
			gap: 1.5rem;
		}
		li:nth-child(odd) {
			margin-right: 1.3rem;
		}
		li:nth-child(even) {
			margin-left: 1.3rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: none;
		}
		li:hover .card,
		.card:focus-visible {
			transform: rotate(var(--tilt)) scale(1.02);
		}
	}
</style>
