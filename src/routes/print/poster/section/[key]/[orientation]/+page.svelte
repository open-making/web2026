<script lang="ts">
	import PosterFrame from '$lib/components/PosterFrame.svelte';
	import RansomLine from '$lib/components/RansomLine.svelte';
	import Tape from '$lib/components/Tape.svelte';
	import { mulberry32, hashSeed } from '$lib/components/prng';
	import { byFile } from '$lib/utils/images';
	import { qrSvg } from '$lib/utils/qr';
	import manifest from '../../../../../../content/screenshots.json';
	import finalIndex from '$lib/assets/images/final/index.json';
	import bohemianIndex from '$lib/assets/images/bohemian/index.json';
	import printIndex from '$lib/assets/images/print/index.json';
	import clockIndex from '$lib/assets/images/clocks/index.json';
	import filmsIndex from '$lib/assets/images/films/index.json';

	let { data } = $props();
	const { title, kicker, desc, visual, content, orientation } = data;
	const land = orientation === 'landscape';
	const words = title.split(' ');
	const titleSize = land ? '2.9rem' : '3.4rem';

	const tilt = (k: string, r = 3) => ((mulberry32(hashSeed(k))() * 2 - 1) * r).toFixed(2);

	// resolve the screenshots each visual needs
	type Card = { img: string; caption: string };
	const resolve = (
		entries: { slug: string; name: string; url: string }[],
		index: Record<string, string>
	): Card[] =>
		entries.flatMap((e) => {
			const file = index[e.url];
			const img = file ? byFile(file) : undefined;
			return img ? [{ img, caption: e.name }] : [];
		});

	function buildCards(): Card[] {
		if (visual === 'sites') return resolve(manifest.final, finalIndex as Record<string, string>);
		if (visual === 'archive') {
			// interleave the three exercises so the wall mixes rather than clusters
			const b = resolve(manifest.bohemian, bohemianIndex as Record<string, string>);
			const p = resolve(manifest.print, printIndex as Record<string, string>);
			const c = resolve(manifest.clocks, clockIndex as Record<string, string>);
			const woven: Card[] = [];
			for (let i = 0; i < Math.max(b.length, p.length, c.length); i++) {
				if (b[i]) woven.push(b[i]);
				if (p[i]) woven.push(p[i]);
				if (c[i]) woven.push(c[i]);
			}
			return woven;
		}
		if (visual === 'films') {
			return (content.films as string[]).flatMap((name) => {
				const file = (filmsIndex as Record<string, string>)[name];
				const img = file ? byFile(file) : undefined;
				return img ? [{ img, caption: name }] : [];
			});
		}
		return [];
	}
	// the sheet is fixed: show a full-but-bounded wall (portrait 2×3, landscape 3×2)
	const cards = buildCards().slice(0, 6);

	const quotes = (content.quotes ?? []) as { text: string; day: number; author: string }[];
	const items = (content.items ?? []) as { title: string; desc: string }[];
	const materials = (content.materials ?? []) as { label: string; url: string }[];
	const names = ['Aditi', 'Anchita', 'Ashish', 'Darshan', 'Prakhar', 'Rushikesh', 'Sanskar'];
	const openQr = visual === 'open' ? qrSvg(content.qrUrl as string, { ink: 'violet' }) : '';
</script>

<PosterFrame {orientation} accent="pink" folio={title.toLowerCase()} grainSeed={title}>
	<!-- only the screenshot walls split header-left / grid-right in landscape;
	     the big-type visuals (people, contents, open) stay full width -->
	<div
		class="poster"
		class:land
		class:split={land && ['sites', 'archive', 'films'].includes(visual)}
	>
		<header class="head">
			<p class="kicker font-hand">{kicker}</p>
			<h1 class="title">
				{#each words as w, i (w + i)}
					<RansomLine text={w.toLowerCase()} size={titleSize} />
				{/each}
			</h1>
			<p class="lede">{desc}</p>
		</header>

		<div class="visual visual-{visual}">
			{#if visual === 'quotes'}
				<div class="quotes">
					{#each quotes as q, i (q.text)}
						<blockquote class="qscrap scrap" style="--tilt: {tilt(q.text)}deg">
							<Tape
								color={i % 2 ? 'blue' : 'pink'}
								tilt="{tilt(q.text + 't', 8)}deg"
								seedKey={q.text}
								style="left: {16 + ((i * 13) % 40)}%; top: -0.8rem"
							/>
							<p>{q.text}</p>
							<cite class="font-hand">day {q.day} · {q.author}</cite>
						</blockquote>
					{/each}
				</div>
			{:else if visual === 'people'}
				<div class="people">
					{#each names as n (n)}
						<span class="person" style="--tilt: {tilt(n, 2)}deg">
							<RansomLine text={n} size={land ? '2.8rem' : '3.2rem'} />
						</span>
					{/each}
				</div>
			{:else if visual === 'contents'}
				<ol class="contents">
					{#each items as it, i (it.title)}
						<li class="scrap" style="--tilt: {tilt(it.title, 1.2)}deg">
							<span class="num font-hand">{String(i + 1).padStart(2, '0')}</span>
							<span class="citem">
								<span class="ctitle font-display">{it.title}</span>
								<span class="cdesc">{it.desc}</span>
							</span>
						</li>
					{/each}
				</ol>
			{:else if visual === 'open'}
				<div class="open">
					<div class="qrbox">
						<Tape color="pink" tilt="-6deg" seedKey="open-qr" style="left: 26%; top: -0.85rem" />
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html openQr}
					</div>
					<ul class="materials">
						{#each materials as m (m.url)}
							<li>
								<span class="mlabel font-display">{m.label}</span>
								<span class="murl font-hand">{m.url.replace('https://', '')}</span>
							</li>
						{/each}
					</ul>
				</div>
			{:else}
				<!-- sites / archive / films: a pasted wall of screenshots -->
				<div class="wall">
					{#each cards as c, i (c.img + i)}
						<figure class="tile" style="--tilt: {tilt(c.caption + i, 4)}deg">
							<Tape
								color={i % 2 ? 'blue' : 'pink'}
								tilt="{tilt(c.caption + i + 't', 8)}deg"
								seedKey={c.caption + i}
								style="left: 24%; top: -0.75rem"
							/>
							<img src={c.img} alt="" />
							<figcaption class="font-hand">{c.caption}</figcaption>
						</figure>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</PosterFrame>

<style>
	.poster {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: calc(var(--leading) * 1.1);
	}
	.head {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.kicker {
		font-size: 1.35rem;
		color: var(--color-pink);
		transform: rotate(-1.4deg);
		align-self: flex-start;
	}
	.title {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.32em;
		margin: 0.3rem 0 0.5rem;
	}
	.lede {
		font-size: 1.25rem;
		line-height: 1.45;
		max-width: 46ch;
		color: var(--color-violet);
	}

	.visual {
		flex: 1;
		min-height: 0;
		display: flex;
		overflow: hidden; /* the sheet is fixed; never cross the foot */
	}

	/* quotes wall: balanced columns so the six scraps pack top-down */
	.quotes {
		columns: 2;
		column-gap: 1.6rem;
		width: 100%;
	}
	.qscrap {
		position: relative;
		break-inside: avoid;
		margin-bottom: 1.4rem;
		padding: 1rem 1.2rem 0.8rem;
		font-size: 1.05rem;
		line-height: 1.4;
	}
	.qscrap p::before {
		content: '“';
		color: var(--color-pink);
	}
	.qscrap p::after {
		content: '”';
		color: var(--color-pink);
	}
	.qscrap cite {
		display: block;
		margin-top: 0.5rem;
		font-style: normal;
		font-size: 0.9rem;
		color: var(--color-pink);
	}

	/* screenshot wall */
	.wall {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.6rem 1.5rem;
		align-content: flex-start;
		width: 100%;
	}
	.tile {
		position: relative;
		margin: 0;
		background: #fffcf4;
		padding: 0.5rem 0.5rem 0.4rem;
		transform: rotate(var(--tilt));
		box-shadow: 0 3px 12px rgba(50, 24, 113, 0.16);
	}
	.tile img {
		display: block;
		width: 100%;
		height: 7rem;
		object-fit: cover;
		outline: 1px solid rgba(50, 24, 113, 0.12);
	}
	.tile figcaption {
		padding-top: 0.3rem;
		font-size: 0.9rem;
		color: var(--color-blue);
	}
	.visual-films .tile img {
		height: 9.5rem;
		object-fit: contain;
		background: var(--color-paper);
	}
	.split .wall {
		grid-template-columns: repeat(3, 1fr);
	}

	/* people: big ransom names that fill the lower sheet */
	.people {
		display: flex;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
		gap: 1.8rem 2.4rem;
		width: 100%;
		height: 100%;
	}
	.person {
		display: inline-block;
		transform: rotate(var(--tilt));
	}

	/* contents list */
	.contents {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 0.7rem;
		width: 100%;
		height: 100%;
	}
	.contents li {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		padding: 0.75rem 1.2rem;
		transform: rotate(var(--tilt));
	}
	.num {
		font-size: 1.35rem;
		color: var(--color-pink);
		flex-shrink: 0;
	}
	.citem {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}
	.ctitle {
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--color-violet);
	}
	.cdesc {
		font-size: 1rem;
		line-height: 1.35;
		color: var(--color-blue);
	}

	/* open source */
	.open {
		display: flex;
		gap: 2.5rem;
		align-items: center;
		width: 100%;
	}
	/* the landscape sheet is short: top-align and tighten so nothing center-clips */
	.land .open {
		align-items: flex-start;
		gap: 2rem;
	}
	.land .materials {
		gap: 0.5rem;
	}
	.land .mlabel {
		font-size: 1.2rem;
	}
	.land .murl {
		font-size: 0.85rem;
	}
	.land .qrbox {
		width: 44mm;
		height: 44mm;
	}
	.land .lede {
		font-size: 1.15rem;
	}
	.land .head {
		gap: 0.6rem;
	}
	/* pull the visual up under the header on the short landscape sheet */
	.land:not(.split) {
		gap: 0.6rem;
	}
	/* contents: two columns on the wide short sheet so all six entries fit */
	.land .contents {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-auto-rows: min-content;
		justify-content: start;
		align-content: start;
		gap: 0.9rem 2.5rem;
	}
	.land .contents li {
		padding: 0.6rem 1.1rem;
	}
	.qrbox {
		position: relative;
		width: 58mm;
		height: 58mm;
		flex-shrink: 0;
		padding: 5mm;
		background: #fffcf4;
		box-shadow: 0 3px 14px rgba(50, 24, 113, 0.18);
	}
	.qrbox :global(svg) {
		display: block;
	}
	.materials {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}
	.materials li {
		display: flex;
		flex-direction: column;
	}
	.mlabel {
		font-size: 1.35rem;
		font-weight: 700;
		color: var(--color-violet);
	}
	.murl {
		font-size: 0.95rem;
		color: var(--color-pink);
	}

	/* landscape screenshot walls: header on the left, the grid on the right */
	.split {
		display: grid;
		grid-template-columns: 0.82fr 1.18fr;
		gap: 2.5rem;
		align-items: start;
	}
	.split .visual {
		height: 100%;
	}
</style>
