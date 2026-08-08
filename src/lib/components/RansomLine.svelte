<script lang="ts">
	import { mulberry32, hashSeed } from './prng';

	let {
		text,
		size = 'clamp(2.4rem, 8.5vw, 5.8rem)'
	}: {
		text: string;
		/** font-size of the line (scraps scale with it) */
		size?: string;
	} = $props();

	// ink scraps carry a paper letter; paper scraps carry an ink letter
	const STYLES = [
		{ bg: '#ff48b0', fg: 'var(--color-paper)' },
		{ bg: '#3255a4', fg: 'var(--color-paper)' },
		{ bg: '#321871', fg: 'var(--color-paper)' },
		{ bg: '#fffdf6', fg: 'var(--color-pink)' },
		{ bg: '#fffdf6', fg: 'var(--color-blue)' }
	];

	let bumps: Record<number, number> = $state({});

	function scrap(i: number) {
		const seedBase = hashSeed(`${text}:${i}`) + (bumps[i] ?? 0) * 0x9e3779b1;
		const rnd = mulberry32(seedBase);
		const prev = i > 0 ? scrapStyle(i - 1) : -1;
		let style = Math.floor(rnd() * STYLES.length);
		if (style === prev) style = (style + 1) % STYLES.length;
		return {
			...STYLES[style],
			seed: seedBase % 1000,
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
			{@const uid = `rl${s.seed}-${i}`}
			<span
				class="scrap"
				aria-hidden="true"
				style="--rot: {s.rot.toFixed(2)}deg; --dy: {s.dy.toFixed(3)}em; --scale: {s.scale.toFixed(
					3
				)}; --delay: {i * 55}ms; color: {s.fg}"
				onclick={() => (bumps[i] = (bumps[i] ?? 0) + 1)}
			>
				<!-- the torn paper piece behind the letter: displaced edges + grain,
				     shadow follows the tear (drop-shadow on the svg, not a box) -->
				<svg viewBox="0 0 100 100" preserveAspectRatio="none">
					<defs>
						<filter
							id="{uid}-tear"
							x="-18%"
							y="-18%"
							width="136%"
							height="136%"
							color-interpolation-filters="sRGB"
						>
							<feTurbulence
								type="fractalNoise"
								baseFrequency="0.05 0.07"
								numOctaves="3"
								seed={s.seed}
								result="noise"
							/>
							<feDisplacementMap in="SourceGraphic" in2="noise" scale="11" result="torn" />
							<feTurbulence
								type="fractalNoise"
								baseFrequency="0.7"
								numOctaves="2"
								seed={s.seed + 5}
								result="gn"
							/>
							<feColorMatrix
								in="gn"
								type="matrix"
								values="0 0 0 0 0.2  0 0 0 0 0.14  0 0 0 0 0.27  0 0 0 0.06 0"
								result="grain"
							/>
							<feComposite in="grain" in2="torn" operator="in" result="grainIn" />
							<feMerge result="paper">
								<feMergeNode in="torn" />
								<feMergeNode in="grainIn" />
							</feMerge>
							<!-- shadow lives inside the filter: a CSS drop-shadow on the svg
							     makes Chrome flatten it onto a white backdrop -->
							<feDropShadow
								in="paper"
								dx="0.6"
								dy="1.4"
								stdDeviation="1.4"
								flood-color="#321871"
								flood-opacity="0.3"
							/>
						</filter>
					</defs>
					<rect x="7" y="7" width="86" height="86" fill={s.bg} filter="url(#{uid}-tear)" />
				</svg>
				<span class="ch">{ch}</span>
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
		gap: 0.01em;
		line-height: 1.15;
	}
	.gap {
		width: 0.34em;
	}
	.scrap {
		position: relative;
		display: inline-block;
		font-family: var(--font-display);
		font-weight: 900;
		padding: 0.1em 0.16em 0.14em;
		transform: translateY(var(--dy)) rotate(var(--rot)) scale(var(--scale));
		cursor: pointer;
		user-select: none;
		transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.scrap:hover {
		transform: translateY(var(--dy)) rotate(var(--rot)) scale(calc(var(--scale) * 1.06));
	}
	.scrap svg {
		position: absolute;
		inset: -6%;
		width: 112%;
		height: 112%;
	}
	.ch {
		position: relative;
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
