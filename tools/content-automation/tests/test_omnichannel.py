"""Tests for content_automation.omnichannel (template mode — no API key)."""

from content_automation.models import ContentType
from content_automation.omnichannel import OmnichannelResult, distribute


class TestDistribute:
    def test_returns_result_without_api_key(self):
        result = distribute("RTX 5080", "hráč Warzone")
        assert isinstance(result, OmnichannelResult)
        assert result.gpu == "RTX 5080"
        assert result.target_audience == "hráč Warzone"

    def test_tiktok_contains_gpu(self):
        result = distribute("RTX 5070 Ti", "hráč CS2")
        assert "RTX 5070 Ti" in result.tiktok

    def test_instagram_contains_gpu(self):
        result = distribute("RTX 5080", "hráč Warzone")
        assert "RTX 5080" in result.instagram

    def test_facebook_contains_gpu(self):
        result = distribute("RTX 5060", "casual gamer")
        assert "RTX 5060" in result.facebook
        assert "HelloComp" in result.facebook

    def test_to_content_items_produces_three(self):
        result = distribute("RTX 5080", "hráč Warzone")
        items = result.to_content_items()
        assert len(items) == 3
        for item in items:
            assert item.content_type == ContentType.SOCIAL_POST

    def test_to_content_items_titles(self):
        result = distribute("RTX 5080", "hráč Warzone")
        items = result.to_content_items()
        titles = [item.title for item in items]
        assert any("TikTok" in t for t in titles)
        assert any("Instagram" in t for t in titles)
        assert any("Facebook" in t for t in titles)

    def test_to_json_is_valid(self):
        import json

        result = distribute("RTX 5080", "hráč Warzone")
        parsed = json.loads(result.to_json())
        assert isinstance(parsed, list)
        assert len(parsed) == 3
        for item in parsed:
            assert item["type"] == "social-post"
