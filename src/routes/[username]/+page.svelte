<script lang="ts">
	//@ts-nocheck
	import type { PageData } from './$types';
	import * as Accordion from '$lib/components/ui/accordion';
	import MarkdownContent from '$lib/components/MarkdownContent.svelte';
	import GitGraph from '$lib/components/GitGraph.svelte';
	import SocialLinks from '$lib/components/SocialLinks.svelte';
	import SEO from '$lib/components/SEO.svelte';

	export let data: PageData;

	const { student, studentData } = data;

	// Import images dynamically like the main page does
	const web2025Images = import.meta.glob('$lib/assets/images/web2025/processed/*.webp', {
		eager: true,
		import: 'default'
	});

	const shortStoriesImages = import.meta.glob('$lib/assets/images/short-stories/processed/*.webp', {
		eager: true,
		import: 'default'
	});

	const heyJudeImages = import.meta.glob('$lib/assets/images/hey-jude/processed/*.webp', {
		eager: true,
		import: 'default'
	});

	// Helper function to get image src
	function getImageSrc(imageName: string, type: string) {
		const imageMap = {
			web2025: web2025Images,
			'short-stories': shortStoriesImages,
			'hey-jude': heyJudeImages
		};
		return imageMap[type]?.[`/src/lib/assets/images/${type}/processed/${imageName}`] || '';
	}

	// Get initials from name or username
	function getInitials(name: string | null, username: string): string {
		if (name) {
			return name
				.split(' ')
				.map((part) => part.charAt(0).toUpperCase())
				.slice(0, 2)
				.join('');
		}
		return username.charAt(0).toUpperCase() + (username.charAt(1) || '').toUpperCase();
	}

	// Get display name (first name or username)
	function getDisplayName(name: string | null, username: string): string {
		if (name) {
			const firstName = name.split(' ')[0];
			return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
		}
		return username;
	}

	// Group dev notes by day
	function groupDevNotesByDay(devNotes: any[]) {
		const grouped = new Map();

		devNotes.forEach((note) => {
			const day = note.issueTitle;
			if (!grouped.has(day)) {
				grouped.set(day, []);
			}
			grouped.get(day).push(note);
		});

		return Array.from(grouped.entries()).map(([day, notes]) => ({
			day,
			notes: notes.sort(
				(a: any, b: any) => new Date(a.date.iso).getTime() - new Date(b.date.iso).getTime()
			)
		}));
	}

	// Process commits from commitsByDate object
	function processCommits(commitsByDate: any) {
		if (!commitsByDate) return [];

		const allCommits: any[] = [];
		Object.entries(commitsByDate).forEach(([date, commits]: [string, any[]]) => {
			commits.forEach((commit) => {
				allCommits.push({
					...commit,
					date: date // Use the date key as the commit date
				});
			});
		});

		return allCommits;
	}

	$: initials = getInitials(student.name, student.username);
	$: displayName = getDisplayName(student.name, student.username);
	$: avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=f3f4f6&textColor=374151`;
	$: devNotesByDay = studentData?.devNotes ? groupDevNotesByDay(studentData.devNotes) : [];
	$: allCommits = studentData?.commitsByDate ? processCommits(studentData.commitsByDate) : [];

	// Generate OG image data with absolute URLs
	$: projectImages = [
		studentData?.projectSubmissions?.web2025?.[0]
			? `https://web2025-gallery.netlify.app${getImageSrc(studentData.projectSubmissions.web2025[0].imageName, 'web2025')}`
			: '',
		studentData?.projectSubmissions?.['short-stories']?.[0]
			? `https://web2025-gallery.netlify.app${getImageSrc(studentData.projectSubmissions['short-stories'][0].imageName, 'short-stories')}`
			: '',
		studentData?.projectSubmissions?.['hey-jude']?.[0]
			? `https://web2025-gallery.netlify.app${getImageSrc(studentData.projectSubmissions['hey-jude'][0].imageName, 'hey-jude')}`
			: ''
	].filter(Boolean);

	$: notes = studentData?.devNotes?.length || 0;
	$: processedCommits = allCommits.sort(
		(a, b) => new Date(b.date || b.time).getTime() - new Date(a.date || a.time).getTime()
	);
</script>

<SEO
	title={student.name || student.username}
	description="Student gallery featuring web design and development projects from the WEB2025 module"
	contentType="student"
	courseId={student.username}
	author={student.name || student.username}
	{projectImages}
	commits={studentData?.statistics?.totalCommits || allCommits.length}
	{notes}
/>

<main class="mx-auto min-h-screen max-w-5xl p-8">
	<div class="relative grid grid-cols-1 gap-12 md:grid-cols-3">
		<!-- Left Column: Student Header + Work -->
		<div class="h-fit space-y-8 md:sticky md:top-8">
			<!-- Back Button -->
			<div class="mb-4">
				<a
					href="/#meet-the-devs"
					class="inline-flex items-center gap-2 rounded-sm border-2 border-black bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
					style="font-family: 'Atkinson Hyperlegible', sans-serif;"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="m15 18-6-6 6-6" />
					</svg>
					Back
				</a>
			</div>

			<!-- Student Header -->
			<div class="space-y-6">
				<div class="flex items-center gap-6">
					<img
						src={avatarUrl}
						alt="{displayName}'s avatar"
						class="h-20 w-20 rounded-full border-2 border-black bg-white"
					/>
					<div>
						<h1
							class="text-5xl leading-tight font-bold text-gray-800"
							style="font-family: 'LibreCaslonCondensed', serif; letter-spacing: -0.02em;"
						>
							{student.name || student.username}
						</h1>
						<p
							class="text-lg text-gray-500 opacity-70"
							style="font-family: 'Atkinson Hyperlegible', sans-serif;"
						>
							@{student.username}
						</p>
					</div>
				</div>

				<SocialLinks
					username={student.username}
					website={student.website}
					socialLinks={student.socialLinks || []}
				/>
			</div>

			<!-- Work Cards -->
			<div class="space-y-6">
				<div class="grid grid-cols-2 gap-4">
					<!-- Web2025 Portfolio (spans 2 columns on desktop) -->
					{#if studentData?.projectSubmissions?.web2025?.[0]}
						{@const project = studentData.projectSubmissions.web2025[0]}
						<div class="col-span-2">
							<a
								href={project.url}
								target="_blank"
								rel="noopener noreferrer"
								class="block overflow-hidden rounded-sm border-2 border-black bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
							>
								<div class="aspect-[8/5]">
									<img
										src={getImageSrc(project.imageName, 'web2025')}
										alt="Portfolio Website"
										class="h-full w-full object-cover object-top"
									/>
								</div>
								<div class="px-4 py-2">
									<p
										class="text-sm text-gray-600"
										style="font-family: 'Atkinson Hyperlegible', sans-serif;"
									>
										Final project website
									</p>
								</div>
							</a>
						</div>
					{/if}

					<!-- Short Stories -->
					{#if studentData?.projectSubmissions?.['short-stories']?.[0]}
						{@const project = studentData.projectSubmissions['short-stories'][0]}
						<div>
							<a
								href={project.url}
								target="_blank"
								rel="noopener noreferrer"
								class="block overflow-hidden rounded-sm border-2 border-black bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
							>
								<div class="aspect-[4/3]">
									<img
										src={getImageSrc(project.imageName, 'short-stories')}
										alt="Short Story"
										class="h-full w-full object-cover object-top"
									/>
								</div>
								<div class="px-4 py-2">
									<p
										class="text-sm text-gray-600"
										style="font-family: 'Atkinson Hyperlegible', sans-serif;"
									>
										Short Story
									</p>
								</div>
							</a>
						</div>
					{/if}

					<!-- Hey Jude -->
					{#if studentData?.projectSubmissions?.['hey-jude']?.[0]}
						{@const project = studentData.projectSubmissions['hey-jude'][0]}
						<div>
							<a
								href={project.url}
								target="_blank"
								rel="noopener noreferrer"
								class="block overflow-hidden rounded-sm border-2 border-black bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
							>
								<div class="aspect-[4/3]">
									<img
										src={getImageSrc(project.imageName, 'hey-jude')}
										alt="Hey Jude Project"
										class="h-full w-full object-cover object-top"
									/>
								</div>
								<div class="px-4 py-2">
									<p
										class="text-sm text-gray-600"
										style="font-family: 'Atkinson Hyperlegible', sans-serif;"
									>
										Hey Jude
									</p>
								</div>
							</a>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Right Column: Dev Notes and Other Content -->
		<div class="col-span-2 space-y-8">
			<!-- Dev Notes Section -->
			{#if devNotesByDay.length > 0}
				<div class="space-y-6">
					<h2
						class="text-4xl leading-tight font-bold text-gray-800"
						style="font-family: 'LibreCaslonCondensed', serif; letter-spacing: -0.02em;"
					>
						Dev Notes
					</h2>

					<Accordion.Root class="space-y-2">
						{#each devNotesByDay as { day, notes }}
							<Accordion.Item value={day} class="overflow-hidden border-b-2 border-black">
								<Accordion.Trigger class="py-4 text-left hover:no-underline">
									<div class="flex w-full items-center justify-between">
										<h3
											class="text-xl font-bold text-gray-800"
											style="font-family: 'LibreCaslonCondensed', serif;"
										>
											{day}
										</h3>
									</div>
								</Accordion.Trigger>
								<Accordion.Content>
									<div class="space-y-6">
										{#each notes as note}
											<div class="mb-2 flex items-center gap-2 text-xs text-gray-500">
												<span style="font-family: 'Atkinson Hyperlegible', sans-serif;">
													{note.date.formatted}
												</span>
												{#if note.commentUrl}
													<a
														href={note.commentUrl}
														target="_blank"
														rel="noopener noreferrer"
														class="text-blue-600 transition-colors hover:text-blue-800"
													>
														View on GitHub
													</a>
												{/if}
											</div>
											<MarkdownContent content={note.content} />
										{/each}
									</div>
								</Accordion.Content>
							</Accordion.Item>
						{/each}
					</Accordion.Root>
				</div>
			{/if}

			<!-- Git Graph Section -->
			{#if allCommits.length > 0}
				<div class="space-y-6">
					<!-- <h2
						class="text-4xl leading-tight font-bold text-gray-800"
						style="font-family: 'LibreCaslonCondensed', serif; letter-spacing: -0.02em;"
					>
						Git Activity
					</h2> -->
					<GitGraph commits={allCommits} />
				</div>
			{/if}
		</div>
	</div>
</main>
