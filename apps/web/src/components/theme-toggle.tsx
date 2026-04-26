"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-strong"
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Sun className="h-[1.1rem] w-[1.1rem]" />
      ) : (
        <Moon className="h-[1.1rem] w-[1.1rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
