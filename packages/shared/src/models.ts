import { z } from "zod";

export const ProductCategory = z.enum(["protein","vitamins","creatine","pre-workout","bars","other"]);
export const ProductForm = z.enum(["powder","capsules","bar"]);

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).optional(),
  display_name: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),

  category: ProductCategory,
  type: z.string().min(1).max(120),
  series: z.string().optional().nullable(),
  form: ProductForm,
  flavor: z.string().optional().nullable(),

  net_weight_g: z.number().int().positive().optional().nullable(),
  serving_size_g: z.number().positive().optional().nullable(),
  mix_with_ml_water: z.number().int().positive().optional().nullable(),
  recommended_daily_servings: z.number().positive().optional().nullable(),
  shelf_life_months: z.number().int().positive().optional().nullable(),
  storage: z.string().optional().nullable(),

  brand: z.string().optional().nullable(),
  line: z.string().optional().nullable(),
  subline: z.string().optional().nullable(),

  images: z.array(z.string().url()).min(1),
  price: z.number().positive(),
  currency: z.string().min(3).max(8),
  stock_quantity: z.number().int().nonnegative(),
  is_active: z.boolean()
});

export const CartItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive()
});

export const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1),
  customer_name: z.string().min(1).max(120),
  phone: z.string().min(6).max(32),
  delivery_method: z.enum(["pickup","courier"]),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  currency: z.string().min(3).max(8)
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
