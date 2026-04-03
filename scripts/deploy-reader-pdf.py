"""
全金融史記事に対して:
1. リーダー用チャプターHTMLを生成
2. books.json にエントリ追加
3. 記事ページにリーダー＆PDFボタン挿入
"""
import os
import re
import json
from html.parser import HTMLParser

BASE = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
FH_DIR = os.path.join(BASE, "horizons", "financial-history")
BOOKS_DIR = os.path.join(BASE, "data", "books")
BOOKS_JSON = os.path.join(BOOKS_DIR, "books.json")

# Skip tulip-bubble (already done) and the index page
SKIP = {"tulip-bubble"}


# ── HTML Parser to extract article sections ──
class ArticleParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sections = []  # list of {label, title, body_html}
        self.hero_title = ""
        self.hero_era = ""
        self.hero_ornament = ""
        self.hero_lead = ""

        self._capture = None  # current capture target
        self._depth = 0
        self._buf = ""
        self._in_class = ""

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        cls = attrs_dict.get("class", "")

        # Hero elements
        if cls == "hero-title" and tag == "h1":
            self._capture = "hero_title"
            self._buf = ""
            return
        if cls == "hero-era":
            self._capture = "hero_era"
            self._buf = ""
            return
        if cls == "hero-ornament":
            self._capture = "hero_ornament"
            self._buf = ""
            return
        if cls == "hero-lead":
            self._capture = "hero_lead"
            self._buf = ""
            return

        # Section elements
        if cls == "section-label":
            self._capture = "section_label"
            self._buf = ""
            return
        if cls == "section-title":
            self._capture = "section_title"
            self._buf = ""
            return
        if cls == "section-body":
            self._capture = "section_body"
            self._buf = ""
            self._depth = 1
            self._in_class = "section-body"
            return

        if self._in_class == "section-body":
            self._depth += 1
            # Rebuild HTML tag
            attr_str = ""
            for k, v in attrs:
                if v is not None:
                    attr_str += f' {k}="{v}"'
                else:
                    attr_str += f' {k}'
            self._buf += f"<{tag}{attr_str}>"

    def handle_endtag(self, tag):
        if self._in_class == "section-body":
            self._depth -= 1
            if self._depth <= 0:
                # End of section-body
                self._in_class = ""
                if self.sections:
                    self.sections[-1]["body_html"] = self._buf.strip()
                self._capture = None
                self._buf = ""
                return
            self._buf += f"</{tag}>"
            return

        if self._capture == "hero_title" and tag == "h1":
            self.hero_title = self._buf.strip()
            self._capture = None
        elif self._capture == "hero_era" and tag == "div":
            self.hero_era = self._buf.strip()
            self._capture = None
        elif self._capture == "hero_ornament" and tag == "div":
            self.hero_ornament = self._buf.strip()
            self._capture = None
        elif self._capture == "hero_lead" and tag == "p":
            self.hero_lead = self._buf.strip()
            self._capture = None
        elif self._capture == "section_label" and tag == "div":
            label = self._buf.strip()
            self.sections.append({"label": label, "title": "", "body_html": ""})
            self._capture = None
        elif self._capture == "section_title":
            if self.sections:
                self.sections[-1]["title"] = self._buf.strip()
            self._capture = None

    def handle_data(self, data):
        if self._capture or self._in_class == "section-body":
            self._buf += data

    def handle_entityref(self, name):
        if self._capture or self._in_class == "section-body":
            self._buf += f"&{name};"

    def handle_charref(self, name):
        if self._capture or self._in_class == "section-body":
            self._buf += f"&#{name};"


def extract_article(html_path):
    """Parse article HTML and return structured data."""
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
    parser = ArticleParser()
    parser.feed(html)
    return parser


def html_to_reader_text(body_html):
    """Convert section body HTML to reader-friendly HTML (simplified)."""
    # Keep <p>, <strong>, <ul>, <li> tags, strip others
    text = body_html
    # Remove callout wrapper divs but keep content
    text = re.sub(r'<div class="callout"[^>]*>', '', text)
    text = re.sub(r'<div class="callout-label">', '<p><strong>', text)
    text = re.sub(r'</div>\s*<p class="callout-text">', '</strong></p><p>', text)
    text = re.sub(r'<p class="callout-text">', '<p>', text)
    # Clean remaining divs
    text = re.sub(r'</?div[^>]*>', '', text)
    # Remove inline styles
    text = re.sub(r' style="[^"]*"', '', text)
    return text.strip()


def create_chapter_html(chapter_num, title, body_html):
    """Create reader chapter HTML file content."""
    num_kanji = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十",
                 "十一", "十二", "十三", "十四", "十五"]
    num_str = num_kanji[chapter_num] if chapter_num < len(num_kanji) else str(chapter_num)

    reader_body = html_to_reader_text(body_html)

    return f"""<div class="chapter-header">
  <span class="chapter-num">第{num_str}章</span>
  <h1 class="chapter-title">{title}</h1>
</div>

{reader_body}"""


def add_buttons_to_article(html_path, slug):
    """Add reader & PDF buttons to article hero section."""
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Skip if buttons already added
    if "hero-actions" in html:
        print(f"  [skip] Buttons already exist in {slug}")
        return

    # Find the closing </div> after hero-lead
    # Pattern: hero-lead paragraph followed by </div> (closing hero div)
    button_html = f"""
  <div class="hero-actions">
    <a class="hero-reader-btn" href="../../../reader/?book={slug}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
      リーダーで読む
    </a>
    <a class="hero-pdf-btn" href="../../../assets/pdf/history/{slug}.pdf" download>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      PDF
    </a>
  </div>"""

    # Insert before the closing </div> of .hero
    # Find hero-lead closing tag, then insert before next </div>
    pattern = r'(class="hero-lead"[^>]*>.*?</p>)\s*(</div>)'
    match = re.search(pattern, html, re.DOTALL)
    if match:
        insert_pos = match.end(1)
        html = html[:insert_pos] + button_html + "\n" + html[insert_pos:]
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  [done] Buttons added to {slug}")
    else:
        print(f"  [warn] Could not find insertion point in {slug}")


def main():
    # Load existing books.json
    with open(BOOKS_JSON, "r", encoding="utf-8") as f:
        books = json.load(f)

    existing_slugs = {b["slug"] for b in books}

    # Find all article directories
    articles_processed = 0
    articles_skipped = 0

    for slug in sorted(os.listdir(FH_DIR)):
        article_dir = os.path.join(FH_DIR, slug)
        index_html = os.path.join(article_dir, "index.html")

        if not os.path.isdir(article_dir) or not os.path.exists(index_html):
            continue
        if slug in SKIP:
            articles_skipped += 1
            continue

        print(f"\nProcessing: {slug}")

        # 1. Parse article
        parsed = extract_article(index_html)

        if not parsed.sections:
            print(f"  [warn] No sections found, skipping")
            continue

        # 2. Create reader chapter files
        chapters_meta = []
        for i, sec in enumerate(parsed.sections, 1):
            ch_filename = f"{slug}-ch{i}.html"
            ch_path = os.path.join(BOOKS_DIR, ch_filename)
            ch_html = create_chapter_html(i, sec["title"], sec["body_html"])

            with open(ch_path, "w", encoding="utf-8") as f:
                f.write(ch_html)

            chapters_meta.append({
                "id": f"ch{i}",
                "title": sec["title"],
                "file": ch_filename
            })

        print(f"  [done] {len(chapters_meta)} chapters created")

        # 3. Add to books.json if not exists
        if slug not in existing_slugs:
            title = parsed.hero_title.replace("<br/>", " ").replace("<br>", " ")
            # Clean any remaining HTML tags from title
            title = re.sub(r'<[^>]+>', '', title).strip()

            book_entry = {
                "slug": slug,
                "title": title,
                "author": "投資と思考の書斎",
                "shelf": "金融史",
                "chapters": chapters_meta
            }
            books.append(book_entry)
            existing_slugs.add(slug)
            print(f"  [done] Added to books.json: {title}")
        else:
            # Update chapters if already exists
            for b in books:
                if b["slug"] == slug:
                    b["chapters"] = chapters_meta
                    break
            print(f"  [done] Updated chapters in books.json")

        # 4. Add buttons to article page
        add_buttons_to_article(index_html, slug)

        articles_processed += 1

    # Save books.json
    with open(BOOKS_JSON, "w", encoding="utf-8") as f:
        json.dump(books, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*50}")
    print(f"Processed: {articles_processed} articles")
    print(f"Skipped: {articles_skipped} (already done)")
    print(f"Total books in books.json: {len(books)}")
    print(f"books.json saved")


if __name__ == "__main__":
    main()
