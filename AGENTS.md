# AGENTS.md - Terminal Browser Search Extension

## Purpose
Provide a native Pi Harness extension for terminal-first web search with one command:
- `search <query>`

The extension converts query text into a trusted Google search URL and opens it in Google Chrome by default.

## Available Commands
- `search <query>`
  - Opens `https://www.google.com/search?q=<encoded_query>`
- `search --dry-run <query>`
  - Prints URL only, no browser launch

## Browser Launch Behavior
- macOS default launcher:
  - `open -a "Google Chrome" "<url>"`
- macOS incognito launcher:
  - `open -a "Google Chrome" --args --incognito "<url>"`

Execution is system-level (real process launch), not simulated output.

## Usage Examples
- `search latest dotnet performance`
- `search "pi harness context engineering"`
- `/search latest codex release notes`

## Behavior Rules
- Fast, minimal responses.
- No unnecessary output.
- Prefer execution over explanation when intent is clear.
- Prefer system-level command invocation over simulation.

## Safety Constraints
- Only open trusted search URLs.
- Sanitize queries and strip control characters.
- URL-encode every query.
- Reject empty or malformed search requests.

## Context Loading Locations
Pi can load this context from:
- `~/.pi/agent/AGENTS.md` (global)
- `<project-root>/AGENTS.md`
- `<current-directory>/AGENTS.md`
