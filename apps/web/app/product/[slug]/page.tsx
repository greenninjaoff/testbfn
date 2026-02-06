"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "../../../lib/api";
import { TopBar, Card, CardBody, Chip, NavBar } from "../../../components/ui";
import { useCart } from "../../../lib/cart";

export default function ProductPage({ params }: { params: { slug: string } }) {
  const { add, totalQty } = useCart();
  const q = useQuery({
    queryKey: ["product", params.slug],
    queryFn: () => api<any>(`/products/${encodeURIComponent(params.slug)}`)
  });

  const p = q.data;

  return (
    <div className="pb-20">
      <TopBar title="Product" right={<Link href="/cart">Cart ({totalQty})</Link>} />
      <div className="p-4 space-y-3">
        {q.isLoading && <div className="text-white/60 text-sm">Loading…</div>}
        {q.isError && <div className="text-red-300 text-sm">Not found.</div>}

        {p && (
          <>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images?.[0]} alt={p.displayName} className="w-full h-64 object-cover" />
            </div>

            <Card>
              <CardBody>
                <div className="text-xl font-semibold">{p.displayName}</div>
                <div className="text-sm text-white/70 mt-1">{p.description || p.notes || ""}</div>

                <div className="mt-3 flex gap-2 flex-wrap">
                  <Chip>{p.category}</Chip>
                  <Chip>{p.type}</Chip>
                  <Chip>{p.form}</Chip>
                  {p.flavor ? <Chip>{p.flavor}</Chip> : null}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-lg">
                    <span className="font-semibold">{p.price}</span>{" "}
                    <span className="text-white/60">{p.currency}</span>
                  </div>
                  <button
                    className="px-4 py-2 rounded-xl bg-[var(--accent)] text-black text-sm font-medium disabled:opacity-40"
                    disabled={p.stockQuantity <= 0}
                    onClick={() => add(p.id, 1, { name: p.displayName, price: p.price, currency: p.currency, image: p.images?.[0], slug: p.slug })}
                  >
                    Add to cart
                  </button>
                </div>

                <div className="text-xs text-white/50 mt-2">{p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : "Out of stock"}</div>

                <div className="mt-4 text-sm text-white/80 space-y-1">
                  {p.netWeightG ? <div>Net weight: {p.netWeightG} g</div> : null}
                  {p.servingSizeG ? <div>Serving size: {p.servingSizeG} g</div> : null}
                  {p.mixWithMlWater ? <div>Mix with: {p.mixWithMlWater} ml water</div> : null}
                  {p.recommendedDailyServings ? <div>Recommended daily servings: {p.recommendedDailyServings}</div> : null}
                  {p.shelfLifeMonths ? <div>Shelf life: {p.shelfLifeMonths} months</div> : null}
                  {p.storage ? <div>Storage: {p.storage}</div> : null}
                  {p.brand ? <div>Brand: {p.brand}</div> : null}
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
      <NavBar />
    </div>
  );
}
