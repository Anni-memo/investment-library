"""Replace '投資と思考の書斎' -> '投資Library' across the site.
Skips *.backup.html. Run with --dry to count without writing.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
OLD = "投資と思考の書斎"
NEW = "投資Library"

EXTENSIONS = {".html", ".js", ".json", ".txt", ".xml", ".md", ".css", ".py"}
SKIP_SUFFIXES = {".backup.html"}

def is_skipped(p: Path) -> bool:
    name = p.name.lower()
    for s in SKIP_SUFFIXES:
        if name.endswith(s):
            return True
    if "_replace_sitename.py" in name:
        return True
    return False

def iter_targets():
    for p in ROOT.rglob("*"):
        if not p.is_file():
            continue
        if p.suffix.lower() not in EXTENSIONS:
            continue
        if is_skipped(p):
            continue
        yield p

def main():
    dry = "--dry" in sys.argv
    total_files_changed = 0
    total_occurrences = 0
    skipped_files = 0
    for p in iter_targets():
        try:
            text = p.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            skipped_files += 1
            continue
        count = text.count(OLD)
        if count == 0:
            continue
        total_files_changed += 1
        total_occurrences += count
        if not dry:
            new_text = text.replace(OLD, NEW)
            p.write_text(new_text, encoding="utf-8")
    print(f"mode={'DRY' if dry else 'WRITE'}")
    print(f"files_changed={total_files_changed}")
    print(f"total_occurrences={total_occurrences}")
    print(f"skipped_non_utf8={skipped_files}")

if __name__ == "__main__":
    main()
