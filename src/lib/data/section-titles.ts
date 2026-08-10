/* every section headline in one place: a one direction lyric + the functional
	 name pencilled beside it (h2tag), plus the lede that opens the section.
	 the toc mirrors the titles. */
export const sections = {
	toc: { title: 'made in the a.m.', tag: 'in this showcase' },
	notes: {
		title: 'the story of my life',
		tag: 'notes',
		desc: "We ended every class day with a 'dev note', reflecting on the day's work. These become public diary entries that trace the class's progress through this course."
	},
	sites: {
		title: 'gotta be you',
		tag: 'personal sites',
		desc: "We're designers learning to code, not for the sake of code, or even design, but to build our own corners of the web end to end, and absorb the ethos of the IndieWeb along the way. These spaces grew out of much talking, reading, and exploring what a non-corporate, non-industrial, altogether more personal web could look like."
	},
	archive: {
		title: 'midnight memories',
		tag: 'experiments',
		desc: 'At the start of the course, we built monstrosities, typeset fairy tales and newspapers, and random clocks to get a feel for HTML and CSS.'
	},
	columns: {
		title: 'the best song ever',
		tag: 'quotables',
		desc: 'Over time the dev notes picked up their own habits and had recurring bits like film recommendations, sign-offs and small formats that became something we waited to read each day.'
	},
	contributors: {
		title: 'a whole lot of history',
		tag: 'contributors',
		desc: 'The seven people who made all of this! Explore their individual pages to see what they built, and what they wrote.'
	},
	awards: {
		title: 'one thing',
		tag: 'the awards',
		desc: 'Every issue needs a prize-giving. Seven people, and the one thing each of them did better than anyone else.'
	},
	colophon: {
		title: 'more than this',
		tag: 'this course is open source',
		desc: 'Explore the full curriculum, teaching materials, and student work. This course is open source is freely available for anyone to go through.'
	}
} as const;
