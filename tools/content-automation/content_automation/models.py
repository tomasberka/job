"""Data models for HelloComp content automation.

Mirrors the TypeScript schemas from the Next.js dashboard
(ContentType, ContentStatus, ContentItem) and adds Product model
for CSV-sourced inventory data.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class ContentType(str, Enum):
    TIKTOK_HOOK = "tiktok-hook"
    SEO_META = "seo-meta"
    VIDEO_SCRIPT = "video-script"
    PRODUCT_DESCRIPTION = "product-description"


class ContentStatus(str, Enum):
    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    PUBLISHED = "published"


@dataclass
class ContentItem:
    """Single content piece — compatible with dashboard ContentItem schema."""

    title: str
    body: str
    content_type: ContentType
    status: ContentStatus = ContentStatus.DRAFT
    sku: Optional[str] = None
    id: str = field(default_factory=lambda: f"cg-{uuid.uuid4().hex[:8]}")
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "type": self.content_type.value,
            "status": self.status.value,
            "sku": self.sku,
            "createdAt": self.created_at,
        }


@dataclass
class Product:
    """Product record loaded from the HelloComp CSV catalogue."""

    code: str
    name: str
    pair_code: Optional[str] = None
    xml_feed_name: Optional[str] = None

    @property
    def gpu(self) -> Optional[str]:
        """Extract GPU model from product name (e.g. 'RTX 5080')."""
        import re

        match = re.search(
            r"(RTX\s*\d{4}\s*(?:Ti\s*)?(?:SUPER)?|"
            r"RX\s*\d{4}\s*(?:XT(?:X)?)?|"
            r"\d{4}\s*(?:Ti\s*)?(?:SUPER)?|"
            r"A\d{3}|B\d{3}|"
            r"VEGA\s*\d+)",
            self.name,
            re.IGNORECASE,
        )
        return match.group(0).strip() if match else None

    @property
    def tier(self) -> Optional[str]:
        """Extract product tier (SE, Pro, Max, Extreme, Individual, Ultra)."""
        import re

        match = re.search(
            r"\b(SE\d*|Pro|Max|Extreme|Individual|Ultra\d*)\b",
            self.name,
            re.IGNORECASE,
        )
        return match.group(0) if match else None

    @property
    def platform(self) -> Optional[str]:
        """Extract platform (AMD or Intel) from product name."""
        name_lower = self.name.lower()
        if "amd" in name_lower:
            return "AMD"
        if "intel" in name_lower:
            return "Intel"
        return None
