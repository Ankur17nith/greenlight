import localFont from 'next/font/local';

/** Pixel face for display type only (Line style). Geist is SIL OFL licensed. */
export const GeistPixelLine = localFont({
  src: '../node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Line.woff2',
  variable: '--font-geist-pixel-line',
  weight: '500',
  fallback: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
  adjustFontFallback: false,
});
