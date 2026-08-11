import { json } from '@sveltejs/kit';
import studentDatabase from '$lib/data/student-database.json';
import type { RequestHandler } from './$types';

/**
 * The class webring's member list, consumed at runtime by static/webring.js.
 * Only students who submitted a live site (see the "[STUDENT] …" issue) are in the ring.
 * Prerendered to build/webring.json (served with permissive CORS via netlify.toml).
 */
export const prerender = true;

type WebringRow = { name: string; slug: string; url: string; isStudent?: boolean };
type WebringMember = { name: string; slug: string; url: string };

// The generator assembles studentDatabase.webring (roster students who submitted a
// site + ring-only extras). The widget only needs name/slug/url.
function ringMembers(): WebringMember[] {
	const ring = (studentDatabase.webring ?? []) as WebringRow[];
	return ring
		.map((m) => ({ name: m.name, slug: m.slug, url: m.url }))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export const GET: RequestHandler = () => json(ringMembers());
