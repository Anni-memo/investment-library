"""
投資Library PDF生成スクリプト — チューリップ・バブル
書庫テーマ（パーチメント＋ゴールド）で書籍品質のPDFを生成
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, HRFlowable, KeepTogether
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
WHITE = HexColor("#ffffff")

# === Font Registration ===
FONT_DIR = "C:/Windows/Fonts"

# Noto Serif JP (Variable Font — register as single weight)
pdfmetrics.registerFont(TTFont("NotoSerifJP", os.path.join(FONT_DIR, "NotoSerifJP-VF.ttf")))

# === Page dimensions ===
PAGE_W, PAGE_H = A4
MARGIN_L = 2.8 * cm
MARGIN_R = 2.8 * cm
MARGIN_T = 3.0 * cm
MARGIN_B = 2.5 * cm

# === Styles ===
def make_styles():
    s = {}

    s["shelf_label"] = ParagraphStyle(
        "shelf_label", fontName="Courier", fontSize=7,
        textColor=GOLD3, alignment=TA_CENTER,
        spaceAfter=4, letterSpacing=3,
    )
    s["era"] = ParagraphStyle(
        "era", fontName="Courier", fontSize=9,
        textColor=GOLD2, alignment=TA_CENTER,
        spaceAfter=6, letterSpacing=2,
    )
    s["ornament"] = ParagraphStyle(
        "ornament", fontName="Times-Italic", fontSize=11,
        textColor=INK3, alignment=TA_CENTER,
        spaceAfter=14, leading=16,
    )
    s["title"] = ParagraphStyle(
        "title", fontName="NotoSerifJP", fontSize=22,
        textColor=INK, alignment=TA_CENTER,
        leading=34, spaceAfter=6,
    )
    s["subtitle"] = ParagraphStyle(
        "subtitle", fontName="NotoSerifJP", fontSize=13,
        textColor=INK2, alignment=TA_CENTER,
        leading=20, spaceAfter=20,
    )
    s["lead"] = ParagraphStyle(
        "lead", fontName="NotoSerifJP", fontSize=9.5,
        textColor=INK3, alignment=TA_CENTER,
        leading=18, spaceAfter=8,
    )
    s["section_label"] = ParagraphStyle(
        "section_label", fontName="Courier", fontSize=6.5,
        textColor=GOLD, letterSpacing=2,
        spaceBefore=0, spaceAfter=6,
    )
    s["section_title"] = ParagraphStyle(
        "section_title", fontName="NotoSerifJP", fontSize=14,
        textColor=INK, leading=22, spaceAfter=12,
    )
    s["body"] = ParagraphStyle(
        "body", fontName="NotoSerifJP", fontSize=9.5,
        textColor=INK2, leading=19, spaceAfter=10,
        alignment=TA_JUSTIFY,
    )
    s["bullet"] = ParagraphStyle(
        "bullet", fontName="NotoSerifJP", fontSize=9,
        textColor=INK3, leading=18, spaceAfter=5,
        leftIndent=16, firstLineIndent=-12,
        alignment=TA_LEFT,
    )
    s["callout"] = ParagraphStyle(
        "callout", fontName="NotoSerifJP", fontSize=9.5,
        textColor=INK, leading=19,
        alignment=TA_JUSTIFY,
    )
    s["callout_label"] = ParagraphStyle(
        "callout_label", fontName="Courier", fontSize=6,
        textColor=INK3, letterSpacing=1.5,
        spaceAfter=4,
    )
    s["term_name"] = ParagraphStyle(
        "term_name", fontName="NotoSerifJP", fontSize=9.5,
        textColor=INK, leading=18, spaceAfter=2,
    )
    s["term_desc"] = ParagraphStyle(
        "term_desc", fontName="NotoSerifJP", fontSize=9,
        textColor=INK3, leading=17, spaceAfter=10,
        leftIndent=8,
    )
    s["footer_text"] = ParagraphStyle(
        "footer_text", fontName="NotoSerifJP", fontSize=6.5,
        textColor=INK3, alignment=TA_CENTER,
    )
    return s

ST = make_styles()


# === Helper flowables ===
def gold_rule(width=None):
    return HRFlowable(
        width="100%", thickness=0.5, color=GOLD2,
        spaceBefore=18, spaceAfter=18,
    )

def thin_rule():
    return HRFlowable(
        width="60%", thickness=0.3, color=PARCH3,
        spaceBefore=10, spaceAfter=10,
    )

def callout_box(text, border_color=GOLD2, label=None):
    """Create a callout box with colored left border."""
    elements = []
    if label:
        lbl = Paragraph(label, ST["callout_label"])
        elements.append(lbl)
    elements.append(Paragraph(text, ST["callout"]))

    inner_table = Table(
        [[elements]],
        colWidths=[PAGE_W - MARGIN_L - MARGIN_R - 30],
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


def section(label, title, body_elements):
    """Create a section with label + title + body."""
    items = [
        Paragraph(label, ST["section_label"]),
        Paragraph(title, ST["section_title"]),
    ]
    items.extend(body_elements)
    return items


# === Header / Footer ===
def header_footer(canvas, doc):
    canvas.saveState()

    # Header
    canvas.setFont("NotoSerifJP", 7)
    canvas.setFillColor(INK3)
    header_text = "投資と思考の書斎 — 金融史の書庫"
    canvas.drawCentredString(PAGE_W / 2, PAGE_H - 1.8 * cm, header_text)

    # Header gold line
    canvas.setStrokeColor(GOLD2)
    canvas.setLineWidth(0.4)
    canvas.line(MARGIN_L, PAGE_H - 2.1 * cm, PAGE_W - MARGIN_R, PAGE_H - 2.1 * cm)

    # Footer
    canvas.setFont("NotoSerifJP", 6)
    canvas.setFillColor(INK3)

    # Page number
    page_num = str(doc.page)
    canvas.drawCentredString(PAGE_W / 2, 1.4 * cm, page_num)

    # Footer text
    canvas.setFont("NotoSerifJP", 5.5)
    canvas.drawCentredString(
        PAGE_W / 2, 1.0 * cm,
        "投資Library | https://anni-memo.github.io/investment-library/"
    )

    canvas.restoreState()


def title_page_header_footer(canvas, doc):
    """Title page: no header, just footer disclaimer."""
    canvas.saveState()

    canvas.setFont("NotoSerifJP", 5.5)
    canvas.setFillColor(INK3)
    canvas.drawCentredString(
        PAGE_W / 2, 1.0 * cm,
        "投資は自己責任です。このサイトの内容は情報提供を目的とし、投資助言ではありません。"
    )
    canvas.restoreState()


# === Build document ===
def build_pdf():
    output_path = os.path.join(
        os.path.dirname(__file__), "history", "tulip-bubble.pdf"
    )

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=MARGIN_L,
        rightMargin=MARGIN_R,
        topMargin=MARGIN_T,
        bottomMargin=MARGIN_B,
        title="チューリップ・バブル — 人類最初の投機バブル",
        author="投資と思考の書斎",
        subject="金融史",
        creator="投資Library",
    )

    story = []

    # ============================================================
    # TITLE PAGE
    # ============================================================
    story.append(Spacer(1, 40))
    story.append(Paragraph("SHELF 05 &middot; FINANCIAL HISTORY", ST["shelf_label"]))
    story.append(Spacer(1, 12))

    # Decorative gold rule
    story.append(HRFlowable(width="30%", thickness=0.5, color=GOLD2, spaceBefore=0, spaceAfter=14))

    story.append(Paragraph("1637", ST["era"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Tulip Mania &mdash; The First Speculative Bubble in History",
        ST["ornament"]
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph("チューリップ・バブル", ST["title"]))
    story.append(Paragraph("人類最初の投機バブル", ST["subtitle"]))

    story.append(HRFlowable(width="20%", thickness=0.3, color=GOLD3, spaceBefore=8, spaceAfter=16))

    story.append(Paragraph(
        "球根1つが家1軒分。「今回は違う」という確信が崩壊する構造は、400年後の今も変わっていない。",
        ST["lead"]
    ))

    story.append(Spacer(1, 50))
    story.append(HRFlowable(width="40%", thickness=0.3, color=PARCH3, spaceBefore=0, spaceAfter=10))
    story.append(Paragraph("投資と思考の書斎", ParagraphStyle(
        "pub", fontName="NotoSerifJP", fontSize=8, textColor=GOLD,
        alignment=TA_CENTER, leading=14,
    )))
    story.append(Paragraph("https://anni-memo.github.io/investment-library/", ParagraphStyle(
        "url", fontName="Courier", fontSize=6.5, textColor=INK3,
        alignment=TA_CENTER, leading=12,
    )))

    story.append(PageBreak())

    # ============================================================
    # SECTION 1: WHAT HAPPENED
    # ============================================================
    story.extend(section("WHAT HAPPENED", "何が起きたか", [
        Paragraph(
            "1630年代のオランダ。チューリップは16世紀後半にオスマン帝国から伝わり、"
            "オランダの富裕層の間でステータスシンボルとなっていた。",
            ST["body"]
        ),
        Paragraph(
            "特に珍しい品種——炎のような模様が入る「ブレイク」した球根——に異常な高値がついた。"
            "1636年末から1637年初にかけて、球根の価格は数週間で数倍に跳ね上がった。",
            ST["body"]
        ),
        Paragraph(
            "最も有名な品種「センペル・アウグストゥス」の球根1つが、アムステルダムの運河沿いの"
            "家1軒分（約10,000ギルダー）に達したと伝えられる。熟練職人の年収が約300ギルダーの時代だ。",
            ST["body"]
        ),
        Paragraph(
            "1637年2月3日、ハールレムの定例オークションで、誰も買い手がつかなかった。"
            "それが引き金となり、価格は数日で90%以上暴落した。",
            ST["body"]
        ),
    ]))

    story.append(gold_rule())

    # ============================================================
    # SECTION 2: WHY IT HAPPENED
    # ============================================================
    story.extend(section("WHY IT HAPPENED", "なぜ起きたか", [
        Paragraph("バブルの発生には複数の条件が重なった。", ST["body"]),
        Paragraph(
            "— <b>供給の制約</b>——珍しい模様の球根は突然変異（実はウイルス感染）によるもので、"
            "意図的に増やせなかった",
            ST["bullet"]
        ),
        Paragraph(
            "— <b>先物契約の普及</b>——球根が土の中にある冬季に、翌春の受け渡しを約束する"
            "「先物契約」が広まった。実物を見ずに取引が回転した",
            ST["bullet"]
        ),
        Paragraph(
            "— <b>群集心理</b>——「隣人が球根で儲けた」という話が広がり、"
            "普段は投機に関わらない層まで参入した",
            ST["bullet"]
        ),
        Paragraph(
            "— <b>経済的背景</b>——オランダ黄金時代の好景気。余剰資金が投機先を求めていた",
            ST["bullet"]
        ),
        Spacer(1, 8),
        callout_box(
            "バブルの本質は「資産の価格がファンダメンタルズから乖離し、売却益の期待だけで"
            "価格が維持される状態」だ。買い手は球根を植えたいのではなく、より高く売りたいだけだった。"
        ),
        Spacer(1, 10),
        Paragraph(
            "注意すべき点がある。近年の経済史研究では、チューリップ・バブルの規模と影響は"
            "従来の通説ほど大きくなかったという見方が有力になっている。被害は主にプロの球根取引業者に"
            "限定され、オランダ経済全体への影響は限定的だったとする研究もある。",
            ST["body"]
        ),
    ]))

    story.append(gold_rule())

    # ============================================================
    # SECTION 3: WHAT CHANGED
    # ============================================================
    story.extend(section("WHAT CHANGED", "何が変わったか", [
        Paragraph(
            "投機と実体価値の乖離が、初めて大規模に可視化された。",
            ST["body"]
        ),
        Paragraph(
            "球根の「使用価値」（庭に植えて花を楽しむ）と「交換価値」（市場で売却して利益を得る）の間に、"
            "巨大な溝が開いた。この溝が突然閉じるとき、それがバブルの崩壊だ。",
            ST["body"]
        ),
        Paragraph(
            "チューリップ・バブルの崩壊後、オランダ当局は先物契約を一部無効とする措置を取った。"
            "しかし、体系的な市場規制にはつながらなかった。投機の規制は、常に事後的で不完全であるという"
            "歴史的パターンがここに始まる。",
            ST["body"]
        ),
        Paragraph(
            "1841年にチャールズ・マッケイが『群衆の狂気と幻想』でチューリップ・バブルを詳述し、"
            "バブル研究の古典となった。「歴史は繰り返さないが、韻を踏む」ことを示す"
            "最も有名な事例として定着した。",
            ST["body"]
        ),
    ]))

    story.append(gold_rule())

    # ============================================================
    # SECTION 4: LEGACY
    # ============================================================
    story.extend(section("LEGACY", "今に残っているもの", [
        Paragraph(
            "チューリップ・バブルの構造は、以後のすべてのバブルに繰り返し現れている。",
            ST["body"]
        ),
        Paragraph("— 1720年の南海泡沫事件（イギリス）", ST["bullet"]),
        Paragraph("— 1929年のウォール街大暴落", ST["bullet"]),
        Paragraph("— 1990年の日本のバブル崩壊", ST["bullet"]),
        Paragraph("— 2000年のドットコム・バブル", ST["bullet"]),
        Paragraph("— 2008年のサブプライム危機", ST["bullet"]),
        Paragraph("— 2021年の暗号資産・ミーム株の急騰と急落", ST["bullet"]),
        Spacer(1, 4),
        Paragraph(
            "すべてのバブルに共通する要素がある。新しい資産クラスへの熱狂、レバレッジの拡大、"
            "「今回は違う」という確信、そして突然の崩壊。",
            ST["body"]
        ),
        Paragraph(
            "「チューリップ・バブル」という言葉自体が、投機的過熱を表す世界共通の比喩として"
            "現在も使われている。",
            ST["body"]
        ),
    ]))

    story.append(gold_rule())

    # ============================================================
    # SECTION 5: FOR INVESTORS
    # ============================================================
    story.extend(section("FOR INVESTORS", "投資家にとっての意味", [
        Paragraph(
            "— 資産の価格が「使用価値」や「収益力」から大きく乖離している場合、"
            "それはバブルの兆候かもしれない",
            ST["bullet"]
        ),
        Paragraph(
            "— 「みんなが買っているから」は投資の根拠にならない。群集心理は最も危険なバイアスだ",
            ST["bullet"]
        ),
        Paragraph(
            "— レバレッジ（借金しての投資）がバブルを加速し、崩壊時の被害を拡大する。"
            "この構造は400年間変わっていない",
            ST["bullet"]
        ),
        Paragraph(
            "— バブルは事前に確実には見分けられない。だからこそ、分散投資と"
            "「失っても生活に影響しない範囲」での投資が重要になる",
            ST["bullet"]
        ),
        Spacer(1, 8),
        callout_box(
            "「市場は、あなたが支払能力を維持できる期間より長く、不合理でいられる」"
            "——ジョン・メイナード・ケインズ（帰属）",
            border_color=GREEN2,
            label="投資の格言",
        ),
    ]))

    story.append(gold_rule())

    # ============================================================
    # SECTION 6: KEY TERMS
    # ============================================================
    story.extend(section("KEY TERMS", "関連用語", [
        Paragraph("<b>チューリップ狂時代（Tulipmania）</b>", ST["term_name"]),
        Paragraph(
            "1634-1637年のオランダにおけるチューリップ球根の投機的過熱。人類最初の記録された投機バブル。",
            ST["term_desc"]
        ),
        Paragraph("<b>球根先物</b>", ST["term_name"]),
        Paragraph(
            "まだ土の中にある球根の将来の受け渡しを約束する契約。現物なしに取引が回転する仕組み。",
            ST["term_desc"]
        ),
        Paragraph("<b>群集心理</b>", ST["term_name"]),
        Paragraph(
            "多数の人が同じ行動を取ることで、個人の判断が集団の動きに引きずられる心理現象。"
            "バブルの主要な推進力。",
            ST["term_desc"]
        ),
        Paragraph("<b>バブル</b>", ST["term_name"]),
        Paragraph(
            "資産価格がファンダメンタルズ（本源的価値）から大幅に乖離して上昇し、最終的に急落する現象。",
            ST["term_desc"]
        ),
        Paragraph("<b>パニック売り</b>", ST["term_name"]),
        Paragraph(
            "市場参加者が恐怖に駆られて一斉に売却に走る現象。バブル崩壊時に価格の暴落を加速させる。",
            ST["term_desc"]
        ),
    ]))

    # ============================================================
    # FINAL PAGE: Disclaimer
    # ============================================================
    story.append(Spacer(1, 40))
    story.append(HRFlowable(width="30%", thickness=0.3, color=PARCH3, spaceBefore=0, spaceAfter=16))

    disclaimer_style = ParagraphStyle(
        "disclaimer", fontName="NotoSerifJP", fontSize=7,
        textColor=INK3, alignment=TA_CENTER, leading=14,
    )
    story.append(Paragraph("投資と思考の書斎", ParagraphStyle(
        "endpub", fontName="NotoSerifJP", fontSize=9, textColor=GOLD,
        alignment=TA_CENTER, leading=16, spaceAfter=6,
    )))
    story.append(Paragraph(
        "https://anni-memo.github.io/investment-library/",
        ParagraphStyle("endurl", fontName="Courier", fontSize=7, textColor=INK3,
                       alignment=TA_CENTER, leading=12, spaceAfter=14)
    ))
    story.append(Paragraph(
        "投資は自己責任です。このサイトの内容は情報提供を目的とし、投資助言ではありません。",
        disclaimer_style
    ))

    # Build
    doc.build(
        story,
        onFirstPage=title_page_header_footer,
        onLaterPages=header_footer,
    )
    print(f"PDF generated: {output_path}")
    print(f"File size: {os.path.getsize(output_path) / 1024:.1f} KB")


if __name__ == "__main__":
    build_pdf()
