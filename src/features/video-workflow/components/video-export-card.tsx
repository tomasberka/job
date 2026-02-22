import type { VideoExport, VideoExportStatus } from "../types/video-export";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  VideoExportStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  queued: { label: "Ve frontě", variant: "outline" },
  rendering: { label: "Renderuje se", variant: "secondary" },
  exported: { label: "Exportováno", variant: "secondary" },
  uploading: { label: "Nahrávání", variant: "secondary" },
  published: { label: "Publikováno", variant: "default" },
  failed: { label: "Chyba", variant: "destructive" },
};

const platformColors: Record<string, string> = {
  youtube: "text-red-400",
  tiktok: "text-pink-400",
  instagram: "text-purple-400",
  internal: "text-blue-400",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface VideoExportCardProps {
  videoExport: VideoExport;
}

export function VideoExportCard({ videoExport: ve }: VideoExportCardProps) {
  const status = statusConfig[ve.status];

  return (
    <Card className="glass border-white/8 transition-all duration-200 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "mb-0.5 text-xs font-bold uppercase tracking-widest",
                platformColors[ve.platform]
              )}
            >
              {ve.platform}
            </p>
            <CardTitle className="truncate text-base text-foreground">
              {ve.title}
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {ve.resolution} · {ve.format} · {formatDuration(ve.duration)}
            </p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        {ve.status === "rendering" && (
          <div>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Renderuje se</span>
              <span>{ve.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${ve.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* DaVinci info */}
        <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <div className="font-medium text-foreground/70">DaVinci Resolve</div>
          <div className="mt-1 space-y-0.5">
            <div>Projekt: {ve.davinci.project}</div>
            <div>Časová osa: {ve.davinci.timeline}</div>
            {ve.davinci.colorGrade && (
              <div className="text-green-400/80">✓ Korekce barev</div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground/70">
          <span>{ve.fileSize.toLocaleString()} MB</span>
          <span>SKU: {ve.productSku}</span>
        </div>
      </CardContent>
    </Card>
  );
}
