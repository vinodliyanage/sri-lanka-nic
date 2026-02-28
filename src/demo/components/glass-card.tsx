import React from "react";

export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-glass-border bg-glass backdrop-blur-xl p-6 ${className}`}>
      {children}
    </div>
  );
}
