"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVideoExport } from "../services/video-workflow-service";
import type { CreateVideoExport, VideoPlatform, VideoFormat } from "../types/video-export";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const emptyForm: CreateVideoExport = {
  title: "",
  productSku: "",
  platform: "youtube",
  format: "H.264 MP4",
  resolution: "1080p 60fps",
  duration: 0,
  fileSize: 0,
  davinci: { project: "", timeline: "", colorGrade: false },
};

export function CreateVideoDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateVideoExport>({ ...emptyForm });
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createVideoExport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["video-exports"] });
      setForm({ ...emptyForm });
      setOpen(false);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  const inputClass =
    "w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none";
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1";

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Nový export
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-bold text-foreground">
              Nový video export
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
                <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className={labelClass}>SKU produktu *</label>
                <input className={inputClass} value={form.productSku} onChange={(e) => setForm({ ...form, productSku: e.target.value })} required placeholder="HC-GAMER-..." />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Platforma</label>
                <select className={inputClass} value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as VideoPlatform })}>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="internal">Interní</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Formát</label>
                <select className={inputClass} value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as VideoFormat })}>
                  <option value="H.264 MP4">H.264 MP4</option>
                  <option value="H.265 MP4">H.265 MP4</option>
                  <option value="ProRes 422">ProRes 422</option>
                  <option value="DNxHD">DNxHD</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Rozlišení</label>
                <select className={inputClass} value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })}>
                  <option value="1080p 30fps">1080p 30fps</option>
                  <option value="1080p 60fps">1080p 60fps</option>
                  <option value="4K 30fps">4K 30fps</option>
                  <option value="4K 60fps">4K 60fps</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Délka (s)</label>
                <input type="number" className={inputClass} value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} min={0} />
              </div>
              <div>
                <label className={labelClass}>Velikost (MB)</label>
                <input type="number" className={inputClass} value={form.fileSize || ""} onChange={(e) => setForm({ ...form, fileSize: Number(e.target.value) })} min={0} />
              </div>
            </div>

            <fieldset className="rounded-lg border border-white/8 p-3">
              <legend className="px-1 text-xs font-medium text-muted-foreground">DaVinci Resolve</legend>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Projekt *</label>
                  <input className={inputClass} value={form.davinci.project} onChange={(e) => setForm({ ...form, davinci: { ...form.davinci, project: e.target.value } })} required />
                </div>
                <div>
                  <label className={labelClass}>Časová osa *</label>
                  <input className={inputClass} value={form.davinci.timeline} onChange={(e) => setForm({ ...form, davinci: { ...form.davinci, timeline: e.target.value } })} required />
                </div>
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={form.davinci.colorGrade} onChange={(e) => setForm({ ...form, davinci: { ...form.davinci, colorGrade: e.target.checked } })} className="rounded" />
                Korekce barev
              </label>
            </fieldset>

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
