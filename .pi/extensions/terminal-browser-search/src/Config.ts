import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { BrowserKind, ExtensionConfig } from "./types";

const DEFAULT_CONFIG: ExtensionConfig = {
  autoOpenBrowser: true,
  dryRun: false,
  defaultBrowser: "system",
  searchEngine: {
    name: "google",
    baseUrl: "https://www.google.com/search",
    queryParam: "q",
    allowedHosts: ["www.google.com", "google.com"],
  },
  incognito: false,
  context: {
    maxMessagesForSearchIntent: 12,
  },
  compaction: {
    enabled: true,
    maxRecentQueries: 10,
    maxCommandHistory: 20,
    keepRecentMessages: 10,
  },
};

function parseBoolean(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
}

function parseBrowserKind(value: string | undefined): BrowserKind | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (
    normalized === "system" ||
    normalized === "chrome" ||
    normalized === "firefox" ||
    normalized === "safari" ||
    normalized === "brave" ||
    normalized === "dia"
  ) {
    return normalized;
  }

  return undefined;
}

export function loadConfig(projectRoot: string): ExtensionConfig {
  const configPath = join(projectRoot, ".pi", "terminal-browser-search.config.json");
  let parsed = {} as Partial<ExtensionConfig>;

  if (existsSync(configPath)) {
    try {
      parsed = JSON.parse(readFileSync(configPath, "utf8")) as Partial<ExtensionConfig>;
    } catch {
      parsed = {};
    }
  }

  const envAutoOpen = parseBoolean(process.env.PI_SEARCH_AUTO_OPEN);
  const envDryRun = parseBoolean(process.env.PI_SEARCH_DRY_RUN);
  const envIncognito = parseBoolean(process.env.PI_SEARCH_INCOGNITO);
  const envBrowser = parseBrowserKind(process.env.PI_SEARCH_BROWSER);
  const parsedBrowser = parseBrowserKind((parsed as { defaultBrowser?: string }).defaultBrowser);

  const merged: ExtensionConfig = {
    ...DEFAULT_CONFIG,
    ...parsed,
    defaultBrowser: parsedBrowser ?? DEFAULT_CONFIG.defaultBrowser,
    searchEngine: {
      ...DEFAULT_CONFIG.searchEngine,
      ...(parsed.searchEngine ?? {}),
      allowedHosts: parsed.searchEngine?.allowedHosts ?? DEFAULT_CONFIG.searchEngine.allowedHosts,
    },
    context: {
      ...DEFAULT_CONFIG.context,
      ...(parsed.context ?? {}),
    },
    compaction: {
      ...DEFAULT_CONFIG.compaction,
      ...(parsed.compaction ?? {}),
    },
  };

  if (envAutoOpen !== undefined) merged.autoOpenBrowser = envAutoOpen;
  if (envDryRun !== undefined) merged.dryRun = envDryRun;
  if (envIncognito !== undefined) merged.incognito = envIncognito;
  if (envBrowser !== undefined) merged.defaultBrowser = envBrowser;

  return merged;
}
