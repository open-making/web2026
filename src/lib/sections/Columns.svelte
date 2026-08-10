<script lang="ts">
	import { base } from '$app/paths';
	import { sections } from '$lib/data/section-titles';
	import PrintImage from '$lib/components/PrintImage.svelte';
	import Tape from '$lib/components/Tape.svelte';
	import curated from '../../content/quotes.json';
	import posterIndex from '$lib/assets/images/films/index.json';
	import { mulberry32, hashSeed } from '$lib/components/prng';

	const posters = import.meta.glob('$lib/assets/images/films/*.webp', {
		eager: true,
		import: 'default'
	}) as Record<string, string>;

	const films = curated.films.map((f) => {
		const file = (posterIndex as Record<string, string>)[f.film];
		const img = file ? Object.entries(posters).find(([p]) => p.endsWith(file))?.[1] : undefined;
		return { ...f, img };
	});

	const tilt = (key: string, range = 2.2) =>
		((mulberry32(hashSeed(key))() * 2 - 1) * range).toFixed(2);
</script>

<section id="columns" class="page">
	<h2 class="font-display flex flex-col gap-2 justify-center items-center text-3xl font-black misreg">
		{sections.columns.title} <span class="h2tag font-hand">{sections.columns.tag}</span>
	</h2>
	<p class="lede">{sections.columns.desc}</p>

	<header class="colhead">
		<h3 class="font-display font-bold">logging off with a film recommendation</h3>
		<p class="font-hand">
			by <a href="{base}/darshan">Darshan</a>, who ended nearly every dev note with one
		</p>
	</header>

	<div class="wall">
		{#each films as f, i}
			<figure class="poster scrap" style="--tilt: {tilt(f.film)}deg">
				<Tape
					color={i % 2 ? 'blue' : 'pink'}
					tilt="{tilt(f.film + 't', 9)}deg"
					style="left: {22 + (i % 3) * 18}%; top: -0.8rem"
				/>
				{#if f.img}
					<PrintImage src={f.img} alt="{f.film} poster" href={f.commentUrl} />
				{:else}
					<a class="typographic font-display" href={f.commentUrl}>{f.film}</a>
				{/if}
				<figcaption>
					<a class="film" href={f.commentUrl}>{f.film.replace(/\s*\(\d{4}\)$/, '')}</a>
					<span class="day font-hand">day {f.day}</span>
				</figcaption>
			</figure>
		{/each}
	</div>

	<div class="divider" aria-hidden="true"><span class="orn">✱</span></div>

	<header class="colhead">
		<h3 class="font-display font-bold">okieee thanksss byieeee</h3>
		<p class="font-hand">
			by <a href="{base}/anchita">Anchita</a> and <a href="{base}/aditi">Aditi</a>, who signed
			off nearly every note daily
		</p>
	</header>

	<ul class="signoffs">
		{#each curated.signoffs as s}
			<li class="signoff" class:aditi={s.author === 'Aditi'} style="--tilt: {tilt(s.text + s.day, 3)}deg">
				<a href={s.commentUrl}>
					<span class="bye font-hand">{s.text}</span>
					<span class="who">{s.author} · day {s.day}</span>
				</a>
			</li>
		{/each}
	</ul>

	<div class="divider" aria-hidden="true"><span class="orn">✱</span></div>

	<header class="colhead">
		<h3 class="font-display font-bold">on my mind</h3>
		<p class="font-hand">
			songs quoted in a note or hidden in a day title, most of them by
			<a href="{base}/prakhar">Prakhar</a>
		</p>
	</header>

	<ul class="cdwall">
		{#each curated.songs as t, i}
			<li
				class="cd"
				style="--tilt: {tilt(t.song, 5)}deg; --ink: var(--color-{i % 2 ? 'blue' : 'pink'}); --ink2: var(--color-{i % 2 ? 'pink' : 'blue'})"
			>
				<a class="disc" href={t.spotifyUrl} aria-label="{t.song} on Spotify"></a>
				<a class="track" href={t.spotifyUrl}>{t.song}</a>
				<span class="artist">{t.artist}</span>
				<a class="tday font-hand" href={t.commentUrl}>day {t.day}</a>
			</li>
		{/each}
	</ul>
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
	.colhead {
		margin-top: var(--leading);
	}

	/* a printed rule between columns: dashed line broken by a misregistered star */
	.divider {
		margin-top: calc(var(--leading) * 2.5);
		display: flex;
		align-items: center;
		gap: 1.1rem;
	}
	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		border-top: 1.5px dashed rgba(50, 24, 113, 0.25);
	}
	.orn {
		font-size: 1.15rem;
		line-height: 1;
		color: var(--color-pink);
		text-shadow: 0.06em 0.06em 0 var(--color-blue);
	}
	.colhead h3 {
		font-size: 1.35rem;
		color: var(--color-pink);
	}
	.colhead p {
		margin-top: 0.25rem;
		font-size: 0.95rem;
	}
	.colhead a {
		color: var(--color-pink);
		text-decoration: none;
	}
	.colhead a:hover {
		text-decoration: underline;
	}

	.wall {
		margin-top: calc(var(--leading) * 1.25);
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
		gap: 2rem 1.5rem;
		overflow-x: clip;
	}

	@media (min-width: 768px) {
		.wall {
			grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
		}
	}
	.poster {
		position: relative;
		padding: 0.5rem 0.5rem 0.4rem;
	}
	.typographic {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		aspect-ratio: 360 / 520;
		background: var(--color-violet);
		color: var(--color-paper);
		font-weight: 700;
		font-size: 1.2rem;
		line-height: 1.2;
		padding: 1rem;
		text-decoration: none;
	}
	figcaption {
		display: flex;
		flex-direction: column;
		gap: 0.05rem;
		padding-top: 0.45rem;
	}
	.film {
		font-weight: 600;
		font-size: 0.92rem;
		line-height: 1.25;
		color: var(--color-blue);
		text-decoration: none;
	}
	.film:hover {
		color: var(--color-pink);
	}
	.day {
		font-size: 0.8rem;
		color: var(--color-pink);
	}

	.signoffs {
		margin-top: calc(var(--leading) * 1.25);
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 1.1rem 2rem;
	}
	.signoff {
		rotate: var(--tilt);
	}
	.signoff a {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		text-decoration: none;
	}
	.bye {
		font-size: 1.5rem;
		line-height: 1.1;
		color: var(--color-pink);
	}
	.signoff.aditi .bye {
		color: var(--color-blue);
	}
	.signoff a:hover .bye {
		text-decoration: underline;
	}
	.who {
		font-size: 0.72rem;
		color: var(--color-violet);
	}

	.cdwall {
		margin-top: calc(var(--leading) * 1.25);
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
		gap: 1.6rem 1rem;
	}
	.cd {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.1rem;
	}
	.disc {
		position: relative;
		width: 5.4rem;
		aspect-ratio: 1;
		border-radius: 50%;
		rotate: var(--tilt);
		margin-bottom: 0.45rem;
		background:
			radial-gradient(circle, var(--color-paper) 0 17%, transparent 17.5%),
			repeating-radial-gradient(circle, transparent 0 6px, var(--color-paper) 6px 7px),
			var(--ink);
		transition: rotate 0.35s ease;
	}
	.disc::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		border: 2px solid var(--ink2);
		translate: 2px 2px;
		opacity: 0.55;
	}
	.cd:hover .disc {
		rotate: calc(var(--tilt) + 22deg);
	}
	.track {
		font-weight: 700;
		font-size: 0.8rem;
		line-height: 1.2;
		color: var(--color-blue);
		text-decoration: none;
	}
	.track:hover {
		color: var(--color-pink);
	}
	.artist {
		font-size: 0.68rem;
		color: var(--color-violet);
	}
	.tday {
		font-size: 0.72rem;
		color: var(--color-pink);
		text-decoration: none;
	}
	.tday:hover {
		text-decoration: underline;
	}
</style>
