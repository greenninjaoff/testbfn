"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TopBar, Card, CardBody, Button } from "../../../components/ui";
import { api } from "../../../lib/api";

export default function OrderPage({ params }: { params: { id: string } }) {
  const sp = useSearchParams();
  const invoice = sp.get("invoice") || "";

  async function markPaid() {
    await api("/payments/telegram/mark-paid", {
      method: "POST",
      body: JSON.stringify({ orderId: params.id })
    });
    alert("Marked paid (dev). Stock decremented.");
  }

  return (
    <div className="pb-6">
      <TopBar title="Order" right={<Link href="/profile" className="text-white/70">Orders</Link>} />
      <div className="p-4 space-y-3">
        <Card>
          <CardBody>
            <div className="font-semibold">Order created</div>
            <div className="text-sm text-white/70 mt-1">Order ID: {params.id}</div>
            <div className="text-sm text-white/70 mt-2">Invoice link (dev):</div>
            <div className="text-xs break-all text-white/60 mt-1">{invoice}</div>
            <div className="mt-3 flex gap-2">
              <Button onClick={markPaid}>Mark Paid (dev)</Button>
              <Link href="/catalog" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm">Continue shopping</Link>
            </div>
            <div className="text-xs text-white/50 mt-3">
              In production, you will open invoice inside Telegram and verify payment via webhook/callback.
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
