"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { useCart } from "../../lib/cart";
import { TopBar, Card, CardBody, Input, Select, Button, NavBar } from "../../components/ui";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState<"pickup"|"courier">("pickup");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState(items[0]?.currency || "USD");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const subtotal = items.reduce((sum, it) => sum + (it.price || 0) * it.quantity, 0);

  async function placeOrder() {
    setErr(null);
    setLoading(true);
    try {
      const order = await api<any>("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((it) => ({ product_id: it.productId, quantity: it.quantity })),
          customer_name: name,
          phone,
          delivery_method: delivery,
          address: delivery === "courier" ? address : null,
          currency
        })
      });

      const pay = await api<{ invoiceLink: string }>("/payments/telegram/create-invoice", {
        method: "POST",
        body: JSON.stringify({ orderId: order.id })
      });

      // In real Telegram flow, you'd open invoice via Telegram.WebApp.openInvoice().
      // For this scaffold, we just navigate to a "pay" page that explains next steps.
      clear();
      router.push(`/order/${order.id}?invoice=${encodeURIComponent(pay.invoiceLink)}`);
    } catch (e: any) {
      setErr(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-20">
      <TopBar title="Checkout" right={<Link href="/cart" className="text-white/70">Back</Link>} />
      <div className="p-4 space-y-3">
        {items.length === 0 ? (
          <div className="text-white/70 text-sm">
            Your cart is empty. <Link href="/catalog" className="underline">Go shopping</Link>.
          </div>
        ) : (
          <>
            <Card>
              <CardBody>
                <div className="text-sm text-white/70">Subtotal</div>
                <div className="text-lg font-semibold">{subtotal.toFixed(2)} {currency}</div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-3">
                <div className="font-semibold">Customer info</div>
                <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

                <div className="grid grid-cols-2 gap-3">
                  <Select value={delivery} onChange={(e) => setDelivery(e.target.value as any)}>
                    <option value="pickup">Pickup</option>
                    <option value="courier">Courier</option>
                  </Select>
                  <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="UZS">UZS</option>
                  </Select>
                </div>

                {delivery === "courier" ? (
                  <Input placeholder="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
                ) : null}

                {err ? <div className="text-sm text-red-300">{err}</div> : null}

                <Button onClick={placeOrder} disabled={loading || !name || !phone || (delivery==="courier" && !address)}>
                  {loading ? "Placing…" : "Place order & pay"}
                </Button>

                <div className="text-xs text-white/50">
                  Payment is scaffolded. For production, connect Telegram Payments as described in DEPLOYMENT.md.
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
