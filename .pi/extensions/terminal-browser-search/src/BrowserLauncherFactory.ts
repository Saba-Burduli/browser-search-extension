import { MacOSBrowserLauncher } from "./launchers/MacOSBrowserLauncher";
import type { ExtensionConfig, IBrowserLauncher } from "./types";

export function createBrowserLauncher(config: ExtensionConfig): IBrowserLauncher {
  switch (config.defaultBrowser) {
    case "firefox":
      return new MacOSBrowserLauncher("firefox", "Firefox", true);
    case "safari":
      return new MacOSBrowserLauncher("safari", "Safari", false);
    case "chrome":
    default:
      return new MacOSBrowserLauncher("chrome", "Google Chrome", true);
  }
}
