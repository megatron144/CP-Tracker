# CP-Tracker

> **One dashboard. Every platform. All your progress.**

CP-Tracker is a full-stack web application that aggregates your competitive programming stats from multiple platforms into a single, unified dashboard. Link your handles, verify ownership, and watch your stats auto-sync — then share a public profile with anyone.

---

## ✨ Features

- 🔗 **Multi-Platform Linking** — Connect handles for LeetCode, Codeforces, CodeChef, AtCoder, GeeksForGeeks, and GitHub
- ✅ **Handle Verification** — Prove ownership via bio injection or a unique submission token (no OAuth required)
- 📊 **Unified Stats Dashboard** — Total problems solved, rating, max rating, rank, contests participated, and difficulty breakdown (Easy / Medium / Hard)
- 🔄 **Auto Background Sync** — Server refreshes all verified platform stats every 6 hours automatically
- 🛡️ **Sync Safeguards** — Anomaly detection prevents stats from unexpectedly dropping (>30% drop triggers a hold)
- 🌐 **Shareable Public Profiles** — Zero-auth public page at `/u/:username` exposing only verified stats
- 🏆 **Upcoming Contests** — View upcoming contests across platforms in one place
- 🔐 **JWT Authentication** — Secure signup/login with bcrypt-hashed passwords

---

## 🖥️ Tech Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS v4, React Router v7        |
| Backend   | Node.js, Express 5, MongoDB, Mongoose                   |
| Auth      | JWT (jsonwebtoken), bcrypt                              |
| Scraping  | Axios, Cheerio (HTML parsing), LeetCode GraphQL API     |
| Hosting   | Vercel (frontend) · Render / Railway (backend) · MongoDB Atlas |

---

## 📁 Project Structure

```
CP-Tracker/
├── backend/
│   ├── config/               # DB connection
│   ├── middleware/            # JWT auth middleware
│   ├── models/                # Mongoose schemas (User, Platform stats)
│   ├── routes/                # authRoutes, profileRoutes, contestRoutes
│   ├── services/
│   │   ├── fetcherService.js  # Platform stat scrapers & normalizers
│   │   ├── verifierService.js # Handle ownership verification logic
│   │   └── cronService.js     # Background auto-sync (every 6h)
│   └── server.js
└── frontend/
    └── src/
        ├── components/        # Navbar, PlatformCard, LinkPlatformModal, charts…
        ├── pages/             # Login, Signup, Dashboard, PublicProfile
        └── context/           # Auth context
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js v18+
- MongoDB (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the repo

```bash
git clone https://github.com/megatron144/CP-Tracker.git
cd CP-Tracker
```

### 2. Start the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
MONGO_URI=mongodb://localhost:27017/cp_tracker
JWT_SECRET=your_super_secret_key_here
PORT=5001
```

```bash
npm run dev    # uses node --watch for hot reload
```

Backend runs at `http://localhost:5001`.

### 3. Start the Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5001
```

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🌍 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full step-by-step instructions covering:
- **MongoDB Atlas** setup
- **Render / Railway** backend deployment
- **Vercel** frontend deployment with SPA routing

---

## 🔌 Supported Platforms

| Platform       | Stats Fetched                                               | Verification Method |
|----------------|-------------------------------------------------------------|---------------------|
| LeetCode       | Total / Easy / Medium / Hard solved, contest rating, rank   | Bio injection       |
| Codeforces     | Total solved, rating, max rating, rank, contests            | Submission token    |
| CodeChef       | Total solved, rating, max rating, rank, contests            | Submission token    |
| AtCoder        | Total solved, rating, rank, contests                        | Submission token    |
| GeeksForGeeks  | Total solved, score, coding streak                          | Bio injection       |
| GitHub         | Public repos, stars, followers, top languages               | Bio injection       |

---

## 📡 API Overview

| Method | Endpoint                         | Description                       |
|--------|----------------------------------|-----------------------------------|
| POST   | `/api/auth/register`             | Register a new user               |
| POST   | `/api/auth/login`                | Login and receive JWT             |
| GET    | `/api/profile/me`                | Get current user's profile        |
| POST   | `/api/profile/link`              | Link a new platform handle        |
| POST   | `/api/profile/verify`            | Verify a linked handle            |
| POST   | `/api/profile/sync`              | Manually sync a platform's stats  |
| GET    | `/api/profile/public/:username`  | Public profile (no auth required) |
| GET    | `/api/contests`                  | Fetch upcoming contests           |
| GET    | `/api/health`                    | Backend health check              |

---

## 🛡️ Security & Reliability

- **Rate Limiting** — `express-rate-limit` protects auth and sync endpoints from abuse
- **Sync Anomaly Guard** — Prevents stats from being overwritten if a platform returns an unexpectedly low count (likely a scraping failure)
- **Graceful Error Handling** — Individual platform failures during auto-sync don't crash the sync cycle for other platforms

---

## 🗺️ Roadmap

- [x] Phase 0 — Project Setup
- [x] Phase 1 — Auth System (JWT + bcrypt)
- [x] Phase 2 — User Profile & Platform Linking
- [x] Phase 3 — Handle Verification Logic
- [x] Phase 4 — Data Fetching & Normalization
- [ ] Phase 5 — Dashboard UI polish
- [ ] Phase 6 — Public Profile Page
- [ ] Phase 7 — Final Polish & Performance

---

## 📄 License

MIT
