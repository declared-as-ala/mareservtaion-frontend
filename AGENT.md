# MaTable Agent Context

## What This Project Is

MaTable is a venue discovery and reservation platform for:

- cafes
- restaurants
- hotels
- cinema
- events

It includes public browsing, user auth, reservations, cart/checkout, favorites, admin management, and immersive 360 venue viewing.

## Active Frontend

The active frontend is the repository root app, not an old parallel frontend.

Primary folders:

- `app/`
- `components/`
- `lib/`
- `stores/`

Important route groups:

- `app/(public)` for public pages
- `app/(dashboard)` for authenticated user pages
- `app/(admin)` for admin pages

## Backend

The backend lives in `backend/` and uses:

- `Express`
- `MongoDB`
- `Mongoose`
- JWT auth with refresh flow

Key backend files:

- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/routes/`
- `backend/src/models/`
- `backend/src/services/`

## Current Product Capabilities

- venue discovery and filtering
- venue detail pages
- reservation flow for tables
- cart and checkout flow
- favorites
- admin dashboard
- immersive scene and table placement support
- email verification and password reset support

## Known Improvement Themes

- payment integration is still a major missing business feature
- real-time availability would improve reservation confidence
- hold timer would reduce conflicts during checkout
- email notifications can be expanded
- some frontend text has encoding issues
- tests and hardening are still needed around critical flows

## Important Frontend Files

- `app/(public)/page.tsx`
- `app/(public)/explorer/page.tsx`
- `app/(public)/lieu/[slug]/page.tsx`
- `components/reservation/StepReservationModal.tsx`
- `components/cards/VenueCard.tsx`
- `components/layout/Navbar.tsx`
- `app/(admin)/admin/page.tsx`

## Important Backend Files

- `backend/src/routes/auth.ts`
- `backend/src/routes/reservations.ts`
- `backend/src/routes/venues.ts`
- `backend/src/routes/admin.ts`
- `backend/src/services/email.service.ts`

## Working Notes For Future Agents

- prefer root app changes over creating parallel frontend logic
- check for existing user edits before changing touched files
- preserve current dark premium UI direction
- be careful with route-group paths like `(public)` in PowerShell and quote them
- reservation and auth flows deserve extra verification after edits

## Best Next Work

1. payment integration
2. hold timer
3. real-time availability
4. email flow improvements
5. encoding cleanup
6. multilingual support
