<script lang="ts">
	// A vinyl sticker: white die-cut edge that wobbles like a real cut, ink fill
	// with print grain, a noise-broken sheen, and a shadow cast by the die-cut
	// shape itself.
	import { hashSeed } from './prng';

	let {
		color = 'pink',
		tilt = '6deg',
		style = '',
		seedKey = 'sticker',
		children
	}: {
		color?: 'pink' | 'blue' | 'violet';
		tilt?: string;
		style?: string;
		seedKey?: string;
		children?: import('svelte').Snippet;
	} = $props();

	const seed = hashSeed(seedKey) % 1000;
	const uid = `st${seed}-${color}`;
	const INKS = { pink: '#ff48b0', blue: '#3255a4', violet: '#321871' };
</script>

<span class="sticker" style="--tilt: {tilt}; {style}">
	<svg viewBox="0 0 120 120" aria-hidden="true">
		<defs>
			<filter id="{uid}-cut" x="-10%" y="-10%" width="120%" height="120%">
				<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" {seed} result="n" />
				<feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" />
			</filter>
			<filter id="{uid}-grain" x="0%" y="0%" width="100%" height="100%">
				<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={seed + 3} result="n" />
				<feColorMatrix
					in="n"
					type="matrix"
					values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.09 0"
				/>
				<feComposite operator="in" in2="SourceGraphic" />
			</filter>
			<filter id="{uid}-sheen" x="-20%" y="-20%" width="140%" height="140%">
				<feTurbulence type="fractalNoise" baseFrequency="0.05 0.18" numOctaves="2" seed={seed + 9} result="n" />
				<feDisplacementMap in="SourceGraphic" in2="n" scale="9" />
				<feGaussianBlur stdDeviation="1.2" />
			</filter>
		</defs>
		<g filter="url(#{uid}-cut)">
			<!-- white die-cut -->
			<circle cx="60" cy="60" r="57" fill="#fffdf6" />
			<!-- ink face -->
			<circle cx="60" cy="60" r="50" fill={INKS[color]} />
			<!-- print grain in the ink -->
			<circle cx="60" cy="60" r="50" filter="url(#{uid}-grain)" />
			<!-- ink pools slightly darker at the rim -->
			<circle cx="60" cy="60" r="49" fill="none" stroke="#321871" stroke-opacity="0.22" stroke-width="1.6" />
			<!-- a broken, displaced sheen instead of a smooth gradient -->
			<path
				d="M 26 44 A 40 40 0 0 1 56 15"
				fill="none"
				stroke="#ffffff"
				stroke-opacity="0.35"
				stroke-width="5"
				stroke-linecap="round"
				filter="url(#{uid}-sheen)"
			/>
		</g>
	</svg>
	<span class="label font-hand">
		{@render children?.()}
	</span>
</span>

<style>
	.sticker {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 7.5rem;
		aspect-ratio: 1;
		transform: rotate(var(--tilt));
		filter: drop-shadow(0 1px 1.5px rgba(50, 24, 113, 0.28))
			drop-shadow(0 4px 8px rgba(50, 24, 113, 0.16));
	}
	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.label {
		position: relative;
		text-align: center;
		color: var(--color-paper);
		font-size: 0.88rem;
		line-height: 1.15;
		padding: 1.4em;
		text-wrap: balance;
	}
</style>
