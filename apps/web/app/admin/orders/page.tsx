"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "../../../lib/api";
import { useSession } from "../../../lib/auth";
import { TopBar, Card, CardBody, Select, Chip } from "../../../components/ui";

const statuses = ["CREATED","INVOICE_CREATED","PAID","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];

export default function AdminOrders() {
  const { user } = useSession();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["adminOrders"],
    queryFn: () => api<any[]>("/admin/orders"),
    enabled: user?.role === "ADMIN"
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminOrders"] })
  });

  if (user?.role !== "ADMIN") {
    return (
      <div className="p-4">
        <Link href="/admin" className="underline">Back</Link>
        <div className="text-red-300 mt-3">Admin only.</div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <TopBar title="Orders" right={<Link href="/admin" className="text-white/70">Back</Link>} />
      <div className="p-4 space-y-3">
        {list.isLoading && <div className="text-white/60 text-sm">Loading…</div>}
        {list.isError && <div className="text-red-300 text-sm">Failed.</div>}

        {(list.data || []).map((o) => (
          <Card key={o.id}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm">Order</div>
                <Chip>{o.status}</Chip>
              </div>
              <div className="text-xs text-white/60 mt-1 break-all">{o.id}</div>
              <div className="text-xs text-white/60 mt-1">User: {o.user?.telegramId}</div>
              <div className="text-sm mt-2 font-semibold">{o.subtotal.toFixed(2)} {o.currency}</div>

              <div className="mt-3">
                <div className="text-xs text-white/60 mb-1">Status</div>
                <Select
                  value={o.status}
                  onChange={(e) => setStatus.mutate({ id: o.id, status: e.target.value })}
                >
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>

              <div className="mt-3 text-xs text-white/70">
                <div className="font-semibold mb-1">Items</div>
                <ul className="list-disc pl-5 space-y-1">
                  {o.items.map((it:any) => (
                    <li key={it.id}>
                      {it.quantity}× {it.nameSnapshot} — {it.priceSnapshot} {it.currencySnapshot}
                    </li>
                  ))}
                </ul>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
