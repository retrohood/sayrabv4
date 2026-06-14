# Sayrab - Fundraising & Merchandise Platform

A MERN stack platform for verified fundraising campaigns, donations, referral sharing, and branded merchandise.

## Tech Stack

- **MongoDB** - Database
- **Express.js** - REST API
- **React (Vite)** - Frontend
- **Node.js** - Runtime

## Features

- Public website with navigation: Home, Start a Campaign, Merchandise Store, Reviews, About Us, Login/Sign Up
- Featured campaigns carousel, search, filters, categories, active campaign grid, and emergency campaigns section
- Campaign cards with funding progress, timeline, donors, shares, and verification status
- Campaign detail page with story, progress, donation, share links, referral links, and leaderboard
- Donor/fundraiser auth today, with target customer/manager roles documented in the roadmap
- Temporary demo auth while MongoDB is not attached
- Campaign creation with verification workflow
- Donation system with simulated payment methods ready for gateway integration
- Referral/affiliate tracking for logged-in users
- Merchandise store with categories, search, and cart-ready UI
- Manager dashboard route at `/dashboard`
- Reviews page and About Us page

## Roadmap

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the planned customer app, campaign manager dashboard, backend APIs, database collections, AI design flow, Stripe payment flow, analytics, payouts, admin module, and manufacturing module.

## Extensible Modules

- **Admin** - `/api/admin/*` placeholder route exists for verification, emergency campaigns, and moderation
- **Payments** - Wire real payment gateways into the payment/order flow
- **Merchandise Checkout** - Complete order model, checkout, and tracking
- **AI Design Studio** - Add design generation and approval APIs
- **Analytics** - Add campaign traffic, conversion, revenue, and product performance reporting
- **File Uploads** - Identity docs and campaign evidence via multer

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

## Setup

```bash
# Install all dependencies
npm run install:all

# Copy environment file
cp backend/.env.example backend/.env

# Seed demo data when MongoDB is connected
npm run seed

# Run backend and frontend concurrently
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000

## Demo Accounts After Seed

| Role       | Email             | Password    |
|------------|-------------------|-------------|
| Fundraiser | ahmed@example.com | password123 |
| Donor      | sara@example.com  | password123 |

## Temporary Demo Login Without MongoDB

Until MongoDB is attached, the backend starts in demo mode and lets you log in with:

| Role | Email             | Password    |
|------|-------------------|-------------|
| Demo | demo@sayrab.local | password123 |

Sign up also works in demo mode, but those accounts are temporary and are not saved after refresh or server restart.

## Current Project Structure

```text
SayarbNewV4/
+-- backend/
|   +-- config/         # Database connection
|   +-- constants/      # Categories, statuses, roles
|   +-- controllers/    # Route handlers
|   +-- middleware/     # Auth and role guards
|   +-- models/         # Mongoose schemas
|   +-- routes/         # API routes
|   +-- seed/           # Demo data
|   +-- utils/          # Token and demo helpers
|   +-- server.js
+-- docs/
|   +-- ARCHITECTURE.md # Product architecture and phased roadmap
+-- frontend/
|   +-- public/         # sayrab.png logo
|   +-- src/
|       +-- api/        # Axios client
|       +-- components/ # UI components
|       +-- context/    # Auth context
|       +-- pages/      # Route pages
+-- sayrab.png
```

## Target Project Structure

The long-term split can become:

```text
sayrab/
+-- frontend/
|   +-- customer/
|   +-- manager-dashboard/
+-- backend/
    +-- models/
    +-- routes/
    +-- controllers/
    +-- middleware/
    +-- services/
```

For the MVP, keeping the current `frontend/` and `backend/` split is simpler.

## API Overview

| Endpoint | Description |
|----------|-------------|
| `GET /api/campaigns` | List active campaigns with search, filter, sort, and pagination |
| `GET /api/campaigns/featured` | Featured carousel campaigns |
| `GET /api/campaigns/emergency` | Admin-managed emergency campaigns |
| `GET /api/campaigns/:slug` | Campaign details |
| `POST /api/campaigns` | Create campaign as fundraiser/manager |
| `POST /api/donations` | Make a donation as guest or registered user |
| `GET /api/referrals/link/:campaignId` | Get referral/share link |
| `GET /api/products` | Merchandise catalog |
| `GET /api/reviews` | Published reviews |
| `GET /api/platform/about` | About page content and stats |
