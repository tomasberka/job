"""Omnichannel Distributor — Tool 3 for HelloComp Content Automation.

Generates platform-specific social media copy for TikTok, Instagram,
and Facebook from a single product brief.  Uses Google Gemini API when
an API key is available; otherwise falls back to deterministic templates.
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
    "Jsi sociální media copywriter pro HelloComp — českou značku herních PC. "
    "Píšeš drzým, sebevědomým, ale profesionálním tónem. Cílovka jsou "
    "mladí hráči (18–35) v ČR. Výstup vždy česky."
)


@dataclass
class OmnichannelResult:
    """Complete output from a single omnichannel distribution run."""

    gpu: str
    target_audience: str
    tiktok: str
    instagram: str
    facebook: str

    def to_content_items(self) -> list[ContentItem]:
        """Convert results into dashboard-compatible ContentItem list."""
        return [
            ContentItem(
                title=f"TikTok post — {self.gpu}",
                body=self.tiktok,
                content_type=ContentType.SOCIAL_POST,
                status=ContentStatus.DRAFT,
            ),
            ContentItem(
                title=f"Instagram post — {self.gpu}",
                body=self.instagram,
                content_type=ContentType.SOCIAL_POST,
                status=ContentStatus.DRAFT,
            ),
            ContentItem(
                title=f"Facebook post — {self.gpu}",
                body=self.facebook,
                content_type=ContentType.SOCIAL_POST,
                status=ContentStatus.DRAFT,
            ),
        ]

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(
            [item.to_dict() for item in self.to_content_items()],
            ensure_ascii=False,
            indent=indent,
        )


# ---------------------------------------------------------------------------
# Template-based fallback (no API key required)
# ---------------------------------------------------------------------------
_TIKTOK_TEMPLATE = (
    "POV: Právě sis dal {gpu} do svého nového HelloComp a {audience} lobby "
    "se třese 🔥 #gaming #HelloComp #{gpu_tag} #hernipc"
)

_INSTAGRAM_TEMPLATE = (
    "✨ Nový level odemčen.\n\n"
    "{gpu} v HelloComp GAMER sérii — pro hráče jako jsi ty. "
    "Žádné kompromisy, jen čistý výkon.\n\n"
    "Cílová skupina: {audience} 🎮\n\n"
    "#HelloComp #HerníPC #Gaming #{gpu_tag} #CzechGaming"
)

_FACEBOOK_TEMPLATE = (
    "🎮 HelloComp GAMER s {gpu} — ideální volba pro {audience}.\n\n"
    "Hledáš výkonný herní PC postavený v Česku? Naše GAMER sestava s {gpu} "
    "ti dá náskok, který potřebuješ. Česká záruka, expresní doručení, "
    "podpora od skutečných hráčů.\n\n"
    "👉 Zjisti více na hellocomp.cz"
)


def _gpu_tag(gpu: str) -> str:
    """Convert GPU name to a social-media-friendly hashtag (no spaces/special chars)."""
    return gpu.replace(" ", "").replace("-", "")


def _generate_from_templates(gpu: str, target_audience: str) -> OmnichannelResult:
    tag = _gpu_tag(gpu)
    return OmnichannelResult(
        gpu=gpu,
        target_audience=target_audience,
        tiktok=_TIKTOK_TEMPLATE.format(gpu=gpu, audience=target_audience, gpu_tag=tag),
        instagram=_INSTAGRAM_TEMPLATE.format(
            gpu=gpu, audience=target_audience, gpu_tag=tag
        ),
        facebook=_FACEBOOK_TEMPLATE.format(gpu=gpu, audience=target_audience),
    )


# ---------------------------------------------------------------------------
# Google Gemini–powered generation
# ---------------------------------------------------------------------------
def _generate_with_gemini(
    gpu: str, target_audience: str, api_key: str
) -> OmnichannelResult:
    """Call Google Gemini to generate platform-specific social posts."""
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)

    user_prompt = (
        f"GPU: {gpu}\n"
        f"Cílovka: {target_audience}\n\n"
        "Vygeneruj platformně specifické posty pro:\n"
        "1. TikTok — krátký, virální, max 150 znaků, emoji, hashtagy\n"
        "2. Instagram — vizuálně orientovaný, 2–3 odstavce, emoji, hashtagy\n"
        "3. Facebook — informativnější, 3–4 věty, CTA na hellocomp.cz\n\n"
        "Formát odpovědi — platný JSON:\n"
        '{"tiktok": "…", "instagram": "…", "facebook": "…"}'
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

    return OmnichannelResult(
        gpu=gpu,
        target_audience=target_audience,
        tiktok=data.get("tiktok", ""),
        instagram=data.get("instagram", ""),
        facebook=data.get("facebook", ""),
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def distribute(
    gpu: str,
    target_audience: str,
    api_key: Optional[str] = None,
) -> OmnichannelResult:
    """Generate platform-specific social posts for a given GPU and audience.

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
