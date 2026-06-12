# KongsiLogi

Platform Manajemen Inventory & Rantai Pasok untuk Koperasi — dibangun dengan Next.js 16, Prisma, PostgreSQL, dan Tailwind CSS.

---

## Getting Started

```bash
# Install dependencies
npm install

# Setup database
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — default login dari seed tersedia di `prisma/seed.ts`.

---

## Architecture Overview

### Folder Structure

```
src/
├── app/
│   ├── api/                  # Next.js Route Handlers (backend)
│   │   ├── ai/               # Gemini AI endpoints (demand forecasting, scoring, pricing)
│   │   ├── auth/             # JWT auth (login, logout, me)
│   │   ├── dashboard/        # Dashboard summary aggregation
│   │   ├── inventory/        # Product + batch CRUD
│   │   ├── cold-storage/     # Cold storage monitor
│   │   ├── procurement/      # Purchase request workflow
│   │   ├── pos/              # Point of sale transactions
│   │   ├── reports/          # Reporting & exports
│   │   ├── stock-opname/     # Stock audit
│   │   └── notifications/    # Notification system
│   ├── dashboard/            # Dashboard page routes (client-side pages)
│   ├── login/                # Auth page
│   ├── globals.css           # Global design system
│   └── layout.tsx            # Root layout
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx       # Collapsible sidebar (role-aware)
│   └── dashboard/
│       └── SalesChart.tsx    # Recharts wrapper
├── lib/
│   ├── auth.ts               # JWT helpers + getRoleAccess()
│   ├── constants.ts          # App-wide constants, ROLE_ACCESS_MAP, MOCK_SUPPLIERS
│   ├── prisma.ts             # Prisma singleton client
│   └── utils.ts              # Formatting helpers, status utilities
├── middleware.ts             # Auth guard + header injection
└── types/
    └── index.ts              # Shared TypeScript interfaces & types
```

### Key Conventions

| Convention | Rule |
|-----------|------|
| **Server Components** | Default for all `app/dashboard/*/layout.tsx` files |
| **Client Components** | All `page.tsx` inside dashboard (use `'use client'`) |
| **API Routes** | One `route.ts` per domain under `app/api/` |
| **Data Fetching** | Client pages fetch from their own API route |
| **Type Safety** | All shared interfaces live in `src/types/index.ts` |
| **No `any`** | `@typescript-eslint/no-explicit-any` is an error |

### Design System

CSS classes are defined in `src/app/globals.css` with clear sections:

| Class | Purpose |
|-------|---------|
| `.erp-card` | Primary card/panel container |
| `.glass-card` | Alias for `.erp-card` (legacy compat) |
| `.btn-primary` | Primary filled button |
| `.btn-secondary` | Ghost/outline button |
| `.erp-button` | Taller (44px) button variant |
| `.input-field` | Standard text input / select |
| `.erp-input` | Taller (44px) input variant |
| `.status-badge` | Base pill badge |
| `.status-safe/attention/critical/expired` | Status colour modifiers |
| `.widget-value` | Large metric display number |
| `.widget-label` | Metric label text |

**Design Tokens** (CSS custom properties) are defined at `:root` in `globals.css`. Always prefer tokens over hardcoded colours.

### Role Access Model

Role permissions are defined **once** in `src/lib/constants.ts` → `ROLE_ACCESS_MAP`. Both `getRoleAccess()` in `auth.ts` and `Sidebar.tsx` read from this single source of truth.

| Role | Dashboard | Inventory | Cold Storage | Procurement | POS | Stock Opname | Reports | Settings |
|------|:---------:|:---------:|:------------:|:-----------:|:---:|:------------:|:-------:|:--------:|
| ADMIN | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| WAREHOUSE_STAFF | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| CASHIER | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| VIEWER | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |

### Auth Flow

```
Browser → middleware.ts (verify JWT cookie)
       → /login         (redirect if no token)
       → x-user-*       (headers injected to API routes)
       → API routes read role from request.headers
```

### Database

- **ORM**: Prisma 6
- **Database**: PostgreSQL (Supabase)
- **Schema**: `prisma/schema.prisma`
- **Seed**: `npm run db:seed`

---

## Scripts

| Script | Action |
|--------|--------|
| `npm run dev` | Start dev server |
| `npm run build` | Generate Prisma client + build |
| `npm run lint` | ESLint (zero warnings policy) |
| `npm run db:push` | Push schema to DB |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset DB + reseed |
| `npm run db:studio` | Open Prisma Studio |

---

## Code Quality Standards

```bash
# Must pass with zero errors AND zero warnings
npx eslint src --max-warnings 0

# Must compile cleanly
npx tsc --noEmit
```

Rules enforced:
- `@typescript-eslint/no-explicit-any` → **error**
- `@typescript-eslint/no-unused-vars` → **warning**
- `react-hooks/exhaustive-deps` → **warning**
- `react-hooks/immutability` → **error**
- `@next/next/no-img-element` → **warning** (use `next/image`)
