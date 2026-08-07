import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import studentDatabase from '$lib/data/student-database.json';
import { getDisplayName } from '$lib/components/utils';

export const load: PageLoad = async ({ params, fetch }) => {
	const { username } = params;

	// Find student in database by matching the lowercase display name
	const student = Object.values(studentDatabase.students).find(
		(s: any) => getDisplayName(s.name, s.username, 'lowercase') === username
	);

	if (!student) {
		throw error(404, 'Student not found');
	}

	// Use the actual username from the database for fetching data
	const actualUsername = student.username;
	
	// Try to load detailed student data
	let studentData = null;
	try {
		const module = await import(`$lib/data/students/${actualUsername}.json`);
		studentData = module.default;
	} catch (e) {
		// Detailed data not available, continue with basic data
		console.log(`No detailed data found for ${actualUsername}`);
	}

	return {
		student,
		studentData
	};
};