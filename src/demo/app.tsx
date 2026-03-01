import { useState } from "react";
import { z } from "zod";
import { NIC } from "@/lib";
import { SocialLinks, Badges } from "@/demo/components/social-links";
import { name, version, description } from "../../package.json";
import {
  CODE_LITERALS,
  CONVERT_SNIPPET,
  DEMO_TABS,
  QUICKSTART_SNIPPET,
  ZOD_SNIPPET,
  ZOD_TRANSFORM_SNIPPET,
} from "./snippets";
import { CodeBlock } from "./components/code-block";
import { GlassCard } from "./components/glass-card";
import { PropertyRow } from "./components/property-row";
import { InstallTabs } from "./components/install-tabs";
import { NicWiki } from "./components/nic-wiki";
import { ApiDocs } from "./components/api-docs";

type DemoView = (typeof DEMO_TABS)[number]["id"];

const PROPERTY_LITERALS = {
  value: "nic.value",
  type: "nic.type",
  gender: "nic.gender",
  birthday: "nic.birthday",
  age: "nic.age",
  partsYear: "nic.parts.year",
  partsDays: "nic.parts.days",
  partsSerial: "nic.parts.serial",
  partsCheckDigit: "nic.parts.checkdigit",
  partsLetter: "nic.parts.letter",
  voter: "nic.voter",
} as const;

const nicSchema = z.string().superRefine((value, ctx) => {
  const result = NIC.validate(value);

  if (!result.valid) {
    ctx.addIssue({
      code: "custom",
      message: result.error.message,
    });
  }
});

export default function App() {
  const [view, setView] = useState<DemoView>("demo");
  const [inputNic, setInputNic] = useState("");
  const [parsedNic, setParsedNic] = useState<NIC | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const [convertInput, setConvertInput] = useState("");
  const [convertResult, setConvertResult] = useState<string | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);

  const [sanitizeInput, setSanitizeInput] = useState("");
  const [sanitizeResult, setSanitizeResult] = useState<string | null>(null);
  const [sanitizeError, setSanitizeError] = useState<string | null>(null);

  const handleParse = () => {
    setParseError(null);
    setParsedNic(null);

    try {
      nicSchema.parse(inputNic);
      setParsedNic(NIC.parse(inputNic));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setParseError(error.issues[0]?.message ?? "Invalid NIC");
      } else if (error instanceof NIC.Error) {
        setParseError(error.message);
      } else if (error instanceof Error) {
        setParseError(error.message);
      } else {
        setParseError("Invalid NIC");
      }
    }
  };

  const handleConvert = () => {
    setConvertResult(null);
    setConvertError(null);

    try {
      const nic = NIC.parse(convertInput);
      setConvertResult(nic.convert());
    } catch (error) {
      if (error instanceof Error) {
        setConvertError(error.message);
      } else {
        setConvertError("Invalid NIC");
      }
    }
  };

  const handleSanitize = () => {
    setSanitizeResult(null);
    setSanitizeError(null);

    try {
      setSanitizeResult(NIC.sanitize(sanitizeInput));
    } catch (error) {
      if (error instanceof Error) {
        setSanitizeError(error.message);
      } else {
        setSanitizeError("Invalid NIC");
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] bg-indigo-500/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-purple-500/[0.05] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <div className="flex justify-center mb-6">
          <img
            src="/sri-lanka-nic-logo.jpg"
            alt="Sri Lanka NIC Logo"
            className="w-60 h-60 rounded-2xl shadow-lg border border-glass-border"
          />
        </div>

        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary">{name}</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-surface-raised text-text-muted rounded-full">
              v{version}
            </span>
          </div>
          <p className="text-text-secondary text-lg max-w-md mx-auto mb-6">{description}</p>
          <SocialLinks />
          <Badges />

          <div className="flex justify-center mt-8">
            <div className="bg-surface-raised p-1 rounded-lg inline-flex border border-glass-border">
              {DEMO_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setView(tab.id)}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    view === tab.id ? "bg-accent/10 text-accent shadow-sm" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {view === "api" && <ApiDocs />}
        {view === "wiki" && <NicWiki />}

        {view === "demo" && (
          <div className="animate-in fade-in duration-500">
            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-2 text-text-primary">Installation</h2>
              <p className="text-text-secondary mb-4">
                Add the package with your preferred manager to parse, validate, sanitize, and convert Sri Lankan NIC
                numbers.
              </p>
              <InstallTabs />
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-2 text-text-primary">Quick Start</h2>
              <p className="text-text-secondary mb-4">Everything you need in a few lines. No setup required.</p>
              <CodeBlock title="Quick Start" code={QUICKSTART_SNIPPET} />
            </section>

            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-2 text-text-primary">Interactive Demo</h2>
              <p className="text-text-secondary mb-6">
                Explore the core methods interactively and inspect all currently available instance fields.
              </p>

              <div className="space-y-6">
                <GlassCard>
                  <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
                    Parse & Validate
                  </h2>
                  <p className="text-text-muted text-xs mb-4">
                    Enter a NIC to inspect data from <code>{CODE_LITERALS.parse}</code>.
                  </p>

                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      placeholder="e.g. 911042754V or 197419202757"
                      value={inputNic}
                      onChange={(event) => setInputNic(event.target.value)}
                      onKeyDown={(event) => event.key === "Enter" && handleParse()}
                      className="flex-1 bg-surface-raised border border-glass-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleParse}
                      className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Parse
                    </button>
                  </div>

                  {parseError && (
                    <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm font-medium mb-4">
                      {parseError}
                    </div>
                  )}

                  {!parsedNic && !parseError && (
                    <div className="text-center py-8 text-text-muted text-sm border border-dashed border-glass-border rounded-xl">
                      Enter a NIC to see parsed properties.
                    </div>
                  )}

                  {parsedNic && (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                          Instance Properties
                        </h3>
                        <div className="bg-surface-raised/30 rounded-xl p-4 border border-glass-border">
                          <PropertyRow label={PROPERTY_LITERALS.value} value={`"${parsedNic.value}"`} code />
                          <PropertyRow label={PROPERTY_LITERALS.type} value={parsedNic.type} code />
                          <PropertyRow label={PROPERTY_LITERALS.gender} value={parsedNic.gender} code />
                          <PropertyRow
                            label={PROPERTY_LITERALS.birthday}
                            value={`{ year: ${parsedNic.birthday.year}, month: ${parsedNic.birthday.month}, day: ${parsedNic.birthday.day} }`}
                            code
                          />
                          <PropertyRow label={PROPERTY_LITERALS.age} value={String(parsedNic.age)} code />
                          <PropertyRow label={PROPERTY_LITERALS.partsYear} value={`"${parsedNic.parts.year}"`} code />
                          <PropertyRow label={PROPERTY_LITERALS.partsDays} value={`"${parsedNic.parts.days}"`} code />
                          <PropertyRow
                            label={PROPERTY_LITERALS.partsSerial}
                            value={`"${parsedNic.parts.serial}"`}
                            code
                          />
                          <PropertyRow
                            label={PROPERTY_LITERALS.partsCheckDigit}
                            value={`"${parsedNic.parts.checkdigit}"`}
                            code
                          />
                          <PropertyRow
                            label={PROPERTY_LITERALS.partsLetter}
                            value={parsedNic.parts.letter ? `"${parsedNic.parts.letter}"` : "null"}
                            code
                          />
                          <PropertyRow
                            label={PROPERTY_LITERALS.voter}
                            value={parsedNic.voter === null ? "null" : String(parsedNic.voter)}
                            code
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                          Serialization Methods
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-text-muted mb-2 font-mono">{CODE_LITERALS.toString}</p>
                            <div className="bg-surface-raised/50 p-3 rounded-lg border border-glass-border font-mono text-xs text-accent">
                              "{parsedNic.toString()}"
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted mb-2 font-mono">{CODE_LITERALS.toJSON}</p>
                            <CodeBlock code={JSON.stringify(parsedNic.toJSON(), null, 2)} language="json" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </GlassCard>

                <div className="grid gap-6 lg:grid-cols-2">
                  <GlassCard>
                    <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
                      Convert Format
                    </h2>
                    <p className="text-text-muted text-xs mb-3 sm:mb-4">
                      Switch formats using <code>{CODE_LITERALS.convert}</code>.
                    </p>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="e.g. 911042754V"
                        value={convertInput}
                        onChange={(event) => setConvertInput(event.target.value)}
                        onKeyDown={(event) => event.key === "Enter" && handleConvert()}
                        className="w-full bg-surface-raised border border-glass-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleConvert}
                        className="w-full bg-surface-raised border border-glass-border hover:border-accent/30 text-text-primary text-sm font-medium py-2.5 rounded-lg transition-all cursor-pointer"
                      >
                        Convert
                      </button>

                      <div className="bg-surface-raised/50 rounded-lg p-4 mt-2 min-h-[80px] flex items-center justify-center border border-glass-border">
                        {convertError ? (
                          <p className="text-error text-xs font-medium text-center">{convertError}</p>
                        ) : convertResult ? (
                          <div className="text-center">
                            <p className="text-xs text-text-muted mb-1">Converted NIC</p>
                            <p className="text-xl font-mono text-accent font-medium">{convertResult}</p>
                          </div>
                        ) : (
                          <p className="text-text-muted text-xs text-center">Result will appear here</p>
                        )}
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
                      Sanitize Input
                    </h2>
                    <p className="text-text-muted text-xs mb-3 sm:mb-4">
                      Normalize incoming values with <code>{CODE_LITERALS.sanitize}</code>.
                    </p>

                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="e.g.   911042754v   "
                        value={sanitizeInput}
                        onChange={(event) => setSanitizeInput(event.target.value)}
                        onKeyDown={(event) => event.key === "Enter" && handleSanitize()}
                        className="w-full bg-surface-raised border border-glass-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSanitize}
                        className="w-full bg-surface-raised border border-glass-border hover:border-accent/30 text-text-primary text-sm font-medium py-2.5 rounded-lg transition-all cursor-pointer"
                      >
                        Sanitize
                      </button>

                      <div className="bg-surface-raised/50 rounded-lg p-4 mt-2 min-h-[80px] flex items-center justify-center border border-glass-border">
                        {sanitizeError ? (
                          <p className="text-error text-xs font-medium text-center">{sanitizeError}</p>
                        ) : sanitizeResult ? (
                          <div className="text-center">
                            <p className="text-xs text-text-muted mb-1">Sanitized NIC</p>
                            <p className="text-xl font-mono text-accent font-medium">{sanitizeResult}</p>
                          </div>
                        ) : (
                          <p className="text-text-muted text-xs text-center">Result will appear here</p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </div>

            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-2 text-text-primary">Format Conversion</h2>
              <p className="text-text-secondary mb-4">
                Convert between old and new formats with <code>{CODE_LITERALS.convert}</code>.
              </p>
              <CodeBlock title="Conversion API" code={CONVERT_SNIPPET} />
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-2 text-text-primary">Zod Validation & Parsing</h2>
              <p className="text-text-secondary mb-4">Integrate NIC checks in Zod with `superRefine`.</p>
              <CodeBlock title="Zod + NIC" code={ZOD_SNIPPET} />
              <div className="h-4" />
              <p className="text-text-secondary mb-4">You can also transform input directly into parsed NIC data.</p>
              <CodeBlock title="Parse via Zod" code={ZOD_TRANSFORM_SNIPPET} />
            </section>
          </div>
        )}

        <footer className="text-center pt-8 border-t border-glass-border">
          <p className="text-text-muted text-sm">
            Open source. Built by{" "}
            <a
              href="https://www.vinodliyanage.me"
              className="text-text-secondary hover:text-text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vinod Liyanage
            </a>{" "}
            with ❤️
          </p>
        </footer>
      </div>
    </div>
  );
}
