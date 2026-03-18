# Trackr — Smart Expense Tracking SaaS

A full-featured expense tracking application built with **Next.js 15**, **Auth.js v5**, **Prisma**, and **Neon PostgreSQL**. Manage expenses, set category-specific budgets, visualise spending in interactive charts, and toggle between light and dark themes.

---

## Features

- **Authentication** — Google OAuth & email/password via Auth.js v5 (JWT strategy)
- **Expense Management** — Add, edit, delete expenses with categories, tags, and receipt upload
- **Category Budgets** — Set per-category or overall monthly budgets with real-time progress tracking
- **Reports & Charts** — Monthly bar chart, category pie chart, trend line, spending heatmap, budget vs actual, month-over-month comparison (PRO)
- **Dark / Light Theme** — System-aware toggle powered by `next-themes`
- **Freemium Model** — FREE tier (limited expenses & 1 budget) → PRO tier via Paddle checkout
- **Team Collaboration** — Invite members to share expense workspaces (PRO)
- **Admin Dashboard** — User management and plan overrides at `/admin`
- **Export** — Download expenses as CSV or PDF
- **Forgot / Reset Password** — Token-based password reset flow

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.1 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Auth | Auth.js v5 (next-auth 5 beta) |
| Database | Neon PostgreSQL via Prisma 6 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Payments | Paddle (sandbox) |
| Deployment | Vercel-ready |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **pnpm**
- A [Neon](https://neon.tech) PostgreSQL database
- Google OAuth credentials (optional, for social login)
- Paddle sandbox keys (optional, for upgrade flow)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd trackr
npm install
```

### 2. Environment Variables

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `AUTH_SECRET` | Random secret — run `npx auth secret` |
| `AUTH_URL` | App URL, e.g. `http://localhost:3001` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `NEXTAUTH_URL` | Same as AUTH_URL |
| `PADDLE_API_KEY` | Paddle sandbox API key |
| `PADDLE_WEBHOOK_SECRET` | Paddle webhook secret |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Paddle client-side token |
| `NEXT_PUBLIC_PADDLE_PRO_PRICE_ID` | Paddle price ID for PRO plan |
| `ADMIN_EMAIL` | Email of the admin user |

### 3. Database Setup

```bash
npx prisma db push      # Push schema to Neon
npx prisma generate      # Generate Prisma client
```

### 4. Create Admin User (optional)

```bash
node scripts/create-admin.js admin@example.com YourPassword
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

---

## Project Structure

```
trackr/
├── app/
│   ├── (auth)/            # Login, forgot-password, reset-password
│   ├── (dashboard)/       # Dashboard, budgets, reports, settings, team, upgrade
│   ├── admin/             # Admin panel
│   ├── api/               # REST API routes
│   ├── globals.css        # Tailwind v4 theme tokens
│   └── layout.tsx         # Root layout with ThemeProvider
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── charts/            # SpendingHeatmap, BudgetVsActual, ComparativeChart
│   ├── BudgetClient.tsx   # Budget management UI
│   ├── ExpenseForm.tsx    # Add expense form
│   ├── ExpenseTable.tsx   # Expense list with search & filter
│   ├── ReportsClient.tsx  # Charts & export buttons
│   ├── SettingsClient.tsx # Profile, password, account deletion
│   ├── SidebarNav.tsx     # Sidebar with theme toggle
│   ├── ThemeProvider.tsx  # next-themes wrapper
│   └── ThemeToggle.tsx    # Sun/Moon toggle button
├── lib/
│   ├── auth-helpers.ts    # Session helpers (requireAuth, requirePro)
│   ├── prisma.ts          # Prisma singleton
│   ├── currency.ts        # formatCurrency, formatNPR
│   └── usage.ts           # Monthly usage tracking
├── prisma/
│   └── schema.prisma      # Data model (User, Expense, Budget, Category, etc.)
├── scripts/
│   └── create-admin.js    # CLI to create admin user
├── types/
│   └── index.ts           # Shared types, Zod schemas, constants
└── middleware.ts           # Auth route protection
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack, port 3001) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Prisma Studio |

---

## Theme

The app ships with a light and dark theme. Toggle via the sun/moon button in the sidebar (dashboard) or top-right corner (auth pages). The theme follows your system preference by default.

Dark theme uses a soft navy palette (not pure black). Light theme uses an off-white background (not pure white).

---

## Plans & Pricing

| Feature | FREE | PRO |
|---------|------|-----|
| Expenses per month | 20 | Unlimited |
| Budgets | 1 overall | Unlimited per-category |
| Reports & Charts | — | Full access |
| Team members | — | Up to 5 |
| CSV / PDF export | — | Full access |
| Budget periods | Monthly only | Weekly / Monthly / Quarterly / Yearly |

---

## License

Private — all rights reserved.
