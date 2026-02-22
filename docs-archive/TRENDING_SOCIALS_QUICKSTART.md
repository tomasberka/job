# 🚀 Trending Social Posts — Quick Start

**Generated professional, trend-aware social media posts in seconds.**

This guide gets you posting trending content with HelloComp gaming PCs fast.

---

## 5-Minute Setup

### Step 1: Optional — Add Gemini API Key

For AI-powered posts (recommended), set your Google Gemini API key:

```bash
# Create .env.local at project root
echo "GEMINI_API_KEY=sk-your-google-gemini-key-here" >> .env.local
```

Without this, the system uses professional template-based posts (offline-friendly).

### Step 2: Start Development Server

```bash
npm install  # if not already done
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 3: Navigate to Social Posts

Click "Sociální sítě" (Social Media) in the sidebar, or go to:
```
http://localhost:3000/social-posts
```

---

## 60-Second Usage

1. **Select Platforms**: Check TikTok, Instagram, Twitter, etc.
2. **Set Topics**: Adjust slider (1-5 trending topics)
3. **Click Generate**: Waits 1-3 seconds for AI posts
4. **Copy**: Click "Copy" on any post
5. **Paste**: Into your social media editor
6. **Post**: Done! 🎉

---

## What You Get

### Real Example Output

**Platform:** TikTok | **Tone:** Casual | **Topic:** GTA VI

```
POV: Právě sis dal HelloComp s RTX 5090 
do PC a GTA VI lobby se třese. 240 FPS. 🔥💻

#gta6 #gamingpc #helloco
```

**Platform:** Instagram | **Tone:** Viral | **Topic:** RTX 5090

```
Když tvé gaming PC je tak výkonné, 
že accidentálně skipneš cutscenu. 

RTX 5090 v HelloComp = přesně to co potřebuješ 👀

#rtx5090 #gaming
```

---

## Features Summary

| Feature | Benefit |
|---------|---------|
| 🎯 **Trend-Aware** | Posts leverage real gaming trends (GTA VI, RTX 5090, etc.) |
| 📱 **Multi-Platform** | Optimized for TikTok, Instagram, Twitter, LinkedIn, YouTube Shorts |
| 🎨 **5 Tones** | Choose: Aggressive (myth-bust), Casual, Professional, Viral, Emotional |
| 🤖 **AI-Powered** | Google Gemini 2.0 creates human-like Czech copy |
| ⚡ **Instant** | 1-3 seconds per batch |
| 🎁 **Template Fallback** | Works offline without API key |
| 📋 **Copy-Ready** | Hashtags, emojis, CTAs auto-included |
| 🔗 **Direct Share** | One-click links to social platforms |

---

## Common Workflows

### Quick Social Media Blitz

1. Open [/social-posts](http://localhost:3000/social-posts)
2. Select all platforms (TikTok, Instagram, Twitter, LinkedIn)
3. Set to 3 topics
4. Generate
5. Copy top 3-5 posts
6. Schedule across platforms

**Time:** 2-3 minutes for multi-platform content batch

### Test Different Tones

1. Generate posts with "Casual" tone
2. Note what resonates
3. Generate again with "Viral" tone
4. Compare engagement hooks
5. Use best for real posting

### A/B Test Copy

1. Generate 2 topics with same platform
2. Copy both variants
3. Post one now, one tomorrow
4. Track which gets more engagement
5. Use winning tone for future posts

---

## Settings & Customization

### Adjust Trending Topics

Skip to specific topics:

```bash
# CLI: Generate posts for specific topic only
trending-socials --platforms tiktok instagram --num-topics 1
```

### Change Default Platforms

Edit [social-posts-generator.tsx](src/features/content-generator/components/social-posts-generator.tsx):

```tsx
<SocialPostsGenerator
  defaultPlatforms={["tiktok", "instagram"]}  // Change here
  defaultNumTopics={2}
/>
```

### Extend Trending Topics

Add custom trends to [trending_socials.py](tools/content-automation/content_automation/trending_socials.py):

```python
GAMING_TRENDING_TOPICS.append(
    TrendingTopic(
        keyword="Your Topic",
        category="gaming",
        platforms=["tiktok", "instagram"],
        relevance=0.95,
    )
)
```

---

## Troubleshooting

### Posts Not Loading

**Check:**
1. Dev server running: `npm run dev`
2. API endpoint: Visit [/api/social-posts](http://localhost:3000/api/social-posts) in browser
3. Console errors: Open browser DevTools (F12)

**Fix:**
```bash
# Restart dev server
npm run dev

# Clear cache
rm -rf .next
npm run dev
```

### "Gemini API error"

**Means:** API key invalid or missing

**Fix:**
1. Verify key in `.env.local` is correct
2. Copy from Google AI Studio: https://aistudio.google.com/app/apikey
3. Restart dev server after adding key
4. Works without key (uses templates instead)

### Posts All Same Tone

**Means:** Only generating one tone

**Fix:** The component automatically generates multiple tones. If seeing duplicates, try:
1. Increase "Trending Topics" slider
2. Different platform selection
3. Refresh page

---

## CLI Usage (Advanced)

### Generate Posts Directly

```bash
# Basic (uses GEMINI_API_KEY from env)
trending-socials

# Specific platforms
trending-socials --platforms tiktok instagram linkedin

# Multiple topics
trending-socials --num-topics 5

# JSON output (for scripts)
trending-socials --json --platforms tiktok instagram > posts.json

# Without API key (template mode)
trending-socials  # (still works, uses templates)
```

### Parse Output

```bash
# Get just TikTok posts
trending-socials --platforms tiktok --json | jq '.posts[] | select(.platform == "tiktok")'

# Count posts by platform
trending-socials --json --num-topics 3 | jq '.posts | group_by(.platform) | map(length)'

# Extract hashtags
trending-socials --json | jq '.posts[0].hashtags'
```

---

## Pro Tips

### 1. Batch Generate Weekly Content

```bash
# Generate 100 posts for the week
trending-socials --platforms tiktok instagram twitter --num-topics 5 --json > weekly_content.json
```

### 2. Test Tone Performance

Copy same post in different tones, track engagement:

```tsx
// Generate with aggressive tone
// Generate with casual tone
// Compare metrics after posting both
```

### 3. Create Content Calendar

1. Generate on Mondays for the week
2. Save JSON output
3. Schedule across platforms
4. Track metrics in Friday review

### 4. GPU-Specific Posts

Posts automatically mention relevant GPUs when context provided. Currently mentions:
- RTX 5090 (flagship)
- RTX 5070 (midrange)
- RX 9070 XT (AMD alternative)

---

## Next Steps

1. **Post Something**: Generate and copy a post now
2. **Check Analytics**: Track which posts perform best
3. **Customize Trends**: Add trending topics relevant to your audience
4. **Scale**: Use CLI for batch generation
5. **Integrate**: Connect to scheduling tool (Buffer, Later, etc.)

---

## Support

**Issues?**
- Check [TRENDING_SOCIALS.md](TRENDING_SOCIALS.md) for full docs
- Review `/social-posts` in dashboard for UI help
- Run `trending-socials --help` for CLI options

**Questions?**
- Browse FAQ in [TRENDING_SOCIALS.md](TRENDING_SOCIALS.md#faq)
- Check examples in dashboard UI

---

## What's Included

✅ Python module: `tools/content-automation/content_automation/trending_socials.py`
✅ TypeScript service: `src/features/content-generator/services/social-posts-service.ts`
✅ React component: `src/features/content-generator/components/social-posts-generator.tsx`
✅ API route: `src/app/api/social-posts/route.ts`
✅ Dashboard page: `src/app/social-posts/page.tsx`
✅ CLI command: `trending-socials` (in pyproject.toml)
✅ Full documentation: This file + TRENDING_SOCIALS.md

---

**🎉 You're ready to generate trending content!**

Visit `/social-posts` and start creating posts that actually convert.

---

**Last Updated:** February 2025  
**Status:** Production-Ready
