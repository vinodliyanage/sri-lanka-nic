import type { ReactNode } from "react";
import { CodeBlock } from "./code-block";
import { GlassCard } from "./glass-card";
import {
  API_ERROR_CODES,
  API_INSTANCE_METHODS,
  API_INSTANCE_PROPERTIES,
  API_STATIC_METHODS,
  CONFIGURATION_SNIPPET,
  EXPORTS_SNIPPET,
  PARTS_SHAPE_SNIPPET,
} from "../snippets";

type ApiTableColumn = {
  label: string;
  width: string;
};

function ApiTable({
  columns,
  children,
}: {
  columns: ApiTableColumn[];
  children: ReactNode;
}) {
  return (
    <table className="w-full table-fixed border-collapse text-sm">
      <colgroup>
        {columns.map((column) => (
          <col key={column.label} style={{ width: column.width }} />
        ))}
      </colgroup>
      <thead>
        <tr className="border-b border-glass-border">
          {columns.map((column) => (
            <th
              key={column.label}
              className="py-2 px-3 text-left text-[11px] uppercase tracking-wider text-text-muted font-semibold"
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export function ApiDocs() {
  return (
    <div className="animate-in fade-in duration-500 space-y-12 mb-12">
      <section>
        <h2 className="text-xl font-semibold mb-2 text-text-primary">API Reference</h2>
        <p className="text-text-secondary">
          Current library API for `NIC`, exported symbols, instance properties, and configuration.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Package Exports</h3>
        <CodeBlock title="Named Exports" code={EXPORTS_SNIPPET} />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Static Methods</h3>
        <p className="text-sm text-text-secondary mb-4">
          Read each row left to right: method call, return type, throw behavior, and when to use it.
        </p>
        <GlassCard>
          <ApiTable
            columns={[
              { label: "Method", width: "23%" },
              { label: "Returns", width: "20%" },
              { label: "Throws", width: "12%" },
              { label: "Purpose", width: "45%" },
            ]}
          >
            {API_STATIC_METHODS.map((item) => (
              <tr key={item.call} className="border-t border-glass-border/60 align-top">
                <td className="py-3 px-3">
                  <code className="font-mono text-accent text-xs break-all whitespace-normal">{item.call}</code>
                </td>
                <td className="py-3 px-3">
                  <code className="font-mono text-xs text-text-primary break-all whitespace-normal">{item.returns}</code>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                      item.throws === "Never"
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-error/10 text-error border border-error/20"
                    }`}
                  >
                    {item.throws}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <p className="text-xs text-text-secondary">{item.summary}</p>
                  <p className="text-xs text-text-muted mt-1">{item.useCase}</p>
                </td>
              </tr>
            ))}
          </ApiTable>
        </GlassCard>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Instance Properties</h3>
        <p className="text-sm text-text-secondary mb-4">
          These readonly fields are available after parsing with `NIC.parse`.
        </p>
        <GlassCard>
          <ApiTable
            columns={[
              { label: "Property", width: "26%" },
              { label: "Type", width: "28%" },
              { label: "Meaning", width: "46%" },
            ]}
          >
            {API_INSTANCE_PROPERTIES.map((item) => (
              <tr key={item.property} className="border-t border-glass-border/60 align-top">
                <td className="py-3 px-3">
                  <code className="font-mono text-accent text-xs break-all whitespace-normal">{item.property}</code>
                </td>
                <td className="py-3 px-3">
                  <code className="font-mono text-xs text-text-primary break-all whitespace-normal">{item.type}</code>
                </td>
                <td className="py-3 px-3">
                  <p className="text-xs text-text-secondary">{item.summary}</p>
                  {item.note && <p className="text-xs text-text-muted mt-1">{item.note}</p>}
                </td>
              </tr>
            ))}
          </ApiTable>
        </GlassCard>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">NIC Parts Shape</h3>
        <CodeBlock title="nic.parts Type" code={PARTS_SHAPE_SNIPPET} />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Instance Methods</h3>
        <GlassCard>
          <ApiTable
            columns={[
              { label: "Method", width: "26%" },
              { label: "Returns", width: "28%" },
              { label: "Purpose", width: "46%" },
            ]}
          >
            {API_INSTANCE_METHODS.map((item) => (
              <tr key={item.method} className="border-t border-glass-border/60 align-top">
                <td className="py-3 px-3">
                  <code className="font-mono text-accent text-xs break-all whitespace-normal">{item.method}</code>
                </td>
                <td className="py-3 px-3">
                  <code className="font-mono text-xs text-text-primary break-all whitespace-normal">{item.returns}</code>
                </td>
                <td className="py-3 px-3">
                  <p className="text-xs text-text-secondary">{item.summary}</p>
                  {item.note && <p className="text-xs text-text-muted mt-1">{item.note}</p>}
                </td>
              </tr>
            ))}
          </ApiTable>
        </GlassCard>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Error Codes</h3>
        <p className="text-sm text-text-secondary mb-4">
          `NIC.validate` returns these codes in `error.code`; `NIC.parse` and `NIC.sanitize` throw `NIC.Error` with
          the same codes.
        </p>
        <GlassCard>
          <ApiTable
            columns={[
              { label: "Code", width: "28%" },
              { label: "Appears In", width: "24%" },
              { label: "Meaning", width: "48%" },
            ]}
          >
            {API_ERROR_CODES.map((item) => (
              <tr key={item.code} className="border-t border-glass-border/60 align-top">
                <td className="py-3 px-3">
                  <code className="font-mono text-accent text-xs break-all whitespace-normal">{item.code}</code>
                </td>
                <td className="py-3 px-3">
                  <p className="text-xs text-text-primary">{item.appearsIn}</p>
                </td>
                <td className="py-3 px-3">
                  <p className="text-xs text-text-secondary">{item.meaning}</p>
                </td>
              </tr>
            ))}
          </ApiTable>
        </GlassCard>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Advanced Configuration</h3>
        <p className="text-text-secondary mb-4 text-sm">
          `NIC.Config` exposes global validation constants that can be adjusted for your environment.
        </p>
        <CodeBlock title="Configuration Settings" code={CONFIGURATION_SNIPPET} />
      </section>
    </div>
  );
}
