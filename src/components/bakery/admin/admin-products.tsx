"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { WEIGHTS } from "@/lib/brand";
import { BakeryButton, BakeryCard, Pill } from "../ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Loader2,
  Search,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const catsQ = useQuery({ queryKey: ["categories"], queryFn: api.categories });
  const categories = catsQ.data?.categories ?? [];
  const prodsQ = useQuery({ queryKey: ["admin-products"], queryFn: () => api.products() });
  const products = (prodsQ.data?.products ?? []).filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (p: any) => {
    setEditing(p);
    setOpen(true);
  };

  const del = async (p: any) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.adminDeleteProduct(p.slug);
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <BakeryCard className="nb-shadow-soft p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-cream border-2 border-ink rounded-full px-4 py-2 nb-shadow-sm">
          <Search size={16} className="text-terracotta" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
        <BakeryButton variant="primary" onClick={openNew}>
          <Plus size={16} className="mr-1" /> Add Product
        </BakeryButton>
      </BakeryCard>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <BakeryCard key={p.id} className="nb-shadow-soft overflow-hidden">
            <div className="aspect-video overflow-hidden border-b-2 border-ink bg-cream">
              <img src={p.images[0]?.url} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-bold text-sm leading-tight">{p.name}</h3>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-cream" aria-label="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => del(p)} className="p-1.5 rounded-lg hover:bg-cream text-burgundy" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{p.categoryName}</div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {p.isFeatured && <Pill color="terracotta" className="text-[10px]">Featured</Pill>}
                {p.isBestSeller && <Pill color="mustard" className="text-[10px]">Bestseller</Pill>}
                {p.eggless && <Pill color="cream" className="text-[10px]">Eggless</Pill>}
                {!p.isFeatured && !p.isBestSeller && !p.eggless && (
                  <span className="text-[10px] text-muted-foreground">—</span>
                )}
              </div>
              <div className="mt-2 text-xs">
                from <b className="text-terracotta">{inr(Math.min(...p.weights.map((w) => w.price)))}</b>
                {" · "}
                <span className="text-muted-foreground">{p.weights.length} weights</span>
              </div>
            </div>
          </BakeryCard>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto nb-scroll bg-cream border-2.5 border-ink nb-shadow-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-black text-xl">
              {editing ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editing}
            categories={categories}
            onClose={() => setOpen(false)}
            onSaved={() => {
              setOpen(false);
              qc.invalidateQueries({ queryKey: ["admin-products"] });
              qc.invalidateQueries({ queryKey: ["products"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: any;
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(() => ({
    name: product?.name || "",
    slug: product?.slug || "",
    categoryId: String(product?.categoryId || categories[0]?.id || ""),
    description: product?.description || "",
    ingredients: product?.ingredients || "",
    prepHours: product?.prepHours ?? 24,
    eggless: product?.eggless ?? false,
    isFeatured: product?.isFeatured ?? false,
    isBestSeller: product?.isBestSeller ?? false,
    isFreshToday: product?.isFreshToday ?? false,
    isSeasonal: product?.isSeasonal ?? false,
    status: product?.status || "active",
    tags: (product?.tags || []).join(", "),
    images: (product?.images || []).map((i: any) => i.url) || [],
    weights: product?.weights?.map((w: any) => ({ weight: w.weight, price: w.price, mrp: w.mrp || "" })) || WEIGHTS.slice(0, 3).map((w) => ({ weight: w.weight, price: 600, mrp: "" })),
  }));
  const [saving, setSaving] = useState(false);
  const [aiDescLoading, setAiDescLoading] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const selectedCategoryId = categories.some(
    (category) => String(category.id) === String(form.categoryId)
  )
    ? String(form.categoryId)
    : String(categories[0]?.id || "");

  const genDesc = async () => {
    if (!form.name) return toast.error("Enter a name first");
    setAiDescLoading(true);
    try {
      const cat = categories.find((c) => String(c.id) === selectedCategoryId)?.name || "cake";
      const r = await api.adminAiDesc({
        name: form.name,
        category: cat,
        ingredients: form.ingredients || "premium ingredients",
        eggless: form.eggless,
        weight: form.weights.map((w) => `${w.weight}lb`).join(", "),
      });
      set("description", r.description);
      toast.success("AI description generated!");
    } catch {
      toast.error("Could not generate description");
    } finally {
      setAiDescLoading(false);
    }
  };

  const genSeo = async () => {
    if (!form.name) return toast.error("Enter a name first");
    setSeoLoading(true);
    try {
      const cat = categories.find((c) => String(c.id) === selectedCategoryId)?.name || "cake";
      const r = await api.adminAiSeo({
        name: form.name,
        category: cat,
        eggless: form.eggless,
        description: form.description,
      });
      toast.success(`SEO Title: ${r.title}\nMeta: ${r.metaDescription}`, { duration: 6000 });
    } catch {
      toast.error("Could not generate SEO");
    } finally {
      setSeoLoading(false);
    }
  };

  const save = async () => {
    if (!form.name) return toast.error("Name required");
    if (!selectedCategoryId) return toast.error("Category required");
    if (!categories.some((category) => String(category.id) === selectedCategoryId)) {
      return toast.error("Please choose a valid category");
    }
    if (form.images.length === 0) return toast.error("Add at least one image");
    setSaving(true);
    const payload = {
      ...form,
      categoryId: selectedCategoryId,
      tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
      weights: form.weights.filter((w: any) => w.price).map((w: any) => ({
        weight: w.weight,
        label: WEIGHTS.find((x) => x.weight === w.weight)?.label || `${w.weight} Pound`,
        price: Number(w.price),
        mrp: w.mrp ? Number(w.mrp) : null,
      })),
      prepHours: Number(form.prepHours),
    };
    try {
      if (product) {
        await api.adminUpdateProduct(product.slug, payload);
        toast.success("Product updated");
      } else {
        await api.adminCreateProduct(payload);
        toast.success("Product created");
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Name *">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
        </Field>
        <div>
          <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category *</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            disabled={categories.length === 0}
            className={inputCls + " font-semibold disabled:opacity-60"}
          >
            {categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <Field label="Description">
        <div className="relative">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className={inputCls + " resize-none"} />
          <button
            onClick={genDesc}
            disabled={aiDescLoading}
            className="absolute top-2 right-2 text-xs font-bold text-terracotta flex items-center gap-1 bg-cream border-2 border-ink rounded-full px-2 py-1 nb-shadow-sm nb-press disabled:opacity-50"
          >
            {aiDescLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI
          </button>
        </div>
      </Field>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Ingredients & allergens">
          <textarea value={form.ingredients} onChange={(e) => set("ingredients", e.target.value)} rows={3} className={inputCls + " resize-none"} />
        </Field>
        <div className="space-y-3">
          <Field label="Prep time (hours)">
            <input type="number" value={form.prepHours} onChange={(e) => set("prepHours", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Tags (comma separated)">
            <input value={form.tags} onChange={(e) => set("tags", e.target.value)} className={inputCls} placeholder="chocolate, birthday" />
          </Field>
        </div>
      </div>

      {/* flags */}
      <div className="flex flex-wrap gap-3">
        {[
          { k: "eggless", l: "Eggless" },
          { k: "isFeatured", l: "Featured" },
          { k: "isBestSeller", l: "Bestseller" },
          { k: "isFreshToday", l: "Fresh Today" },
          { k: "isSeasonal", l: "Seasonal" },
        ].map((f) => (
          <label key={f.k} className="flex items-center gap-1.5 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={form[f.k]}
              onChange={(e) => set(f.k, e.target.checked)}
              className="w-4 h-4 accent-terracotta"
            />
            {f.l}
          </label>
        ))}
      </div>

      {/* weights */}
      <Field label="Weight pricing (₹)">
        <div className="space-y-2">
          {form.weights.map((w: any, i: number) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={w.weight}
                onChange={(e) => {
                  const next = [...form.weights];
                  next[i] = { ...w, weight: e.target.value };
                  set("weights", next);
                }}
                className={inputCls + " flex-1"}
              >
                {WEIGHTS.map((x) => (
                  <option key={x.weight} value={x.weight}>{x.label}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Price"
                value={w.price}
                onChange={(e) => {
                  const next = [...form.weights];
                  next[i] = { ...w, price: e.target.value };
                  set("weights", next);
                }}
                className={inputCls + " w-24"}
              />
              <input
                type="number"
                placeholder="MRP"
                value={w.mrp}
                onChange={(e) => {
                  const next = [...form.weights];
                  next[i] = { ...w, mrp: e.target.value };
                  set("weights", next);
                }}
                className={inputCls + " w-24"}
              />
              <button
                onClick={() => set("weights", form.weights.filter((_: any, j: number) => j !== i))}
                className="text-burgundy p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <BakeryButton variant="outline" className="!py-1.5 text-xs" onClick={() => set("weights", [...form.weights, { weight: "1", price: 600, mrp: "" }])}>
            <Plus size={13} className="mr-1" /> Add weight
          </BakeryButton>
        </div>
      </Field>

      {/* images — URL only, multiple rows */}
      <Field label="Image URLs (add multiple)">
        <div className="space-y-2">
          {form.images.length === 0 && (
            <div className="text-xs text-muted-foreground bg-cream border-2 border-dashed border-ink/20 rounded-xl p-2.5 text-center">
              No images added yet. Paste an image URL below and click Add.
            </div>
          )}
          {form.images.map((url: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg border-2 border-ink overflow-hidden nb-shadow-sm shrink-0 bg-cream">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
              <input
                value={url}
                onChange={(e) => {
                  const next = [...form.images];
                  next[i] = e.target.value;
                  set("images", next);
                }}
                placeholder="https://example.com/cake-image.png"
                className={inputCls + " flex-1"}
              />
              <button
                type="button"
                onClick={() => set("images", form.images.filter((_: any, j: number) => j !== i))}
                className="w-8 h-8 rounded-full bg-burgundy text-white border-2 border-ink flex items-center justify-center nb-shadow-sm nb-press shrink-0"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL here…"
              className={inputCls + " flex-1"}
            />
            <BakeryButton
              variant="cream"
              className="!py-2 text-xs shrink-0"
              onClick={() => {
                if (imageUrl.trim()) {
                  set("images", [...form.images, imageUrl.trim()]);
                  setImageUrl("");
                }
              }}
            >
              <Plus size={14} className="mr-1" /> Add
            </BakeryButton>
          </div>
        </div>
      </Field>

      {/* AI SEO */}
      <BakeryButton variant="outline" className="text-sm" onClick={genSeo} disabled={seoLoading}>
        {seoLoading ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : <Wand2 size={15} className="mr-1.5" />}
        Generate AI SEO title &amp; meta
      </BakeryButton>

      <div className="flex justify-end gap-2 pt-2 border-t-2 border-ink/15">
        <BakeryButton variant="ghost" onClick={onClose}>Cancel</BakeryButton>
        <BakeryButton variant="primary" onClick={save} disabled={saving || categories.length === 0}>
          {saving ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : null}
          {product ? "Save changes" : "Create product"}
        </BakeryButton>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-cream border-2 border-ink rounded-xl px-3 py-2 text-sm outline-none focus:border-terracotta";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground mb-1 block">{label}</label>
      {children}
    </div>
  );
}
