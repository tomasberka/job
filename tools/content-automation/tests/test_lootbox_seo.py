"""Tests for content_automation.lootbox_seo."""

import csv
from pathlib import Path

from content_automation.lootbox_seo import (
    build_comparison_table,
    generate_full_seo_content,
    generate_seo_paragraph,
    generate_tldr,
    get_keyword_suggestions,
    get_topic_cluster_ctas,
)
from content_automation.models import Product


def _make_products() -> list[Product]:
    return [
        Product(code="A", name="HelloComp AMD GAMER Pro 5070"),
        Product(code="B", name="HelloComp AMD GAMER Extreme 5070 Ti"),
        Product(code="C", name="HelloComp Intel GAMER SE8 3050"),
        Product(code="D", name="HelloComp AMD GAMER Pro 5070"),  # duplicate name
    ]


def _write_csv(rows: list[list[str]], path: Path) -> None:
    with open(path, "w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh, delimiter=";")
        writer.writerow(["code", "pairCode", "name", "xmlFeedName", ""])
        for row in rows:
            writer.writerow(row)


class TestBuildComparisonTable:
    def test_basic_table(self):
        products = _make_products()
        table = build_comparison_table(products)
        assert len(table.rows) == 3  # deduped
        assert "HelloComp" in table.title

    def test_gpu_filter(self):
        products = _make_products()
        table = build_comparison_table(products, gpu_filter="5070")
        assert all("5070" in r.product_name for r in table.rows)
        assert "5070" in table.title

    def test_tier_filter(self):
        products = _make_products()
        table = build_comparison_table(products, tier_filter="Extreme")
        assert len(table.rows) == 1
        assert table.rows[0].tier == "Extreme"

    def test_to_markdown(self):
        products = _make_products()
        table = build_comparison_table(products)
        md = table.to_markdown()
        assert "| Produkt |" in md
        assert "##" in md

    def test_to_html(self):
        products = _make_products()
        table = build_comparison_table(products)
        html = table.to_html()
        assert "<table>" in html
        assert "<h2>" in html


class TestGenerateSEOParagraph:
    def test_contains_brand(self):
        products = _make_products()
        text = generate_seo_paragraph(products)
        assert "HelloComp" in text

    def test_gpu_filter_mention(self):
        products = _make_products()
        text = generate_seo_paragraph(products, gpu_filter="5070")
        assert "5070" in text

    def test_no_results(self):
        text = generate_seo_paragraph([], gpu_filter="9999")
        assert "9999" in text


class TestKeywordSuggestions:
    def test_returns_list(self):
        kws = get_keyword_suggestions()
        assert isinstance(kws, list)
        assert len(kws) > 0
        assert "keyword" in kws[0]
        assert "tip" in kws[0]


class TestGenerateTldr:
    def test_contains_brand(self):
        products = _make_products()
        tldr = generate_tldr(products)
        assert "HelloComp" in tldr

    def test_gpu_filter(self):
        products = _make_products()
        tldr = generate_tldr(products, gpu_filter="5070")
        assert "5070" in tldr

    def test_no_results(self):
        tldr = generate_tldr([], gpu_filter="9999")
        assert "9999" in tldr


class TestGetTopicClusterCtas:
    def test_returns_all(self):
        ctas = get_topic_cluster_ctas()
        assert isinstance(ctas, list)
        assert len(ctas) > 0
        assert "cta" in ctas[0]
        assert "url" in ctas[0]

    def test_filter(self):
        ctas = get_topic_cluster_ctas(topic_filter="CS2")
        assert all("CS2" in c["topic"] for c in ctas)

    def test_no_match(self):
        ctas = get_topic_cluster_ctas(topic_filter="nonexistent-xyz")
        assert ctas == []


class TestGenerateFullSEOContent:
    def test_full_pipeline(self, tmp_path):
        csv_file = tmp_path / "products.csv"
        _write_csv(
            [
                ["A", "", "HelloComp AMD GAMER Pro 5070", ""],
                ["B", "", "HelloComp AMD GAMER Extreme 5070 Ti", ""],
                ["C", "", "HelloComp Intel GAMER SE8 3050", ""],
                ["D", "", "Motospeed SK62", ""],  # non-gaming, filtered out
            ],
            csv_file,
        )
        data = generate_full_seo_content(gpu_filter="5070", csv_path=csv_file)
        assert "table_md" in data
        assert "table_html" in data
        assert "paragraph" in data
        assert "tldr" in data
        assert "keywords" in data
        assert "topic_cluster_ctas" in data
        assert "content_items" in data
        assert len(data["content_items"]) == 2
        assert "HelloComp" in data["tldr"]
        assert isinstance(data["topic_cluster_ctas"], list)
