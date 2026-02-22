"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContentItem } from "../services/content-service";
import type { CreateContentItem, ContentType, ContentStatus } from "../types/content-item";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const emptyForm: CreateContentItem = {
  type: "tiktok-hook",
  productSku: "",
  title: "",
  body: "",
  status: "draft",
  tags: [],
};

export function CreateContentDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateContentItem>({ ...emptyForm });
  const [tagInput, setTagInput] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createContentItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-items"] });
      setForm({ ...emptyForm });
      setTagInput("");
      setOpen(false);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
      setTagInput("");
    }
  }

  const inputClass =
    "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none";
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Nový obsah
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-foreground">
              Nový obsah
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Typ</label>
                <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ContentType })}>
                  <option value="tiktok-hook">TikTok Hook</option>
                  <option value="seo-meta">SEO Meta</option>
                  <option value="video-script">Video skript</option>
                  <option value="product-description">Popis produktu</option>
                  <option value="social-post">Social Post</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Stav</label>
                <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ContentStatus })}>
                  <option value="draft">Koncept</option>
                  <option value="review">Ke schválení</option>
                  <option value="approved">Schváleno</option>
                  <option value="published">Publikováno</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Název *</label>
                <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>SKU produktu *</label>
                <input className={inputClass} value={form.productSku} onChange={(e) => setForm({ ...form, productSku: e.target.value })} required placeholder="HC-GAMER-..." />
              </div>
            </div>

            <div>
              <label className={labelClass}>Obsah *</label>
              <textarea className={`${inputClass} min-h-[100px] resize-y`} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required rows={4} />
            </div>

            <div>
              <label className={labelClass}>Tagy</label>
              <div className="flex gap-1">
                <input className={inputClass} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Enter = přidat" />
              </div>
            </div>

            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    #{tag}
                    <button type="button" onClick={() => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })} className="hover:text-foreground">×</button>
                  </span>
                ))}
              </div>
            )}

            {mutation.isError && (
              <p className="text-xs text-destructive">Chyba: {mutation.error instanceof Error ? mutation.error.message : "Neznámá chyba"}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="ghost" size="sm">Zrušit</Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={mutation.isPending}>
                {mutation.isPending ? "Ukládám…" : "Vytvořit"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
