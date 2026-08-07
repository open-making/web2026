<script>
	import { page } from '$app/stores';

	// Required props
	export let title = '';

	// Optional props with defaults
	export let description = '';
	export let type = 'website'; // website, article, etc.
	export let image = ''; // URL to the image
	export let courseId = '';
	export let contentType = 'page'; // page, assignment, day
	export let date = '';
	export let author = '';
	export let keywords = '';
	export let canonical = '';
	export let projectImages = []; // Array of project image URLs
	export let commits = 0;
	export let notes = 0;

	// Site configuration
	const domain = 'https://web2025-gallery.netlify.app';
	const siteName = 'WEB2025 Gallery';
	const defaultAuthor = 'WEB2025 Students';

	// Computed values
	$: fullTitle = title ? `${title} | WEB2025 Gallery` : 'WEB2025 Gallery - Student Showcase';

	$: ogImage = image || (contentType === 'student' ? 
		`${domain}/og?username=${encodeURIComponent(courseId || '')}&studentName=${encodeURIComponent(title)}&commits=${commits}&notes=${notes}&images=${encodeURIComponent(projectImages.join(','))}&pageType=student` :
		`${domain}/og?title=${encodeURIComponent(title || 'WEB2025 Gallery')}&description=${encodeURIComponent(description || '')}&pageType=home`);
		
	$: fullOgImageUrl = image && image.startsWith('/') 
		? `https://wsrv.nl/?url=${encodeURIComponent(`${domain}${image}`)}&w=1200&h=627&fit=cover&output=jpg&q=85&maxage=7d`
		: ogImage 
			? `https://wsrv.nl/?url=${encodeURIComponent(ogImage)}&w=1200&h=627&fit=cover&output=jpg&q=85&maxage=7d`
			: ogImage;
	$: currentUrl =
		canonical ||
		($page.url.href.startsWith('http') ? $page.url.href : `${domain}${$page.url.pathname}`);
	$: finalAuthor = author || defaultAuthor;
	$: articleType = contentType === 'assignment' || contentType === 'day' ? 'article' : type;
	$: finalDescription =
		description ||
		(contentType === 'student' ? `Student gallery and projects from ${title || 'WEB2025 student'}` :
		'A showcase of student work from the WEB2025 module at DAIICT, featuring web design and development projects.');
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={finalDescription} />

	<!-- Author and Keywords -->
	<meta name="author" content={finalAuthor} />
	{#if keywords}
		<meta name="keywords" content={keywords} />
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={articleType} />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={finalDescription} />
	<meta property="og:image" content={fullOgImageUrl} />
	<meta property="og:site_name" content={siteName} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={currentUrl} />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={finalDescription} />
	<meta name="twitter:image" content={fullOgImageUrl} />
	<meta name="twitter:creator" content="@amanbhargava" />

	<!-- Article metadata -->
	<meta property="article:section" content="WEB2025" />
	{#if date}
		<meta property="article:published_time" content={new Date(date).toISOString()} />
	{/if}
	<meta property="article:author" content={finalAuthor} />

	<!-- Additional structured data -->
	{#if contentType === 'student'}
		{@html `<script type="application/ld+json">${JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: title,
			description: finalDescription,
			url: currentUrl,
			image: fullOgImageUrl,
			affiliation: {
				'@type': 'Organization',
				name: 'DAIICT',
				description: 'WEB2025 Course'
			}
		})}</script>`}
	{:else}
		{@html `<script type="application/ld+json">${JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: siteName,
			description: finalDescription,
			url: currentUrl,
			publisher: {
				'@type': 'Organization',
				name: 'DAIICT'
			}
		})}</script>`}
	{/if}

	<link rel="canonical" href={currentUrl} />
</svelte:head>
