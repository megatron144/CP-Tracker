# CP-Tracker — Production Deployment Guide

This guide provides end-to-end instructions for deploying CP-Tracker to production across **MongoDB Atlas**, **Render/Railway** (Backend), and **Vercel** (Frontend).

---

## 1. Database Setup: MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 Shared Cluster (e.g. `cp-tracker-cluster`).
3. Under **Database Access**, create a user with read/write privileges (e.g. username `cptracker_admin`).
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so Render/Railway cloud servers can connect.
5. Click **Connect** $\to$ **Connect your application (Drivers)** $\to$ Copy the URI:
   ```env
   MONGO_URI=mongodb+srv://cptracker_admin:<password>@cp-tracker-cluster.mongodb.net/cp_tracker?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment: Render / Railway

### Option A: Render (Web Service)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** $\to$ **Web Service**.
2. Connect your GitHub repository (`megatron144/CP-Tracker`).
3. Set the following build and run settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add **Environment Variables**:
   - `MONGO_URI`: `<Your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<A random 64-character secret string>`
   - `NODE_ENV`: `production`
   *(Note: You do **not** need to add `PORT`. Render automatically assigns and manages `PORT` via `process.env.PORT`).*
5. Click **Create Web Service**. Note your public backend URL (e.g. `https://cp-tracker-backend.onrender.com`).

---

## 3. Frontend Deployment: Vercel

1. Log in to [Vercel](https://vercel.com/) and click **Add New...** $\to$ **Project**.
2. Import your GitHub repository (`megatron144/CP-Tracker`).
3. Set the configuration:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL`: `https://cp-tracker-backend.onrender.com` (Your Render backend URL)
5. Click **Deploy**. Vercel will build and provide your production domain (e.g. `https://cp-tracker.vercel.app`).
6. Single Page Application (SPA) routing for `/u/:username` is handled automatically via `frontend/vercel.json`.

---

## 4. Production Security & Features Active

- ✅ **Rate Limiting Protection**: `express-rate-limit` protects `/api/profile/sync*` and `/api/auth/*` against abuse and platform bans.
- ✅ **Public Shareable Profiles**: Zero-auth public access on `/u/:username` exposing only verified stats.
- ✅ **Automated Daily Background Synchronization**: Server-side node-cron automatically refreshes verified competitive profiles every 24 hours.
- ✅ **Resilient Scrapers & Fallbacks**: Handles rate limits, down platforms, and sanitized handles cleanly.
