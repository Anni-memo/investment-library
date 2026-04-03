"""
Claude Codeを始める — A4 2枚まとめPDF生成
書庫テーマ（パーチメント＋ゴールド）
"""
import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor
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
BLUE = HexColor("#1a2a4a")

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


def S(name, **kw):
    defaults = {"fontName": "NotoSerifJP", "fontSize": 9, "textColor": INK2, "leading": 16}
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)


ST = {}


def init_styles():
    ST["shelf"] = S("shelf", fontSize=6.5, textColor=GOLD3, alignment=TA_CENTER)
    ST["title"] = S("title", fontSize=20, textColor=INK, alignment=TA_CENTER, leading=32, spaceAfter=4)
    ST["subtitle"] = S("subtitle", fontSize=10, textColor=INK3, alignment=TA_CENTER, leading=18, spaceAfter=6)
    ST["lead"] = S("lead", fontSize=8.5, textColor=INK3, alignment=TA_CENTER, leading=16, spaceAfter=4)
    ST["h2"] = S("h2", fontSize=12, textColor=INK, leading=20, spaceAfter=6, spaceBefore=10)
    ST["h3"] = S("h3", fontSize=9.5, textColor=GOLD, leading=16, spaceAfter=4, spaceBefore=6)
    ST["body"] = S("body", fontSize=8, textColor=INK2, leading=14.5, spaceAfter=4, alignment=TA_JUSTIFY)
    ST["body_sm"] = S("body_sm", fontSize=7, textColor=INK3, leading=12, spaceAfter=3)
    ST["bullet"] = S("bullet", fontSize=7.5, textColor=INK2, leading=13, spaceAfter=2, leftIndent=10, firstLineIndent=-10)
    ST["callout"] = S("callout", fontSize=8.5, textColor=INK, leading=15, alignment=TA_JUSTIFY)
    ST["code"] = S("code", fontSize=7, textColor=PARCH3, leading=12)
    ST["th"] = S("th", fontSize=6.5, textColor=PARCH3, leading=11)
    ST["td"] = S("td", fontSize=7.5, textColor=INK2, leading=12)
    ST["td_em"] = S("td_em", fontSize=7.5, textColor=GOLD, leading=12)
    ST["footer"] = S("footer", fontSize=5.5, textColor=INK3, alignment=TA_CENTER, leading=9)


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(GOLD2)
    canvas.setLineWidth(0.6)
    canvas.line(ML, PAGE_H - 1.6 * cm, PAGE_W - MR, PAGE_H - 1.6 * cm)
    canvas.setFont("NotoSerifJP", 6)
    canvas.setFillColor(INK3)
    canvas.drawCentredString(PAGE_W / 2, PAGE_H - 1.4 * cm, "\u6295\u8cc7\u3068\u601d\u8003\u306e\u66f8\u658e \u2014 Claude Code Guide")
    canvas.setFont("NotoSerifJP", 6)
    canvas.drawCentredString(PAGE_W / 2, 1.0 * cm, str(doc.page))
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


def code_block(text):
    code_style = S("_code", fontSize=7, textColor=PARCH3, leading=12, fontName="NotoSerifJP")
    inner = Table(
        [[Paragraph(text, code_style)]],
        colWidths=[CW - 16],
    )
    inner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), INK),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LINEBEFORESTROKECOLOR", (0, 0), (0, -1), GOLD),
        ("LINEBEFORESTROKEWIDTH", (0, 0), (0, -1), 2),
    ]))
    return inner


def card(title, tag, desc):
    t_style = S("_ct", fontSize=8, textColor=INK, leading=14)
    d_style = S("_cd", fontSize=7, textColor=INK3, leading=12)
    elements = [
        Paragraph(f"<b>{title}</b>  <font color='#8b6914' size='5'>{tag}</font>", t_style),
        Spacer(1, 3),
        Paragraph(desc, d_style),
    ]
    inner = Table(
        [[elements]],
        colWidths=[CW - 20],
    )
    inner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PARCH2),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LINEBEFORESTROKECOLOR", (0, 0), (0, -1), GOLD),
        ("LINEBEFORESTROKEWIDTH", (0, 0), (0, -1), 2),
    ]))
    return inner


def build():
    output = os.path.join(os.path.dirname(__file__), "claude-code-setup.pdf")

    doc = SimpleDocTemplate(
        output, pagesize=A4,
        leftMargin=ML, rightMargin=MR, topMargin=MT, bottomMargin=MB,
        title="Claude Code\u3092\u59cb\u3081\u308b \u2014 \u5b8c\u5168\u30bb\u30c3\u30c8\u30a2\u30c3\u30d7\u30ac\u30a4\u30c9",
        author="\u6295\u8cc7\u3068\u601d\u8003\u306e\u66f8\u658e",
        subject="Claude Code",
        creator="\u6295\u8cc7Library",
    )

    story = []

    # ===== HEADER =====
    story.append(Paragraph("CLAUDE CODE BEGINNER'S GUIDE", ST["shelf"]))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Claude Code\u3092\u59cb\u3081\u308b", ST["title"]))
    story.append(Paragraph("\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u304b\u3089\u300c\u4f7f\u3048\u308b\u72b6\u614b\u300d\u307e\u3067\u306e\u5b8c\u5168\u30ac\u30a4\u30c9", ST["subtitle"]))
    story.append(HRFlowable(width="25%", thickness=0.4, color=GOLD2, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph(
        "AI\u306f\u9053\u5177\u3067\u306f\u306a\u3044\u3002\u6b63\u3057\u304f\u8a2d\u5b9a\u3059\u308c\u3070\u3001\u3042\u306a\u305f\u306e\u4ed5\u4e8b\u3092\u7406\u89e3\u3057\u3001\u63d0\u6848\u3057\u3001\u5b9f\u884c\u3059\u308b\u300c\u3082\u3046\u4e00\u4eba\u306e\u81ea\u5206\u300d\u306b\u306a\u308b\u3002",
        ST["lead"]
    ))
    story.append(Spacer(1, 4))

    # ===== SECTION 1 =====
    story.append(gold_rule())
    story.append(Paragraph("<b>1. Claude Code\u3068\u306f\u4f55\u304b</b>", ST["h2"]))
    story.append(Paragraph(
        "Claude Code\u306fAnthropic\u793e\u304c\u63d0\u4f9b\u3059\u308b<b>AI\u30b3\u30fc\u30c7\u30a3\u30f3\u30b0\u30a2\u30b7\u30b9\u30bf\u30f3\u30c8</b>\u3002"
        "\u30bf\u30fc\u30df\u30ca\u30eb\u3001\u30c7\u30b9\u30af\u30c8\u30c3\u30d7\u30a2\u30d7\u30ea\u3001Web\u30a2\u30d7\u30ea\u3001IDE\u62e1\u5f35\u3068\u3057\u3066\u52d5\u4f5c\u3059\u308b\u3002",
        ST["body"]
    ))
    story.append(callout_box(
        "<b>\u666e\u901a\u306eAI\u30c1\u30e3\u30c3\u30c8:</b> \u30c6\u30ad\u30b9\u30c8\u3092\u9001\u308a\u3001\u30c6\u30ad\u30b9\u30c8\u304c\u8fd4\u308b\u3002\u305d\u308c\u3060\u3051\u3002<br/>"
        "<b>Claude Code:</b> \u30d5\u30a1\u30a4\u30eb\u3092\u8aad\u307f\u3001\u30b3\u30fc\u30c9\u3092\u66f8\u304d\u3001\u30b3\u30de\u30f3\u30c9\u3092\u5b9f\u884c\u3057\u3001\u7d50\u679c\u3092\u78ba\u8a8d\u3057\u3066\u4fee\u6b63\u3059\u308b\u3002\u3042\u306a\u305f\u306e\u4ee3\u308f\u308a\u306b<b>\u300c\u624b\u3092\u52d5\u304b\u3059\u300d</b>AI\u3060\u3002"
    ))
    story.append(Paragraph(
        "\u30d7\u30ed\u30b0\u30e9\u30de\u30fc\u3060\u3051\u306e\u30c4\u30fc\u30eb\u3067\u306f\u306a\u3044\u3002\u6587\u7ae0\u3092\u66f8\u304f\u4eba\u3001\u30c7\u30fc\u30bf\u3092\u6574\u7406\u3059\u308b\u4eba\u3001\u60c5\u5831\u767a\u4fe1\u3092\u3059\u308b\u4eba\u2014\u2014"
        "<b>PC\u3067\u4f55\u304b\u3092\u4f5c\u308b\u3059\u3079\u3066\u306e\u4eba</b>\u306b\u3068\u3063\u3066\u6700\u5f37\u306e\u76f8\u68d2\u306b\u306a\u308b\u3002",
        ST["body"]
    ))

    # ===== SECTION 2 =====
    story.append(gold_rule())
    story.append(Paragraph("<b>2. \u59cb\u3081\u308b\u524d\u306b \u2014 \u5fc5\u8981\u306a\u3082\u306e</b>", ST["h2"]))

    req_data = [
        [Paragraph("\u9805\u76ee", ST["th"]), Paragraph("\u5185\u5bb9", ST["th"])],
        [Paragraph("Anthropic\u30a2\u30ab\u30a6\u30f3\u30c8", ST["td"]), Paragraph("claude.ai \u3067\u7121\u6599\u767b\u9332", ST["td"])],
        [Paragraph("<b>Max\u30d7\u30e9\u30f3\uff08\u63a8\u5968\uff09</b>", ST["td_em"]), Paragraph("\u6708\u984d $100\u301c\u3002API\u5f93\u91cf\u8ab2\u91d1\u3088\u308a\u5272\u5b89\u3002\u500b\u4eba\u5229\u7528\u306b\u6700\u9069", ST["td"])],
        [Paragraph("\u30d7\u30ed\u30b0\u30e9\u30df\u30f3\u30b0\u7d4c\u9a13", ST["td"]), Paragraph("<b>\u4e0d\u8981\u3002</b>Claude Code\u81ea\u4f53\u304c\u30b3\u30fc\u30c9\u3092\u66f8\u3044\u3066\u304f\u308c\u308b", ST["td"])],
    ]
    rt = Table(req_data, colWidths=[CW * 0.35, CW * 0.65])
    rt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("BACKGROUND", (0, 1), (-1, -1), PARCH2),
        ("GRID", (0, 0), (-1, -1), 0.3, PARCH4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(rt)

    # ===== SECTION 3 =====
    story.append(gold_rule())
    story.append(Paragraph("<b>3. \u30a4\u30f3\u30b9\u30c8\u30fc\u30eb \u2014 4\u3064\u306e\u65b9\u6cd5</b>", ST["h2"]))

    install_data = [
        [Paragraph("\u65b9\u6cd5", ST["th"]), Paragraph("\u5bfe\u8c61", ST["th"]), Paragraph("\u5185\u5bb9", ST["th"])],
        [Paragraph("<b>\u30c7\u30b9\u30af\u30c8\u30c3\u30d7\u30a2\u30d7\u30ea</b>", ST["td_em"]),
         Paragraph("\u521d\u5fc3\u8005\u306b\u304a\u3059\u3059\u3081", ST["td"]),
         Paragraph("claude.com/download \u304b\u3089DL\u3002\u30a4\u30f3\u30b9\u30c8\u30fc\u30e9\u30fc\u3092\u5b9f\u884c\u3059\u308b\u3060\u3051", ST["td"])],
        [Paragraph("Web\u30a2\u30d7\u30ea", ST["td"]),
         Paragraph("\u30a4\u30f3\u30b9\u30c8\u30fc\u30eb\u4e0d\u8981", ST["td"]),
         Paragraph("claude.ai/code \u306b\u30a2\u30af\u30bb\u30b9\u3002\u30ed\u30fc\u30ab\u30eb\u30d5\u30a1\u30a4\u30eb\u306f\u5236\u9650\u3042\u308a", ST["td"])],
        [Paragraph("CLI\uff08\u30bf\u30fc\u30df\u30ca\u30eb\uff09", ST["td"]),
         Paragraph("\u4e0a\u7d1a\u8005\u5411\u3051", ST["td"]),
         Paragraph("npm install -g @anthropic-ai/claude-code", ST["td"])],
        [Paragraph("IDE\u62e1\u5f35", ST["td"]),
         Paragraph("\u958b\u767a\u8005\u5411\u3051", ST["td"]),
         Paragraph("VS Code / JetBrains\u306e\u62e1\u5f35\u6a5f\u80fd\u3068\u3057\u3066\u5229\u7528", ST["td"])],
    ]
    it = Table(install_data, colWidths=[CW * 0.28, CW * 0.22, CW * 0.50])
    it.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), INK),
        ("BACKGROUND", (0, 1), (-1, -1), PARCH2),
        ("GRID", (0, 0), (-1, -1), 0.3, PARCH4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(it)

    # ===== SECTION 4 =====
    story.append(gold_rule())
    story.append(Paragraph("<b>4. \u6700\u521d\u306e\u8a2d\u5b9a \u2014 CLAUDE.md \u3092\u66f8\u304f</b>", ST["h2"]))
    story.append(Paragraph(
        "CLAUDE.md\u306f\u3001Claude Code\u304c\u6bce\u56de\u8d77\u52d5\u6642\u306b\u8aad\u307f\u8fbc\u3080<b>\u300c\u884c\u52d5\u6307\u91dd\u66f8\u300d</b>\u3002"
        "\u3053\u3053\u306b\u66f8\u3044\u305f\u5185\u5bb9\u304c\u3001AI\u306e\u632f\u308b\u821e\u3044\u3092\u6c7a\u3081\u308b\u3002",
        ST["body"]
    ))
    story.append(callout_box(
        "CLAUDE.md\u304c\u306a\u3044Claude Code = \u521d\u65e5\u306e\u65b0\u5165\u793e\u54e1\u3002<br/>"
        "CLAUDE.md\u304c\u3042\u308bClaude Code = <b>\u3042\u306a\u305f\u306e\u3053\u3068\u3092\u77e5\u3063\u3066\u3044\u308b\u30013\u5e74\u76ee\u306e\u512a\u79c0\u306a\u30a2\u30b7\u30b9\u30bf\u30f3\u30c8\u3002</b>"
    ))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "\u30db\u30fc\u30e0\u30c7\u30a3\u30ec\u30af\u30c8\u30ea\u306b ~/.claude/CLAUDE.md \u3092\u4f5c\u6210\u3002\u6700\u521d\u306f\u30b7\u30f3\u30d7\u30eb\u3067OK\uff1a",
        ST["body_sm"]
    ))

    story.append(code_block(
        "# \u79c1\u306eCLAUDE.md<br/><br/>"
        "## \u30b3\u30df\u30e5\u30cb\u30b1\u30fc\u30b7\u30e7\u30f3<br/>"
        "- \u65e5\u672c\u8a9e\u3067\u5fdc\u7b54\u3057\u3066\u304f\u3060\u3055\u3044<br/>"
        "- \u7c21\u6f54\u306b\u3001\u8981\u70b9\u3092\u5148\u306b\u4f1d\u3048\u3066\u304f\u3060\u3055\u3044<br/>"
        "- \u4fdd\u5b58\u3084\u5909\u66f4\u306e\u524d\u306b\u3001\u5fc5\u305a\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044<br/><br/>"
        "## \u79c1\u306b\u3064\u3044\u3066<br/>"
        "- \u540d\u524d: \uff08\u3042\u306a\u305f\u306e\u540d\u524d\uff09<br/>"
        "- \u8077\u696d: \uff08\u3042\u306a\u305f\u306e\u8077\u696d\uff09<br/>"
        "- \u76ee\u6a19: \uff08\u4eca\u53d6\u308a\u7d44\u3093\u3067\u3044\u308b\u3053\u3068\uff09"
    ))

    # ===== SECTION 5 =====
    story.append(gold_rule())
    story.append(Paragraph("<b>5. \u6700\u521d\u306e\u4f1a\u8a71 \u2014 \u4f55\u3092\u983c\u3080\u304b</b>", ST["h2"]))

    tries = [
        ("\u30d5\u30a1\u30a4\u30eb\u6574\u7406", "EASY", "\u300c\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30d5\u30a9\u30eb\u30c0\u306e\u4e2d\u8eab\u3092\u7a2e\u985e\u5225\u306b\u6574\u7406\u3057\u3066\u300d"),
        ("\u6587\u7ae0\u4f5c\u6210", "PRACTICAL", "\u300c\u6765\u9031\u306e\u4f1a\u8b70\u7528\u306b\u3001\u3053\u306e\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u306e\u9032\u6357\u5831\u544a\u3092\u66f8\u3044\u3066\u300d"),
        ("Web\u30b5\u30a4\u30c8\u4f5c\u6210", "AMBITIOUS", "\u300c\u81ea\u5df1\u7d39\u4ecb\u306eWeb\u30da\u30fc\u30b8\u3092\u4f5c\u3063\u3066\u300d"),
    ]
    for title, tag, desc in tries:
        story.append(card(title, tag, desc))
        story.append(Spacer(1, 3))

    story.append(Paragraph(
        "\u5b8c\u74a7\u306a\u6307\u793a\u3092\u51fa\u3059\u5fc5\u8981\u306f\u306a\u3044\u3002\u66d6\u6627\u306a\u4f9d\u983c\u3067\u3082\u3001Claude Code\u306f\u78ba\u8a8d\u3057\u306a\u304c\u3089\u9032\u3081\u3066\u304f\u308c\u308b\u3002"
        "\u300c\u3068\u308a\u3042\u3048\u305a\u3053\u3093\u306a\u611f\u3058\u3067\u300d\u304c\u901a\u3058\u308b\u306e\u304c\u3001\u5f93\u6765\u306e\u30d7\u30ed\u30b0\u30e9\u30df\u30f3\u30b0\u3068\u306e\u6700\u5927\u306e\u9055\u3044\u3060\u3002",
        ST["body"]
    ))

    # ===== SECTION 6 =====
    story.append(gold_rule())
    story.append(Paragraph("<b>6. \u80b2\u3066\u308b \u2014 \u4f7f\u3046\u307b\u3069\u8ce2\u304f\u306a\u308b\u4ed5\u7d44\u307f</b>", ST["h2"]))
    story.append(Paragraph(
        "Claude Code\u306f\u4f7f\u3044\u6368\u3066\u306e\u30c4\u30fc\u30eb\u3067\u306f\u306a\u3044\u3002\u6b63\u3057\u304f\u8a2d\u5b9a\u3059\u308c\u3070\u3001<b>\u4f7f\u3046\u307b\u3069\u8ce2\u304f\u306a\u308b</b>\u3002",
        ST["body"]
    ))

    features = [
        ("\u30e1\u30e2\u30ea\uff08memory/\uff09", "AUTOMATIC",
         "\u4f1a\u8a71\u4e2d\u306e\u91cd\u8981\u60c5\u5831\u3092\u81ea\u52d5\u4fdd\u5b58\u3002\u597d\u307f\u3001\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u65b9\u91dd\u3001\u904e\u53bb\u306e\u30d5\u30a3\u30fc\u30c9\u30d0\u30c3\u30af\u3092\u6b21\u56de\u4ee5\u964d\u81ea\u52d5\u53c2\u7167"),
        ("\u5916\u90e8\u8133\u3068\u306e\u63a5\u7d9a", "ADVANCED",
         "Obsidian\u7b49\u306e\u30ce\u30fc\u30c8\u30a2\u30d7\u30ea\u3068\u9023\u643a\u3055\u305b\u308b\u3068\u3001\u3042\u306a\u305f\u306e\u5168\u77e5\u8b58\u306bAI\u304c\u30a2\u30af\u30bb\u30b9\u3067\u304d\u308b\u3088\u3046\u306b\u306a\u308b"),
    ]
    for title, tag, desc in features:
        story.append(card(title, tag, desc))
        story.append(Spacer(1, 3))

    # ===== SECTION 7: 30 minutes =====
    story.append(gold_rule("40%", 0.3))
    story.append(callout_box(
        "<b>YOUR FIRST 30 MINUTES</b><br/><br/>"
        "<b>0\u301c5\u5206:</b> \u30c7\u30b9\u30af\u30c8\u30c3\u30d7\u30a2\u30d7\u30ea\u3092\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9<br/>"
        "<b>5\u301c15\u5206:</b> CLAUDE.md\u3092\u66f8\u304f\uff08\u4e0a\u306e\u30c6\u30f3\u30d7\u30ec\u30fc\u30c8\u3092\u30b3\u30d4\u30fc\uff09<br/>"
        "<b>15\u301c30\u5206:</b> \u6700\u521d\u306e\u4f1a\u8a71\u3092\u8a66\u3059\uff08\u30d5\u30a1\u30a4\u30eb\u6574\u7406\u304c\u304a\u3059\u3059\u3081\uff09<br/><br/>"
        "<b>30\u5206\u5f8c\u3001\u3042\u306a\u305f\u306f\u3082\u3046\u300cAI\u3092\u80b2\u3066\u308b\u4eba\u300d\u306b\u306a\u3063\u3066\u3044\u308b\u3002</b>",
        GREEN
    ))

    # ===== FOOTER =====
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=0.3, color=PARCH4, spaceBefore=0, spaceAfter=4))
    story.append(Paragraph(
        "\u6295\u8cc7\u3068\u601d\u8003\u306e\u66f8\u658e | https://anni-memo.github.io/investment-library/",
        ST["footer"]
    ))
    story.append(Paragraph(
        "PART 1 / 3 \u2014 \u7d9a\u304d: Part 2\u300c\u8a18\u61b6\u3092\u8a2d\u8a08\u3059\u308b\u300d / Part 3\u300c\u5916\u90e8\u8133\u3068\u63a5\u7d9a\u3059\u308b\u300d",
        ST["footer"]
    ))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    size_kb = os.path.getsize(output) / 1024
    print(f"OK: {output} ({size_kb:.0f}KB)")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    init_styles()
    build()
