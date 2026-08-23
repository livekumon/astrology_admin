# AGENTS.md

## Project overview

`jyotish-admin` is a React + Vite admin portal for the Jyotish astrology product. It displays users, LLM conversations, token usage, and a world map. It is **not** a medical-reports application — the API and UI are astrology-specific.

## Cursor Cloud specific instructions

### Prerequisites

- Node.js 22+ and npm (lockfile: `package-lock.json`)
- Optional for full dashboard data: `astrology_backend` on port `3001` with MongoDB (`MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`)

### Install and run

```bash
npm ci
cp .env.example .env   # first time only; edit VITE_API_URL if needed
npm run dev            # http://localhost:5175
```

Default dev setup proxies `/api` to `http://localhost:3001` (see `vite.config.js`). To use the deployed API instead, set `VITE_API_URL` in `.env` to a reachable backend URL including `/api`.

### Verify

```bash
npm run build
```

### Default admin login (local backend)

When running `astrology_backend` locally with default `.env.example` values: login `admin`, password `123456`.

### Notes

- The Vite dev server runs on port **5175** (not the default 5173).
- World map GeoJSON is fetched from GitHub (`raw.githubusercontent.com`); egress must allow that host if testing the map panel.
- Production backend URL in `.env.example` may be unavailable; prefer local backend + MongoDB for end-to-end admin testing.
