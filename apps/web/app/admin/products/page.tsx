"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "../../../lib/api";
import { useSession } from "../../../lib/auth";
import { TopBar, Card, CardBody, Button } from "../../../components/ui";

export default function AdminProducts() {
  const { user } = useSession();
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => api<any[]>("/admin/products"),
    enabled: user?.role === "ADMIN"
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminProducts"] })
  });

  // if (user?.role !== "ADMIN") {
  //   return (
  //     <div className="p-4">
  //       <Link href="/admin" className="underline">Back</Link>
  //       <div className="text-red-300 mt-3">Admin only.</div>
  //     </div>
  //   );
  // }

  return (
    <div className="pb-6">
      <TopBar title="Products" right={<Link href="/admin/products/new" className="text-white/70">New</Link>} />
      <div className="p-4 space-y-3">
        {list.isLoading && <div className="text-white/60 text-sm">Loading…</div>}
        {list.isError && <div className="text-red-300 text-sm">Failed.</div>}
        {(list.data || []).map((p) => (
          <Card key={p.id}>
            <CardBody>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">{p.displayName}</div>
                  <div className="text-xs text-white/60">{p.category} · {p.price} {p.currency} · stock {p.stockQuantity}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/products/${p.id}`} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm">Edit</Link>
                  <Button variant="ghost" onClick={() => del.mutate(p.id)} disabled={del.isPending}>Delete</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
