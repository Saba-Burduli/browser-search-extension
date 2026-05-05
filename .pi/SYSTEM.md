# SYSTEM.md - Terminal Browser Search Policy Layer

This file extends Pi's base system prompt for this project.

## Search-Intent Routing
When user intent matches web lookup, prefer executing `search` rather than writing manual explanations.

Intent cues include:
- `search ...`
- `google ...`
- `look up ...`
- `find online ...`
- `web search ...`

## Core Runtime Rules
- Always sanitize query input.
- Always URL-encode query values.
- Prefer opening browser over returning plain links.
- Resolve browser from system default when `defaultBrowser=system`.
- Stay terminal-first and action-oriented.
- Keep responses minimal after successful launch.

## Safety Rules
- Open only trusted URL hosts from config allowlist.
- Do not open arbitrary domains from user text.
- Reject empty queries.

## Runtime Toggles
Config file: `.pi/terminal-browser-search.config.json`

- `autoOpenBrowser`
  - `true`: open browser after URL generation
  - `false`: print URL only
- `dryRun`
  - `true`: always print URL only
  - `false`: normal behavior

Resolution order:
1. Environment variables (`PI_SEARCH_AUTO_OPEN`, `PI_SEARCH_DRY_RUN`, `PI_SEARCH_INCOGNITO`, `PI_SEARCH_BROWSER`, `PI_SEARCH_UPDATES_ENABLED`, `PI_SEARCH_UPDATES_NOTIFY`, `PI_SEARCH_UPDATES_INTERVAL_HOURS`, `PI_SEARCH_UPDATES_REPOSITORY`)
2. Project config file
3. Defaults

If `dryRun=true`, it overrides `autoOpenBrowser=true`.

## Update Notice (Opt-In)
- Update checks are disabled by default.
- When enabled, the extension checks GitHub releases on a throttled interval and can notify through terminal or macOS notification center.
