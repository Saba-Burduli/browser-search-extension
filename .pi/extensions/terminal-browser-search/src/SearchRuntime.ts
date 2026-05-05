import { loadConfig } from "./Config";
import { CommandParser } from "./CommandParser";
import { QueryEncoder } from "./QueryEncoder";
import { isTrustedSearchUrl } from "./UrlPolicy";
import { createBrowserLauncher } from "./BrowserLauncherFactory";
import { DynamicContextHook } from "./DynamicContextHook";
import { CompactionStrategy } from "./CompactionStrategy";
import { loadAgentContext } from "./AgentContextResolver";
import { checkForUpdate } from "./UpdateChecker";
import type {
  BeforeTurnInput,
  BeforeTurnResult,
  CommandExecutionResult,
  CompactionInput,
  CompactionResult,
  RuntimeOptions,
} from "./types";

export class SearchRuntime {
  private readonly config;
  private readonly parser;
  private readonly encoder;
  private readonly launcher;
  private readonly dynamicContext;
  private readonly compaction;
  private updateCheckPromise: Promise<void> | null = null;

  constructor(private readonly options: RuntimeOptions) {
    this.config = loadConfig(options.projectRoot);
    this.parser = new CommandParser();
    this.encoder = new QueryEncoder(this.config.searchEngine);
    this.launcher = createBrowserLauncher(this.config);
    this.dynamicContext = new DynamicContextHook(this.config);
    this.compaction = new CompactionStrategy(this.config);
  }

  async runCommand(rawInput: string): Promise<CommandExecutionResult> {
    const parsed = this.parser.parse(rawInput);

    if (parsed.kind === "not-search") {
      return {
        ok: false,
        code: 2,
        launched: false,
        message: "Invalid command. Usage: search <query>",
      };
    }

    if (parsed.kind === "invalid") {
      return {
        ok: false,
        code: 2,
        launched: false,
        message: parsed.error,
      };
    }

    const query = parsed.command.query;
    const url = this.encoder.buildSearchUrl(query);

    if (!isTrustedSearchUrl(url, this.config.searchEngine)) {
      return {
        ok: false,
        code: 3,
        launched: false,
        message: "Blocked untrusted URL generation.",
      };
    }

    const shouldDryRun = this.config.dryRun || parsed.command.dryRun || !this.config.autoOpenBrowser;
    if (shouldDryRun) {
      return {
        ok: true,
        code: 0,
        launched: false,
        message: url,
        url,
      };
    }

    const availability = await this.launcher.isAvailable();
    if (!availability.ok) {
      return {
        ok: false,
        code: 4,
        launched: false,
        message: `${this.launcher.browserName} unavailable: ${availability.reason || "Unknown reason"}`,
        url,
      };
    }

    const launch = await this.launcher.open(url, {
      incognito: parsed.command.incognito || this.config.incognito,
    });

    return {
      ok: launch.ok,
      code: launch.ok ? 0 : 5,
      launched: launch.ok,
      message: launch.ok ? `Opened: ${url}` : launch.message,
      url,
      commandPreview: launch.commandPreview,
    };
  }

  triggerUpdateCheck(): void {
    if (this.updateCheckPromise) return;

    this.updateCheckPromise = checkForUpdate(this.config).finally(() => {
      this.updateCheckPromise = null;
    });
  }

  beforeTurn(input: BeforeTurnInput): BeforeTurnResult {
    return this.dynamicContext.beforeTurn(input);
  }

  compactContext(input: CompactionInput): CompactionResult {
    return this.compaction.compact(input);
  }

  loadAgentContextSnapshot(): { combined: string; sources: string[] } {
    return loadAgentContext(this.options.projectRoot, this.options.cwd || process.cwd());
  }
}
