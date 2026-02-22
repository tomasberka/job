"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPCInventory } from "../services/pc-inventory-service";
import { PCProductCard } from "../components/pc-product-card";
import { CreatePCDialog } from "../components/create-pc-dialog";
import { Monitor } from "lucide-react";

export function PCInventoryRoute() {
  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ["pc-inventory"],
    queryFn: fetchPCInventory,
    retry: 3,
    staleTime: 60_000,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "HelloComp herní PC — kompletní nabídka",
    description:
      "Série GAMER SE, Pro a Max — herní počítače od HelloComp.cz",
    url: "https://hellocomp.cz",
    itemListElement: (products ?? []).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        sku: p.sku,
        description: `${p.specs.cpu} | ${p.specs.gpu} | ${p.specs.ram}`,
        ...(p.imageUrl ? { image: p.imageUrl } : {}),
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: p.currency,
          availability:
            p.status === "in-stock"
              ? "https://schema.org/InStock"
              : p.status === "pre-order"
              ? "https://schema.org/PreOrder"
              : "https://schema.org/OutOfStock",
        },
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sklad PC</h1>
              <p className="text-sm text-muted-foreground">
                HelloComp GAMER SE · Pro · Max — aktuální zásoby
              </p>
            </div>
          </div>
          <CreatePCDialog />
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
              Nepodařilo se načíst produkty
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Neznámá chyba"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(products ?? []).map((product) => (
              <PCProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
