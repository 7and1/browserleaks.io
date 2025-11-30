# Repository Guidelines

## Project Structure & Module Organization
Turbo-powered npm workspaces split code between `apps/` and `packages/`. `apps/web` is the Next.js 15 front end (App Router in `app/`, UI primitives in `components/`, hooks/stores beside usage) and `apps/api` is the Express 5 service layered under `src/{routes,services,clients}`. Shared building blocks live in `packages/core` (fingerprint logic), `packages/ui` (shadcn-inspired components), `packages/types` (export barrel in `src/index.ts`), while product docs stay in `docs/`; only `.env` remains local.

## Build, Test, and Development Commands
- `npm run dev` – watch both apps (web on :3000, api on :4000).
- `npm run dev:web` / `npm run dev:api` – single-app loops when isolating issues.
- `npm run build` – runs `next build` plus `tsc` through every workspace.
- `npm run test` / `npm run test:watch` – executes Vitest and writes `coverage/`.
- `npm run lint`, `npm run type-check` – ESLint + `tsc --noEmit` gates for PRs.
- `npm run clean`, `npm run format(:check)` – drop caches and enforce Prettier 3.1.

## Coding Style & Naming Conventions
Prettier’s defaults (2-space indent, semicolons, single quotes) are authoritative; fail fast with `npm run format:check`. React pieces, Zustand stores, and hooks are PascalCase `.tsx` files, while reusable UI must be exported through `packages/ui/src/index.ts`. Keep logic in hooks/services, order Tailwind utilities from layout → spacing → color, and resolve ESLint findings before review.

## Clinical Precision UI Playbook
- Palette: `bg-slate-950` canvas, `bg-slate-900/80` panels, cyan (`#22d3ee`) for “safe” telemetry, orange (`#f97316`) for leaks. Use `JetBrains Mono` (`var(--font-jetbrains)`) for data, `Inter` for UI copy.
- Components: build inside `components/layout` and `components/dashboard`. `LabShell` wraps `LabDock` + `StatusBar`; `ExposureRadar`, `LiveAuditLog`, and `AttackSurfacePanel` live under dashboard to ensure every lab uses the same chrome.
- Effects: prefer `specimen-container`, `lab-panel`, and glow utility classes from `globals.css`. Avoid rounded corners beyond `rounded-sm` to preserve Surgical Dark aesthetic.
- Data: all metrics should surface raw values plus human explanation (e.g., IP + ASN, DNS resolver, leak severity). Inject placeholder data when backend endpoints are not wired yet, but keep the shape aligned with `packages/types` contracts.

## Testing Guidelines
API code relies on Vitest (see `apps/api/src/services/__tests__` and `apps/api/src/routes/__tests__`), so place new specs beside the source with the `*.test.ts` suffix and mock outbound HTTP via `clients/`. Keep `npm run test` green locally and in CI; coverage artifacts should remain under `coverage/`. Front-end features with real logic should either gain API-side assertions or colocated `.test.tsx` files wired into the Turbo `test` pipeline.

## Commit & Pull Request Guidelines
This snapshot omits `.git`, so mimic BrowserLeaks’ conventional commits (`type(scope): summary`, e.g., `feat(api): add dns leak scoring`) to stay compatible with upstream history. Use bodies for motivation, validation commands, and `BREAKING CHANGE` notes when contracts move. PRs must summarize scope, list the commands executed, call out doc updates (e.g., `docs/ARCHITECTURE.md`), and attach UI screenshots whenever `apps/web` shifts.

## Security & Configuration Tips
Set `NEXT_PUBLIC_API_URL`, `IPINFO_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_RADAR_TOKEN` before running builds, and keep real values inside `.env` only. Preserve Express hardening middleware in `apps/api/src/middleware`, rerun `npm run lint` after touching headers, and refresh `.env.example` whenever configuration changes.
