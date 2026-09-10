# KCB KiNGS Cakes Bakes

A production-ready, full-stack bakery pre-booking & store-pickup website built with Next.js 16, TypeScript, Tailwind CSS 4, Prisma, Firebase Auth, and Google Gemini.

## Business

- **Business name:** KCB KiNGS Cakes Bakes
- **Display name:** KCB Bakery & Cafe
- **Address:** Chaurasiya Ji, Sabji Mandi Main Market, Khamaria, Bhawanath Patti, Uttar Pradesh 221306
- **Coordinates:** 25.242558, 82.509355
- **Phone:** +91 63940 36040
- **Additional phones:** +91 73071 51218, +91 90442 50919
- **Google Maps:** KCB KiNGS Cakes Bakes, Khamaria

## Features

- **Customer website**: Home, search, product detail, cart, checkout, order confirmation, contact, account
- **Authentication**: Email/password (primary) with name + phone required, Google + Phone OTP (secondary), powered by Firebase Auth
- **Admin panel** (email-allowlisted): Dashboard with analytics + AI insights, products CRUD, orders with WhatsApp accept workflow, calendar/slots, coupons, reviews moderation
- **AI features**: KCB bakery assistant chatbot, occasion recommendations, smart search, celebration message suggestions, product description & SEO generation, review summarization, order insights
- **Security**: Login required for cart, checkout, wishlist, and add-to-cart
- **Design**: Existing bakery design system is retained; this migration changes the business identity and content without redesigning the UI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma ORM (SQLite) |
| Auth | Firebase Authentication |
| Cloud sync | Firestore (wishlist + profiles) |
| AI | Google Gemini API |
| State | Zustand + TanStack Query |

## Quick Start (Local)

```bash
bun install
cp .env.example .env
# Edit .env: set DATABASE_URL and the required service credentials
bun run db:push
bun run db:seed
bun run dev
```

## Deployment (Vercel + GitHub)

Import the repository into Vercel and configure the environment variables required by the application, including the database, Firebase, Gemini, and admin authentication settings. Never commit API keys or passwords to the repository.

## AI

The bakery assistant and AI-powered features use Google Gemini. Configure `GEMINI_API_KEY` in the environment. The AI context identifies the business as KCB KiNGS Cakes Bakes and uses the KCB store information and current database menu when answering customers.

## File Structure

```
pihu-cakes-and-bakes/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── public/
│   ├── logo.png               # Bakery logo
│   ├── products/              # Product images
│   └── uploads/               # User-uploaded images
├── src/
│   ├── app/
│   │   ├── api/               # API routes (products, orders, AI, admin, etc.)
│   │   │   ├── ai/            # AI endpoints
│   │   │   ├── admin/         # Admin login/logout/stats
│   │   │   ├── orders/        # Order CRUD + WhatsApp link
│   │   │   ├── products/      # Product CRUD
│   │   │   ├── reviews/       # Reviews CRUD + moderation
│   │   │   ├── slots/         # Pickup slots + availability
│   │   │   ├── dates/         # Disabled dates + closures
│   │   │   ├── coupons/       # Coupon CRUD + validate
│   │   │   ├── categories/    # Category CRUD
│   │   │   ├── content/       # Site content
│   │   │   ├── me/            # Customer order lookup
│   │   │   └── upload/        # Image upload
│   │   ├── globals.css        # Existing bakery design system
│   │   ├── layout.tsx         # Root layout and SEO metadata
│   │   └── page.tsx           # Entry point → AppShell
│   ├── components/
│   │   ├── bakery/
│   │   │   ├── admin/         # Admin panel
│   │   │   ├── views/         # Customer views
│   │   │   ├── app-shell.tsx  # Main SPA shell + routing
│   │   │   ├── header.tsx     # Sticky header
│   │   │   ├── footer.tsx     # Footer with KCB contact/location
│   │   │   ├── auth-guard.tsx # Login gate
│   │   │   └── chat-widget.tsx# KCB AI bakery assistant
│   │   └── ui/                # shadcn/ui components
│   └── lib/
│       ├── ai.ts              # Gemini client
│       ├── auth.ts            # Admin auth
│       ├── brand.ts           # KCB brand/store config
│       ├── bakery-context.ts  # KCB AI business context
│       ├── db.ts              # Prisma client
│       ├── firebase.ts        # Firebase init
│       ├── firebase-auth.ts   # Auth functions
│       ├── firestore.ts       # Firestore
│       └── store.ts           # Zustand store
├── firestore.rules
├── .env.example
├── vercel.json
├── package.json
└── README.md
```

## SEO

The application metadata is optimized around the KCB brand and local intent for Khamaria, Bhawanath Patti, Uttar Pradesh, including searches for cakes, bakeries, pastries, custom cakes, eggless cakes, and the Sabji Mandi Main Market location.

## License

© KCB KiNGS Cakes Bakes. All rights reserved.
