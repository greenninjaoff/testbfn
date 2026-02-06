"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "../../lib/api";
import { useSession } from "../../lib/auth";
import { TopBar, Card, CardBody, Button, NavBar, Chip } from "../../components/ui";

export default function ProfilePage() {
  const { user, loading, logout } = useSession();

  const orders = useQuery({
    queryKey: ["myOrders"],
    queryFn: () => api<any[]>("/orders/me"),
    enabled: !!user
  });

  return (
    <div className="pb-20">
      <TopBar title="Profile" right={<Link href="/admin" className="text-white/70">Admin</Link>} />
      <div className="p-4 space-y-3">
        <Card>
          <CardBody>
            <div className="font-semibold">{user ? (user.firstName || "Telegram User") : "Not logged in"}</div>
            <div className="text-sm text-white/70 mt-1">
              {loading ? "Checking session…" : user ? `@${user.username || "unknown"} · ${user.role}` : "Open in Telegram to auto-login."}
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" onClick={logout}>Logout</Button>
              <Link href="/catalog" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm">Browse</Link>
            </div>
          </CardBody>
        </Card>

        <div className="text-sm font-semibold">My orders</div>

        {orders.isLoading && <div className="text-white/60 text-sm">Loading…</div>}
        {orders.isError && <div className="text-red-300 text-sm">Failed to load orders (are you logged in?).</div>}

        <div className="space-y-3">
          {(orders.data || []).map((o) => (
            <Card key={o.id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">Order</div>
                  <Chip>{o.status}</Chip>
                </div>
                <div className="text-xs text-white/60 mt-1 break-all">{o.id}</div>
                <div className="text-sm mt-2 font-semibold">{o.subtotal.toFixed(2)} {o.currency}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
      <NavBar />
    </div>
  );
}
