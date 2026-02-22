"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Monitor,
  FileText,
  Video,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Přehled",
    icon: LayoutDashboard,
  },
  {
    href: "/pc-inventory",
    label: "Sklad PC",
    icon: Monitor,
  },
  {
    href: "/content-generator",
    label: "Obsah",
    icon: FileText,
  },
  {
    href: "/video-workflow",
    label: "Video produkce",
    icon: Video,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass flex h-full w-64 flex-shrink-0 flex-col border-r border-white/8 py-6">
      {/* Logo */}
      <div className="mb-8 px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none tracking-tight text-foreground">
              HelloComp
            </p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Řídicí panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-5">
        <div className="rounded-lg border border-white/8 bg-white/4 px-3 py-3">
          <p className="text-[11px] font-semibold text-muted-foreground">
            hellocomp.cz
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground/60">
            Interní dashboard v0.1
          </p>
        </div>
      </div>
    </aside>
  );
}
