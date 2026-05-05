import { SearchRuntime } from "./SearchRuntime";

export default function terminalBrowserSearch(pi: any) {
  pi.registerCommand("search", {
    description: "Open Google search in browser. Usage: /search <query>",
    handler: async (args: string, ctx: any) => {
      const trimmed = (args || "").trim();
      if (!trimmed) return;

      const rawInput = `search ${trimmed}`;
      const runtime = new SearchRuntime({ projectRoot: ctx.cwd, cwd: ctx.cwd });

      try {
        await runtime.runCommand(rawInput);
      } catch {
        // Silent by design.
      }
    },
  });
}
