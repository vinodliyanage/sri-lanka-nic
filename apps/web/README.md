# @sri-lanka/nic Documentation Website

This is the official documentation and showcase website for the [`@sri-lanka/nic`](https://www.npmjs.com/package/@sri-lanka/nic) package. It is built using [Next.js](https://nextjs.org), [Tailwind CSS v4](https://tailwindcss.com), and the official `@next/mdx` plugin for static generation.

## Features

- **Interactive Decoder**: Instantly decode and visualize Sri Lankan NIC data.
- **Interactive Builder**: Generate synthetic NICs for testing environments.
- **Native MDX Documentation**: Comprehensive documentation powered by Next.js native MDX routing.
- **Dark Mode Support**: Seamless light/dark mode switching via `next-themes`.
- **Top-Tier SEO**: fully optimized with Next.js Metadata API, Canonical Links, OpenGraph, Twitter Cards, and `SoftwareApplication` JSON-LD schemas.
- **100% Statically Generated**: Blazing fast load times with no server-side rendering overhead.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS v4
- **Markdown**: `@next/mdx`, `remark-gfm`, `rehype-pretty-code`
- **Icons**: `lucide-react`
- **Package Manager**: `pnpm`

## 🏃‍♂️ Getting Started

From the root of the monorepo, you can run the development server for the web app:

```bash
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Updating Documentation

The documentation is written in MDX and statically generated. To add or modify documentation:

1. Add or edit `.mdx` files in `src/app/docs/[slug]/page.mdx`.
2. To add a new page to the sidebar, update the `DOCS_NAV` array inside `src/app/docs/layout.tsx`.

> Note: The root `docs` page redirects to `/docs/getting-started`.

## Deployment

This Next.js application is heavily optimized and can be instantly deployed to Vercel, Cloudflare Pages, or GitHub Pages.

```bash
# Build the production bundle
pnpm --filter web build

# Start the production server locally
pnpm --filter web start
```
