# MaTable / Ma Reservation — Frontend (`frontend/`)

This document helps AI assistants understand **what this app is**, **why it exists**, and **how the Next.js frontend is structured**.

---

## What is this application?

**Ma Reservation** (repo folder often named **MaTable**) is a **French-language** marketplace / booking platform for **hospitality and events**:

- **Venues** (lieux): cafés, restaurants, hôtels, cinéma, espaces événementiels.
- **Discovery**: browse by category, search, featured content, homepage sections.
- **Reservations**: users book **tables**, **rooms**, or **seats** with real availability and confirmation flows.
- **Immersive experience**: some venues expose a **360° panorama**, **Matterport**, or **embedded virtual tour**; **admin-mapped table markers** appear on that view with **live availability** (disponible / réservée / bloquée).

**Goal:** a **premium, production-ready** UX: dark luxury UI, stable auth (silent refresh), admin tools for content and **table placement in 3D/360**, and a clear path from marker click → modal → panier / commande.

---

## How the frontend talks to the backend

- **Base URL**: `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`).
- **API prefix**: all app calls should use **`/api/v1/...`** (see `lib/api/client.ts`).
- **Auth**:
  - **Access token**: stored in `localStorage` (`accessToken`) and also inside Zustand persist (`ma-reservation-auth`).
  - **Refresh token**: **httpOnly cookie**; frontend calls `POST /api/v1/auth/refresh` with `credentials: 'include'`.
  - **`apiFetch` / `apiGetRaw` / etc.**: send `Authorization: Bearer <accessToken>` and **`credentials: 'include'`**; on **401**, attempt **one** silent refresh + retry (except refresh itself).
- **CORS**: backend must allow the frontend origin with `credentials: true`.

---

## Tech stack

| Area | Choice |
|------|--------|
| Framework | **Next.js 16** (App Router) |
| UI | **React 19**, **Tailwind CSS 4**, **shadcn/ui** (Radix), **lucide-react** |
| Data fetching | **TanStack React Query** |
| Global client state | **Zustand** (`stores/auth.ts`, `stores/cart.ts`) — auth store uses **persist** |
| Forms | **react-hook-form** + **zod** where used |
| Toasts | **sonner** |
| 360° viewer | **@photo-sphere-viewer** (+ markers plugin) — `components/immersive/PanoramaEngine.tsx` |
| 3D Matterport | **Matterport Showcase SDK** (dynamic import, `NEXT_PUBLIC_MATTERPORT_SDK_KEY`) — `MatterportEngine.tsx` (admin), `MatterportClientViewer.tsx` (public) |
| Theming | **next-themes** (via `app/providers.tsx`) |

---

## App Router layout (`app/`)

| Route group | Purpose |
|-------------|---------|
| `(public)/` | Marketing + listings + venue/event detail + login/register. Uses `ConditionalShell` (navbar/footer) except **home `/`** which uses `HomeNavbar` + custom hero. |
| `(dashboard)/` | Logged-in **user** area: reservations, profile, etc. Layout wraps **Navbar** + **Footer**. **Admins** are redirected to `/admin` from this layout. |
| `(admin)/admin/*` | **ADMIN** CMS: venues, events, users, virtual tours / table mapping, banner slides, settings. Sidebar + **global Navbar** on top. Auth guard in `app/(admin)/layout.tsx`. |

**Root** `app/layout.tsx`: fonts, `Providers`, global `Toaster`.

---

## Important directories

| Path | Role |
|------|------|
| `lib/api/client.ts` | Central `fetch` wrapper: token, credentials, 401 → refresh + retry |
| `lib/api/*.ts` | Typed helpers per domain (`venues`, `reservations`, `auth`, `admin`, `meta`, …) |
| `lib/api/types.ts` | Shared TS types aligned with backend JSON |
| `stores/` | Zustand: `auth` (user, token, `fetchMe`, `logout`), `cart` |
| `components/ui/` | shadcn primitives |
| `components/layout/` | `Navbar`, `Footer`, `ConditionalShell`, `UserMenuDropdown`, `CartDrawer` |
| `components/home/` | Homepage-specific nav/hero/sliders |
| `components/immersive/` | `ImmersiveViewer`, `PanoramaEngine`, `MatterportEngine`, `MatterportClientViewer`, `EmbedEngine` |
| `components/reservation/` | e.g. `TableReservationModal` for venue immersive table booking |
| `types/matterport.d.ts` | Minimal SDK typings |

---

## Domain concepts (frontend view)

- **Venue** (`Venue`): slug, type (CAFE, RESTAURANT, HOTEL, …), immersive fields (`immersiveType`, `immersiveProvider`, `immersiveUrl`, `immersiveFile`, …).
- **Table** + **TablePlacement**: admin places markers; public page loads **`GET /api/v1/venues/:id/table-placements?startAt&endAt`** → each placement includes populated **table** + computed **`table.status`** (`available` | `reserved` | `blocked`).
- **Cart**: `useCartStore` — items can include venue/table booking metadata; “Passer commande” may call `POST /api/v1/reservations` from modal flow.

---

## Conventions for changes

1. Prefer **`'use client'`** where you need hooks, Zustand, or browser APIs; avoid SSR/client mismatches for auth UI.
2. New API calls: extend `lib/api/*` and use **`apiGetRaw` / `apiPostRaw`** for endpoints that return raw JSON (many admin routes).
3. Heavy or iframe/SDK viewers: use **`next/dynamic` with `{ ssr: false }`** on public venue page when needed.
4. **French** copy is the primary language for user-facing strings.
5. Run **`npm run lint`** from `frontend/` before considering a change done.

---

## Local dev

```bash
cd frontend
npm install
npm run dev   # default http://localhost:3000
```

Ensure `NEXT_PUBLIC_API_URL` points at the running backend (e.g. `http://localhost:3001`).

---

## Related doc

See **`../backend/CLAUDE.md`** for API routes, models, and server-side behavior.
