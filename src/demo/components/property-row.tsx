import React from "react";

export function PropertyRow({ label, value, code = false }: { label: string; value: React.ReactNode; code?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-text-muted text-sm">{label}</span>
      {code ? (
        <span className="font-mono text-xs bg-surface-raised px-2 py-0.5 rounded text-accent">{value}</span>
      ) : (
        <span className="text-text-primary text-sm font-medium">{value}</span>
      )}
    </div>
  );
}
