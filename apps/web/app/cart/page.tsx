"use client";

import Link from "next/link";
import { TopBar, Card, CardBody, Button, NavBar } from "../../components/ui";
import { useCart } from "../../lib/cart";

export default function CartPage() {
  const { items, totalQty, setQty, remove, clear } = useCart();

  const subtotal = items.reduce((sum, it) => sum + (it.price || 0) * it.quantity, 0);
  const currency = items[0]?.currency || "USD";

  return (
    <div className="pb-20">
      <TopBar title="Cart" right={<button onClick={clear} className="text-white/70">Clear</button>} />
      <div className="p-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-white/70 text-sm">
            Your cart is empty. <Link href="/catalog" className="underline">Go shopping</Link>.
          </div>
        ) : (
          <>
            {items.map((it) => (
              <Card key={it.productId}>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.image || ""} alt={it.name || ""} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{it.name || "Item"}</div>
                      <div className="text-xs text-white/60">
                        {it.price} {it.currency}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button className="px-3 py-1 rounded-lg bg-white/5 border border-white/10" onClick={() => setQty(it.productId, it.quantity - 1)}>-</button>
                        <div className="text-sm w-8 text-center">{it.quantity}</div>
                        <button className="px-3 py-1 rounded-lg bg-white/5 border border-white/10" onClick={() => setQty(it.productId, it.quantity + 1)}>+</button>
                        <button className="ml-auto text-xs text-red-300" onClick={() => remove(it.productId)}>Remove</button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="text-white/70 text-sm">Subtotal</div>
                  <div className="font-semibold">{subtotal.toFixed(2)} {currency}</div>
                </div>
                <div className="mt-3">
                  <Link href="/checkout" className="block w-full text-center px-4 py-2 rounded-xl bg-[var(--accent)] text-black text-sm font-medium">
                    Checkout ({totalQty})
                  </Link>
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
