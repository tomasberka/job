"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchContentItems } from "../services/content-service";
import { ContentCard } from "../components/content-card";
import { FileText } from "lucide-react";

export function ContentGeneratorRoute() {
  const { data: items, isLoading } = useQuery({
    queryKey: ["content-items"],
    queryFn: fetchContentItems,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Content Generator | HelloComp",
    description:
      "Automate TikTok hooks, SEO metadata and video scripts for HelloComp products.",
    url: "https://hellocomp.cz/content-generator",
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
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Generátor obsahu
            </h1>
            <p className="text-sm text-muted-foreground">
              TikTok hooky · SEO meta · Video skripty
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-xl bg-muted/40"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(items ?? []).map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
