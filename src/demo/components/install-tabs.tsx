import { useState } from "react";
import { CodeBlock } from "./code-block";
import { INSTALL_SNIPPET_NPM, INSTALL_SNIPPET_PNPM, INSTALL_SNIPPET_YARN } from "../snippets";

export function InstallTabs() {
  const [manager, setManager] = useState<"npm" | "pnpm" | "yarn">("pnpm");

  const tabs = [
    { id: "npm", label: "npm", code: INSTALL_SNIPPET_NPM },
    { id: "pnpm", label: "pnpm", code: INSTALL_SNIPPET_PNPM },
    { id: "yarn", label: "yarn", code: INSTALL_SNIPPET_YARN },
  ] as const;

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 mb-3 bg-course-surface border border-glass-border w-fit p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setManager(tab.id)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              manager === tab.id ? "bg-accent/10 text-accent shadow-sm" : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock code={tabs.find((t) => t.id === manager)!.code} language="bash" />
    </div>
  );
}
