import os
import UnityPy

root = os.path.join(os.environ["TEMP"], "tower-assets", "assets", "bin", "Data")
env = UnityPy.load(root)
print("objects", len(env.objects))
for obj in env.objects:
    if obj.type.name != "MonoBehaviour":
        continue
    try:
        tree = obj.read_typetree()
    except Exception:
        continue
    if not isinstance(tree, dict):
        continue
    names = tree.get("researchName")
    if isinstance(names, list) and len(names) >= 200:
        print("FOUND Lab-like", getattr(obj, "path", ""), "names", len(names))
        print("first 10", names[:10])
        print("id30", names[30] if len(names) > 30 else "?")
        print("idx damage", names.index("Damage") if "Damage" in names else "?")
        break
else:
    print("no MonoBehaviour with researchName[200+]")
