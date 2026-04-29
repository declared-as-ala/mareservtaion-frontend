# 🚀 Ma Reservation — Feature Ideas & Roadmap

> Premium immersive reservation platform — feature expansion ideas
> Generated: 2026-04-05

---

## 🏆 TIER 1 — High Impact, Core Experience

### 1. 🔔 Real-Time Table Availability (WebSockets)
**What:** Tables update their status live without page refresh.
When another user reserves a table, all viewers see it turn red instantly.
**Why:** Prevents double-booking frustration and creates urgency.
**How:**
- Backend: Socket.IO room per venue
- Emit `table:reserved`, `table:released` events
- Frontend: subscribe on venue page, update marker color live
- Show "X personnes regardent ce lieu" counter (social proof)

---

### 2. ⏱️ Temporary Hold / Countdown Timer
**What:** When a user clicks a table, it's "held" for 8 minutes.
A visible countdown appears: "Votre table est réservée pour 08:00".
If not confirmed, it releases automatically.
**Why:** Core e-commerce pattern (Ticketmaster, booking.com). Creates urgency.
**How:**
- Backend: `holdExpiresAt` field on Reservation (status: `held`)
- Cron job releases expired holds every 60s
- Frontend: countdown timer in cart / checkout
- Show held tables in orange color in 360° view

---

### 3. ⭐ Reviews & Ratings System
**What:** After a confirmed reservation, users can rate and review the venue.
Star rating (1–5) + written review + photo upload.
**Why:** Trust builder. Users won't book blindly.
**How:**
- `Review` model: userId, venueId, reservationId, rating, comment, photos[], verified
- Only verified reservations can leave reviews (no fake reviews)
- Admin moderation queue
- Venue page: rating breakdown, reviews list, "Laisser un avis" CTA post-visit
- Sort reviews: recent / most helpful / highest

---

### 4. 💳 Payment Integration (Konnect / Stripe)
**What:** Real payment flow at checkout.
**Why:** Without payment, it's just a booking tool not a business.
**Options:**
- **Konnect** (Tunisia local) — most relevant for Tunisian market
- **Stripe** (international)
- **Flouci** (mobile-first Tunisian)
**How:**
- Add `paymentProvider`, `paymentIntentId`, `paidAt` to Reservation
- Checkout → Payment page → Webhook confirms → Status updates
- Send confirmation email + PDF ticket

---

### 5. 📧 Email Notifications (Resend / Nodemailer)
**What:** Automated emails for key events.
**Emails to send:**
- Reservation confirmed → beautiful HTML email with QR code
- Reminder 24h before reservation
- Cancellation confirmation
- Review request 2h after visit end
- Welcome email on signup
**How:**
- Backend: Resend API or Nodemailer + queue (BullMQ)
- HTML templates (React Email recommended)
- Unsubscribe link in each email

---

### 6. 📱 QR Code Entry System
**What:** Each confirmed reservation generates a unique QR code.
Venue staff scan it at the door to validate the reservation.
**Why:** Professional, paperless, prevents fraud.
**How:**
- Generate QR on reservation confirmation (`qrcode` npm package)
- `/reservation/:id/confirmation` page shows QR
- Admin panel: `/admin/scanner` — camera-based QR scanner
- Validate: mark reservation as `checked_in`

---

## 🥈 TIER 2 — Strong UX Enhancers

### 7. 🗓️ Availability Calendar
**What:** Before entering the 360° view, user picks date/time from a calendar.
The 360° view then shows table status FOR that specific time slot.
**Why:** Context-aware availability. A table reserved for Saturday 8pm is still free Sunday 1pm.
**How:**
- Date/time picker before immersive view loads
- API: `GET /venues/:id/table-placements?startAt=&endAt=` (already exists!)
- Pre-filter what the user sees based on their intent
- Show "X tables disponibles ce soir" summary

---

### 8. 💬 AI Concierge / SOS Conseil (upgrade)
**What:** Upgrade the existing SOS Conseil into a real AI assistant.
Users describe what they want: "table romantique pour 2 vendredi soir à Tunis"
AI returns matching venues + available tables.
**Why:** Differentiator. No competitor has this.
**How:**
- Claude API (Anthropic) as backend
- System prompt: venue list + categories + user preferences
- Stream response to frontend
- Return structured venue recommendations with direct booking links
- Save conversation history per user

---

### 9. ❤️ Wishlist / Favorites
**What:** Heart button on venue cards and venue pages.
Saved to `/dashboard/favoris` page.
**Why:** Re-engagement, retention.
**How:**
- `Favorite` model: userId + venueId
- Toggle API: `POST/DELETE /api/v1/favorites/:venueId`
- Heart icon on VenueCard (filled if favorited)
- `/dashboard/favoris` page: grid of saved venues
- "Vous avez X lieux sauvegardés"

---

### 10. 👥 Group Booking
**What:** User can select multiple adjacent tables in the 360° view.
All added to cart as a "group booking" with a single checkout.
**Why:** Events, birthdays, corporate dinners — high value customers.
**How:**
- Allow multi-select in immersive view (shift+click or toggle mode)
- Cart groups them under one "reservation de groupe"
- Apply group discount if venue offers one
- One invoice for all tables

---

### 11. 🎁 Promo Codes & Vouchers
**What:** Discount codes entered at checkout.
**Types:**
- Percentage off (10% sur toute commande)
- Fixed amount (5 TND de réduction)
- Free item (une boisson offerte)
- Venue-specific codes
**How:**
- `PromoCode` model: code, type, value, maxUses, usedCount, expiresAt, venueId?
- Admin panel: create/manage codes
- Checkout: promo code input field
- Apply discount to order total

---

### 12. 📊 User Dashboard Enhancements
**What:** Richer `/dashboard` experience.
**Sections to add:**
- **Historique**: past reservations with venue photos, ratings
- **Upcoming**: countdown to next reservation
- **Statistiques**: "Vous avez réservé 12 fois", "Lieu préféré: Café X"
- **Points de fidélité**: loyalty points per reservation
- **Referral**: "Invitez un ami, gagnez 10 TND"

---

### 13. 🌐 Multi-Language Support (i18n)
**What:** French + Arabic (RTL) + English
**Why:** Tunisia is trilingual. RTL Arabic support = wider audience.
**How:**
- `next-intl` library
- Language switcher in Navbar
- RTL layout for Arabic (`dir="rtl"`)
- Translated venue descriptions (admin adds translations)

---

## 🥉 TIER 3 — Advanced / Business Features

### 14. 🏢 Venue Owner Dashboard (B2B)
**What:** Separate portal for venue owners/managers (not super-admin).
**Features:**
- See their venue's reservations in real time
- Table availability calendar view
- Revenue analytics: daily/weekly/monthly earnings
- Edit venue info, photos, menu
- Manage table prices and availability
- Export reservations as CSV/PDF
**How:**
- New role: `VENUE_OWNER`
- `venueId` tied to their account
- Separate route group: `(venue-owner)/`

---

### 15. 📸 360° View Builder (Admin)
**What:** Upgrade the admin table editor into a full scene builder.
**Features:**
- Upload multiple 360° images for different rooms/scenes
- Link scenes together (click a door → teleport to next room)
- Place not just tables but also: info hotspots, menus, wifi passwords
- Preview mode that mimics user experience
**How:**
- `Scene` model (already in CLAUDE.md spec)
- Scene transitions via marker type `"scene_link"`
- Admin: drag-and-drop scene ordering
- Photo Sphere Viewer: virtual tour mode

---

### 16. 🎬 Video Venue Previews
**What:** Short 15–30 second autoplay videos on venue cards (like Instagram Reels).
Hover on a card → video plays.
**Why:** Dramatically increases conversion vs static photos.
**How:**
- `videoPreviewUrl` field on Venue
- HTML5 `<video autoPlay muted loop>` on hover
- Admin uploads video (or enters YouTube/Vimeo URL)
- Lazy load, only play when in viewport

---

### 17. 🔁 Recurring Reservations
**What:** "Reserve this table every Friday at 8pm" option.
**Why:** High-value loyal customers. Venue gets guaranteed revenue.
**How:**
- Recurring checkbox at checkout
- Frequency: weekly / biweekly / monthly
- Create all reservations upfront or via cron
- User can cancel recurring series

---

### 18. 📍 Interactive Venue Map
**What:** Full-page map showing all venues by city/governorate.
Click venue pin → popup with photo, rating, quick booking.
**Why:** Discovery. Users browse geographically.
**How:**
- Mapbox GL JS or Leaflet
- `latitude` + `longitude` fields on Venue
- Cluster markers when zoomed out
- Filter by type (café, restaurant, hotel) on the map
- "Autour de moi" — use browser geolocation

---

### 19. 🏷️ Flash Deals & Last-Minute Offers
**What:** Venues can post time-limited deals.
"Table pour 2 à 20 TND au lieu de 35 TND — expire dans 2h"
**Why:** Fill empty seats last-minute. Drives urgency.
**How:**
- `Deal` model: venueId, tableId, originalPrice, dealPrice, expiresAt, slots
- Homepage: "Offres du moment" section with countdown timers
- Push notification when near a venue with a deal
- Admin: quick deal creation wizard

---

### 20. 🔔 Push Notifications (PWA)
**What:** Web push notifications for:
- Reservation reminder (24h + 2h before)
- Flash deal nearby
- "Your table hold expires in 2 minutes"
- Review request after visit
**Why:** Re-engagement without email.
**How:**
- Make app a PWA (`next-pwa`)
- Web Push API + service worker
- `PushSubscription` model: userId + endpoint + keys
- Backend: `web-push` npm package

---

## 💡 QUICK WINS (1–2 days each)

| Feature | Description | Impact |
|---------|-------------|--------|
| **Share venue** | Share button → copy link or native share API | Medium |
| **Recently viewed** | "Vous avez récemment visité" section on homepage | Medium |
| **Table pre-selection URL** | `/lieu/slug?table=id` opens modal directly | High |
| **Venue hours** | Opening hours per day, "Ouvert maintenant" badge | Medium |
| **Min/Max party size** | Filter venues by capacity needed | High |
| **Admin bulk actions** | Select multiple venues → bulk publish/unpublish | Medium |
| **Skeleton loaders** | Replace spinners with content-shaped skeletons | Medium |
| **Dark mode default** | Save theme preference in localStorage | Low |
| **Social login** | Google OAuth → faster onboarding | High |
| **CSV export** | Admin exports all reservations as CSV | Medium |

---

## 🎯 Recommended Priority Order

```
Phase 1 (Now):
  ✅ Cart + Checkout (done)
  → Temporary hold timer
  → Real-time WebSocket availability
  → Email confirmations

Phase 2 (Next):
  → Payment (Konnect)
  → Reviews & Ratings
  → QR Code entry
  → Favorites / Wishlist

Phase 3 (Growth):
  → AI Concierge upgrade
  → Venue Owner Dashboard
  → Interactive Map
  → Flash Deals

Phase 4 (Scale):
  → PWA + Push Notifications
  → Multi-language (AR/EN)
  → Recurring reservations
  → 360° Scene Builder
```

---

## 🛠️ Tech Stack Extensions Needed

| Feature | New Tech |
|---------|----------|
| Real-time | Socket.IO |
| Emails | Resend + React Email |
| Payments | Konnect API / Stripe |
| AI Concierge | Anthropic Claude API |
| Map | Mapbox GL JS |
| Push | web-push + PWA |
| QR Code | qrcode npm |
| Job Queue | BullMQ + Redis |
| i18n | next-intl |

---

*Ma Reservation — See · Click · Reserve*
