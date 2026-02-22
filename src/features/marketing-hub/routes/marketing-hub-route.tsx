"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  FileText,
  Monitor,
  Radio,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  TrendingUp,
  Shield,
  Package,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    href: "/feed.xml",
    title: "Social/feed distribuce",
    description:
      "Kontroluj RSS feed pro syndikaci produktů a obsahovou automatizaci.",
    icon: Radio,
    output: "Lepší discoverability přes feed a agregátory.",
  },
];

const dailyLoop = [
  { id: "trends", text: "Ráno: zkontroluj trend témata a vyber 1-2 priority", module: "/social-posts" },
  { id: "inventory", text: "Zkontroluj PC inventář a dostupnost produktů", module: "/pc-inventory" },
  { id: "seo", text: "Poledne: vygeneruj SEO + social copy pro vybrané produkty", module: "/content-generator" },
  { id: "social", text: "Vytvoř social posty pro 2-3 platformy", module: "/social-posts" },
  { id: "publish", text: "Večer: publikuj, odpověz na komentáře, zapiš výsledek", module: null },
];

const systemStatus = [
  { label: "Build Status", value: "Passing", status: "success" as const, icon: CheckCircle2 },
  { label: "Security", value: "0 vulnerabilities", status: "success" as const, icon: Shield },
  { label: "Dependencies", value: "278 packages", status: "info" as const, icon: Package },
  { label: "Last Deploy", value: "Local dev", status: "info" as const, icon: Clock },
];

const quickDocs = [
  { title: "System Profile", href: "/SYSTEM_PROFILE.md", desc: "Complete system analysis" },
  { title: "One-Man Workflow", href: "/ONE_MAN_MARKETING_SYSTEM.md", desc: "60-90 min daily routine" },
  { title: "Social Strategy", href: "/SOCIAL_STRATEGY_MASTERY.md", desc: "Pro tactics & tone guide" },
  { title: "Quick Reference", href: "/QUICK_REFERENCE.md", desc: "1-page cheat sheet" },
];

const trendingTopicsPreview = [
  { topic: "RTX 5090 Gaming Performance", volume: "6.2K", relevance: "98%" },
  { topic: "GTA VI System Requirements", volume: "8.5K", relevance: "95%" },
  { topic: "Best Gaming PC Under 1000 USD", volume: "4.8K", relevance: "92%" },
];

export function MarketingHubRoute() {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // in seconds

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = dailyLoop.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const targetTime = 90 * 60; // 90 minutes in seconds
  const timerPercent = Math.min((timeElapsed / targetTime) * 100, 100);

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
        {/* Header */}
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="w-fit">
                One-Man Marketing OS
              </Badge>
              <div className="flex gap-2">
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(timeElapsed)}
                </Badge>
                <Badge
                  variant={progressPercent === 100 ? "default" : "secondary"}
                  className="gap-1"
                >
                  {completedCount}/{totalCount} Done
                </Badge>
              </div>
            </div>
            <CardTitle className="text-2xl">Marketing Command Center</CardTitle>
            <CardDescription className="max-w-3xl text-sm">
              Sjednocený one-man marketing systém: E-shop → SEO → Social → Video → Feed.
              Všechno na jednom místě, připraveno k akci.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* System Status */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {systemStatus.map(({ label, value, status, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${status === "success"
                      ? "bg-green-500/15 text-green-500"
                      : "bg-blue-500/15 text-blue-500"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Modules + Checklist */}
          <div className="space-y-6 lg:col-span-2">
            {/* Quick Actions Grid */}
            <div>
              <h3 className="mb-3 text-sm font-semibold">Quick Actions</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {moduleCards.map(({ href, title, description, icon: Icon, output, badge }) => (
                  <Link key={href} href={href} className="group">
                    <Card className="h-full transition-colors group-hover:border-primary/60">
                      <CardHeader className="space-y-2 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          {badge ? <Badge className="text-[10px] py-0 px-1.5">{badge}</Badge> : null}
                        </div>
                        <CardTitle className="text-sm">{title}</CardTitle>
                        <CardDescription className="text-xs">{description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-[11px] text-muted-foreground">{output}</p>
                        <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                          Open
                          <ArrowRight className="h-3 w-3" />
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Daily Checklist */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Today's Workflow</CardTitle>
                    <CardDescription>60-90 min solo execution routine</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setChecklist({})}
                      className="h-8 gap-1 text-xs"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </Button>
                    <Button
                      variant={timerRunning ? "outline" : "default"}
                      size="sm"
                      onClick={() => setTimerRunning(!timerRunning)}
                      className="h-8 gap-1 text-xs"
                    >
                      {timerRunning ? (
                        <>
                          <Pause className="h-3 w-3" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" />
                          Start
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress: {progressPercent}%</span>
                    <span>Timer: {Math.round(timerPercent)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {dailyLoop.map((step) => {
                  const checked = checklist[step.id] || false;
                  return (
                    <div
                      key={step.id}
                      className={`group flex items-start gap-3 rounded-lg border p-3 transition-colors ${checked ? "border-primary/30 bg-primary/5" : "bg-card"
                        }`}
                    >
                      <button
                        onClick={() => toggleChecklistItem(step.id)}
                        className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
                      >
                        {checked ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${checked ? "text-muted-foreground line-through" : ""
                            }`}
                        >
                          {step.text}
                        </p>
                        {step.module && (
                          <Link
                            href={step.module}
                            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            Go to module
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-6">
            {/* Trending Topics Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Trending Topics</CardTitle>
                  <Link href="/social-posts">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                      View All
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                <CardDescription className="text-xs">
                  Real-time gaming PC trends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {trendingTopicsPreview.map((topic) => (
                  <div
                    key={topic.topic}
                    className="rounded-lg border bg-card p-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium leading-snug">{topic.topic}</p>
                      <TrendingUp className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                    </div>
                    <div className="mt-1.5 flex gap-3 text-[11px] text-muted-foreground">
                      <span>Vol: {topic.volume}</span>
                      <span>Rel: {topic.relevance}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Documentation */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Documentation</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Essential guides & references
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickDocs.map((doc) => (
                  <a
                    key={doc.href}
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-lg border bg-card p-2.5 text-xs transition-colors hover:border-primary/40"
                  >
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-[11px] text-muted-foreground">{doc.desc}</p>
                    </div>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground group-hover:text-primary" />
                  </a>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TypeScript Files</span>
                  <span className="font-semibold">38 files</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Code Lines</span>
                  <span className="font-semibold">2,615 lines</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Python Tools</span>
                  <span className="font-semibold">14 files</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Documentation</span>
                  <span className="font-semibold">10 guides</span>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500 font-semibold">All Systems Operational</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Info */}
        <Card>
          <CardContent className="grid gap-4 p-4 text-sm md:grid-cols-3">
            <div className="rounded-lg border bg-card p-3">
              <p className="font-semibold">🎯 Cíl</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Zvýšit organický reach, engagement a kvalitu obsahu bez dalšího člena týmu.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="font-semibold">🎮 Fokus</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Gaming PC setupy, produktové benefity, trendy témata a důkaz výkonu.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="font-semibold">📦 Výstup</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Každý den minimálně 1 obsahový batch připravený pro publikaci.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
