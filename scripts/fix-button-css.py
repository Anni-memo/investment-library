"""
ボタンCSSを修正：色を直接指定（CSS変数に依存しない）+ visited/link色も指定
"""
import os
import sys

BASE = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
FH_DIR = os.path.join(BASE, "horizons", "financial-history")

OLD_CSS = """
.hero-actions{margin-top:22px;position:relative;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;}
.hero-reader-btn,.hero-pdf-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 22px;font-family:var(--serif);font-size:.78rem;font-weight:600;color:var(--parch);background:transparent;border:1px solid rgba(184,144,10,.45);text-decoration:none;letter-spacing:.04em;transition:all .25s;border-radius:2px;}
.hero-reader-btn{background:rgba(184,144,10,.12);border-color:rgba(184,144,10,.6);}
.hero-reader-btn:hover{background:rgba(184,144,10,.25);border-color:var(--gold3);color:var(--gold4);}
.hero-pdf-btn:hover{background:rgba(184,144,10,.15);border-color:var(--gold3);color:var(--gold4);}
.hero-reader-btn svg,.hero-pdf-btn svg{opacity:.7;transition:opacity .2s;}
.hero-reader-btn:hover svg,.hero-pdf-btn:hover svg{opacity:1;}
"""

NEW_CSS = """
.hero-actions{margin-top:22px;position:relative;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;}
.hero-reader-btn,.hero-pdf-btn{display:inline-flex;align-items:center;gap:7px;padding:9px 22px;font-family:var(--serif,'Cormorant Garamond',serif);font-size:.78rem;font-weight:600;color:#f5ede0;background:transparent;border:1px solid rgba(184,144,10,.45);text-decoration:none;letter-spacing:.04em;transition:all .25s;border-radius:2px;}
.hero-reader-btn:link,.hero-reader-btn:visited,.hero-pdf-btn:link,.hero-pdf-btn:visited{color:#f5ede0;text-decoration:none;}
.hero-reader-btn{background:rgba(184,144,10,.12);border-color:rgba(184,144,10,.6);}
.hero-reader-btn:hover{background:rgba(184,144,10,.25);border-color:#d4aa22;color:#f0cc55;}
.hero-pdf-btn:hover{background:rgba(184,144,10,.15);border-color:#d4aa22;color:#f0cc55;}
.hero-reader-btn svg,.hero-pdf-btn svg{opacity:.7;transition:opacity .2s;}
.hero-reader-btn:hover svg,.hero-pdf-btn:hover svg{opacity:1;}
"""

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    updated = 0

    for slug in sorted(os.listdir(FH_DIR)):
        index_html = os.path.join(FH_DIR, slug, "index.html")
        if not os.path.exists(index_html):
            continue

        with open(index_html, "r", encoding="utf-8") as f:
            html = f.read()

        if OLD_CSS in html:
            html = html.replace(OLD_CSS, NEW_CSS)
            with open(index_html, "w", encoding="utf-8") as f:
                f.write(html)
            updated += 1

    print(f"Fixed: {updated} files")

if __name__ == "__main__":
    main()
