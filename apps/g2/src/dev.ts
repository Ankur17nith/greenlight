/**
 * Dev-only shortcut for the simulator, where the pairing form cannot be typed into:
 * open the app with ?token=<session token>. Always null outside `vite dev`,
 * so a production build never reads a token from the URL.
 */
export function devToken(search: string, isDev: boolean): string | null {
  if (!isDev) return null;
  const t = new URLSearchParams(search).get("token");
  return t && /^[A-Za-z0-9_-]{8,128}$/.test(t) ? t : null;
}
