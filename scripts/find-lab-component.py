import os
import UnityPy

root = os.path.join(os.environ["TEMP"], "tower-assets", "assets", "bin", "Data")
env = UnityPy.load(root)
lab_scripts = 0
for obj in env.objects:
    if obj.type.name != "MonoScript":
        continue
    try:
        d = obj.read()
        name = getattr(d, "m_ClassName", "") or getattr(d, "name", "")
        if name == "Lab":
            lab_scripts += 1
            print("Lab script", obj.path)
    except Exception:
        pass
print("lab scripts", lab_scripts)

for obj in env.objects:
    if obj.type.name != "MonoBehaviour":
        continue
    try:
        tree = obj.read_typetree()
    except Exception:
        continue
    if not isinstance(tree, dict):
        continue
    if "researchPanelButtons" in tree:
        btns = tree.get("researchPanelButtons")
        names = tree.get("researchName")
        print("MonoBehaviour path", getattr(obj, "path", ""))
        print("  buttons", len(btns) if btns else 0)
        print("  names", len(names) if names else 0)
        if names and len(names) >= 200:
            for i in [0, 1, 30]:
                print(f"  name[{i}]", names[i])
        break
