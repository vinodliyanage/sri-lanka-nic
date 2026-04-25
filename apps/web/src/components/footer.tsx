import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <p className="text-xs text-text-muted">
          MIT License © {new Date().getFullYear()}{" "}
          <a
            href={siteConfig.links.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-text-secondary"
          >
            Vinod Liyanage
          </a>
        </p>
        <div className="flex items-center gap-4">
          <a
            href={siteConfig.links.npm}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted underline underline-offset-2 transition-colors hover:text-text-secondary"
          >
            npm
          </a>
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted underline underline-offset-2 transition-colors hover:text-text-secondary"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
