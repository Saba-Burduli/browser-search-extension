import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { BrowserLaunchOptions, BrowserLaunchResult, IBrowserLauncher } from "../types";

const execFileAsync = promisify(execFile);

export class MacOSBrowserLauncher implements IBrowserLauncher {
  constructor(
    public readonly browserName: string,
    private readonly appName: string,
    private readonly supportsIncognito: boolean,
  ) {}

  async isAvailable(): Promise<{ ok: boolean; reason?: string }> {
    try {
      await execFileAsync("open", ["-Ra", this.appName]);
      return { ok: true };
    } catch {
      return { ok: false, reason: `${this.appName} is not installed or not discoverable by macOS.` };
    }
  }

  async open(url: string, options?: BrowserLaunchOptions): Promise<BrowserLaunchResult> {
    const incognito = Boolean(options?.incognito && this.supportsIncognito);
    const args = this.buildArgs(url, incognito);

    try {
      await execFileAsync("open", args);
      return {
        ok: true,
        message: incognito
          ? `Opened ${this.appName} in private mode.`
          : `Opened ${this.appName}.`,
        commandPreview: this.preview(args),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown launcher error";
      return {
        ok: false,
        message: `Failed to open browser: ${message}`,
        commandPreview: this.preview(args),
      };
    }
  }

  private buildArgs(url: string, incognito: boolean): string[] {
    if (!incognito) {
      return ["-a", this.appName, url];
    }

    if (this.appName === "Google Chrome") {
      return ["-a", this.appName, "--args", "--incognito", url];
    }

    if (this.appName === "Firefox") {
      return ["-a", this.appName, "--args", "-private-window", url];
    }

    if (this.appName === "Safari") {
      return ["-a", this.appName, url];
    }

    return ["-a", this.appName, url];
  }

  private preview(args: string[]): string {
    return `open ${args.map(this.quoteIfNeeded).join(" ")}`;
  }

  private quoteIfNeeded(value: string): string {
    return /\s/.test(value) ? `"${value}"` : value;
  }
}
