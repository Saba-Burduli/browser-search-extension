import { SearchRuntime } from "./SearchRuntime";

export default function terminalBrowserSearch(pi: any) {
  // Keep extension loaded for runtime hooks/tooling, but expose no slash commands.
  void pi;
  void SearchRuntime;
}
