"""
住宅購入の税制優遇 — A4 1-2枚まとめ資料PDF生成
書庫テーマ（パーチメント＋ゴールド）
"""
import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# === Colors ===
INK = HexColor("#1a1208")
INK2 = HexColor("#2d2010")
INK3 = HexColor("#4a3520")
PARCH = HexColor("#f5ede0")
PARCH2 = HexColor("#efe4d0")
PARCH3 = HexColor("#e8d8be")
PARCH4 = HexColor("#dfc9a8")
GOLD = HexColor("#8b6914")
GOLD2 = HexColor("#b8900a")
GOLD3 = HexColor("#d4aa22")
GREEN = HexColor("#1a5c2e")
GREEN2 = HexColor("#2d8659")

# === Font ===
FONT_DIR = "C:/Windows/Fonts"
pdfmetrics.registerFont(TTFont("NotoSerifJP", os.path.join(FONT_DIR, "NotoSerifJP-VF.ttf")))

# === Page ===
PAGE_W, PAGE_H = A4
ML = 2.0 * cm
MR = 2.0 * cm
MT = 2.2 * cm
MB = 1.8 * cm
CW = PAGE_W - ML - MR

# === Styles ===
def S(name, **kw):
    defaults = {"fontName": "NotoSerifJP", "fontSize": 9, "textColor": INK2, "leading": 16}
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)

ST = {}

def init_styles():
    ST["shelf"] = S("shelf", fontName="NotoSerifJP", fontSize=6.5, textColor=GOLD3, alignment=TA_CENTER)
    ST["title"] = S("title", fontSize=20, textColor=INK, alignment=TA_CENTER, leading=32, spaceAfter=4)
    ST["subtitle"] = S("subtitle", fontSize=10, textColor=INK3, alignment=TA_CENTER, leading=18, spaceAfter=6)
    ST["lead"] = S("lead", fontSize=8.5, textColor=INK3, alignment=TA_CENTER, leading=16, spaceAfter=4)
    ST["h2"] = S("h2", fontSize=12, textColor=INK, leading=20, spaceAfter=6, spaceBefore=10)
    ST["h3"] = S("h3", fontSize=9.5, textColor=GOLD, leading=16, spaceAfter=4, spaceBefore=6)
    ST["body"] = S("body", fontSize=8, textColor=INK2, leading=14.5, spaceAfter=4, alignment=TA_JUSTIFY)
    ST["body_sm"] = S("body_sm", fontSize=7, textColor=INK3, leading=12, spaceAfter=3)
    ST["bullet"] = S("bullet", fontSize=7.5, textColor=INK2, leading=13, spaceAfter=2, leftIndent=10, firstLineIndent=-10)
    ST["callout"] = S("callout", fontSize=8.5, textColor=INK, leading=15, alignment=TA_JUSTIFY)
    ST["num_big"] = S("num_big", fontSize=22, textColor=GOLD, alignment=TA_CENTER, leading=28)
    ST["num_label"] = S("num_label", fontSize=7, textColor=INK3, alignment=TA_CENTER, leading=12)
    ST["th"] = S("th", fontName="NotoSerifJP", fontSize=6.5, textColor=PARCH3, leading=11)
    ST["td"] = S("td", fontSize=7.5, textColor=INK2, leading=12)
    ST["td_num"] = S("td_num", fontSize=7.5, textColor=INK, leading=12, alignment=TA_RIGHT)
    ST["td_em"] = S("td_em", fontSize=7.5, textColor=GOLD, leading=12, alignment=TA_RIGHT)
    ST["footer"] = S("footer", fontSize=5.5, textColor=INK3, alignment=TA_CENTER, leading=9)
    ST["source"] = S("source", fontName="NotoSerifJP", fontSize=5.5, textColor=INK3, leading=9)


def header_footer(canvas, doc):
    canvas.saveState()
    # Top gold line
    canvas.setStrokeColor(GOLD2)
    canvas.setLineWidth(0.6)
    canvas.line(ML, PAGE_H - 1.6 * cm, PAGE_W - MR, PAGE_H - 1.6 * cm)
    # Header text
    canvas.setFont("NotoSerifJP", 6)
    canvas.setFillColor(INK3)
    canvas.drawCentredString(PAGE_W / 2, PAGE_H - 1.4 * cm, "投資と思考の書斎 \u2014 住宅税制")
    # Page number
    canvas.setFont("NotoSerifJP", 6)
    canvas.drawCentredString(PAGE_W / 2, 1.0 * cm, str(doc.page))
    # Bottom line
    canvas.setStrokeColor(PARCH4)
    canvas.setLineWidth(0.3)
    canvas.line(ML, 1.3 * cm, PAGE_W - MR, 1.3 * cm)
    canvas.restoreState()


def gold_rule(w="100%", t=0.4):
    return HRFlowable(width=w, thickness=t, color=GOLD2, spaceBefore=8, spaceAfter=8)


def callout_box(text, border_color=GOLD2):
    inner = Table(
        [[Paragraph(text, ST["callout"])]],
        colWidths=[CW - 24],
    )
    inner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PARCH2),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LINEBEFORESTROKECOLOR", (0, 0), (0, -1), border_color),
        ("LINEBEFORESTROKEWIDTH", (0, 0), (0, -1), 2.5),
    ]))
    return inner


def stat_card(number, label, color=GOLD):
    st_num = S("_n", fontSize=20, textColor=color, alignment=TA_CENTER, leading=26)
    st_lab = S("_l", fontSize=6.5, textColor=INK3, alignment=TA_CENTER, leading=10)
    t = Table(
        [[Paragraph(number, st_num)], [Paragraph(label, st_lab)]],
        colWidths=[CW / 3 - 8],
    )
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PARCH2),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def build():
    output = os.path.join(os.path.dirname(__file__), "yadokari-tax-benefits.pdf")

    doc = SimpleDocTemplate(
        output, pagesize=A4,
        leftMargin=ML, rightMargin=MR, topMargin=MT, bottomMargin=MB,
        title="住宅購入の税制優遇 — 日本で家を買うと、なぜ有利なのか",
        author="投資と思考の書斎",
        subject="住宅税制・ヤドカリ投資",
        creator="投資Library",
    )

    story = []

    # ===== HEADER =====
    story.append(Paragraph("TAX BENEFITS \u00B7 \u4f4f\u5b85\u7a0e\u5236", ST["shelf"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("住宅購入の税制優遇", ST["title"]))
    story.append(Paragraph("日本で家を買うと、なぜ有利なのか", ST["subtitle"]))
    story.append(HRFlowable(width="25%", thickness=0.4, color=GOLD2, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph(
        "住宅ローン控除・借り換え継続・固定資産税軽減——賃貸では得られない、購入者だけの税制メリットを整理する。",
        ST["lead"]
    ))
    story.append(Spacer(1, 6))

    # ===== 3 KEY NUMBERS =====
    cards = Table(
        [[stat_card("<b>455</b>万円", "住宅ローン控除 最大額\n（認定住宅・子育て世帯・13年間）"),
          stat_card("<b>1/6</b>", "固定資産税 課税標準\n（住宅用地200㎡以下）"),
          stat_card("<b>1,000</b>万円", "贈与税非課税枠\n（省エネ住宅取得資金）")]],
        colWidths=[CW / 3] * 3,
    )
    cards.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(cards)
    story.append(Spacer(1, 6))

    # ===== SECTION 1: 住宅ローン控除 =====
    story.append(gold_rule())
    story.append(Paragraph("<b>1. 住宅ローン控除 — 年末残高の0.7%を税金から直接減額</b>", ST["h2"]))
    story.append(Paragraph(
        "「所得控除」ではなく<b>「税額控除」</b>。年収にかかわらず控除額がそのまま税金の減額になる。"
        "2026年度改正で中古住宅も大幅拡充され、省エネ中古の控除期間が10年→<b>13年</b>に延長。",
        ST["body"]
    ))

    # Loan deduction table
    th = ST["th"]
    td = ST["td"]
    tdn = ST["td_num"]
    tde = ST["td_em"]
    loan_data = [
        [Paragraph("住宅区分（新築）", th), Paragraph("一般世帯", th), Paragraph("子育て世帯", th), Paragraph("期間", th)],
        [Paragraph("認定住宅", td), Paragraph("4,500万円", tdn), Paragraph("<b>5,000万円</b>", tde), Paragraph("13年", tdn)],
        [Paragraph("ZEH水準省エネ", td), Paragraph("3,500万円", tdn), Paragraph("<b>4,500万円</b>", tde), Paragraph("13年", tdn)],
        [Paragraph("省エネ基準適合", td), Paragraph("3,000万円", tdn), Paragraph("<b>4,000万円</b>", tde), Paragraph("13年", tdn)],
    ]
    lt = Table(loan_data, colWidths=[CW * 0.35, CW * 0.22, CW * 0.23, CW * 0.20])
    lt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("TEXTCOLOR", (0, 0), (-1, 0), PARCH3),
        ("BACKGROUND", (0, 1), (-1, -1), PARCH2),
        ("GRID", (0, 0), (-1, -1), 0.3, PARCH4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(lt)
    story.append(Spacer(1, 4))

    # ===== SECTION 2: 借り換え =====
    story.append(gold_rule())
    story.append(Paragraph("<b>2. 借り換えても控除は続く</b>", ST["h2"]))
    story.append(Paragraph(
        "2つの条件を満たせば、借り換え後も住宅ローン控除を継続できる。"
        "<b>条件①</b> 新ローンが旧ローンの返済目的であること。"
        "<b>条件②</b> 新ローンの償還期間が10年以上であること。",
        ST["body"]
    ))
    story.append(Paragraph(
        "旧残高≧新借入額なら年末残高がそのまま控除対象。旧残高＜新借入額（諸費用上乗せ等）なら "
        "年末残高×（旧残高÷新借入額）が控除対象。",
        ST["body_sm"]
    ))
    story.append(callout_box(
        "【計算例】旧残高2,500万円、借換え2,700万円（諸費用含む）、年末残高2,600万円\n"
        "→ 控除対象 = 2,600万×(2,500÷2,700) = <b>約2,407万円</b> → 控除額 <b>約16.8万円/年</b>"
    ))
    story.append(Paragraph(
        "\u26a0 控除期間は延長されない（当初入居年からの残り年数のみ）。返済期間を10年未満にすると控除資格を喪失。",
        ST["body_sm"]
    ))

    # ===== SECTION 3: 5つの優遇 =====
    story.append(gold_rule())
    story.append(Paragraph("<b>3. 住宅購入者だけの5つの税制優遇</b>", ST["h2"]))

    benefits = [
        ("\u2776 固定資産税の軽減", "住宅用地は課税標準<b>1/6</b>（200㎡以下）。新築は3\u301c7年間、税額<b>1/2</b>。恒久措置。"),
        ("\u2777 贈与税非課税", "親・祖父母からの住宅資金、省エネ住宅なら最大<b>1,000万円</b>非課税（2026年末まで）。"),
        ("\u2778 登録免許税の軽減", "所有権保存0.4%→<b>0.15%</b>、移転2.0%→<b>0.3%</b>、抵当権0.4%→<b>0.1%</b>。"),
        ("\u2779 不動産取得税の軽減", "評価額から<b>1,200万円控除</b>＋税率3%（通常4%）。認定長期優良は1,300万円控除。"),
        ("\u277a 3,000万円特別控除", "居住用財産の売却益から<b>3,000万円</b>まで非課税。ヤドカリ投資の売却時に有効。"),
    ]
    for title, desc in benefits:
        story.append(Paragraph(f"<b>{title}</b>", ST["h3"]))
        story.append(Paragraph(desc, ST["body_sm"]))

    # ===== SECTION 4: シミュレーション =====
    story.append(gold_rule())
    story.append(Paragraph("<b>4. 年収別シミュレーション</b>（省エネ新築4,000万円・金利0.5%・35年）", ST["h2"]))

    sim_data = [
        [Paragraph("年収", th), Paragraph("13年間控除総額", th), Paragraph("年平均", th), Paragraph("備考", th)],
        [Paragraph("400万円", td), Paragraph("約210万円", tdn), Paragraph("約16万円", tdn), Paragraph("枠を使い切れない", td)],
        [Paragraph("500万円", td), Paragraph("約273万円", tdn), Paragraph("約21万円", tdn), Paragraph("住民税控除でほぼ満額", td)],
        [Paragraph("600万円", td), Paragraph("<b>約307万円</b>", tde), Paragraph("<b>約24万円</b>", tde), Paragraph("満額活用可能", td)],
        [Paragraph("700万円\u301c", td), Paragraph("<b>約307万円</b>", tde), Paragraph("<b>約24万円</b>", tde), Paragraph("上限到達", td)],
    ]
    st2 = Table(sim_data, colWidths=[CW * 0.18, CW * 0.28, CW * 0.20, CW * 0.34])
    st2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("BACKGROUND", (0, 1), (-1, -1), PARCH2),
        ("GRID", (0, 0), (-1, -1), 0.3, PARCH4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(st2)
    story.append(Spacer(1, 4))

    story.append(callout_box(
        "年収600万円・省エネ新築4,000万円の場合、税制メリット合計は<b>約370\u301c380万円</b>。"
        "賃貸にはこれらの優遇は一切ない。月々の支払いだけで「賃貸が安い」と結論づけるのは、この数字を無視している。",
        GREEN
    ))

    # ===== SECTION 5: 海外比較 =====
    story.append(gold_rule())
    story.append(Paragraph("<b>5. 海外比較 — 日本の税額控除は世界でも手厚い</b>", ST["h2"]))

    cmp_data = [
        [Paragraph("項目", th), Paragraph("日本", th), Paragraph("アメリカ", th)],
        [Paragraph("控除方式", td), Paragraph("<b>税額控除</b>（残高の0.7%）", tde), Paragraph("所得控除（支払利息）", td)],
        [Paragraph("効果", td), Paragraph("<b>税金から直接減額</b>", tde), Paragraph("税率に依存", td)],
        [Paragraph("利用率", td), Paragraph("<b>年末調整で自動適用</b>", tde), Paragraph("約10%のみ利用可", td)],
        [Paragraph("固定資産税", td), Paragraph("<b>住宅用地1/6（恒久）</b>", tde), Paragraph("SALT控除上限あり", td)],
        [Paragraph("贈与非課税", td), Paragraph("<b>最大1,000万円</b>", tde), Paragraph("制度なし", td)],
    ]
    ct = Table(cmp_data, colWidths=[CW * 0.22, CW * 0.40, CW * 0.38])
    ct.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("BACKGROUND", (0, 1), (-1, -1), PARCH2),
        ("GRID", (0, 0), (-1, -1), 0.3, PARCH4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(ct)
    story.append(Spacer(1, 4))

    # ===== CONCLUSION =====
    story.append(gold_rule("40%", 0.3))
    story.append(callout_box(
        "日本で住宅を買うことには、明確な税制上の合理性がある。"
        "ヤドカリ投資はこの制度を最大限に活用する戦略だ。"
        "居住中はローン控除で実質負担を下げ、将来の売却時には3,000万円特別控除で譲渡益を守る。"
        "<b>税制を知ることが、不動産投資の第一歩になる。</b>",
        GREEN
    ))

    # ===== SOURCES =====
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=0.3, color=PARCH4, spaceBefore=0, spaceAfter=4))
    story.append(Paragraph("SOURCES", S("_src_h", fontName="Courier", fontSize=5, textColor=GOLD, leading=8)))
    sources = [
        "国税庁「No.1233 住宅ローン等の借換えをしたとき」",
        "国土交通省「住宅ローン減税」「住宅取得等資金に係る贈与税の非課税措置」",
        "2026年度税制改正大綱（住宅ローン減税関連）",
    ]
    for s in sources:
        story.append(Paragraph(s, ST["source"]))

    story.append(Spacer(1, 4))
    story.append(Paragraph("投資と思考の書斎 | https://anni-memo.github.io/investment-library/", ST["footer"]))
    story.append(Paragraph("投資は自己責任です。このサイトの内容は情報提供を目的とし、投資助言ではありません。", ST["footer"]))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    size_kb = os.path.getsize(output) / 1024
    print(f"OK: {output} ({size_kb:.0f}KB)")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    init_styles()
    build()
