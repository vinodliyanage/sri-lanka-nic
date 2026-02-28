import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";

export function CodeBlock({ code, title, language = "tsx" }: { code: string; title?: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-glass-border bg-glass overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-glass-border">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</span>
          <button
            type="button"
            onClick={copy}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            aria-label="Copy code to clipboard"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      )}
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed bg-transparent! m-0!">
            <code>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
