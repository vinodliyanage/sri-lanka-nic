"use client";

import { useState, useCallback } from "react";
import { NIC, NICError } from "@sri-lanka/nic";
import type { NICInstance } from "@sri-lanka/nic";
import { ArrowRightLeft, Copy, Check } from "lucide-react";

export function NICDecoder() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<NICInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const decode = useCallback((value: string) => {
    setInput(value);
    setCopied(false);

    if (!value.trim()) {
      setResult(null);
      setError(null);
      return;
    }

    try {
      const parsed = NIC.parse(value);
      setResult(parsed);
      setError(null);
    } catch (e) {
      setResult(null);
      if (e instanceof NICError) {
        setError(e.message);
      } else {
        setError("Invalid NIC");
      }
    }
  }, []);

  const copyConverted = useCallback(async () => {
    if (!result) return;
    try {
      const converted = result.convert(result.type === "NEW" ? { letter: "V" } : undefined);
      await navigator.clipboard.writeText(converted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // conversion not possible for this NIC
    }
  }, [result]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="w-full">
      <div className="relative">
        <input
          id="nic-input"
          type="text"
          value={input}
          onChange={(e) => decode(e.target.value)}
          placeholder="Enter a NIC number — e.g. 200001501234 or 901404567V"
          className="w-full rounded-xl border border-border bg-surface px-5 py-4 text-base font-mono tracking-wider outline-none transition-all placeholder:text-text-muted placeholder:font-sans placeholder:tracking-normal placeholder:text-sm focus:border-accent focus:ring-2 focus:ring-accent/10"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600 animate-in fade-in">{error}</p>}

      {result && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-2">
          <ResultCard
            label="Type"
            value={result.type === "NEW" ? "New (12-digit)" : "Old (9-digit + letter)"}
          />
          <ResultCard label="Gender" value={result.gender === "MALE" ? "Male" : "Female"} />
          <ResultCard
            label="Birthday"
            value={`${months[result.birthday.month - 1]} ${result.birthday.day}, ${result.birthday.year}`}
          />
          <ResultCard label="Age" value={`${result.age} years`} />
          <ResultCard label="Day of Year" value={result.parts.days} />
          <ResultCard label="Serial" value={result.parts.serial} />

          <div className="col-span-2 sm:col-span-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-3">
              <ArrowRightLeft size={14} className="shrink-0 text-text-muted" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-muted">
                  Converted ({result.type === "NEW" ? "Old" : "New"} format)
                </p>
                <p className="truncate font-mono text-sm">
                  {(() => {
                    try {
                      return result.convert(result.type === "NEW" ? { letter: "V" } : undefined);
                    } catch {
                      return "Cannot convert — year or serial out of range";
                    }
                  })()}
                </p>
              </div>
              <button
                onClick={copyConverted}
                className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-bg-secondary hover:text-text"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
