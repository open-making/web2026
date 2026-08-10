import { error } from '@sveltejs/kit';
import { QR_TARGETS, type QrTargetKey } from '$lib/data/collateral';
import { qrSvg } from '$lib/utils/qr';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

const ORIENTATIONS = ['portrait', 'landscape'] as const;

export const entries: EntryGenerator = () =>
	Object.keys(QR_TARGETS).flatMap((target) =>
		ORIENTATIONS.map((orientation) => ({ target, orientation }))
	);

export const load: PageLoad = ({ params }) => {
	const target = QR_TARGETS[params.target as QrTargetKey];
	if (!target) throw error(404, 'No such QR target');
	if (params.orientation !== 'portrait' && params.orientation !== 'landscape')
		throw error(404, 'Bad orientation');

	return {
		target,
		orientation: params.orientation as 'portrait' | 'landscape',
		qr: qrSvg(target.url, { ink: 'violet' })
	};
};
