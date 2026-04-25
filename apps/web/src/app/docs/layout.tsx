import { Sidebar } from "@/components/sidebar";
import { MobileDocsNav } from "@/components/mobile-docs-nav";
import { DocsPager } from "@/components/docs-pager";

export const DOCS_NAV = [
  { title: "Getting Started", slug: "getting-started" },
  { title: "Parsing", slug: "parsing" },
  { title: "Validation", slug: "validation" },
  { title: "Configuration", slug: "configuration" },
  { title: "Builder", slug: "builder" },
  { title: "Types", slug: "types" },
  { title: "Errors", slug: "errors" },
  { title: "Utilities", slug: "utilities" },
  { title: "Examples", slug: "examples" },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col md:flex-row md:gap-10 px-6 py-10">
      <aside className="hidden md:block">
        <div className="sticky top-24">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Documentation
          </p>
          <Sidebar docs={DOCS_NAV} />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <MobileDocsNav docs={DOCS_NAV} />
        {children}
        <DocsPager docs={DOCS_NAV} />
      </div>
    </div>
  );
}
