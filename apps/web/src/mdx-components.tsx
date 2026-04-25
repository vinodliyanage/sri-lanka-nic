import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 className="text-2xl font-bold tracking-tight mb-2" {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2
        className="text-lg font-semibold tracking-tight mt-10 mb-3 pb-2 border-b border-border"
        {...props}
      />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3 className="text-base font-semibold mt-8 mb-2" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p
        className="text-sm leading-relaxed text-text-secondary mb-4 [&+ul]:mt-[-0.5rem]"
        {...props}
      />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="text-sm text-text-secondary mb-4 ml-4 list-disc space-y-1.5" {...props} />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className="text-sm text-text-secondary mb-4 ml-4 list-decimal space-y-1.5" {...props} />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => (
      <li className="leading-relaxed" {...props} />
    ),
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        className="text-accent underline underline-offset-2 hover:opacity-80 transition-opacity"
        {...props}
      />
    ),
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
      <div className="mb-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm" {...props} />
      </div>
    ),
    thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <thead className="bg-bg-secondary border-b border-border" {...props} />
    ),
    th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
      <th
        className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
        {...props}
      />
    ),
    td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
      <td className="px-4 py-2.5 text-text-secondary border-t border-border" {...props} />
    ),
    blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
      <blockquote
        className="mb-4 border-l-2 border-border-strong pl-4 text-sm text-text-muted italic"
        {...props}
      />
    ),
    hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
      <hr className="my-8 border-border" {...props} />
    ),
    strong: (props: React.HTMLAttributes<HTMLElement>) => (
      <strong className="font-semibold text-text" {...props} />
    ),
  };
}
