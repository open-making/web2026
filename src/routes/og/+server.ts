import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { html as toReactNode } from 'satori-html';
import Card from '$lib/components/ShareCard.svelte';
import { render } from 'svelte/server';
import studentDatabase from '$lib/data/student-database.json';
  import { getDisplayName } from '$lib/components/utils.js';
const height = 627;
const width = 1200;

// Load fonts - use reliable sources
const monoFont = await fetch(
    'https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf'
);
const monoFontData = await monoFont.arrayBuffer();

const boldFont = await fetch(
    'https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Bold.ttf'
);
const boldFontData = await boldFont.arrayBuffer();

/** @type {import('./$types').RequestHandler} */
export const GET = async ({ url }) => {
    const username = url.searchParams.get('username');
    const studentName = url.searchParams.get('studentName') ?? 'Student Name';
    const galleryUrl = url.searchParams.get('galleryUrl') ?? 'web2025-gallery.netlify.app';
    const commits = parseInt(url.searchParams.get('commits') ?? '0');
    const notes = parseInt(url.searchParams.get('notes') ?? '0');
    const images = url.searchParams.get('images')?.split(',') ?? [];
    const pageType = url.searchParams.get('pageType') ?? 'student';

    // If username is provided, get student data
    let studentData = null;
    if (username && studentDatabase.students[username]) {
        studentData = studentDatabase.students[username];
    }

    const result = render(Card, {
        props: {
            studentName: studentData?.name || studentName,
            studentUsername: getDisplayName(studentData.name || studentName, username || '', 'lowercase'),
            galleryUrl: studentData?.website?.replace('https://', '').replace('http://', '') || galleryUrl,
            commits: studentData?.devNotes?.length || commits,
            notes: studentData?.devNotes?.length || notes,
            images: images.filter(Boolean) // Remove empty strings
        }
    });

    // Convert Svelte HTML to React element for Satori
    const element = toReactNode(result.body);

    const svg = await satori(element, {
        fonts: [
            {
                name: 'JetBrains Mono',
                data: monoFontData,
                style: 'normal',
                weight: 400
            },
            {
                name: 'JetBrains Mono',
                data: boldFontData,
                style: 'normal',
                weight: 700
            }
        ],
        height,
        width
    });

    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: width
        }
    });

    const image = resvg.render();

    return new Response(image.asPng(), {
        headers: {
            'content-type': 'image/png',
            'cache-control': 'public, max-age=3600'
        }
    });
};