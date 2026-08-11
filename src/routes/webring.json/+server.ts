import { json } from '@sveltejs/kit';
import studentDatabase from '$lib/data/student-database.json';
import type { RequestHandler } from './$types';

/**
 * The class webring's member list, consumed at runtime by static/webring.js.
 * Only students who submitted a live site (see the "[STUDENT] …" issue) are in the ring.
 * Prerendered to build/webring.json (served with permissive CORS via netlify.toml).
 */
export const prerender = true;

type StudentRow = { name: string; slug: string; website: string | null };
type WebringMember = { name: string; slug: string; url: string };

function ringMembers(): WebringMember[] {
	const students = Object.values(studentDatabase.students as Record<string, StudentRow>);
	return students
		.filter((s): s is StudentRow & { website: string } => Boolean(s.website))
		.map((s) => ({ name: s.name, slug: s.slug, url: s.website }))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export const GET: RequestHandler = () => json(ringMembers());
