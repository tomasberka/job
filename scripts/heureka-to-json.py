#!/usr/bin/env python3
"""
Convert Heureka XML product feed to optimized JSON for photo-post-generator.
Usage: python3 scripts/heureka-to-json.py [input_xml] [output_json]
Defaults: fetches from hellocomp.cz, outputs to public/data/heureka-products.json
"""

import xml.etree.ElementTree as ET
import json
import sys
import urllib.request
import os

FEED_URL = "https://www.hellocomp.cz/heureka/export/products.xml"
DEFAULT_OUTPUT = os.path.join(os.path.dirname(__file__), "..", "public", "data", "heureka-products.json")


def parse_category(cat_text: str) -> dict:
    """Parse Heureka category path into simplified category info."""
    parts = [p.strip() for p in cat_text.split("|")] if cat_text else []
    full = " > ".join(parts[1:]) if len(parts) > 1 else cat_text
    last = parts[-1].strip().lower() if parts else ""
    
    # Use the LAST (most specific) category part for classification
    # This avoids "Počítače a notebooky" matching everything as notebook
    if "stolní počítače" in last:
        slug = "pc"
    elif last == "grafické karty":
        slug = "gpu"
    elif last == "notebooky" or last == "notebook":
        slug = "notebook"
    elif last == "procesory":
        slug = "cpu"
    elif "mobilní telefony" in last or "telefon" in last:
        slug = "phone"
    elif last == "monitory":
        slug = "monitor"
    elif "sluchátka" in last:
        slug = "headset"
    elif last in ("klávesnice", "myši", "podložky pod myš", "sety klávesnic a myší"):
        slug = "peripheral"
    elif last == "zdroje":
        slug = "psu"
    elif "pc skříně" in last or last == "skříně":
        slug = "case"
    elif "chladiče" in last:
        slug = "cooler"
    elif "základní desky" in last:
        slug = "mobo"
    elif "paměti" in last:
        slug = "ram"
    elif "pevné disky" in last or "ssd" in last:
        slug = "storage"
    elif "tablet" in last:
        slug = "tablet"
    elif "dron" in last:
        slug = "drone"
    elif "reprodukt" in last or "soundbar" in last:
        slug = "speaker"
    elif "mikrofon" in last:
        slug = "mic"
    elif "hodin" in last:
        slug = "watch"
    elif "dárkové poukazy" in last or "voucher" in last:
        slug = "voucher"
    elif "paměťové karty" in last or "usb flash" in last:
        slug = "storage"
    elif "grafické tablety" in last:
        slug = "tablet"
    else:
        slug = "other"
    
    return {"full": full, "slug": slug, "last": parts[-1].strip() if parts else cat_text}


def extract_params(item_el) -> dict:
    """Extract PARAM elements into a flat dict."""
    params = {}
    for param in item_el.findall("PARAM"):
        name_el = param.find("PARAM_NAME")
        val_el = param.find("VAL")
        if name_el is not None and val_el is not None and name_el.text and val_el.text:
            params[name_el.text.strip()] = val_el.text.strip()
    return params


def detect_lineup(name: str, params: dict) -> str:
    """Detect HelloComp lineup: SE / Pro / Max."""
    n = name.lower()
    if "gamer max" in n or " max " in n:
        return "Max"
    elif "gamer pro" in n or " pro " in n:
        return "Pro"
    elif "gamer se" in n or "gamer " in n:
        return "SE"
    
    # Fallback: check Typ PC param
    typ = params.get("Typ PC", "").lower()
    if "herní" in typ or "gaming" in typ:
        return "SE"
    return ""


def parse_price(price_str: str) -> float:
    """Parse Czech-format price like '12 990,00' to float."""
    if not price_str:
        return 0
    # Remove spaces and replace comma with dot
    cleaned = price_str.replace(" ", "").replace("\u00a0", "").replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return 0


def build_specs_summary(params: dict) -> dict:
    """Build a specs object from Heureka params."""
    specs = {}
    
    mapping = {
        "Typ procesoru": "cpu",
        "Frekvence procesoru": "cpuFreq",
        "Počet jader procesoru": "cpuCores",
        "Velikost operační paměti": "ram",
        "Model grafické karty": "gpu",
        "Značka grafického čipu": "gpuBrand",
        "Velikost grafické paměti": "vram",
        "Velikost pevného disku": "storage",
        "Operační systém (OS)": "os",
        "Druh grafické karty": "gpuType",
        "Dle použití": "usage",
        "Typ PC": "pcType",
        "Skříň": "case",
        "Barva": "color",
        "Socket": "socket",
        "Kapacita": "capacity",
        "Výkon": "power",
    }
    
    for heureka_key, json_key in mapping.items():
        val = params.get(heureka_key)
        if val:
            specs[json_key] = val
    
    return specs


def convert(input_path: str, output_path: str):
    print(f"Parsing XML: {input_path}")
    tree = ET.parse(input_path)
    root = tree.getroot()
    
    products = []
    for item in root.findall("SHOPITEM"):
        item_id = (item.findtext("ITEM_ID") or "").strip()
        name = (item.findtext("PRODUCTNAME") or "").strip()
        url = (item.findtext("URL") or "").strip()
        img = (item.findtext("IMGURL") or "").strip()
        price_str = (item.findtext("PRICE_VAT") or "").strip()
        manufacturer = (item.findtext("MANUFACTURER") or "").strip()
        cat_text = (item.findtext("CATEGORYTEXT") or "").strip()
        ean = (item.findtext("EAN") or "").strip()
        delivery_date = (item.findtext("DELIVERY_DATE") or "").strip()
        
        # Alternative images
        alt_imgs = [el.text.strip() for el in item.findall("IMGURL_ALTERNATIVE") if el.text]
        
        # Description (strip HTML)
        desc_raw = (item.findtext("DESCRIPTION") or "").strip()
        # Just keep it raw - the generator can use it or not
        
        params = extract_params(item)
        price = parse_price(price_str)
        category = parse_category(cat_text)
        lineup = detect_lineup(name, params)
        specs = build_specs_summary(params)
        
        product = {
            "id": item_id,
            "name": name,
            "url": url,
            "img": img,
            "price": price,
            "priceFormatted": f"{int(price):,} Kč".replace(",", " ") if price else "",
            "manufacturer": manufacturer,
            "category": category,
            "lineup": lineup,
            "specs": specs,
            "ean": ean,
            "inStock": delivery_date == "0",
        }
        
        if alt_imgs:
            product["altImgs"] = alt_imgs
        
        products.append(product)
    
    # Sort: PCs first, then by price descending
    cat_order = {"pc": 0, "gpu": 1, "notebook": 2, "cpu": 3, "monitor": 4, "phone": 5}
    products.sort(key=lambda p: (cat_order.get(p["category"]["slug"], 99), -p["price"]))
    
    # Stats
    cats = {}
    for p in products:
        s = p["category"]["slug"]
        cats[s] = cats.get(s, 0) + 1
    
    output = {
        "meta": {
            "source": "heureka",
            "feedUrl": FEED_URL,
            "totalProducts": len(products),
            "categories": cats,
        },
        "products": products,
    }
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=1)
    
    size_kb = os.path.getsize(output_path) / 1024
    print(f"✅ Wrote {len(products)} products to {output_path} ({size_kb:.0f} KB)")
    print(f"   Categories: {cats}")


if __name__ == "__main__":
    input_path = sys.argv[1] if len(sys.argv) > 1 else "/tmp/heureka-products.xml"
    output_path = sys.argv[2] if len(sys.argv) > 2 else os.path.abspath(DEFAULT_OUTPUT)
    
    # If no local file, download first
    if not os.path.exists(input_path):
        print(f"Downloading feed from {FEED_URL}...")
        urllib.request.urlretrieve(FEED_URL, input_path)
        print(f"Downloaded to {input_path}")
    
    convert(input_path, output_path)
