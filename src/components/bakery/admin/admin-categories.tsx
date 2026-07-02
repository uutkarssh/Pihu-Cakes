"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BakeryButton, BakeryCard } from "../ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AdminCategories() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const catsQ = useQuery({ queryKey: ["categories"], queryFn: api.categories });
  const categories = catsQ.data?.categories ?? [];

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setOpen(true);
  };

  const del = async (c: any) => {
    if (!confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
    try {
      await api.adminDeleteCategory(c.id);
      toast.success("Category deleted");
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <BakeryCard className="nb-shadow-soft p-4 flex items-center justify-between">
        <h3 className="font-display font-bold text-lg">Categories</h3>
        <BakeryButton variant="primary" onClick={openNew}>
          <Plus size={16} className="mr-1" /> Add Category
        </BakeryButton>
      </BakeryCard>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <BakeryCard key={c.id} className="nb-shadow-soft p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1">
                <h4 className="font-display font-bold text-base">{c.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{c.slug}</p>
                {c.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.description}</p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(c)}
                  className="p-1.5 rounded-lg hover:bg-cream"
                  aria-label="Edit"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => del(c)}
                  className="p-1.5 rounded-lg hover:bg-cream text-burgundy"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Order: <span className="font-semibold">{c.order}</span>
            </div>
          </BakeryCard>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-cream border-2.5 border-ink nb-shadow-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display font-black text-xl">
              {editing ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editing}
            onClose={() => setOpen(false)}
            onSaved={() => {
              setOpen(false);
              qc.invalidateQueries({ queryKey: ["categories"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(() => ({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    icon: category?.icon || "",
    order: category?.order ?? 0,
  }));
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    setSaving(true);
    try {
      if (category) {
        await api.adminUpdateCategory(category.id, form);
        toast.success("Category updated");
      } else {
        await api.adminCreateCategory(form);
        toast.success("Category created");
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Name *</label>
        <input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g., Birthday Cakes"
          className={inputCls}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Slug</label>
        <input
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="auto-generated from name"
          className={inputCls}
        />
        <p className="text-xs text-muted-foreground mt-1">Leave empty to auto-generate</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Optional category description"
          rows={3}
          className={inputCls + " resize-none"}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1 block">Order</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => set("order", Number(e.target.value))}
          placeholder="Display order"
          className={inputCls}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t-2 border-ink/15">
        <BakeryButton variant="ghost" onClick={onClose}>
          Cancel
        </BakeryButton>
        <BakeryButton variant="primary" onClick={save} disabled={saving}>
          {saving ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : null}
          {category ? "Save changes" : "Create category"}
        </BakeryButton>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-cream border-2 border-ink rounded-xl px-3 py-2 text-sm outline-none focus:border-terracotta";
