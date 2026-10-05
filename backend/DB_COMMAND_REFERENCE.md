# FreshCuts Backend — Prisma & Database Reference

All commands run from `\freshcuts\backend`.

## Contents

- [Golden rule](#golden-rule)
- [Standard workflow](#standard-workflow)
- [Migrations](#migrations)
- [Seed](#seed)
- [Client generation](#client-generation)
- [Inspecting data](#inspecting-data)
- [Resetting the database](#resetting-the-database)
- [PostgreSQL access](#postgresql-access)
- [Dev server](#dev-server)
- [Troubleshooting](#troubleshooting)
- [Quick reference](#quick-reference)

---

## Golden rule

**Stop the dev server before any `prisma` command. Restart it afterward.**

Prisma needs exclusive access to its generated client. A running Node process locks the query engine DLL and causes `EPERM: operation not permitted`.

---

## Standard workflow

For any schema change:

```powershell
# 1. Stop the dev server
# 2. Edit prisma/schema.prisma
# 3. Apply the migration
npx prisma migrate dev --name describe_your_change
# 4. (optional) update prisma/seed.js
# 5. Restart
npm run dev
```

---

## Migrations

| Command | Use |
|---|---|
| `npx prisma migrate dev --name short_name` | Create + apply a migration (dev) |
| `npx prisma migrate deploy` | Apply pending migrations (prod/CI, no prompts) |
| `npx prisma migrate status` | Check for pending migrations or drift |
| `npx prisma migrate reset` | Wipe DB, re-apply all migrations, re-seed |
| `npx prisma migrate resolve --rolled-back <name>` | Un-stick a failed migration |

Local dev → `migrate dev`. Production → `migrate deploy`. Don't mix them.

---

## Seed

Configured in `package.json` under `"prisma": { "seed": "node prisma/seed.js" }`.

```powershell
npx prisma db seed
```

Idempotent (`upsert`). `migrate reset` runs it automatically after wiping.

---

## Client generation

```powershell
npx prisma generate
```

Required after editing the schema without a migration, after a `git pull` that changed the schema, or to recover from `EPERM`. **Stop the dev server first.**

---

## Inspecting data

```powershell
npx prisma studio
```

Browser UI at `http://localhost:5555`. Browse, edit, delete rows.

---

## Resetting the database

| Level | Command | Effect |
|---|---|---|
| Gentle | `npx prisma db seed` | Re-run seed only |
| Medium | `npx prisma migrate reset` | Drop all tables, re-migrate, re-seed |
| Hard | Drop + recreate DB (below) | Nuke the database itself |

```powershell
# Hard reset — stop dev server first
& "C:\Program Files\PostgreSQL\16\bin\psql" -U postgres -h localhost -p 5433 -c "DROP DATABASE freshcuts;"
& "C:\Program Files\PostgreSQL\16\bin\psql" -U postgres -h localhost -p 5433 -c "CREATE DATABASE freshcuts;"
npx prisma migrate deploy
npx prisma db seed
```

```powershell
# Delete only users (keep seed data). Quotes required — "user" is reserved.
& "C:\Program Files\PostgreSQL\16\bin\psql" "postgresql://postgres:test%40@127.0.0.1:5433/freshcuts" -c "DELETE FROM \"User\";"
& "C:\Program Files\PostgreSQL\16\bin\psql" "postgresql://postgres:test%40@127.0.0.1:5433/freshcuts" -c "DELETE FROM \"EmailVerificationToken\";"
& "C:\Program Files\PostgreSQL\16\bin\psql" "postgresql://postgres:test%40@127.0.0.1:5433/freshcuts" -c "DELETE FROM \"RefreshToken\";"
```

---

## PostgreSQL access

**Port is 5433** (not default 5432).

```powershell
# Connect
& "C:\Program Files\PostgreSQL\16\bin\psql" -U postgres -h localhost -p 5433 freshcuts
```

```sql
\dt              -- list tables
\d "User"        -- describe a table (quotes needed)
\l               -- list databases
\q               -- quit
```

```powershell
# Windows service control
net stop postgresql-x64-16
net start postgresql-x64-16
netstat -ano | findstr ":5433"    # expect LISTENING
```

| File | Purpose |
|---|---|
| `C:\Program Files\PostgreSQL\16\data\postgresql.conf` | Server config |
| `C:\Program Files\PostgreSQL\16\data\pg_hba.conf` | Auth rules |
| `C:\Program Files\PostgreSQL\16\data\log\` | Server logs |

---

## Dev server

```powershell
npm run dev    # from project root, starts both frontend + backend
```

| Service | Port |
|---|---|
| Backend API | 5000 |
| Frontend (Vite) | 5173 |
| Prisma Studio | 5555 |
| PostgreSQL | 5433 |

---

## Troubleshooting

| Error | Fix |
|---|---|
| `EPERM: operation not permitted, rename ... query_engine-windows.dll.node` | Stop dev server, run `npx prisma generate` |
| `P1001: Can't reach database server` | `netstat -ano \| findstr ":5433"`, check `DATABASE_URL` |
| `P1000: Authentication failed` | Fix password in `.env`; encode `@` as `%40` |
| `P2021: The table ... does not exist` | `npx prisma migrate dev` |
| `P2002: Unique constraint failed` | Duplicate value (e.g. email) — expected, return 409 |
| `Environment variable not found: DATABASE_URL` | `.env` at `backend/.env`, no BOM, no quotes |
| `Drift detected` | `npx prisma migrate reset` (dev only) |
| `require is not defined in ES module scope` | Use `import`, or rename to `.cjs` |
| `@prisma/client did not initialize yet` | `npx prisma generate` |

---

## Quick reference

```powershell
npx prisma studio                          # inspect/edit data
npx prisma migrate dev --name change_name  # create migration after schema edit
npx prisma migrate reset                   # wipe + re-migrate + re-seed
npx prisma generate                        # regenerate client
npx prisma migrate status                  # check state
npx prisma db seed                         # run seed only
npx prisma migrate deploy                  # apply migrations (prod)
```

### Recommended `package.json` scripts

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:reset": "prisma migrate reset --force",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:status": "prisma migrate status",
    "postinstall": "prisma generate"
  }
}
```

The `postinstall` hook prevents the `@prisma/client did not initialize yet` error after fresh installs.