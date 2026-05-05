import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import type { AgentContextSnapshot } from "./types";

export function loadAgentContext(projectRoot: string, cwd: string): AgentContextSnapshot {
  const candidatePaths = [
    join(homedir(), ".pi", "agent", "AGENTS.md"),
    resolve(projectRoot, "AGENTS.md"),
    resolve(cwd, "AGENTS.md"),
  ];

  const sections: string[] = [];
  const sources: string[] = [];
  const seen = new Set<string>();

  for (const path of candidatePaths) {
    if (seen.has(path) || !existsSync(path)) continue;
    seen.add(path);
    try {
      const content = readFileSync(path, "utf8").trim();
      if (!content) continue;
      sections.push(`## Source: ${path}\n${content}`);
      sources.push(path);
    } catch {
      // Skip unreadable sources.
    }
  }

  return {
    combined: sections.join("\n\n"),
    sources,
  };
}
