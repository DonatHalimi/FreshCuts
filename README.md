# FreshCuts

FreshCuts is a personal-care booking platform for barber shops and stylists. The current foundation includes customer accounts, a public service/provider directory, dynamic availability, appointment booking and management, and role-protected staff/admin workflows.

## Architecture

- **Frontend:** React + Vite + JavaScript + Redux Toolkit + React Router DOM + Tailwind CSS + Axios + React Hook Form
- **Backend:** Node.js + Express + JavaScript + Prisma + PostgreSQL
- **Authentication:** short-lived JWT access token and rotating JWT refresh token in HTTP-only cookies
- **Email:** Nodemailer over SMTP; development can use a configured SMTP account or Nodemailer's temporary test account
- **Validation:** Joi on the server, React Hook Form rules in the browser
- **Logging:** Pino + pino-http
- **Testing:** Vitest + Supertest + Testing Library + MSW

The project is designed to run directly on the host operating system. PostgreSQL is installed and started as a normal local service; the application does not require a container runtime.

## MVP v1

### Customer

- Registration with unique email
- Email verification through a time-limited single-use link
- Login and logout using HTTP-only cookies
- Automatic access-token refresh
- Basic profile view and update
- Browse services
- Browse providers/stylists/barbers
- Provider detail page with supported services
- Browse live availability calculated from provider hours, breaks, time off, service duration, and existing appointments
- Create, view, cancel, and reschedule appointments
- Idempotent booking requests and transactional conflict protection
- Staff schedule and roster tools, plus basic admin dashboard and management endpoints
- Appointment notifications and queued transactional email
- Consistent validation and API error handling

### Deliberately deferred

- Payments/deposits
- SMS reminders and waitlists
- Point of sale, inventory, payroll, and commissions
- Reviews and loyalty
- Marketing automation and advanced analytics
- Social authentication

## Project structure

```text
freshcuts/
├── .editorconfig
├── .gitignore
├── LICENSE
├── package.json
├── README.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── auth/
│   │   │   ├── authenticate.js
│   │   │   ├── password.js
│   │   │   └── token.service.js
│   │   ├── config/
│   │   │   ├── cookies.js
│   │   │   ├── cors.js
│   │   │   ├── env.js
│   │   │   └── logger.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── health.controller.js
│   │   │   ├── provider.controller.js
│   │   │   ├── service.controller.js
│   │   │   └── user.controller.js
│   │   ├── database/
│   │   │   └── prisma.js
│   │   ├── middleware/
│   │   │   ├── csrfGuard.js
│   │   │   ├── errorHandler.js
│   │   │   ├── notFound.js
│   │   │   ├── rateLimiters.js
│   │   │   └── validate.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── health.routes.js
│   │   │   ├── provider.routes.js
│   │   │   ├── service.routes.js
│   │   │   └── user.routes.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── emailVerification.service.js
│   │   │   ├── mail.service.js
│   │   │   ├── provider.service.js
│   │   │   ├── service.service.js
│   │   │   └── user.service.js
│   │   ├── templates/email/
│   │   │   └── verifyEmail.js
│   │   ├── utils/
│   │   │   ├── AppError.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── escapeHtml.js
│   │   │   ├── hash.js
│   │   │   └── response.js
│   │   └── validations/
│   │       ├── auth.validation.js
│   │       ├── provider.validation.js
│   │       └── user.validation.js
│   └── tests/
│       └── password.test.js
└── frontend/
    ├── .env.example
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── prettier.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── routes.jsx
        ├── assets/logo.svg
        ├── components/
        │   ├── layout/AppShell.jsx
        │   ├── layout/Footer.jsx
        │   ├── layout/Header.jsx
        │   ├── layout/ProtectedRoute.jsx
        │   ├── providers/ProviderCard.jsx
        │   └── ui/
        │       ├── Alert.jsx
        │       ├── Button.jsx
        │       ├── Card.jsx
        │       ├── Input.jsx
        │       └── Spinner.jsx
        ├── hooks/useDocumentTitle.js
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── LoginPage.jsx
        │   ├── NotFoundPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── ProviderDetailPage.jsx
        │   ├── ProvidersPage.jsx
        │   ├── RegisterPage.jsx
        │   └── VerifyEmailPage.jsx
        ├── services/
        │   ├── apiClient.js
        │   ├── auth.api.js
        │   ├── providers.api.js
        │   └── services.api.js
        ├── store/
        │   ├── authSlice.js
        │   └── store.js
        ├── styles/index.css
        └── utils/errors.js
```

## Native local setup

### Prerequisites

- Node.js 20.19+ or a current Node LTS release
- PostgreSQL 16+ installed natively
- npm

### 1. Create the PostgreSQL database

Start PostgreSQL from your operating system's Services panel or PostgreSQL's normal local launcher. Then create the database with either pgAdmin or `psql`:

```sql
CREATE DATABASE freshcuts;
```

The default development connection string assumes:

```text
postgresql://postgres:YOUR_PASSWORD@localhost:5432/freshcuts
```

### 2. Configure the backend

```powershell
Copy-Item backend/.env.example backend/.env
```

Set `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and SMTP settings in `backend/.env`.

Generate long secrets with Node.js:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Use different values for the access and refresh secrets.

### 3. Configure the frontend

```powershell
Copy-Item frontend/.env.example frontend/.env
```

The default points to `http://localhost:5000/api/v1`.

### 4. Install dependencies

From the repository root:

```powershell
npm install
```

### 5. Create the schema and seed directory data

```powershell
npm run db:migrate
npm run db:seed
```

The seed adds example barbers/stylists and services so the directory is immediately populated. It also creates the `global_header`, `user_dropdown`, `user_profile_sidebar`, `admin_panel`, and `staff_panel` navigation menus.

Administrators can manage menu items, permission visibility, hierarchy (up to three levels), and sibling order at `/admin/menus`. The frontend fetches the nested menus from `GET /api/v1/menus/:key`; admin item-management endpoints are under `/api/v1/menus/admin`. Route guards and API authorization remain the security boundary—hiding a menu item does not grant or revoke access to its destination.

### 6. Start development

```powershell
npm start
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Email outbox worker: started alongside the app
- Health endpoint: `http://localhost:5000/api/v1/health`

`npm run dev:frontend` and `npm run dev:backend` start the individual workspaces. To run the outbox worker separately, use `npm run worker --workspace backend`.

Everything runs as normal Windows processes and uses your local PostgreSQL installation.

## Email verification

Registration creates a verification record only after the user has been written to PostgreSQL. The raw token is random, single-use, time-limited, and never stored directly; only its SHA-256 hash is stored.

The email contains a frontend URL such as:

```text
http://localhost:5173/verify-email?token=...
```

The frontend verification page sends the token to the API using `POST /auth/verify-email`. This avoids treating an email link `GET` request as the state-changing verification action.

For development, provide SMTP credentials in `.env`. When `SMTP_HOST` is omitted in development, Nodemailer creates a temporary test account and logs a preview URL instead of requiring a local mail server. Production should use a verified sending domain and a provider such as SendGrid, Mailgun, or Amazon SES over SMTP.

Appointment email messages are written to the database outbox with the related state change and delivered by the worker started by `npm start`. Failed deliveries are retried and logged.

## Authentication model

The browser never receives the JWT values through Redux or local storage. Both tokens are HTTP-only cookies:

- `fc_access`: short-lived access token, available to API requests
- `fc_refresh`: longer-lived refresh token, scoped to `/api/v1/auth`

Access tokens are stateless. Refresh-token rotation is stateful because the server stores a hash of every refresh-token `jti` in PostgreSQL. Reuse of an expired or revoked refresh token outside the configured grace window revokes the entire refresh-token family.

The API also uses:

- strict credentialed CORS
- `SameSite=Lax`
- `X-Requested-With: XMLHttpRequest` on every mutating request
- rate limiting on authentication endpoints
- Helmet security headers
- a 10 KB JSON body limit
- server-side Joi validation with unknown fields stripped
- redacted request logs

## API contract

Base path: `/api/v1`

### Auth

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an unverified customer |
| POST | `/auth/verify-email` | Public | Consume a verification token |
| POST | `/auth/resend-verification` | Public | Issue a replacement token |
| POST | `/auth/login` | Public | Set access and refresh cookies |
| POST | `/auth/staff/login` | Public | Sign in provider/admin accounts |
| POST | `/auth/forgot-password` | Public | Request a password reset |
| POST | `/auth/reset-password` | Public | Consume a password reset token |
| POST | `/auth/refresh` | Refresh cookie | Rotate the refresh token |
| POST | `/auth/logout` | Optional cookie | Revoke current refresh token and clear cookies |

### User

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/users/me` | Access cookie | Return current profile |
| PATCH | `/users/me` | Access cookie | Update name/phone |

### Booking and operations

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/availability` | Public | Calculate available slots for a provider, service, and date |
| GET/POST | `/appointments` | Access cookie | List appointments or create a booking |
| GET | `/appointments/:id` | Access cookie | Get an owned appointment |
| POST | `/appointments/:id/cancel` | Access cookie | Cancel an owned appointment |
| POST | `/appointments/:id/reschedule` | Access cookie | Reschedule an owned appointment within provider availability |
| GET | `/staff/me`, `/staff/roster` | Provider/admin | Get staff profile and daily appointments |
| GET/PUT/POST/DELETE | `/staff/schedule/*` | Provider/admin | Read or update working hours, breaks, and time off |
| GET | `/notifications` | Access cookie | List notifications |
| GET | `/admin/*` | Admin | Dashboard and basic user/service management |

### Directory

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/services` | Public | List active services |
| GET | `/providers` | Public | Paginated provider directory |
| GET | `/providers/:id` | Public | Provider detail and services |
| GET | `/health` | Public | API health check |

### Response shapes

Success:

```json
{
  "success": true,
  "data": {}
}
```

Paginated:

```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 12, "total": 40 }
}
```

Error:

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Invalid input",
  "errors": [
    { "field": "email", "message": "Must be a valid email" }
  ]
}
```

Unknown server failures return a generic message and are logged internally instead of exposing database or stack-trace details.

## Testing outline

### Backend unit tests

- bcrypt hashing and comparison
- SHA-256 helper
- JWT signing and verification with the expected algorithm
- expired and tampered JWT behavior
- error normalization
- Availability ranges, buffers, and occupied-slot exclusion
- Appointment ownership, rescheduling constraints, and role-protected routes

### Backend integration tests against a real local PostgreSQL database

- register → `201`
- duplicate email → `409 EMAIL_TAKEN`
- invalid input → `422 VALIDATION_ERROR`
- unverified login → `403 EMAIL_NOT_VERIFIED`
- valid/used/expired verification tokens
- resend invalidates the previous token
- login sets both cookies with `HttpOnly`, `SameSite=Lax`, correct paths, and `Secure` in production
- refresh rotates the current token
- refresh-token replay outside the grace period revokes the family
- logout revokes the current refresh token
- protected route without cookies → `401`
- mutating request without the CSRF header → `403`
- disallowed origin → blocked
- rate limiting → `429`
- generic `500` responses do not expose internals

### Frontend tests

- registration and login form validation
- server `errors[]` mapping into fields
- initial auth hydration does not flash a protected page to `/login`
- access-token expiration triggers exactly one refresh request for concurrent API failures
- failed refresh returns the user to the anonymous state
- verification page displays success, invalid-token, and expired-token states

## Next feature slices

1. Payments and configurable deposits/cancellation policies
2. Scheduled email/SMS reminders and cancellation waitlists
3. Stronger staff operations, then POS and inventory
4. Client style notes, verified reviews, and loyalty
5. Marketing automation and business analytics

For booking, do not copy GoldCinema's showtime model literally. FreshCuts needs a scheduling engine that calculates bookable windows from provider working hours, breaks, time off, service duration, and existing appointments.

## License

MIT
