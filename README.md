# blxckt

A private ledger for the reasons you blocked someone on X. Every block gets a
case file: the handle, the reason in your own words, a category, optional notes
and evidence links, and a date to reconsider it.

No X API, no scraping, no import — you write the reason down yourself, which is
the whole point.

## Features

- **Ledger** — every block as a case file with a per-user case number.
- **Categories** — user-managed colored labels (seeded with a few defaults).
- **Search & filter** — by handle, reason, notes; filter by status and category.
- **Notes & evidence** — free-form notes plus evidence links (tweets, DMs,
  screenshots) attached to a record.
- **Stats** — totals, monthly activity, category breakdown, 12-month timeline.
- **Review queue** — set a review date and reconsider blocks when it arrives.
- **Export / backup** — download everything as JSON or CSV.

## Stack

- Next.js 16 (App Router) + React 19, TypeScript
- Tailwind CSS v4
- Drizzle ORM + better-sqlite3 (SQLite)
- Zod for validation
- Email + password auth with DB-backed sessions (scrypt hashing, no auth service)

## Requirements

- **Node 25.2.0.** `better-sqlite3` segfaults under Node 22 in this project.
  The version is pinned in `.tool-versions` for asdf/mise users.
- **pnpm 10.22.0** (pinned via `packageManager`).

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create the SQLite database and apply migrations
pnpm db:migrate

# 3. Run the dev server
pnpm dev
```

Open <http://localhost:3000>, create an account, and the default categories are
seeded automatically.

## Environment

Copy `.env.example` to `.env` if you want to override defaults.

| Variable        | Default           | Notes                              |
| --------------- | ----------------- | ---------------------------------- |
| `DATABASE_PATH` | `./data/blxckt.db` | SQLite file used by better-sqlite3 |

The `./data` directory is git-ignored and created on demand.

## Scripts

| Script             | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `pnpm dev`         | Start the dev server                     |
| `pnpm build`       | Production build                         |
| `pnpm start`       | Serve the production build               |
| `pnpm lint`        | ESLint                                   |
| `pnpm typecheck`   | TypeScript, no emit                      |
| `pnpm db:generate` | Generate a migration from the schema     |
| `pnpm db:migrate`  | Apply pending migrations                 |
| `pnpm db:push`     | Push schema directly (development)       |
| `pnpm db:studio`   | Browse the database with Drizzle Studio  |

## Data model

`users`, `sessions`, `categories`, `blocks`, `evidence` — see
`src/lib/db/schema.ts`. All data is scoped to the owning user.

## Notes on Next 16

This app targets Next 16 specifically: async `cookies()`/`headers()`/`params`,
`proxy.ts` instead of `middleware.ts`, and Turbopack by default.
