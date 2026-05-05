import type { SearchEngineConfig } from "./types";

export function isTrustedSearchUrl(urlText: string, engine: SearchEngineConfig): boolean {
  try {
    const url = new URL(urlText);

    if (url.protocol !== "https:") return false;

    const host = url.hostname.toLowerCase();
    const allowedHosts = (engine.allowedHosts || []).map((h) => h.toLowerCase());
    if (!allowedHosts.includes(host)) return false;

    const queryValue = url.searchParams.get(engine.queryParam);
    if (!queryValue || !queryValue.trim()) return false;

    if (engine.name.toLowerCase() === "google") {
      return url.pathname === "/search";
    }

    return true;
  } catch {
    return false;
  }
}
