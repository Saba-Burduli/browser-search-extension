import type { SearchEngineConfig } from "./types";

export class QueryEncoder {
  constructor(private readonly engine: SearchEngineConfig) {}

  buildSearchUrl(query: string): string {
    const url = new URL(this.engine.baseUrl);
    url.searchParams.set(this.engine.queryParam, query);
    return url.toString();
  }
}
