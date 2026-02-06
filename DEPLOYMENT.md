# Deployment Guide (Telegram Mini App Store)

This document explains how to deploy the Web + API + Postgres and connect it to Telegram.

---

## 1) Create Telegram Bot + Mini App

1. Open Telegram → talk to **@BotFather**
2. Create bot: `/newbot`
3. Copy the **BOT TOKEN**
4. Configure a Web App button:
   - Use `/setdomain` if needed
   - Use `/setmenubutton` (Web App)
   - Set URL to your deployed **web** app, e.g. `https://your-domain.com`

**Important**: Telegram WebApp authentication relies on `initData` which is validated server-side with your bot token.

---

## 2) Deployment option A: Render (simple)

### A1) Create a Postgres instance
- In Render: create PostgreSQL
- Copy its connection string as `DATABASE_URL`

### A2) Deploy API (apps/api)
- Create a new Web Service
- Root directory: `apps/api`
- Build command:
  ```bash
  pnpm install && pnpm build && pnpm prisma:generate && pnpm prisma:migrate
  ```
  (Or use `prisma:push` for non-migration workflow)
- Start command:
  ```bash
  pnpm start
  ```

Set env vars:
- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN`
- `JWT_SECRET`
- `ADMIN_TELEGRAM_IDS`
- `CORS_ORIGIN` = your web URL (e.g. `https://your-web.onrender.com`)
- `PUBLIC_BASE_URL` = your api URL

### A3) Deploy Web (apps/web)
- Create another Web Service or Static Site (Next.js requires Web Service)
- Root directory: `apps/web`
- Build:
  ```bash
  pnpm install && pnpm build
  ```
- Start:
  ```bash
  pnpm start
  ```

Set env vars:
- `NEXT_PUBLIC_API_BASE_URL` = your API URL

---

## 3) Deployment option B: Docker on VPS (recommended for control)

### B1) On server
Install:
- Docker + Docker Compose plugin

Upload your repo, then:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit:
- `apps/api/.env` (bot token, db url, secrets)
- `apps/web/.env` (api base url)

Then:
```bash
docker compose up -d --build
```

Web: `http://SERVER_IP:3000`
API: `http://SERVER_IP:4000`

### B2) Add Nginx + HTTPS
Put web and api behind Nginx:
- `/` → web:3000
- `/api` → api:4000

Use Let’s Encrypt (certbot) for HTTPS.

---

## 4) Real Telegram Payments (production)

This scaffold includes endpoints and DB fields, but does NOT call Telegram’s `sendInvoice` yet.

To implement:
1. In `apps/api/src/server.ts` inside `/payments/telegram/create-invoice`, call Telegram Bot API `sendInvoice`
2. Use provider token (from a payment provider supported by Telegram Payments)
3. Handle successful payment:
   - Telegram sends `successful_payment` in message updates
   - You must set a webhook for your bot:
     - Telegram Bot API `setWebhook` → your API endpoint
   - Verify updates, then mark order as `PAID`
   - Decrement stock in a transaction

Production checklist:
- ✅ validate Telegram updates signature / origin
- ✅ never trust client “paid” flags
- ✅ idempotent payment handling (avoid double decrement)
- ✅ logging + monitoring

---

## 5) Troubleshooting

### “Not logged in / orders fail”
- You must open the site **inside Telegram** for `initData` to exist.
- Ensure `TELEGRAM_BOT_TOKEN` is correct.
- Ensure `CORS_ORIGIN` matches the web app origin.

### “Admin access denied”
- Add your Telegram numeric id to `ADMIN_TELEGRAM_IDS`.
- Re-open the Mini App (so it re-auths and gets ADMIN role).

---

## 6) Security hardening ideas
- rate limiting (e.g. express-rate-limit)
- request logging correlation IDs
- stricter CORS rules
- allowlist admin IDs only (already supported)
- audit trails for admin actions
