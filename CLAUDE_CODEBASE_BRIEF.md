# MaTable Codebase Brief (Frontend + Backend)

Purpose: give Claude fast, low-token context before implementation work.

## 1) Repository Layout

- `backend/`: Node.js + Express + MongoDB API (`/api/v1/*`).
- Root app (`app/`, `components/`, `lib/`, `stores/`): active Next.js frontend.
- `frontend/`: older/parallel frontend copy exists; use root app unless you explicitly decide to migrate.

## 2) Frontend Architecture (Root App)

- `app/layout.tsx`: root layout + providers + global shell.
- `app/providers.tsx`: React Query + theme + auth providers.
- `app/(public)/*`: public pages (home, login, register, explorer, cafes, venue pages, etc.).
- `app/(admin)/*`: admin dashboard pages.
- `components/`: domain UI blocks (home, reservation, cards, auth, layout, shared).
- `lib/api/*`: typed API wrappers and HTTP logic.
- `stores/auth.ts`: auth/session store (Zustand).
- `stores/cart.ts`: cart state.

## 3) Backend Architecture

- `backend/src/server.ts`: Node runtime entry (local/dev server).
- `backend/src/vercel-handler.ts`: Vercel serverless entry.
- `backend/src/app.ts`: Express app setup + route mounting + error handling.
- `backend/src/config/database.ts`: Mongo connection.
- `backend/src/config/env.ts`: env validation.
- `backend/src/routes/*`: API route modules.
- `backend/src/models/*`: Mongoose models.
- `backend/src/services/email.service.ts`: branded email templates + sendEmail.

## 4) Auth + Session Flow

Frontend:
- `lib/api/client.ts`: base URL + cookie `credentials: include` + 401 refresh retry.
- `stores/auth.ts`: `/auth/me`, `/auth/refresh`, `/auth/logout`.
- `app/(public)/login/page.tsx`: login redirect logic (currently non-admin default is dashboard).
- `middleware.ts`: protects `/dashboard` and `/admin`.

Backend:
- `backend/src/routes/auth.ts`:
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `GET /auth/me`

## 5) Password Reset + Email Verification

Backend support exists:
- `backend/src/routes/auth.ts`:
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`
  - `GET /auth/verify-email`
  - `POST /auth/resend-verification`
- Models:
  - `backend/src/models/PasswordReset.ts`
  - `backend/src/models/EmailVerification.ts`
- Email templates:
  - `backend/src/services/email.service.ts`

Frontend status:
- `app/(public)/forgot-password/page.tsx` exists.
- Verify-email and token reset pages are missing/incomplete and should be added.

## 6) Reservation Flow (Current)

Frontend core files:
- `app/(public)/lieu/[slug]/page.tsx`: venue detail, table placement loading, availability window.
- `components/reservation/StepReservationModal.tsx`: main step-based reservation UI.
- `components/reservation/TablePickerSheet.tsx`: table selection + date/time filtering.
- `lib/api/venues.ts`: table placements + availability fetches.
- `lib/api/reservations.ts`: create reservation + my reservations + details/cancel.
- `app/(public)/reservation/[id]/confirmation/page.tsx`: success screen.

Backend core files:
- `backend/src/routes/reservations.ts`: holds, availability checks, create/cancel flows.
- `backend/src/routes/venues.ts`: placement/status endpoints.
- `backend/src/routes/tables.ts`: table-by-venue with optional time-window status.

## 7) Likely White-Screen ("coffee") Risk Areas

Primary paths:
- `components/home/ExperienceCategoriesSection.tsx` -> `/explorer?type=CAFE`
- `app/(public)/explorer/page.tsx`
- `app/(public)/cafes/page.tsx`
- `components/shared/CategoryListingPage.tsx`
- `components/cards/VenueCard.tsx`

Common crash causes to guard:
- null/undefined venue items in mapped lists.
- missing required fields (`slug`, `name`, etc.).
- unhandled fetch failures or empty payload assumptions.

## 8) Theme + Branding

- Theme setup:
  - `app/providers.tsx`
  - `app/globals.css`
  - `components/layout/ThemeToggle.tsx`
- Public navbar/logo:
  - `components/home/HomeNavbar.tsx`
- Admin sidebar/logo:
  - `app/(admin)/layout.tsx`

For dark-only mode, remove/disable `ThemeToggle` and force dark class/tokens globally.

## 9) Homepage + Banner Area

- `app/(public)/page.tsx`: homepage composition.
- `components/home/HeroSliderSection.tsx`
- `components/home/HeroCarousel.tsx`
- `lib/api/bannerSlides.ts`
- Admin slide management:
  - `app/(admin)/admin/banner-slides/page.tsx`

## 10) SOS Conseil Form

- Backend route/model:
  - `backend/src/routes/sos-conseil.ts`
  - `backend/src/models/SOSConseilRequest.ts`
- Gap: currently stores request but does not send branded email notification.

## 11) Environment and URLs

Frontend:
- `.env` -> `NEXT_PUBLIC_API_URL` should point to production backend.

Backend:
- Required: `MONGODB_URI` (or `MONGO_URI`), `JWT_SECRET`, `REFRESH_SECRET`, `CORS_ORIGIN`, `FRONTEND_URL`.
- Email: `RESEND_API_KEY`, `EMAIL_FROM`.

Production backend URL:
- [https://mareservtaion-backend.vercel.app/](https://mareservtaion-backend.vercel.app/)

## 12) Where to Start for the 13 Requested Tasks

1. Reservation input instability:
- `components/reservation/StepReservationModal.tsx`
- `components/reservation/TableReservationModal.tsx` (if still used anywhere)

2. Coffee white screen:
- `app/(public)/explorer/page.tsx`
- `components/shared/CategoryListingPage.tsx`
- `components/cards/VenueCard.tsx`

3. Login redirect to `/lieux`:
- `app/(public)/login/page.tsx`
- optionally middleware returnTo handling in `middleware.ts`

4. Bigger, premium logo:
- `components/home/HomeNavbar.tsx`
- `app/(admin)/layout.tsx`

5-6. Reset + verify flows:
- frontend new pages in `app/(public)/reset-password/*` and `app/(public)/verify-email/*`
- backend already ready in `backend/src/routes/auth.ts`

7. Dark-only mode:
- `app/providers.tsx`
- `components/layout/ThemeToggle.tsx`
- `app/globals.css`

8. Redesign login/forgot/reset:
- `app/(public)/login/page.tsx`
- `app/(public)/forgot-password/page.tsx`
- new reset page(s)

9. SOS Conseil professional email:
- `backend/src/routes/sos-conseil.ts`
- `backend/src/services/email.service.ts`

10. Smaller homepage banners:
- `components/home/HeroSliderSection.tsx`
- `components/home/HeroCarousel.tsx`

11. Better time-slot availability UI:
- `components/reservation/TablePickerSheet.tsx`
- `components/reservation/StepReservationModal.tsx`
- data source from `lib/api/venues.ts` and `backend/src/routes/venues.ts`

12. Reservation form redesign:
- `components/reservation/StepReservationModal.tsx` (main target)

13. Global UI polish:
- `components/ui/*`, `components/shared/*`, category/venue pages in `app/(public)/*`

## 13) Important Practical Note

Because both root app and `frontend/` folder exist, confirm which one is production before major edits. Current git history suggests root app is the active frontend.

