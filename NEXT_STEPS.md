# 📋 NEXT STEPS — Ma Reservation

> Living document — updated as features are built.
> Last updated: 2026-04-05

---

## ✅ DONE

### Core Platform
- [x] Next.js frontend (App Router) + Express backend
- [x] JWT auth with silent refresh (httpOnly cookie)
- [x] Venue listing, detail, 360° immersive view
- [x] Table placement system (yaw/pitch coordinates)
- [x] Admin table editor (place markers in 360° view)
- [x] Admin venue management (create, edit, publish)

### Cart & Checkout (Session 2)
- [x] Cart store (Zustand persist) — `stores/cart.ts`
- [x] Cart drawer — premium dark/gold UI — `CartDrawer.tsx`
- [x] `/panier` cart page — dark premium redesign
- [x] `/checkout` page — form + per-item summary + "Confirmer et payer"
- [x] CartDrawer auto-opens when item added to cart
- [x] Same table can be added multiple times (unique random id per add)
- [x] `tableId` + `endAt` passed from modal → cart → checkout → createReservation

### Sponsored / Banner System
- [x] `isSponsored`, `sponsoredOrder`, `bannerImage` on Venue model
- [x] Admin sponsored page with inline expand panel
- [x] `GET /venues?isSponsored=true` filter working

### Features (Session 3 — Current)
- [x] **Favorites / Wishlist**
  - [x] Backend: `Favorite` model + toggle/list routes
  - [x] Frontend: `FavoriteButton` component (heart, optimistic toggle)
  - [x] Frontend: Heart added to every `VenueCard`
  - [x] Frontend: `/dashboard/favorites` page fully implemented
- [x] **Reviews & Ratings**
  - [x] Backend: `Review` model + create/list/delete routes
  - [x] Backend: auto-updates venue `rating` field on review submit
  - [x] Frontend: `ReviewForm` with star picker embedded in confirmation page
  - [x] `isVerified` flag set if review comes from confirmed reservation
- [x] **QR Code Entry**
  - [x] Backend already generates `qrCodeData` + `qrCodeImageUrl` on reservation create
  - [x] Frontend: confirmation page shows QR image (or text code fallback)
  - [x] Backend: `GET /reservations/scan?code=` — look up by code
  - [x] Backend: `PATCH /reservations/:id/checkin` — mark as checked_in
  - [x] Frontend: `/admin/scanner` — camera QR scan + manual code entry
- [x] **360° Scene Builder**
  - [x] Backend: `Scene` model (venueId, name, image, order, isActive)
  - [x] Backend: full CRUD routes + reorder endpoint
  - [x] Frontend: `/admin/scenes` — select venue → manage scenes → preview image
  - [x] Frontend: create/edit/delete scenes with image preview

---

## ✅ COMPLETED THIS SESSION (in-progress items)

### Reviews display on venue page
- [x] `ReviewsSection` component — star summary bar, per-rating distribution, verified badge
- [x] "Avis" tab added to `/lieu/[slug]` venue detail page
- [x] Paginated reviews with "Charger plus" button
- [x] Empty state with CTA

### Scene switching in 360° viewer
- [x] `PanoramaEngine` — added `scenes[]`, `activeSceneId`, `onSceneChange` props
- [x] Scene pill navigation strip rendered inside viewer (bottom-center)
- [x] Table placements filtered by `sceneId` on venue page
- [x] Admin table editor — scene selector pill bar above panorama
- [x] "Gérer les scènes" link from editor → `/admin/scenes`
- [x] `createAdminTablePlacement` uses selected scene id instead of hardcoded `'default'`

### Admin sidebar links
- [x] "Scènes 360°" → `/admin/scenes` added to Contenu group
- [x] "Scanner QR" → `/admin/scanner` added to Conciergerie group

---

## ⏳ TODO — NEXT PRIORITIES

### 1. 🔔 Real-Time Table Availability (WebSockets)
- Socket.IO on backend
- Emit `table:reserved` / `table:released` on reservation create/cancel
- Frontend: subscribe on venue page, update markers live
- Show "X personnes regardent ce lieu" counter

### 2. ⏱️ Reservation Hold Timer
- `ReservationHold` model already exists
- Frontend: 8-min countdown in cart/checkout header
- "Votre table est réservée pour 08:00 — payez avant expiration"
- Backend cron: release expired holds

### 3. 💳 Payment Integration (Konnect)
- Konnect API keys in `.env`
- `POST /api/v1/payments/initiate` → returns payment URL
- Webhook `POST /api/v1/payments/webhook` → confirm reservation
- Checkout redirect to Konnect → return to `/reservation/:id/confirmation`

### 4. 📧 Email Notifications
- Resend or Nodemailer
- Templates: confirmation + QR, reminder 24h, cancellation
- Backend: trigger after reservation create/cancel
- Queue with BullMQ (optional)

### 5. 🗓️ Availability Calendar on Venue Page
- Date/time picker before entering 360° view
- Passes `startAt`/`endAt` to table-placements API
- Filter shows accurate per-slot availability

### 6. 💬 AI Concierge (upgrade SOS Conseil)
- Claude API streaming
- User describes: "table pour 2 vendredi soir Tunis"
- Returns top 3 matching venues with direct booking links
- Save conversation history per user

### 7. 📊 Venue Reviews displayed on venue page
- `ReviewsSection` component
- Star breakdown bars
- Paginated review list

### 8. 🌐 Multi-Language (FR / AR / EN)
- `next-intl`
- RTL layout for Arabic
- Language switcher in Navbar

---

## 💡 QUICK WINS (< 1 day each)

| # | Feature | Status |
|---|---------|--------|
| 1 | Admin sidebar: Scanner + Scenes links | ⏳ |
| 2 | Reviews section on `/lieu/[slug]` | ⏳ |
| 3 | Scene switching in PanoramaEngine | ⏳ |
| 4 | "Voir le lieu" → `/?table=id` URL pre-selects table | ⏳ |
| 5 | Venue hours (opening times per day) | ⏳ |
| 6 | Skeleton loaders everywhere | ⏳ |
| 7 | CSV export for admin reservations | ⏳ |
| 8 | Google OAuth social login | ⏳ |
| 9 | Venue page: avg rating + star display | ⏳ |
| 10 | "Recently viewed" venues on homepage | ⏳ |

---

## 🏗️ TECH DEBT / IMPROVEMENTS

- [ ] Backend TypeScript strict mode — remove `any` casts
- [ ] Frontend: replace all `unknown` casts in API types
- [ ] Unit tests for reservation conflict logic
- [ ] Admin dashboard stats (reservations/day chart)
- [ ] Image optimization — convert to WebP on upload
- [ ] Rate limiting per user (not just global)

---

## 📁 NEW FILES CREATED THIS SESSION

### Backend
- `backend/src/models/Favorite.ts`
- `backend/src/models/Review.ts`
- `backend/src/models/Scene.ts`
- `backend/src/routes/favorites.ts`
- `backend/src/routes/reviews.ts`
- `backend/src/routes/scenes.ts`

### Frontend
- `frontend/lib/api/favorites.ts`
- `frontend/lib/api/reviews.ts`
- `frontend/lib/api/scenes.ts`
- `frontend/components/shared/FavoriteButton.tsx`
- `frontend/app/(admin)/admin/scanner/page.tsx`
- `frontend/app/(admin)/admin/scenes/page.tsx`

### Modified
- `frontend/stores/cart.ts` — `drawerOpen`, `openDrawer`, `closeDrawer`, `tableId`, `endAt`
- `frontend/components/layout/CartDrawer.tsx` — premium redesign + correct CTAs
- `frontend/components/layout/Navbar.tsx` — cart state from store
- `frontend/components/cards/VenueCard.tsx` — FavoriteButton added
- `frontend/components/reservation/TableReservationModal.tsx` — auto-open drawer, unique ids, tableId/endAt
- `frontend/app/(public)/panier/page.tsx` — dark/gold redesign
- `frontend/app/(public)/checkout/page.tsx` — NEW
- `frontend/app/(public)/reservation/[id]/confirmation/page.tsx` — QR code + review form
- `frontend/app/(dashboard)/dashboard/favorites/page.tsx` — full implementation
- `frontend/lib/api/types.ts` — Review, Scene types; qrCodeImageUrl on Reservation
- `backend/src/routes/reservations.ts` — /scan + /checkin endpoints
- `backend/src/app.ts` — register favorites, reviews, scenes routers
