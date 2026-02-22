import type { PCProduct, PCStatus } from "../types/pc-product";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, HardDrive, MemoryStick, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  PCStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  "in-stock": { label: "In Stock", variant: "default" },
  "low-stock": { label: "Low Stock", variant: "secondary" },
  "out-of-stock": { label: "Out of Stock", variant: "destructive" },
  "pre-order": { label: "Pre-order", variant: "outline" },
};

const lineupColors: Record<string, string> = {
  "GAMER SE": "text-blue-400",
  "GAMER Pro": "text-purple-400",
  "GAMER Max": "text-amber-400",
};

interface PCProductCardProps {
  product: PCProduct;
}

export function PCProductCard({ product }: PCProductCardProps) {
  const status = statusConfig[product.status];

  return (
    <Card className="glass border-white/8 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p
              className={cn(
                "mb-0.5 text-xs font-bold uppercase tracking-widest",
                lineupColors[product.lineup]
              )}
            >
              {product.lineup}
            </p>
            <CardTitle className="text-base text-foreground">
              {product.name}
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">{product.sku}</p>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {product.price.toLocaleString("cs-CZ")} Kč
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Cpu className="h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
            <span className="truncate">{product.specs.cpu}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Zap className="h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
            <span className="truncate">{product.specs.gpu}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MemoryStick className="h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
            <span className="truncate">{product.specs.ram}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <HardDrive className="h-3.5 w-3.5 flex-shrink-0 text-primary/70" />
            <span className="truncate">{product.specs.storage}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
        {product.stock > 0 && (
          <p className="text-xs text-muted-foreground/70">
            {product.stock} units available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
