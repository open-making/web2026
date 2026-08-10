<script lang="ts">
	import PosterFrame from '$lib/components/PosterFrame.svelte';
	import RansomLine from '$lib/components/RansomLine.svelte';
	import Tape from '$lib/components/Tape.svelte';

	let { data } = $props();
	const { target, orientation, qr } = data;
	const land = orientation === 'landscape';
	const words = target.cta.split(' ');
	const display = target.url.replace('https://', '').replace(/\/$/, '');
</script>

<PosterFrame {orientation} accent="violet" folio="scan me" grainSeed={target.url}>
	<div class="poster" class:land>
		<div class="copy">
			<p class="kicker font-hand">point your camera</p>
			<h1 class="cta">
				{#each words as w, i (w + i)}
					<RansomLine text={w} size={land ? '3.6rem' : '4.2rem'} />
				{/each}
			</h1>
			<p class="caption">{target.caption}</p>
		</div>

		<div class="qr">
			<div class="qrbox">
				<Tape color="pink" tilt="-6deg" seedKey={'t-' + target.url} style="left: 12%; top: -1rem" />
				<Tape
					color="blue"
					tilt="5deg"
					seedKey={'b-' + target.url}
					style="right: 12%; bottom: -1rem"
				/>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html qr}
			</div>
			<p class="url font-hand">{display}</p>
		</div>
	</div>
</PosterFrame>

<style>
	.poster {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		gap: var(--leading);
	}
	.kicker {
		font-size: 1.4rem;
		color: var(--color-pink);
		transform: rotate(-1.5deg);
	}
	.cta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3em;
		margin: 0.2em 0;
	}
	.caption {
		font-size: 1.6rem;
		color: var(--color-violet);
		max-width: 26ch;
		text-wrap: balance;
	}
	.qr {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.9rem;
	}
	.qrbox {
		position: relative;
		width: 78mm;
		height: 78mm;
		padding: 6mm;
		background: #fffcf4;
		box-shadow: 0 3px 14px rgba(50, 24, 113, 0.18);
	}
	.qrbox :global(svg) {
		display: block;
	}
	.url {
		font-size: 1.15rem;
		color: var(--color-blue);
		letter-spacing: 0.02em;
	}

	.land {
		flex-direction: row;
		justify-content: space-between;
		text-align: left;
		gap: 3rem;
	}
	.land .copy {
		max-width: 46%;
	}
	.land .cta {
		align-items: flex-start;
	}
	.land .kicker {
		text-align: left;
	}
</style>
