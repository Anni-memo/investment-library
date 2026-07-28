"""Inject a 'Kessan Navi' external link just before </footer> in every HTML file.

- Idempotent: skips files that already contain 'kessan-navi' or the marker class.
- Skips *.backup.html and assets/pdf/* (PDF-gen intermediates).
- Run with --dry to count without writing.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

MARKER_CLASS = "footer-kn-ext"
KN_URL = "https://kessan.constella-hd.co.jp/"
KN_SNIPPET = (
    f'\n  <div class="{MARKER_CLASS}" '
    f'style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(139,105,20,.18);'
    f'font-size:.66rem;letter-spacing:.02em;">'
    f'<a href="{KN_URL}" target="_blank" rel="noopener" '
    f'style="color:#d4aa22;text-decoration:none;">'
    f'決算ナビ &#x2197; '
    f'<span style="color:rgba(223,201,168,.6);margin-left:6px;">'
    f'— 四半期決算の数字は別サイトで</span></a></div>\n'
)
CLOSE_TAG = "</footer>"

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


def iter_targets():
    for p in ROOT.rglob("*.html"):
        if not p.is_file():
            continue
        if is_skipped(p):
            continue
        yield p


def main():
    dry = "--dry" in sys.argv
    changed = 0
    already = 0
    no_footer = 0
    for p in iter_targets():
        try:
            text = p.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if CLOSE_TAG not in text:
            no_footer += 1
            continue
        if MARKER_CLASS in text or "kessan-navi" in text:
            already += 1
            continue
        new_text = text.replace(CLOSE_TAG, KN_SNIPPET + CLOSE_TAG, 1)
        changed += 1
        if not dry:
            p.write_text(new_text, encoding="utf-8")
    print(f"mode={'DRY' if dry else 'WRITE'}")
    print(f"changed={changed}")
    print(f"already_had_kn_link={already}")
    print(f"no_footer={no_footer}")


if __name__ == "__main__":
    main()
