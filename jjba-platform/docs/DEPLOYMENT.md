# Deployment Guide

## Overview

| Service | What it hosts | Cost |
|---|---|---|
| Cloudflare Pages | React frontend | Free |
| Render | Express backend | Free (spins down after inactivity) |
| Supabase | Database + Auth + Realtime | Free up to 500MB |

---

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → New Project
2. In the **SQL Editor**, paste and run `supabase/migrations/001_initial_schema.sql`
3. Go to **Settings → API** and copy:
   - `Project URL` → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (backend only, never frontend)
4. In **Authentication → URL Configuration**, add your Cloudflare Pages URL to Redirect URLs once deployed

---

## 2. GitHub Repo Structure

Push the entire `jjba-platform/` folder. Recommended repo layout:

```
your-repo/
├── frontend/   ← Cloudflare Pages will build this
├── backend/    ← Render will run this
├── supabase/
└── README.md
```

---

## 3. Deploy Frontend → Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project → Connect to Git**
2. Select your repo
3. Configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`
4. Add **Environment variables**:
   ```
   VITE_SUPABASE_URL     = https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY = your_anon_key
   VITE_API_URL           = https://your-backend.onrender.com
   ```
5. Deploy. You'll get a `*.pages.dev` URL.

---

## 4. Deploy Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Root directory**: `backend`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Runtime**: Node
4. Add **Environment variables**:
   ```
   SUPABASE_URL              = https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
   FRONTEND_URL              = https://your-app.pages.dev
   PORT                      = 3001
   ```
5. Deploy. Free tier spins down after 15 min inactivity — acceptable for Beta.

---

## 5. Final Wiring

After both are deployed:

1. **Supabase → Auth → URL Configuration**:
   - Site URL: `https://your-app.pages.dev`
   - Redirect URLs: `https://your-app.pages.dev/**`

2. **Update** `VITE_API_URL` in Cloudflare Pages env vars to your Render URL

3. **Redeploy** the frontend (Cloudflare Pages → Deployments → Retry)

---

## 6. Background Image

Save your wallpaper as `frontend/public/bg.jpg`.

It will be served at `/bg.jpg` and referenced in `globals.css`:
```css
background-image: url('/bg.jpg');
background-attachment: fixed;
background-size: cover;
background-position: center top;
```

**If the left stripe border gets cut off**: change `background-position` to `left top` or adjust
`background-size` to `auto 100%` to preserve the left edge of your image.

---

## Beta Testing Checklist

- [ ] Run SQL migration in Supabase
- [ ] Push code to GitHub
- [ ] Deploy frontend to Cloudflare Pages
- [ ] Deploy backend to Render
- [ ] Set env vars in both services
- [ ] Configure Supabase Auth redirect URLs
- [ ] Save bg.jpg to `frontend/public/`
- [ ] Test signup → create Stand → create Part → invite friend → chat
