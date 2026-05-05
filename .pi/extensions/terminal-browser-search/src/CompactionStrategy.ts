import type { ChatMessage, CompactionInput, CompactionResult, ExtensionConfig } from "./types";

const SEARCH_COMMAND_RE = /^search\b/i;

export class CompactionStrategy {
  constructor(private readonly config: ExtensionConfig) {}

  compact(input: CompactionInput): CompactionResult {
    if (!this.config.compaction.enabled) {
      return {
        messages: input.messages,
        preservedCommands: [],
        preservedQueries: [],
      };
    }

    const preservedCommands = this.extractRecentCommands(input.messages);
    const preservedQueries = this.extractRecentQueries(preservedCommands);

    const keepRecent = this.config.compaction.keepRecentMessages;
    const recentMessages = input.messages.slice(-keepRecent);
    const importantOlderMessages = input.messages
      .slice(0, Math.max(0, input.messages.length - keepRecent))
      .filter((m) => SEARCH_COMMAND_RE.test((m.content || "").trim()))
      .slice(-Math.max(2, Math.floor(keepRecent / 3)));

    const messages = dedupeMessages([...importantOlderMessages, ...recentMessages]);

    const summary = this.createSummary(input.messages, preservedCommands, preservedQueries);

    return {
      messages,
      summary,
      preservedCommands,
      preservedQueries,
    };
  }

  private extractRecentCommands(messages: ChatMessage[]): string[] {
    const commands = messages
      .map((m) => m.content.trim())
      .filter((content) => SEARCH_COMMAND_RE.test(content));

    return commands.slice(-this.config.compaction.maxCommandHistory);
  }

  private extractRecentQueries(commands: string[]): string[] {
    const queries = commands
      .map((cmd) => cmd.replace(/^search\b\s*/i, "").trim())
      .map((commandTail) =>
        commandTail
          .split(/\s+/)
          .filter((part) => !["--incognito", "-i", "--dry-run"].includes(part))
          .join(" ")
          .trim(),
      )
      .filter((query) => Boolean(query));

    return queries.slice(-this.config.compaction.maxRecentQueries);
  }

  private createSummary(
    messages: ChatMessage[],
    preservedCommands: string[],
    preservedQueries: string[],
  ): string | undefined {
    if (messages.length <= this.config.compaction.keepRecentMessages) {
      return undefined;
    }

    const oldCount = messages.length - this.config.compaction.keepRecentMessages;
    return [
      `Compacted ${oldCount} older messages.`,
      `Preserved command history: ${preservedCommands.length}.`,
      `Preserved recent queries: ${preservedQueries.join(" | ") || "none"}.`,
    ].join(" ");
  }
}

function dedupeMessages(messages: ChatMessage[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  const seen = new Set<string>();

  for (const message of messages) {
    const key = `${message.role}::${message.timestamp || ""}::${message.content}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(message);
  }

  return out;
}
