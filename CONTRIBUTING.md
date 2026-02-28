# Contributing to @sri-lanka/nic

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Before You Start](#before-you-start)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contribution Workflow](#contribution-workflow)
- [Commit Convention](#commit-convention)
- [Branch Naming](#branch-naming)
- [Code Guidelines](#code-guidelines)
- [Testing](#testing)
- [Reporting Issues](#reporting-issues)
- [Security](#security)
- [License](#license)

## Before You Start

Before working on a contribution, please [open an issue](https://github.com/vinodliyanage/sri-lanka-nic/issues/new) describing what you'd like to change. This helps avoid duplicate work and gives maintainers a chance to provide guidance before you invest time.

Small fixes (typos, broken links, etc.) can go straight to a PR without an issue.

## Development Setup

**Prerequisites:** Node.js 18 or later (LTS recommended), pnpm

1. Fork and clone the repository.
2. Install dependencies:

```bash
pnpm install
```

3. Run tests to verify your setup:

```bash
pnpm test
```

4. Start local demo (optional):

```bash
pnpm dev
```

5. Build the library:

```bash
pnpm build
```

## Project Structure

```
src/
├── lib/          # Library source code (published to npm)
├── demo/         # Demo app (not published)
dist/             # Library build output (git-ignored)
```

## Contribution Workflow

1. Create a branch from `main` ([see naming convention](#branch-naming)).
2. Make focused, well-scoped changes.
3. Write or update tests for your changes.
4. Make sure **all tests pass** and the **build succeeds**:

```bash
pnpm test
pnpm build
```

5. Commit your changes following the [commit convention](#commit-convention).
6. Open a pull request with:
   - **What** changed
   - **Why** it changed
   - Any breaking behavior or migration notes

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Each commit message should be structured as:

```
<type>(<scope>): <description>
```

### Types

| Type       | When to use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature or public API addition                    |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation-only changes                              |
| `test`     | Adding or updating tests                                |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore`    | Maintenance tasks (deps, CI, config)                    |

**Scope** is optional but encouraged — use it to indicate the area of change (e.g., `parser`, `validation`, `generator`, `demo`).

> **Note:** Don't bump the package version or update the changelog — maintainers will handle that during release.

## Branch Naming

Use descriptive, prefixed branch names:

```
feat/add-province-getter
fix/leap-year-validation
docs/update-contributing-guide
test/edge-case-coverage
refactor/simplify-date-parser
```

## Code Guidelines

- Keep public API changes intentional and documented in `README.md`.
- Prefer small, composable utilities and explicit types.
- Avoid introducing runtime dependencies unless justified.
- Keep the package tree-shakable and side-effect free.
- Add JSDoc comments for any new public methods or types.
- Optimize for readability — clear code over clever code.

## Testing

This project uses [Vitest](https://vitest.dev/) for testing:

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

When contributing, please:

- Write tests for any new functionality or bug fixes.
- Ensure existing tests still pass.
- Use clear, descriptive test names that explain _what_ is being tested.

## Reporting Issues

When [opening an issue](https://github.com/vinodliyanage/sri-lanka-nic/issues/new), please include:

- Environment (Node.js version, package manager, OS)
- Sample NIC input that reproduces the issue
- Expected vs actual behavior
- Minimal reproduction code if possible

## Security

If you discover a security vulnerability, **please do not open a public issue**. Instead, report it privately through [GitHub's security advisory feature](https://github.com/vinodliyanage/sri-lanka-nic/security/advisories/new) so we can address it before public disclosure.

## License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
