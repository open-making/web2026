<section id="colophon" class="back">
	<h2 class="font-display text-2xl font-bold">colophon</h2>
	<dl>
		<div>
			<dt>inks</dt>
			<dd>fluoro pink · blue · violet where they overlap</dd>
		</div>
		<div>
			<dt>type</dt>
			<dd>Cartridge, Grandsans and Free Lunch by SimpleBits</dd>
		</div>
		<div>
			<dt>made with</dt>
			<dd>SvelteKit, and 94 dev notes written between classes</dd>
		</div>
		<div>
			<dt>course</dt>
			<dd>
				<a href="https://teaching.aman.bh/web2026">Introduction to Making for the Web</a>, DA-IICT
			</dd>
		</div>
		<div>
			<dt>dev notes</dt>
			<dd>
				<a href="https://github.com/open-making/web2026-dev-notes">open-making/web2026-dev-notes</a>
			</dd>
		</div>
	</dl>
</section>

<style>
	.back {
		max-width: var(--measure);
		margin-inline: auto;
		padding: calc(var(--leading) * 2) 1.25rem calc(var(--leading) * 4);
	}
	dl {
		margin-top: var(--leading);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	dl > div {
		display: flex;
		gap: 1rem;
		align-items: baseline;
	}
	dt {
		font-family: var(--font-hand);
		font-size: 0.85rem;
		min-width: 6.5rem;
		color: var(--color-pink);
	}
	a {
		text-decoration-color: var(--color-pink);
	}
</style>
