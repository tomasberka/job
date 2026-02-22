"""Tests for content_automation.csv_loader."""

import csv
import tempfile
from pathlib import Path

from content_automation.csv_loader import (
    filter_gaming_pcs,
    load_products,
    unique_product_names,
)


def _write_csv(rows: list[list[str]], path: Path) -> None:
    with open(path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh, delimiter=";")
        writer.writerow(["code", "pairCode", "name", "xmlFeedName", ""])
        for row in rows:
            writer.writerow(row)


class TestLoadProducts:
    def test_loads_basic_csv(self, tmp_path):
        csv_file = tmp_path / "products.csv"
        _write_csv(
            [
                ["SKU-001", "", "HelloComp AMD GAMER Pro 5070", ""],
                ["SKU-002", "2", "HelloComp Intel GAMER SE8 3050", ""],
                ["PER-001", "", "Motospeed SK62 White", ""],
            ],
            csv_file,
        )
        products = load_products(csv_file)
        assert len(products) == 3
        assert products[0].code == "SKU-001"
        assert products[0].name == "HelloComp AMD GAMER Pro 5070"

    def test_skips_short_rows(self, tmp_path):
        csv_file = tmp_path / "products.csv"
        with open(csv_file, "w", encoding="utf-8") as fh:
            fh.write("code;pairCode;name;xmlFeedName;\n")
            fh.write("A;B\n")  # too short
        products = load_products(csv_file)
        assert len(products) == 0

    def test_empty_file(self, tmp_path):
        csv_file = tmp_path / "empty.csv"
        csv_file.write_text("")
        assert load_products(csv_file) == []


class TestFilterGamingPCs:
    def test_filters_only_hellocomp_gamer(self, tmp_path):
        csv_file = tmp_path / "products.csv"
        _write_csv(
            [
                ["A", "", "HelloComp AMD GAMER Pro 5070", ""],
                ["B", "", "Motospeed SK62 White", ""],
                ["C", "", "HelloComp Intel OFFICE 14400 DDR5", ""],
            ],
            csv_file,
        )
        products = load_products(csv_file)
        gaming = filter_gaming_pcs(products)
        assert len(gaming) == 1
        assert gaming[0].code == "A"


class TestUniqueProductNames:
    def test_deduplicates(self, tmp_path):
        csv_file = tmp_path / "products.csv"
        _write_csv(
            [
                ["A1", "", "HelloComp AMD GAMER Pro 5070", ""],
                ["A2", "", "HelloComp AMD GAMER Pro 5070", ""],
                ["B1", "", "HelloComp AMD GAMER SE 3050", ""],
            ],
            csv_file,
        )
        products = load_products(csv_file)
        names = unique_product_names(products)
        assert len(names) == 2
