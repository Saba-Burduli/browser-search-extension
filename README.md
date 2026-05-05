# Browser Search Extension

Chrome-first Pi Harness extension that opens Google search results directly from `/search <query>` with minimal, terminal-silent UX.

NPM package:
- https://www.npmjs.com/package/pi-browser-search-extension

## Overview
This extension is designed for fast action, not conversational search explanations.
When a user runs `/search dotnet docs`, Pi immediately launches Google Chrome with an encoded Google query URL.

Primary behavior:
- Accept user query input from `/search <query>`
- Sanitize and normalize query text
- Encode query safely
- Enforce trusted URL policy
- Open Chrome via system command on macOS
- Keep command execution silent from the user perspective

## Features
- Native Pi extension command: `/search <query>`
- Dynamic query support (no hardcoded terms)
- Trusted host enforcement (`https://www.google.com/search?q=...`)
- Config-driven dry-run and auto-open toggles
- Dynamic context hook (`beforeTurn`) for search intent biasing
- Optional compaction strategy preserving command/query relevance
- Extensible launcher abstraction for future browsers

## How It Works
Runtime flow:
1. Pi command `/search <query>` is handled by extension command registration in `src/pi-extension.ts`.
2. Query is parsed and sanitized by `CommandParser`.
3. URL is built by `QueryEncoder`.
4. URL is validated by `UrlPolicy`.
5. Launcher factory selects browser launcher (Chrome default).
6. `open -a "Google Chrome" "<url>"` executes.

## Command
- `/search <query>`

Examples:
- `/search dotnet docs`
- `/search openai codex prompt templates`

## Configuration
Config file:
- `.pi/terminal-browser-search.config.json`

Relevant settings:
- `autoOpenBrowser` (bool): open browser automatically
- `dryRun` (bool): build URL without opening browser
- `defaultBrowser` (chrome/firefox/safari)
- `searchEngine.baseUrl` (default Google search)
- `searchEngine.queryParam` (default `q`)
- `searchEngine.allowedHosts` (allowlist)

Environment overrides:
- `PI_SEARCH_AUTO_OPEN`
- `PI_SEARCH_DRY_RUN`
- `PI_SEARCH_INCOGNITO`

## Project Structure
```text
browser-search-extension/
├── AGENTS.md
├── LICENSE
├── README.md
└── .pi/
    ├── SYSTEM.md
    ├── terminal-browser-search.config.json
    └── extensions/
        └── terminal-browser-search/
            ├── extension.json
            ├── package.json
            ├── tsconfig.json
            ├── bin/search.js
            ├── src/pi-extension.ts
            ├── src/SearchRuntime.ts
            ├── src/CommandParser.ts
            ├── src/QueryEncoder.ts
            ├── src/UrlPolicy.ts
            ├── src/BrowserLauncherFactory.ts
            ├── src/launchers/MacOSBrowserLauncher.ts
            ├── src/DynamicContextHook.ts
            ├── src/CompactionStrategy.ts
            └── src/hooks.ts
```

## Install (Local Repo)
From repo root:

```bash
cd .pi/extensions/terminal-browser-search
npm install
npm run build
```

Then reload Pi resources:

```text
/reload
```

## Install (npm Package)
After package publication:

```bash
pi install npm:pi-browser-search-extension
```

Then reload resources:

```text
/reload
```

## Development
Build:

```bash
cd .pi/extensions/terminal-browser-search
npm run build
```

Pack validation:

```bash
npm run pack:check
```

## Security Notes
- Only trusted search URLs are opened.
- Query input is sanitized before URL construction.
- Invalid or empty queries are rejected.
- No hardcoded token or secret handling in runtime flow.

## Compatibility
- Platform: macOS launcher path implemented (`open -a "Google Chrome" ...`)
- Node.js: `>=20`

## Developer
- Saba Burduli

## License
This project is licensed under the MIT License.
See [LICENSE](./LICENSE).

## Official Package Listing
To request inclusion in Pi's curated/official package ecosystem:

1. Publish package to npm (`pi-browser-search-extension`)
2. Open submission request in `badlogic/pi-mono`
3. Include install command, repository URL, safety model, and demo evidence

Detailed checklist:
- [docs/OFFICIAL_SUBMISSION.md](./docs/OFFICIAL_SUBMISSION.md)
