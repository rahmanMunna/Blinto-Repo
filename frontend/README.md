# Blinto — Frontend

Next.js 15 (App Router) + React 19 + Tailwind CSS v4 client for the NestJS API in
the sister `backend/` folder. No code is shared between the two projects; the
frontend talks to the backend only over HTTP.

## Running it

```bash
npm install
npm run dev      # http://localhost:3001
```

Port **3001 is not optional** — `backend/src/main.ts` enables CORS for
`http://localhost:3001` only. `npm run dev` and `npm start` both pin it.

The backend must be running on port 3000 (`cd ../backend && npm run start:dev`).

### Environment

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Pages

| Route | Auth | What it does |
| --- | --- | --- |
| `/` | public | Landing page; the URL box carries `?url=` through sign-in |
| `/login` | public | Username + password, plus the Google button |
| `/register` | public | Guest registration, then an automatic sign-in |
| `/auth/google/callback` | public | Receives the token pair from the backend redirect |
| `/dashboard` | required | Stats, create form, and the user's own links |
| `/explore` | required | Your links ranked by traffic (`GET /url`), searchable |
| `/links/[shortCode]` | required | Full record for one short code |

## How auth works here

The backend's `AuthGuard` reads `Authorization: Bearer <token>` and **ignores**
the httpOnly cookies the controller also sets, so the browser has to hold the
token pair itself. `src/lib/tokens.ts` keeps them in `localStorage` and
`src/lib/api.ts` attaches the bearer header.

Access tokens are short-lived (5 minutes on password login, 15 on Google), so
`src/lib/api.ts` retries any 401 once behind a single-flight call to
`POST /auth/refresh`. If that fails the user is pushed to `/login?expired=1`.

### Flow 1 — username and password

`POST /auth/login` → `{ access_token, refresh_token }` → stored → `/dashboard`.

Registration is a two-step because `POST /auth/register` issues no tokens: the
provider registers, then immediately signs in with the same credentials.

### Flow 2 — Google

A full page navigation to `GET /auth/google` → Google → back to
`GET /auth/google/callback` on the **backend** → the backend redirects to
`/auth/google/callback` **here** with the tokens on the query string → the page
stores them and `router.replace`s to `/dashboard`, which keeps the tokens out of
the history entry.

That last redirect required a change to `backend/src/auth/auth.controller.ts`
(it previously returned JSON, which a browser doing a top-level navigation
cannot hand back to this app). It reads `FRONTEND_URL`, defaulting to
`http://localhost:3001`.

## Ownership

Short URLs are private to the account that created them; the backend scopes
every owner-facing route to the caller and answers 404 for someone else's short
code. Nothing in this client can surface another user's links.

`GET /url/:shortCode` — the redirect — is deliberately public, so the "follow"
buttons are plain `<a>` links to the short URL. That is the same path a real
visitor takes, and it is what increments the visit counter.

## Layout

```
src/
├─ app/                    routes (App Router)
├─ components/
│  ├─ auth-provider.tsx    session state, refresh-on-load, logout
│  ├─ link-card.tsx        one link: copy, open, edit, delete
│  ├─ navbar.tsx, protected.tsx, google-button.tsx, ui.tsx, icons.tsx
└─ lib/
   ├─ api.ts               every endpoint, refresh retry, error mapping
   ├─ tokens.ts            localStorage + JWT decode
   └─ types.ts             shapes mirrored from the backend entities/DTOs
```
