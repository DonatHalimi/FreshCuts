<!-- # FreshCuts project archive manifest

The archive is intentionally native/local: PostgreSQL is expected to run as a normal host service and the application starts with npm scripts.

## Directory tree

```text
freshcuts/
├── .editorconfig
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── backend
│   ├── .env.example
│   ├── eslint.config.js
│   ├── package.json
│   ├── prettier.config.js
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── auth
│   │   │   ├── authenticate.js
│   │   │   ├── password.js
│   │   │   └── token.service.js
│   │   ├── config
│   │   │   ├── cookies.js
│   │   │   ├── cors.js
│   │   │   ├── env.js
│   │   │   └── logger.js
│   │   ├── controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── health.controller.js
│   │   │   ├── provider.controller.js
│   │   │   ├── service.controller.js
│   │   │   └── user.controller.js
│   │   ├── database
│   │   │   └── prisma.js
│   │   ├── middleware
│   │   │   ├── csrfGuard.js
│   │   │   ├── errorHandler.js
│   │   │   ├── notFound.js
│   │   │   ├── rateLimiters.js
│   │   │   └── validate.js
│   │   ├── routes
│   │   │   ├── auth.routes.js
│   │   │   ├── health.routes.js
│   │   │   ├── provider.routes.js
│   │   │   ├── service.routes.js
│   │   │   └── user.routes.js
│   │   ├── services
│   │   │   ├── auth.service.js
│   │   │   ├── emailVerification.service.js
│   │   │   ├── mail.service.js
│   │   │   ├── provider.service.js
│   │   │   ├── service.service.js
│   │   │   └── user.service.js
│   │   ├── templates
│   │   │   └── email
│   │   │       └── verifyEmail.js
│   │   ├── utils
│   │   │   ├── AppError.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── escapeHtml.js
│   │   │   ├── hash.js
│   │   │   └── response.js
│   │   └── validations
│   │       ├── auth.validation.js
│   │       ├── provider.validation.js
│   │       └── user.validation.js
│   └── tests
│       └── password.test.js
└── frontend
    ├── .env.example
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── prettier.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src
        ├── App.jsx
        ├── main.jsx
        ├── routes.jsx
        ├── assets
        │   └── logo.svg
        ├── components
        │   ├── layout
        │   │   ├── AppShell.jsx
        │   │   ├── Footer.jsx
        │   │   ├── Header.jsx
        │   │   └── ProtectedRoute.jsx
        │   ├── providers
        │   │   └── ProviderCard.jsx
        │   └── ui
        │       ├── Alert.jsx
        │       ├── Button.jsx
        │       ├── Card.jsx
        │       ├── Input.jsx
        │       └── Spinner.jsx
        ├── hooks
        │   └── useDocumentTitle.js
        ├── pages
        │   ├── HomePage.jsx
        │   ├── LoginPage.jsx
        │   ├── NotFoundPage.jsx
        │   ├── ProfilePage.jsx
        │   ├── ProviderDetailPage.jsx
        │   ├── ProvidersPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── ServicesPage.jsx
        │   └── VerifyEmailPage.jsx
        ├── services
        │   ├── apiClient.js
        │   ├── auth.api.js
        │   ├── providers.api.js
        │   └── services.api.js
        ├── store
        │   ├── authSlice.js
        │   └── store.js
        ├── styles
        │   └── index.css
        └── utils
            └── errors.js
```

## Complete file contents

### `.editorconfig`

```text
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

```

### `.gitignore`

```text
node_modules/
dist/
coverage/
*.log
.env
.env.*
!.env.example
.DS_Store
Thumbs.db
.vscode/
.idea/
*.local

```

### `LICENSE`

```text
MIT License

Copyright (c) 2026 FreshCuts

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

```

### `README.md`

```markdown
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

```

### `backend/.env.example`

```text
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
CLIENT_ORIGINS=http://localhost:5173
DATABASE_URL=postgresql://postgres:CHANGE_ME@localhost:5432/freshcuts
JWT_ACCESS_SECRET=CHANGE_ME_WITH_A_LONG_RANDOM_SECRET
JWT_REFRESH_SECRET=CHANGE_ME_WITH_A_DIFFERENT_LONG_RANDOM_SECRET
ACCESS_TTL_MS=900000
REFRESH_TTL_MS=604800000
REFRESH_REUSE_GRACE_MS=10000
BCRYPT_COST=12
EMAIL_VERIFY_TTL_HOURS=24
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=FreshCuts <no-reply@freshcuts.local>

```

### `backend/eslint.config.js`

```js
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,
  {
    ignores: ['node_modules/**', 'coverage/**'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
];

```

### `backend/package.json`

```json
{
  "name": "freshcuts-backend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "db:migrate": "prisma migrate dev --name init",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run"
  },
  "prisma": {
    "seed": "node prisma/seed.js"
  },
  "dependencies": {
    "@prisma/client": "^6.16.2",
    "bcrypt": "^6.0.0",
    "compression": "^1.8.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^17.2.2",
    "express": "^5.1.0",
    "express-rate-limit": "^8.1.0",
    "helmet": "^8.1.0",
    "joi": "^17.13.3",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^7.0.6",
    "pino": "^9.7.0",
    "pino-http": "^10.4.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.37.0",
    "eslint": "^9.37.0",
    "eslint-config-prettier": "^10.1.8",
    "nodemon": "^3.1.10",
    "pino-pretty": "^13.1.1",
    "prettier": "^3.6.2",
    "prisma": "^6.16.2",
    "supertest": "^7.1.4",
    "vitest": "^3.2.4"
  }
}

```

### `backend/prettier.config.js`

```js
export default {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
};

```

### `backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CLIENT
  PROVIDER
  ADMIN
}

model User {
  id              String                  @id @default(uuid()) @db.Uuid
  email           String                  @unique @db.VarChar(254)
  passwordHash    String
  firstName       String                  @db.VarChar(60)
  lastName        String                  @db.VarChar(60)
  phone           String?                 @db.VarChar(30)
  role            Role                    @default(CLIENT)
  emailVerifiedAt DateTime?
  createdAt       DateTime                @default(now())
  updatedAt       DateTime                @updatedAt
  refreshTokens   RefreshToken[]
  verifyTokens    EmailVerificationToken[]

  @@index([createdAt])
}

model RefreshToken {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @db.Uuid
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash  String   @unique
  familyId   String   @db.Uuid
  expiresAt  DateTime
  revokedAt  DateTime?
  userAgent  String?  @db.VarChar(500)
  ip         String?  @db.VarChar(64)
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([familyId])
  @@index([expiresAt])
}

model EmailVerificationToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
}

model Provider {
  id        String             @id @default(uuid()) @db.Uuid
  name      String             @db.VarChar(100)
  title     String?            @db.VarChar(100)
  bio       String?            @db.Text
  imageUrl  String?
  isActive  Boolean            @default(true)
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt
  services  ProviderService[]

  @@index([isActive])
  @@index([name])
}

model Service {
  id          String             @id @default(uuid()) @db.Uuid
  name        String             @unique @db.VarChar(100)
  description String?            @db.Text
  durationMin Int
  priceCents  Int
  isActive    Boolean            @default(true)
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  providers   ProviderService[]

  @@index([isActive])
  @@index([name])
}

model ProviderService {
  providerId String   @db.Uuid
  serviceId  String   @db.Uuid
  priceCents Int?
  provider   Provider @relation(fields: [providerId], references: [id], onDelete: Cascade)
  service    Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@id([providerId, serviceId])
  @@index([serviceId])
}

```

### `backend/prisma/seed.js`

```js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const providers = [
  {
    name: 'Ardit Krasniqi',
    title: 'Master Barber',
    bio: 'Specializes in fades, clean classic cuts, and modern styling.',
    imageUrl: null,
  },
  {
    name: 'Luan Berisha',
    title: 'Senior Barber',
    bio: 'Focused on precision fades, beard shaping, and low-maintenance styles.',
    imageUrl: null,
  },
  {
    name: 'Elira Hoxha',
    title: 'Stylist',
    bio: 'Known for textured cuts, styling, and polished everyday looks.',
    imageUrl: null,
  },
];

const services = [
  {
    name: 'Classic Haircut',
    description: 'A clean, tailored cut finished with styling.',
    durationMin: 30,
    priceCents: 1500,
  },
  {
    name: 'Skin Fade',
    description: 'Detailed fade with a precise neckline and finish.',
    durationMin: 40,
    priceCents: 1800,
  },
  {
    name: 'Haircut + Beard',
    description: 'Full haircut with beard trim and shape-up.',
    durationMin: 50,
    priceCents: 2200,
  },
  {
    name: 'Beard Trim',
    description: 'Shape, trim, neckline, and finishing product.',
    durationMin: 20,
    priceCents: 900,
  },
  {
    name: 'Kids Haircut',
    description: 'A simple, comfortable haircut for younger clients.',
    durationMin: 25,
    priceCents: 1200,
  },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: service,
      create: service,
    });
  }

  for (const provider of providers) {
    await prisma.provider.upsert({
      where: { name: provider.name },
      update: provider,
      create: provider,
    });
  }

  const providerRows = await prisma.provider.findMany({ select: { id: true } });
  const serviceRows = await prisma.service.findMany({ select: { id: true } });

  for (const provider of providerRows) {
    for (const service of serviceRows) {
      await prisma.providerService.upsert({
        where: {
          providerId_serviceId: {
            providerId: provider.id,
            serviceId: service.id,
          },
        },
        update: {},
        create: {
          providerId: provider.id,
          serviceId: service.id,
        },
      });
    }
  }

  console.log('FreshCuts seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

```

### `backend/src/app.js`

```js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import logger from './config/logger.js';
import { corsOptions } from './config/cors.js';
import { csrfGuard } from './middleware/csrfGuard.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import providerRoutes from './routes/provider.routes.js';
import serviceRoutes from './routes/service.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

app.use('/api/v1', csrfGuard);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/providers', providerRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/health', healthRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

```

### `backend/src/auth/authenticate.js`

```js
import { verifyAccess } from './token.service.js';
import { AppError } from '../utils/AppError.js';

export function authenticate(req, _res, next) {
  const token = req.cookies?.fc_access;
  if (!token) return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication required'));

  try {
    const payload = verifyAccess(token);
    if (!payload?.sub) {
      return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication required'));
    }
    req.auth = { userId: payload.sub, role: payload.role };
    return next();
  } catch (error) {
    return next(error);
  }
}

```

### `backend/src/auth/password.js`

```js
import bcrypt from 'bcrypt';
import env from '../config/env.js';

export function hashPassword(password) {
  return bcrypt.hash(password, env.bcryptCost);
}

export function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

```

### `backend/src/auth/token.service.js`

```js
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import prisma from '../database/prisma.js';
import env from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { sha256 } from '../utils/hash.js';

function seconds(ms) {
  return Math.floor(ms / 1000);
}

export function signAccess(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    env.jwtAccessSecret,
    { algorithm: 'HS256', expiresIn: seconds(env.accessTtlMs) },
  );
}

export function buildRefresh(userId, familyId = crypto.randomUUID()) {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    { sub: userId, fam: familyId, jti },
    env.jwtRefreshSecret,
    { algorithm: 'HS256', expiresIn: seconds(env.refreshTtlMs) },
  );

  return {
    jwt: token,
    record: {
      userId,
      familyId,
      tokenHash: sha256(jti),
      expiresAt: new Date(Date.now() + env.refreshTtlMs),
      createdAt: new Date(),
    },
  };
}

export function verifyAccess(token) {
  return jwt.verify(token, env.jwtAccessSecret, { algorithms: ['HS256'] });
}

export function verifyRefresh(token) {
  return jwt.verify(token, env.jwtRefreshSecret, { algorithms: ['HS256'] });
}

async function revokeFamily(familyId) {
  await prisma.refreshToken.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function createRefreshSession(userId, meta = {}) {
  const next = buildRefresh(userId);
  await prisma.refreshToken.create({ data: { ...next.record, ...meta } });
  return next.jwt;
}

export async function rotateRefreshToken(rawToken, meta = {}) {
  if (!rawToken) throw new AppError(401, 'REFRESH_INVALID', 'Refresh token missing');

  let payload;
  try {
    payload = verifyRefresh(rawToken);
  } catch (error) {
    if (error?.name === 'TokenExpiredError') {
      throw new AppError(401, 'REFRESH_INVALID', 'Refresh token expired');
    }
    throw new AppError(401, 'REFRESH_INVALID', 'Refresh token invalid');
  }

  if (!payload?.jti || !payload?.sub || !payload?.fam) {
    throw new AppError(401, 'REFRESH_INVALID', 'Refresh token invalid');
  }

  const row = await prisma.refreshToken.findUnique({
    where: { tokenHash: sha256(payload.jti) },
  });

  if (!row || row.expiresAt < new Date()) {
    throw new AppError(401, 'REFRESH_INVALID', 'Session expired');
  }

  if (row.revokedAt) {
    const graceAge = Date.now() - row.revokedAt.getTime();
    if (graceAge > env.refreshReuseGraceMs) {
      await revokeFamily(row.familyId);
      throw new AppError(401, 'REFRESH_INVALID', 'Session expired');
    }

    // A very recent replay is treated as a possible legitimate multi-tab race.
    // A fresh token is issued in the same family without trusting the old row again.
    const user = await prisma.user.findUnique({
      where: { id: row.userId },
      select: { id: true, role: true },
    });
    if (!user) throw new AppError(401, 'REFRESH_INVALID', 'Session expired');

    const next = buildRefresh(user.id, row.familyId);
    await prisma.refreshToken.create({ data: { ...next.record, ...meta } });
    return { accessToken: signAccess(user), refreshToken: next.jwt };
  }

  const user = await prisma.user.findUnique({
    where: { id: row.userId },
    select: { id: true, role: true },
  });
  if (!user) throw new AppError(401, 'REFRESH_INVALID', 'Session expired');

  const next = buildRefresh(user.id, row.familyId);
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({ data: { ...next.record, ...meta } }),
  ]);

  return {
    accessToken: signAccess(user),
    refreshToken: next.jwt,
  };
}

export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;

  try {
    const payload = verifyRefresh(rawToken);
    if (!payload?.jti) return;
    await prisma.refreshToken.updateMany({
      where: { tokenHash: sha256(payload.jti), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Logout is deliberately idempotent.
  }
}

```

### `backend/src/config/cookies.js`

```js
import env from './env.js';

const base = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax',
};

export const ACCESS_COOKIE = {
  ...base,
  path: '/',
};

export const REFRESH_COOKIE = {
  ...base,
  path: '/api/v1/auth',
};

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie('fc_access', accessToken, {
    ...ACCESS_COOKIE,
    maxAge: env.accessTtlMs,
  });
  res.cookie('fc_refresh', refreshToken, {
    ...REFRESH_COOKIE,
    maxAge: env.refreshTtlMs,
  });
}

export function clearAuthCookies(res) {
  res.clearCookie('fc_access', ACCESS_COOKIE);
  res.clearCookie('fc_refresh', REFRESH_COOKIE);
}

```

### `backend/src/config/cors.js`

```js
import { AppError } from '../utils/AppError.js';
import env from './env.js';

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.clientOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new AppError(403, 'CORS_BLOCKED', 'Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Requested-With'],
  maxAge: 600,
};

```

### `backend/src/config/env.js`

```js
import 'dotenv/config';
import Joi from 'joi';

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(5000),
  CLIENT_URL: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
  CLIENT_ORIGINS: Joi.string().required(),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  ACCESS_TTL_MS: Joi.number().integer().min(60000).default(900000),
  REFRESH_TTL_MS: Joi.number().integer().min(3600000).default(604800000),
  REFRESH_REUSE_GRACE_MS: Joi.number().integer().min(0).max(60000).default(10000),
  BCRYPT_COST: Joi.number().integer().min(10).max(14).default(12),
  EMAIL_VERIFY_TTL_HOURS: Joi.number().integer().min(1).max(168).default(24),
  SMTP_HOST: Joi.string().allow('').default(''),
  SMTP_PORT: Joi.number().integer().min(1).max(65535).default(587),
  SMTP_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  SMTP_USER: Joi.string().allow('').default(''),
  SMTP_PASS: Joi.string().allow('').default(''),
  SMTP_FROM: Joi.string().required(),
}).when(Joi.object({ NODE_ENV: Joi.valid('production') }).unknown(), {
  then: Joi.object({
    SMTP_HOST: Joi.string().min(1).required(),
    SMTP_USER: Joi.string().min(1).required(),
    SMTP_PASS: Joi.string().min(1).required(),
  }),
});

const { value, error } = schema.validate(process.env, {
  abortEarly: false,
  convert: true,
  allowUnknown: true,
});

if (error) {
  console.error('Invalid environment configuration:');
  for (const detail of error.details) console.error(`- ${detail.message}`);
  process.exit(1);
}

const env = {
  nodeEnv: value.NODE_ENV,
  isProd: value.NODE_ENV === 'production',
  port: value.PORT,
  clientUrl: value.CLIENT_URL,
  clientOrigins: value.CLIENT_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  databaseUrl: value.DATABASE_URL,
  jwtAccessSecret: value.JWT_ACCESS_SECRET,
  jwtRefreshSecret: value.JWT_REFRESH_SECRET,
  accessTtlMs: value.ACCESS_TTL_MS,
  refreshTtlMs: value.REFRESH_TTL_MS,
  refreshReuseGraceMs: value.REFRESH_REUSE_GRACE_MS,
  bcryptCost: value.BCRYPT_COST,
  emailVerifyTtlHours: value.EMAIL_VERIFY_TTL_HOURS,
  emailVerifyTtlMs: value.EMAIL_VERIFY_TTL_HOURS * 60 * 60 * 1000,
  smtpHost: value.SMTP_HOST,
  smtpPort: value.SMTP_PORT,
  smtpSecure: value.SMTP_SECURE,
  smtpUser: value.SMTP_USER,
  smtpPass: value.SMTP_PASS,
  smtpFrom: value.SMTP_FROM,
};

export default env;

```

### `backend/src/config/logger.js`

```js
import pino from 'pino';
import env from './env.js';

const logger = pino({
  level: env.isProd ? 'info' : 'debug',
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'res.headers[set-cookie]',
    ],
    censor: '[REDACTED]',
  },
  transport: env.isProd
    ? undefined
    : {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      },
});

export default logger;

```

### `backend/src/controllers/auth.controller.js`

```js
import env from '../config/env.js';
import { setAuthCookies, clearAuthCookies } from '../config/cookies.js';
import * as authService from '../services/auth.service.js';
import * as emailVerificationService from '../services/emailVerification.service.js';
import { sendSuccess } from '../utils/response.js';

function requestMeta(req) {
  return {
    userAgent: req.get('user-agent')?.slice(0, 500),
    ip: req.ip,
  };
}

export async function register(req, res) {
  const user = await authService.register(req.body);
  return sendSuccess(res, 201, user);
}

export async function verifyEmail(req, res) {
  await emailVerificationService.verify(req.body.token);
  return sendSuccess(res, 200, { verified: true });
}

export async function resendVerification(req, res) {
  await authService.resendVerification(req.body.email);
  return res.status(202).json({
    success: true,
    data: { message: 'If the account exists and needs verification, a new email has been sent.' },
  });
}

export async function login(req, res) {
  const result = await authService.login(req.body, requestMeta(req));
  setAuthCookies(res, result);

  return sendSuccess(res, 200, {
    user: result.user,
  });
}

export async function refresh(req, res) {
  const result = await authService.refresh(req.cookies?.fc_refresh, requestMeta(req));
  setAuthCookies(res, result);
  return sendSuccess(res, 200, { refreshed: true });
}

export async function logout(req, res) {
  await authService.logout(req.cookies?.fc_refresh);
  clearAuthCookies(res);
  return res.status(204).send();
}

```

### `backend/src/controllers/health.controller.js`

```js
import { sendSuccess } from '../utils/response.js';

export function health(_req, res) {
  return sendSuccess(res, 200, { status: 'ok', service: 'freshcuts-api' });
}

```

### `backend/src/controllers/provider.controller.js`

```js
import * as providerService from '../services/provider.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listProviders(req, res) {
  const { page, limit, serviceId, q } = req.query;
  const result = await providerService.listProviders({ page, limit, serviceId, q });
  return sendSuccess(res, 200, result.rows, { page, limit, total: result.total });
}

export async function getProvider(req, res) {
  return sendSuccess(res, 200, await providerService.getProviderById(req.params.id));
}

```

### `backend/src/controllers/service.controller.js`

```js
import * as serviceService from '../services/service.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listServices(_req, res) {
  return sendSuccess(res, 200, await serviceService.listServices());
}

```

### `backend/src/controllers/user.controller.js`

```js
import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getMe(req, res) {
  return sendSuccess(res, 200, await userService.getCurrentUser(req.auth.userId));
}

export async function updateMe(req, res) {
  return sendSuccess(res, 200, await userService.updateCurrentUser(req.auth.userId, req.body));
}

```

### `backend/src/database/prisma.js`

```js
import { PrismaClient } from '@prisma/client';
import env from '../config/env.js';

const prisma = new PrismaClient({
  log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;

```

### `backend/src/middleware/csrfGuard.js`

```js
import { AppError } from '../utils/AppError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function csrfGuard(req, _res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.get('X-Requested-With') === 'XMLHttpRequest') return next();
  return next(new AppError(403, 'CSRF_BLOCKED', 'Missing required request header'));
}

```

### `backend/src/middleware/errorHandler.js`

```js
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

function normalizeError(error) {
  if (error instanceof AppError) return error;

  if (error instanceof TokenExpiredError) {
    return new AppError(401, 'TOKEN_EXPIRED', 'Access token expired');
  }

  if (error instanceof JsonWebTokenError) {
    return new AppError(401, 'UNAUTHENTICATED', 'Authentication required');
  }

  if (error?.status && error?.code) {
    return new AppError(error.status, error.code, error.message, error.errors);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new AppError(409, 'CONFLICT', 'A record with that value already exists');
    }
    if (error.code === 'P2025') {
      return new AppError(404, 'NOT_FOUND', 'The requested record was not found');
    }
  }

  return new AppError(500, 'INTERNAL_ERROR', 'Something went wrong');
}

export function errorHandler(error, req, res, _next) {
  const normalized = normalizeError(error);

  if (normalized.status >= 500) {
    req.log.error({ err: error }, 'Unhandled request error');
  }

  return res.status(normalized.status).json({
    success: false,
    code: normalized.code,
    message: normalized.status >= 500 ? 'Something went wrong' : normalized.message,
    ...(normalized.errors?.length ? { errors: normalized.errors } : {}),
  });
}

```

### `backend/src/middleware/notFound.js`

```js
import { AppError } from '../utils/AppError.js';

export function notFound(req, _res, next) {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`));
}

```

### `backend/src/middleware/rateLimiters.js`

```js
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'Too many authentication requests. Please try again later.',
  },
});

export const resendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    code: 'RATE_LIMITED',
    message: 'Too many verification email requests. Please try again later.',
  },
});

```

### `backend/src/middleware/validate.js`

```js
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.') || source,
        message: detail.message,
      }));
      req.validation = { value, errors };
      return next({
        status: 422,
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        errors,
      });
    }

    req[source] = value;
    return next();
  };
}

```

### `backend/src/routes/auth.routes.js`

```js
import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { authLimiter, resendVerificationLimiter } from '../middleware/rateLimiters.js';
import * as controller from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from '../validations/auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(controller.register));
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), asyncHandler(controller.verifyEmail));
router.post('/resend-verification', resendVerificationLimiter, validate(resendVerificationSchema), asyncHandler(controller.resendVerification));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(controller.login));
router.post('/refresh', asyncHandler(controller.refresh));
router.post('/logout', asyncHandler(controller.logout));

export default router;

```

### `backend/src/routes/health.routes.js`

```js
import { Router } from 'express';
import * as controller from '../controllers/health.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(controller.health));

export default router;

```

### `backend/src/routes/provider.routes.js`

```js
import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { providerIdSchema, providerQuerySchema } from '../validations/provider.validation.js';
import * as controller from '../controllers/provider.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', validate(providerQuerySchema, 'query'), asyncHandler(controller.listProviders));
router.get('/:id', validate(providerIdSchema, 'params'), asyncHandler(controller.getProvider));

export default router;

```

### `backend/src/routes/service.routes.js`

```js
import { Router } from 'express';
import * as controller from '../controllers/service.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(controller.listServices));

export default router;

```

### `backend/src/routes/user.routes.js`

```js
import { Router } from 'express';
import { authenticate } from '../auth/authenticate.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validations/user.validation.js';
import * as controller from '../controllers/user.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);
router.get('/me', asyncHandler(controller.getMe));
router.patch('/me', validate(updateProfileSchema), asyncHandler(controller.updateMe));

export default router;

```

### `backend/src/server.js`

```js
import http from 'node:http';
import app from './app.js';
import env from './config/env.js';
import logger from './config/logger.js';
import prisma from './database/prisma.js';

const server = http.createServer(app);

server.listen(env.port, () => {
  logger.info(`FreshCuts API listening on http://localhost:${env.port}`);
});

async function shutdown(signal) {
  logger.info({ signal }, 'Shutting down');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

```

### `backend/src/services/auth.service.js`

```js
import prisma from '../database/prisma.js';
import { hashPassword, comparePassword } from '../auth/password.js';
import { buildRefresh, signAccess, rotateRefreshToken, revokeRefreshToken } from '../auth/token.service.js';
import { issue as issueVerificationToken } from './emailVerification.service.js';
import { sendVerificationEmail } from './mail.service.js';
import env from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const SAFE_USER = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

const DUMMY_PASSWORD_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.PHf4wJ6Vn3f4F4k7fH7pI9Y8YQf0n5C';

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function toUser(user) {
  return {
    ...user,
    emailVerified: Boolean(user.emailVerifiedAt),
  };
}

async function sendVerification(user) {
  const raw = await issueVerificationToken(user.id);
  const url = `${env.clientUrl}/verify-email?token=${encodeURIComponent(raw)}`;

  try {
    await sendVerificationEmail({
      firstName: user.firstName,
      email: user.email,
      url,
    });
  } catch (error) {
    console.error('Verification email could not be sent:', error.message);
  }
}

export async function register(input) {
  const email = normalizeEmail(input.email);
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (existing) {
    throw new AppError(409, 'EMAIL_TAKEN', 'An account with that email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone?.trim() || null,
    },
    select: SAFE_USER,
  });

  await sendVerification(user);
  return toUser(user);
}

export async function login(input, meta = {}) {
  const email = normalizeEmail(input.email);
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordHash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordMatches = await comparePassword(input.password, passwordHash);

  if (!user || !passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  if (!user.emailVerifiedAt) {
    throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email before signing in');
  }

  const accessToken = signAccess(user);
  const refresh = buildRefresh(user.id);

  await prisma.refreshToken.create({
    data: {
      ...refresh.record,
      ...meta,
    },
  });

  return {
    user: toUser({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }),
    accessToken,
    refreshToken: refresh.jwt,
  };
}

export async function refresh(rawToken, meta = {}) {
  return rotateRefreshToken(rawToken, meta);
}

export async function logout(rawToken) {
  await revokeRefreshToken(rawToken);
}

export async function resendVerification(email) {
  const normalized = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalized } });

  if (user && !user.emailVerifiedAt) {
    await sendVerification(user);
  }
}

```

### `backend/src/services/emailVerification.service.js`

```js
import { randomToken, sha256 } from '../utils/hash.js';
import { AppError } from '../utils/AppError.js';
import prisma from '../database/prisma.js';
import env from '../config/env.js';

export async function issue(userId) {
  await prisma.emailVerificationToken.deleteMany({
    where: { userId, usedAt: null },
  });

  const raw = randomToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: sha256(raw),
      expiresAt: new Date(Date.now() + env.emailVerifyTtlMs),
    },
  });

  return raw;
}

export async function verify(rawToken) {
  if (!rawToken) throw new AppError(400, 'TOKEN_INVALID', 'Verification token is invalid');

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: sha256(rawToken) },
  });

  if (!record || record.usedAt) {
    throw new AppError(400, 'TOKEN_INVALID', 'This verification link is invalid or already used');
  }

  if (record.expiresAt < new Date()) {
    throw new AppError(410, 'TOKEN_EXPIRED', 'This verification link has expired');
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
  ]);
}

```

### `backend/src/services/mail.service.js`

```js
import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../config/logger.js';
import { verifyEmail } from '../templates/email/verifyEmail.js';

let transporterPromise;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (env.smtpHost) {
      return nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpSecure,
        auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
      });
    }

    if (env.nodeEnv === 'development') {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    throw new Error('SMTP configuration is required outside development.');
  })();

  return transporterPromise;
}

export async function sendVerificationEmail({ firstName, email, url }) {
  const transporter = await getTransporter();
  const content = verifyEmail({
    firstName,
    url,
    ttlHours: env.emailVerifyTtlHours,
  });

  const info = await transporter.sendMail({
    from: env.mailFrom,
    to: email,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) logger.info({ previewUrl }, 'Development email preview');
}

```

### `backend/src/services/provider.service.js`

```js
import prisma from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';

const providerSelect = {
  id: true,
  name: true,
  title: true,
  bio: true,
  imageUrl: true,
};

export async function listProviders({ page, limit, serviceId, q }) {
  const skip = (page - 1) * limit;
  const where = {
    isActive: true,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { title: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(serviceId
      ? {
          services: {
            some: { serviceId },
          },
        }
      : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.provider.findMany({
      where,
      select: {
        ...providerSelect,
        services: {
          select: {
            service: {
              select: { id: true, name: true, durationMin: true, priceCents: true },
            },
            priceCents: true,
          },
          orderBy: { service: { name: 'asc' } },
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    prisma.provider.count({ where }),
  ]);

  return {
    rows: rows.map((provider) => ({
      ...provider,
      services: provider.services.map((entry) => ({
        ...entry.service,
        priceCents: entry.priceCents ?? entry.service.priceCents,
      })),
    })),
    total,
  };
}

export async function getProviderById(id) {
  const provider = await prisma.provider.findFirst({
    where: { id, isActive: true },
    select: {
      ...providerSelect,
      services: {
        select: {
          service: {
            select: { id: true, name: true, description: true, durationMin: true, priceCents: true },
          },
          priceCents: true,
        },
        orderBy: { service: { name: 'asc' } },
      },
    },
  });

  if (!provider) throw new AppError(404, 'PROVIDER_NOT_FOUND', 'Provider not found');

  return {
    ...provider,
    services: provider.services.map((entry) => ({
      ...entry.service,
      priceCents: entry.priceCents ?? entry.service.priceCents,
    })),
  };
}

```

### `backend/src/services/service.service.js`

```js
import prisma from '../database/prisma.js';

export async function listServices() {
  return prisma.service.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      durationMin: true,
      priceCents: true,
    },
    orderBy: { name: 'asc' },
  });
}

```

### `backend/src/services/user.service.js`

```js
import prisma from '../database/prisma.js';
import { AppError } from '../utils/AppError.js';

const SAFE_USER = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: SAFE_USER });
  if (!user) throw new AppError(401, 'UNAUTHENTICATED', 'Authentication required');
  return { ...user, emailVerified: Boolean(user.emailVerifiedAt) };
}

export async function updateCurrentUser(userId, input) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.firstName !== undefined ? { firstName: input.firstName.trim() } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName.trim() } : {}),
      ...(input.phone !== undefined ? { phone: input.phone?.trim() || null } : {}),
    },
    select: SAFE_USER,
  });

  return { ...user, emailVerified: Boolean(user.emailVerifiedAt) };
}

```

### `backend/src/templates/email/verifyEmail.js`

```js
import { escapeHtml } from '../../utils/escapeHtml.js';

export function verifyEmail({ firstName, url, ttlHours }) {
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(url);

  return {
    subject: 'Verify your FreshCuts account',
    text: `Hi ${firstName}, confirm your FreshCuts account: ${url}\nThis link expires in ${ttlHours} hours.`,
    html: `
<!doctype html>
<html lang="en">
  <body style="margin:0;background:#111211;padding:32px 0;font-family:Arial,sans-serif;color:#F2F1EC">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" role="presentation" style="background:#191B19;border:1px solid #303530;border-radius:14px">
            <tr>
              <td style="padding:32px">
                <div style="font-size:24px;font-weight:700;color:#C1D0A5">FreshCuts</div>
                <h1 style="margin:18px 0 12px;font-size:24px">Verify your email</h1>
                <p style="margin:0 0 24px;color:#A7AAA2;line-height:1.6">Hi ${safeName}, confirm your email address to activate your FreshCuts account.</p>
                <a href="${safeUrl}" style="display:inline-block;background:#A3B18A;color:#111211;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Verify email</a>
                <p style="margin:24px 0 0;font-size:12px;color:#A7AAA2;line-height:1.6">This link expires in ${ttlHours} hours. If you did not create this account, you can safely ignore this email.</p>
                <p style="margin:12px 0 0;font-size:12px;color:#A7AAA2;word-break:break-all">${safeUrl}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}

```

### `backend/src/utils/AppError.js`

```js
export class AppError extends Error {
  constructor(status = 500, code = 'INTERNAL_ERROR', message = 'Something went wrong', errors = undefined) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

```

### `backend/src/utils/asyncHandler.js`

```js
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

```

### `backend/src/utils/escapeHtml.js`

```js
export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

```

### `backend/src/utils/hash.js`

```js
import crypto from 'node:crypto';

export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function randomToken() {
  return crypto.randomBytes(32).toString('base64url');
}

```

### `backend/src/utils/response.js`

```js
export function sendSuccess(res, status, data, meta) {
  return res.status(status).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

```

### `backend/src/validations/auth.validation.js`

```js
import Joi from 'joi';

export const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(60).required(),
  lastName: Joi.string().trim().min(1).max(60).required(),
  email: Joi.string().trim().lowercase().email().max(254).required(),
  password: Joi.string().min(8).max(72).required(),
  phone: Joi.string().trim().max(30).allow('', null).optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),
  password: Joi.string().min(1).max(72).required(),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().trim().min(20).max(200).required(),
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(254).required(),
});

```

### `backend/src/validations/provider.validation.js`

```js
import Joi from 'joi';

export const providerQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(24).default(12),
  serviceId: Joi.string().guid({ version: 'uuidv4' }).optional(),
  q: Joi.string().trim().max(80).allow('').default(''),
});

export const providerIdSchema = Joi.object({
  id: Joi.string().guid({ version: 'uuidv4' }).required(),
});

```

### `backend/src/validations/user.validation.js`

```js
import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(60).optional(),
  lastName: Joi.string().trim().min(1).max(60).optional(),
  phone: Joi.string().trim().max(30).allow('', null).optional(),
}).min(1);

```

### `backend/tests/password.test.js`

```js
import { describe, expect, it } from 'vitest';
import { hashPassword, comparePassword } from '../src/auth/password.js';

describe('password hashing', () => {
  it('hashes and verifies the original password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    expect(hash).not.toBe('correct-horse-battery-staple');
    await expect(comparePassword('correct-horse-battery-staple', hash)).resolves.toBe(true);
    await expect(comparePassword('wrong-password', hash)).resolves.toBe(false);
  });
});

```

### `frontend/.env.example`

```text
VITE_API_URL=http://localhost:5000/api/v1

```

### `frontend/eslint.config.js`

```js
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
];

```

### `frontend/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#111211" />
    <meta name="description" content="FreshCuts — modern barber and personal-care booking." />
    <title>FreshCuts</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

### `frontend/package.json`

```json
{
  "name": "freshcuts-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host localhost --port 5173",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest run"
  },
  "dependencies": {
    "@reduxjs/toolkit": "^2.9.0",
    "axios": "^1.12.2",
    "framer-motion": "^12.23.24",
    "lucide-react": "^0.546.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-hook-form": "^7.63.0",
    "react-redux": "^9.2.0",
    "react-router-dom": "^6.30.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.37.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@vitejs/plugin-react": "^5.0.4",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.37.0",
    "eslint-config-prettier": "^10.1.8",
    "jsdom": "^27.0.0",
    "msw": "^2.11.4",
    "postcss": "^8.5.6",
    "prettier": "^3.6.2",
    "prettier-plugin-tailwindcss": "^0.6.14",
    "tailwindcss": "^3.4.17",
    "vite": "^7.1.7",
    "vitest": "^3.2.4"
  }
}

```

### `frontend/postcss.config.js`

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

```

### `frontend/prettier.config.js`

```js
export default {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  plugins: ['prettier-plugin-tailwindcss'],
};

```

### `frontend/src/App.jsx`

```jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { fetchMe } from './store/authSlice.js';
import AppShell from './components/layout/AppShell.jsx';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

```

### `frontend/src/assets/logo.svg`

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 36" role="img" aria-labelledby="title desc">
  <title id="title">FreshCuts</title>
  <desc id="desc">FreshCuts wordmark</desc>
  <rect width="120" height="36" rx="9" fill="#191B19"/>
  <path d="M26 10l-7 7 7 9 3-3-4-6 4-4-3-3Zm8 0l-3 3 4 4-4 6 3 3 7-9-7-7Z" fill="#A3B18A"/>
  <text x="49" y="24" fill="#F2F1EC" font-family="Arial, sans-serif" font-size="13" font-weight="700">FreshCuts</text>
</svg>

```

### `frontend/src/components/layout/AppShell.jsx`

```jsx
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

```

### `frontend/src/components/layout/Footer.jsx`

```jsx
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 FreshCuts</span>
        <span>Modern appointments for modern personal care.</span>
      </div>
    </footer>
  );
}

```

### `frontend/src/components/layout/Header.jsx`

```jsx
import { Menu, Scissors, UserRound, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { logout } from '../../store/authSlice.js';

const linkClass = ({ isActive }) =>
  `transition ${isActive ? 'text-sage-bright' : 'text-muted hover:text-text'}`;

export default function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-text">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-sage text-background">
            <Scissors className="h-4 w-4" />
          </span>
          <span className="text-lg">FreshCuts</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/providers" className={linkClass}>Providers</NavLink>
          <NavLink to="/services" className={linkClass}>Services</NavLink>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <NavLink to="/profile" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-text hover:bg-surface-2">
                <UserRound className="h-4 w-4" /> Profile
              </NavLink>
              <button onClick={() => dispatch(logout())} className="text-sm text-muted hover:text-text">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted hover:text-text">Log in</Link>
              <Link to="/register" className="rounded-lg bg-sage px-4 py-2.5 text-sm font-semibold text-background hover:bg-sage-bright">Create account</Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface px-5 py-5 md:hidden">
          <nav className="grid gap-4 text-sm">
            <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/providers" className={linkClass} onClick={() => setOpen(false)}>Providers</NavLink>
            <NavLink to="/services" className={linkClass} onClick={() => setOpen(false)}>Services</NavLink>
            {user ? (
              <>
                <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>Profile</NavLink>
                <button className="text-left text-muted" onClick={() => { dispatch(logout()); setOpen(false); }}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-muted" onClick={() => setOpen(false)}>Log in</Link>
                <Link to="/register" className="text-sage-bright" onClick={() => setOpen(false)}>Create account</Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

```

### `frontend/src/components/layout/ProtectedRoute.jsx`

```jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../ui/Spinner.jsx';

export default function ProtectedRoute() {
  const location = useLocation();
  const { status } = useSelector((state) => state.auth);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="mx-auto grid min-h-[60vh] place-items-center">
        <Spinner />
      </div>
    );
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

```

### `frontend/src/components/providers/ProviderCard.jsx`

```jsx
import { ArrowUpRight, Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card.jsx';

function initials(name) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('');
}

export default function ProviderCard({ provider }) {
  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:border-sage/40">
      <div className="grid aspect-[5/3] place-items-center bg-surface-2">
        {provider.imageUrl ? (
          <img src={provider.imageUrl} alt={provider.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full border border-border bg-background text-lg font-semibold text-sage-bright">
            {initials(provider.name)}
          </div>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="text-lg font-semibold">{provider.name}</div>
          <div className="mt-1 text-sm text-sage">{provider.title}</div>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-muted">{provider.bio}</p>
        <div className="flex flex-wrap gap-2">
          {provider.services.slice(0, 3).map((service) => (
            <span key={service.id} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
              {service.name}
            </span>
          ))}
        </div>
        <Link to={`/providers/${provider.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-sage-bright hover:text-text">
          View provider <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}

```

### `frontend/src/components/ui/Alert.jsx`

```jsx
export default function Alert({ children, tone = 'error' }) {
  const classes = {
    error: 'border-red-400/30 bg-red-400/10 text-red-100',
    success: 'border-sage/30 bg-sage/10 text-sage-bright',
    info: 'border-border bg-surface-2 text-muted',
  };

  return <div className={`rounded-lg border px-4 py-3 text-sm ${classes[tone]}`}>{children}</div>;
}

```

### `frontend/src/components/ui/Button.jsx`

```jsx
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...props
}) {
  const styles = {
    primary: 'bg-sage text-background hover:bg-sage-bright',
    secondary: 'bg-surface-2 text-text hover:bg-border',
    ghost: 'border border-border text-text hover:bg-surface-2',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {loading ? 'Please wait…' : children}
    </button>
  );
}

```

### `frontend/src/components/ui/Card.jsx`

```jsx
export default function Card({ children, className = '' }) {
  return <div className={`rounded-2xl border border-border bg-surface shadow-panel ${className}`}>{children}</div>;
}

```

### `frontend/src/components/ui/Input.jsx`

```jsx
export default function Input({ label, error, id, ...props }) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        id={id}
        className={`w-full rounded-lg border bg-background px-3.5 py-3 text-sm text-text outline-none transition placeholder:text-muted/70 focus:border-sage focus:ring-2 focus:ring-sage/15 ${
          error ? 'border-red-400/70' : 'border-border'
        }`}
        {...props}
      />
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </label>
  );
}

```

### `frontend/src/components/ui/Spinner.jsx`

```jsx
export default function Spinner({ size = 'md' }) {
  const className = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return <span aria-label="Loading" className={`inline-block animate-spin rounded-full border-2 border-sage/25 border-t-sage ${className}`} />;
}

```

### `frontend/src/hooks/useDocumentTitle.js`

```js
import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · FreshCuts` : 'FreshCuts';
    return () => {
      document.title = 'FreshCuts';
    };
  }, [title]);
}

```

### `frontend/src/main.jsx`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { store } from './store/store.js';
import './styles/index.css';
import { configureSessionExpiredHandler } from './services/apiClient.js';
import { sessionExpired } from './store/authSlice.js';

configureSessionExpiredHandler(() => store.dispatch(sessionExpired()));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);

```

### `frontend/src/pages/HomePage.jsx`

```jsx
import { ArrowRight, CalendarClock, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getServices } from '../services/services.api.js';
import Card from '../components/ui/Card.jsx';

function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export default function HomePage() {
  useDocumentTitle('Book your next cut');
  const [services, setServices] = useState([]);

  useEffect(() => {
    getServices().then(setServices).catch(() => setServices([]));
  }, []);

  return (
    <div>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:pt-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted">
            <Sparkles className="h-3.5 w-3.5 text-sage" /> Personal care, simplified.
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Look sharp. <span className="text-sage-bright">Book smarter.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Find your barber or stylist, explore services, and manage your account in one clean place. Appointment scheduling is the next feature slice.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/providers" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-sage px-5 text-sm font-semibold text-background hover:bg-sage-bright">
              Browse providers <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border px-5 text-sm font-semibold text-text hover:bg-surface-2">
              Create an account
            </Link>
          </div>
        </div>

        <Card className="p-6 md:p-7">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">FreshCuts today</div>
          <div className="mt-5 grid gap-4">
            {[
              ['Verified accounts', 'Secure email verification and session cookies'],
              ['Clear service details', 'Price and duration are always visible'],
              ['Ready for booking', 'The scheduling engine is the next phase'],
            ].map(([title, text]) => (
              <div key={title} className="flex gap-3 rounded-xl border border-border bg-background p-4">
                <div className="mt-0.5 text-sage"><ShieldCheck className="h-5 w-5" /></div>
                <div><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-xs leading-5 text-muted">{text}</div></div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Services</div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Popular cuts and care</h2>
          </div>
          <Link to="/services" className="hidden text-sm text-muted hover:text-text sm:block">View providers</Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{service.description}</p>
                </div>
                <CalendarClock className="h-5 w-5 shrink-0 text-sage" />
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                <span className="text-muted">{service.durationMin} min</span>
                <span className="font-semibold text-sage-bright">{money(service.priceCents)}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

```

### `frontend/src/pages/LoginPage.jsx`

```jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearAuthError } from '../store/authSlice.js';
import { getFieldError } from '../utils/errors.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import Card from '../components/ui/Card.jsx';
import * as authApi from '../services/auth.api.js';
import { useState } from 'react';

export default function LoginPage() {
  useDocumentTitle('Log in');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, status } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors }, setError } = useForm();
  const [resend, setResend] = useState('idle');
  const [emailForResend, setEmailForResend] = useState('');

  const onSubmit = async (values) => {
    dispatch(clearAuthError());
    const action = await dispatch(login(values));
    if (login.fulfilled.match(action)) {
      navigate(location.state?.from ?? '/profile', { replace: true });
      return;
    }
    setEmailForResend(values.email);
    for (const fieldError of action.payload?.errors ?? []) {
      setError(fieldError.field, { message: fieldError.message });
    }
  };

  const resendVerification = async () => {
    setResend('loading');
    try {
      await authApi.resendVerification(emailForResend);
      setResend('sent');
    } catch {
      setResend('error');
    }
  };

  return (
    <section className="mx-auto max-w-lg px-5 py-16">
      <Card className="p-7 sm:p-9">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">FreshCuts account</div>
        <h1 className="mt-2 text-3xl font-semibold">Welcome back.</h1>
        <p className="mt-3 text-sm text-muted">Sign in to manage your account.</p>
        {error ? <div className="mt-5"><Alert>{error.message}</Alert></div> : null}
        {error?.code === 'EMAIL_NOT_VERIFIED' ? (
          <div className="mt-3 space-y-2 text-sm text-muted">
            <button type="button" className="text-sage-bright hover:text-text disabled:opacity-50" onClick={resendVerification} disabled={!emailForResend || resend === 'loading'}>
              {resend === 'loading' ? 'Sending…' : 'Resend verification email'}
            </button>
            {resend === 'sent' ? <Alert tone="success">A new verification email has been sent.</Alert> : null}
          </div>
        ) : null}
        <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input id="email" type="email" label="Email" error={errors.email?.message || getFieldError(error, 'email')} autoComplete="email" {...register('email', { required: 'Email is required' })} />
          <Input id="password" type="password" label="Password" error={errors.password?.message || getFieldError(error, 'password')} autoComplete="current-password" {...register('password', { required: 'Password is required' })} />
          <Button type="submit" className="w-full" loading={status === 'loading'}>Log in</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">Need an account? <Link to="/register" className="text-sage-bright hover:text-text">Create one</Link></p>
      </Card>
    </section>
  );
}

```

### `frontend/src/pages/NotFoundPage.jsx`

```jsx
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Card from '../components/ui/Card.jsx';

export default function NotFoundPage() {
  useDocumentTitle('Not found');

  return (
    <section className="mx-auto max-w-xl px-5 py-20">
      <Card className="p-8 text-center sm:p-10">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">404</div>
        <h1 className="mt-2 text-3xl font-semibold">Page not found.</h1>
        <p className="mt-4 text-sm leading-6 text-muted">The page you requested does not exist.</p>
        <Link to="/" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-sage px-5 text-sm font-semibold text-background hover:bg-sage-bright">Back home</Link>
      </Card>
    </section>
  );
}

```

### `frontend/src/pages/ProfilePage.jsx`

```jsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuthError, updateProfile } from '../store/authSlice.js';
import { getFieldError } from '../utils/errors.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Card from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const dispatch = useDispatch();
  const { user, error } = useSelector((state) => state.auth);
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  useEffect(() => {
    if (user) reset({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' });
  }, [user, reset]);

  const onSubmit = async (values) => {
    dispatch(clearAuthError());
    await dispatch(updateProfile(values));
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Account</div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your profile</h1>
      <p className="mt-3 text-sm text-muted">Keep your personal details up to date.</p>

      <Card className="mt-8 p-7 sm:p-9">
        {error ? <div className="mb-5"><Alert>{error.message}</Alert></div> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-muted">Email</div>
            <div className="mt-2 text-sm font-medium">{user.email}</div>
            <div className="mt-1 text-xs text-sage">Verified</div>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="text-xs uppercase tracking-[0.14em] text-muted">Role</div>
            <div className="mt-2 text-sm font-medium">{user.role}</div>
          </div>
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="firstName" label="First name" error={errors.firstName?.message || getFieldError(error, 'firstName')} {...register('firstName', { required: 'First name is required' })} />
            <Input id="lastName" label="Last name" error={errors.lastName?.message || getFieldError(error, 'lastName')} {...register('lastName', { required: 'Last name is required' })} />
          </div>
          <Input id="phone" label="Phone" error={errors.phone?.message || getFieldError(error, 'phone')} {...register('phone')} />
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={!isDirty}>Save changes</Button>
          </div>
        </form>
      </Card>
    </section>
  );
}

```

### `frontend/src/pages/ProviderDetailPage.jsx`

```jsx
import { ArrowLeft, Clock3, Scissors } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getProvider } from '../services/providers.api.js';
import Card from '../components/ui/Card.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Alert from '../components/ui/Alert.jsx';

function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export default function ProviderDetailPage() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  useDocumentTitle(provider?.name ?? 'Provider');

  useEffect(() => {
    getProvider(id).then(setProvider).catch(setError);
  }, [id]);

  if (error) {
    return <section className="mx-auto max-w-6xl px-5 py-16"><Alert>{error.message}</Alert></section>;
  }
  if (!provider) {
    return <div className="grid min-h-[60vh] place-items-center"><Spinner /></div>;
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <Link to="/providers" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text"><ArrowLeft className="h-4 w-4" /> Back to providers</Link>

      <div className="mt-7 grid gap-6 md:grid-cols-[280px_1fr]">
        <Card className="grid aspect-square place-items-center bg-surface-2 p-8">
          {provider.imageUrl ? <img src={provider.imageUrl} alt={provider.name} className="h-full w-full rounded-xl object-cover" /> : <div className="grid h-28 w-28 place-items-center rounded-full border border-border bg-background text-2xl font-semibold text-sage-bright">{provider.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>}
        </Card>

        <Card className="p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Provider</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{provider.name}</h1>
          <div className="mt-2 text-sm text-sage">{provider.title}</div>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">{provider.bio}</p>

          <div className="mt-8">
            <div className="text-sm font-semibold">Services</div>
            <div className="mt-4 grid gap-3">
              {provider.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center gap-3"><Scissors className="h-4 w-4 text-sage" /><span className="text-sm font-medium">{service.name}</span></div>
                  <div className="flex items-center gap-4 text-xs text-muted"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {service.durationMin} min</span><span className="font-semibold text-sage-bright">{money(service.priceCents)}</span></div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-dashed border-border bg-surface-2 p-4 text-sm text-muted">
            Appointment scheduling is coming in the next FreshCuts feature slice.
          </div>
        </Card>
      </div>
    </section>
  );
}

```

### `frontend/src/pages/ProvidersPage.jsx`

```jsx
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getProviders } from '../services/providers.api.js';
import { getServices } from '../services/services.api.js';
import ProviderCard from '../components/providers/ProviderCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import Alert from '../components/ui/Alert.jsx';

export default function ProvidersPage() {
  useDocumentTitle('Providers');
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [query, setQuery] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    getServices().then(setServices).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError(null);
    getProviders({ q: query, serviceId: serviceId || undefined })
      .then((response) => {
        if (!active) return;
        setProviders(response.data);
        setStatus('ready');
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError);
        setStatus('error');
      });
    return () => { active = false; };
  }, [query, serviceId]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Providers</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Find your next barber or stylist.</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Explore the team and the services they currently offer.</p>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_240px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search providers" className="w-full rounded-lg border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none focus:border-sage" />
        </label>
        <select value={serviceId} onChange={(event) => setServiceId(event.target.value)} className="rounded-lg border border-border bg-surface px-3.5 py-3 text-sm text-text outline-none focus:border-sage">
          <option value="">All services</option>
          {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
        </select>
      </div>

      {status === 'loading' ? (
        <div className="grid min-h-72 place-items-center"><Spinner /></div>
      ) : error ? (
        <div className="mt-8"><Alert>{error.message}</Alert></div>
      ) : providers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">No providers matched your search.</div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
        </div>
      )}
    </section>
  );
}

```

### `frontend/src/pages/RegisterPage.jsx`

```jsx
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { register as registerAccount, clearAuthError } from '../store/authSlice.js';
import { getFieldError } from '../utils/errors.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Input from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import Card from '../components/ui/Card.jsx';
import * as authApi from '../services/auth.api.js';

export default function RegisterPage() {
  useDocumentTitle('Create account');
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors }, setError } = useForm();
  const [created, setCreated] = useState(null);
  const [resendState, setResendState] = useState('idle');

  const onSubmit = async (values) => {
    dispatch(clearAuthError());
    const action = await dispatch(registerAccount(values));
    if (registerAccount.fulfilled.match(action)) {
      setCreated(values.email);
      return;
    }
    for (const fieldError of action.payload?.errors ?? []) {
      setError(fieldError.field, { message: fieldError.message });
    }
  };

  const resend = async () => {
    if (!created) return;
    setResendState('loading');
    try {
      await authApi.resendVerification(created);
      setResendState('sent');
    } catch {
      setResendState('error');
    }
  };

  if (created) {
    return (
      <section className="mx-auto max-w-lg px-5 py-16">
        <Card className="p-7 sm:p-9">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Almost there</div>
          <h1 className="mt-2 text-3xl font-semibold">Verify your email.</h1>
          <p className="mt-4 text-sm leading-6 text-muted">We sent a verification link to <span className="text-text">{created}</span>. Open it to activate your account.</p>
          {resendState === 'sent' ? <div className="mt-5"><Alert tone="success">A new verification email has been sent.</Alert></div> : null}
          {resendState === 'error' ? <div className="mt-5"><Alert>We could not resend the email. Try again later.</Alert></div> : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={resend} loading={resendState === 'loading'}>Resend email</Button>
            <Link to="/login" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-text hover:bg-surface-2">Back to login</Link>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-lg px-5 py-16">
      <Card className="p-7 sm:p-9">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">FreshCuts account</div>
        <h1 className="mt-2 text-3xl font-semibold">Create your account.</h1>
        <p className="mt-3 text-sm text-muted">You’ll need to verify your email before signing in.</p>
        {error ? <div className="mt-5"><Alert>{error.message}</Alert></div> : null}
        <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="firstName" label="First name" error={errors.firstName?.message || getFieldError(error, 'firstName')} {...register('firstName', { required: 'First name is required', maxLength: { value: 60, message: 'Maximum 60 characters' } })} />
            <Input id="lastName" label="Last name" error={errors.lastName?.message || getFieldError(error, 'lastName')} {...register('lastName', { required: 'Last name is required', maxLength: { value: 60, message: 'Maximum 60 characters' } })} />
          </div>
          <Input id="email" type="email" label="Email" error={errors.email?.message || getFieldError(error, 'email')} autoComplete="email" {...register('email', { required: 'Email is required' })} />
          <Input id="phone" type="tel" label="Phone (optional)" error={errors.phone?.message || getFieldError(error, 'phone')} autoComplete="tel" {...register('phone')} />
          <Input id="password" type="password" label="Password" error={errors.password?.message || getFieldError(error, 'password')} autoComplete="new-password" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' }, maxLength: { value: 72, message: 'Maximum 72 characters' } })} />
          <Button type="submit" className="w-full">Create account</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link to="/login" className="text-sage-bright hover:text-text">Log in</Link></p>
      </Card>
    </section>
  );
}

```

### `frontend/src/pages/ServicesPage.jsx`

```jsx
import { Clock3, Scissors } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getServices } from '../services/services.api.js';
import Card from '../components/ui/Card.jsx';
import Spinner from '../components/ui/Spinner.jsx';

function money(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export default function ServicesPage() {
  useDocumentTitle('Services');
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getServices()
      .then((items) => { setServices(items); setStatus('ready'); })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <div className="max-w-2xl">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Services</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Simple services, clear pricing.</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Every service shows its duration and starting price so customers know what to expect.</p>
      </div>

      {status === 'loading' ? (
        <div className="grid min-h-72 place-items-center"><Spinner /></div>
      ) : status === 'error' ? (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-8 text-sm text-muted">Services are temporarily unavailable. Try again later.</div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface-2 text-sage"><Scissors className="h-4 w-4" /></div>
                <span className="text-sm font-semibold text-sage-bright">{money(service.priceCents)}</span>
              </div>
              <h2 className="mt-5 text-lg font-semibold">{service.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{service.description}</p>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted"><Clock3 className="h-3.5 w-3.5" /> {service.durationMin} minutes</div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

```

### `frontend/src/pages/VerifyEmailPage.jsx`

```jsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { verifyEmail, resendVerification } from '../services/auth.api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Card from '../components/ui/Card.jsx';
import Alert from '../components/ui/Alert.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export default function VerifyEmailPage() {
  useDocumentTitle('Verify email');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? 'loading' : 'idle');
  const [message, setMessage] = useState('');
  const [resendStatus, setResendStatus] = useState('idle');
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then(() => { setStatus('success'); setMessage('Your email has been verified.'); })
      .catch((error) => { setStatus('error'); setMessage(error.message); });
  }, [token]);

  const onResend = async ({ email }) => {
    setResendStatus('loading');
    try {
      await resendVerification(email);
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    }
  };

  return (
    <section className="mx-auto max-w-lg px-5 py-16">
      <Card className="p-7 sm:p-9">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">Email verification</div>
        <h1 className="mt-2 text-3xl font-semibold">Verify your account.</h1>

        {status === 'loading' ? (
          <div className="grid place-items-center py-10"><Spinner /></div>
        ) : status === 'success' ? (
          <div className="mt-6 space-y-5"><Alert tone="success">{message}</Alert><Link to="/login" className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-sage text-sm font-semibold text-background hover:bg-sage-bright">Continue to login</Link></div>
        ) : status === 'error' ? (
          <div className="mt-6 space-y-5"><Alert>{message}</Alert><Link to="/verify-email" className="text-sm text-sage-bright">Request a new verification link</Link></div>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-muted">Enter your email and we will send a fresh verification link if your account needs one.</p>
            {resendStatus === 'sent' ? <div className="mt-5"><Alert tone="success">If the account needs verification, a new email has been sent.</Alert></div> : null}
            {resendStatus === 'error' ? <div className="mt-5"><Alert>We could not process that request.</Alert></div> : null}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onResend)}>
              <Input id="email" type="email" label="Email" error={errors.email?.message} {...register('email', { required: 'Email is required' })} />
              <Button type="submit" className="w-full" loading={resendStatus === 'loading'}>Send verification email</Button>
            </form>
          </>
        )}
      </Card>
    </section>
  );
}

```

### `frontend/src/routes.jsx`

```jsx
import { Navigate, createRoutesFromElements, Route } from 'react-router-dom';
import App from './App.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProviderDetailPage from './pages/ProviderDetailPage.jsx';
import ProvidersPage from './pages/ProvidersPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';

export const routes = createRoutesFromElements(
  <Route element={<App />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/services" element={<ServicesPage />} />
    <Route path="/providers" element={<ProvidersPage />} />
    <Route path="/providers/:id" element={<ProviderDetailPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/profile" element={<ProfilePage />} />
    </Route>
    <Route path="/404" element={<NotFoundPage />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Route>,
);

```

### `frontend/src/services/apiClient.js`

```js
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

let refreshPromise = null;
let onSessionExpired = () => {};

export function configureSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

function normalizeError(error) {
  const response = error?.response;
  return {
    status: response?.status,
    code: response?.data?.code,
    message: response?.data?.message ?? 'Network error. Please try again.',
    errors: response?.data?.errors ?? [],
  };
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const response = error?.response;
    const config = error?.config;

    if (
      response?.status === 401 &&
      response.data?.code === 'TOKEN_EXPIRED' &&
      config &&
      !config._retry
    ) {
      config._retry = true;
      refreshPromise ??= api.post('/auth/refresh').finally(() => {
        refreshPromise = null;
      });

      try {
        await refreshPromise;
        return api(config);
      } catch {
        onSessionExpired();
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

```

### `frontend/src/services/auth.api.js`

```js
import { api } from './apiClient.js';

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
}

export async function verifyEmail(token) {
  const { data } = await api.post('/auth/verify-email', { token });
  return data.data;
}

export async function resendVerification(email) {
  const { data } = await api.post('/auth/resend-verification', { email });
  return data.data;
}

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload);
  return data.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function getMe() {
  const { data } = await api.get('/users/me');
  return data.data;
}

export async function updateProfile(payload) {
  const { data } = await api.patch('/users/me', payload);
  return data.data;
}

```

### `frontend/src/services/providers.api.js`

```js
import { api } from './apiClient.js';

export async function getProviders(params = {}) {
  const { data } = await api.get('/providers', { params });
  return data;
}

export async function getProvider(id) {
  const { data } = await api.get(`/providers/${id}`);
  return data.data;
}

```

### `frontend/src/services/services.api.js`

```js
import { api } from './apiClient.js';

export async function getServices() {
  const { data } = await api.get('/services');
  return data.data;
}

```

### `frontend/src/store/authSlice.js`

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as authApi from '../services/auth.api.js';

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    return await authApi.getMe();
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const result = await authApi.login(payload);
    return result.user;
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    return await authApi.register(payload);
  } catch (error) {
    return rejectWithValue(error);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.updateProfile(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  user: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionExpired(state) {
      state.user = null;
      state.status = 'anonymous';
      state.error = { code: 'SESSION_EXPIRED', message: 'Your session has expired.' };
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.status = 'anonymous';
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'anonymous';
        state.error = action.payload ?? { message: 'Unable to sign in.' };
      })
      .addCase(register.fulfilled, (state, action) => {
        state.error = null;
        state.status = 'anonymous';
        state.user = null;
        state.registration = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload ?? { message: 'Unable to create account.' };
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'anonymous';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload ?? { message: 'Unable to update profile.' };
      });
  },
});

export const { sessionExpired, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

```

### `frontend/src/store/store.js`

```js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

```

### `frontend/src/styles/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #111211;
  color: #F2F1EC;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

html {
  min-width: 320px;
  background: #111211;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: #111211;
}

button,
input,
select,
textarea {
  font: inherit;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #C1D0A5;
  outline-offset: 2px;
}

::selection {
  background: #A3B18A;
  color: #111211;
}

```

### `frontend/src/utils/errors.js`

```js
export function getFieldError(error, field) {
  return error?.errors?.find((item) => item.field === field)?.message;
}

```

### `frontend/tailwind.config.js`

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#111211',
        surface: {
          DEFAULT: '#191B19',
          2: '#222522',
        },
        border: '#303530',
        sage: {
          DEFAULT: '#A3B18A',
          dark: '#7D8F68',
          bright: '#C1D0A5',
        },
        text: '#F2F1EC',
        muted: '#A7AAA2',
      },
      boxShadow: {
        panel: '0 18px 50px rgba(0,0,0,0.24)',
      },
    },
  },
  plugins: [],
};

```

### `frontend/vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
  },
});

```

### `package.json`

```json
{
  "name": "freshcuts",
  "private": true,
  "version": "1.0.0",
  "description": "FreshCuts barber and personal-care booking platform",
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently -n BACKEND,FRONTEND -c blue,green \"npm run dev --workspace backend\" \"npm run dev --workspace frontend\"",
    "dev:backend": "npm run dev --workspace backend",
    "dev:frontend": "npm run dev --workspace frontend",
    "build": "npm run build --workspace frontend",
    "lint": "npm run lint --workspaces --if-present",
    "format": "npm run format --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "db:migrate": "npm run db:migrate --workspace backend",
    "db:seed": "npm run db:seed --workspace backend",
    "db:studio": "npm run db:studio --workspace backend"
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}

``` -->
