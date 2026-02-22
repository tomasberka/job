"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPCProduct } from "../services/pc-inventory-service";
import type { CreatePCProduct, PCLineup, PCStatus } from "../types/pc-product";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const emptyForm: CreatePCProduct = {
  sku: "",
  name: "",
  lineup: "GAMER SE",
  price: 0,
  specs: { cpu: "", gpu: "", ram: "", storage: "", cooling: "", psu: "" },
  status: "pre-order",
  stock: 0,
  imageUrl: "",
  tags: [],
};

export function CreatePCDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreatePCProduct>({ ...emptyForm });
  const [tagInput, setTagInput] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPCProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pc-inventory"] });
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
          <Plus className="mr-1.5 h-4 w-4" /> Nový produkt
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-foreground">
              Nový produkt
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
                <label className={labelClass}>Název *</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>SKU *</label>
                <input className={inputClass} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Řada</label>
                <select className={inputClass} value={form.lineup} onChange={(e) => setForm({ ...form, lineup: e.target.value as PCLineup })}>
                  <option value="GAMER SE">GAMER SE</option>
                  <option value="GAMER Pro">GAMER Pro</option>
                  <option value="GAMER Max">GAMER Max</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Cena (Kč) *</label>
                <input type="number" className={inputClass} value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required min={1} />
              </div>
              <div>
                <label className={labelClass}>Stav</label>
                <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PCStatus })}>
                  <option value="in-stock">Skladem</option>
                  <option value="low-stock">Poslední kusy</option>
                  <option value="out-of-stock">Vyprodáno</option>
                  <option value="pre-order">Předobjednávka</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>CPU *</label>
                <input className={inputClass} value={form.specs.cpu} onChange={(e) => setForm({ ...form, specs: { ...form.specs, cpu: e.target.value } })} required />
              </div>
              <div>
                <label className={labelClass}>GPU *</label>
                <input className={inputClass} value={form.specs.gpu} onChange={(e) => setForm({ ...form, specs: { ...form.specs, gpu: e.target.value } })} required />
              </div>
              <div>
                <label className={labelClass}>RAM *</label>
                <input className={inputClass} value={form.specs.ram} onChange={(e) => setForm({ ...form, specs: { ...form.specs, ram: e.target.value } })} required />
              </div>
              <div>
                <label className={labelClass}>Úložiště *</label>
                <input className={inputClass} value={form.specs.storage} onChange={(e) => setForm({ ...form, specs: { ...form.specs, storage: e.target.value } })} required />
              </div>
              <div>
                <label className={labelClass}>Chlazení</label>
                <input className={inputClass} value={form.specs.cooling} onChange={(e) => setForm({ ...form, specs: { ...form.specs, cooling: e.target.value } })} />
              </div>
              <div>
                <label className={labelClass}>Zdroj</label>
                <input className={inputClass} value={form.specs.psu} onChange={(e) => setForm({ ...form, specs: { ...form.specs, psu: e.target.value } })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Sklad (ks)</label>
                <input type="number" className={inputClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} min={0} />
              </div>
              <div>
                <label className={labelClass}>Tagy</label>
                <div className="flex gap-1">
                  <input className={inputClass} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Enter = přidat" />
                </div>
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
