# Afterglow

Private shared photo pools for groups: create a pool, share the invite code, and everyone's photos land in one gallery.

- `server/` — Express + Prisma + Postgres API (JWT auth, Google sign-in, pools, photo uploads with sharp thumbnails)
- `client/` — Vite + React + TypeScript + Tailwind CSS frontend

## Running locally

```bash
# Database
cd server && docker compose up -d

# API (http://localhost:4000)
cp .env.example .env        # fill in JWT_SECRET and GOOGLE_CLIENT_ID
npm install
npx prisma db push
npm run dev

# Frontend (http://localhost:5173)
cd ../client
cp .env.example .env        # same GOOGLE_CLIENT_ID as the server
npm install
npm run dev
```

## Google sign-in

1. In Google Cloud Console, go to **APIs & Services → Credentials → Create credentials → OAuth client ID** and choose **Web application**.
2. Add `http://localhost:5173` (and your production origin) under **Authorized JavaScript origins**.
3. Put the client ID in `server/.env` as `GOOGLE_CLIENT_ID` and in `client/.env` as `VITE_GOOGLE_CLIENT_ID`.

The frontend uses Google Identity Services to get an ID token. `POST /auth/google` verifies that token and returns an Afterglow JWT. If a Google account's email matches an existing email/password user, the two are linked. The Google button is hidden when `VITE_GOOGLE_CLIENT_ID` is not set.

## API

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/signup` | | Email/password signup |
| POST | `/auth/login` | | Email/password login |
| POST | `/auth/google` | | Exchange Google ID token (`credential`) for a JWT |
| GET | `/auth/me` | ✓ | Current user |
| GET | `/pools` | ✓ | Pools you belong to |
| POST | `/pools` | ✓ | Create a pool |
| POST | `/pools/join` | ✓ | Join by `inviteCode` |
| GET | `/pools/:poolId` | ✓ | Pool details and members |
| GET | `/photos/:poolId` | ✓ | Photos in a pool |
| POST | `/photos/:poolId/upload` | ✓ | Upload a photo (`photo` multipart field) |
