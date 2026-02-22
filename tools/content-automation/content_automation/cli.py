"""CLI interface for HelloComp Content Automation tools.

Two entry-points:

* ``hookmaster``  — The Hook-Master AI Video Script Engine
* ``lootbox-seo`` — Loot-Box SEO Dynamic Content Generator
"""

from __future__ import annotations

import argparse
import json
import sys


# ---------------------------------------------------------------------------
# Hook-Master CLI
# ---------------------------------------------------------------------------
def hookmaster_main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        prog="hookmaster",
        description=(
            "Hook-Master — AI Video Script Engine pro HelloComp. "
            "Generuje TikTok hooky, 9:16 video scénáře a SEO popisky."
        ),
    )
    parser.add_argument("gpu", help='Název GPU, např. "RTX 5080"')
    parser.add_argument("audience", help='Cílová skupina, např. "hráč Warzone"')
    parser.add_argument(
        "--api-key",
        default=None,
        help="Google Gemini API klíč (fallback: env GEMINI_API_KEY, jinak template režim)",
    )
    parser.add_argument(
        "--json",
        dest="output_json",
        action="store_true",
        help="Výstup jako JSON (kompatibilní s dashboardem)",
    )

    args = parser.parse_args(argv)

    from .hookmaster import generate

    result = generate(args.gpu, args.audience, api_key=args.api_key)

    if args.output_json:
        print(result.to_json())
    else:
        print("=" * 60)
        print(f"  HOOK-MASTER — {result.gpu} | {result.target_audience}")
        print("=" * 60)
        print()
        for i, hook in enumerate(result.hooks, 1):
            print(f"  🎣 Hook #{i}: {hook}")
        print()
        print("  🎬 Scénář (9:16 vertical):")
        print("  " + "-" * 40)
        for line in result.script.strip().splitlines():
            print(f"    {line}")
        print()
        print("  🔍 SEO popisek:")
        print(f"    {result.seo_description}")
        print()
        print("=" * 60)


# ---------------------------------------------------------------------------
# Loot-Box SEO CLI
# ---------------------------------------------------------------------------
def lootbox_main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(
        prog="lootbox-seo",
        description=(
            "Loot-Box SEO — Dynamic Content Generator pro HelloComp. "
            "Generuje SEO srovnávací tabulky a marketingové texty z CSV dat."
        ),
    )
    parser.add_argument(
        "--gpu",
        default=None,
        help='Filtr na GPU, např. "5070"',
    )
    parser.add_argument(
        "--tier",
        default=None,
        help='Filtr na řadu, např. "Pro" nebo "Extreme"',
    )
    parser.add_argument(
        "--csv",
        default=None,
        help="Cesta k CSV souboru (výchozí: products (1).csv z repozitáře)",
    )
    parser.add_argument(
        "--format",
        choices=["text", "markdown", "html", "json"],
        default="text",
        help="Výstupní formát (výchozí: text)",
    )
    parser.add_argument(
        "--keywords",
        action="store_true",
        help="Zobrazit doporučená klíčová slova pro content planning",
    )

    args = parser.parse_args(argv)

    from pathlib import Path

    from .lootbox_seo import generate_full_seo_content, get_keyword_suggestions

    csv_path = Path(args.csv) if args.csv else None
    data = generate_full_seo_content(
        gpu_filter=args.gpu,
        tier_filter=args.tier,
        csv_path=csv_path,
    )

    if args.format == "json":
        print(json.dumps(data, ensure_ascii=False, indent=2))
    elif args.format == "markdown":
        print(data["table_md"])
        print()
        print(data["paragraph"])
    elif args.format == "html":
        print(data["table_html"])
        print()
        print(f"<p>{data['paragraph']}</p>")
    else:
        print("=" * 60)
        print("  LOOT-BOX SEO — HelloComp Dynamic Content Generator")
        print("=" * 60)
        print()
        print(data["table_md"])
        print()
        print("  📝 SEO odstavec:")
        print(f"    {data['paragraph']}")
        print()

    if args.keywords:
        print()
        print("  🔑 Doporučená klíčová slova:")
        print("  " + "-" * 40)
        for kw in get_keyword_suggestions():
            print(f"    • {kw['keyword']} → {kw['tip']}")
        print()
