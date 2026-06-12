# Sayrab — Fundraising & Merchandise Platform

A MERN stack platform for verified fundraising campaigns, donations, referral sharing, and branded merchandise.

## Tech Stack

- **MongoDB** — Database
- **Express.js** — REST API
- **React (Vite)** — Frontend
- **Node.js** — Runtime

## Features (User Module)

- Public website with navigation (Home, Start a Campaign, Merchandise Store, Reviews, About Us, Login/Sign Up)
- Featured campaigns carousel, search/filters/categories, active campaigns grid (5×3 desktop), emergency campaigns section
- Campaign cards with funding progress, timeline, donors, shares, verification status
- Campaign detail page with story, progress, donation, share & referral links, leaderboard
- Donor & fundraiser registration with JWT auth
- Campaign creation with verification workflow (pending → not publicly visible until admin verifies)
- Donation system (card, QR, Easypaisa, JazzCash — simulated payments ready for gateway integration)
- Referral/affiliate tracking for logged-in users
- Merchandise store with categories, search, cart (checkout module extensible)
- Reviews page (moderated campaign creator reviews)
- About Us with mission, how it works, core values, impact statistics

## Extensible Modules (Planned)

- **Admin** — `/api/admin/*` placeholder route exists for verification, emergency campaigns, moderation
- **Payments** — Wire real payment gateways into `donationController`
- **Merchandise Checkout** — Order model & tracking
- **File Uploads** — Identity docs & campaign evidence via multer

## Prerequisites

- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

## Setup

```bash
# Install all dependencies
npm run install:all

# Copy environment file
cp backend/.env.example backend/.env

# Seed demo data (requires MongoDB)
npm run seed

# Run backend + frontend concurrently
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000

## Demo Accounts (after seed)

| Role       | Email             | Password    |
|------------|-------------------|-------------|
| Fundraiser | ahmed@example.com | password123 |
| Donor      | sara@example.com  | password123 |

## Project Structure

```
SayarbNewV4/
├── backend/
│   ├── config/         # Database connection
│   ├── constants/      # Categories, statuses, roles
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth & role guards
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes (incl. admin placeholder)
│   ├── seed/           # Demo data
│   └── server.js
├── frontend/
│   ├── public/         # sayrab.png logo
│   └── src/
│       ├── api/        # Axios client
│       ├── components/ # UI components
│       ├── context/    # Auth context
│       └── pages/      # Route pages
└── sayrab.png
```

## API Overview

| Endpoint | Description |
|----------|-------------|
| `GET /api/campaigns` | List active campaigns (search, filter, sort, paginate) |
| `GET /api/campaigns/featured` | Featured carousel campaigns |
| `GET /api/campaigns/emergency` | Admin-managed emergency campaigns |
| `GET /api/campaigns/:slug` | Campaign details |
| `POST /api/campaigns` | Create campaign (fundraiser, pending verification) |
| `POST /api/donations` | Make a donation (guest or registered) |
| `GET /api/referrals/link/:campaignId` | Get referral/share link |
| `GET /api/products` | Merchandise catalog |
| `GET /api/reviews` | Published reviews |
| `GET /api/platform/about` | About page content & stats |
