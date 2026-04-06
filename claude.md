# 🧠 CLAUDE CONTEXT — Ma Reservation

## 📌 Project Name
Ma Reservation

---

## 🎯 Project Vision

Ma Reservation is a **premium reservation platform** that allows users to:

- Reserve tables in cafés and restaurants
- Reserve hotel rooms
- Reserve cinema/event seats

The core innovation is:

👉 Users explore places using **immersive 360° views or virtual tours**  
👉 Then **select a table/seat directly inside the view**  
👉 Then **reserve and pay**

---

## 🧠 Core Concept

This is NOT a basic booking platform.

This is:

👉 **Immersive Reservation System**

Flow:

1. Discover venue  
2. Enter immersive view (360° or virtual tour)  
3. See real tables with status  
4. Click table  
5. Add to cart  
6. Reserve / pay  

---

## 🏗️ Tech Stack

### Frontend (`/frontend` folder)
- Next.js (App Router)
- Tailwind CSS
- shadcn/ui
- Dark premium UI

### Backend (`/backend` folder)
- Node.js (Express)
- MongoDB Atlas

### Deployment
- Vercel

---

## 📦 Core Features

### 👤 User Side

- Browse venues:
  - Cafés
  - Restaurants
  - Hotels
  - Cinema
  - Events

- View venue details
- Open immersive view directly
- See tables with status:
  - Disponible
  - Réservée
- Click table
- Open modal
- Add to cart
- Checkout / reservation

---

### 🛠️ Admin Side

Admin can manage:

- Venues
- Tables
- Virtual tours / 360 media
- Reservations
- Sliders

---

## 🎥 Immersive System

### 1. 360° View (Custom)

- Format: **equirectangular JPG (2:1)**
- Loaded using 360 viewer (Photo Sphere Viewer or Pannellum)
- Supports:
  - rotation
  - yaw/pitch coordinates
  - marker placement

👉 Used for:
- table placement
- accurate coordinate system

---

### 2. Virtual Tour (Matterport / Klapty)

- External URL (iframe embed)
- Multi-scene navigation (rooms)

⚠️ Limitations:
- Cannot easily control markers without SDK
- For now:
  - embed for viewing
  - full control only on custom 360

---

## 📍 Table System

### Tables are NOT just markers

They are real database entities.

```ts
Table {
  _id
  venueId
  sceneId
  name
  capacity
  price
  status // available | reserved | blocked
  isActive
}
```

### 📍 Table Placement
```ts
TablePlacement {
  _id
  tableId
  venueId
  sceneId
  yaw
  pitch
}
```

Important rules:
- coordinates are tied to a scene
- markers must stay fixed when rotating
- markers must NOT drift

### 🧩 Scene System (for future)
```ts
Scene {
  _id
  venueId
  name
  image
}
```

Each room = one scene

### 🛒 Reservation System
```ts
Reservation {
  _id
  userId
  venueId
  tableId
  status // pending | confirmed | cancelled
  paymentStatus
  expiresAt
}
```

### ⏳ Reservation Logic
- user clicks table → NOT immediately reserved
- create temporary hold
- expires if not paid
- confirmed after payment

### 🧠 UX Rules (VERY IMPORTANT)

#### Venue Page
❌ DO NOT show preview first
✅ MUST open immersive view directly

#### Table Visualization
Markers must show:
- Disponible → green
- Réservée → red
- Disabled if unavailable

#### Interaction
When clicking table:
→ open modal
→ show details
→ add to cart

### 🧠 Critical Problems to Avoid
❌ Static image instead of real 360 viewer
❌ Markers moving when camera moves
❌ Tables not synced between admin and client
❌ Using fake data
❌ Losing auth state
❌ Token expiring too fast

### 🔐 Auth System
Expected behavior:
- Logged user → show profile dropdown
- Not logged → show "Connexion"
- Session persists after refresh
- Admin session stable (no rapid expiration)

### 🧠 Admin Table Editor

#### Workflow
1. Admin selects venue
2. Loads immersive media
3. Clicks inside 360 view
4. Gets yaw/pitch
5. Creates table
6. Saves in DB
7. Marker appears

#### Modes
- Navigation mode (move freely)
- Placement mode (click to add)
- Move mode (drag marker)

### 🎯 Final User Experience
- User logs in
- Opens venue
- Sees immersive view immediately
- Sees tables with real status
- Clicks available table
- Opens modal
- Adds to cart
- Completes reservation

### 🚀 Development Strategy

#### Phase 1 (current)
- 360 view working
- table placement working
- markers stable
- admin editor functional

#### Phase 2
- client rendering
- reservation modal
- cart system

#### Phase 3
- multi-scene tours
- advanced navigation

### 💎 Design Direction
- Inspired by teskerti.tn
- Dark UI
- Gold accents
- Premium feel
- Clean UX

### 🧠 Key Principle
👉 The immersive view is the core of the app
👉 Everything revolves around it

### ⚠️ Golden Rules
- Always use real DB data
- Always keep markers tied to coordinates
- Never break immersive interaction
- Never fake table data
- Keep UX smooth and direct

### 🧠 Summary
Ma Reservation is:
👉 A visual reservation system
👉 Not a form-based booking app

Users should:
👉 SEE → CLICK → RESERVE

Not:
👉 search → fill form → guess

🔥 Important
If something is unclear:
👉 prioritize:
- immersive experience
- table accuracy
- real-time reservation logic
