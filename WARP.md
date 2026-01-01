# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

This is the **FiveM Tools V7** platform: a Next.js App Router application (TypeScript, React, Tailwind) that serves as a hub for FiveM scripts/MLOs/assets, with:
- Supabase PostgreSQL as the primary database
- NextAuth with Discord OAuth for authentication
- A coin and spin‑wheel reward system
- Forum, messaging, notifications, and admin dashboards

Key high‑level documentation you should consult when making non‑trivial changes:
- `README.md` – primary quick start, commands, and status
- `START_HERE.md` – minimal steps to configure Discord OAuth and run locally
- `STATUS_KONEKSI.md` – canonical view of which connections and env vars are expected to be wired up
- `DATABASE_README.md` – database architecture, patterns, and links to deeper docs
- `API_DOCUMENTATION.md` – external API contract (URLs and payloads) that should remain stable
- `SECURITY.md` – admin and security hardening decisions
- `DEPLOYMENT_GUIDE.md` – Git + Vercel deployment flow and required environment variables

When changing behavior that touches auth, database, or public APIs, cross‑check these docs first.

## Commands & workflows

All commands assume `pnpm` is available and run from the repo root.

### Setup & local development

- Install dependencies:
  - `pnpm install`
- Validate environment variables before running anything expensive:
  - `pnpm run validate:env`
- Start the development server:
  - `pnpm dev`
- Open the app:
  - `http://localhost:3000`

Windows convenience scripts referenced in the docs:
- `quick-start.bat` – wraps install + checks + `pnpm dev` for a fresh start
- `start-with-check.bat` – runs database checks before starting dev
- `quick-fix.bat` – clears build caches and reinstalls after build/runtime issues

Prefer using the `pnpm` commands directly when making automated changes; treat the `.bat` files as helpers for human operators.

### Build, lint, and production

- Production build:
  - `pnpm build`
- Start production server (after building):
  - `pnpm start`
- Lint (Next.js/ESLint):
  - `pnpm lint`

Vercel deployment helpers:
- Preview deployment from local:
  - `pnpm deploy:preview`
- Production deployment from local:
  - `pnpm deploy:prod`

The primary deployment flow in practice is via Git → Vercel, as described in `DEPLOYMENT_GUIDE.md`. Use the scripts above if you need to verify the deploy pipeline from the CLI.

### Environment & connection checks

Before or after significant changes in infra‑related code, run these:

- Validate environment configuration:
  - `pnpm run validate:env` (uses `validate-env.js` and `lib/env-validation.ts`)
- Check database connectivity / schema via Node scripts:
  - `pnpm run check:db`
- Check data/content in the database via TSX scripts:
  - `pnpm db:check`
- Analyze Supabase configuration and health:
  - `pnpm analyze:supabase`
- End‑to‑end system/feature checks:
  - `pnpm test:system`
  - `pnpm test:connection`
  - `pnpm test:deploy`
  - `pnpm monitor`

Refer to `STATUS_KONEKSI.md` and `DATABASE_README.md` when interpreting results of these commands.

### Database utilities

Schema and data management are handled via a mix of SQL files and TypeScript scripts:

- Seed database with sample data:
  - `pnpm db:seed`
- Check seeded data:
  - `pnpm db:check`
- Programmatic connection tests:
  - `pnpm db:test`

SQL schema and seed files live at the repo root (e.g. `full-schema.sql`, `complete-schema.sql`, `seed-data.sql`) and in `scripts/`. When modifying schema or seed behavior, align updates across:
- SQL files
- `scripts/*.ts` or `scripts/*.mjs`
- The documentation in `DATABASE_README.md` and related analysis docs

### Tests (Vitest and system checks)

Vitest is used for unit/integration tests, and there are several higher‑level system test scripts.

Core test commands:
- Run unit tests (Vitest):
  - `pnpm test`
- Vitest UI:
  - `pnpm test:ui`
- Coverage:
  - `pnpm test:coverage`

System‑level and environment checks:
- Aggregated test flow (env + DB + features + Supabase + system):
  - `pnpm test:all`
- Realtime and production‑style tests:
  - `pnpm test:realtime`
  - `pnpm test:production`
  - `pnpm test:full`
  - `pnpm test:complete`

Running a single Vitest test or file:
- Single test file:
  - `pnpm test path/to/file.test.ts`
- Filter by test name:
  - `pnpm test -- -t "name of the test"`

Before adding new tests or changing existing flows, check for existing patterns in the `tests` directory (if present) and any test helper files, and keep them aligned with `API_DOCUMENTATION.md` and `DATABASE_README.md`.

## Architecture & code structure

### High‑level architecture

The app uses **Next.js App Router** with:
- `app/` for all routes (pages and API endpoints)
- `components/` for reusable React UI/widgets
- `lib/` for domain logic, data access, security, and integration layers
- `scripts/` for operational scripts (schema export/import, health checks, deployment validation)

Data flows roughly as:

Client UI → App Router components → Server Actions / API routes → `lib/db` / Supabase clients → PostgreSQL

Cross‑cutting concerns (auth, rate limiting, security headers, logging, Linkvertise, i18n) live in `lib/` and are reused in both API routes and server components.

### Routing & feature areas (app/)

The `app/` directory is organized by feature:
- Root and localized entry:
  - `app/[lang]/page.tsx` – language‑aware landing/home; backed by `lib/i18n.ts` and language providers in `components/`
- User‑facing features:
  - `app/assets` and `app/asset/[id]` – asset browsing and detail pages
  - `app/dashboard` – user dashboard, settings, and asset management
  - Forum, messaging, notifications, and stats pages (see routes under `app/forum`, `app/profile`, etc. if present)
- Admin console:
  - `app/admin` and subroutes such as `analytics`, `assets`, `banners`, `coins`, `database`, `forum`, `linkvertise`, `spin-wheel`, `testimonials`, `users`
  - These use server actions from `lib/actions/admin.ts` and Supabase admin clients to manage users, assets, coins, spin tickets, announcements, and pending content
- API endpoints:
  - `app/api/**/route.ts` – HTTP endpoints used by both the frontend and external clients; the structure closely mirrors `API_DOCUMENTATION.md`:
    - Auth (`app/api/auth/...`)
    - Assets (`app/api/assets/...`)
    - Coins and spin wheel (`app/api/coins`, `app/api/spin-wheel/...`)
    - Forum (`app/api/forum/...`)
    - Search (`app/api/search`)
    - Notifications and messages (`app/api/notifications/...`, `app/api/messages/...`)
    - Admin APIs (`app/api/admin/...`)
    - Setup/health utilities (e.g. `app/api/check-tables`, `app/api/init-database`, `app/api/db-init`)

When adding new routes, follow the existing segment and naming conventions and keep the contracts in sync with `API_DOCUMENTATION.md`.

### Core libraries and data layer (lib/)

The `lib/` directory is the main place to look for application logic and integrations:

- **Database abstraction**
  - `lib/db.ts` – primary export of Postgres query helpers (`db`) and types; wraps `lib/db/queries.ts` and `lib/db/types.ts`
    - Also exposes `getDb()` and intentionally blocks direct Prisma usage; new data access should go through `db` or Supabase, not a new ORM
  - `lib/database-direct.ts` and related files (if needed) provide lower‑level SQL access via `postgres`/`pg`

- **Supabase clients**
  - `lib/supabase/config.ts` – single source of Supabase configuration (URLs, keys, JWT secret, etc.) from environment variables
  - `lib/supabase/server.ts` – server‑side Supabase clients:
    - `getSupabaseServerClient` / `createClient()` – cookie‑aware client for authenticated requests
    - `getSupabaseAdminClient` / `createAdminClient()` – service‑role client for admin/server operations
  - `lib/supabase/client.ts` – browser client singleton used by client components when direct Supabase access is required

- **Server actions**
  - `lib/actions/admin.ts` – admin‑only operations:
    - Central `requireAdmin()` check based on NextAuth session + Supabase `users` table
    - Admin stats, user management, asset moderation, coin transactions, spin‑wheel management, announcement management, and approval/rejection flows
  - `lib/actions/user.ts` – user‑level operations:
    - Coin balance and tickets
    - Daily rewards
    - Spin wheel usage and history

  New admin or user behaviors should be routed through these files when possible, or follow the same pattern (server action + `db` + Supabase admin client).

- **Auth & security**
  - `lib/auth.ts` – NextAuth configuration (Discord provider, callbacks, session shape)
  - `lib/csrf.ts`, `lib/security.ts`, `lib/security-edge.ts`, `lib/forum-security.ts` – CSRF protection, security headers, and forum‑specific safeguards
  - `lib/rate-limit.ts`, `lib/rate-limit-kv.ts` – IP/user‑based rate limiting, used by sensitive endpoints
  - `lib/error-logger.ts`, `lib/logger.ts`, `lib/monitoring.ts` – logging and observability helpers

  When touching any sensitive API (`app/api/admin/**`, auth, coins, spin‑wheel, Linkvertise), reuse these utilities instead of re‑implementing checks inline.

- **Domain‑specific integrations**
  - `lib/linkvertise.ts`, `lib/linkvertise-service.ts` – Linkvertise monetization and download‑flow helpers
  - `lib/fivem-api.ts` – wrapper around internal/external FiveM‑related APIs, as referenced in `STATUS_KONEKSI.md`
  - `lib/two-factor-auth.ts` – 2FA support based on `otplib`
  - `lib/store.ts`, `lib/types.ts`, `lib/utils.ts`, `lib/constants.ts` – shared state, types, utilities, and constants

- **Environment and validation**
  - `lib/env-validation.ts` + `validate-env.js` – central place where required env vars are declared and validated; add new critical env vars here when introducing new configuration

### UI components (components/)

The `components/` directory holds shared UI and feature components. Notable groups:
- Admin UI:
  - `components/admin/admin-sidebar-nav.tsx`, `components/admin/announcement-manager.tsx`, `components/admin/banner-manager.tsx`, `components/admin/forum-settings-manager.tsx`, `components/admin/spin-wheel-manager.tsx`
  - These compose admin server actions with dashboards and controls
- Core layout and chrome:
  - `components/app-wrapper.tsx`, `components/header.tsx`, `components/hero-section.tsx`, `components/global-search.tsx`, `components/navbar`‑related components (if present)
- Feature widgets:
  - Coins, spin, Linkvertise, and database helpers, e.g. `coin-icon.tsx`, `daily-coins-button.tsx`, `daily-spin-ticket.tsx`, `linkvertise-*`, `database-init.tsx`, `database-setup.tsx`
- Experience and theming:
  - `language-provider.tsx`, `language-selector.tsx`, `holiday-theme*`, and various animated/3D card components

When adding new UI around existing behaviors, try to:
- Reuse the existing feature components for coins, assets, forum, and admin controls
- Keep server logic in `lib/actions` or API routes, and keep components as thin as possible

### Security‑sensitive areas

There is explicit history of security hardening for admin features, documented in `SECURITY.md` and reflected in the code:
- Admin privilege checks are centralized in `lib/actions/admin.ts` (`requireAdmin()`)
- Admin and high‑risk APIs live under `app/api/admin/**` and should always:
  - Use established auth/session checks
  - Apply rate limiting and logging where appropriate

If you modify or add any admin, auth, or coin/spin‑wheel functionality:
- Review `SECURITY.md` for current expectations
- Reuse `requireAdmin()` and the existing rate‑limit/logging utilities instead of creating new ad‑hoc checks

### Environment, deployment, and external services

Environment variables and deployment behavior are defined across:
- `.env*` files (local configuration)
- `.env.template` / `.env.example` (documented contract)
- `DEPLOYMENT_GUIDE.md` and `VERCEL_ENV_SETUP.txt` (Vercel configuration)
- `STATUS_KONEKSI.md` (which variables are currently considered required/optional)

Core external dependencies:
- **Supabase** – main PostgreSQL database and auth/JWT configuration
- **Discord OAuth (NextAuth)** – primary login provider
- **Linkvertise** – monetized download flow for assets
- **Vercel** – hosting for both the Next.js application and edge/serverless functions

When introducing new environment variables or external integrations:
- Update `lib/env-validation.ts` / `validate-env.js`
- Extend `DEPLOYMENT_GUIDE.md` and `.env.template`/`.env.example` as needed
- Consider whether the new integration belongs in `lib/` (e.g. `lib/<service>-service.ts`) and mirror existing patterns (Supabase, Linkvertise, etc.)
