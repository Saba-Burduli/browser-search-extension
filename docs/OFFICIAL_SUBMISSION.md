# Official Pi Package Submission Guide

This package is publish-ready for community installation and maintainer review.

## 1. Publish to npm

```bash
npm login
npm publish
```

Package name:
- `pi-terminal-browser-search`

## 2. Verify install path

After publish:

```bash
pi install npm:pi-terminal-browser-search
```

## 3. Request official curation/listing

Open an issue or discussion in:
- `https://github.com/badlogic/pi-mono`

Include:
- npm package link
- GitHub repository link
- Short feature summary
- Safety model (trusted URLs, sanitized query)
- Demo GIF/video or screenshot (optional but recommended)
- Maintenance commitment and contact

## 4. Suggested request template

Title:
- `Package submission: pi-terminal-browser-search`

Body:
- What it does
- Why it is useful
- How to install (`pi install npm:pi-terminal-browser-search`)
- Security notes
- Compatibility notes (Node >= 20, macOS Chrome path)

## 5. Ongoing maintenance expectations

- Keep package compatible with latest Pi API
- Update README and changelog for behavior changes
- Respond to maintainer review feedback quickly
