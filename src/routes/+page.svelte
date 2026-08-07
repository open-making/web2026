<script lang="ts">
	import ImageCard from '$lib/components/ImageCard.svelte';
	import ImageCollageComponent from '$lib/components/ImageCollageComponent.svelte';
	import StudentCard from '$lib/components/StudentCard.svelte';
	import heyJudeData from '$lib/assets/images/hey-jude/metadata.json';
	import shortStoriesData from '$lib/data/short-stories-metadata.json';
	import studentDatabase from '$lib/data/student-database.json';
	import heyJude from '$lib/assets/images/hey-jude.png';
	import shortStories from '$lib/assets/images/short-stories.png';
	import { getDisplayName } from '$lib/components/utils';
	import websitesData from '$lib/assets/images/web2025/metadata.json';
	import SEO from '$lib/components/SEO.svelte';
	import OpenSourceCollage from '$lib/components/OpenSourceCollage.svelte';
	import GitHubHeatmap from '$lib/components/GitHubHeatmap.svelte';
	import TableOfContents from '$lib/components/TableOfContents.svelte';
	const heyJudeImages = import.meta.glob('$lib/assets/images/hey-jude/processed/*.webp', {
		eager: true,
		import: 'default'
	});

	const shortStoriesImages = import.meta.glob('$lib/assets/images/short-stories/processed/*.webp', {
		eager: true,
		import: 'default'
	});

	const websiteImages = import.meta.glob('$lib/assets/images/web2025/processed/*.webp', {
		eager: true,
		import: 'default'
	});
	function shuffleArray(array: any[]) {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	const heyJudeProjects = shuffleArray(
		heyJudeData
			.filter((item) => item.url && item.imageName)
			.map((project) => ({
				...project,
				imageSrc: heyJudeImages[`/src/lib/assets/images/hey-jude/processed/${project.imageName}`]
			}))
	);

	const shortStoriesProjects = shuffleArray(
		(shortStoriesData.entries || []).map((project) => ({
			...project,
			imageSrc:
				shortStoriesImages[`/src/lib/assets/images/short-stories/processed/${project.imageName}`]
		}))
	);

	const websiteProjects = shuffleArray(
		websitesData
			.filter((item) => item.url && item.imageName)
			.map((project) => ({
				...project,
				imageSrc: websiteImages[`/src/lib/assets/images/web2025/processed/${project.imageName}`]
			}))
	);

	// Process student data for student cards
	const students = Object.values(studentDatabase.students)
		.filter((student) => student.username !== 'thedivtagguy') // Filter out instructor
		.sort((a, b) => {
			const nameA = a.name || a.username;
			const nameB = b.name || b.username;
			return nameA.localeCompare(nameB);
		});
</script>

<SEO
	title="The web2025 gallery"
	description="A showcase of student work from the WEB2025 module at DAIICT, featuring web design and development projects from M.DES students."
	contentType="website"
	author="DAIICT WEB2025 Students"
	image="https://web2025-gallery.netlify.app/sharecard.jpg"
/>

<main class="relative min-h-screen">
	<TableOfContents />
	<ImageCollageComponent />

	<section class="section" id="hey-jude">
		<div class="section-intro">
			<h2 class="section-title">Take a Sad Site, and Make it Sadder</h2>
			<div class="section-content">
				<figure class="section-image space-y-2">
					<img
						src={heyJude}
						alt="plain markup of hey jude"
						class=" -rotate-2 rounded-sm p-4 bg-white border border-black object-cover"
					/>
					<figcaption>This is all everyone started with!</figcaption>
				</figure>
				<p class="section-text">
					Right away on Day 2, we jumped into getting introduced to HTML and CSS! Before we even <em
						>thought</em
					> about designing things that looked "nice" and worthy of being made by designers, it felt
					like a better idea to get our hands and brains a little messy. This exercise was similar to
					splashing paint on walls or doodling on the back of notebooks; except we needed to get our
					sites to look as ugly as possible with any new CSS properties we could discover. Starting with
					a plain, unstyled HTML document, we proceeded to making the biggest mess we could manage in
					an afternoon. Our sites were up on the internet from the second day too!
				</p>
			</div>
		</div>
		<div class="gallery-grid hey-jude-grid">
			{#each heyJudeProjects as project}
				<div class="gallery-item">
					<ImageCard {project} />
				</div>
			{/each}
		</div>
	</section>

	<section class="section" id="short-stories">
		<div class="section-intro">
			<h2 class="section-title">Short Stories</h2>
			<div class="section-content">
				<figure class="section-image space-y-2">
					<img
						src={shortStories}
						alt="plain markup of a hans christian andersen story"
						class=" h-96 -rotate-2 rounded-sm p-4 bg-white border border-black object-cover"
					/>
					<figcaption>Starting with plain text and building a site around it</figcaption>
				</figure>
				<p class="section-text">
					Next up was learning how to take a piece of free-flowing text and design a layout for it.
					The twist here, of course, was to think about how to structure it in HTML _and_ figure out
					what CSS would bring it to life. That meant every step, or misstep, would very much be our
					own. Each of us was to transform one of Hans Christian Andersen's fairy tales into a
					webpage that demonstrated the use of flexbox and floats, typography choices with fonts,
					incorporated images, and drew inspiration from CSS Zen Garden while experimenting with
					techniques from Jen Simmons' works. This project became an initiation into the rich
					tradition of developers wrestling with CSS, losing hours to tweaking margin and padding,
					and joining the ranks of those searching "how to center a div," and discovering that the
					most valuable skills weren't memorizing CSS properties but learning to search for answers
					effectively, debug systematically, and know when to ask for help.
				</p>
			</div>
		</div>
		<div class="gallery-grid short-stories-grid">
			{#each shortStoriesProjects as project}
				<div class="gallery-item">
					<ImageCard {project} />
				</div>
			{/each}
		</div>
	</section>

	<GitHubHeatmap />

	<section class="section" id="digital-gardens">
		<div class="section-intro">
			<h2 class="section-title">Digital Gardens</h2>

			<p class="section-text">
				After proving to ourselves that we could wrestle code into submission and make something
				that looked intentional, it was time to think bigger. This meant moving beyond the technical
				stuff and getting philosophical about it. Why make a personal website at all? What's the
				point of having your own space when social media exists? We spent time reading manifestos
				from people who'd carved out weird, wonderful places on the web, thinking about digital
				gardens versus blogs, and doing what we called "personal archaeology"; digging through our
				own interests and obsessions to figure out what we thought would occupy this corner we'd be
				making. The goal wasn't to build the perfect website right away (we had, like, 10 days), but
				to plant seeds for something that could grow over time, something that felt ours rather than
				another template-driven platform presence online.
			</p>
		</div>

		<div class="gallery-grid short-stories-grid">
			{#each websiteProjects as project}
				<div class="gallery-item">
					<ImageCard {project} />
				</div>
			{/each}
		</div>
	</section>

	<section class="section" id="meet-the-devs">
		<div class="section-intro">
			<h2 class="section-title">Meet the devs</h2>
		</div>
		<div class="students-grid">
			{#each students as student}
				<StudentCard
					student={{
						username: getDisplayName(student.name, student.username, 'lowercase'),
						name: student.name,
						website: student.website,
						socialLinks: student.socialLinks
					}}
				/>
			{/each}
		</div>
	</section>


	<section class="cta-section my-24 overflow-x-clip">
		<div class="cta-container">
			<div class="cta-content">
				<div class="cta-text-content">
					<h2 class="cta-title">This course is open source</h2>
					<p class="cta-text">
						Explore the full curriculum, teaching materials, and student work. Everything is freely
						available for anyone to go through.
					</p>
					<div class="cta-buttons">
						<a
							href="https://teaching.aman.bh/web2025"
							target="_blank"
							rel="noopener noreferrer"
							class="cta-button primary"
						>
							View Course Site
						</a>
						<a
							href="https://github.com/open-making/web2025-dev-notes"
							target="_blank"
							rel="noopener noreferrer"
							class="cta-button secondary"
						>
							Dev Notes
						</a>
					</div>
				</div>

				<div class="cta-collage">
					<OpenSourceCollage layout="desktop" imageIndices={[0, 1, 2, 3]} />
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	.section {
		padding: 4rem 2rem;
		max-width: 1100px;
		margin: 0 auto;
	}

	.section-intro {
		margin-bottom: 3rem;
	}

	.section-title {
		font-family: 'LibreCaslonCondensed', serif;
		font-size: 3rem;
		font-weight: bold;
		line-height: 1.1;
		margin-bottom: 2rem;
		color: var(--color-neutral);
		letter-spacing: -0.02em;
	}

	.section-content {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 3rem;
		align-items: start;
	}

	.section-image {
		position: sticky;
		top: 2rem;
	}

	.section-text {
		font-family: 'Atkinson Hyperlegible', sans-serif;
		font-size: 1.125rem;
		line-height: 1.8;
		color: var(--color-neutral);
		text-align: justify;
		columns: 2;
		column-gap: 2rem;
		margin-bottom: 1.5rem;
	}

	/* .section-text::first-letter {
		font-family: 'LibreCaslonCondensed', serif;
		font-size: 4rem;
		font-weight: bold;
		line-height: 0.75;
		float: left;
		margin: 1rem;
		color: var(--color-purple);
	} */

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		grid-auto-flow: dense;
	}

	.students-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}

	@media (max-width: 768px) {
		.section {
			padding: 3rem 1.5rem;
		}

		.section-title {
			font-size: 2.25rem;
			line-height: 1.2;
			margin-bottom: 1.5rem;
		}

		.section-content {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.section-image {
			justify-self: center;
			position: static;
		}

		.image-placeholder {
			width: 150px;
			height: 150px;
		}

		.section-text {
			columns: 1;
			font-size: 1.125rem;
			line-height: 1.8;
			column-rule: none;
			margin-bottom: 2rem;
			text-align: left;
		}

		.gallery-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.students-grid {
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
			gap: 1rem;
		}

		.gallery-item {
			grid-column: span 1 !important;
			grid-row: span 1 !important;
		}
	}

	.cta-section {
		background: var(--color-purple);
		padding: 4rem 2rem;
		margin-top: 2rem;
	}

	.cta-container {
		max-width: 1200px;
		margin: 0 auto;
	}

	.cta-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
	}

	.cta-text-content {
		text-align: left;
	}

	.cta-collage {
		position: relative;
		min-height: 500px;
	}

	.cta-title {
		font-family: 'LibreCaslonCondensed', serif;
		font-size: 2.5rem;
		font-weight: bold;
		color: white;
		margin-bottom: 1rem;
		line-height: 1.1;
	}

	.cta-text {
		font-family: 'Atkinson Hyperlegible', sans-serif;
		font-size: 1.125rem;
		color: white;
		margin-bottom: 2rem;
		opacity: 0.9;
		line-height: 1.6;
	}

	.cta-buttons {
		display: flex;
		gap: 1rem;
		justify-content: start;
		align-items: center;
	}

	.cta-button {
		font-family: 'Atkinson Hyperlegible', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		transition: all 0.2s ease;
		border: 2px solid transparent;
	}

	.cta-button.primary {
		background: white;
		color: var(--color-purple);
		border-color: white;
	}

	.cta-button.primary:hover {
		background: transparent;
		color: white;
		border-color: white;
	}

	.cta-button.secondary {
		background: transparent;
		color: white;
		border-color: white;
	}

	.cta-button.secondary:hover {
		background: white;
		color: var(--color-purple);
	}

	@media (max-width: 768px) {
		.cta-section {
			padding: 4rem 1.5rem;
		}

		.cta-content {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.cta-text-content {
			text-align: center;
		}

		.cta-title {
			font-size: 2rem;
			line-height: 1.2;
			margin-bottom: 1.5rem;
		}

		.cta-text {
			font-size: 1.125rem;
			line-height: 1.7;
			margin-bottom: 2.5rem;
		}

		.cta-buttons {
			flex-direction: column;
			gap: 0.75rem;
		}

		.cta-button {
			width: 100%;
			max-width: 300px;
		}
	}

	@media (max-width: 480px) {
		.section {
			padding: 2.5rem 1rem;
		}

		.section-title {
			font-size: 1.875rem;
			line-height: 1.2;
			margin-bottom: 1.25rem;
		}

		.section-content {
			gap: 1rem;
		}

		.section-text {
			font-size: 1rem;
			line-height: 1.7;
			margin-bottom: 1.5rem;
		}

		/* .section-text::first-letter {
			font-size: 2rem;
			margin: 0.2rem 0.4rem 0.2rem 0;
		} */

		.gallery-grid {
			gap: 1rem;
		}

		.students-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.cta-section {
			padding: 3rem 1rem;
		}

		.cta-title {
			font-size: 1.75rem;
			margin-bottom: 1.25rem;
		}

		.cta-text {
			font-size: 1rem;
			line-height: 1.6;
			margin-bottom: 2rem;
		}

		.cta-buttons {
			gap: 0.5rem;
		}

		.cta-button {
			padding: 0.75rem 1.25rem;
			font-size: 0.95rem;
		}
	}
</style>
