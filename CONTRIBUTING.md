# Contributing to sri-lanka-nic

Thanks for your interest in contributing! This guide will help you get started.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:

```bash
git clone https://github.com/your-username/sri-lanka-nic.git
cd sri-lanka-nic
```

3. **Install dependencies** using pnpm:

```bash
pnpm install
```

4. **Run the dev server** (docs site):

```bash
pnpm dev
```

5. **Run tests** to make sure everything works:

```bash
pnpm test
```

## Project Structure

```
sri-lanka-nic/
├── packages/lib/     # The core library (published to npm as @sri-lanka/nic)
├── apps/web/         # Documentation website (Next.js)
├── LICENSE
├── CONTRIBUTING.md
└── README.md
```

## Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages. This keeps the history clean and makes it easy to generate changelogs.

### Format

```
<type>(<scope>): <description>
```

### Types

| Type       | When to use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation changes only                              |
| `style`    | Formatting, missing semicolons, etc. (not CSS)          |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or updating tests                                |
| `chore`    | Build process, dependencies, tooling changes            |
| `ci`       | CI/CD configuration changes                             |

### Examples

```
feat(parser): add support for military NIC format
fix(builder): handle leap year edge case in old NIC builder
docs: update getting started guide
chore: upgrade typescript to v5.5
test(validator): add tests for custom check callback
```

### Scope (optional)

Use one of: `parser`, `validator`, `builder`, `common`, `web`, or omit for broad changes.

## Code Style

We use [Prettier](https://prettier.io/) for formatting. It runs automatically, but you can also run it manually:

```bash
# Format all files
pnpm format
```

Please don't include formatting-only changes in feature PRs. If you spot formatting issues, submit a separate PR.

## Making a Pull Request

1. Create a new branch from `main`:

```bash
git checkout -b feat/your-feature-name
```

2. Make your changes and commit using conventional commits.
3. Push your branch and open a PR against `main`.
4. Make sure all checks pass (tests, build, formatting).

## Running the Library Locally

```bash
# Build the library
pnpm --filter @sri-lanka/nic build

# Run tests
pnpm --filter @sri-lanka/nic test

# Watch mode
pnpm --filter @sri-lanka/nic test:watch
```

## Need Help?

Open an [issue](https://github.com/vinodliyanage/sri-lanka-nic/issues) on GitHub. We're happy to help!
