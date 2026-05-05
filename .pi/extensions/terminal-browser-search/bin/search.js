#!/usr/bin/env node

const path = require("node:path");
const { existsSync } = require("node:fs");

const distCli = path.resolve(__dirname, "..", "dist", "cli.js");

if (!existsSync(distCli)) {
  console.error("Extension is not built. Run: npm install && npm run build");
  process.exit(1);
}

require(distCli);
