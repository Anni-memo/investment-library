"""
全金融史記事のインラインCSSにリーダー＆PDFボタンのスタイルを注入する
"""
import os
import re
import sys

BASE = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
FH_DIR = os.path.join(BASE, "horizons", "financial-history")

BUTTON_CSS = """
.hero-actions{margin-top:22px;position:relative;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;}
.hero-reader-btn,.hero-pdf-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 22px;font-family:var(--serif);font-size:.78rem;font-weight:600;color:var(--parch);background:transparent;border:1px solid rgba(184,144,10,.45);text-decoration:none;letter-spacing:.04em;transition:all .25s;border-radius:2px;}
.hero-reader-btn{background:rgba(184,144,10,.12);border-color:rgba(184,144,10,.6);}
.hero-reader-btn:hover{background:rgba(184,144,10,.25);border-color:var(--gold3);color:var(--gold4);}
.hero-pdf-btn:hover{background:rgba(184,144,10,.15);border-color:var(--gold3);color:var(--gold4);}
.hero-reader-btn svg,.hero-pdf-btn svg{opacity:.7;transition:opacity .2s;}
.hero-reader-btn:hover svg,.hero-pdf-btn:hover svg{opacity:1;}
"""

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    updated = 0
    skipped = 0

    for slug in sorted(os.listdir(FH_DIR)):
        article_dir = os.path.join(FH_DIR, slug)
        index_html = os.path.join(article_dir, "index.html")

        if not os.path.isdir(article_dir) or not os.path.exists(index_html):
            continue

        with open(index_html, "r", encoding="utf-8") as f:
            html = f.read()

        # Skip if no buttons exist
        if "hero-actions" not in html:
            continue

        # Skip if button CSS already injected
        if ".hero-reader-btn" in html and ".hero-pdf-btn" in html:
            skipped += 1
            continue

        # Find the </style> tag and inject CSS before it
        if "</style>" in html:
            html = html.replace("</style>", BUTTON_CSS + "</style>", 1)
            with open(index_html, "w", encoding="utf-8") as f:
                f.write(html)
            updated += 1
            print(f"  [done] {slug}")
        else:
            print(f"  [warn] No </style> tag in {slug}")

    print(f"\nUpdated: {updated}")
    print(f"Skipped (already has CSS): {skipped}")

if __name__ == "__main__":
    main()
