# 🪔 Bramarambika Home Foods — Enterprise Backend API

A high-performance, modular, layered REST API built with Node.js, Express, Supabase (PostgreSQL), and Shiprocket courier integration. Designed with enterprise clean architecture patterns for high maintainability, testability, and zero-cost cloud deployment.

---

## 🏛️ High-Level Architecture

The backend follows a **Decoupled Layered Architecture (Controller-Service-Repository Pattern)**:

```
backend/
├── .env                  # Local secret configuration
├── .env.example          # Environment variable template
├── Dockerfile            # Container deployment manifest
├── package.json          # Node dependencies & scripts
├── server.js             # HTTP server entrypoint & graceful shutdown handlers
└── src/
    ├── app.js            # Express app setup, CORS, JSON parser & error pipeline
    ├── config/           # Infrastructure & external service configs
    │   ├── env.js        # Strongly-typed environment variables
    │   ├── supabase.js   # Supabase client singleton & connection healthcheck
    │   └── shiprocket.js # Shiprocket client & baseURL setup
    ├── constants/        # Centralized system constants & enums
    │   ├── httpStatus.js # Standard HTTP status codes
    │   └── orderStatus.js# Order & payment status lifecycle enums
    ├── controllers/      # HTTP request & response handlers
    │   ├── auth.controller.js
    │   ├── health.controller.js
    │   ├── orders.controller.js
    │   └── shiprocket.controller.js
    ├── middlewares/      # Express pipeline interceptors
    │   ├── auth.middleware.js     # JWT Bearer verification & role guards
    │   ├── error.middleware.js    # Operational & uncaught error standardizer
    │   ├── logger.middleware.js   # HTTP access logging (Morgan)
    │   └── validate.middleware.js # Request payload validation
    ├── routes/           # REST endpoint definitions & middleware attachments
    │   ├── auth.routes.js
    │   ├── health.routes.js
    │   ├── orders.routes.js
    │   ├── shiprocket.routes.js
    │   └── index.js      # Aggregated API router (/api/...)
    ├── services/         # Core business logic & database/API operations
    │   ├── auth.service.js       # Admin authentication & JWT token generation
    │   ├── orders.service.js     # Supabase CRUD & analytics aggregation
    │   └── shiprocket.service.js # Courier serviceability, rates, order push & tracking
    └── utils/            # Shared primitives & helpers
        ├── ApiError.js     # Operational error class with status codes
        ├── ApiResponse.js  # Uniform JSON response envelope
        └── asyncHandler.js # Async wrapper removing try/catch boilerplate
```

---

## 🚀 Key Features

1. **Decoupled Architecture**: Routes only route, Controllers only parse HTTP, Services handle all business logic and external integrations.
2. **Admin Authentication**: Secure JWT token generation with role checking. Supports primary kitchen owner credentials (configured in `.env`) and Supabase Auth.
3. **Supabase PostgreSQL Integration**: Real-time order persistence with fallback resiliency.
4. **Shiprocket Logistics Engine**: Live courier serviceability checks, automated domestic shipping rate calculations (Delhivery, BlueDart, DTDC), parcel booking, and AWB tracking.
5. **Zero-Cost Deployment**: Runs 100% free on **Render**, **Railway**, **Fly.io**, or **Vercel**.
6. **Docker Ready**: Production-optimized, multi-stage Alpine container with non-root security.

---

## 📡 REST API Reference

All responses adhere to the standard envelope:
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Descriptive message",
  "success": true,
  "timestamp": "2026-10-17T03:04:20.696Z"
}
```

### 1. Health & Readiness Probe
- **`GET /api/health`**
  - **Access**: Public
  - Returns system uptime, memory usage, environment, and Supabase connection status.

### 2. Admin Authentication
- **`POST /api/auth/login`**
  - **Access**: Public
  - **Body**: `{ "email": "admin@yourkitchen.com", "password": "your_password" }`
  - Returns signed JWT token and user profile.
- **`GET /api/auth/me`**
  - **Access**: Admin Bearer Token
  - Validates and returns active session details.

### 3. Orders Management
- **`POST /api/orders`**
  - **Access**: Public (Checkout)
  - **Body**: `{ "customer_name": "...", "phone": "...", "address": "...", "pincode": "...", "items": [...], "grand_total": 499 }`
- **`GET /api/orders`**
  - **Access**: Admin Bearer Token
  - **Query Params**: `status`, `search`, `limit`, `offset`
- **`GET /api/orders/stats`**
  - **Access**: Admin Bearer Token
  - Returns KPI metrics (total orders, revenue, status breakdown).
- **`PATCH /api/orders/:id`**
  - **Access**: Admin Bearer Token
  - **Body**: `{ "status": "Dispatched", "courier_name": "Delhivery", "tracking_number": "AWB12345" }`

### 4. Shiprocket Shipping
- **`GET /api/shipping/serviceability/:pincode`**
  - **Access**: Public
  - Returns available couriers (Delhivery, BlueDart, DTDC), delivery days, and estimated cost.
- **`POST /api/shipping/shipment`**
  - **Access**: Admin Bearer Token
  - Books parcel pickup with Shiprocket and returns AWB number.
- **`GET /api/shipping/track/:awbCode`**
  - **Access**: Public
  - Returns current shipment journey and delivery status.

---

## 🛠️ Local Development

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create and populate .env
cp .env.example .env

# 4. Start backend in watch/development mode
npm run dev
# Server will start on http://localhost:5000
```

---

## ☁️ 100% Free Cloud Deployment Guide

### Option 1: Render.com (Recommended — 100% Free)
1. Push this repository to GitHub.
2. Sign in to [Render.com](https://render.com) (Free tier includes 750 free hours/month).
3. Click **New +** -> **Web Service**.
4. Select your repository.
5. Set the following fields:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add the environment variables from your `.env`:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `ADMIN_EMAIL`: `admin@yourkitchen.com`
   - `ADMIN_PASSWORD`: `your_secure_password`
   - `HEX_SECRET_KEY`: `your_64_character_hex_secret_key`
   - `SUPABASE_URL`: `https://your-project-id.supabase.co`
   - `SUPABASE_ANON_KEY`: `your_supabase_anon_key`
7. Click **Deploy Web Service**! Render will provide your free HTTPS backend URL (e.g., `https://bramarambika-api.onrender.com`).

---

## 🗄️ Supabase PostgreSQL Setup

Run this simple SQL snippet in your [Supabase SQL Editor](https://supabase.com/dashboard) to ensure the `orders` table accepts customer orders:

```sql
-- 1. Create orders table if not exists
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    pincode TEXT NOT NULL,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    grand_total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'New',
    payment_status TEXT NOT NULL DEFAULT 'Pending',
    courier_name TEXT,
    tracking_number TEXT
);

-- 2. Allow anonymous public orders checkout
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow admin update orders" ON public.orders FOR UPDATE USING (true);

-- 3. Create products table for real-time inventory management
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    telugu_name TEXT,
    category TEXT NOT NULL,
    category_label TEXT,
    price_per_kg NUMERIC NOT NULL,
    unit TEXT DEFAULT 'kg',
    tagline TEXT,
    description TEXT,
    badge TEXT,
    image TEXT,
    taste TEXT,
    rating NUMERIC DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    ingredients TEXT,
    variant_prices JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow admin write products" ON public.products FOR ALL USING (true);
```

---
