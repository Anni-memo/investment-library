"""Replace kessan-navi URL across the investment-library site.

Usage:
    python scripts/maintenance/_update_kessan_navi_url.py --dry
    python scripts/maintenance/_update_kessan_navi_url.py --old https://kessan.constella-hd.co.jp/ --new https://kessan.constella-hd.co.jp/

Defaults:
    old = https://kessan.constella-hd.co.jp/
    new = https://kessan.constella-hd.co.jp/

Idempotent. Skips *.backup.html and binary assets.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

DEFAULT_OLD = "https://kessan.constella-hd.co.jp/"
DEFAULT_NEW = "https://kessan.constella-hd.co.jp/"

EXTENSIONS = {".html", ".js", ".json", ".txt", ".xml", ".md", ".css", ".py"}
SKIP_SUFFIXES = {".backup.html"}


def is_skipped(p: Path) -> bool:
    name = p.name.lower()
    for s in SKIP_SUFFIXES:
        if name.endswith(s):
            return True
    return False


def parse_args(argv):
    dry = False
    old = DEFAULT_OLD
    new = DEFAULT_NEW
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--dry":
            dry = True
        elif a == "--old" and i + 1 < len(argv):
            old = argv[i + 1]
            i += 1
        elif a == "--new" and i + 1 < len(argv):
            new = argv[i + 1]
            i += 1
        i += 1
    return dry, old, new


def main():
    dry, old, new = parse_args(sys.argv[1:])
    files_changed = 0
    total_occurrences = 0
    skipped_non_utf8 = 0

    for p in ROOT.rglob("*"):
        if not p.is_file():
            continue
        if p.suffix.lower() not in EXTENSIONS:
            continue
        if is_skipped(p):
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            skipped_non_utf8 += 1
            continue
        if old not in text:
            continue
        count = text.count(old)
        total_occurrences += count
        files_changed += 1
        if not dry:
            p.write_text(text.replace(old, new), encoding="utf-8")

    print(f"mode={'DRY' if dry else 'APPLY'}")
    print(f"old={old}")
    print(f"new={new}")
    print(f"files_changed={files_changed}")
    print(f"total_occurrences={total_occurrences}")
    print(f"skipped_non_utf8={skipped_non_utf8}")


if __name__ == "__main__":
    main()
