"use client";

import Link from "next/link";
import { useSession } from "../../lib/auth";
import { TopBar, Card, CardBody, NavBar } from "../../components/ui";

export default function AdminHome() {
  const { user, loading } = useSession();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="pb-20">
      <TopBar title="Admin" right={<Link href="/" className="text-white/70">Store</Link>} />
      <div className="p-4 space-y-3">
        {loading ? <div className="text-white/60 text-sm">Checking…</div> : null}
        {!isAdmin ? (
          <Card>
            <CardBody>
              <div className="font-semibold">Access denied</div>
              <div className="text-sm text-white/70 mt-1">
                You must be an admin. Add your Telegram ID to <code>ADMIN_TELEGRAM_IDS</code> in the API .env, then re-open the Mini App.
              </div>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/products" className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10">
                <div className="font-semibold text-sm">Products</div>
                <div className="text-xs text-white/60 mt-1">CRUD</div>
              </Link>
              <Link href="/admin/orders" className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10">
                <div className="font-semibold text-sm">Orders</div>
                <div className="text-xs text-white/60 mt-1">Statuses</div>
              </Link>
            </div>
          </>
        )}
      </div>
      <NavBar />
    </div>
  );
}
