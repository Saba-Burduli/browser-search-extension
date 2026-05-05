import type { ParseResult, ParsedSearchCommand } from "./types";

export class CommandParser {
  private readonly intentRegex = /\b(search|google|look\s+up|find\s+online|find|web\s+search)\b/i;

  isLikelySearchIntent(text: string): boolean {
    return this.intentRegex.test((text || "").trim());
  }

  parse(text: string): ParseResult {
    const raw = (text || "").trim();
    if (!/^search\b/i.test(raw)) {
      return { kind: "not-search" };
    }

    const body = raw.replace(/^search\b/i, "").trim();
    if (!body) {
      return { kind: "invalid", error: "Empty query. Usage: search <query>" };
    }

    const tokens = this.tokenize(body);
    if (tokens.length === 0) {
      return { kind: "invalid", error: "Empty query. Usage: search <query>" };
    }

    let incognito = false;
    let dryRun = false;
    const queryParts: string[] = [];

    for (const token of tokens) {
      if (token === "--incognito" || token === "-i") {
        incognito = true;
        continue;
      }
      if (token === "--dry-run") {
        dryRun = true;
        continue;
      }
      queryParts.push(token);
    }

    const query = this.sanitizeQuery(queryParts.join(" "));
    if (!query) {
      return { kind: "invalid", error: "Empty query after sanitization." };
    }

    const command: ParsedSearchCommand = {
      query,
      incognito,
      dryRun,
    };

    return { kind: "search", command };
  }

  private tokenize(input: string): string[] {
    const tokens: string[] = [];
    const regex = /"([^"]*)"|'([^']*)'|`([^`]*)`|([^\s]+)/g;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(input)) !== null) {
      const value = match[1] ?? match[2] ?? match[3] ?? match[4] ?? "";
      if (value.trim()) tokens.push(value.trim());
    }
    return tokens;
  }

  private sanitizeQuery(query: string): string {
    return query
      .replace(/[\u0000-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 512);
  }
}
