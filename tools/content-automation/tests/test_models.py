"""Tests for content_automation.models."""

from content_automation.models import (
    ContentItem,
    ContentStatus,
    ContentType,
    Product,
)


class TestContentType:
    def test_values(self):
        assert ContentType.TIKTOK_HOOK.value == "tiktok-hook"
        assert ContentType.SEO_META.value == "seo-meta"
        assert ContentType.VIDEO_SCRIPT.value == "video-script"
        assert ContentType.PRODUCT_DESCRIPTION.value == "product-description"


class TestContentStatus:
    def test_values(self):
        assert ContentStatus.DRAFT.value == "draft"
        assert ContentStatus.REVIEW.value == "review"
        assert ContentStatus.APPROVED.value == "approved"
        assert ContentStatus.PUBLISHED.value == "published"


class TestContentItem:
    def test_defaults(self):
        item = ContentItem(
            title="Test", body="Body", content_type=ContentType.TIKTOK_HOOK
        )
        assert item.status == ContentStatus.DRAFT
        assert item.id.startswith("cg-")
        assert item.sku is None

    def test_to_dict(self):
        item = ContentItem(
            title="Hook",
            body="POV: …",
            content_type=ContentType.TIKTOK_HOOK,
            status=ContentStatus.APPROVED,
            sku="SKU-001",
            id="cg-test",
        )
        d = item.to_dict()
        assert d["id"] == "cg-test"
        assert d["type"] == "tiktok-hook"
        assert d["status"] == "approved"
        assert d["sku"] == "SKU-001"


class TestProduct:
    def test_gpu_extraction(self):
        p = Product(code="X", name="HelloComp AMD GAMER Pro 5070 Ti")
        assert p.gpu == "5070 Ti"

    def test_gpu_extraction_with_super(self):
        p = Product(code="X", name="HelloComp Intel GAMER Max DDR5 4070 Ti SUPER")
        assert "4070" in (p.gpu or "")

    def test_tier_extraction(self):
        p = Product(code="X", name="HelloComp AMD GAMER Extreme 5090")
        assert p.tier == "Extreme"

    def test_tier_se(self):
        p = Product(code="X", name="HelloComp AMD GAMER SE 3050")
        assert p.tier == "SE"

    def test_platform_amd(self):
        p = Product(code="X", name="HelloComp AMD GAMER Pro 5070")
        assert p.platform == "AMD"

    def test_platform_intel(self):
        p = Product(code="X", name="HelloComp Intel GAMER Ultra9 5090")
        assert p.platform == "Intel"

    def test_platform_none(self):
        p = Product(code="X", name="Koorui GN06 27")
        assert p.platform is None
