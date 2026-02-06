import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import { PrismaClient, OrderStatus } from "@prisma/client";
import { ProductSchema, CreateOrderSchema } from "@tma/shared";
import { validateTelegramInitData } from "./utils/telegram.js";
import { slugify } from "./utils/slug.js";
import { requireAuth, requireAdmin } from "./middleware/auth.js";

const prisma = new PrismaClient();
const app = express();

const PORT = Number(process.env.PORT || 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

/**
 * Auth: Telegram Mini App initData -> JWT
 */
app.post("/auth/telegram", async (req, res) => {
  const initData = String(req.body?.initData || "");
  if (!initData) return res.status(400).json({ error: "initData required" });
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  if (!botToken) return res.status(500).json({ error: "Server misconfigured: TELEGRAM_BOT_TOKEN" });

  const parsed = validateTelegramInitData(initData, botToken);
  if (!parsed || !parsed.user?.id) return res.status(401).json({ error: "Invalid initData" });

  const u = parsed.user;
  const telegramId = BigInt(u.id);

  // Upsert user
  const user = await prisma.user.upsert({
    where: { telegramId },
    update: {
      username: u.username ?? null,
      firstName: u.first_name ?? null,
      lastName: u.last_name ?? null,
      photoUrl: u.photo_url ?? null
    },
    create: {
      telegramId,
      username: u.username ?? null,
      firstName: u.first_name ?? null,
      lastName: u.last_name ?? null,
      photoUrl: u.photo_url ?? null,
      role: "USER"
    }
  });

  // Promote admins by env list
  const adminIds = (process.env.ADMIN_TELEGRAM_IDS || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  if (adminIds.includes(String(telegramId))) {
    await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    user.role = "ADMIN";
  }

  const token = jwt.sign(
    { userId: user.id, telegramId: String(user.telegramId), role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      telegramId: String(user.telegramId),
      username: user.username,
      firstName: user.firstName,
      role: user.role
    }
  });
});

/**
 * Public products
 */
app.get("/products", async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 12)));
  const q = String(req.query.q || "").trim();
  const category = String(req.query.category || "").trim();
  const form = String(req.query.form || "").trim();
  const brand = String(req.query.brand || "").trim();
  const inStock = String(req.query.inStock || "").trim() === "true";
  const sort = String(req.query.sort || "newest"); // newest, price_asc, price_desc

  const where: any = { isActive: true };
  if (q) where.OR = [
    { displayName: { contains: q, mode: "insensitive" } },
    { type: { contains: q, mode: "insensitive" } },
    { brand: { contains: q, mode: "insensitive" } }
  ];
  if (category) where.category = category;
  if (form) where.form = form;
  if (brand) where.brand = { contains: brand, mode: "insensitive" };
  if (inStock) where.stockQuantity = { gt: 0 };

  const orderBy: any =
    sort === "price_asc" ? { price: "asc" } :
    sort === "price_desc" ? { price: "desc" } :
    { createdAt: "desc" };

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where, orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  res.json({ page, pageSize, total, items });
});

app.get("/products/:slug", async (req, res) => {
  const slug = req.params.slug;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product || !product.isActive) return res.status(404).json({ error: "Not found" });
  res.json(product);
});

/**
 * Admin product CRUD
 */
app.post("/admin/products", requireAuth, requireAdmin, async (req, res) => {
  const parsed = ProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid product", details: parsed.error.flatten() });
  const p = parsed.data;

  const slug = p.slug?.trim() || slugify(p.display_name) + "-" + Math.random().toString(16).slice(2,6);

  const created = await prisma.product.create({
    data: {
      slug,
      displayName: p.display_name,
      description: p.description ?? null,
      notes: p.notes ?? null,
      category: p.category,
      type: p.type,
      series: p.series ?? null,
      form: p.form,
      flavor: p.flavor ?? null,
      netWeightG: p.net_weight_g ?? null,
      servingSizeG: p.serving_size_g ?? null,
      mixWithMlWater: p.mix_with_ml_water ?? null,
      recommendedDailyServings: p.recommended_daily_servings ?? null,
      shelfLifeMonths: p.shelf_life_months ?? null,
      storage: p.storage ?? null,
      brand: p.brand ?? null,
      line: p.line ?? null,
      subline: p.subline ?? null,
      images: p.images,
      price: p.price,
      currency: p.currency,
      stockQuantity: p.stock_quantity,
      isActive: p.is_active
    }
  });
  res.json(created);
});

app.put("/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const parsed = ProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid product", details: parsed.error.flatten() });
  const p = parsed.data;

  const updated = await prisma.product.update({
    where: { id },
    data: {
      slug: p.slug?.trim() || undefined,
      displayName: p.display_name,
      description: p.description ?? null,
      notes: p.notes ?? null,
      category: p.category,
      type: p.type,
      series: p.series ?? null,
      form: p.form,
      flavor: p.flavor ?? null,
      netWeightG: p.net_weight_g ?? null,
      servingSizeG: p.serving_size_g ?? null,
      mixWithMlWater: p.mix_with_ml_water ?? null,
      recommendedDailyServings: p.recommended_daily_servings ?? null,
      shelfLifeMonths: p.shelf_life_months ?? null,
      storage: p.storage ?? null,
      brand: p.brand ?? null,
      line: p.line ?? null,
      subline: p.subline ?? null,
      images: p.images,
      price: p.price,
      currency: p.currency,
      stockQuantity: p.stock_quantity,
      isActive: p.is_active
    }
  });
  res.json(updated);
});

app.get("/admin/products", requireAuth, requireAdmin, async (_req, res) => {
  const items = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  res.json(items);
});

app.delete("/admin/products/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  await prisma.product.delete({ where: { id } });
  res.json({ ok: true });
});

/**
 * Orders
 */
app.post("/orders", requireAuth, async (req, res) => {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid order", details: parsed.error.flatten() });
  const input = parsed.data;

  const productIds = input.items.map(i => i.product_id);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });

  if (products.length !== productIds.length) {
    return res.status(400).json({ error: "Some products not found" });
  }

  // compute subtotal and validate stock
  let subtotal = 0;
  const itemsData = input.items.map(ci => {
    const p = products.find(x => x.id === ci.product_id)!;
    if (p.stockQuantity < ci.quantity) throw new Error(`Not enough stock for ${p.displayName}`);
    if (p.currency !== input.currency) throw new Error(`Currency mismatch: ${p.displayName}`);
    subtotal += p.price * ci.quantity;
    return {
      productId: p.id,
      nameSnapshot: p.displayName,
      priceSnapshot: p.price,
      currencySnapshot: p.currency,
      quantity: ci.quantity
    };
  });

  const order = await prisma.order.create({
    data: {
      userId: req.auth!.userId,
      status: OrderStatus.CREATED,
      customerName: input.customer_name,
      phone: input.phone,
      deliveryMethod: input.delivery_method,
      address: input.delivery_method === "courier" ? (input.address || null) : null,
      notes: input.notes || null,
      currency: input.currency,
      subtotal,
      items: { create: itemsData }
    },
    include: { items: true }
  });

  res.json(order);
});

app.get("/orders/me", requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.auth!.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(orders);
});

app.get("/admin/orders", requireAuth, requireAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, user: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(orders);
});

app.patch("/admin/orders/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const status = String(req.body?.status || "");
  if (!Object.keys(OrderStatus).includes(status)) return res.status(400).json({ error: "Invalid status" });

  const order = await prisma.order.update({ where: { id }, data: { status: status as any } });
  res.json(order);
});

/**
 * Payments (Telegram Payments stub-ready)
 * In real prod: create invoice via Telegram bot API sendInvoice,
 * then confirm via successful_payment updates / provider webhook.
 */
app.post("/payments/telegram/create-invoice", requireAuth, async (req, res) => {
  const orderId = String(req.body?.orderId || "");
  if (!orderId) return res.status(400).json({ error: "orderId required" });

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order || order.userId !== req.auth!.userId) return res.status(404).json({ error: "Order not found" });

  // This is a placeholder invoice link for development.
  // Replace with a real Telegram invoice link generation in DEPLOYMENT.md.
  const fakeInvoiceLink = `${process.env.PUBLIC_BASE_URL || "http://localhost:4000"}/pay/telegram/${order.id}`;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: OrderStatus.INVOICE_CREATED, paymentProvider: "telegram", paymentStatus: "invoice_created" }
  });

  res.json({ invoiceLink: fakeInvoiceLink });
});

app.post("/payments/telegram/mark-paid", async (req, res) => {
  // For dev/testing only: mark order paid
  const orderId = String(req.body?.orderId || "");
  if (!orderId) return res.status(400).json({ error: "orderId required" });

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  // decrement stock
  await prisma.$transaction(async (tx) => {
    for (const it of order.items) {
      const p = await tx.product.findUnique({ where: { id: it.productId } });
      if (!p) continue;
      const newQty = Math.max(0, p.stockQuantity - it.quantity);
      await tx.product.update({ where: { id: p.id }, data: { stockQuantity: newQty } });
    }
    await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.PAID, paymentStatus: "paid" }
    });
  });

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
