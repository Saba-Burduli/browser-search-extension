export interface SearchEngineConfig {
  name: string;
  baseUrl: string;
  queryParam: string;
  allowedHosts: string[];
}

export interface ExtensionConfig {
  autoOpenBrowser: boolean;
  dryRun: boolean;
  defaultBrowser: "chrome" | "firefox" | "safari";
  searchEngine: SearchEngineConfig;
  incognito: boolean;
  context: {
    maxMessagesForSearchIntent: number;
  };
  compaction: {
    enabled: boolean;
    maxRecentQueries: number;
    maxCommandHistory: number;
    keepRecentMessages: number;
  };
}

export interface ParsedSearchCommand {
  query: string;
  incognito: boolean;
  dryRun: boolean;
}

export type ParseResult =
  | { kind: "not-search" }
  | { kind: "invalid"; error: string }
  | { kind: "search"; command: ParsedSearchCommand };

export interface BrowserLaunchResult {
  ok: boolean;
  message: string;
  commandPreview: string;
}

export interface BrowserLaunchOptions {
  incognito?: boolean;
}

export interface IBrowserLauncher {
  readonly browserName: string;
  isAvailable(): Promise<{ ok: boolean; reason?: string }>;
  open(url: string, options?: BrowserLaunchOptions): Promise<BrowserLaunchResult>;
}

export type MessageRole = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp?: string;
}

export interface BeforeTurnInput {
  userInput: string;
  messages: ChatMessage[];
}

export interface BeforeTurnResult {
  likelySearchIntent: boolean;
  injectedSystemHints: string[];
  filteredMessages: ChatMessage[];
}

export interface CompactionInput {
  messages: ChatMessage[];
}

export interface CompactionResult {
  messages: ChatMessage[];
  summary?: string;
  preservedCommands: string[];
  preservedQueries: string[];
}

export interface CommandExecutionResult {
  ok: boolean;
  code: number;
  message: string;
  url?: string;
  launched: boolean;
  commandPreview?: string;
}

export interface RuntimeOptions {
  projectRoot: string;
  cwd?: string;
}

export interface AgentContextSnapshot {
  combined: string;
  sources: string[];
}
