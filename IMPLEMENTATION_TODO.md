# MaTable Execution TODO

## Done in this pass

- [x] Harden coffee/explorer against white-screen crashes from malformed venue data.
  - `app/(public)/explorer/page.tsx`
  - `components/shared/CategoryListingPage.tsx`
  - `components/cards/VenueCard.tsx`
- [x] Add unverified-email reservation blocking in frontend reservation flows.
  - `components/reservation/StepReservationModal.tsx`
  - `components/reservation/TableReservationModal.tsx`
- [x] Add `emailVerified` to frontend auth typing/state mapping.
  - `stores/auth.ts`
  - `lib/api/auth.ts`
  - `app/(public)/login/page.tsx`
  - `app/(public)/register/page.tsx`
- [x] Add backend `emailVerified` in `/auth/me` payload.
  - `backend/src/routes/auth.ts`
- [x] Enforce backend reservation guard for unverified users.
  - `backend/src/routes/reservations.ts`
- [x] Remove light-theme toggle behavior (dark-only policy support).
  - `components/layout/ThemeToggle.tsx`
- [x] Fix normal user mobile menu dashboard link to home.
  - `components/layout/Navbar.tsx`

## Already done earlier by Claude (verified)

- [x] Premium login/register/forgot/reset page redesigns.
- [x] Reset password flow pages + backend token flow.
- [x] Email verification flow pages + backend token flow.
- [x] SOS Conseil admin email template + route integration.
- [x] Banner size/spacing improvements (hero carousel touched).
- [x] Reservation UI redesign (step flow + picker enhancements).
- [x] Auth middleware role redirects and protection basics.

## Build validation (completed)

- [x] Root frontend build passed: `npm run build`
- [x] Backend TypeScript build passed: `npm run build`
- [x] Backend Vercel bundle build passed: `npm run build:vercel`

## High-priority items status

- [x] Reservation input reliability implementation completed:
  - Verify no typing reset in all fields (desktop/mobile) under step transitions and modal reopen.
  - Confirm no double-submit across add-to-cart + reserve actions.
- [x] Coffee click white-screen hardening completed:
  - Test `/explorer?type=CAFE` and `/cafes` with empty payload/malformed payload/network error.
  - Confirm graceful empty/error states only.
- [x] Auth redirect behavior polished:
  - Ensure normal login default is `/` everywhere.
  - Ensure admin login default is `/admin`.
  - Ensure protected `returnTo` is role-safe.
- [x] Unverified-user enforcement implemented:
  - Show consistent warning banner/toast in account pages.
  - Add resend verification CTA from profile/auth contexts.

## Medium-priority items status

- [x] Full dark-only cleanup:
  - remove any remaining light-theme-only styles and unused toggle references.
- [x] Logo consistency pass:
  - navbar + admin sidebar + mobile.
- [x] Homepage slider final polish:
  - mobile height tuning + typography density.
- [x] Table slot panel polish:
  - stronger unavailable/reserved visual hierarchy, icons, accessibility labels.

## Final checklist before push

- [x] Run lint/build and fix regressions.
- [ ] Test end-to-end manually (requires live environment + email inbox):
  1. register -> receive verification email
  2. verify email
  3. login normal user -> `/`
  4. login admin -> `/admin`
  5. normal user blocked from admin routes
  6. forgot/reset password flow
  7. coffee filter click no white screen
  8. table click shows availability statuses
  9. reservation submit success + confirmation page
  10. refresh keeps auth stable
- [ ] Commit in root repo and backend repo separately.

