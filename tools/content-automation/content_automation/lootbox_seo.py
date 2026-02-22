"""Loot-Box SEO — Dynamic Content Generator for HelloComp.

Reads the HelloComp product catalogue (CSV) and generates SEO-ready
comparison tables and marketing copy that positions HelloComp as a
data-driven authority in the Czech gaming PC market.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Optional

from .csv_loader import filter_gaming_pcs, load_products, unique_product_names
from .models import ContentItem, ContentStatus, ContentType, Product

# ---------------------------------------------------------------------------
# Trending keywords (static seed — extend with Google Trends API later)
# ---------------------------------------------------------------------------
TRENDING_KEYWORDS: list[dict[str, str]] = [
    {"keyword": "GTA VI požadavky", "tip": "Napiš článek: Jaké PC potřebuješ na GTA VI?"},
    {"keyword": "nejlepší PC pro CS2", "tip": "Srovnání FPS na HelloComp sestavách v CS2."},
    {"keyword": "RTX 5090 recenze", "tip": "Benchmark RTX 5090 v HelloComp Extreme sestavě."},
    {"keyword": "herní PC do 30 000", "tip": "Top 3 HelloComp GAMER SE sestavy pod 30 000 Kč."},
    {"keyword": "RTX 5070 vs RX 9070 XT", "tip": "Srovnávací tabulka obou GPU v HelloComp PC."},
    {"keyword": "nejlepší herní PC 2025", "tip": "Kompletní průvodce HelloComp řadami GAMER."},
]


@dataclass
class ComparisonRow:
    """Single row in an SEO comparison table."""

    product_name: str
    gpu: str
    tier: str
    platform: str


@dataclass
class SEOComparisonTable:
    """Markdown/HTML comparison table for a set of products."""

    title: str
    rows: list[ComparisonRow]

    def to_markdown(self) -> str:
        lines = [
            f"## {self.title}",
            "",
            "| Produkt | GPU | Řada | Platforma |",
            "|---------|-----|------|-----------|",
        ]
        for r in self.rows:
            lines.append(f"| {r.product_name} | {r.gpu} | {r.tier} | {r.platform} |")
        return "\n".join(lines)

    def to_html(self) -> str:
        header = "<tr><th>Produkt</th><th>GPU</th><th>Řada</th><th>Platforma</th></tr>"
        rows = "".join(
            f"<tr><td>{r.product_name}</td><td>{r.gpu}</td>"
            f"<td>{r.tier}</td><td>{r.platform}</td></tr>"
            for r in self.rows
        )
        return (
            f"<h2>{self.title}</h2>\n"
            f"<table>\n<thead>{header}</thead>\n<tbody>{rows}</tbody>\n</table>"
        )


def build_comparison_table(
    products: list[Product],
    gpu_filter: Optional[str] = None,
    tier_filter: Optional[str] = None,
    title: Optional[str] = None,
) -> SEOComparisonTable:
    """Build an SEO comparison table from product data.

    Parameters
    ----------
    products:
        Full or pre-filtered product list.
    gpu_filter:
        Show only products containing this GPU string (case-insensitive).
    tier_filter:
        Show only products in this tier (SE, Pro, Max, Extreme …).
    title:
        Custom table title.  Auto-generated when *None*.
    """
    filtered = products
    if gpu_filter:
        gpu_lower = gpu_filter.lower()
        filtered = [p for p in filtered if gpu_lower in p.name.lower()]
    if tier_filter:
        tier_lower = tier_filter.lower()
        filtered = [p for p in filtered if (p.tier or "").lower() == tier_lower]

    # Deduplicate by name
    seen: set[str] = set()
    unique: list[Product] = []
    for p in filtered:
        if p.name not in seen:
            seen.add(p.name)
            unique.append(p)

    rows = [
        ComparisonRow(
            product_name=p.name,
            gpu=p.gpu or "—",
            tier=p.tier or "—",
            platform=p.platform or "—",
        )
        for p in unique
    ]

    auto_title = "Srovnání HelloComp herních PC"
    if gpu_filter:
        auto_title += f" — {gpu_filter}"
    if tier_filter:
        auto_title += f" ({tier_filter})"

    return SEOComparisonTable(title=title or auto_title, rows=rows)


def generate_seo_paragraph(
    products: list[Product],
    gpu_filter: Optional[str] = None,
) -> str:
    """Generate an SEO-ready marketing paragraph for a GPU lineup.

    Parameters
    ----------
    products:
        Product catalogue (typically from :func:`csv_loader.load_products`).
    gpu_filter:
        Focus the paragraph on products with this GPU (e.g. ``"5070"``).
    """
    filtered = products
    if gpu_filter:
        gpu_lower = gpu_filter.lower()
        filtered = [p for p in filtered if gpu_lower in p.name.lower()]

    names = unique_product_names(filtered)
    count = len(names)

    if count == 0:
        return f'Pro GPU "{gpu_filter}" aktuálně nemáme žádné sestavy v nabídce.'

    gpu_label = gpu_filter or "herní GPU"
    tiers = sorted({p.tier for p in filtered if p.tier})
    tier_text = ", ".join(tiers) if tiers else "různých řadách"

    return (
        f"HelloComp nabízí {count} unikátních konfigurací s {gpu_label} "
        f"v řadách {tier_text}. "
        f"Ať hledáš vstupní sestavu nebo prémiový stroj pro kompetitivní "
        f"gaming, HelloComp má řešení na míru. "
        f"Všechny sestavy jsou dostupné na hellocomp.cz s českou zárukou a "
        f"expresním doručením po celé ČR."
    )


def get_keyword_suggestions() -> list[dict[str, str]]:
    """Return trending keyword suggestions for content planning."""
    return list(TRENDING_KEYWORDS)


# ---------------------------------------------------------------------------
# TL;DR generation
# ---------------------------------------------------------------------------
def generate_tldr(products: list[Product], gpu_filter: Optional[str] = None) -> str:
    """Generate a concise TL;DR summary for a GPU lineup.

    Parameters
    ----------
    products:
        Product catalogue.
    gpu_filter:
        Focus the TL;DR on products with this GPU (e.g. ``"5070"``).
    """
    filtered = products
    if gpu_filter:
        gpu_lower = gpu_filter.lower()
        filtered = [p for p in products if gpu_lower in p.name.lower()]

    count = len({p.name for p in filtered})
    gpu_label = gpu_filter or "různé GPU"
    tiers = sorted({p.tier for p in filtered if p.tier})
    tier_text = ", ".join(tiers) if tiers else "různé řady"
    platforms = sorted({p.platform for p in filtered if p.platform})
    platform_text = " a ".join(platforms) if platforms else "různé platformy"

    if count == 0:
        return f'TL;DR: Pro GPU "{gpu_filter}" aktuálně nemáme žádné sestavy.'

    return (
        f"TL;DR: HelloComp nabízí {count} konfigurací s {gpu_label} "
        f"({tier_text}) na platformách {platform_text}. "
        f"Všechny dostupné na hellocomp.cz."
    )


# ---------------------------------------------------------------------------
# Topic cluster CTAs
# ---------------------------------------------------------------------------
TOPIC_CLUSTER_CTAS: list[dict[str, str]] = [
    {
        "topic": "GTA VI",
        "cta": "🎮 Připrav se na GTA VI — zjisti, které HelloComp sestavy to zvládnou na max nastavení.",
        "url": "hellocomp.cz/gta-vi-pc",
    },
    {
        "topic": "CS2",
        "cta": "🏆 Dominuj v CS2 — HelloComp GAMER Pro s RTX 5070 Ti pro stabilních 300+ FPS.",
        "url": "hellocomp.cz/cs2-pc",
    },
    {
        "topic": "RTX 5090",
        "cta": "🚀 RTX 5090 v HelloComp Extreme — nejrychlejší herní PC v ČR. Limitovaná dostupnost.",
        "url": "hellocomp.cz/rtx-5090",
    },
    {
        "topic": "budget",
        "cta": "💰 Herní PC pod 30 000 Kč? HelloComp GAMER SE — výkon bez kompromisů za rozumnou cenu.",
        "url": "hellocomp.cz/gamer-se",
    },
]


def get_topic_cluster_ctas(topic_filter: Optional[str] = None) -> list[dict[str, str]]:
    """Return topic cluster CTAs, optionally filtered by topic keyword.

    Parameters
    ----------
    topic_filter:
        Case-insensitive substring to filter topics.
    """
    if topic_filter is None:
        return list(TOPIC_CLUSTER_CTAS)
    lower = topic_filter.lower()
    return [c for c in TOPIC_CLUSTER_CTAS if lower in c["topic"].lower()]


def generate_full_seo_content(
    gpu_filter: Optional[str] = None,
    tier_filter: Optional[str] = None,
    csv_path=None,
) -> dict:
    """High-level entry point: load CSV → produce table + paragraph + keywords.

    Returns a dict with keys ``table_md``, ``table_html``, ``paragraph``,
    ``tldr``, ``keywords``, ``topic_cluster_ctas``, and ``content_items``.
    """
    products = filter_gaming_pcs(load_products(csv_path))
    table = build_comparison_table(products, gpu_filter=gpu_filter, tier_filter=tier_filter)
    paragraph = generate_seo_paragraph(products, gpu_filter=gpu_filter)
    tldr = generate_tldr(products, gpu_filter=gpu_filter)
    keywords = get_keyword_suggestions()
    ctas = get_topic_cluster_ctas()

    content_items = [
        ContentItem(
            title=table.title,
            body=table.to_markdown(),
            content_type=ContentType.PRODUCT_DESCRIPTION,
            status=ContentStatus.DRAFT,
        ),
        ContentItem(
            title=f"SEO text — {gpu_filter or 'celá nabídka'}",
            body=paragraph,
            content_type=ContentType.SEO_META,
            status=ContentStatus.DRAFT,
        ),
    ]

    return {
        "table_md": table.to_markdown(),
        "table_html": table.to_html(),
        "paragraph": paragraph,
        "tldr": tldr,
        "keywords": keywords,
        "topic_cluster_ctas": ctas,
        "content_items": [item.to_dict() for item in content_items],
    }
