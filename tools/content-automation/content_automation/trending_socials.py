"""Trending Social Post Generator — AI-Powered Posts by Platform.

Real-time trending topic detection + AI content generation for:
  • TikTok (short-form, emoji-heavy, hook-driven)
  • Instagram Reels & Feed Posts (aesthetic, hashtag strategy)
  • Twitter/X (news-driven, viral hooks, trending hashtags)
  • LinkedIn (professional, value-driven, thought leadership)
  • YouTube Shorts (CTA-heavy, retention-first)

Uses Google Gemini API for world-class copywriting, with fallback templates
for offline use. Integrates with CSV product data for context.
"""

from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional

from .models import ContentItem, ContentStatus, ContentType, Product


class SocialPlatform(str, Enum):
    """Supported social media platforms."""

    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    YOUTUBE_SHORTS = "youtube-shorts"
    FACEBOOK = "facebook"


class ContentTone(str, Enum):
    """Tone of voice for generated content."""

    AGGRESSIVE = "aggressive"  # Myth-busting, FUD-fighting
    CASUAL = "casual"  # Relatable, funny, meme-adjacent
    PROFESSIONAL = "professional"  # Authority, educational
    VIRAL = "viral"  # FOMO, curiosity gaps, shock value
    EMOTIONAL = "emotional"  # Inspirational, testimonial-style


@dataclass
class TrendingTopic:
    """A single trending topic across platforms."""

    keyword: str
    category: str  # gaming, tech, culture, news
    platforms: list[str]  # where it's trending
    volume: int = 1000  # estimated search/post volume
    urgency: float = 0.8  # 0-1: how urgent (time-sensitive?)
    relevance: float = 0.9  # 0-1: relevance to gaming/HelloComp
    context: Optional[str] = None  # brief context (e.g., "New GPU release")


@dataclass
class SocialPostResult:
    """Single generated social media post."""

    platform: SocialPlatform
    title: str
    body: str
    hashtags: list[str]
    emojis: list[str]
    cta: Optional[str] = None  # Call-to-action
    tone: ContentTone = ContentTone.CASUAL
    trending_topic: Optional[str] = None
    gpu_mention: Optional[str] = None
    created_at: str = field(
        default_factory=lambda: datetime.utcnow().isoformat()
    )

    def to_content_item(self) -> ContentItem:
        """Convert to dashboard ContentItem."""
        full_body = self.body
        if self.hashtags:
            full_body += "\n\n" + " ".join(self.hashtags)
        if self.cta:
            full_body += f"\n\n▶️ {self.cta}"

        return ContentItem(
            title=self.title,
            body=full_body,
            content_type=ContentType.SOCIAL_POST,
            status=ContentStatus.DRAFT,
        )

    def to_dict(self) -> dict:
        """Serialize to JSON."""
        return {
            "platform": self.platform.value,
            "title": self.title,
            "body": self.body,
            "hashtags": self.hashtags,
            "emojis": self.emojis,
            "cta": self.cta,
            "tone": self.tone.value,
            "trendingTopic": self.trending_topic,
            "gpuMention": self.gpu_mention,
            "createdAt": self.created_at,
        }


@dataclass
class TrendingSocialsResult:
    """Output from a single generation run."""

    posts: list[SocialPostResult]
    trending_topics: list[TrendingTopic]
    product_context: Optional[Product] = None
    model_used: str = "gemini-2.0-flash"
    generation_time_ms: int = 0

    def to_content_items(self) -> list[ContentItem]:
        """Convert all posts to ContentItem list."""
        return [p.to_content_item() for p in self.posts]

    def to_json(self, indent: int = 2) -> str:
        """Serialize to JSON."""
        return json.dumps(
            {
                "posts": [p.to_dict() for p in self.posts],
                "trendingTopics": [
                    {
                        "keyword": t.keyword,
                        "category": t.category,
                        "platforms": t.platforms,
                        "volume": t.volume,
                        "urgency": t.urgency,
                        "relevance": t.relevance,
                    }
                    for t in self.trending_topics
                ],
                "productContext": (
                    self.product_context.name
                    if self.product_context
                    else None
                ),
                "modelUsed": self.model_used,
                "generationTimeMs": self.generation_time_ms,
            },
            ensure_ascii=False,
            indent=indent,
        )


# ============================================================================
# TRENDING TOPICS DATABASE (real-world examples + seasonal)
# ============================================================================

GAMING_TRENDING_TOPICS = [
    # Current trends (Feb 2025)
    TrendingTopic(
        keyword="GTA VI System Requirements",
        category="gaming",
        platforms=["twitter", "youtube-shorts", "tiktok"],
        volume=8500,
        urgency=0.95,
        relevance=0.95,
        context="GTA VI's actual PC requirements revealed — sparks debate",
    ),
    TrendingTopic(
        keyword="RTX 5090 Gaming Performance",
        category="gaming",
        platforms=["youtube-shorts", "twitter", "instagram"],
        volume=6200,
        urgency=0.9,
        relevance=0.98,
        context="Nvidia's flagship GPU launched, benchmarks everywhere",
    ),
    TrendingTopic(
        keyword="Best Gaming PC Under 1000 USD",
        category="gaming",
        platforms=["tiktok", "instagram", "youtube-shorts"],
        volume=5400,
        urgency=0.7,
        relevance=0.92,
        context="Budget gaming builds trending — evergreen search",
    ),
    TrendingTopic(
        keyword="1440p 240Hz Competitive Gaming",
        category="gaming",
        platforms=["tiktok", "twitter"],
        volume=4100,
        urgency=0.65,
        relevance=0.88,
        context="Pro gamers swear by this — FPS esports trend",
    ),
    TrendingTopic(
        keyword="Is Gaming PC Worth It vs Console",
        category="gaming",
        platforms=["youtube-shorts", "instagram", "twitter"],
        volume=3800,
        urgency=0.6,
        relevance=0.9,
        context="Debate revival — PS5/Xbox vs high-end PC boxing match",
    ),
    TrendingTopic(
        keyword="Gaming Laptop vs Desktop Performance 2025",
        category="tech",
        platforms=["youtube-shorts", "twitter"],
        volume=3500,
        urgency=0.7,
        relevance=0.85,
        context="Mobile GPU improvements sparking comparisons",
    ),
    TrendingTopic(
        keyword="RTX 5070 vs RTX 4080 Value",
        category="gaming",
        platforms=["twitter", "youtube-shorts"],
        volume=3200,
        urgency=0.8,
        relevance=0.96,
        context="New midrange GPU pricing analysis",
    ),
    TrendingTopic(
        keyword="144Hz Monitor Essential for Gaming",
        category="gaming",
        platforms=["tiktok", "instagram"],
        volume=2900,
        urgency=0.5,
        relevance=0.82,
        context="Myth-busting trend: do you REALLY need high refresh?",
    ),
    TrendingTopic(
        keyword="Gaming PC Upgrade Guide 2025",
        category="tech",
        platforms=["youtube-shorts", "instagram"],
        volume=2600,
        urgency=0.6,
        relevance=0.88,
        context="New year = fresh builds and upgrades",
    ),
    TrendingTopic(
        keyword="Silent Gaming PC Builds",
        category="tech",
        platforms=["instagram", "tiktok"],
        volume=2200,
        urgency=0.5,
        relevance=0.80,
        context="RTX 50 series stays cool — silence trend",
    ),
]

# ============================================================================
# SYSTEM PROMPTS & TONE DICTIONARIES
# ============================================================================

BRAND_VOICE = (
    "You are a world-class social media copywriter for HelloComp, "
    "a Czech gaming PC manufacturer. Your posts are human, witty, "
    "authoritative, and always trend-aware. You balance technical depth "
    "with accessibility. You use emoji sparingly but effectively. "
    "Always write in Czech unless the platform defaults to English "
    "(Twitter/X). Mention specific GPU/specs when relevant. "
    "Never be salesy—be helpful and entertaining first."
)

PLATFORM_GUIDELINES = {
    SocialPlatform.TIKTOK: {
        "max_length": 150,
        "emoji_count": "2-4",
        "hashtags": "3-8",
        "tone": "casual or viral",
        "hooks": [
            "POV:",
            "Wait till you see…",
            "Nobody talks about…",
            "Plot twist…",
            "3 things…",
        ],
        "cta_style": "Link in bio",
    },
    SocialPlatform.INSTAGRAM: {
        "max_length": 300,
        "emoji_count": "2-5",
        "hashtags": "10-30",
        "tone": "professional or emotional",
        "hooks": [
            "Swipe for…",
            "Save this if…",
            "The only guide you need…",
            "This changed the game…",
        ],
        "cta_style": "Link in bio / DM us",
    },
    SocialPlatform.TWITTER: {
        "max_length": 280,
        "emoji_count": "1-2",
        "hashtags": "1-3",
        "tone": "aggressive or professional",
        "hooks": ["Hot take:", "Unpopular opinion:", "Just saw…", "Chart time:"],
        "cta_style": "Reply / Quote Tweet",
    },
    SocialPlatform.LINKEDIN: {
        "max_length": 500,
        "emoji_count": "1-2",
        "hashtags": "3-5",
        "tone": "professional",
        "hooks": [
            "Here's what I learned…",
            "The future of gaming is…",
            "3 insights from…",
        ],
        "cta_style": "Connect / Learn more",
    },
    SocialPlatform.YOUTUBE_SHORTS: {
        "max_length": 200,
        "emoji_count": "2-4",
        "hashtags": "3-5",
        "tone": "viral or casual",
        "hooks": [
            "This will blow your mind…",
            "Wait for the end…",
            "Nobody expects…",
        ],
        "cta_style": "Subscribe / Like & Comment",
    },
}

TONE_TEMPLATES = {
    ContentTone.AGGRESSIVE: {
        "intro": "Hardbody take, no BS:",
        "outro": "Fight me in the replies.",
        "example": "Stop settling for 60 FPS. HelloComp + RTX 5090 = 240 FPS minimum.",
    },
    ContentTone.CASUAL: {
        "intro": "So this just happened:",
        "outro": "Your move, gaming fam.",
        "example": "When your gaming PC is so fast, you accidentally skipped the cutscene. 😅",
    },
    ContentTone.PROFESSIONAL: {
        "intro": "Here's the data:",
        "outro": "Questions? Drop them below.",
        "example": "Benchmark data shows RTX 5070 delivers 35% better value than prior gen.",
    },
    ContentTone.VIRAL: {
        "intro": "This is wild:",
        "outro": "You have to see this.",
        "example": "We put a RTX 5090 in a 1999 PC case. The result is insane. 🤯",
    },
    ContentTone.EMOTIONAL: {
        "intro": "This story hits different:",
        "outro": "What's your gaming story?",
        "example": "From budget build to esports champion. See how it all started.",
    },
}


# ============================================================================
# CORE GENERATOR
# ============================================================================


class TrendingSocialsGenerator:
    """AI-powered trending social post generator."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize with optional Gemini API key."""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.has_ai = self.api_key is not None
        self.trending_topics = GAMING_TRENDING_TOPICS

    def _build_gemini_prompt(
        self,
        platform: SocialPlatform,
        tone: ContentTone,
        topic: TrendingTopic,
        product: Optional[Product] = None,
        num_variants: int = 2,
    ) -> str:
        """Build a detailed prompt for Gemini API."""
        guidelines = PLATFORM_GUIDELINES[platform]

        prompt = f"""
{BRAND_VOICE}

TASK: Generate {num_variants} social media post variants for {platform.value}.

TRENDING TOPIC: {topic.keyword}
Context: {topic.context}
Tone: {tone.value}

CONSTRAINTS:
- Max length: {guidelines['max_length']} chars
- Emojis: {guidelines['emoji_count']}
- Hashtags: {guidelines['hashtags']} (return as list)
- Tone: {tone.value}
- Language: Czech (unless mentioned otherwise)

PLATFORM TIPS:
- This platform's hooks work well: {', '.join(guidelines['hooks'][:3])}
- Typical CTA: {guidelines['cta_style']}

{f"PRODUCT CONTEXT: {product.name} (GPU: {product.gpu}, Tier: {product.tier})" if product else ""}

TONE STYLE GUIDE:
{TONE_TEMPLATES[tone]['intro']}
→ {TONE_TEMPLATES[tone]['example']}

OUTPUT FORMAT (return valid JSON only):
{{
    "variants": [
        {{
            "body": "Post text here (must fit max length)",
            "hashtags": ["tag1", "tag2", ...],
            "emojis": ["emoji", "emoji", ...],
            "cta": "optional call-to-action text"
        }},
        ...
    ]
}}

Generate now. Be creative, human, and authentic. No fluff."""

        return prompt

    def _call_gemini(self, prompt: str) -> Optional[dict]:
        """Call Google Gemini API with retry logic."""
        if not self.has_ai:
            return None

        try:
            import google.generativeai as genai

            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt)

            # Extract JSON from response
            text = response.text
            json_match = re.search(r"\{.*\}", text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            return None

        except Exception as e:
            print(f"⚠️ Gemini API error: {e}")
            return None

    def _generate_fallback_post(
        self,
        platform: SocialPlatform,
        tone: ContentTone,
        topic: TrendingTopic,
        product: Optional[Product] = None,
    ) -> SocialPostResult:
        """Deterministic template fallback (no API key needed)."""
        templates = {
            SocialPlatform.TIKTOK: (
                "POV: Najdeš si HelloComp PC s {gpu} a {topic} se změní. "
                "240 FPS guaranteed. 🔥💻 Trust the specs. #gamingpc #{topic_slug}"
            ),
            SocialPlatform.INSTAGRAM: (
                "Wait till you see what happens when {topic} meets {gpu} performance. "
                "Benchmark incoming. 👀 Follow for daily gaming tech updates. "
                "#gamingpc #tech #{topic_slug}"
            ),
            SocialPlatform.TWITTER: (
                "Hot take: {gpu} + HelloComp = the {topic} solution nobody "
                "expected. Numbers don't lie. 📊 #{topic_slug}"
            ),
            SocialPlatform.LINKEDIN: (
                "Here's what I learned about {topic} and high-performance PC "
                "gaming: investment > regret. Thread incoming. #{topic_slug}"
            ),
            SocialPlatform.YOUTUBE_SHORTS: (
                "This {gpu} PC handles {topic} smoothly. Watch till the end "
                "for the FPS benchmarks. 🎮 Sub for more. #{topic_slug}"
            ),
            SocialPlatform.FACEBOOK: (
                "{topic} destroying your PC? HelloComp {gpu} rigs handle it "
                "with ease. Check current deals 👇 #gamingpc"
            ),
        }

        gpu = product.gpu if product else "RTX 5090"
        topic_slug = topic.keyword.lower().replace(" ", "_")

        template = templates.get(
            platform,
            "Trending: {topic} — HelloComp PC delivers. {gpu} in stock now. #gaming",
        )
        body = template.format(gpu=gpu, topic=topic.keyword, topic_slug=topic_slug)

        # Trim if needed
        if len(body) > PLATFORM_GUIDELINES[platform]["max_length"]:
            body = body[: PLATFORM_GUIDELINES[platform]["max_length"] - 3] + "..."

        emoji_map = {
            SocialPlatform.TIKTOK: ["🔥", "💻", "⚡"],
            SocialPlatform.INSTAGRAM: ["👀", "🎮", "✨"],
            SocialPlatform.TWITTER: ["📊", "🚀", "💪"],
            SocialPlatform.LINKEDIN: ["📈", "💡", "🎯"],
            SocialPlatform.YOUTUBE_SHORTS: ["🎮", "⚡", "🔥"],
        }

        hashtags = [
            f"#{topic_slug}",
            "#gamingpc",
            "#HelloComp",
        ]
        if platform == SocialPlatform.TWITTER:
            hashtags.append("#tech")

        return SocialPostResult(
            platform=platform,
            title=f"{platform.value.title()} Post — {topic.keyword}",
            body=body,
            hashtags=hashtags,
            emojis=emoji_map.get(platform, ["🔥", "💻"]),
            cta=PLATFORM_GUIDELINES[platform]["cta_style"],
            tone=tone,
            trending_topic=topic.keyword,
            gpu_mention=gpu,
        )

    def generate_for_topic(
        self,
        topic: Optional[TrendingTopic] = None,
        platforms: Optional[list[SocialPlatform]] = None,
        tones: Optional[list[ContentTone]] = None,
        product: Optional[Product] = None,
    ) -> TrendingSocialsResult:
        """Generate posts for a trending topic across platforms."""
        import time

        start = time.time()

        # Defaults
        if topic is None:
            topic = self.trending_topics[0]
        if platforms is None:
            platforms = list(SocialPlatform)
        if tones is None:
            tones = [ContentTone.CASUAL, ContentTone.VIRAL]

        posts: list[SocialPostResult] = []

        for platform in platforms:
            for tone in tones:
                if self.has_ai:
                    # Try AI generation
                    prompt = self._build_gemini_prompt(
                        platform, tone, topic, product
                    )
                    result = self._call_gemini(prompt)

                    if result and "variants" in result:
                        for variant in result["variants"]:
                            posts.append(
                                SocialPostResult(
                                    platform=platform,
                                    title=f"{platform.value} {tone.value} Variant",
                                    body=variant.get("body", ""),
                                    hashtags=variant.get("hashtags", []),
                                    emojis=variant.get("emojis", []),
                                    cta=variant.get("cta"),
                                    tone=tone,
                                    trending_topic=topic.keyword,
                                    gpu_mention=product.gpu
                                    if product
                                    else None,
                                )
                            )
                        continue

                # Fallback to template
                posts.append(
                    self._generate_fallback_post(
                        platform, tone, topic, product
                    )
                )

        end = time.time()
        return TrendingSocialsResult(
            posts=posts,
            trending_topics=[topic],
            product_context=product,
            generation_time_ms=int((end - start) * 1000),
        )

    def generate_all_trending(
        self,
        platforms: Optional[list[SocialPlatform]] = None,
        num_topics: int = 3,
        product: Optional[Product] = None,
    ) -> TrendingSocialsResult:
        """Generate posts for multiple trending topics."""
        import time

        start = time.time()
        posts: list[SocialPostResult] = []
        topics = self.trending_topics[:num_topics]

        for topic in topics:
            result = self.generate_for_topic(
                topic=topic,
                platforms=platforms,
                tones=[ContentTone.CASUAL, ContentTone.VIRAL],
                product=product,
            )
            posts.extend(result.posts)

        end = time.time()
        return TrendingSocialsResult(
            posts=posts,
            trending_topics=topics,
            product_context=product,
            generation_time_ms=int((end - start) * 1000),
        )


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================


def generate_trending_posts(
    api_key: Optional[str] = None,
    platforms: Optional[list[str]] = None,
    num_topics: int = 2,
) -> TrendingSocialsResult:
    """Quick one-liner for trending post generation.

    Parameters
    ----------
    api_key : str, optional
        Google Gemini API key (falls back to GEMINI_API_KEY env var).
    platforms : list[str], optional
        List of platforms (tiktok, instagram, twitter, linkedin, youtube-shorts).
    num_topics : int
        Number of trending topics to generate posts for.

    Returns
    -------
    TrendingSocialsResult
        Generated posts, trending topics, and metadata.
    """
    gen = TrendingSocialsGenerator(api_key=api_key)

    platform_objs = None
    if platforms:
        platform_objs = [
            p for p in SocialPlatform if p.value in platforms
        ]

    return gen.generate_all_trending(
        platforms=platform_objs, num_topics=num_topics
    )
