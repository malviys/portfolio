---
trigger: always_on
glob: **/*
description: Git commit standards and pre-commit validation rules
---

# Git Commit Standards

This project enforces industry-standard Git commit conventions with automated pre-commit validation.

## Commit Message Format

All commit messages must follow the **Conventional Commits** specification:

```
type(scope?): description

[optional body]

[optional footer]
```

### Valid Types

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style changes (formatting, no logic change)
- `refactor` — Code refactoring (no feature/bug changes)
- `test` — Test additions or changes
- `chore` — Build/tooling changes
- `perf` — Performance improvements
- `ci` — CI/CD changes
- `revert` — Revert previous commit

### Examples

✅ **Valid**:

- `feat: add user authentication`
- `fix(header): resolve navigation menu bug`
- `docs: update README with setup instructions`
- `refactor(utils): extract helper function`
- `test: add unit tests for button component`

❌ **Invalid**:

- `Added new feature` (missing type)
- `FEAT: new feature` (uppercase not allowed)
- `fix: fixed bug.` (no period at end)
- `update` (missing type and colon)

## Pre-Commit Validation

Every commit automatically runs:

1. **ESLint** — Lints staged `.ts` and `.tsx` files (auto-fixes when possible)
2. **TypeScript** — Type-checks all files with `tsc --noEmit`
3. **Commitlint** — Validates commit message format

**Commits are blocked if**:

- TypeScript has type errors
- ESLint finds unfixable errors
- Commit message doesn't follow conventional format

## Configuration Files

- **`commitlint.config.js`** — Commit message validation rules
- **`.lintstagedrc.js`** — Pre-commit checks configuration
- **`.husky/pre-commit`** — Runs lint-staged before commit
- **`.husky/commit-msg`** — Validates commit message format

## Bypassing Hooks (Emergency Only)

```bash
# NOT RECOMMENDED - only for emergencies
git commit --no-verify -m "emergency fix"
```

## Scripts

- `bun run type-check` — Run TypeScript type-checking manually
- `bun run lint` — Run ESLint manually
- `bun run prepare` — Initialize Husky hooks
