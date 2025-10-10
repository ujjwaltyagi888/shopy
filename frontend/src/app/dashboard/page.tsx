"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, UploadCloud, RefreshCw, Search, Tag, FileDown, ExternalLink, CheckCircle2, XCircle, AlertCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * FRONTEND DASHBOARD (Week-2 focus without shipments)
 * - Products tab: browse your master catalogue, push/sync to merchant's Shopify store with price/markup
 * - Orders tab: view synced Shopify orders, filter, add internal notes/tags, export CSV
 *
 * How to use:
 *  - Drop this file as a page/component in your Next.js app.
 *  - Set API_BASE to your platform-api base (same-origin or proxy via /api/*).
 *  - Ensure CORS if using a different domain in dev.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000"; // adjust for your setup

// ---------- Types ----------

type Product = {
  id: string;
  sku: string;
  title: string;
  description?: string;
  price_paise: number;
  images?: string[] | { src: string }[];
  hsn_code?: string;
  gst_rate?: number;
  active: boolean;
};

type Listing = {
  id: string;
  product_id: string;
  shopify_product_id?: string;
  shopify_variant_id?: string;
  retail_price_paise: number;
  status: string;
};

type Order = {
  id: string;
  shopify_order_id: string;
  shopify_order_number?: string;
  status: string;
  total_paise?: number;
  created_at: string;
  customer?: { name?: string; phone?: string; email?: string };
  shipping_address?: { city?: string; country?: string };
  tags?: string[];
  notes?: string;
};

// ---------- Utilities ----------

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

function formatINR(paise?: number) {
  if (paise == null) return "₹0";
  const rupees = (paise / 100).toFixed(2);
  return `₹${rupees}`;
}

function cn(...cls: (string | undefined | false)[]) {
  return cls.filter(Boolean).join(" ");
}

// ---------- Main Component ----------

export default function Dashboard() {
  const [tab, setTab] = useState("products");
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Merchant Console</h1>
            <p className="text-sm text-slate-500">Sync your catalogue to Shopify and manage incoming orders. (No shipments yet)</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </header>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-4">
            <ProductsPane />
          </TabsContent>
          <TabsContent value="orders" className="mt-4">
            <OrdersPane />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ---------- Products Pane ----------

function ProductsPane() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [listings, setListings] = useState<Record<string, Listing | null>>({});
  const [syncOpen, setSyncOpen] = useState(false);
  const [sel, setSel] = useState<Product | null>(null);
  const [price, setPrice] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [prods, list] = await Promise.all([
          fetchJSON<Product[]>(`${API_BASE}/catalogue`),
          fetchJSON<Listing[]>(`${API_BASE}/listings`).catch(() => []),
        ]);
        if (!mounted) return;
        setProducts(prods);
        const map: Record<string, Listing | null> = {};
        list.forEach((l) => (map[l.product_id] = l));
        setListings(map);
      } catch (e: any) {
        setToast({ kind: "err", msg: e.message });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) =>
      [p.sku, p.title, p.description].some((s) => (s || "").toLowerCase().includes(term))
    );
  }, [q, products]);

  function openSync(p: Product) {
    setSel(p);
    setPrice((p.price_paise / 100).toFixed(2));
    setSyncOpen(true);
  }

  async function doSync() {
    if (!sel) return;
    setSaving(true);
    try {
      const body = {
        productId: sel.id,
        retailPricePaise: Math.round(Number(price || "0") * 100),
      };
      const listing = await fetchJSON<Listing>(`${API_BASE}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setListings((m) => ({ ...m, [sel.id]: listing }));
      setToast({ kind: "ok", msg: `Synced ${sel.title} to Shopify` });
      setSyncOpen(false);
    } catch (e: any) {
      setToast({ kind: "err", msg: e.message || "Failed to sync" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, SKU, description" className="pl-8" />
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <CardTitle className="h-4 w-2/3 rounded bg-slate-100" />
              </CardHeader>
              <CardContent>
                <div className="mb-2 h-40 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const listing = listings[p.id];
            const img = Array.isArray(p.images)
              ? (p.images[0] as any)?.src || (p.images as any)[0]
              : undefined;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="overflow-hidden">
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    {p.active ? (
                      <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 overflow-hidden rounded-xl border">
                      {img ? (
                        <img src={String(img)} alt={p.title} className="h-40 w-full object-cover" />
                      ) : (
                        <div className="flex h-40 items-center justify-center bg-slate-50 text-slate-400">No image</div>
                      )}
                    </div>
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                      <div>
                        <div className="font-medium">{p.sku}</div>
                        <div>{formatINR(p.price_paise)}</div>
                      </div>
                      {listing ? (
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" /> Synced
                          </div>
                          <div className="text-xs text-slate-500">Variant #{listing.shopify_variant_id || "-"}</div>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => openSync(p)}>
                          <UploadCloud className="mr-2 h-4 w-4" /> Sync to Shopify
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={syncOpen} onOpenChange={setSyncOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync to Shopify</DialogTitle>
          </DialogHeader>
          {sel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product</Label>
                  <div className="rounded-md border p-2 text-sm">{sel.title} <span className="ml-1 text-slate-500">({sel.sku})</span></div>
                </div>
                <div>
                  <Label>Retail price (₹)</Label>
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>HSN</Label>
                  <Input defaultValue={sel.hsn_code || ""} disabled />
                </div>
                <div>
                  <Label>GST rate (%)</Label>
                  <Input defaultValue={sel.gst_rate ?? 0} disabled />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={doSync} disabled={saving}>
              {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} Sync now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className={cn("fixed bottom-4 right-4 rounded-xl p-3 shadow-lg", toast.kind === "ok" ? "bg-emerald-600 text-white" : "bg-red-600 text-white")}
             onAnimationEnd={() => setTimeout(() => setToast(null), 2400)}>
          {toast.kind === "ok" ? <CheckCircle2 className="mr-2 inline h-4 w-4" /> : <AlertCircle className="mr-2 inline h-4 w-4" />} {toast.msg}
        </div>
      )}
    </div>
  );
}

// ---------- Orders Pane ----------

function OrdersPane() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [editing, setEditing] = useState<Order | null>(null);
  const [note, setNote] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await fetchJSON<Order[]>(`${API_BASE}/orders?status=${status}`);
      setOrders(data);
    } catch (e: any) {
      setToast({ kind: "err", msg: e.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((o) =>
      [o.shopify_order_number, o.customer?.name, o.customer?.email, o.customer?.phone]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(term))
    );
  }, [q, orders]);

  async function addNote(order: Order) {
    try {
      await fetchJSON(`${API_BASE}/orders/${order.id}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      setToast({ kind: "ok", msg: "Note saved" });
      setEditing(null);
      setNote("");
      load();
    } catch (e: any) {
      setToast({ kind: "err", msg: e.message });
    }
  }

  async function addTag(order: Order) {
    try {
      await fetchJSON(`${API_BASE}/orders/${order.id}/tag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
      });
      setToast({ kind: "ok", msg: "Tag added" });
      setTag("");
      load();
    } catch (e: any) {
      setToast({ kind: "err", msg: e.message });
    }
  }

  async function exportCsv() {
    try {
      const res = await fetch(`${API_BASE}/orders/export`, { method: "POST" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setToast({ kind: "err", msg: e.message });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order no., name, email, phone" className="pl-8" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="label_generated">Label Generated</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="rto">RTO</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCsv}><FileDown className="mr-2 h-4 w-4"/>Export CSV</Button>
        <Button variant="outline" onClick={load}><RefreshCw className="mr-2 h-4 w-4"/>Refresh</Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No orders</td></tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="border-t hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-medium">#{o.shopify_order_number || o.shopify_order_id}</div>
                    <div className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.customer?.name || "-"}</div>
                    <div className="text-xs text-slate-500">{o.customer?.email || o.customer?.phone || ""}</div>
                  </td>
                  <td className="px-4 py-3">{formatINR(o.total_paise)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={o.status === "delivered" ? "default" : "secondary"}>{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(o.tags || []).map((t, i) => (
                        <Badge key={i} variant="outline" className="gap-1"><Tag className="h-3 w-3" />{t}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(o); setNote(o.notes || ""); }}>
                        <Pencil className="mr-1 h-4 w-4"/> Note
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditing(o); setTag(""); }}>
                        <Tag className="mr-1 h-4 w-4"/> Tag
                      </Button>
                      <a href={`https://admin.shopify.com/store/yourstore/orders/${o.shopify_order_id}`} target="_blank" className="inline-flex">
                        <Button size="sm" variant="secondary"><ExternalLink className="mr-1 h-4 w-4"/>Shopify</Button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Note / Tag dialog */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Internal Note</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Visible only in your console (not to customer)" />
              <div className="mt-2 text-right">
                <Button size="sm" onClick={() => editing && addNote(editing)}>
                  Save note
                </Button>
              </div>
            </div>
            <div>
              <Label>Add Tag</Label>
              <div className="flex gap-2">
                <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g., priority, cod, influencer" />
                <Button variant="outline" onClick={() => editing && addTag(editing)}><Tag className="mr-2 h-4 w-4"/>Add</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className={cn("fixed bottom-4 right-4 rounded-xl p-3 shadow-lg", toast.kind === "ok" ? "bg-emerald-600 text-white" : "bg-red-600 text-white")}
             onAnimationEnd={() => setTimeout(() => setToast(null), 2400)}>
          {toast.kind === "ok" ? <CheckCircle2 className="mr-2 inline h-4 w-4" /> : <AlertCircle className="mr-2 inline h-4 w-4" />} {toast.msg}
        </div>
      )}
    </div>
  );
}
