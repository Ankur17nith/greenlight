/** Backend URL is a build-time value; never put provider keys here. Must also be whitelisted in app.json. */
export const API_URL: string = (import.meta.env?.VITE_API_URL as string | undefined) ?? "http://localhost:3000";
export const POLL_MS = 3000;
export const TOKEN_KEY = "greenlight.token";
