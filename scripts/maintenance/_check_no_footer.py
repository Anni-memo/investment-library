"""List HTML files without </footer>, grouped by top-level dir."""
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent.parent
SKIP_SUFFIXES = {".backup.html"}
SKIP_PATH_PARTS = {("assets", "pdf")}


def is_skipped(p: Path) -> bool:
    name = p.name.lower()
    for s in SKIP_SUFFIXES:
        if name.endswith(s):
            return True
    parts_lower = tuple(part.lower() for part in p.parts)
    for skip_seq in SKIP_PATH_PARTS:
        for i in range(len(parts_lower) - len(skip_seq) + 1):
            if parts_lower[i:i + len(skip_seq)] == skip_seq:
                return True
    return False


counter = Counter()
samples = {}
for p in ROOT.rglob("*.html"):
    if not p.is_file() or is_skipped(p):
        continue
    try:
        text = p.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    if "</footer>" in text:
        continue
    rel = p.relative_to(ROOT)
    top = rel.parts[0] if len(rel.parts) > 1 else "(root)"
    counter[top] += 1
    samples.setdefault(top, []).append(str(rel))

print(f"Total without </footer>: {sum(counter.values())}")
print()
for top, count in counter.most_common():
    print(f"{count:4d}  {top}")
    for s in samples[top][:3]:
        print(f"         {s}")
