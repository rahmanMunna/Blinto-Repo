# Blinto

A URL shortener in two independent projects:

```
Blinto-Repo/
├─ backend/     NestJS 11 + PostgreSQL (TypeORM) + JWT + Google OAuth  → :3000
└─ frontend/    Next.js 15 + React 19 + Tailwind CSS v4                → :3001
```

They share no code and talk only over HTTP.

## Running both

Two terminals:

```bash
# terminal 1
cd backend
npm install
npm run start:dev        # http://localhost:3000

# terminal 2
cd frontend
npm install
npm run dev              # http://localhost:3001
```

The frontend **must** be on port 3001 — the backend's CORS allowlist names that
origin explicitly.

### backend/.env

```
PG_HOST=localhost
PG_PORT=5432
PG_USER_NAME=
PG_PASSWORD=
PG_DB_NAME=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# where the OAuth callback sends the browser once tokens are minted
FRONTEND_URL=http://localhost:3001
```

### frontend/.env.local

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## API

Scalar reference: <http://localhost:3000/docs/api/v1>

| Method | Route | Auth | Body / Param | Returns |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | — | `username`, `email`, `password`, `confirmPassword` | the created user |
| POST | `/auth/login` | — | `username`, `password` | `{ access_token, refresh_token }` |
| POST | `/auth/refresh` | — | `refreshToken` | a rotated token pair |
| GET | `/auth/google` | — | — | 302 to Google |
| GET | `/auth/google/callback` | — | — | 302 to the frontend with the tokens |
| POST | `/url` | Bearer | `originalUrl` | the short URL as a plain string |
| GET | `/url` | Bearer | — | the caller's links |
| GET | `/url/user` | Bearer | — | the caller's links |
| GET | `/url/:shortCode` | **public** | — | 302 to the destination, counts a visit |
| GET | `/url/:shortCode/visits` | Bearer, owner | — | `{ visits }` |
| GET | `/url/:shortCode/details` | Bearer, owner | — | the full record |
| PATCH | `/url/:shortCode` | Bearer, owner | `originalUrl` | `{ short_code, new_original_url }` |
| DELETE | `/url/:shortCode` | Bearer, owner | — | `true` |

Auth is by `Authorization: Bearer <access_token>`. The login and callback routes
also set httpOnly cookies, but the guard does not read them.

### Ownership

Short URLs are private to the account that created them. Every owner-facing
route is scoped to `request.user.sub`, and a short code that belongs to another
account answers **404** rather than 403, so the response does not reveal which
codes are in use. No route lists another account's links.

The one exception is the redirect, `GET /url/:shortCode`, which is public by
design — a short link is pasted into an address bar, a chat message or a QR
code, none of which can send an `Authorization` header. It reveals only the
destination of a code the visitor already holds.

See [frontend/README.md](frontend/README.md) for the client's structure and the
two sign-in flows.
