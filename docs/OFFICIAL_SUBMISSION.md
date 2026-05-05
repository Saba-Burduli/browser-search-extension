# Official Pi Package Submission Guide

This package is publish-ready for community installation and maintainer review.

## 1. Publish to npm

```bash
npm login
npm publish
```

Package name:
- `@saba-burduli/pi-browser-search-extension`

## 2. Verify install path

After publish:

```bash
pi install npm:@saba-burduli/pi-browser-search-extension
```

## 3. Request official curation/listing

Open an issue or discussion in:
- `https://github.com/badlogic/pi-mono`

Include:
- npm package link
- GitHub repository link
- Short feature summary (include multi-browser support: system default, Chrome, Firefox, Brave, Safari, Dia)
- Safety model (trusted URLs, sanitized query)
- Demo GIF/video or screenshot (optional but recommended)
- Maintenance commitment and contact

## 4. Suggested request template

Title:
- `Package submission: @saba-burduli/pi-browser-search-extension`

Body:
- What it does (fast `/search` command with multi-browser support)
- Why it is useful
- How to install (`pi install npm:@saba-burduli/pi-browser-search-extension`)
- Security notes
- Compatibility notes (Node >= 20, macOS system browser launcher with Chrome/Firefox/Brave/Safari/Dia support)

## 5. Ongoing maintenance expectations

- Keep package compatible with latest Pi API
- Update README and changelog for behavior changes
- Respond to maintainer review feedback quickly
