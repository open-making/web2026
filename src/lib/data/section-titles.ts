/* every section headline in one place: a taylor swift lyric + the functional
   name pencilled beside it (h2tag). the toc mirrors these. */
export const sections = {
	toc: { title: 'let the games begin', tag: 'in this issue' },
	season: { title: 'long story short', tag: 'the season' },
	sites: { title: 'this is our place, we make the rules', tag: 'the seven sites' },
	archive: { title: 'i remember it all too well', tag: 'from the archive' },
	columns: { title: 'we never go out of style', tag: 'the columns' },
	contributors: { title: 'long live all the magic we made', tag: 'contributors' },
	colophon: { title: 'through the garden gate', tag: 'this course is open source' }
} as const;
