#!/usr/bin/env node

// One command to regenerate every collateral asset:
//   1. favicons  → static/ (no server needed)
//   2. boot `vite preview` (the built site, base path and bundled fonts intact)
//   3. sharecard → static/sharecard.jpg
//   4. posters   → collateral/posters/*.pdf + *.png
//   5. extra     → collateral/{wordmark,cards,collages}/*  (wordmark, cards, collages)
//   6. tear the preview server down
//
// Assumes `vite build` has already run (the preview serves build/). Run
// `pnpm build` first, or use `pnpm collateral` which chains it (see package.json).

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// an uncommon, strict port so we never drift onto a stale preview server
const PORT = Number(process.env.COLLATERAL_PORT) || 4319;
const BASE_URL = `http://localhost:${PORT}`;

function sh(cmd, args, opts = {}) {
	return new Promise((resolve, reject) => {
		const p = spawn(cmd, args, { stdio: 'inherit', cwd: path.join(__dirname, '..'), ...opts });
		p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
		p.on('error', reject);
	});
}

async function waitForServer(url, tries = 60) {
	for (let i = 0; i < tries; i++) {
		try {
			const r = await fetch(url);
			if (r.ok || r.status === 404) return; // server is answering
		} catch {
			/* not up yet */
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	throw new Error(`preview server never came up at ${url}`);
}

async function main() {
	console.log('▸ favicons');
	await sh('node', ['scripts/favicons.js']);

	console.log('▸ starting preview server');
	// spawn the vite binary directly (not via `pnpm preview`): SIGTERM then exits
	// cleanly instead of the pnpm wrapper printing an ELIFECYCLE on teardown
	const viteBin = path.join(__dirname, '..', 'node_modules', '.bin', 'vite');
	const preview = spawn(viteBin, ['preview', '--port', String(PORT), '--strictPort'], {
		cwd: path.join(__dirname, '..'),
		stdio: 'inherit'
	});

	try {
		await waitForServer(`${BASE_URL}/web2026/showcase/`);
		console.log('▸ share card');
		await sh('node', ['scripts/sharecard.js', '--base-url', BASE_URL]);
		console.log('▸ posters');
		await sh('node', ['scripts/posters.js', '--base-url', BASE_URL]);
		console.log('▸ wordmark · cards · collages');
		await sh('node', ['scripts/collateral-extra.js', '--base-url', BASE_URL]);
	} finally {
		try {
			process.kill(-preview.pid, 'SIGTERM'); // whole process group
		} catch {
			preview.kill('SIGTERM');
		}
	}
	console.log('\n✅ collateral regenerated');
	process.exit(0); // don't inherit the killed preview's exit code
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
