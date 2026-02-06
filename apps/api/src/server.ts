import express from "express";
import cors from "cors";
import morgan from "morgan";
import jwt, { type SignOptions } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

/* =========================
   ENV VALIDATION
========================= */

const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const JWT_SECRET_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_ENV) throw new Error("JWT_SECRET is missing");
const JWT_SECRET: string = JWT_SECRET_ENV;


/* =========================
   MIDDLEWARE
========================= */

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(morgan("dev"));

/* =========================
   HELPERS
========================= */

function parseExpiresToSeconds(v: string | undefined): number {
  if (!v) return 7 * 24 * 60 * 60; // 7 days

  if (/^\d+$/.test(v)) return parseInt(v, 10);

  const m = v.match(/^(\d+)([smhd])$/i);
  if (!m) return 7 * 24 * 60 * 60;

  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();

  switch (unit) {
    case "s": return n;
    case "m": return n * 60;
    case "h": return n * 60 * 60;
    case "d": return n * 24 * 60 * 60;
    default: return 7 * 24 * 60 * 60;
  }
}

function signToken(payload: object) {
  const expiresIn = parseExpiresToSeconds(process.env.JWT_EXPIRES_IN);
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

/* =========================
   ROUTES
========================= */

// health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, env: NODE_ENV });
});

// products (public)
app.get("/products", async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  });

  res.json(products);
});

// fake auth (TEMP for testing without Telegram)
app.post("/auth/dev", async (_req, res) => {
  const token = signToken({
    userId: "dev-user",
    role: "admin"
  });

  res.json({ token });
});

/* =========================
   START SERVER  (RENDER)
========================= */

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API listening on http://0.0.0.0:${PORT}`);
});