## Auth Implementation Overview

This project uses **Supabase Auth** everywhere (email/password, magic links, OAuth) and keeps the browser/server halves perfectly in sync. The moving pieces you need to recreate in another app are:

### 1. Single Source of Truth for Supabase Clients

- `src/lib/supabase/config.ts` exposes helpers for URL/keys + `SUPABASE_SCHEMA = "megalithic"`.
- Browser client (`src/lib/supabase/clients.ts`) is a `"use client"` module that calls `createBrowserClient<Database>()` with `persistSession: true`, `autoRefreshToken: true`, and explicit `localStorage`.
- Server client (`src/lib/supabase/server.ts`) wraps `createServerClient()` and wires Next.js App Router cookies (`next/headers`) so server components + API routes can run authenticated queries.
- **Note:** Uses async `await cookies()` API for Next.js 15 compatibility.

### 2. Route Protection + Session Refresh (Middleware)

- `src/middleware.ts` runs on every request (except static assets) and creates a Supabase server client with manual cookie read/write.
- `supabase.auth.getUser()` is called at the edge to **verify** the session with Supabase servers; network errors are treated leniently so we don't log people out because Supabase hiccuped.
- Protected routes include `/map/**`, `/discover/**`, `/forum/**`, `/profile/**`, `/research/**`, etc. If no user, the middleware redirects to `/login?next=…`.
- OAuth callbacks (`/auth/callback`) are whitelisted so Supabase can hand back the session.

### ⚠️ Critical: `getUser()` vs `getSession()` on the Server

| Method         | Behavior                                        | Server Safe?             |
| -------------- | ----------------------------------------------- | ------------------------ |
| `getSession()` | Reads JWT from cookies **without verification** | ❌ No - can be tampered  |
| `getUser()`    | Sends JWT to Supabase for **verification**      | ✅ Yes - validates token |

**Always use `getUser()` for server-side authorization.** The `getSession()` method reads from storage without verifying the JWT signature, which means a malicious user could potentially craft a fake session. Our server actions and authorization module now use `getUser()` exclusively.

### 3. OAuth Callback Route

- `src/app/auth/callback/route.ts` handles Supabase’s OAuth redirect.
- It builds a redirect response (303) to the original `next` URL, exchanges the `code` for a session via `supabase.auth.exchangeCodeForSession(code)`, and sets Supabase’s cookies directly on that redirect response. (We can’t rely on the default cookie store here, hence the manual `cookies.set`.)

### 4. Client-Side Session Provider

- `src/components/providers/AuthProvider.tsx` is a React context that wraps the entire app.
  - On mount it calls `supabase.auth.getUser()` (browser client) to pull the existing session.
  - If a user exists, we enrich it with organization-role information (`organization_members` table) to compute flags such as `canCreateEvents`.
  - We subscribe to `supabase.auth.onAuthStateChange()` so password sign-in, OAuth callbacks, and sign-out events flow naturally into React state.
  - Exposes `{ user, loading, isAuthenticated, refreshUser, signOut }` via `useAuth()`.

### 5. UI Entry Points

- `src/app/login/page.tsx` is a client component with three flows:
  1. **Email/password** via `supabase.auth.signInWithPassword`.
  2. **Magic link** via `supabase.auth.signInWithOtp({ emailRedirectTo: <app>/auth/callback?next=… })`.
  3. **Google OAuth** via `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } })`.
- Redirect targets are sanitized by `NEXT_PUBLIC_APP_URL` so they work locally and in production.
- Navbar/AttendeeAppBar read `useAuth()` to render user info, sign-out, etc.

### 6. Server Actions & Authorization

- Server actions in `src/lib/supabase/profile-actions.ts` use a shared `getAuthenticatedUser()` helper that calls `getUser()`.
- The `authorization.ts` module provides `authorizeSiteEdit()` and `authorizeRoleAccess()` for role-based access control.
- All server-side auth checks verify the JWT with Supabase - never trust unverified session data.

### 7. Server/Data Layer Usage

- Any server component or API route that needs authenticated Supabase access imports `createClient()` from `src/lib/supabase/server.ts`. This ensures the request's cookies are carried into Supabase (so row-level security works with the signed-in user).
- Client components that need to call Supabase directly (e.g. login form) import the browser singleton. All other data fetching flows through repository modules in `src/data/**`, which use the server client.

### 8. Environment + Schema Expectations

- Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`.
- Everything runs inside the `megalithic` schema. The clients force `db: { schema: SUPABASE_SCHEMA }` so every query hits the same namespace.

### Reusing This Setup

When porting to another app:

1. Copy the supabase config + client helpers (`config.ts`, `clients.ts`, `server.ts`).
2. Add the middleware with your route protection rules.
3. Implement the OAuth callback route exactly once—it handles every provider.
4. Wrap your app in the `AuthProvider` and expose a `useAuth()` hook for components.
5. Build your login/signup UI on top of the browser client (password, magic link, OAuth).
6. Use the server client in repositories/API routes so RLS is respected automatically.

This gives you:

- SSR-safe auth (server components can read the user).
- Automatic session refresh (middleware + Supabase auto-refresh).
- Central place to enrich user profiles / check roles.
- Consistent behavior across password, magic link, and OAuth flows.
