<script lang="ts">
	// Washi tape as an SVG: the whole strip is run through a turbulence
	// displacement so the edges wobble and tear like real tape, a second noise
	// pass puts wrinkle streaks in the film, and the drop-shadow outside the
	// SVG follows the ragged silhouette instead of a rectangle.
	import { hashSeed } from './prng';

	let {
		color = 'pink',
		tilt = '-4deg',
		style = '',
		seedKey = 'tape'
	}: {
		color?: 'pink' | 'blue' | 'paper';
		tilt?: string;
		style?: string;
		/** vary this so neighbouring strips tear differently */
		seedKey?: string;
	} = $props();

	const seed = hashSeed(seedKey) % 1000;
	const uid = `tp${seed}-${color}`;
	const TINTS = {
		pink: { fill: '#ff48b0', opacity: 0.38 },
		blue: { fill: '#3255a4', opacity: 0.34 },
		paper: { fill: '#f2e9cf', opacity: 0.78 }
	};
	const t = TINTS[color];
</script>

<span class="tape" style="--tilt: {tilt}; {style}" aria-hidden="true">
	<svg viewBox="0 0 120 34" preserveAspectRatio="none">
		<defs>
			<filter id="{uid}-rough" x="-15%" y="-40%" width="130%" height="180%">
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.045 0.16"
					numOctaves="4"
					{seed}
					result="n"
				/>
				<feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
			</filter>
			<filter id="{uid}-wrinkle" x="0%" y="0%" width="100%" height="100%">
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.012 0.42"
					numOctaves="3"
					seed={seed + 7}
					result="n"
				/>
				<feColorMatrix
					in="n"
					type="matrix"
					values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.8 0.8 0.8 0 -1.05"
				/>
				<feComposite operator="in" in2="SourceGraphic" />
			</filter>
			<filter id="{uid}-grain" x="0%" y="0%" width="100%" height="100%">
				<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed + 13} result="n" />
				<feColorMatrix
					in="n"
					type="matrix"
					values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.25  0 0 0 0.05 0"
				/>
				<feComposite operator="in" in2="SourceGraphic" />
			</filter>
		</defs>
		<g filter="url(#{uid}-rough)">
			<!-- the film -->
			<rect x="7" y="5" width="106" height="24" fill={t.fill} opacity={t.opacity} />
			<!-- wrinkle streaks in the film -->
			<rect x="7" y="5" width="106" height="24" filter="url(#{uid}-wrinkle)" opacity="0.5" />
			<!-- fine grain -->
			<rect x="7" y="5" width="106" height="24" filter="url(#{uid}-grain)" />
			<!-- the ends double over slightly darker -->
			<rect x="7" y="5" width="4.5" height="24" fill={t.fill} opacity="0.28" />
			<rect x="108.5" y="5" width="4.5" height="24" fill={t.fill} opacity="0.28" />
			<!-- a hair of edge shadow along top and bottom of the film -->
			<rect x="7" y="5" width="106" height="1" fill="#321871" opacity="0.1" />
			<rect x="7" y="28" width="106" height="1" fill="#321871" opacity="0.14" />
		</g>
	</svg>
</span>

<style>
	.tape {
		position: absolute;
		width: 5.8rem;
		height: 1.7rem;
		transform: rotate(var(--tilt));
		pointer-events: none;
		filter: drop-shadow(0 1.5px 1.5px rgba(50, 24, 113, 0.22));
		mix-blend-mode: multiply;
	}
	svg {
		width: 100%;
		height: 100%;
		overflow: visible;
	}
</style>
