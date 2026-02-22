import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Monitor,
  Radio,
  Sparkles,
  Video,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const moduleCards = [
  {
    href: "/pc-inventory",
    title: "E-shop setup & nabídka",
    description:
      "Aktualizuj SKU, ceny, dostupnost a klíčové specifikace pro gaming PC sestavy.",
    icon: Monitor,
    output: "Zdroj pravdy pro produktové texty i feed.",
  },
  {
    href: "/content-generator",
    title: "SEO copywriting",
    description:
      "Generuj hooky, meta texty a video skripty pro produktové stránky i kampaně.",
    icon: FileText,
    output: "Konzistentní copy pro web, blog a short-form video.",
  },
  {
    href: "/social-posts",
    title: "Social engagement",
    description:
      "Vytvářej trend-aware posty pro TikTok, Instagram, X, LinkedIn a YouTube Shorts.",
    icon: Sparkles,
    output: "Vyšší engagement díky tématům, tónu a platform fitu.",
    badge: "HIGH IMPACT",
  },
  {
    href: "/video-workflow",
    title: "Graphics & video ops",
    description:
      "Řiď exporty, stav videí a denní publikaci kreativy z jednoho místa.",
    icon: Video,
    output: "Stabilní obsahový rytmus bez chaosu.",
  },
  {
    href: "/feed.xml",
    title: "Social/feed distribuce",
    description:
      "Kontroluj RSS feed pro syndikaci produktů a obsahovou automatizaci.",
    icon: Radio,
    output: "Lepší discoverability přes feed a agregátory.",
  },
];

const dailyLoop = [
  "Ráno: zkontroluj trend témata a vyber 1-2 priority.",
  "Poledne: vygeneruj SEO + social copy pro vybrané produkty.",
  "Odpoledne: dokonči vizuál/video a připrav publikaci.",
  "Večer: publikuj, odpověz na komentáře, zapiš výsledek.",
];

export function MarketingHubRoute() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "One-Man Marketing Hub | HelloComp",
    description:
      "Sjednocený marketing workflow pro SEO, copywriting, social engagement, feed distribuci a video produkci.",
    url: "https://hellocomp.cz",
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
        <Card>
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit">
              One-Man Marketing OS
            </Badge>
            <CardTitle className="text-2xl">Přehled marketingového systému</CardTitle>
            <CardDescription className="max-w-3xl text-sm">
              Všechny části repozitáře jsou sjednocené do jednoho provozního
              workflow: e-shop data → SEO copywriting → social posty → video
              produkce → feed distribuce.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-3">
            <div className="rounded-lg border bg-card p-3">
              <p className="font-semibold">Cíl</p>
              <p className="mt-1 text-muted-foreground">
                Zvýšit organický reach, engagement a kvalitu obsahu bez dalšího
                člena týmu.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="font-semibold">Fokus</p>
              <p className="mt-1 text-muted-foreground">
                Gaming PC setupy, produktové benefity, trendy témata a důkaz
                výkonu.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="font-semibold">Výstup</p>
              <p className="mt-1 text-muted-foreground">
                Každý den minimálně 1 obsahový batch připravený pro publikaci.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {moduleCards.map(({ href, title, description, icon: Icon, output, badge }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/60">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    {badge ? <Badge>{badge}</Badge> : null}
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">{output}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Otevřít modul
                    <ArrowRight className="h-3.5 w-3.5" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Denní loop pro solo marketing</CardTitle>
            <CardDescription>
              Minimal workflow pro konzistentní SEO + social výkon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-muted-foreground">
              {dailyLoop.map((step) => (
                <li key={step} className="rounded-md border bg-card px-3 py-2">
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
