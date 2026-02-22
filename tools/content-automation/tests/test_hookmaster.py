"""Tests for content_automation.hookmaster (template mode — no API key)."""

from content_automation.hookmaster import HookMasterResult, generate


class TestGenerate:
    def test_returns_result_without_api_key(self):
        result = generate("RTX 5080", "hráč Warzone")
        assert isinstance(result, HookMasterResult)
        assert result.gpu == "RTX 5080"
        assert result.target_audience == "hráč Warzone"

    def test_produces_three_hooks(self):
        result = generate("RTX 5070 Ti", "hráč CS2")
        assert len(result.hooks) == 3
        for hook in result.hooks:
            assert "RTX 5070 Ti" in hook

    def test_script_contains_gpu(self):
        result = generate("RTX 4090", "streamer")
        assert "RTX 4090" in result.script

    def test_seo_contains_gpu(self):
        result = generate("RTX 5060", "casual gamer")
        assert "RTX 5060" in result.seo_description
        assert "HelloComp" in result.seo_description

    def test_to_content_items(self):
        result = generate("RTX 5080", "hráč Warzone")
        items = result.to_content_items()
        # 3 hooks + 1 script + 1 SEO = 5
        assert len(items) == 5
        types = [i.content_type.value for i in items]
        assert types.count("tiktok-hook") == 3
        assert types.count("video-script") == 1
        assert types.count("seo-meta") == 1

    def test_to_json_is_valid(self):
        import json

        result = generate("RTX 5080", "hráč Warzone")
        parsed = json.loads(result.to_json())
        assert isinstance(parsed, list)
        assert len(parsed) == 5
