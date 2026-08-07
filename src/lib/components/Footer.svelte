<footer class="footer">
	<div class="container">
		<p class="footer-text">
			Showcase for the <a
				href="https://teaching.aman.bh/web2025"
				target="_blank"
				rel="noopener noreferrer">web2025 module</a
			> · Summer 2025
		</p>
		<p class="footer-text">
			Course facilitated by <a href="https://aman.bh" target="_blank" rel="noopener noreferrer"
				>Aman Bhargava</a
			>
		</p>

		<small class="text-xs"
			>Header illustration by <a
				class="text-black"
				href="https://webportfolio-aimansayeed.netlify.app/">Aiman Sayeed</a
			></small
		>
	</div>
</footer>

<style>
	.footer {
		background-color: var(--color-neutral-light);
		border-top: 1px solid var(--color-neutral-medium);
		padding: 2rem 0;
		margin-top: auto;
	}

	.container {
		max-width: 1300px;
		margin: 0 auto;
		padding: 0 2rem;
		text-align: center;
	}

	.footer-text {
		font-family: 'Atkinson Hyperlegible', sans-serif;
		font-size: 0.875rem;
		color: var(--color-neutral);
		margin: 0 0 0.5rem 0;
		opacity: 0.8;
	}

	.footer-text:last-child {
		margin-bottom: 0;
	}

	.footer-text a {
		color: var(--color-neutral);
		text-decoration: underline;
		text-decoration-color: var(--color-purple);
		text-underline-offset: 2px;
		transition: all 0.2s ease;
	}

	.footer-text a:hover {
		color: var(--color-purple);
		text-decoration-color: var(--color-purple);
	}

	@media (max-width: 768px) {
		.footer {
			padding: 1.5rem 0;
		}

		.container {
			padding: 0 1rem;
		}

		.footer-text {
			font-size: 0.8rem;
		}
	}
</style>
