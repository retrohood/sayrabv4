# Sayrab Architecture Roadmap

This document captures the target product architecture for Sayrab. The current app is a MERN project with a customer website, auth, campaigns, donations, merchandise, and a manager dashboard route. The roadmap below describes the direction for the next build phases.

## Target Project Structure

Preferred split:

```text
sayrab/
  frontend/
    customer/
    manager-dashboard/
  backend/
    models/
    routes/
    controllers/
    middleware/
    services/
```

Simpler MVP split:

```text
client/
server/
```

The current repository uses:

```text
frontend/
backend/
```

Keep this structure until the feature set stabilizes, then split the frontend into `customer` and `manager-dashboard` if the two experiences become large enough to justify separate apps.

## Phase 1: System Architecture

### User Roles

Customer can:

- Browse campaigns
- Buy merchandise
- Track orders

Campaign Manager can:

- Create campaigns
- Generate AI designs
- Manage store products
- Track analytics
- Receive payouts

Admin, added after MVP, can:

- Approve managers
- Monitor fraud
- Review payouts
- Oversee manufacturing and order issues

### Core Collections

Users:

```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string",
  "password": "hashed string",
  "role": "customer | manager | admin",
  "createdAt": "date"
}
```

Campaigns:

```json
{
  "_id": "ObjectId",
  "managerId": "ObjectId",
  "title": "string",
  "description": "string",
  "goalAmount": "number",
  "raisedAmount": "number",
  "deadline": "date",
  "status": "draft | active | paused | completed",
  "banner": "string",
  "storeUrl": "string"
}
```

Products:

```json
{
  "_id": "ObjectId",
  "campaignId": "ObjectId",
  "name": "string",
  "description": "string",
  "price": "number",
  "sizes": ["string"],
  "colors": ["string"],
  "images": ["string"]
}
```

Orders:

```json
{
  "_id": "ObjectId",
  "customerId": "ObjectId",
  "campaignId": "ObjectId",
  "products": [],
  "total": "number",
  "paymentStatus": "pending | paid | failed | refunded",
  "shippingAddress": {},
  "orderStatus": "placed | paid | production | shipped | delivered"
}
```

Designs:

```json
{
  "_id": "ObjectId",
  "campaignId": "ObjectId",
  "prompt": "string",
  "generatedImages": ["string"],
  "approved": "boolean"
}
```

## Phase 2: Backend APIs

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

Implementation notes:

- JWT-based sessions
- Role-based auth middleware
- Demo mode can remain active while MongoDB is not attached

### Customer APIs

Campaigns:

```text
GET /api/campaigns
GET /api/campaigns/:id
```

Products:

```text
GET /api/products/:campaignId
GET /api/products/item/:id
```

Cart:

- Keep cart client-side first
- Persist to backend later when account-based carts are needed

Checkout:

```text
POST /api/payment/create-session
POST /api/orders
```

Order tracking:

```text
GET /api/orders/:id
```

### Campaign Manager APIs

Campaign CRUD:

```text
POST   /api/campaigns
PUT    /api/campaigns/:id
DELETE /api/campaigns/:id
```

AI design:

```text
POST /api/designs/generate
POST /api/designs/approve
```

Flow:

1. Manager sends a prompt.
2. Backend calls the AI image service.
3. Generated images are returned.
4. Manager approves one or more designs.

Analytics:

```text
GET /api/analytics/:campaignId
```

Return sales, traffic, conversion, and revenue.

Payouts:

```text
GET /api/payouts/:managerId
```

## Phase 3: Customer Frontend

### Pages

```text
/
/campaigns
/campaign/:id
/product/:id
/cart
/checkout
/order/:id
```

### State

Use Redux when the customer flow grows beyond the current context/local-state setup:

- `authSlice`
- `cartSlice`
- `campaignSlice`
- `orderSlice`

### Components

- `Navbar`
- `CampaignCard`
- `ProductCard`
- `CartItem`
- `CheckoutForm`
- `OrderTimeline`

### Customer Flow

Browse:

```text
GET /api/campaigns
```

View store:

- Click campaign
- Fetch linked products

Cart:

- Use local storage initially
- Support `addToCart`, `removeFromCart`, and `updateQty`

Checkout:

- User enters address and payment details
- Frontend calls Stripe session endpoint
- Backend creates order after payment confirmation

Order tracking:

- Fetch order status
- Display timeline: placed, paid, production, shipped, delivered

## Phase 4: Campaign Manager Frontend

### Routes

```text
/dashboard
/dashboard/campaigns
/dashboard/design-studio
/dashboard/orders
/dashboard/analytics
/dashboard/payouts
```

### Dashboard Navigation

- Dashboard
- Campaigns
- Design Studio
- Store
- Orders
- Analytics
- Payouts

### State

Add manager dashboard state as needed:

- `managerSlice`
- `campaignSlice`
- `analyticsSlice`
- `designSlice`

### Campaign Creation Flow

Step 1: Campaign details

- Campaign name
- Goal
- Products

API:

```text
POST /api/campaigns
```

Step 2: AI design

Example prompt:

```text
Black hoodie with minimalist charity logo
```

Backend:

- Send prompt to image generation service
- Return mockups
- Store selected design

Step 3: Publish store

System generates a campaign store URL, for example:

```text
sayrab.com/store/help-palestine
```

Products are linked to the campaign.

### Analytics Widgets

KPI cards:

- Revenue
- Orders
- Conversion
- Goal progress

Charts:

- Sales per day
- Traffic source
- Top products

Recommended library:

- Recharts

## Phase 5: Payment System

Use Stripe for checkout.

Payment flow:

1. Customer pays.
2. Stripe webhook is triggered.
3. Backend verifies payment.
4. Backend creates order.
5. Backend updates campaign revenue.

Webhook:

```text
POST /webhook/stripe
```

Revenue split:

- 50% organization
- 5% Sayrab
- 45% manufacturer

Store split records in the database for payout and audit reporting.

## Phase 6: Admin and Manufacturing

Admin:

- Approve managers
- Monitor fraud
- Review payouts
- Manage platform disputes

Manufacturer:

- View production queue
- Update production status
- Update shipment status

Suggested production statuses:

```text
queued
in_production
quality_check
shipped
delivered
```
