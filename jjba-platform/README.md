# 「JJBA ROLEPLAY PLATFORM」 — Beta

A modular JoJo's Bizarre Adventure roleplay system. Game Masters create private **Parts**, invite players, and manage canon Stand logic. 

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime Chat | Supabase Realtime |
| Hosting (Frontend) | Cloudflare Pages |
| Hosting (Backend) | Render (free tier) |

## Why Supabase over MongoDB

Since you're already on Supabase/Cloudflare:
- **Supabase Auth** replaces custom JWT auth entirely
- **Supabase Realtime** powers the Part chat rooms with zero extra infra
- **Row Level Security (RLS)** handles private Part access at the DB level
- **Free tier** is generous for Beta testing with friends

## Quick Start

```bash
# 1. Clone your repo
git clone https://github.com/YOUR_USERNAME/jjba-platform
cd jjba-platform

# 2. Install frontend deps
cd frontend && npm install

# 3. Install backend deps  
cd ../backend && npm install

# 4. Set up env vars (see .env.example files)

# 5. Run Supabase migrations (in /supabase/migrations)

# 6. Dev mode
cd frontend && npm run dev   # Vite on :5173
cd backend && npm run dev    # Express on :3001
```

## Project Structure

```
jjba-platform/
├── frontend/
│   ├── public/
│   │   └── bg.jpg              ← YOUR BACKGROUND IMAGE GOES HERE
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/           ← Login, Signup
│   │   │   ├── dashboard/      ← Main dashboard layout
│   │   │   ├── stands/         ← Stand creator & display
│   │   │   ├── parts/          ← Part creation & invite system
│   │   │   └── chat/           ← Part chat rooms
│   │   ├── pages/              ← Route-level pages
│   │   ├── hooks/              ← Custom React hooks
│   │   ├── lib/                ← Supabase client, utils
│   │   └── styles/             ← Global CSS
│   └── .env.example
├── backend/
│   ├── routes/                 ← Express route files
│   ├── controllers/            ← Business logic
│   ├── middleware/             ← Auth middleware
│   └── .env.example
├── supabase/
│   └── migrations/            ← SQL schema files
└── docs/
    └── DEPLOYMENT.md
```
