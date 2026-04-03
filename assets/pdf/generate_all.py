"""
投資Library 全金融史記事PDF一括生成スクリプト
書庫テーマ（パーチメント＋ゴールド）で書籍品質のPDFを生成
"""
import os
import re
import sys
from html.parser import HTMLParser
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# === Colors (書庫テーマ) ===
INK = HexColor("#1a1208")
INK2 = HexColor("#2d2010")
INK3 = HexColor("#4a3520")
PARCH = HexColor("#f5ede0")
PARCH2 = HexColor("#efe4d0")
PARCH3 = HexColor("#e8d8be")
GOLD = HexColor("#8b6914")
GOLD2 = HexColor("#b8900a")
GOLD3 = HexColor("#d4aa22")
GREEN2 = HexColor("#2d8659")

# === Font Registration ===
FONT_DIR = "C:/Windows/Fonts"
pdfmetrics.registerFont(TTFont("NotoSerifJP", os.path.join(FONT_DIR, "NotoSerifJP-VF.ttf")))

# === Page dimensions ===
PAGE_W, PAGE_H = A4
MARGIN_L = 2.8 * cm
MARGIN_R = 2.8 * cm
MARGIN_T = 3.0 * cm
MARGIN_B = 2.5 * cm
CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R

# === Paths ===
BASE = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", ".."))
FH_DIR = os.path.join(BASE, "horizons", "financial-history")
PDF_DIR = os.path.join(BASE, "assets", "pdf", "history")

# === Styles ===
ST = {}

def init_styles():
    ST["shelf_label"] = ParagraphStyle(
        "shelf_label", fontName="Courier", fontSize=7,
        textColor=GOLD3, alignment=TA_CENTER, spaceAfter=4,
    )
    ST["era"] = ParagraphStyle(
        "era", fontName="Courier", fontSize=9,
        textColor=GOLD2, alignment=TA_CENTER, spaceAfter=6,
    )
    ST["ornament"] = ParagraphStyle(
        "ornament", fontName="Times-Italic", fontSize=11,
        textColor=INK3, alignment=TA_CENTER, spaceAfter=14, leading=16,
    )
    ST["title"] = ParagraphStyle(
        "title", fontName="NotoSerifJP", fontSize=22,
        textColor=INK, alignment=TA_CENTER, leading=34, spaceAfter=6,
    )
    ST["subtitle"] = ParagraphStyle(
        "subtitle", fontName="NotoSerifJP", fontSize=13,
        textColor=INK2, alignment=TA_CENTER, leading=20, spaceAfter=20,
    )
    ST["lead"] = ParagraphStyle(
        "lead", fontName="NotoSerifJP", fontSize=9.5,
        textColor=INK3, alignment=TA_CENTER, leading=18, spaceAfter=8,
    )
    ST["section_label"] = ParagraphStyle(
        "section_label", fontName="Courier", fontSize=6.5,
        textColor=GOLD, spaceBefore=0, spaceAfter=6,
    )
    ST["section_title"] = ParagraphStyle(
        "section_title", fontName="NotoSerifJP", fontSize=14,
        textColor=INK, leading=22, spaceAfter=12,
    )
    ST["body"] = ParagraphStyle(
        "body", fontName="NotoSerifJP", fontSize=9.5,
        textColor=INK2, leading=19, spaceAfter=10, alignment=TA_JUSTIFY,
    )
    ST["bullet"] = ParagraphStyle(
        "bullet", fontName="NotoSerifJP", fontSize=9,
        textColor=INK3, leading=18, spaceAfter=5,
        leftIndent=16, firstLineIndent=-12, alignment=TA_LEFT,
    )
    ST["callout"] = ParagraphStyle(
        "callout", fontName="NotoSerifJP", fontSize=9.5,
        textColor=INK, leading=19, alignment=TA_JUSTIFY,
    )
    ST["callout_label"] = ParagraphStyle(
        "callout_label", fontName="Courier", fontSize=6,
        textColor=INK3, spaceAfter=4,
    )
    ST["term_name"] = ParagraphStyle(
        "term_name", fontName="NotoSerifJP", fontSize=9.5,
        textColor=INK, leading=18, spaceAfter=2,
    )
    ST["term_desc"] = ParagraphStyle(
        "term_desc", fontName="NotoSerifJP", fontSize=9,
        textColor=INK3, leading=17, spaceAfter=10, leftIndent=8,
    )


# === HTML Article Parser ===
class ArticleParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sections = []
        self.hero_title = ""
        self.hero_era = ""
        self.hero_ornament = ""
        self.hero_lead = ""
        self.hero_shelf = ""
        self._capture = None
        self._depth = 0
        self._buf = ""
        self._in_class = ""

    def handle_starttag(self, tag, attrs):
        cls = dict(attrs).get("class", "")
        if cls == "hero-shelf":
            self._capture = "hero_shelf"; self._buf = ""; return
        if cls == "hero-title" and tag == "h1":
            self._capture = "hero_title"; self._buf = ""; return
        if cls == "hero-era":
            self._capture = "hero_era"; self._buf = ""; return
        if cls == "hero-ornament":
            self._capture = "hero_ornament"; self._buf = ""; return
        if cls == "hero-lead":
            self._capture = "hero_lead"; self._buf = ""; return
        if cls == "section-label":
            self._capture = "section_label"; self._buf = ""; return
        if cls == "section-title":
            self._capture = "section_title"; self._buf = ""; return
        if cls == "section-body":
            self._capture = "section_body"; self._buf = ""; self._depth = 1; self._in_class = "section-body"; return
        if self._in_class == "section-body":
            self._depth += 1
            attr_str = "".join(f' {k}="{v}"' if v else f' {k}' for k, v in attrs)
            self._buf += f"<{tag}{attr_str}>"

    def handle_endtag(self, tag):
        if self._in_class == "section-body":
            self._depth -= 1
            if self._depth <= 0:
                self._in_class = ""
                if self.sections:
                    self.sections[-1]["body_html"] = self._buf.strip()
                self._capture = None; self._buf = ""
                return
            self._buf += f"</{tag}>"; return

        if self._capture == "hero_shelf":
            self.hero_shelf = self._buf.strip(); self._capture = None
        elif self._capture == "hero_title" and tag == "h1":
            self.hero_title = self._buf.strip(); self._capture = None
        elif self._capture == "hero_era":
            self.hero_era = self._buf.strip(); self._capture = None
        elif self._capture == "hero_ornament":
            self.hero_ornament = self._buf.strip(); self._capture = None
        elif self._capture == "hero_lead" and tag == "p":
            self.hero_lead = self._buf.strip(); self._capture = None
        elif self._capture == "section_label":
            self.sections.append({"label": self._buf.strip(), "title": "", "body_html": ""})
            self._capture = None
        elif self._capture == "section_title":
            if self.sections:
                self.sections[-1]["title"] = self._buf.strip()
            self._capture = None

    def handle_data(self, data):
        if self._capture or self._in_class == "section-body":
            self._buf += data

    def handle_entityref(self, name):
        entity_map = {"mdash": "\u2014", "ndash": "\u2013", "middot": "\u00B7",
                       "rarr": "\u2192", "amp": "&", "lt": "<", "gt": ">",
                       "nbsp": "\u00A0", "hellip": "\u2026", "lsquo": "\u2018",
                       "rsquo": "\u2019", "ldquo": "\u201C", "rdquo": "\u201D",
                       "emsp": "\u2003", "ensp": "\u2002", "times": "\u00D7",
                       "plusmn": "\u00B1", "yen": "\u00A5"}
        char = entity_map.get(name, f"&{name};")
        if self._capture or self._in_class == "section-body":
            self._buf += char

    def handle_charref(self, name):
        if self._capture or self._in_class == "section-body":
            try:
                if name.startswith("x"):
                    self._buf += chr(int(name[1:], 16))
                else:
                    self._buf += chr(int(name))
            except (ValueError, OverflowError):
                self._buf += f"&#{name};"


# === HTML body to PDF flowables converter ===
class BodyToFlowables:
    """Convert section body HTML to a list of reportlab flowables."""

    def __init__(self):
        self.flowables = []

    def convert(self, body_html, is_key_terms=False):
        self.flowables = []
        # Clean up
        body = body_html.strip()

        if is_key_terms:
            self._convert_key_terms(body)
        else:
            self._convert_body(body)

        return self.flowables

    def _convert_body(self, body):
        # Split by top-level elements
        # Handle callout boxes specially
        parts = re.split(r'(<div class="callout"[^>]*>.*?</div>\s*</div>)', body, flags=re.DOTALL)

        for part in parts:
            part = part.strip()
            if not part:
                continue

            if part.startswith('<div class="callout"'):
                self._handle_callout(part)
                continue

            # Split into paragraphs and lists
            elements = re.split(r'(<ul>.*?</ul>)', part, flags=re.DOTALL)
            for el in elements:
                el = el.strip()
                if not el:
                    continue
                if el.startswith("<ul>"):
                    self._handle_list(el)
                else:
                    self._handle_paragraphs(el)

    def _handle_paragraphs(self, html):
        # Extract <p> tags
        paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL)
        if not paragraphs:
            # Fallback: treat whole thing as text
            text = self._clean_html(html)
            if text.strip():
                self.flowables.append(Paragraph(text, ST["body"]))
            return

        for p in paragraphs:
            text = self._clean_inline(p.strip())
            if text:
                self.flowables.append(Paragraph(text, ST["body"]))

    def _handle_list(self, html):
        items = re.findall(r'<li>(.*?)</li>', html, re.DOTALL)
        for item in items:
            text = self._clean_inline(item.strip())
            if text:
                self.flowables.append(Paragraph(f"\u2014 {text}", ST["bullet"]))

    def _handle_callout(self, html):
        # Extract label if present
        label_match = re.search(r'class="callout-label">(.*?)</(?:div|p)>', html, re.DOTALL)
        label = self._clean_html(label_match.group(1)) if label_match else None

        # Extract text
        text_match = re.search(r'class="callout-text">(.*?)</p>', html, re.DOTALL)
        if not text_match:
            # Try to get any paragraph inside callout
            text_match = re.search(r'<p[^>]*>(.*?)</p>', html, re.DOTALL)
        text = self._clean_inline(text_match.group(1)) if text_match else ""

        if text:
            # Determine border color
            border_color = GOLD2
            if 'green' in html.lower() or '格言' in (label or ''):
                border_color = GREEN2

            self.flowables.append(Spacer(1, 8))
            self.flowables.append(self._callout_box(text, border_color, label))
            self.flowables.append(Spacer(1, 10))

    def _callout_box(self, text, border_color=GOLD2, label=None):
        elements = []
        if label:
            elements.append(Paragraph(label, ST["callout_label"]))
        elements.append(Paragraph(text, ST["callout"]))

        inner_table = Table(
            [[elements]],
            colWidths=[CONTENT_W - 30],
        )
        inner_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), PARCH2),
            ("LEFTPADDING", (0, 0), (-1, -1), 16),
            ("RIGHTPADDING", (0, 0), (-1, -1), 16),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ("LINEBEFORESTROKECOLOR", (0, 0), (0, -1), border_color),
            ("LINEBEFORESTROKEWIDTH", (0, 0), (0, -1), 3),
        ]))
        return inner_table

    def _convert_key_terms(self, body):
        # Key terms: pairs of <p><strong>Term</strong> — Description</p>
        paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', body, re.DOTALL)
        for p in paragraphs:
            p = p.strip()
            # Check if it starts with <strong>
            strong_match = re.match(r'<strong>(.*?)</strong>\s*[\u2014\-\u2013]\s*(.*)', p, re.DOTALL)
            if strong_match:
                term = self._clean_inline(strong_match.group(1))
                desc = self._clean_inline(strong_match.group(2))
                self.flowables.append(Paragraph(f"<b>{term}</b>", ST["term_name"]))
                self.flowables.append(Paragraph(desc, ST["term_desc"]))
            else:
                text = self._clean_inline(p)
                if text:
                    self.flowables.append(Paragraph(text, ST["body"]))

    def _clean_inline(self, html):
        """Keep <b>, <strong>, <i>, <em> tags, strip everything else."""
        text = html
        # Convert <strong> to <b> for reportlab
        text = re.sub(r'<strong>(.*?)</strong>', r'<b>\1</b>', text, flags=re.DOTALL)
        text = re.sub(r'<em>(.*?)</em>', r'<i>\1</i>', text, flags=re.DOTALL)
        # Remove <a> tags but keep text
        text = re.sub(r'<a[^>]*>(.*?)</a>', r'\1', text, flags=re.DOTALL)
        # Remove all other tags except b, i
        text = re.sub(r'<(?!/?(?:b|i)(?:\s|>|/))[^>]+>', '', text)
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Escape special XML chars in content (but not in tags)
        # Replace & that's not part of entity
        text = re.sub(r'&(?!amp;|lt;|gt;|quot;|apos;|#)', '&amp;', text)
        return text

    def _clean_html(self, html):
        """Strip all HTML tags."""
        text = re.sub(r'<[^>]+>', '', html)
        text = re.sub(r'\s+', ' ', text).strip()
        return text


# === Header / Footer ===
def make_header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("NotoSerifJP", 7)
    canvas.setFillColor(INK3)
    canvas.drawCentredString(PAGE_W / 2, PAGE_H - 1.8 * cm, "投資と思考の書斎 \u2014 金融史の書庫")
    canvas.setStrokeColor(GOLD2)
    canvas.setLineWidth(0.4)
    canvas.line(MARGIN_L, PAGE_H - 2.1 * cm, PAGE_W - MARGIN_R, PAGE_H - 2.1 * cm)
    canvas.setFont("NotoSerifJP", 6)
    canvas.setFillColor(INK3)
    canvas.drawCentredString(PAGE_W / 2, 1.4 * cm, str(doc.page))
    canvas.setFont("NotoSerifJP", 5.5)
    canvas.drawCentredString(PAGE_W / 2, 1.0 * cm, "投資Library | https://anni-memo.github.io/investment-library/")
    canvas.restoreState()


def make_title_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("NotoSerifJP", 5.5)
    canvas.setFillColor(INK3)
    canvas.drawCentredString(PAGE_W / 2, 1.0 * cm,
        "投資は自己責任です。このサイトの内容は情報提供を目的とし、投資助言ではありません。")
    canvas.restoreState()


def gold_rule():
    return HRFlowable(width="100%", thickness=0.5, color=GOLD2, spaceBefore=18, spaceAfter=18)


# === Build PDF for one article ===
def build_pdf(slug, parsed):
    output_path = os.path.join(PDF_DIR, f"{slug}.pdf")

    # Clean title
    title_raw = parsed.hero_title.replace("<br/>", "\n").replace("<br>", "\n")
    title_raw = re.sub(r'<[^>]+>', '', title_raw).strip()
    title_lines = [l.strip() for l in title_raw.split("\n") if l.strip()]
    main_title = title_lines[0] if title_lines else slug
    sub_title = title_lines[1] if len(title_lines) > 1 else ""

    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=MARGIN_L, rightMargin=MARGIN_R,
        topMargin=MARGIN_T, bottomMargin=MARGIN_B,
        title=f"{main_title} {sub_title}".strip(),
        author="投資と思考の書斎",
        subject="金融史",
        creator="投資Library",
    )

    story = []
    converter = BodyToFlowables()

    # === TITLE PAGE ===
    story.append(Spacer(1, 40))

    shelf = parsed.hero_shelf or "SHELF 05 \u00B7 FINANCIAL HISTORY"
    story.append(Paragraph(shelf.replace("·", "\u00B7"), ST["shelf_label"]))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="30%", thickness=0.5, color=GOLD2, spaceBefore=0, spaceAfter=14))

    era = parsed.hero_era or ""
    if era:
        story.append(Paragraph(era, ST["era"]))
        story.append(Spacer(1, 6))

    ornament = parsed.hero_ornament or ""
    if ornament:
        # Escape XML special chars
        ornament_clean = ornament.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        # But keep common entities working - revert double-escaped
        ornament_clean = ornament_clean.replace("&amp;mdash;", "\u2014").replace("&amp;ndash;", "\u2013")
        story.append(Paragraph(ornament_clean, ST["ornament"]))
        story.append(Spacer(1, 10))

    story.append(Paragraph(main_title, ST["title"]))
    if sub_title:
        story.append(Paragraph(sub_title, ST["subtitle"]))

    story.append(HRFlowable(width="20%", thickness=0.3, color=GOLD3, spaceBefore=8, spaceAfter=16))

    lead = parsed.hero_lead or ""
    if lead:
        story.append(Paragraph(lead, ST["lead"]))

    story.append(Spacer(1, 50))
    story.append(HRFlowable(width="40%", thickness=0.3, color=PARCH3, spaceBefore=0, spaceAfter=10))
    story.append(Paragraph("投資と思考の書斎", ParagraphStyle(
        "pub", fontName="NotoSerifJP", fontSize=8, textColor=GOLD, alignment=TA_CENTER, leading=14,
    )))
    story.append(Paragraph("https://anni-memo.github.io/investment-library/", ParagraphStyle(
        "url", fontName="Courier", fontSize=6.5, textColor=INK3, alignment=TA_CENTER, leading=12,
    )))
    story.append(PageBreak())

    # === SECTIONS ===
    for i, sec in enumerate(parsed.sections):
        if i > 0:
            story.append(gold_rule())

        story.append(Paragraph(sec["label"], ST["section_label"]))
        story.append(Paragraph(sec["title"], ST["section_title"]))

        is_key_terms = sec["label"].upper() in ("KEY TERMS", "KEY TERM", "GLOSSARY")
        flowables = converter.convert(sec["body_html"], is_key_terms=is_key_terms)
        story.extend(flowables)

    # === END PAGE ===
    story.append(Spacer(1, 40))
    story.append(HRFlowable(width="30%", thickness=0.3, color=PARCH3, spaceBefore=0, spaceAfter=16))
    story.append(Paragraph("投資と思考の書斎", ParagraphStyle(
        "endpub", fontName="NotoSerifJP", fontSize=9, textColor=GOLD, alignment=TA_CENTER, leading=16, spaceAfter=6,
    )))
    story.append(Paragraph("https://anni-memo.github.io/investment-library/", ParagraphStyle(
        "endurl", fontName="Courier", fontSize=7, textColor=INK3, alignment=TA_CENTER, leading=12, spaceAfter=14,
    )))
    story.append(Paragraph(
        "投資は自己責任です。このサイトの内容は情報提供を目的とし、投資助言ではありません。",
        ParagraphStyle("disclaimer", fontName="NotoSerifJP", fontSize=7, textColor=INK3, alignment=TA_CENTER),
    ))

    try:
        doc.build(story, onFirstPage=make_title_footer, onLaterPages=make_header_footer)
        size_kb = os.path.getsize(output_path) / 1024
        return True, size_kb
    except Exception as e:
        return False, str(e)


# === Main ===
def main():
    sys.stdout.reconfigure(encoding='utf-8')
    init_styles()
    os.makedirs(PDF_DIR, exist_ok=True)

    # Skip tulip-bubble (already generated)
    skip = {"tulip-bubble"}
    success = 0
    failed = 0
    total_size = 0

    slugs = sorted(os.listdir(FH_DIR))
    for slug in slugs:
        article_dir = os.path.join(FH_DIR, slug)
        index_html = os.path.join(article_dir, "index.html")

        if not os.path.isdir(article_dir) or not os.path.exists(index_html):
            continue
        if slug in skip:
            continue

        print(f"[{success+failed+1}/{len(slugs)}] {slug}...", end=" ", flush=True)

        with open(index_html, "r", encoding="utf-8") as f:
            html = f.read()

        parser = ArticleParser()
        parser.feed(html)

        if not parser.sections:
            print("SKIP (no sections)")
            continue

        ok, result = build_pdf(slug, parser)
        if ok:
            success += 1
            total_size += result
            print(f"OK ({result:.0f}KB)")
        else:
            failed += 1
            print(f"FAIL: {result}")

    print(f"\n{'='*50}")
    print(f"Success: {success}")
    print(f"Failed: {failed}")
    print(f"Total PDF size: {total_size/1024:.1f}MB")


if __name__ == "__main__":
    main()
