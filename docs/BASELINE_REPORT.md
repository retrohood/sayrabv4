# Sayrab Project Baseline Architecture & Integration Report

**Date:** November 15, 2026  
**Environment:** Windows (PowerShell / cmd.exe)  
**Git Branch:** `Testing-1` (HEAD: `e4e231d`)  
**Scope:** Repository Inspection and Pre-Redesign Baseline  

---

## 1. Existing Architecture & Tech Stack

Sayrab is a full-stack integrated fundraising and branded merchandise platform built on the MERN stack with dedicated operational modules for Donors/Fundraisers, Admins, and Manufacturers.

### Frontend
- **Framework:** React 19 (`^19.2.6`), React DOM (`^19.2.6`)
- **Bundler / Tooling:** Vite (`^8.0.12`), `@vitejs/plugin-react` (`^6.0.1`)
- **Routing:** React Router DOM v7 (`^7.17.0`)
- **Styling System:** Tailwind CSS v4 (`^4.3.1`) with `@tailwindcss/vite` and CSS custom variables defined in `src/index.css`.
- **Icons & UI Utilities:** Lucide React (`^1.18.0`), Axios (`^1.17.0`)

### Backend
- **Framework:** Node.js v24 (ES modules), Express.js (`^4.21.2`)
- **Database & ORM:** MongoDB via Mongoose (`^8.9.5`). Includes automated fallback to in-memory demo authentication mode (`backend/utils/demoAuth.js`) when MongoDB connection is unavailable.
- **Authentication:** JSON Web Tokens (`jsonwebtoken` `^9.0.2`), `bcryptjs` (`^2.4.3`), and Google OAuth 2.0.
- **File Uploads:** Multer (`^1.4.5-lts.1`) for document verification, proof of need, and tech pack assets.
- **Validation:** `express-validator` (`^7.2.1`).

---

## 2. Operational Modules & Dashboard Architecture

Sayrab consists of three primary operational modules and a public-facing web presence:

### Module 1: Public Website
- **Pages:**
  - `/` — Home (Featured campaigns carousel, category search & filters, active campaigns, emergency campaigns relief).
  - `/campaigns` — Campaign directory.
  - `/campaigns/:slug` & `/campaign/:slug` — Campaign details, narrative, funding progress, donor leaderboard, share links.
  - `/auth` — Multi-step registration & login with role selection and validation.
  - `/start-campaign` — Fundraiser onboarding gateway.
  - `/create-campaign` — Campaign creation wizard with verification upload (protected for fundraisers).
  - `/store` — Branded merchandise store with product categories and search.
  - `/product/:id` — Product details and variant selection.
  - `/cart` — Shopping cart with local storage persistence.
  - `/checkout` — Merchandise order checkout.
  - `/order/:id` — Real-time order tracking.
  - `/reviews` — Verified community reviews and feedback.
  - `/about` — About Us, platform mission, transparency commitment, and impact statistics.
  - `/instant-quotation` & `/quotation` — Garment instant quotation workspace with dual-engine costing.

### Module 2: User Module (Fundraisers & Donors)
Accessed via `/dashboard/*` in `frontend/src/pages/Dashboard.jsx`:
- **Fundraiser Views:**
  - `overview` — Aggregate statistics (total funds raised, active campaigns, products sold, uploads), activity feed.
  - `campaigns` — Campaign lifecycle management (active, under review, completed, withdrawal initiation).
  - `new_campaign` / `fundraising` — Interactive campaign submission form with document uploads.
  - `bulk_quotation_orders` — Bulk manufacturing orders and quote management.
  - `fundraiser_orders` — Merchandise sales and orders tracking.
  - `payouts` — Fund withdrawal requests, banking details, and payout history.
  - `settings` — Profile, security, CNIC/contact details, and notification preferences.
- **Donor Views:**
  - `donor_donations` — Personal contribution history, receipts, and campaign impact updates.
  - `buyer_cart` — Saved merchandise and cart items.
  - `buyer_tracking` — Live merchandise shipment status.
  - `settings` — Profile and account security.

### Module 3: Admin Module
Accessed via `/admin/*` in `frontend/src/pages/admin/AdminPortal.jsx`:
- **Navigation & Views:**
  - `DashboardView` — Platform metrics, emergency alerts, high-level operational statistics.
  - `CampaignsView` — Campaign verification approval, review, and emergency status toggling.
  - `OrganizationsView` — NGO and fundraiser organization verification.
  - `UsersView` — User role management, account status, and permissions.
  - `OrdersView` — Platform-wide merchandise orders.
  - `ManufacturersView` — Manufacturer onboarding, verification, and performance.
  - `TransactionsView` — Audit log of all donation and order payments.
  - `PayoutsView` — Review, approval, and scheduling of withdrawal requests.
  - `ReportsView` — Financial and compliance reports.
  - `SettingsView` — Platform fee configurations and operational controls.
  - `NotificationsView` — System alerts and broadcast notices.

### Module 4: Manufacturer Module
Accessed via `/manufacturer/*` in `frontend/src/pages/manufacturer/ManufacturerPortal.jsx`:
- **Navigation & Views:**
  - `DashboardView` — Factory throughput, active orders, production metrics.
  - `TechpacksView` — Apparel specifications and tech pack review.
  - `QuotationsView` — Custom cost estimation, milestone quotes, and proposal negotiations.
  - `SampleProductionView` — Prototyping and sample status tracking.
  - `BulkProductionView` — Assembly line status, batching, and QC checks.
  - `ProductionOrdersView` — Purchase order handling.
  - `ShippingView` — Dispatch, courier integration, and tracking numbers.
  - `PaymentsView` — Milestone payment disbursements and receivables.
  - `ReportsView` — Production analytics.
  - `ProfileView` — Factory certifications and capabilities.
  - `NotificationsView` — Manufacturing updates and quotation communications.

---

## 3. Shared UI Components

Located in `frontend/src/components/`:
- `Layout.jsx` — Root container rendering Navbar, dynamic page view, and Footer.
- `Navbar.jsx` — Top navigation with brand logo, public links, dynamic portal shortcuts, and user profile menu.
- `Footer.jsx` — Platform footer with quick links, core values, and copyright information.
- `CampaignCard.jsx` — Standardized campaign card showcasing category badge, title, progress bar, funds raised, and verification status.
- `CampaignCarousel.jsx` — Hero carousel for featured campaigns.
- `SearchFilters.jsx` — Category filter pills and sorting dropdown.
- `DonationModal.jsx` — Modal for direct donations supporting multiple payment methods.
- `ProtectedRoute.jsx` — Role-based route guard redirecting unauthorized access.
- `FundraiserBulkOrdersView.jsx` — Bulk order list and tracking widget.
- `FundraiserProposalModal.jsx` — Modal for reviewing and accepting manufacturer quotes.
- `QuotationChatModal.jsx` — Real-time quotation negotiation message thread between fundraiser/admin and manufacturer.

---

## 4. Backend Route Map & API Endpoints

Mounted in `backend/server.js`:
| Route Base | Controller / Module | Key Functions |
|---|---|---|
| `/api/auth` | `authRoutes.js` | User registration, login, profile, password, role upgrade, Google OAuth |
| `/api/campaigns` | `campaignRoutes.js` | Campaign CRUD, featured campaigns, emergency campaigns, slug lookup |
| `/api/donations` | `donationRoutes.js` | Donation creation, history, campaign donor leaderboards |
| `/api/orders` | `orderRoutes.js` | Merchandise orders, tracking, status transitions |
| `/api/payment` | `paymentRoutes.js` | Payment processing, verification, and payment gateway webhooks |
| `/api/referrals` | `referralRoutes.js` | Referral link generation and attribution tracking |
| `/api/products` | `productRoutes.js` | Merchandise catalog, product creation, and inventory |
| `/api/designs` | `designRoutes.js` | AI mockup generation, design draft approval |
| `/api/analytics` | `analyticsRoutes.js` | Dashboard telemetry, revenue tracking, campaign metrics |
| `/api/reviews` | `reviewRoutes.js` | Platform review submission and retrieval |
| `/api/platform` | `platformRoutes.js` | Platform statistics (`/stats`) and About Us data (`/about`) |
| `/api/admin` | `adminRoutes.js` | Verification, user moderation, payouts, settings, emergency status |
| `/api/manufacturer`| `manufacturerRoutes.js` | Tech pack proposals, sample orders, production oversight |
| `/api/manufacturing` | `manufacturingRoutes.js` | Additional manufacturing data endpoints |
| `/api/stores` | `storeRoutes.js` | Fundraiser store setup and branded merchandise |
| `/api/withdrawals` | `withdrawalRoutes.js` | Campaign fund withdrawal requests |
| `/api/payouts` | `payoutRoutes.js` | Payout processing and record management |
| `/api/uploads` | `uploadRoutes.js` | Multer file uploads for identity docs and assets |
| `/api/quotations` | `quotationRoutes.js` | Instant quotation costing engine v1.0, tech pack extraction |
| `/webhook` | `webhookRoutes.js` | External payment webhook ingestion |

---

## 5. Financial & Revenue-Sharing Logic

Defined in `backend/constants/index.js`:
```javascript
export const REVENUE_SPLIT = {
  ORGANIZATION: 0.50,   // 50% to Fundraiser Organization
  SAYRAB: 0.05,         // 5% to Sayrab Platform
  MANUFACTURER: 0.45,   // 45% to Manufacturer
};
```
- **Eligible Merchandise:** Revenue from merchandise sales follows the 50% / 45% / 5% rule.
- **Ordinary Campaign Donations:** 100% of campaign donations are allocated directly to the verified campaign fund (minus standard third-party payment gateway transaction fees).
- **Frontend Guardrail:** Financial figures are strictly consumed from backend API calculations; no frontend hardcoding or client-side recalculation is permitted.

---

## 6. Baseline Build & Test Execution Results

| Command | Target | Execution Result | Notes |
|---|---|---|---|
| `cmd.exe /c "npm --prefix frontend run build"` | Frontend Vite Build | **PASS** (Zero errors, built in 1.64s) | Output files generated in `frontend/dist/`. |
| `cmd.exe /c "npm --prefix frontend run lint"` | ESLint Frontend | **FAIL** (263 errors, 3 warnings) | Pre-existing unused variables (`no-unused-vars`) and `react-hooks/set-state-in-effect` in existing codebase. |
| Automated Unit/Integration Tests | Test Runner | **NOT CONFIGURED** | No test runner (Jest/Vitest/Mocha) is configured in `package.json`. No test scripts exist in `backend/package.json` or root `package.json`. |
| Reference Calculator (`docs/reference_calculator.mjs`) | Offline Spec | **COULD NOT RUN** | Contains hardcoded external path references (`/mnt/user-data/...`). |

---

## 7. Git State

- **Active Branch:** `Testing-1`
- **Head Commit:** `e4e231d` (*"feat: add fundraiser bulk orders view, quotation milestone release, and database auto-reconnect"*)
- **Working Tree:** Clean prior to the addition of `AGENTS.md` and this baseline report.
- **Git Binary Location:** `C:\Program Files\Git\cmd\git.exe`

---

## 8. Potential Integration Risks & Safeguards

1. **Massive File State in `Dashboard.jsx` (5,875 lines):**
   - *Risk:* Accidental mutation of tabs or handler logic when adjusting styling.
   - *Safeguard:* Strict isolation of public pages vs dashboard components. Dashboard navigation structures must remain untouched.
2. **Tailwind v4 Theme Coexistence:**
   - *Risk:* Public redesign introduces light theme palette (`#89ca2e`, `#367c35`, `#f7f9f5`, `#10182b`) which must coexist with dark-themed portals (e.g. Manufacturer portal).
   - *Safeguard:* Scope brand design classes carefully to public website wrappers without overriding global body defaults inappropriately or breaking existing portal sidebars.
3. **Demo Mode vs MongoDB:**
   - *Risk:* Breaking authentication fallback when inspecting or adjusting API calls.
   - *Safeguard:* Retain `demoAuth.js` and all existing auth token interceptors in `frontend/src/api/client.js`.
4. **Financial Consistency:**
   - *Risk:* Miscalculating merchandise donation splits on the checkout or cart screens.
   - *Safeguard:* Rely solely on backend calculation endpoints and preserve existing order creation logic.
