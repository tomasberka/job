"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVideoExports } from "../services/video-workflow-service";
import { VideoExportCard } from "../components/video-export-card";
import { Video } from "lucide-react";

export function VideoWorkflowRoute() {
  const { data: exports, isLoading } = useQuery({
    queryKey: ["video-exports"],
    queryFn: fetchVideoExports,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Video Workflow | HelloComp",
    description:
      "DaVinci Resolve export tracking and video production workflow for HelloComp.",
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
              Video Workflow
            </h1>
            <p className="text-sm text-muted-foreground">
              DaVinci Resolve export tracking
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
