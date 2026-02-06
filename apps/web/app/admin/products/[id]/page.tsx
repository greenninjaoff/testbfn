"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../../lib/api";
import { useSession } from "../../../../lib/auth";
import { TopBar, Card, Input, Select, Button } from "../../../../components/ui";
import React from "react";

function CardBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

const categories = ["protein","vitamins","creatine","pre-workout","bars","other"];
const forms = ["powder","capsules","bar"];

function toNumber(v: string) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function ProductForm({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  const { user } = useSession();
  const [loading, setLoading] = useState(!isNew);
  const [err, setErr] = useState<string|null>(null);

  const [form, setForm] = useState<any>({
    display_name: "",
    description: "",
    notes: "",
    category: "protein",
    type: "WPC",
    series: "",
    form: "powder",
    flavor: "",
    net_weight_g: "",
    serving_size_g: "",
    mix_with_ml_water: "",
    recommended_daily_servings: "",
    shelf_life_months: "",
    storage: "",
    brand: "",
    line: "",
    subline: "",
    images: "https://images.placeholders.dev/?width=800&height=800&text=Product",
    price: "0",
    currency: "USD",
    stock_quantity: "0",
    is_active: true
  });

  useEffect(() => {
    async function load() {
      if (isNew) return;
      setLoading(true);
      try {
        const list = await api<any[]>("/admin/products");
        const p = list.find(x => x.id === params.id);
        if (!p) throw new Error("Not found");
        setForm({
          slug: p.slug,
          display_name: p.displayName,
          description: p.description || "",
          notes: p.notes || "",
          category: p.category,
          type: p.type,
          series: p.series || "",
          form: p.form,
          flavor: p.flavor || "",
          net_weight_g: p.netWeightG ?? "",
          serving_size_g: p.servingSizeG ?? "",
          mix_with_ml_water: p.mixWithMlWater ?? "",
          recommended_daily_servings: p.recommendedDailyServings ?? "",
          shelf_life_months: p.shelfLifeMonths ?? "",
          storage: p.storage || "",
          brand: p.brand || "",
          line: p.line || "",
          subline: p.subline || "",
          images: (p.images || []).join("\n"),
          price: String(p.price),
          currency: p.currency,
          stock_quantity: String(p.stockQuantity),
          is_active: p.isActive
        });
      } catch (e:any) {
        setErr(e.message || "Failed");
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (user?.role !== "ADMIN") {
    return <div className="p-4 text-red-300">Admin only.</div>;
  }

  async function save() {
    setErr(null);
    setLoading(true);
    try {
      const payload = {
        id: undefined,
        slug: form.slug || undefined,
        display_name: form.display_name,
        description: form.description || null,
        notes: form.notes || null,
        category: form.category,
        type: form.type,
        series: form.series || null,
        form: form.form,
        flavor: form.flavor || null,
        net_weight_g: toNumber(form.net_weight_g),
        serving_size_g: toNumber(form.serving_size_g),
        mix_with_ml_water: toNumber(form.mix_with_ml_water),
        recommended_daily_servings: toNumber(form.recommended_daily_servings),
        shelf_life_months: toNumber(form.shelf_life_months),
        storage: form.storage || null,
        brand: form.brand || null,
        line: form.line || null,
        subline: form.subline || null,
        images: String(form.images || "").split(/\n+/).map((s:string)=>s.trim()).filter(Boolean),
        price: Number(form.price || 0),
        currency: form.currency,
        stock_quantity: Number(form.stock_quantity || 0),
        is_active: !!form.is_active
      };

      if (isNew) {
        await api("/admin/products", { method: "POST", body: JSON.stringify(payload) });
      } else {
        await api(`/admin/products/${params.id}`, { method: "PUT", body: JSON.stringify(payload) });
      }
      window.location.href = "/admin/products";
    } catch (e:any) {
      setErr(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-6">
      <TopBar title={isNew ? "New product" : "Edit product"} right={<Link href="/admin/products" className="text-white/70">Back</Link>} />
      <div className="p-4 space-y-3">
        {err ? <div className="text-sm text-red-300">{err}</div> : null}
        <Card>
          <CardBody className="space-y-3">
            <Input placeholder="Slug (optional)" value={form.slug || ""} onChange={(e)=>setForm((x:any)=>({...x, slug: e.target.value}))} />
            <Input placeholder="Display name" value={form.display_name} onChange={(e)=>setForm((x:any)=>({...x, display_name: e.target.value}))} />
            <Input placeholder="Description" value={form.description} onChange={(e)=>setForm((x:any)=>({...x, description: e.target.value}))} />
            <Input placeholder="Notes" value={form.notes} onChange={(e)=>setForm((x:any)=>({...x, notes: e.target.value}))} />

            <div className="grid grid-cols-2 gap-3">
              <Select value={form.category} onChange={(e)=>setForm((x:any)=>({...x, category: e.target.value}))}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select value={form.form} onChange={(e)=>setForm((x:any)=>({...x, form: e.target.value}))}>
                {forms.map(f => <option key={f} value={f}>{f}</option>)}
              </Select>
            </div>

            <Input placeholder="Type (e.g. WPC, creatine monohydrate)" value={form.type} onChange={(e)=>setForm((x:any)=>({...x, type: e.target.value}))} />
            <Input placeholder="Series (optional)" value={form.series} onChange={(e)=>setForm((x:any)=>({...x, series: e.target.value}))} />
            <Input placeholder="Flavor (optional)" value={form.flavor} onChange={(e)=>setForm((x:any)=>({...x, flavor: e.target.value}))} />

            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Net weight (g)" value={form.net_weight_g} onChange={(e)=>setForm((x:any)=>({...x, net_weight_g: e.target.value}))} />
              <Input placeholder="Serving size (g)" value={form.serving_size_g} onChange={(e)=>setForm((x:any)=>({...x, serving_size_g: e.target.value}))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Mix with (ml water)" value={form.mix_with_ml_water} onChange={(e)=>setForm((x:any)=>({...x, mix_with_ml_water: e.target.value}))} />
              <Input placeholder="Daily servings" value={form.recommended_daily_servings} onChange={(e)=>setForm((x:any)=>({...x, recommended_daily_servings: e.target.value}))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Shelf life (months)" value={form.shelf_life_months} onChange={(e)=>setForm((x:any)=>({...x, shelf_life_months: e.target.value}))} />
              <Input placeholder="Stock quantity" value={form.stock_quantity} onChange={(e)=>setForm((x:any)=>({...x, stock_quantity: e.target.value}))} />
            </div>

            <Input placeholder="Storage (optional)" value={form.storage} onChange={(e)=>setForm((x:any)=>({...x, storage: e.target.value}))} />
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="Brand" value={form.brand} onChange={(e)=>setForm((x:any)=>({...x, brand: e.target.value}))} />
              <Input placeholder="Line" value={form.line} onChange={(e)=>setForm((x:any)=>({...x, line: e.target.value}))} />
              <Input placeholder="Subline" value={form.subline} onChange={(e)=>setForm((x:any)=>({...x, subline: e.target.value}))} />
            </div>

            <div>
              <div className="text-sm text-white/70 mb-1">Images (one URL per line)</div>
              <textarea className="w-full min-h-24 px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-white/30"
                value={form.images}
                onChange={(e)=>setForm((x:any)=>({...x, images: e.target.value}))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Price" value={form.price} onChange={(e)=>setForm((x:any)=>({...x, price: e.target.value}))} />
              <Input placeholder="Currency (USD/UZS)" value={form.currency} onChange={(e)=>setForm((x:any)=>({...x, currency: e.target.value}))} />
            </div>

            <label className="flex items-center gap-2 text-sm text-white/80">
              <input type="checkbox" checked={!!form.is_active} onChange={(e)=>setForm((x:any)=>({...x, is_active: e.target.checked}))} />
              Active
            </label>

            <Button onClick={save} disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
            <div className="text-xs text-white/50">This admin UI uses URLs for images. For uploads, integrate S3/Cloudinary.</div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
