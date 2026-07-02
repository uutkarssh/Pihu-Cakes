# Pihu Cakes & Bakes

A production-ready, full-stack bakery pre-booking & store-pickup website built with Next.js 16, TypeScript, Tailwind CSS 4, Prisma, Firebase Auth, and Z AI.

## Features

- **Customer website**: Home, search, product detail, cart, checkout, order confirmation, contact, account
- **Authentication**: Email/password (primary) with name + phone required, Google + Phone OTP (secondary), powered by Firebase Auth
- **Admin panel** (email-allowlisted): Dashboard with analytics + AI insights, products CRUD, orders with WhatsApp accept workflow, calendar/slots, coupons, reviews moderation
- **AI features**: Bakery assistant chatbot, occasion recommendations, smart search, celebration message suggestions, product description & SEO generation, review summarization, order insights
- **Security**: Login required for cart, checkout, wishlist, and add-to-cart
- **Design**: Modern Retro-Neobrutalism (bakery adapted) — cream, terracotta, mustard, burgundy

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM (SQLite) |
| Auth | Firebase Authentication |
| Cloud sync | Firestore (wishlist + profiles) |
| AI | Z AI (z-ai-web-dev-sdk) |
| State | Zustand + TanStack Query |

## Quick Start (Local)

```bash
bun install
cp .env.example .env
# Edit .env: set DATABASE_URL
bun run db:push    # create database schema
bun run db:seed    # (optional) seed sample data
bun run dev        # start dev server on :3000
```

## Deployment (Vercel + GitHub)

### Step 1: Push to GitHub
1. Create a new GitHub repository
2. Push this project:
   ```bash
   git init
   git add .
   git commit -m "Pihu Cakes & Bakes — production ready"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/pihu-cakes-and-bakes.git
   git push -u origin main
   ```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Vercel auto-detects Next.js. Set these **Environment Variables** in Project Settings:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | `file:./db/custom.db` (or your Turso/Postgres URL) | Yes |
| `ZAI_API_KEY` | Your Z AI API key (for AI features) | Yes* |
| `ZAI_BASE_URL` | `https://internal-api.z.ai/v1` | Optional |

*Without `ZAI_API_KEY`, AI features show graceful fallback messages but the site works fine.

3. Deploy. Vercel runs `prisma generate && next build` automatically (see `vercel.json`).

### Step 3: Set up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com) → your project (`pihu-cakes-and-bakes`)
2. **Authentication → Sign-in method**: enable Email/Password, Google, and Phone
3. **Authentication → Settings → Authorized domains**: add your Vercel domain (e.g., `pihu-cakes-and-bakes.vercel.app`)
4. **Firestore Database → Rules**: paste the contents of `firestore.rules` from this repo → Publish
5. **Firestore Database → Create database** (if not already created)

### Step 4: Admin Access
Only these emails can access the admin panel (configured in `src/lib/brand.ts`):
- `ravimaurya335@gmail.com`
- `utkarshmaurya917027@gmail.com`

Admin password: `pihu2024` (change in `src/lib/brand.ts` before deploying)

## Z AI API Key

The AI features (chatbot, recommendations, smart search, etc.) use the Z AI API.

**Where to get the key**: Contact Z AI or use the Z AI platform to get an API key.

**Where to add it**: Vercel Project Settings → Environment Variables → add `ZAI_API_KEY` with your key value.

Without the key, all AI features gracefully fall back to static/cached responses — the website still works perfectly.

## File Structure

```
pihu-cakes-and-bakes/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data (18 products, categories, slots, coupons)
├── public/
│   ├── logo.png               # Bakery logo
│   ├── products/              # Product images (18 PNGs)
│   └── uploads/               # User-uploaded images
├── src/
│   ├── app/
│   │   ├── api/               # API routes (products, orders, AI, admin, etc.)
│   │   │   ├── ai/            # 9 AI endpoints (chat, recommend, search, etc.)
│   │   │   ├── admin/         # Admin login/logout/stats
│   │   │   ├── orders/        # Order CRUD + WhatsApp link
│   │   │   ├── products/      # Product CRUD
│   │   │   ├── reviews/       # Reviews CRUD + moderation
│   │   │   ├── slots/         # Pickup slots + availability
│   │   │   ├── dates/         # Disabled dates + closures
│   │   │   ├── coupons/       # Coupon CRUD + validate
│   │   │   ├── categories/    # Category CRUD
│   │   │   ├── content/       # Site content (FAQs, promos)
│   │   │   ├── me/            # Customer order lookup
│   │   │   └── upload/        # Image upload
│   │   ├── globals.css        # Tailwind + bakery design system
│   │   ├── layout.tsx         # Root layout (fonts, metadata)
│   │   └── page.tsx           # Entry point → AppShell
│   ├── components/
│   │   ├── bakery/
│   │   │   ├── admin/         # Admin panel (dashboard, orders, products, etc.)
│   │   │   ├── views/         # Customer views (home, search, product, etc.)
│   │   │   ├── app-shell.tsx  # Main SPA shell + routing
│   │   │   ├── header.tsx     # Sticky header with nav + login
│   │   │   ├── footer.tsx     # Footer with WhatsApp + links
│   │   │   ├── auth-guard.tsx # Login gate for protected routes
│   │   │   ├── chat-widget.tsx# AI bakery assistant
│   │   │   └── ...
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── ai.ts              # Z AI client (env-var + SDK fallback)
│       ├── auth.ts            # Admin auth (email allowlist)
│       ├── brand.ts           # Brand config (address, phone, admin emails)
│       ├── db.ts              # Prisma client
│       ├── firebase.ts        # Firebase init
│       ├── firebase-auth.ts   # Auth functions (email, Google, OTP)
│       ├── firestore.ts       # Firestore (profiles, wishlist sync)
│       ├── store.ts           # Zustand store (router, cart, wishlist)
│       └── ...
├── firestore.rules            # Firestore security rules
├── .env.example               # Environment variable template
├── vercel.json                # Vercel deployment config
├── package.json
└── README.md
```

## Admin Credentials (Demo)

- **Admin emails**: `ravimaurya335@gmail.com` / `utkarshmaurya917027@gmail.com`
- **Admin password**: `pihu2024`

## License

© Pihu Cakes & Bakes. All rights reserved.
