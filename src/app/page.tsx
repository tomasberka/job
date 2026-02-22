import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Budoucí struktura rozhraní | HelloComp",
  description:
    "Návrh budoucí struktury interního rozhraní HelloComp bez živých dat.",
  openGraph: {
    title: "Budoucí struktura rozhraní | HelloComp",
    description:
      "Přehled navržených modulů a workflow bez napojení na produkční data.",
    images: [
      { url: "https://hellocomp.cz/images/og-dashboard.jpg", alt: "HelloComp Command Center" },
    ],
  },
};

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <header className="glass rounded-xl p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Roadmap View</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Budoucí struktura rozhraní</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Tato sekce je záměrně bez dat. Slouží jako čistý návrh informační architektury pro další etapy vývoje.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          {
            title: "Katalog & Sklad",
            status: "Plán",
            desc: "Přehled produktů, dostupnost, párování feedů a interní validace položek.",
          },
          {
            title: "Obsahový Hub",
            status: "Plán",
            desc: "Generování headline, SEO textů a publikačních výstupů podle SKU.",
          },
          {
            title: "Sociální Workflow",
            status: "Plán",
            desc: "Návrhy postů, schvalovací fronta a export pro jednotlivé kanály.",
          },
          {
            title: "Vizuální Factory",
            status: "READY",
            desc: "Produktové posty a šablony jsou dostupné v modulu Photo Factory.",
          },
          {
            title: "Integrace & Feedy",
            status: "Plán",
            desc: "Synchronizace XML/CSV, interní mapování polí a kontrola konzistence.",
          },
          {
            title: "Reporting",
            status: "Plán",
            desc: "KPI přehledy, výkon kampaní a návrhy optimalizačních kroků.",
          },
        ].map((item) => (
          <article key={item.title} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold tracking-tight">{item.title}</h2>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {item.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
