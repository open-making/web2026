<script lang="ts">
	// A line of text cut from paper scraps: every letter sits on its own ink or
	// paper rectangle with a torn edge, a small seeded tilt, bounce and size.
	// Clicking a scrap cuts it again from different paper.
	import { mulberry32, hashSeed } from './prng';

	let {
		text,
		size = 'clamp(2.4rem, 8.5vw, 5.8rem)'
	}: {
		text: string;
		/** font-size of the line (scraps scale with it) */
		size?: string;
	} = $props();

	// pre-authored torn edges — irregular enough to read as hand-cut, subtle
	// enough that the letterform stays whole
	const TEARS = [
		'polygon(3% 8%, 30% 2%, 71% 6%, 98% 0%, 100% 55%, 96% 94%, 60% 100%, 24% 96%, 0% 92%, 2% 40%)',
		'polygon(0% 4%, 38% 0%, 74% 5%, 100% 2%, 97% 48%, 100% 90%, 66% 97%, 30% 100%, 4% 95%, 3% 52%)',
		'polygon(2% 0%, 52% 5%, 96% 1%, 100% 38%, 96% 74%, 99% 96%, 55% 100%, 18% 95%, 0% 98%, 4% 45%)',
		'polygon(5% 6%, 28% 0%, 66% 4%, 100% 6%, 95% 42%, 100% 82%, 72% 100%, 34% 97%, 2% 100%, 0% 50%)',
		'polygon(0% 10%, 42% 3%, 80% 0%, 98% 8%, 100% 60%, 94% 100%, 58% 96%, 20% 100%, 3% 90%, 5% 48%)',
		'polygon(4% 2%, 46% 6%, 88% 0%, 100% 30%, 97% 68%, 100% 100%, 62% 95%, 26% 100%, 0% 94%, 2% 38%)'
	];

	// ink scraps carry a paper letter; paper scraps carry an ink letter
	const STYLES = ['ink-pink', 'ink-blue', 'ink-violet', 'paper-pink', 'paper-blue'];

	let bumps: Record<number, number> = $state({});

	function scrap(i: number) {
		const rnd = mulberry32(hashSeed(`${text}:${i}`) + (bumps[i] ?? 0) * 0x9e3779b1);
		const prev = i > 0 ? scrapStyle(i - 1) : -1;
		let style = Math.floor(rnd() * STYLES.length);
		if (style === prev) style = (style + 1) % STYLES.length;
		return {
			style: STYLES[style],
			tear: TEARS[Math.floor(rnd() * TEARS.length)],
			rot: (rnd() * 2 - 1) * 6.5,
			dy: (rnd() * 2 - 1) * 0.07,
			scale: 0.94 + rnd() * 0.16
		};
	}
	// stable style of the previous scrap (without its bump, good enough to avoid
	// two identical neighbours in the common case)
	function scrapStyle(i: number) {
		const rnd = mulberry32(hashSeed(`${text}:${i}`));
		return Math.floor(rnd() * STYLES.length);
	}

	const chars = [...text];
</script>

<span class="line" style="font-size: {size}">
	<span class="sr-only">{text}</span>
	{#each chars as ch, i}
		{#if ch === ' '}
			<span class="gap" aria-hidden="true"></span>
		{:else}
			{@const s = scrap(i)}
			<span
				class="scrap {s.style}"
				aria-hidden="true"
				style="--rot: {s.rot.toFixed(2)}deg; --dy: {s.dy.toFixed(3)}em; --scale: {s.scale.toFixed(
					3
				)}; --delay: {i * 55}ms; clip-path: {s.tear}"
				onclick={() => (bumps[i] = (bumps[i] ?? 0) + 1)}
			>
				{ch}
			</span>
		{/if}
	{/each}
</span>

<style>
	.line {
		display: inline-flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.06em;
		line-height: 1.15;
	}
	.gap {
		width: 0.34em;
	}
	.scrap {
		display: inline-block;
		font-family: var(--font-display);
		font-weight: 900;
		padding: 0.08em 0.14em 0.12em;
		transform: translateY(var(--dy)) rotate(var(--rot)) scale(var(--scale));
		cursor: pointer;
		user-select: none;
		transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.scrap:hover {
		transform: translateY(var(--dy)) rotate(var(--rot)) scale(calc(var(--scale) * 1.06));
	}
	.ink-pink {
		background: var(--color-pink);
		color: var(--color-paper);
	}
	.ink-blue {
		background: var(--color-blue);
		color: var(--color-paper);
	}
	.ink-violet {
		background: var(--color-violet);
		color: var(--color-paper);
	}
	.paper-pink {
		background: #fffdf6;
		color: var(--color-pink);
		box-shadow: 0 1px 4px rgba(50, 24, 113, 0.18);
	}
	.paper-blue {
		background: #fffdf6;
		color: var(--color-blue);
		box-shadow: 0 1px 4px rgba(50, 24, 113, 0.18);
	}

	@media (prefers-reduced-motion: no-preference) {
		.scrap {
			animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
			animation-delay: var(--delay);
		}
		@keyframes rise {
			from {
				opacity: 0;
				transform: translateY(0.45em) rotate(calc(var(--rot) * 1.7)) scale(calc(var(--scale) * 0.9));
			}
		}
	}
</style>
