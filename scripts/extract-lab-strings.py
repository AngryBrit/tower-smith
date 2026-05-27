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
for needle in [b"Game Speed", b"Damage", b"Labs Speed", b"Lab Speed"]:
    idx = raw.find(needle)
    if idx < 0:
        print(needle, "NOT FOUND")
        continue
    before = raw[max(0, idx - 30) : idx]
    num = re.findall(rb"\d{1,4}", before)
    print(needle.decode(), "preceding nums", [n.decode() for n in num[-3:]])

idx = raw.find(b"Damage")
chunk = raw[max(0, idx - 200) : idx + 120_000]
cur = b""
ordered = []
for b in chunk:
    if 32 <= b < 127:
        cur += bytes([b])
    else:
        if len(cur) >= 3:
            ordered.append(cur.decode("ascii"))
        cur = b""
print("strings after Game Speed anchor (first 80):")
for i, s in enumerate(ordered[:80]):
    print(i, repr(s))
