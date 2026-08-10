/* One eager glob over every processed screenshot, shared by the print posters.

   The site's Cover/Archive/SevenSites each keep their own glob; the posters pull
   from the same image files, so we centralise the lookup here. Resolving by
   trailing filename lets callers use the per-group index.json maps (url → file)
   without knowing which subfolder the webp lives in. */
const all = import.meta.glob('$lib/assets/images/**/*.webp', {
	eager: true,
	import: 'default'
}) as Record<string, string>;

/** Resolve a processed webp by its bare filename (e.g. "kiki.webp"). */
export function byFile(file: string): string | undefined {
	return Object.entries(all).find(([p]) => p.endsWith(`/${file}`))?.[1];
}

/**
 * Resolve every screenshot a student attached to their work, in exercise order.
 * `groups` are (manifest slice, url→file index) pairs; returns just the srcs.
 */
export function studentWork(
	slug: string,
	groups: [{ slug: string; url: string }[], Record<string, string>][]
): string[] {
	const out: string[] = [];
	for (const [entries, index] of groups) {
		const entry = entries.find((e) => e.slug === slug);
		if (!entry) continue;
		const file = index[entry.url];
		const src = file ? byFile(file) : undefined;
		if (src) out.push(src);
	}
	return out;
}
