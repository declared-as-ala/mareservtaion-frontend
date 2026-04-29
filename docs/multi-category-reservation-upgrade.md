# Multi-category reservation upgrade

## Roles
- `ADMIN`: global management.
- `ESTABLISHMENT_OWNER`: own-venue operations only.
- `CUSTOMER`: public reservation flow.

## Reservation matrix
- Cafe/Restaurant: reservable table logic.
- Hotel: reservable room logic.
- Cinema/Event: reservable place logic.

## Owner QR flow
- Admin scanner is disabled.
- Owner uses `/owner/scanner`.
- Backend checks reservation + ownership, then marks `checked_in`.
- Verification events are audit-logged as `RESERVATION_CHECKED_IN`.

## Ownership
- Venues now support `ownerId`.
- Admin can list owners and assign/remove owner from venue.

## Menu du jour
- Owner CRUD endpoints: `/api/v1/menu-du-jour/owner`.
- Public endpoint: `/api/v1/menu-du-jour/venue/:venueId/active`.
- Only cafe/restaurant venues are allowed.

## Seed credentials
- Admin: `admin@mareservation.tn / password123`
- Customer: `user@mareservation.tn / password123`
- Owner accounts are expected in big-bang seed refresh:
  - `owner.cafe@matable.tn`
  - `owner.restaurant@matable.tn`
  - `owner.hotel@matable.tn`

## Manual test checklist
- Login as owner and verify `/owner` access.
- Open `/owner/scanner` and validate a reservation QR.
- Confirm admin scanner shows disabled message.
- Assign owner to venue from admin API/UI and verify owner visibility.
- Create owner menu du jour and verify public active menu endpoint.
- Create reservation and check status/payment fields are preserved.
