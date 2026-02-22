import json, os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

with open("data/products-cache.json") as f:
    data = json.load(f)

products = data["products"]
priced = [p for p in products if p.get("price") and p["price"] > 0]
prices = [p["price"] for p in priced]

print(f"Total: {len(products)}, With price: {len(priced)}")
print(f"Range: {min(prices)} - {max(prices)} CZK")

tiers = {"under_10k": 0, "10k_20k": 0, "20k_35k": 0, "over_35k": 0}
for pr in prices:
    if pr < 10000: tiers["under_10k"] += 1
    elif pr < 20000: tiers["10k_20k"] += 1
    elif pr < 35000: tiers["20k_35k"] += 1
    else: tiers["over_35k"] += 1

print("\nPRICE TIERS:")
for k, v in tiers.items():
    print(f"  {k}: {v}")

lineups = {}
for p in products:
    lu = p.get("lineup", "N/A")
    lineups[lu] = lineups.get(lu, 0) + 1

print("\nLINEUPS:")
for k, v in sorted(lineups.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")

gpu_series = {}
for p in priced:
    gpu = p.get("specs", {}).get("gpu", "")
    if "RTX 50" in gpu: gpu_series["RTX 50xx"] = gpu_series.get("RTX 50xx", 0) + 1
    elif "RTX 40" in gpu: gpu_series["RTX 40xx"] = gpu_series.get("RTX 40xx", 0) + 1
    elif "RTX 30" in gpu: gpu_series["RTX 30xx"] = gpu_series.get("RTX 30xx", 0) + 1
    elif "RTX 20" in gpu: gpu_series["RTX 20xx"] = gpu_series.get("RTX 20xx", 0) + 1
    elif "GTX 16" in gpu: gpu_series["GTX 16xx"] = gpu_series.get("GTX 16xx", 0) + 1
    elif "GTX 10" in gpu: gpu_series["GTX 10xx"] = gpu_series.get("GTX 10xx", 0) + 1
    elif "RX 7" in gpu: gpu_series["RX 7xxx"] = gpu_series.get("RX 7xxx", 0) + 1
    elif "RX 6" in gpu: gpu_series["RX 6xxx"] = gpu_series.get("RX 6xxx", 0) + 1
    elif "RX 5" in gpu: gpu_series["RX 5xxx"] = gpu_series.get("RX 5xxx", 0) + 1
    elif gpu: gpu_series["other"] = gpu_series.get("other", 0) + 1

print("\nGPU SERIES:")
for k, v in sorted(gpu_series.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")

top_cats = {}
for p in products:
    for t in p.get("tags", []):
        if isinstance(t, dict) and "#text" in t:
            parts = t["#text"].split(" > ")
            cat = parts[0] + (" > " + parts[1] if len(parts) > 1 else "")
            top_cats[cat] = top_cats.get(cat, 0) + 1

print("\nTOP CATEGORIES:")
for k, v in sorted(top_cats.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")

print("\nTOP 5 EXPENSIVE:")
for p in sorted(priced, key=lambda x: -x["price"])[:5]:
    print(f"  {p['price']} CZK - {p['name'][:60]} [{p.get('lineup','')}]")

print("\nSAMPLE PRODUCT FIELDS:")
p = priced[10]
print(json.dumps(p, indent=2, ensure_ascii=False))
