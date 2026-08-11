<script lang="ts">
	import { base } from '$app/paths';
	import studentDatabase from '$lib/data/student-database.json';

	type Member = { name: string; slug: string; url: string; isStudent?: boolean };

	// The ring = roster students who submitted a site + ring-only extras (facilitator,
	// guests). Assembled by scripts/build-student-database.js.
	const members = (studentDatabase.webring ?? []) as Member[];

	const NEW_ISSUE =
		'https://github.com/open-making/web2026/issues/new?template=student-submission.yml';

	// The public (proxied) URL of the widget, for the copy-paste snippets.
	const EMBED_SRC = 'https://teaching.aman.bh/web2026/showcase/webring.js';
	const barSnippet = `<div id="web2026-ring"></div>\n<script src="${EMBED_SRC}" defer><\/script>`;
	const miniSnippet = `<div id="web2026-ring" data-variant="mini"></div>\n<script src="${EMBED_SRC}" defer><\/script>`;

	let copied = $state<string | null>(null);
	async function copy(which: string, text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copied = which;
			setTimeout(() => (copied = null), 1600);
		} catch {
			copied = null;
		}
	}
</script>

<svelte:head>
	<title>web2026 webring</title>
	<meta
		name="description"
		content="A little widget that links the web2026 students' sites together. Grab the one-line embed and join the ring."
	/>
</svelte:head>

<section class="page">
	<p class="crumb font-hand"><a href="{base}/">← back to the showcase</a></p>

	<h2
		class="flex flex-col items-center justify-center gap-2 font-display text-3xl font-black misreg"
	>
		the web2026 webring <span class="h2tag font-hand">pass it on</span>
	</h2>
	<p class="lede text-balance">
		A webring is a handful of sites that link to each other in a loop. This one connects all the
		sites in our class!
	</p>

	<!-- static previews of both variants -->
	<div class="previews">
		<figure>
			<div class="ring" aria-hidden="true">
				<span class="lnk">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
					<span>prev</span>
				</span>
				<span class="sep"></span>
				<span class="label">
					<span class="mark">
						<svg viewBox="0 0 512 512">
							<rect x="86" y="94" width="340" height="340" rx="26" fill="#ff48b0" transform="rotate(-6 256 256)" />
							<rect x="78" y="82" width="340" height="340" rx="26" fill="#321871" transform="rotate(3 256 256)" />
							<path d="M150 176 L200 342 L256 236 L312 342 L362 176" fill="none" stroke="#faf7ef" stroke-width="46" stroke-linejoin="round" stroke-linecap="round" transform="rotate(3 256 256)" />
						</svg>
					</span>
					web2026 ring
				</span>
				<span class="sep"></span>
				<span class="lnk">
					<span>next</span>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg>
				</span>
				<span class="sep"></span>
				<span class="lnk"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 9-9 9-9-9z" /></svg></span>
				<span class="lnk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7" /><path d="M6 9.5V19h12V9.5" /></svg></span>
			</div>
			<figcaption class="font-hand">the bar</figcaption>
		</figure>

		<figure>
			<div class="mini ring" aria-hidden="true">
				<span class="lnk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7" /></svg></span>
				<span class="lnk mark">
					<svg viewBox="0 0 512 512">
						<rect x="86" y="94" width="340" height="340" rx="26" fill="#ff48b0" transform="rotate(-6 256 256)" />
						<rect x="78" y="82" width="340" height="340" rx="26" fill="#321871" transform="rotate(3 256 256)" />
						<path d="M150 176 L200 342 L256 236 L312 342 L362 176" fill="none" stroke="#faf7ef" stroke-width="46" stroke-linejoin="round" stroke-linecap="round" transform="rotate(3 256 256)" />
					</svg>
				</span>
				<span class="lnk"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7" /></svg></span>
				<span class="lnk"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 9-9 9-9-9z" /></svg></span>
			</div>
			<figcaption class="font-hand">the mini</figcaption>
		</figure>
	</div>

	<!-- embed snippets -->
	<div class="snippets">
		<div class="embed scrap" style="--tilt: -0.6deg">
			<div class="embed-head">
				<span class="font-hand">the bar</span>
				<button class="copy font-display" onclick={() => copy('bar', barSnippet)}>
					{copied === 'bar' ? 'copied ✓' : 'copy'}
				</button>
			</div>
			<pre><code>{barSnippet}</code></pre>
		</div>

		<div class="embed scrap" style="--tilt: 0.7deg">
			<div class="embed-head">
				<span class="font-hand">the mini</span>
				<button class="copy font-display" onclick={() => copy('mini', miniSnippet)}>
					{copied === 'mini' ? 'copied ✓' : 'copy'}
				</button>
			</div>
			<pre><code>{miniSnippet}</code></pre>
		</div>
	</div>

	<!-- members -->
	<h3 class="font-display misreg-blue">
		in the ring {#if members.length}<span class="count font-hand">{members.length} sites</span>{/if}
	</h3>

	{#if members.length}
		<ul class="members">
			{#each members as m (m.slug)}
				<li class="member">
					<a class="m-name font-display" href={m.url} target="_blank" rel="noopener">{m.name}</a>
					{#if m.isStudent}
						<a class="m-profile font-hand" href="{base}/{m.slug}">profile →</a>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty">The ring is empty right now.</p>
	{/if}

	<div class="join">
		<a class="cta cta-pink font-display" href={NEW_ISSUE} target="_blank" rel="noopener">
			join the ring →
		</a>
		<span class="join-note font-hand">submit your final site</span>
	</div>
</section>

<style>
	.page {
		max-width: var(--page-max);
		margin-inline: auto;
		padding: calc(var(--leading) * 2) 1.25rem calc(var(--leading) * 3);
	}
	.crumb {
		font-size: 0.95rem;
		margin-bottom: var(--leading);
	}
	.crumb a {
		color: var(--color-pink);
		text-decoration: none;
	}
	.crumb a:hover {
		text-decoration: underline;
	}
	.lede {
		max-width: var(--measure);
		margin-top: var(--leading);
		margin-inline: auto;
		font-size: 1.1rem;
		text-align: center;
	}

	/* preview bars — mirror static/webring.js */
	.previews {
		margin: calc(var(--leading) * 1.75) 0 0;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: center;
		gap: 1.5rem 2rem;
	}
	.previews figure {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.55rem;
		margin: 0;
	}
	.previews figcaption {
		font-size: 0.85rem;
		color: var(--color-pink);
	}
	.ring {
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 12px;
		line-height: 1;
		color: var(--color-violet);
		background: #fffcf4;
		border: 1px solid rgba(50, 24, 113, 0.28);
		border-radius: 7px;
		padding: 6px 10px;
		box-shadow: 0 1px 2px rgba(50, 24, 113, 0.12);
		letter-spacing: 0.02em;
	}
	.ring.mini {
		gap: 0.3rem;
		padding: 3px 6px;
		border-radius: 6px;
	}
	.ring .lnk,
	.ring .label {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}
	.ring .label {
		gap: 0.4rem;
		font-weight: 700;
		white-space: nowrap;
	}
	.ring .mark {
		display: inline-flex;
	}
	.ring .sep {
		width: 1px;
		height: 14px;
		background: rgba(50, 24, 113, 0.2);
	}
	.ring svg {
		width: 13px;
		height: 13px;
		display: block;
	}
	.ring.mini svg {
		width: 15px;
		height: 15px;
	}
	.ring .mark svg {
		width: 17px;
		height: 17px;
	}
	.ring.mini .mark svg {
		width: 18px;
		height: 18px;
	}

	/* embed snippet cards */
	.snippets {
		margin: calc(var(--leading) * 1.75) auto 0;
		max-width: var(--measure);
		display: grid;
		gap: 1.25rem;
	}
	.embed {
		padding: 0.9rem 1rem 1rem;
	}
	.embed-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}
	.embed-head span {
		font-size: 0.9rem;
		color: var(--color-pink);
	}
	.copy {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--color-paper);
		background: var(--color-blue);
		border: none;
		border-radius: 6px;
		padding: 0.25em 0.8em;
		cursor: pointer;
		transition: background 0.2s ease;
	}
	.copy:hover {
		background: var(--color-violet);
	}
	.embed pre {
		margin: 0;
		overflow-x: auto;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.85rem;
		line-height: 1.5;
		color: var(--color-violet);
		white-space: pre-wrap;
		word-break: break-all;
	}

	h3 {
		margin: calc(var(--leading) * 2) 0 0;
		font-size: 1.6rem;
		font-weight: 900;
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}
	.count {
		font-size: 0.95rem;
		color: var(--color-pink);
		text-shadow: none;
	}

	.members {
		margin: var(--leading) 0 0;
		padding: 0;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
		gap: 0.75rem 1.5rem;
	}
	.member {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		border-bottom: 1.5px dashed rgba(50, 24, 113, 0.2);
		padding-bottom: 0.4rem;
	}
	.m-name {
		font-weight: 700;
		font-size: 1.1rem;
		color: var(--color-blue);
		text-decoration: none;
	}
	.m-name:hover {
		color: var(--color-pink);
	}
	.m-profile {
		margin-left: auto;
		font-size: 0.8rem;
		color: var(--color-pink);
		text-decoration: none;
		white-space: nowrap;
	}
	.m-profile:hover {
		text-decoration: underline;
	}
	.empty {
		margin: var(--leading) 0 0;
		max-width: var(--measure);
		font-size: 1.05rem;
		color: var(--color-violet);
	}

	.join {
		margin: calc(var(--leading) * 2) 0 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1rem;
	}
	.cta {
		font-weight: 700;
		font-size: 1.05rem;
		padding: 0.45em 1.1em;
		border-radius: 10px;
		text-decoration: none;
		border: 2.5px solid transparent;
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}
	.cta-pink {
		border-color: var(--color-pink);
		color: var(--color-pink);
	}
	.cta-pink:hover {
		background: var(--color-pink);
		color: var(--color-paper);
	}
	.join-note {
		font-size: 0.9rem;
		color: var(--color-pink);
	}
</style>
