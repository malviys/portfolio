---
trigger: always_on
glob: **/*
description: Portfolio project tech stack, coding standards, and architectural guidelines
---

# Portfolio Project - Technical Guidelines

## Tech Stack

- **Next.js 14.2.5** (App Router) + **React 18** + **TypeScript 5** (strict mode)
- **TailwindCSS 3.4+** with `tailwindcss-animate`
- **Radix UI** primitives (`avatar`, `hover-card`, `navigation-menu`, `slot`)
- **next-themes**, **CVA**, **clsx** + **tailwind-merge**
- **lucide-react** for icons
- **ESLint** + **Prettier** + **PostCSS**

## Project Structure

```
portfolio/
├── public/                      # Static assets (images, fonts)
├── src/
│   ├── app/                    # Next.js App Router (pages, layouts, routes)
│   ├── components/
│   │   ├── ui/                 # Reusable UI components (shadcn/ui)
│   │   └── system/             # System components (header, footer)
│   ├── hooks/                  # Custom hooks (use-*.ts)
│   └── lib/                    # Utilities (utils.ts with cn())
├── components.json             # shadcn/ui config
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

## Key Conventions

### File Organization

- UI components → `src/components/ui/` (kebab-case files)
- System components → `src/components/system/`
- Routes follow App Router conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- Hooks → `src/hooks/use-*.ts` (named exports)
- Utilities → `src/lib/` (named exports)

### Naming

- **Components**: PascalCase | **Files**: kebab-case | **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE | **Types/Interfaces**: PascalCase | **Hooks**: `use` prefix

### TypeScript

- No `any` types — always provide proper types
- Use `type` for unions/aliases, `interface` for object shapes
- Extend HTML props: `interface ButtonProps extends React.ComponentProps<'button'>`

### Styling

- Use CVA for component variants with `cn()` for class merging
- `cn()` = `twMerge(clsx(inputs))` from `src/lib/utils.ts`

### Components

- Server Components by default; add `'use client'` only when needed
- Prefer named exports (except pages/layouts)
- Keep functions < 50 lines, files < 300 lines

### Import Order

1. External deps (`react`, `clsx`)
2. Internal absolute (`@/components/*`, `@/hooks/*`)
3. Relative imports
4. Styles

### Modern JS/TS

- ES Modules only (no CommonJS)
- Use: `async/await`, `?.`, `??`, destructuring, spread, arrow functions, `Array.map/filter/reduce`

### Performance

- `next/image` for images, `next/font` for fonts
- Server Components to reduce client bundle
- Dynamic imports for code splitting
- `React.memo`, `useMemo`, `useCallback` for expensive operations

### Accessibility

- Semantic HTML, keyboard navigation, Radix UI primitives
- Proper ARIA labels, WCAG color contrast

### Version Control

- Conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Branches: `feature/`, `fix/`, `refactor/`, `docs/`
