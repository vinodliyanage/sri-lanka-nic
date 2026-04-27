import Link from "next/link";
import packageJson from "@sri-lanka/nic/package.json";
import { NICDecoder } from "@/components/nic-decoder";
import { NICBuilder } from "@/components/nic-builder";
import { ArrowRight, Globe } from "lucide-react";
import { siteConfig } from "@/config/site";
import { CopyButton } from "@/components/copy-button";

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function NpmIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
    </svg>
  );
}

function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

const LINKS = [
  { name: "GitHub", url: siteConfig.links.github, icon: GithubIcon },
  { name: "npm", url: siteConfig.links.npm, icon: NpmIcon },
  { name: "Portfolio", url: siteConfig.links.portfolio, icon: Globe },
  { name: "LinkedIn", url: siteConfig.links.linkedin, icon: LinkedinIcon },
];

const BADGES = [
  {
    alt: "npm version",
    src: "https://img.shields.io/npm/v/@sri-lanka/nic?style=flat-square&color=cb3837",
  },
  {
    alt: "npm downloads",
    src: "https://img.shields.io/npm/dm/@sri-lanka/nic?style=flat-square&color=cb3837",
  },
  {
    alt: "bundle size",
    src: "https://img.badgesize.io/https://unpkg.com/@sri-lanka/nic/dist/index.js?compression=gzip&style=flat-square&label=size&color=cb3837",
  },
  {
    alt: "license",
    src: "https://img.shields.io/github/license/vinodliyanage/sri-lanka-nic?style=flat-square",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      {/* Hero */}
      <section className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-secondary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          v{packageJson.version}
        </div>

        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">@sri-lanka/nic</h1>

        {/* Links */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-text-secondary">
          {LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.name}
              className="rounded-full p-2 hover:bg-bg-secondary hover:text-text transition-all"
            >
              <link.icon size={16} />
            </a>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1 text-text-secondary text-base leading-relaxed">
          <p>Parse, validate, and build Sri Lankan National Identity Card numbers.</p>
          <p>Zero dependencies. TypeScript. Works everywhere.</p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-secondary px-3.5 py-2 font-mono text-sm">
            <span className="text-text-muted">$</span>
            <span>pnpm add @sri-lanka/nic</span>
            <CopyButton text="pnpm add @sri-lanka/nic" />
          </div>
          <Link
            href="/docs"
            className="flex items-center gap-1.5 rounded-lg bg-text px-4 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            Docs
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {BADGES.map((badge) => (
            <img key={badge.alt} src={badge.src} alt={badge.alt} height={20} />
          ))}
        </div>
      </section>

      {/* Divider */}
      <hr className="my-16 border-border" />

      {/* Decoder */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Try it out</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Paste any Sri Lankan NIC number to instantly see the decoded details.
          </p>
        </div>
        <NICDecoder />
      </section>

      {/* Divider */}
      <hr className="my-16 border-border" />

      {/* Builder */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">NIC Builder</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Generate valid NIC numbers for testing. Choose a format, set the details, and build.
          </p>
        </div>
        <NICBuilder />
      </section>
    </div>
  );
}
