---
name: browser.search
description: Trigger trusted browser search flows from terminal intent and execute with a concrete browser launcher.
metadata:
  canonical_name: browser.search
  lazy_load: true
---

# Skill: browser.search

Use this skill only when the user asks to search the web.

## Trigger Conditions
Activate when input includes or implies:
- `search ...`
- `google ...`
- `look up ...`
- `find online ...`
- `web search ...`

## Tool Contract
`open_chrome(url, incognito?)`

Parameters:
- `url` (required): encoded trusted URL
- `incognito` (optional boolean)

## Query Parsing Logic
1. Extract text after search intent.
2. Normalize whitespace.
3. Remove control characters.
4. Reject empty query.
5. URL-encode query.
6. Build URL with Google endpoint:
   - `https://www.google.com/search?q=<encoded_query>`
7. Validate against trusted-host policy.
8. Execute `open_chrome(url)`.

## Safety
- Do not open non-allowlisted hosts.
- Do not execute shell payloads from query text.
- If launch is blocked or unavailable, return concise CLI error.

## Loading Behavior
- Keep this skill package isolated under `.pi/skills/browser-search`.
- Load only when intent classifier marks search-like user input.
