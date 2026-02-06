"use client";

export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import { TopBar, Input, Select, Card, CardBody, Chip, NavBar } from "../../components/ui";
import { useCart } from "../../lib/cart";

type Product = any;

export default function Catalog() {
  const params = useSearchParams();
  const category = params.get("category") || "";
  const { add, totalQty } = useCart();

  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState("newest");
  const [inStock, setInStock] = React.useState(false);

  const query = useQuery({
    queryKey: ["products", category, q, sort, inStock],
    queryFn: () =>
      api<{ items: Product[] }>(
        `/products?category=${encodeURIComponent(category)}&q=${encodeURIComponent(q)}&sort=${encodeURIComponent(sort)}&inStock=${inStock}`
      )
  });

  return (
    <div className="pb-20">
      <TopBar title="Catalog" right={<Link href="/cart">Cart ({totalQty})</Link>} />
      <div className="p-4 space-y-3">
        <Input placeholder="Search (whey, creatine, brand...)" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </Select>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
            In stock only
          </label>
        </div>

        {query.isLoading && <div className="text-white/60 text-sm">Loading…</div>}
        {query.isError && <div className="text-red-300 text-sm">Failed to load products.</div>}

        <div className="grid grid-cols-1 gap-3">
          {(query.data?.items || []).map((p) => (
            <Card key={p.id}>
              <CardBody>
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images?.[0]} alt={p.displayName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <Link href={`/product/${p.slug}`} className="font-semibold leading-snug">{p.displayName}</Link>
                    <div className="text-xs text-white/60 mt-1 flex gap-2 flex-wrap">
                      <Chip>{p.category}</Chip>
                      <Chip>{p.form}</Chip>
                      {p.flavor ? <Chip>{p.flavor}</Chip> : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-white font-semibold">{p.price}</span>{" "}
                        <span className="text-white/60">{p.currency}</span>
                      </div>
                      <button
                        className="px-3 py-2 rounded-xl bg-[var(--accent)] text-black text-sm font-medium disabled:opacity-40"
                        disabled={p.stockQuantity <= 0}
                        onClick={() =>
                          add(p.id, 1, { name: p.displayName, price: p.price, currency: p.currency, image: p.images?.[0], slug: p.slug })
                        }
                      >
                        Add
                      </button>
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : "Out of stock"}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
      <NavBar />
    </div>
  );
}

import React from "react";
