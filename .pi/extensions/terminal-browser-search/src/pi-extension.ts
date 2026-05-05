import { SearchRuntime } from "./SearchRuntime";

export default function terminalBrowserSearch(pi: any) {
  pi.registerCommand("search-cmd", {
    description: "Open Google search in your browser. Usage: /search-cmd <query>",
    handler: async (args: string, ctx: any) => {
      const trimmed = (args || "").trim();
      const rawInput = trimmed ? `search ${trimmed}` : "search";
      const runtime = new SearchRuntime({ projectRoot: ctx.cwd, cwd: ctx.cwd });

      const result = await runtime.runCommand(rawInput);

      if (!result.ok) {
        ctx.ui.notify(result.message, "error");
        return;
      }

      if (result.launched) {
        ctx.ui.notify(result.message, "info");
      } else {
        pi.sendMessage({ customType: "search-url", content: result.message, display: true });
      }
    },
  });
}
