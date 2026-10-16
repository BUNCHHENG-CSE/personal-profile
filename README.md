# Personal gaming profile

An original dark personal profile built with Next.js App Router, React, TypeScript, Tailwind CSS, Lucide, Recharts, Prisma 7, PostgreSQL, and Better Auth. The public page reads a saved profile and active theme from PostgreSQL. A private administrator can edit the profile, manage themes, moderate anonymous messages, and view analytics.

## Features and architecture

- `/` shows the database profile, safe HTTPS social links, optional user-initiated audio, an estimated visitor counter, anonymous message form, and approved messages when enabled. It supports reduced motion.
- `/dashboard` and its analytics, profile, themes, messages, and settings pages require a database session. Every admin API route checks that session and the configured admin email on the server.
- `app/api` contains public and protected Route Handlers. `lib/validation.ts` holds Zod contracts; `lib/data.ts` holds profile reads; `lib/security.ts` handles authorization, origin checks, request limits, and shared PostgreSQL rate buckets.
- `prisma/schema.prisma` defines Better Auth user/session/account/verification tables plus Profile, Theme, Message, AnalyticsEvent, and RateBucket. The initial migration adds a partial unique index for one active theme per profile, constraints, foreign keys, and query indexes. Application timestamps are UTC.
- The generated Prisma client lives in ignored `generated/`. Prisma is imported only from server modules. External images and audio use HTTPS URLs; no storage account is required.

## Local setup

Install [Bun](https://bun.sh/docs/installation), Git, and PostgreSQL. [Neon Free](https://neon.com/) is suitable for personal use; local PostgreSQL also works. Bun manages local dependencies and scripts. Vercel functions run on supported Node.js.

```powershell
bun install
Copy-Item .env.example .env.local
```

Edit `.env.local`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled PostgreSQL URL for the app; use Neon's `-pooler` hostname. |
| `DIRECT_URL` | Direct PostgreSQL URL for controlled Prisma migrations. |
| `BETTER_AUTH_SECRET` | At least 32 random characters. Generate with `bun -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`. |
| `BETTER_AUTH_URL` | Exact local or production origin, for example `http://localhost:3000`. |
| `ADMIN_EMAIL` | The one administrator's login email. |

Where each value comes from, in file order:

1. `DATABASE_URL` comes from your PostgreSQL provider. In Neon, create a free project, open its connection details, enable the pooled connection, and copy the URL whose hostname contains `-pooler`. The project uses this URL for normal page and API traffic.
2. `DIRECT_URL` comes from the same Neon database. Copy the direct, non-pooled connection URL. Prisma uses it only for controlled schema migrations.
3. `BETTER_AUTH_SECRET` does not come from Neon or Vercel. Generate it locally once with the command below, paste the complete output as the value, and use the same value in local development and the matching Vercel environment. Do not use the example text as a real secret.
4. `BETTER_AUTH_URL` is the public origin where this app runs. Use `http://localhost:3000` locally. After deployment, use the exact Vercel URL such as `https://your-project.vercel.app`, without a trailing slash.
5. `ADMIN_EMAIL` is an email address you choose for the only dashboard account. It does not require an email service because public registration and email verification flows are disabled. The value must match the address used when you run the provisioning command.

Generate the authentication secret:

```powershell
bun -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Keep the two database URLs and the authentication secret private. If one is exposed, rotate it at its source: reset the Neon database password for a database URL, or generate a new authentication secret and sign in again for `BETTER_AUTH_SECRET`.

Do not commit `.env` or `.env.local`. `.env.example` contains placeholders only. Credentials must never use a `NEXT_PUBLIC_` prefix. For Neon, copy its pooled and direct URLs separately. `prisma.config.ts` uses the direct URL for CLI operations.

Apply the checked-in migration, provision the first administrator, and start:

```powershell
bun run db:validate
bun run db:generate
bun run db:deploy
bun run admin:provision
bun run dev
```

Use `bun run db:migrate -- --name <change-name>` only when developing a new migration. `admin:provision` prompts for a password of at least 14 characters, hashes it with Better Auth's password hasher, creates the credential account in one transaction, and refuses a second admin. Public sign-up is disabled. Sign in at `/login`, then set your real profile details in `/dashboard/profile`.

Run checks:

```powershell
bun run typecheck
bun run lint
bun run test
bun run build
```

The default tests cover validation boundaries without an external service. The integration tests are skipped until you explicitly target an isolated development database. Apply the migration to that database, provision its admin, start `bun run dev`, then set `TEST_DATABASE_URL` to the test database URL, `TEST_BASE_URL=http://localhost:3000`, and `TEST_DATABASE_ACK=isolated` before `bun run test`. To include login/logout, also set `TEST_ADMIN_EMAIL` and `TEST_ADMIN_PASSWORD` for that test run. These test-only variables must stay out of committed files. Never point the integration suite at production. Live database checks need credentials.

## API, security, and privacy

Public endpoints are `GET /api/profile`, `POST /api/analytics/events`, and `POST /api/messages`. Supported events are `profile_view` and `social_link_click`; both require `/`, and link clicks require a saved link identifier. The server sets authoritative timestamps. Views from the same random first-party cookie are deduplicated within 30 minutes. Distinct cookie tokens are **estimates**, not human identification. A visitor who clears cookies can be counted again. The cookie is HTTP-only, SameSite Lax, and Secure in production. Event tokens are HMAC hashes; analytics and message rows contain no raw IP. The server temporarily reads Vercel's overwritten `X-Forwarded-For` to create a hashed public rate key. Better Auth may retain administrator IP metadata in its session and login rate-limit records. Locally, all localhost public requests share a rate key.

Anonymous messages store only text, status, and timestamps. There is no sender account or raw-IP column. A honeypot, request-size cap, strict validation, and shared database rate bucket reduce spam. Messages start as `PENDING`; only approved messages can appear publicly. React renders content as text. Settings control messages, analytics, public approved messages, and a 7–365 day retention window. Use **Delete expired data now** to enforce retention; cleanup is manual. Anonymous does not mean technically impossible to identify at the hosting layer.

The rate limiter uses atomic PostgreSQL upserts and expiring keys. It limits messages, analytics, protected mutations, and cleanup. Better Auth limits login attempts and manages session cookies and expiration. If PostgreSQL fails, public writes fail closed with 503. Authenticated mutations also require a same-origin request. Rate bucket rows are removed by cleanup. At higher traffic, consider a shared Redis service only after checking its current free quota.

## Free-tier deployment

As checked on **12 October 2026**, [Vercel Hobby](https://vercel.com/docs/plans/hobby) is free for eligible personal, non-commercial use, with included limits such as 1,000,000 function invocations per period; exceeding a Hobby quota can suspend the affected feature until it resets. [Neon announced](https://neon.com/blog/neon-free-plan-1-gb-per-project) 100 Free projects and 1 GB storage per project on 2 October 2026; check its dashboard for current compute and network allowances. This project does **not** require Upstash or Cloudinary. [Upstash Free](https://upstash.com/pricing/redis) currently lists 256 MB and 500,000 monthly commands, but no Redis integration is enabled. Free tiers can change and do not guarantee capacity or uptime. Stay on free plans, do not add a card or enable paid upgrades, and monitor quota dashboards. The target is $0 within eligible limits, not a cost guarantee.

1. Create your own Neon Free project and save both URLs securely. Apply the migration from a trusted local machine with `bun run db:deploy`, then run `bun run admin:provision` once. No database or external account is created by this repository.
2. Create a GitHub repository and push this project, excluding `.env.local` and `generated/`. Review the commit before `git push -u origin main`.
3. Import the repository into Vercel Hobby under an eligible personal account. Use the generated `*.vercel.app` domain. Configure all five variables above in Vercel; set `BETTER_AUTH_URL` to the exact production origin.
4. Use `bun run build` as a local gate. Vercel builds with Node.js and the build script generates Prisma Client. Do not run migrations on each request. Apply later migrations from a controlled CLI/CI step before deploying compatible code.
5. Verify `/`, `/login`, protected `/dashboard`, a profile save, theme activation, anonymous message submission and moderation, analytics after a view, and logout. Check Vercel and Neon quota dashboards.

Rollback application code through Vercel's previous deployment or a Git revert. Database rollback needs a separate reviewed migration. Before schema changes, export important data with `pg_dump` using the direct URL and protect the dump as a secret. Free backup windows may be limited.

## Operational notes

- Missing database configuration shows a first-run page; public writes return errors rather than pretending to save. Login requires the configured secret and database.
- HTTPS image/audio URLs work without Cloudinary. No upload endpoint exists. External hosts may reject playback; static files in `public/` can be used if needed.
- Analytics writes one row per accepted event. At higher traffic, move to daily aggregates and scheduled cleanup to stay within database limits.
- Check `BETTER_AUTH_URL` if login redirects fail. Check pooled versus direct URLs and migration status for Prisma connection or missing-table errors. Confirm `ADMIN_EMAIL` matches the provisioned email if dashboard access is denied.
- Deployment is prepared but not performed here; user-owned Neon, GitHub, and Vercel accounts and credentials are required. No paid service is enabled.
