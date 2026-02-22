
Hluboká analýza FPS kalkulátoru na HelloComp.cz
Architektura – dva oddělené moduly
Kalkulátor se skládá ze dvou JS souborů:

1. fpsapicomp.js – FPS box na stránce produktu
Tento skript se spouští na každé stránce produktu herního PC.
​

Co dělá:

Detekuje, jestli je stránka herní PC (kontroluje breadcrumbs: „herní (gaming)" + „počítač")

Vytáhne CPU a GPU z .konfigurace-item elementů přímo ze stránky produktu

Zobrazí scrollovatelný seznam her (seřazený podle Twitch viewers)

Přepínač rozlišení: Full HD / WQHD / 4K

Přepínač grafických presetů: Low / Medium / High / Epic (dynamicky podle hry)

Volá API https://fps-proxy.vercel.app/api/fps?endpoint=batch (POST) a zobrazí průměrné FPS

Chytré mapování presetů:
​

Hry se 2 presety → mapuje na Low/High

Hry se 3 presety (např. GTA V: Normal/High/Ultra) → mapuje na Low/Medium/High, Epic se vypne

Hry se 4+ presety → standardní Low/Medium/High/Epic

Výchozí preset preferuje vždy Medium → High → Low → Epic

2. vyberpcfps.js – PC Finder / konfigurátor na /vybereme-za-vas-herni-pc/
​
Komplexnější nástroj — celý workflow od výběru her po doporučení sestav.

Data flow (krok za krokem):

text
1. INICIALIZACE
   └─ fetchMeta() → https://fps-proxy.vercel.app/api/fps?endpoint=cpus/gpus/games
      └─ Načte databázi CPU, GPU, her (s presety a Twitch viewers)

2. PC FEED
   └─ fetch(https://www.hellocomp.cz/heureka/export/products.xml)
      └─ Parsuje Heureka XML feed (DOMParser)
      └─ Filtruje jen "HelloComp AMD/Intel" sestavy (ne office, ne sety)
      └─ Sloučí varianty → zobrazí cenu "od X Kč"
      └─ Cache v sessionStorage (TTL 6 hodin) → rychlé opakované načtení

3. MATCHING (CPU/GPU name → databázové ID)
   └─ normalizeHW() → odstraní brand noise (ASUS, MSI, GAMING, OC, VRAM info...)
   └─ Exact match → Partial match → Reverse match → log NOT FOUND

4. BATCH FPS PREDICT
   └─ Sestavy rozdělí do chunků po 10 (FPS_BATCH_SIZE)
   └─ POST https://fps-proxy.vercel.app/api/fps?endpoint=batch
      Body: { cpuIds: [...], gpuIds: [...], games: [{id, resolution, preset}] }
   └─ Fallback: pokud API vrátí prázdno s presety → retry bez presetů

5. SCORING & SORT
   └─ "Doporučujeme": stabilita (min FPS) + preference ASUS/Individual
   └─ "Nejvíc FPS": průměr přes všechny vybrané hry
   └─ "Nejlevnější/Nejdražší": cena

6. RENDER
   └─ PC karty s FPS per-game (zelená ≥60, žlutá 40-60, červená <40)
   └─ Stránkování po 6 sestavách (RESULTS_PAGE_SIZE)
Klíčové technické detaily
Konstanta	Hodnota	Význam
MAX_GAMES	4	Max her pro porovnání
PCS_SHORTLIST	30	Top N sestav jde do FPS výpočtu
FPS_BATCH_SIZE	10	Chunk size pro batch API
RESULTS_PAGE_SIZE	6	Sestav na stránku
PCS_CACHE_TTL_MS	6 hodin	Heureka XML cache
Multilanguage: CZ / SK / HU – detekce podle URL path, hostname, HTML lang atributu, nebo ?lang= parametru. Ceny se automaticky konvertují (CZK → EUR kurz 0.041, CZK → HUF kurz 14.5).
​

Backend: https://fps-proxy.vercel.app/api/fps – Vercel serverless proxy na HowManyFPS databázi. Endpointy: cpus, gpus, games, batch, game-info.

Preference algoritmus: Sestavy s "Individual" (+1000 bodů), "ASUS" (+300), "TUF/ROG/Prime" (+120), "Gamer/Herní" (+30) jsou upřednostněny při stejném FPS skóre.
​

Nápady na content pro HelloComp
Videa / Reels:

„Jak funguje náš FPS kalkulátor?" – screencast walkthrough, ukaž výběr her, přepínání presetů, vysvětli co znamenají barevné FPS hodnoty

„CS2 na Full HD vs 4K – jaký PC potřebuješ?" – použij kalkulátor živě, porovnej sestavy za 25k vs 45k+

„Proč vám Intel nestačí na Cyberpunk v Ultra?" – kalkulátor jako „důkaz", pak navrhni správnou sestavu

„Top 3 herní sestavy pod 25 000 Kč podle FPS" – live demo nástroje, výsledky jako základ článku

„Max FPS vs Vyvážené vs Max kvalita – co to reálně znamená?" – edukační video o grafických presetech, kalkulátor jako interaktivní ukázka

Články / SEO:

„Kolik FPS zvládne RTX 4060 v [hře]?" → answer je přímo z kalkulátoru, přirozený backlink na tool

Srovnávací tabulky CPU/GPU z dat, která API vrací (HowManyFPS databáze)

„Jak správně vybrat herní PC podle her, které hraju" – kalkulátor jako CTA na konci

Sociální sítě:

Screenshot výsledků pro populární kombinace her (CS2 + Valorant + Warzone) jako carousel

Story/Reel: „Zadej hry, dostaneš PC" – rychlý 30s demo

