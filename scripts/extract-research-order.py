import os
import re

p = os.path.join(
    os.environ["TEMP"],
    "tower-assets",
    "assets",
    "bin",
    "Data",
    "6f04703ffb986d94a9ec742d74a9e0ad",
)
raw = open(p, "rb").read()

# English lab names from our manifest (unique)
import json
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
manifest = json.load(open(os.path.join(root, "public/research/manifest.json")))
manifest_names = []
for rel in manifest["sectionFiles"]:
    sec = json.load(open(os.path.join(root, "public", rel)))
    for it in sec["items"]:
        manifest_names.append(it["name"])

# Scan file for manifest names; record offset
hits = []
for name in manifest_names:
    b = name.encode("utf-8")
    idx = 0
    while True:
        idx = raw.find(b, idx)
        if idx < 0:
            break
        hits.append((idx, name))
        idx += 1

hits.sort()
# dedupe close duplicates (same name multiple locales) - keep first occurrence clusters
filtered = []
last_name = None
last_off = -10_000
for off, name in hits:
    if name == last_name and off - last_off < 200:
        continue
    filtered.append((off, name))
    last_name = name
    last_off = off

print("unique name hits in asset:", len(filtered))
print("first 40 by file offset:")
for off, name in filtered[:40]:
    print(off, name)

# Check if manifest order matches offset order for first section
main_names = manifest_names[:21]
main_hits = [(o, n) for o, n in filtered if n in main_names]
print("\nmain section hits:", len(main_hits))
for o, n in main_hits[:15]:
    print(o, n)
