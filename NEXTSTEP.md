# MaTable Next Steps

## Project Summary

MaTable is a full-stack reservation platform built with:

- `Next.js` frontend in the repository root
- `Express + MongoDB` backend in `backend/`
- public discovery pages for venues and events
- reservation, cart, checkout, favorites, admin, and immersive 360 features

## Highest-Value Enhancements

### 1. Payment Integration

Add a real payment flow with `Konnect` or `Stripe`:

- payment initiation from checkout
- webhook confirmation on backend
- reservation status update after successful payment
- payment failure and retry flow

Why it matters:
- turns booking into a true business flow
- reduces fake or abandoned reservations

### 2. Real-Time Table Availability

Add live table status updates with WebSockets:

- emit `table:reserved`, `table:released`, and hold events
- update immersive venue pages without refresh
- reduce double-booking confusion

Why it matters:
- stronger trust during reservation
- more premium booking experience

### 3. Reservation Hold Timer

Hold a selected table for a limited time:

- visible countdown in cart and checkout
- automatic release when timer expires
- highlight held tables differently from free and reserved ones

Why it matters:
- improves conversion
- protects inventory during checkout

### 4. Email Notification System

Improve operational emails:

- reservation confirmation email
- reminder email before visit
- cancellation confirmation
- review request after the reservation

Why it matters:
- better customer communication
- fewer missed reservations

### 5. Multi-Language Support

Support `French`, `Arabic`, and `English`:

- add translation system
- support RTL layout for Arabic
- translate public pages, auth pages, and booking UI

Why it matters:
- better fit for Tunisia
- bigger user reach

### 6. Venue Owner Portal

Add a role-specific dashboard for venue owners:

- manage only their own venue data
- review reservations in real time
- edit pricing, availability, and content
- export reservation history

Why it matters:
- scales the platform into a marketplace
- reduces admin bottlenecks

### 7. Interactive Map Discovery

Add a location-based browse experience:

- map of venues by city and area
- filter by type
- open venue details directly from map markers

Why it matters:
- better discovery UX
- helps users choose by proximity

### 8. Reviews and Social Trust

Strengthen the venue trust layer:

- verified review display
- rating distribution
- media/photo reviews later

Why it matters:
- improves booking confidence
- helps good venues stand out

### 9. Encoding and Content Polish

Clean text rendering and copy quality:

- fix broken accented text like `CafÃ©s`
- review French labels and consistency
- improve CTA wording

Why it matters:
- immediate visual polish
- better product quality perception

### 10. Stability and Test Coverage

Add more protection around critical flows:

- reservation conflict tests
- auth flow checks
- API error handling review
- stronger frontend empty and error states

Why it matters:
- lowers regression risk
- makes future work safer

### 11. Premium Profile Page Redesign

Enhance the user profile page with a premium account experience:

- redesign the profile header with avatar, account stats, and verification badges
- add richer account sections for personal info, security, notifications, and preferences
- improve editing flow and visual hierarchy to match the luxury dark-and-gold brand

Why it matters:
- makes the account area feel consistent with the rest of the product
- improves trust and perceived product quality

### 12. Better "Mes reservations" Experience

Upgrade the reservations page into a true account dashboard:

- add summary cards for upcoming, pending, completed, and cancelled bookings
- improve search, filters, and section clarity
- make reservation history easier to scan and manage

Why it matters:
- helps users understand their booking activity faster
- reduces friction after login

## Suggested Priority Order

1. Payment integration
2. Reservation hold timer
3. Real-time table availability
4. Email notifications
5. Encoding and content polish
6. Multi-language support
7. Venue owner portal
8. Interactive map
9. Reviews expansion
10. Broader testing and hardening
11. Premium profile page redesign
12. Better "Mes reservations" experience

## Quick Wins

- fix text encoding issues across public pages
- add CSV export for admin reservations
- add "recently viewed venues"
- improve skeleton loading consistency
- add opening hours and "open now" badges
- refine profile and reservations account surfaces

## Main Areas To Touch

- frontend app routes: `app/`
- shared UI: `components/`
- frontend API clients: `lib/api/`
- state stores: `stores/`
- backend routes: `backend/src/routes/`
- backend models and services: `backend/src/models/`, `backend/src/services/`
