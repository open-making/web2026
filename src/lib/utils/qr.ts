/* A QR code as a single-path SVG string, in one riso ink.

   We build the SVG by hand from qrcode's synchronous bit-matrix (QRCode.create)
   rather than its async toString(): it stays synchronous so print routes can
   call it inline, and it lets us paint the modules in --color-violet/blue on a
   transparent ground so the code prints as one clean ink pass, no anti-aliased
   greys. Vector, so it stays sharp blown up to A4. */
import QRCode from 'qrcode';

const INKS = {
	violet: '#321871',
	blue: '#3255a4',
	pink: '#ff48b0'
} as const;

export type QrInk = keyof typeof INKS;

export interface QrOptions {
	/** ink colour of the modules (default violet) */
	ink?: QrInk;
	/** quiet-zone border in modules (default 2) */
	margin?: number;
}

/**
 * Returns a self-contained <svg> string with a 0..size viewBox (size = module
 * count incl. margin), so it scales to whatever CSS width you give it.
 */
export function qrSvg(text: string, opts: QrOptions = {}): string {
	const { ink = 'violet', margin = 2 } = opts;
	// H error correction: survives a printed-and-scanned wall poster.
	const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
	const count = qr.modules.size;
	const data = qr.modules.data;
	const dim = count + margin * 2;

	let path = '';
	for (let row = 0; row < count; row++) {
		for (let col = 0; col < count; col++) {
			if (data[row * count + col]) {
				const x = col + margin;
				const y = row + margin;
				// one unit square per dark module; merged into a single path
				path += `M${x} ${y}h1v1h-1z`;
			}
		}
	}

	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" ` +
		`shape-rendering="crispEdges" width="100%" height="100%">` +
		`<path d="${path}" fill="${INKS[ink]}"/></svg>`
	);
}
