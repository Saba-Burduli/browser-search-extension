import { resolve } from "node:path";
import { SearchRuntime } from "./SearchRuntime";

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const rawInput = argv.length > 0 ? `search ${argv.join(" ")}` : "search";

  const projectRoot = process.env.PI_PROJECT_ROOT
    ? resolve(process.env.PI_PROJECT_ROOT)
    : resolve(__dirname, "..", "..", "..", "..");

  const runtime = new SearchRuntime({
    projectRoot,
    cwd: process.cwd(),
  });

  runtime.triggerUpdateCheck();

  const result = await runtime.runCommand(rawInput);

  if (!result.ok) {
    console.error(result.message);
    process.exit(result.code || 1);
  }

  process.stdout.write(`${result.message}\n`);
}

void main();
