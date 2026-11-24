// Builds the Greenlight logo files into public/ from code, so the wordmark is real
// outlines (no font needed to display it). Run: pnpm --filter @greenlight/web logo
//
// The mark: two lenses (the G2 glasses). The right lens is lit green with a check:
// the "greenlight". The wordmark is Geist Bold (SIL Open Font License), outlined.
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const opentype = require('opentype.js');
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'public');
mkdirSync(out, { recursive: true });

const fontFile = path.join(here, '..', 'node_modules', 'geist', 'dist', 'fonts', 'geist-sans', 'Geist-Bold.ttf');
const font = opentype.loadSync(fontFile);

const themes = {
  light: { ink: '#0d1210', lens: '#14a653', check: '#ffffff', bg: '#f4f3ee' },
  dark: { ink: '#f1f3ee', lens: '#2ee57a', check: '#06150c', bg: '#070908' },
};

// Mark geometry in a 64 x 64 box.
function mark(t) {
  return `
  <circle cx="19" cy="32" r="12" fill="none" stroke="${t.ink}" stroke-width="4.5"/>
  <circle cx="45" cy="32" r="14.25" fill="${t.lens}"/>
  <path d="M37.5 32.5 l5.2 5.2 l9.3 -10.4" fill="none" stroke="${t.check}" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function markSvg(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Greenlight">${mark(t)}
</svg>
`;
}

function logoSvg(t) {
  const size = 34;
  const text = 'Greenlight';
  const p = font.getPath(text, 0, 0, size, { kerning: true, letterSpacing: -0.025 });
  const bb = p.getBoundingBox();
  const gap = 12;
  const markH = 48; // mark drawn at 48 px tall, so scale 0.75
  const s = markH / 64;
  const textX = 64 * s + gap - bb.x1;
  // vertically centre the x-height-ish block on the mark's centre line
  const capH = font.tables.os2.sCapHeight ? (font.tables.os2.sCapHeight / font.unitsPerEm) * size : size * 0.7;
  const baseline = markH / 2 + capH / 2;
  const tp = font.getPath(text, textX, baseline, size, { kerning: true, letterSpacing: -0.025 });
  const d = tp.toPathData(2);
  const width = Math.ceil(textX + (bb.x2 - bb.x1) + 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${markH}" width="${width}" height="${markH}" role="img" aria-label="Greenlight">
  <g transform="scale(${s})">${mark(t)}
  </g>
  <path d="${d}" fill="${t.ink}"/>
</svg>
`;
}

function faviconSvg(t) {
  // Rounded square tile with the mark, for tabs and app icons.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="${themes.dark.bg}"/>
  <g transform="translate(6 6) scale(0.8125)">${mark(themes.dark)}
  </g>
</svg>
`;
}

writeFileSync(path.join(out, 'logo-mark.svg'), markSvg(themes.light));
writeFileSync(path.join(out, 'logo-mark-dark.svg'), markSvg(themes.dark));
writeFileSync(path.join(out, 'logo.svg'), logoSvg(themes.light));
writeFileSync(path.join(out, 'logo-dark.svg'), logoSvg(themes.dark));
writeFileSync(path.join(out, 'icon.svg'), faviconSvg());
console.log('wrote logo-mark(.svg|-dark.svg), logo(.svg|-dark.svg), icon.svg to public/');
