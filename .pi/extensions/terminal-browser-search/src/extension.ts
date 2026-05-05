import { resolve } from "node:path";
import { SearchRuntime } from "./SearchRuntime";
import type { BeforeTurnInput, CompactionInput } from "./types";

function getProjectRoot(): string {
  if (process.env.PI_PROJECT_ROOT) return resolve(process.env.PI_PROJECT_ROOT);
  return resolve(__dirname, "..", "..", "..", "..");
}

function createRuntime(): SearchRuntime {
  return new SearchRuntime({
    projectRoot: getProjectRoot(),
    cwd: process.cwd(),
  });
}

export async function handleCommand(rawInput: string) {
  return createRuntime().runCommand(rawInput);
}

export function beforeTurn(payload: BeforeTurnInput) {
  return createRuntime().beforeTurn(payload);
}

export function compact(payload: CompactionInput) {
  return createRuntime().compactContext(payload);
}

export function loadAgentContext() {
  return createRuntime().loadAgentContextSnapshot();
}
