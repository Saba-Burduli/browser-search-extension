import { CommandParser } from "./CommandParser";
import type { BeforeTurnInput, BeforeTurnResult, ExtensionConfig } from "./types";

export class DynamicContextHook {
  private readonly parser = new CommandParser();

  constructor(private readonly config: ExtensionConfig) {}

  beforeTurn(input: BeforeTurnInput): BeforeTurnResult {
    const likelySearchIntent = this.parser.isLikelySearchIntent(input.userInput);
    const messageLimit = likelySearchIntent
      ? this.config.context.maxMessagesForSearchIntent
      : Math.max(4, Math.floor(this.config.context.maxMessagesForSearchIntent / 2));

    const filteredMessages = input.messages.slice(-messageLimit);
    const injectedSystemHints: string[] = [];

    if (likelySearchIntent) {
      injectedSystemHints.push(
        "User likely wants a browser search. Consider using search command.",
      );
    }

    return {
      likelySearchIntent,
      injectedSystemHints,
      filteredMessages,
    };
  }
}
