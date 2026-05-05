import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { request } from "node:https";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import type { ExtensionConfig } from "./types";

const execFileAsync = promisify(execFile);

type UpdateCache = {
  lastCheckedAt?: string;
  lastNotifiedVersion?: string;
  latestVersion?: string;
};

type GitHubRelease = {
  tag_name?: string;
};

const CACHE_FILE = join(homedir(), ".pi", "cache", "pi-browser-search-extension", "update-check.json");
const PACKAGE_JSON_CANDIDATES = [
  resolve(__dirname, "..", "..", "..", "..", "package.json"),
  resolve(__dirname, "..", "package.json"),
];

function sanitizeVersion(value: string): string {
  return value.trim().replace(/^v/i, "");
}

function parseSemver(value: string): [number, number, number] | null {
  const normalized = sanitizeVersion(value);
  const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareVersions(left: string, right: string): number {
  const a = parseSemver(left);
  const b = parseSemver(right);
  if (!a || !b) return 0;

  for (let i = 0; i < 3; i += 1) {
    if (a[i] > b[i]) return 1;
    if (a[i] < b[i]) return -1;
  }
  return 0;
}

function escapeAppleScriptLiteral(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function parseRepository(value: string): { owner: string; repo: string } | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

function getCurrentPackageVersion(): string | undefined {
  for (const candidate of PACKAGE_JSON_CANDIDATES) {
    if (!existsSync(candidate)) continue;
    try {
      const parsed = JSON.parse(readFileSync(candidate, "utf8")) as {
        name?: string;
        version?: string;
      };
      if (typeof parsed.version !== "string") continue;
      if (typeof parsed.name === "string" && parsed.name.includes("pi-browser-search-extension")) {
        return sanitizeVersion(parsed.version);
      }
    } catch {
      // Ignore malformed package metadata.
    }
  }

  return undefined;
}

function httpGetJson(url: string): Promise<unknown> {
  return new Promise((resolvePromise, rejectPromise) => {
    const req = request(
      url,
      {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "pi-browser-search-extension",
        },
      },
      (response) => {
        const statusCode = response.statusCode ?? 0;
        let body = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (statusCode < 200 || statusCode >= 300) {
            rejectPromise(new Error(`Update endpoint returned status ${statusCode}`));
            return;
          }

          try {
            resolvePromise(JSON.parse(body));
          } catch {
            rejectPromise(new Error("Failed to parse update JSON response"));
          }
        });
      },
    );

    req.setTimeout(5000, () => {
      req.destroy(new Error("Update check timeout"));
    });
    req.on("error", rejectPromise);
    req.end();
  });
}

async function loadCache(): Promise<UpdateCache> {
  try {
    const raw = await readFile(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw) as UpdateCache;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function saveCache(cache: UpdateCache): Promise<void> {
  try {
    await mkdir(dirname(CACHE_FILE), { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf8");
  } catch {
    // Cache write failures should never break search behavior.
  }
}

function shouldCheckNow(cache: UpdateCache, intervalHours: number): boolean {
  if (!cache.lastCheckedAt) return true;
  const last = Date.parse(cache.lastCheckedAt);
  if (Number.isNaN(last)) return true;
  const elapsed = Date.now() - last;
  return elapsed >= intervalHours * 60 * 60 * 1000;
}

async function resolveLatestVersionFromGitHub(repository: string): Promise<string | undefined> {
  const parsedRepo = parseRepository(repository);
  if (!parsedRepo) return undefined;

  const releaseApi = `https://api.github.com/repos/${parsedRepo.owner}/${parsedRepo.repo}/releases/latest`;
  const response = (await httpGetJson(releaseApi)) as GitHubRelease;
  if (!response?.tag_name || typeof response.tag_name !== "string") return undefined;
  return sanitizeVersion(response.tag_name);
}

async function notifyUpdate(config: ExtensionConfig, currentVersion: string, latestVersion: string): Promise<void> {
  const message = `Update available: v${currentVersion} -> v${latestVersion}`;

  if (config.updates.notify === "none") return;

  if (config.updates.notify === "macos-notification" && process.platform === "darwin") {
    const escapedMessage = escapeAppleScriptLiteral(message);
    const script = `display notification "${escapedMessage}" with title "Pi Browser Search Extension"`;
    try {
      await execFileAsync("osascript", ["-e", script], { timeout: 3000 });
      return;
    } catch {
      // Fall back to terminal output if notification fails.
    }
  }

  if (config.updates.notify === "terminal" || config.updates.notify === "macos-notification") {
    // Keep output compact and explicit.
    console.warn(`[pi-browser-search-extension] ${message}`);
  }
}

export async function checkForUpdate(config: ExtensionConfig): Promise<void> {
  if (!config.updates.enabled) return;
  if (config.updates.source !== "github-releases") return;

  const currentVersion = getCurrentPackageVersion();
  if (!currentVersion) return;

  const cache = await loadCache();
  if (!shouldCheckNow(cache, config.updates.checkIntervalHours)) return;

  const now = new Date().toISOString();
  const latestVersion = await resolveLatestVersionFromGitHub(config.updates.repository).catch(() => undefined);
  if (!latestVersion) {
    await saveCache({ ...cache, lastCheckedAt: now });
    return;
  }

  const nextCache: UpdateCache = {
    ...cache,
    lastCheckedAt: now,
    latestVersion,
  };

  const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;
  if (hasUpdate && cache.lastNotifiedVersion !== latestVersion) {
    await notifyUpdate(config, currentVersion, latestVersion);
    nextCache.lastNotifiedVersion = latestVersion;
  }

  await saveCache(nextCache);
}
