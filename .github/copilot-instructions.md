# Copilot instructions for FreshCuts

## Build, test, and lint

Use the repository root for workspace-level commands:

```bash
# install dependencies
npm install

# run the app locally
npm start

# run the frontend dev server only
npm run dev:frontend

# run the backend dev server only
npm run dev:backend

# build the frontend bundle
npm run build

# lint both workspaces (when scripts exist)
npm run lint

# run all workspace tests
npm test
```

Single-test commands are supported through the workspace scripts. The backend currently has the concrete test pattern:

```bash
npm test --workspace backend -- --run tests/password.test.js
```

When adding a frontend test file, use the same Vitest pattern from the workspace root:

```bash
npm test --workspace frontend -- --run src/path/to/test-file.test.jsx
```

Database commands that are already part of the repo:

```bash
npm run db:migrate
npm run db:seed
npm run db:studio
```

## High-level architecture

This repo is a monorepo managed by npm workspaces:

- `frontend/` is a Vite + React app using Redux Toolkit, React Router, and Tailwind CSS.
- `backend/` is an Express API using Prisma and PostgreSQL.
- The root `package.json` orchestrates both workspaces and the app startup flow.
- `npm start` runs the frontend dev server, API server, and database-backed email outbox worker together; the worker can also be run with `npm run worker --workspace backend`.

The backend is organized around a clear route/controller/service split:

- `backend/src/routes/*.js` define the API surface and wire middleware/validation.
- `backend/src/controllers/*.js` handle HTTP request/response concerns.
- `backend/src/services/*.js` contain the business logic and Prisma access.
- `backend/src/validations/*.js` define Joi schemas for input validation.
- `backend/src/config/*.js` holds environment and middleware configuration.

The app-level server bootstrap is intentionally simple:

- `backend/src/app.js` registers middleware, CSRF protection, API prefixing, and route mounts.
- `backend/src/server.js` creates the HTTP server and starts the app, then closes Prisma on shutdown.
- Appointment, availability, staff, notification, and admin endpoints are mounted under `/api/v1` and use the existing auth, role, and validation middleware.

Authentication is implemented as a cookie-based JWT flow:

- short-lived access tokens are issued to the client
- rotating refresh tokens are stored server-side and sent in HTTP-only cookies
- auth session flows and email verification live in `backend/src/auth/`, `backend/src/services/`, and related config modules

The frontend follows a routed app structure with role-aware access:

- `frontend/src/routes.jsx` defines public, protected, staff, and admin routes.
- `frontend/src/store/` contains Redux slices for app state.
- `frontend/src/pages/` organizes pages by feature area such as account, staff, and admin.
- `frontend/src/services/` centralizes API calls and client-side data operations.

The repo assumes a native local PostgreSQL setup rather than Dockerized services. Development is designed to run directly on the host OS.

## Key conventions

- Follow the existing backend layering: keep route files thin, controllers focused on HTTP concerns, and business logic in services.
- Keep validation in `backend/src/validations` and apply it at route level with the existing validation middleware.
- `backend/src/validations/*.js` and `middleware/validate.js` are the canonical places for request schema checks.
- Use named/default function declarations for React components rather than inline arrow function components; the repo already uses this pattern in the frontend pages and layout code.
- Prefer Tailwind utility classes directly in JSX instead of creating additional custom CSS for routine styling.
- Keep route groups aligned with the repo’s structure: `account`, `staff`, and `admin` pages are already separated and role-gated with their own wrappers.
- Use `async/await` consistently; the backend codebase already relies on Promise-based async flows rather than callback-heavy patterns.
- Before a larger code change, briefly describe the approach in the work context; the repo’s existing project guidance explicitly calls for that.
- Keep comments minimal and only add them where the logic is not obvious from the code itself.
- Do not bypass the auth/role route guards already implemented in the app; protected and role-specific pages are intended to stay behind `ProtectedRoute` and `RoleRoute`.

## Environment and setup notes

- The default local database name is `freshcuts` and the app expects a normal PostgreSQL service running on `localhost:5432`.
- Copy environment files before running the app:

```bash
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

- The backend expects the usual runtime config values such as `DATABASE_URL`, JWT secrets, and SMTP settings.
- Frontend environment config is expected to target the local API at `http://localhost:5000/api/v1` unless intentionally changed.

## Relevant repo-specific references

- `README.md` is the primary product and local-setup reference.
- `.windsurfrule` contains repo-specific coding conventions that should be respected alongside this file.
- The backend uses Prisma schema and lifecycle commands from `backend/prisma/` and `backend/package.json`.
