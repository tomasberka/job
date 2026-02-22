import type { ContentItem, ContentStatus } from "../types/content-item";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  ContentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Draft", variant: "outline" },
  review: { label: "In Review", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  published: { label: "Published", variant: "default" },
};

const typeLabels: Record<string, string> = {
  "tiktok-hook": "TikTok Hook",
  "seo-meta": "SEO Meta",
  "video-script": "Video Script",
  "product-description": "Product Description",
};

const typeColors: Record<string, string> = {
  "tiktok-hook": "text-pink-400",
  "seo-meta": "text-green-400",
  "video-script": "text-blue-400",
  "product-description": "text-orange-400",
};

interface ContentCardProps {
  item: ContentItem;
}

export function ContentCard({ item }: ContentCardProps) {
  const status = statusConfig[item.status];

  return (
    <Card className="glass border-white/8 transition-all duration-200 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className={cn(
                "mb-0.5 text-xs font-bold uppercase tracking-widest",
                typeColors[item.type]
              )}
            >
              {typeLabels[item.type]}
            </p>
            <CardTitle className="text-base text-foreground">
              {item.title}
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              SKU: {item.productSku}
            </p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{item.body}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
