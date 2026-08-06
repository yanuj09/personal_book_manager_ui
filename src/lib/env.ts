/**
 * Runtime configuration, read once and in one place.
 *
 * `NEXT_PUBLIC_API_URL` is the switch that matters: point it at the backend
 * and the app talks to it over HTTP. Leave it unset and the app runs against
 * the in-browser mock so the UI is demoable on its own.
 */
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
const apiUrl =  process.env.PRODUCTION_BASE_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim()  ;

export const env = {
  // Default to local backend so the app does not silently fall back to mock.
  apiUrl: apiBaseUrl || apiUrl || "http://localhost:3567",
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Thumbstack",
} as const;

export const usingMockBackend = env.apiUrl.length === 0;
