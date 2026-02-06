# Telegram Mini App – Protein/Supplements Store (Full App)

This repo contains a complete, working scaffold for an e-commerce store inside a **Telegram Mini App**:
- Storefront (Telegram WebApp / Mini App)
- Admin panel (in the same Next.js app)
- Backend API (Express + TypeScript)
- PostgreSQL + Prisma schema + seed
- Docker Compose for local dev

> ✅ You can run everything locally in ~10 minutes.

---

## 1) Prerequisites

Install:
- **Node.js 20+**
- **pnpm 9+** (recommended)
- **Docker Desktop** (recommended for Postgres)

---

## 2) Project structure

- `apps/web` – Next.js storefront + admin UI
- `apps/api` – Express API + Prisma
- `packages/shared` – shared Zod schemas/types
- `docker-compose.yml` – Postgres + api + web

---

## 3) Quickstart (local)

### Step A — clone & install
```bash
pnpm install
```

### Step B — configure env files
Copy examples:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` and set:
- `TELEGRAM_BOT_TOKEN=...`
- `JWT_SECRET=...`
- `ADMIN_TELEGRAM_IDS=...` (your Telegram numeric ID)

### Step C — start Postgres (Docker)
```bash
docker compose up -d db
```

### Step D — Prisma migrate + seed
```bash
pnpm --filter @tma/api prisma:generate
pnpm --filter @tma/api prisma:push
pnpm --filter @tma/api seed
```

### Step E — run apps
In two terminals:

**API**
```bash
pnpm --filter @tma/api dev
```

**WEB**
```bash
pnpm --filter @tma/web dev
```

Open:
- Web: `http://localhost:3000`
- API health: `http://localhost:4000/health`

---

## 4) Using it inside Telegram (Mini App)

1. Create a bot via **@BotFather**.
2. Create a Mini App / Web App button pointing to your deployed web URL (see DEPLOYMENT.md).
3. Open the bot → open the web app inside Telegram.

The frontend will:
- read `window.Telegram.WebApp.initData`
- send it to `/auth/telegram`
- store the returned JWT in localStorage

---

## 5) Admin panel

Open:
- `http://localhost:3000/admin`

You become admin if your Telegram ID is listed in:
- `ADMIN_TELEGRAM_IDS` in `apps/api/.env`

Admin features:
- Products CRUD (with image URLs)
- Orders list + status updates

---

## 6) Payments

This scaffold includes a **payment abstraction endpoint**, but uses a dev placeholder invoice link:
- `POST /payments/telegram/create-invoice` returns a fake invoice link
- `POST /payments/telegram/mark-paid` marks an order paid (dev only) and decrements stock

For production Telegram Payments integration, follow **DEPLOYMENT.md**.

---

## 7) Scripts

From repo root:
- `pnpm dev` – run all dev servers
- `pnpm build` – build all
- `docker compose up -d` – run full stack in docker (after env setup)

---

## 8) Notes / Next steps
- Add real image uploading (Cloudinary / S3)
- Add proper inventory reservation on order creation
- Add delivery fee calculation
- Add multi-currency handling per order
- Add analytics (popular products)

See `DEPLOYMENT.md` for production steps.
