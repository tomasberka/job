# HelloComp Content Automation Tools

Python toolkit pro automatizaci marketingového obsahu pro [HelloComp](https://hellocomp.cz) — českou značku herních PC.

---

## Nástroje

### 1. Hook-Master — AI Video Script Engine

Generuje TikTok hooky, 9:16 video scénáře a SEO popisky pomocí **Google Gemini API**. Bez API klíče funguje v template režimu.

**Vstup:** název GPU + cílová skupina  
**Výstup:** 3 hooky, video scénář, SEO popisek

```bash
# Template režim (bez API klíče)
hookmaster "RTX 5080" "hráč Warzone"

# S Google Gemini API
GEMINI_API_KEY=your-key hookmaster "RTX 5080" "hráč Warzone"

# JSON výstup (kompatibilní s dashboardem)
hookmaster "RTX 5070 Ti" "hráč CS2" --json
```

### 2. Loot-Box SEO — Dynamic Content Generator

Generuje SEO srovnávací tabulky a marketingové texty z CSV produktových dat.

```bash
# Celá nabídka
lootbox-seo

# Filtr na GPU
lootbox-seo --gpu "5070"

# Filtr na řadu + Markdown výstup
lootbox-seo --tier "Extreme" --format markdown

# JSON výstup + klíčová slova
lootbox-seo --gpu "5070" --format json --keywords

# HTML pro web
lootbox-seo --gpu "5080" --format html
```

---

## Instalace

```bash
cd tools/content-automation
pip install -e ".[dev]"
```

### Požadavky

- Python ≥ 3.10
- `google-genai` (Google Gemini API SDK)
- `pytest` (pro testy)

---

## Konfigurace

| Proměnná | Popis |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API klíč (volitelný — bez něj funguje template režim) |

---

## Testy

```bash
cd tools/content-automation
pytest -v
```

---

## Integrace s dashboardem

Oba nástroje generují výstup kompatibilní se schématy dashboardu (`ContentItem`):

```bash
# Generuj hooky a ulož jako JSON
hookmaster "RTX 5080" "hráč Warzone" --json > hooks.json

# Generuj SEO obsah jako JSON
lootbox-seo --gpu "5070" --format json > seo.json
```

Typy obsahu odpovídají TypeScript schématům:
- `tiktok-hook` — TikTok hooky
- `seo-meta` — SEO metadata a popisky
- `video-script` — Video scénáře
- `product-description` — Produktové popisy

---

## Struktura

```
tools/content-automation/
├── pyproject.toml                          # Konfigurace balíčku
├── README.md                               # Tento soubor
├── content_automation/
│   ├── __init__.py
│   ├── models.py                           # Datové modely (ContentItem, Product)
│   ├── csv_loader.py                       # CSV produktový loader
│   ├── hookmaster.py                       # Hook-Master — AI Video Script Engine
│   ├── lootbox_seo.py                      # Loot-Box SEO — Dynamic Content Generator
│   └── cli.py                              # CLI rozhraní
└── tests/
    ├── test_models.py
    ├── test_csv_loader.py
    ├── test_hookmaster.py
    └── test_lootbox_seo.py
```
