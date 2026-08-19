# CP-Tracker

A unified dashboard for your competitive programming and developer profiles.

## Project Structure

This project is divided into two parts:
- `/frontend`: React + Vite + Tailwind CSS for the client.
- `/backend`: Node.js + Express + MongoDB for the server and API.

## How to Run Locally

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or via Atlas)

### 1. Start the Backend
```bash
cd backend
npm install
node server.js
```
The backend will run on `http://localhost:5000`.

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will typically run on `http://localhost:5173`.

## Phases (Intern Tracking)
- [x] Phase 0: Project Setup
- [x] Phase 1: Auth System
- [x] Phase 2: User Profile & Platform Linking
- [x] Phase 3: Verification Logic
- [x] Phase 4: Data Fetching & Normalization
- [ ] Phase 5: Dashboard UI
- [ ] Phase 6: Public Profile Page
- [ ] Phase 7: Polish
