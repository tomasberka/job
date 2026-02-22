"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVideoExports } from "../services/video-workflow-service";
import { VideoExportCard } from "../components/video-export-card";
import { Video } from "lucide-react";

export function VideoWorkflowRoute() {
  const { data: exports, isLoading, isError, error } = useQuery({
    queryKey: ["video-exports"],
    queryFn: fetchVideoExports,
    retry: 3,
    staleTime: 60_000,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Video produkce | HelloComp",
    description:
      "Sledování exportů DaVinci Resolve a správa video produkce HelloComp.",
    url: "https://hellocomp.cz/video-workflow",
    publisher: {
      "@type": "Organization",
      name: "HelloComp",
      url: "https://hellocomp.cz",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Video produkce
            </h1>
            <p className="text-sm text-muted-foreground">
              Správa exportů DaVinci Resolve
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-xl bg-muted/40"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-medium text-destructive">
              Nepodařilo se načíst exporty
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Neznámá chyba"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(exports ?? []).map((ve) => (
              <VideoExportCard key={ve.id} videoExport={ve} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
