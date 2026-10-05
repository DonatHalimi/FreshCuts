# FreshCuts

FreshCuts is a modern personal-care booking platform for barber shops and stylists. The first release is intentionally small: customer authentication, verified accounts, profiles, and a public directory of services and providers. Booking, availability, payments, notifications, and administration are planned next.

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
- Consistent validation and API error handling

### Deliberately deferred

- Appointment creation
- Dynamic availability
- Provider working hours and time off
- Appointment cancellation/rescheduling
- SMS notifications
- Payments/deposits
- Admin dashboard
- Reviews and loyalty
- Password reset
- Social authentication beyond the initial Google-ready architecture

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

The seed adds example barbers/stylists and services so the directory is immediately populated.

### 6. Start development

```powershell
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health endpoint: `http://localhost:5000/api/v1/health`

Everything runs as normal Windows processes and uses your local PostgreSQL installation.

## Email verification

Registration creates a verification record only after the user has been written to PostgreSQL. The raw token is random, single-use, time-limited, and never stored directly; only its SHA-256 hash is stored.

The email contains a frontend URL such as:

```text
http://localhost:5173/verify-email?token=...
```

The frontend verification page sends the token to the API using `POST /auth/verify-email`. This avoids treating an email link `GET` request as the state-changing verification action.

For development, provide SMTP credentials in `.env`. When `SMTP_HOST` is omitted in development, Nodemailer creates a temporary test account and logs a preview URL instead of requiring a local mail server. Production should use a verified sending domain and a provider such as SendGrid, Mailgun, or Amazon SES over SMTP.

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
| POST | `/auth/refresh` | Refresh cookie | Rotate the refresh token |
| POST | `/auth/logout` | Optional cookie | Revoke current refresh token and clear cookies |

### User

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/users/me` | Access cookie | Return current profile |
| PATCH | `/users/me` | Access cookie | Update name/phone |

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

## Build order for the next feature slices

1. Password reset
2. Link `Provider` to an optional `User` record for staff login
3. Provider working hours, breaks, and time off
4. Dynamic availability calculation
5. Appointment creation with transactional conflict protection
6. Appointment lifecycle and customer notifications
7. Admin dashboard
8. Payments/deposits
9. Reviews, loyalty, and analytics

For booking, do not copy GoldCinema's showtime model literally. FreshCuts needs a scheduling engine that calculates bookable windows from provider working hours, breaks, time off, service duration, and existing appointments.

## License

MIT
