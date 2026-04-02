# 🕌 Muslim Matrimony

A production-grade Muslim matrimonial platform built with a **decoupled NestJS backend** and **Next.js frontend**. Features a centralised Rule Engine for strict privacy, dynamic subscription packages with real-time discounting, photo moderation, match scoring, and a full admin panel.

---

## 🏗 Architecture

```
muslim-matrimony/
├── backend/        # NestJS + Prisma + PostgreSQL  (port 4000)
└── frontend/       # Next.js 15 App Router          (port 3000)
```

### Key Design Decisions
- **Rule Engine** — All visibility checks run in-memory after fetching; no DB-level filtering that could leak data
- **3-Layer Security** — Next.js middleware (server) + layout guards (client) + API `RolesGuard` (NestJS)
- **Multi-tenant profiles** — Each parent may manage multiple child profiles independently
- **State Machine** — `ChildProfile` follows `DRAFT → PAYMENT_PENDING → ACTIVE → EXPIRED`
- **Dynamic Packages** — Subscription plans are fully admin-configurable (price, duration, features, discounts)
- **Discount Stacking** — Site-wide discounts compound on top of per-package discounts (e.g. 30% + 20% = 44% effective)
- **Duration-aware Subscriptions** — Payment records store `durationDays`; admin approval activates the exact duration
- **Profile Auto-Expiry** — Daily cron sets expired subscriptions → `EXPIRED`; profiles immediately hidden
- **Atomic Transactions** — Payment approval atomically activates profile + creates correctly-dated subscription
- **Event-Driven** — `@nestjs/event-emitter` decouples side effects (email hooks, notifications)
- **Live Traffic** — WebSocket gateway broadcasts real-time visitor counts to the admin dashboard
- **Match Scoring** — Pure client-side algorithm scores compatibility (age, gender, country, city, height, education)

---

## ⚡ Quick Start — Docker (Recommended)

> Works identically on **macOS, Windows (WSL2), and Linux**. Only Docker Desktop required — no Node.js or PostgreSQL installation needed.

### 1 — Clone & configure

```bash
git clone https://github.com/orphiclab/muslim-matrimony-new.git
cd muslim-matrimony-new
```

Fill in your Cloudinary credentials in `backend/.env.docker`:

```env
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 2 — Start everything

```bash
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000       |
| Backend  | http://localhost:4000/api  |
| Database | localhost:5432             |

> Hot reload is enabled for both frontend and backend in dev mode.

### Stop

```bash
docker compose down          # stop containers
docker compose down -v       # stop + wipe database
```

---

## 🖥 Manual Setup (without Docker)

### Prerequisites
- Node.js ≥ 18
- PostgreSQL 16
- npm

### 1 — Backend

```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npx prisma db push          # apply schema
npm run start:dev            # starts on port 4000
```

**`backend/.env`**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/muslim_nikah"
JWT_SECRET="your-super-secret-key-minimum-32-chars"
PORT=4000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 2 — Frontend

```bash
cd frontend
cp .env.example .env.local  # fill in your values
npm install
npm run dev                  # starts on port 3000
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

---

## 🔑 Default Accounts

Register via the UI, then promote a user to ADMIN:

```bash
# Docker
docker compose exec db psql -U postgres muslim_nikah \
  -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your@email.com';"

# Local (no Docker)
docker exec -i muslim-nikah-db psql -U postgres muslim_nikah \
  -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

---

## 📱 Application Screens

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Login — auto-redirects by role |
| `/customer/register` | Public | Multi-step registration |
| `/packages` | Public | Dynamic pricing + discount banners |
| `/profiles` | Public | Browse active member profiles |
| `/profiles/[id]` | Public | Full public profile detail |
| `/select-plan` | PARENT | Plan selection + bank transfer |
| `/dashboard/parent` | PARENT | Overview + completeness widget |
| `/dashboard/profiles` | PARENT | Profile management |
| `/dashboard/members` | PARENT | Browse members + **match % score** |
| `/dashboard/members/[id]` | PARENT | Member detail + **match % badge** |
| `/dashboard/subscription` | PARENT | Subscription status + payment history |
| `/dashboard/chat` | PARENT | Messaging interface |
| `/dashboard/interests` | PARENT | Sent/received interest requests |
| `/dashboard/shortlists` | PARENT | Saved matches |
| `/dashboard/notifications` | PARENT | In-app notification centre |
| `/admin` | ADMIN | System stats + live visitor traffic |
| `/admin/payments` | ADMIN | Pending payment approval queue |
| `/admin/packages` | ADMIN | Package + discount management |
| `/admin/users` | ADMIN | User management |
| `/admin/profiles` | ADMIN | All profiles across the system |
| `/admin/analytics` | ADMIN | Engagement analytics + charts |
| `/admin/boosts` | ADMIN | Profile boost management |
| `/admin/photos` | ADMIN | Photo moderation queue |
| `/admin/reports` | ADMIN | **User report management** |

---

## 🔒 Security Architecture

Access control is enforced in **3 independent layers**:

```
Request → /admin/*
  │
  ├─ 1. Next.js middleware (server-side, before React loads)
  │       Reads mn_token + mn_user cookies → checks role
  │       PARENT → redirect /dashboard/parent
  │       Unauthenticated → redirect /login
  │
  ├─ 2. AdminLayout (client-side React)
  │       Reads localStorage → checks role
  │       Non-ADMIN → redirect /login
  │
  └─ 3. NestJS RolesGuard (API layer)
          JWT decoded → role checked
          Non-ADMIN → 403 Forbidden
```

Auth flow:
- Login sets `mn_token` and `mn_user` as **both** localStorage + cookies (middleware needs cookies)
- Logout clears **both** localStorage + cookies immediately

---

## 🎯 Match % Score

The member browse page automatically ranks profiles by compatibility and shows a colour-coded badge on every card and profile detail page.

**Scoring breakdown (max 100 pts):**

| Criteria | Points | Logic |
|----------|--------|-------|
| Age fit (both ways) | 30 | Candidate age ∈ viewer's preferred range + viewer age ∈ candidate's range |
| Opposite gender | 20 | `candidate.gender ≠ viewer.gender` |
| Country preference | 20 | `viewer.countryPreference === candidate.country` |
| Same city | 15 | Exact city match |
| Height fit | 10 | `candidate.height ≥ viewer.minHeightPreference` |
| Education match | 5 | Same education level |

**Labels:** `Excellent Match` (≥80) · `Good Match` (≥60) · `Possible Match` (≥40) · `Low Match` (<40)

---

## 💰 Package & Discount System

```
Original Price
  └─ Package Discount (%)  →  Package Price
       └─ Site-Wide Discount (%) applied on top  →  Final Price
```

**Example**: 30% package + 20% site = `1 - (0.7 × 0.8)` = **44% effective total**

API returns: `price`, `originalPrice`, `effectiveDiscountPct`, `pkgDiscountPct`, `siteDiscountPct`

---

## 🔌 API Reference

Base URL: `http://localhost:4000/api`

### Auth
```http
POST /auth/register        { email, password, phone? }
POST /auth/login           { email, password }
```

### Public (no auth)
```http
GET  /packages             Active packages with effective prices
GET  /settings             Site-wide discount settings
GET  /profiles/public      Browse active profiles (filter: gender, city, age, etc.)
GET  /profiles/public/:id  Full profile detail
```

### Profiles (PARENT)
```http
GET  /profile/my                    Bearer token — parent's profiles
POST /profile/create                Create new profile
PUT  /profile/update/:id            Update profile
DEL  /profile/:id                   Delete profile
GET  /profile/list/:viewerProfileId Visible profiles (Rule Engine applied)
```

### Interests & Connections
```http
POST /interest/send        { senderProfileId, receiverProfileId, message? }
POST /interest/withdraw    { senderProfileId, receiverProfileId }
GET  /interest/check       ?senderProfileId=&receiverProfileId=
GET  /interest/received/:profileId
GET  /interest/sent/:profileId
POST /interest/:id/accept
POST /interest/:id/decline
```

### Block & Report
```http
POST /block/block          { blockerProfileId, blockedProfileId }
POST /block/unblock        { blockerProfileId, blockedProfileId }
GET  /block/check          ?blockerProfileId=&blockedProfileId=
POST /block/report         { reporterProfileId, reportedProfileId, reason, details? }
```

### Payments
```http
POST /payment/initiate     { childProfileId, amount, method, packageId, packageDurationDays, bankRef? }
GET  /payment/my           Parent's payment history
```

### Admin
```http
GET  /admin/dashboard            System-wide stats
GET  /admin/payments             All payments (?status=PENDING)
POST /admin/payment/approve      { paymentId, adminNote? }
GET  /admin/users                All registered users
GET  /admin/profiles             All profiles (?status=ACTIVE)
GET  /admin/analytics            Engagement metrics
GET  /admin/packages             All packages
POST /admin/packages             Create package
PUT  /admin/packages/:id         Update package
DEL  /admin/packages/:id         Delete package
GET  /admin/settings             Site-wide discount config
PUT  /admin/settings             { siteDiscountPct, siteDiscountLabel, siteDiscountActive }
GET  /admin/boosts               Boosted profiles
PUT  /admin/boosts/:id/extend    { days }
DEL  /admin/boosts/:id           Remove boost
GET  /admin/photos               Photo moderation queue (?status=PENDING)
PUT  /admin/photos/:id/approve   Approve photo
PUT  /admin/photos/:id/reject    Reject photo
GET  /block/reports              All user reports (admin only)
PATCH /block/reports/:id         { status, adminNote? } — review/dismiss report
```

---

## 🗄 Database Schema

```
User              — id, email, password, phone, role (PARENT|ADMIN)
ChildProfile      — id, userId, name, gender, dateOfBirth, height, city, country,
                    education, occupation, civilStatus, ethnicity, aboutUs,
                    expectations, preferences, status, memberId, boostExpiresAt,
                    viewCount, isVerified
Subscription      — id, childProfileId, status, startDate, endDate, planName, planDurationDays
Payment           — id, userId, childProfileId, amount, method, status, purpose,
                    packageId, packageDurationDays, bankRef, bankSlipUrl, gatewayPayload
Package           — id, name, price, durationDays, features, discountPct, originalPrice
SiteSettings      — singleton: siteDiscountPct, siteDiscountLabel, siteDiscountActive
ChatMessage       — id, senderProfileId, receiverProfileId, content, readAt
Photo             — id, childProfileId, url, isPrimary, visibility, status (moderation)
PhotoAccessRequest— id, requesterProfileId, targetProfileId, status
Shortlist         — id, ownerProfileId, targetProfileId
InterestRequest   — id, senderProfileId, receiverProfileId, status, message
ProfileView       — id, viewerProfileId, targetProfileId, viewedAt
Notification      — id, userId, type, title, body, isRead, link
BlockedProfile    — id, blockerProfileId, blockedProfileId
Report            — id, reporterProfileId, reportedProfileId, reason, details, status, adminNote
```

> Run `npx prisma studio` from `backend/` for a GUI database browser.

---

## 🧩 Backend Modules

| Module | Responsibility |
|--------|---------------|
| `AuthModule` | JWT register/login, guards |
| `UserModule` | Account holder profile |
| `ProfileModule` | Child profile CRUD + state machine |
| `RuleEngine` | Centralised visibility logic |
| `SubscriptionModule` | Per-profile subscription management |
| `PaymentModule` | Initiate + verify payments |
| `ChatModule` | Send/receive/history messages |
| `AdminModule` | Stats, approval queue, packages, discounts |
| `PhotoModule` | Cloudinary upload + moderation |
| `InterestModule` | Interest requests + profile views |
| `NotificationModule` | In-app notifications |
| `BlockModule` | Block + report profiles |
| `TrafficModule` | WebSocket gateway — live visitor count |
| `SubscriptionCron` | Daily expiry checks |
| `AppEventListener` | Side-effect hooks (email/push placeholders) |

---

## 🚀 Production Checklist

- [ ] Replace `JWT_SECRET` with a strong secret (≥ 64 chars)
- [ ] Connect `AppEventListener` to SendGrid / Firebase for real notifications
- [ ] Integrate payment gateway (Stripe / PayHere) in `PaymentService.initiate()`
- [ ] Set `DATABASE_URL` to a managed PostgreSQL instance (RDS / Supabase)
- [ ] Enable HTTPS and update CORS origins in `main.ts`
- [ ] Add rate limiting (`@nestjs/throttler`) to auth routes
- [ ] Run `npx prisma migrate dev` to generate proper migration files for production
- [ ] Set up monitoring/alerting for the subscription expiry cron
- [ ] Set up a production secrets manager (avoid committing `.env`)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, CSS |
| Backend | NestJS 10, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | JWT (HS256, 7-day expiry) + cookie sync |
| Real-time | WebSockets (`@nestjs/websockets`, Socket.IO) |
| Scheduling | `@nestjs/schedule` (daily cron) |
| Events | `@nestjs/event-emitter` |
| Security | Helmet, class-validator, RolesGuard, Next.js middleware |
| Images | Cloudinary |
| Containers | Docker + Docker Compose |

---

## 📝 License

Private — Muslim Matrimony © 2026
