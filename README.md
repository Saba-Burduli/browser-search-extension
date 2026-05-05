# Terminal Browser Search Extension (Pi Harness)

Production-ready Pi Harness extension for Chrome-first terminal search.

## Core Command
- `search <query>`

Behavior:
- Encodes query
- Builds Google search URL
- Validates trusted host
- Opens in browser (`Google Chrome` default)

## Project Structure
```text
terminal-browser-search-extension/
├── AGENTS.md
├── README.md
└── .pi/
    ├── SYSTEM.md
    ├── terminal-browser-search.config.json
    ├── prompts/
    │   └── search.md
    └── extensions/
        └── terminal-browser-search/
            ├── extension.json
            ├── package.json
            ├── tsconfig.json
            ├── bin/
            │   └── search.js
            └── src/
                ├── AgentContextResolver.ts
                ├── BrowserLauncherFactory.ts
                ├── CommandParser.ts
                ├── CompactionStrategy.ts
                ├── Config.ts
                ├── DynamicContextHook.ts
                ├── QueryEncoder.ts
                ├── SearchRuntime.ts
                ├── UrlPolicy.ts
                ├── cli.ts
                ├── extension.ts
                ├── hooks.ts
                ├── index.ts
                ├── launchers/
                │   └── MacOSBrowserLauncher.ts
                └── types.ts
```

## Install Into Pi Harness
From extension package root:

```bash
cd .pi/extensions/terminal-browser-search
npm install
npm run build
```

Optional global CLI link:

```bash
npm link
```

Then use from project root:

```bash
search "latest dotnet performance"
```

If you do not want auto-open:

```bash
PI_SEARCH_DRY_RUN=1 search "latest dotnet performance"
```

## Hook Integration
Use `dist/hooks.js` for runtime hooks:
- `beforeTurn`:
  - Detects search-like input (`search`, `google`, `look up`, `find online`)
  - Injects hint: `User likely wants a browser search. Consider using search command.`
  - Filters old context to recent messages for lower latency
- `compact`:
  - Preserves command history and recent queries
  - Summarizes older irrelevant messages
- `agentContext`:
  - Merges AGENTS context from:
    - `~/.pi/agent/AGENTS.md`
    - project root `AGENTS.md`
    - current directory `AGENTS.md`

## Prompt Templates
- `/search latest dotnet performance`
  - Expands to `search "latest dotnet performance"`

## Error Handling
- Empty query: returns usage error
- Invalid command: returns usage error
- Browser missing: clear unavailable message
- Untrusted URL: blocked before launch

## Extensibility
Prepared for:
- Browsers: Chrome, Firefox, Safari (`IBrowserLauncher` pattern)
- Engines: configurable `searchEngine` (`baseUrl`, `queryParam`, `allowedHosts`)
- Modes: dry-run, incognito, auto-open toggles
