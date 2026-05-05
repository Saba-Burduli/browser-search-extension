import { execFileSync } from "node:child_process";
import { MacOSBrowserLauncher } from "./launchers/MacOSBrowserLauncher";
import type { BrowserKind, BrowserLaunchOptions, BrowserLaunchResult, ExtensionConfig, IBrowserLauncher } from "./types";

type ExplicitBrowserKind = Exclude<BrowserKind, "system">;

type BrowserProfile = {
  appName: string;
  incognitoArgs: string[];
  bundleIds: string[];
};

const BROWSER_PROFILES: Record<ExplicitBrowserKind, BrowserProfile> = {
  chrome: {
    appName: "Google Chrome",
    incognitoArgs: ["--incognito"],
    bundleIds: ["com.google.chrome"],
  },
  firefox: {
    appName: "Firefox",
    incognitoArgs: ["-private-window"],
    bundleIds: ["org.mozilla.firefox"],
  },
  safari: {
    appName: "Safari",
    incognitoArgs: [],
    bundleIds: ["com.apple.safari"],
  },
  brave: {
    appName: "Brave Browser",
    incognitoArgs: ["--incognito"],
    bundleIds: ["com.brave.browser", "com.brave.browser.beta", "com.brave.browser.nightly"],
  },
  dia: {
    appName: "Dia",
    incognitoArgs: ["--incognito"],
    bundleIds: ["company.thebrowser.dia"],
  },
};

const DEFAULT_BROWSER_LOOKUP_SCRIPT =
  'id of app (path to default application for URL "https://www.google.com")';

function normalizeBundleId(bundleId: string): string {
  return bundleId.trim().toLowerCase();
}

function createExplicitLauncher(browser: ExplicitBrowserKind): IBrowserLauncher {
  const profile = BROWSER_PROFILES[browser];
  return new MacOSBrowserLauncher(browser, profile.appName, profile.incognitoArgs);
}

function resolveBrowserFromBundleId(bundleId: string): ExplicitBrowserKind | undefined {
  const normalized = normalizeBundleId(bundleId);

  for (const [browser, profile] of Object.entries(BROWSER_PROFILES) as [ExplicitBrowserKind, BrowserProfile][]) {
    if (profile.bundleIds.some((id) => id === normalized)) {
      return browser;
    }
  }

  if (normalized.includes("brave")) return "brave";
  if (normalized.includes("firefox")) return "firefox";
  if (normalized.includes("safari")) return "safari";
  if (normalized.includes("chrome")) return "chrome";
  if (normalized.includes(".dia") || normalized.includes("dia")) return "dia";
  return undefined;
}

function detectMacOSDefaultBrowser(): ExplicitBrowserKind | undefined {
  try {
    const bundleId = execFileSync("osascript", ["-e", DEFAULT_BROWSER_LOOKUP_SCRIPT], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .toLowerCase();
    if (!bundleId) return undefined;
    return resolveBrowserFromBundleId(bundleId);
  } catch {
    return undefined;
  }
}

class MacOSSystemBrowserLauncher implements IBrowserLauncher {
  private delegate: IBrowserLauncher | null = null;
  private delegateName = "system-default";

  constructor(private readonly fallback: ExplicitBrowserKind) {}

  get browserName(): string {
    return this.delegateName;
  }

  async isAvailable(): Promise<{ ok: boolean; reason?: string }> {
    return this.resolveDelegate().isAvailable();
  }

  async open(url: string, options?: BrowserLaunchOptions): Promise<BrowserLaunchResult> {
    return this.resolveDelegate().open(url, options);
  }

  private resolveDelegate(): IBrowserLauncher {
    if (this.delegate) return this.delegate;

    const detected = detectMacOSDefaultBrowser();
    const selected = detected ?? this.fallback;
    this.delegateName = detected ? `${selected} (system-default)` : `${selected} (fallback)`;
    this.delegate = createExplicitLauncher(selected);
    return this.delegate;
  }
}

export function createBrowserLauncher(config: ExtensionConfig): IBrowserLauncher {
  if (config.defaultBrowser === "system") {
    return new MacOSSystemBrowserLauncher("chrome");
  }

  return createExplicitLauncher(config.defaultBrowser);
}
