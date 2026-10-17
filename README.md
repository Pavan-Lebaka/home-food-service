# 🪔 Bramarambika Traditional Home Foods

Authentic, handcrafted Andhra pickles, sweets, and savouries delivered across India. Architected as a modern, secure, and decoupled 3-tier system.

---

## 📂 Architecture Overview

The repository is organized into three completely isolated, single-responsibility applications:

```text
home-food-service/
├── frontend/                 # 🛍️ Customer Storefront (Vite + React 19)
│   ├── src/                  # Customer-facing shopping experience & cart
│   ├── .env.example          # Public frontend environment variables
│   └── package.json          # Customer bundle (0 vulnerabilities, 0 admin leaks)
│
├── admin/                    # 🔐 Staff & Owner Management Portal (Vite + React 19)
│   ├── src/                  # Orders dashboard, product management, Shiprocket
│   ├── .env.example          # Admin environment template
│   └── package.json          # Admin dependencies (0 vulnerabilities)
│
├── backend/                  # ⚡ Production REST API (Node.js + Express)
│   ├── src/                  # Controllers, services, routes, Bcrypt auth
│   ├── data/                 # Local database storage (gitignored)
│   ├── .env.example          # Backend environment template
│   └── package.json          # Backend dependencies (0 vulnerabilities)
│
├── .gitignore                # Global security isolation for credentials & builds
├── package.json              # Workspace runner orchestrating all 3 apps
└── README.md
```

---

## 🌐 Local Development Endpoints

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Storefront** | `http://localhost:5173` | Customer-facing Telugu homemade food store & cart checkout |
| **Admin Portal** | `http://localhost:5174` | Dedicated staff portal to manage orders, live catalog & dispatches |
| **Backend API** | `http://localhost:5000` | REST API with Bcrypt auth, Supabase integration & Shiprocket |

---

## 🚀 Quick Start

### Start All 3 Services Concurrently
```bash
npm run dev
```

### Or Run Services Individually
```bash
npm run dev:store    # Runs Storefront on http://localhost:5173
npm run dev:admin    # Runs Admin Portal on http://localhost:5174
npm run dev:backend  # Runs API Server on http://localhost:5000
npm run seed         # Seeds admin credentials & 17 products into DB
```

---

## 🔒 Security Best Practices

- **Zero Admin Code in Storefront:** The customer bundle contains zero admin logic, staff routes, or management credentials.
- **Dedicated Admin App:** Admin portal runs on its own isolated port (`5174`) and can be hosted on a separate private subdomain (e.g. `admin.bramarambika.com`) with IP restriction or Cloudflare Access.
- **Strict `.gitignore` Protection:** Local database files (`backend/data/`), build artifacts (`*/dist/`), and all `.env` files are strictly gitignored.
- **Zero Vulnerabilities:** Audited with `npm audit` — 0 vulnerabilities across all packages.
