import { beforeTurn, compact, loadAgentContext } from "./extension";

type HookEnvelope = {
  event: "beforeTurn" | "compact" | "agentContext";
  payload: unknown;
};

async function main(): Promise<void> {
  const input = await readStdin();
  const request = JSON.parse(input || "{}") as HookEnvelope;

  if (request.event === "beforeTurn") {
    process.stdout.write(JSON.stringify(beforeTurn(request.payload as never)));
    return;
  }

  if (request.event === "compact") {
    process.stdout.write(JSON.stringify(compact(request.payload as never)));
    return;
  }

  if (request.event === "agentContext") {
    process.stdout.write(JSON.stringify(loadAgentContext()));
    return;
  }

  process.stdout.write(
    JSON.stringify({
      error: "Unknown hook event",
      allowed: ["beforeTurn", "compact", "agentContext"],
    }),
  );
  process.exit(2);
}

async function readStdin(): Promise<string> {
  const chunks: string[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(String(chunk));
  }
  return chunks.join("");
}

void main();
