"""CSV product loader for HelloComp inventory data.

Reads the semicolon-delimited ``products (1).csv`` shipped with the
repository and returns a list of :class:`Product` objects.
"""

from __future__ import annotations

import csv
from pathlib import Path
from typing import Optional

from .models import Product

_REPO_ROOT = Path(__file__).resolve().parents[3]  # content_automation/ -> content-automation/ -> tools/ -> repo root
_DEFAULT_CSV = _REPO_ROOT / "products (1).csv"


def load_products(csv_path: Optional[Path] = None) -> list[Product]:
    """Load products from a semicolon-delimited CSV file.

    Parameters
    ----------
    csv_path:
        Path to the CSV.  Falls back to the repository's
        ``products (1).csv`` when *None*.

    Returns
    -------
    list[Product]
        Parsed product records with empty strings normalised to *None*.
    """
    path = csv_path or _DEFAULT_CSV

    products: list[Product] = []
    with open(path, encoding="utf-8") as fh:
        reader = csv.reader(fh, delimiter=";")
        header = next(reader, None)
        if header is None:
            return products

        for row in reader:
            if len(row) < 3:
                continue
            code = row[0].strip().strip('"')
            pair_code = row[1].strip().strip('"') or None
            name = row[2].strip().strip('"')
            xml_feed = row[3].strip().strip('"') if len(row) > 3 else None
            if not code or not name:
                continue
            products.append(
                Product(
                    code=code,
                    name=name,
                    pair_code=pair_code,
                    xml_feed_name=xml_feed or None,
                )
            )
    return products


def filter_gaming_pcs(products: list[Product]) -> list[Product]:
    """Return only HelloComp GAMER PCs (excludes peripherals, vouchers, etc.)."""
    return [p for p in products if "GAMER" in p.name and "HelloComp" in p.name]


def unique_product_names(products: list[Product]) -> list[str]:
    """Return deduplicated product names, preserving order."""
    seen: set[str] = set()
    names: list[str] = []
    for p in products:
        if p.name not in seen:
            seen.add(p.name)
            names.append(p.name)
    return names
