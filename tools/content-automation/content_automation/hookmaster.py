"""Hook-Master — AI Video Script Engine for HelloComp.

Generates TikTok hooks, 9:16 vertical video scripts, and SEO-optimised
descriptions for HelloComp gaming PCs.  Uses Google Gemini API when an
API key is available; otherwise falls back to deterministic templates so
the tool is always usable offline.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Optional

from .models import ContentItem, ContentStatus, ContentType

# ---------------------------------------------------------------------------
# HelloComp brand voice (shared system instruction)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "Jsi kreativní copywriter pro HelloComp — českou značku herních PC. "
    "Píšeš drzým, sebevědomým, ale profesionálním tónem. Cílovka jsou "
    "mladí hráči (18–35) v ČR. Používáš emoji střídmě. Vždy zmiň "
    "konkrétní GPU a výhody pro hráče. Výstup vždy česky."
)


@dataclass
class HookMasterResult:
    """Complete output from a Hook-Master generation run."""

    hooks: list[str]
    script: str
    seo_description: str
    gpu: str
    target_audience: str

    def to_content_items(self) -> list[ContentItem]:
        """Convert results into dashboard-compatible ContentItem list."""
        items: list[ContentItem] = []
        for i, hook in enumerate(self.hooks, 1):
            items.append(
                ContentItem(
                    title=f"TikTok Hook #{i} — {self.gpu}",
                    body=hook,
                    content_type=ContentType.TIKTOK_HOOK,
                    status=ContentStatus.DRAFT,
                )
            )
        items.append(
            ContentItem(
                title=f"Video Script 9:16 — {self.gpu} ({self.target_audience})",
                body=self.script,
                content_type=ContentType.VIDEO_SCRIPT,
                status=ContentStatus.DRAFT,
            )
        )
        items.append(
            ContentItem(
                title=f"SEO Popisek — {self.gpu}",
                body=self.seo_description,
                content_type=ContentType.SEO_META,
                status=ContentStatus.DRAFT,
            )
        )
        return items

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(
            [item.to_dict() for item in self.to_content_items()],
            ensure_ascii=False,
            indent=indent,
        )


# ---------------------------------------------------------------------------
# Template-based fallback (no API key required)
# ---------------------------------------------------------------------------
_HOOK_TEMPLATES = [
    "POV: Právě sis dal {gpu} do svého nového HelloComp a {audience} lobby se třese 🔥",
    "Když ti řeknou, že {gpu} nestačí na {audience}… *ukazuje 240 FPS* 😤💪",
    "3 sekundy, které změní tvůj gaming navždy — HelloComp s {gpu} 🎮🚀",
]

_SCRIPT_TEMPLATE = """[0:00] HOOK — Otevření záběrem na rozsvícený HelloComp PC s {gpu}.
[0:03] „Víš, co odlišuje průměrného hráče od TOHO hráče? Technika."
[0:07] Střih na gameplay ({audience}) — ultra nastavení, FPS counter v rohu.
[0:12] „{gpu} v HelloComp GAMER — tohle není jen PC, tohle je unfair advantage."
[0:18] B-roll: detail komponentů, RGB, kabeláž.
[0:22] CTA — „Odkaz v biu. HelloComp — Hraj bez kompromisů."
[0:25] Logo + end screen."""

_SEO_TEMPLATE = (
    "HelloComp gaming PC s {gpu} — {audience} sestava pro maximální FPS "
    "a bezkompromisní herní zážitek. Česká značka herních počítačů "
    "HelloComp nabízí prémiové konfigurace s {gpu} pro náročné hráče. "
    "Objednej online na hellocomp.cz."
)


def _generate_from_templates(gpu: str, target_audience: str) -> HookMasterResult:
    hooks = [t.format(gpu=gpu, audience=target_audience) for t in _HOOK_TEMPLATES]
    script = _SCRIPT_TEMPLATE.format(gpu=gpu, audience=target_audience)
    seo = _SEO_TEMPLATE.format(gpu=gpu, audience=target_audience)
    return HookMasterResult(
        hooks=hooks,
        script=script,
        seo_description=seo,
        gpu=gpu,
        target_audience=target_audience,
    )


# ---------------------------------------------------------------------------
# Google Gemini–powered generation
# ---------------------------------------------------------------------------
def _generate_with_gemini(
    gpu: str, target_audience: str, api_key: str
) -> HookMasterResult:
    """Call Google Gemini to generate hooks, script, and SEO text."""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)

    user_prompt = (
        f"GPU: {gpu}\n"
        f"Cílovka: {target_audience}\n\n"
        "Vygeneruj přesně:\n"
        "1. Tři krátké TikTok hooky (každý max 15 slov, drzý tón).\n"
        "2. Stručný scénář pro 9:16 vertikální video (max 25 s, s timestampy).\n"
        "3. SEO popisek (max 160 znaků) optimalizovaný na klíčová slova.\n\n"
        "Formát odpovědi — platný JSON:\n"
        '{"hooks": ["…","…","…"], "script": "…", "seo_description": "…"}'
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.8,
            max_output_tokens=1024,
            response_mime_type="application/json",
        ),
    )

    raw = response.text or "{}"
    data = json.loads(raw)

    return HookMasterResult(
        hooks=data.get("hooks", [])[:3],
        script=data.get("script", ""),
        seo_description=data.get("seo_description", ""),
        gpu=gpu,
        target_audience=target_audience,
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def generate(
    gpu: str,
    target_audience: str,
    api_key: Optional[str] = None,
) -> HookMasterResult:
    """Generate Hook-Master content for a given GPU and audience.

    Parameters
    ----------
    gpu:
        GPU model name, e.g. ``"RTX 5080"``.
    target_audience:
        Target gamer persona, e.g. ``"hráč Warzone"``.
    api_key:
        Google Gemini API key.  Falls back to ``GEMINI_API_KEY`` env var.
        When no key is available the generator uses built-in templates.
    """
    key = api_key or os.environ.get("GEMINI_API_KEY")

    if key:
        try:
            return _generate_with_gemini(gpu, target_audience, key)
        except Exception:
            # Graceful degradation — fall back to templates on any API error.
            pass

    return _generate_from_templates(gpu, target_audience)
