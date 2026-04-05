"""
キーエンス統合レポートPDF（1ページ）
KPI・moatレーダー・FCF推移・4つの視座・リスクをA4 1枚に凝縮
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Circle, Polygon
import math

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
GREEN = HexColor("#2a4a1a")
GREEN2 = HexColor("#3d6828")
GREEN3 = HexColor("#5a8a3a")

# === Font ===
FONT_DIR = "C:/Windows/Fonts"
pdfmetrics.registerFont(TTFont("NotoSerifJP", os.path.join(FONT_DIR, "NotoSerifJP-VF.ttf")))

# === Page ===
PAGE_W, PAGE_H = A4
M = 1.5 * cm
CW = PAGE_W - 2 * M

# === Output dir ===
OUT_DIR = os.path.dirname(__file__)

# === Styles ===
def s(name, **kw):
    defaults = {"fontName": "NotoSerifJP", "textColor": INK2, "leading": 12}
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)

ST = {}
def init_styles():
    ST["title"] = s("title", fontSize=16, textColor=INK, alignment=TA_CENTER, leading=20, spaceAfter=0)
    ST["title_en"] = s("title_en", fontName="Courier", fontSize=7, textColor=GREEN3, alignment=TA_CENTER, leading=10, spaceAfter=2)
    ST["code"] = s("code", fontName="Courier", fontSize=6, textColor=GREEN3, alignment=TA_CENTER, spaceAfter=3)
    ST["subtitle"] = s("subtitle", fontSize=7.5, textColor=INK3, alignment=TA_CENTER, leading=12, spaceAfter=6)
    ST["sec_label"] = s("sec_label", fontName="Courier", fontSize=5.5, textColor=GOLD, spaceAfter=2)
    ST["sec_title"] = s("sec_title", fontSize=9, textColor=INK, leading=14, spaceAfter=3)
    ST["body"] = s("body", fontSize=7.5, textColor=INK2, leading=12, spaceAfter=3)
    ST["body_xs"] = s("body_xs", fontSize=6.5, textColor=INK3, leading=10, spaceAfter=2)
    ST["callout"] = s("callout", fontSize=7.5, textColor=INK, leading=12, spaceAfter=2)
    ST["cell"] = s("cell", fontSize=6.5, textColor=INK2, leading=10)
    ST["cell_head"] = s("cell_head", fontSize=5.5, textColor=GOLD3, fontName="Courier", leading=9)
    ST["cell_bold"] = s("cell_bold", fontSize=6.5, textColor=INK, leading=10)
    ST["kpi_value"] = s("kpi_value", fontSize=13, textColor=INK, alignment=TA_CENTER, leading=16)
    ST["kpi_label"] = s("kpi_label", fontName="Courier", fontSize=5, textColor=GOLD, alignment=TA_CENTER, leading=8)
    ST["kpi_unit"] = s("kpi_unit", fontSize=5.5, textColor=INK3, alignment=TA_CENTER, leading=8)
    ST["persp_label"] = s("persp_label", fontName="Courier", fontSize=5, textColor=GOLD, spaceAfter=1)
    ST["persp_body"] = s("persp_body", fontSize=6.5, textColor=INK2, leading=10, spaceAfter=1)
    ST["disclaimer"] = s("disclaimer", fontSize=5.5, textColor=PARCH4, leading=8)


def page_bg(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PARCH)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=True, stroke=False)
    canvas.setStrokeColor(GREEN3)
    canvas.setLineWidth(1.5)
    canvas.line(M, PAGE_H - 1.1*cm, PAGE_W - M, PAGE_H - 1.1*cm)
    canvas.line(M, 0.9*cm, PAGE_W - M, 0.9*cm)
    canvas.setFont("Courier", 5)
    canvas.setFillColor(PARCH4)
    canvas.drawCentredString(PAGE_W/2, 0.5*cm, "investment library  |  KEYENCE (6861) Integrated Report  |  Data as of FY2024 (estimates)")
    canvas.restoreState()


def make_radar(scores, labels, size=120):
    d = Drawing(size, size)
    cx, cy = size/2, size/2
    r_max = size/2 - 16
    n = len(scores)
    angles = [math.pi/2 + 2*math.pi*i/n for i in range(n)]
    for level in range(1, 6):
        r = r_max * level / 5
        points = []
        for a in angles:
            points.extend([cx + r*math.cos(a), cy + r*math.sin(a)])
        poly = Polygon(points)
        poly.strokeColor = PARCH3
        poly.strokeWidth = 0.3
        poly.fillColor = None
        d.add(poly)
    for a in angles:
        line = Line(cx, cy, cx + r_max*math.cos(a), cy + r_max*math.sin(a))
        line.strokeColor = PARCH3
        line.strokeWidth = 0.3
        d.add(line)
    data_points = []
    for i, sc in enumerate(scores):
        r = r_max * sc / 5
        data_points.extend([cx + r*math.cos(angles[i]), cy + r*math.sin(angles[i])])
    poly = Polygon(data_points)
    poly.fillColor = HexColor("#5a8a3a40")
    poly.fillOpacity = 0.2
    poly.strokeColor = GREEN3
    poly.strokeWidth = 1.5
    d.add(poly)
    for i, sc in enumerate(scores):
        r = r_max * sc / 5
        x = cx + r*math.cos(angles[i])
        y = cy + r*math.sin(angles[i])
        dot = Circle(x, y, 2.5)
        dot.fillColor = GREEN3
        dot.strokeColor = None
        d.add(dot)
    for i, label in enumerate(labels):
        r_label = r_max + 12
        x = cx + r_label*math.cos(angles[i])
        y = cy + r_label*math.sin(angles[i])
        s = String(x, y-2, label)
        s.fontName = "NotoSerifJP"
        s.fontSize = 5.5
        s.fillColor = INK3
        s.textAnchor = "middle"
        d.add(s)
    return d


def make_bar_chart(years, values, size_w=180, size_h=90):
    d = Drawing(size_w, size_h)
    n = len(values)
    max_val = max(values) * 1.15
    bar_w = size_w / (n * 2 + 1)
    mb = 14
    for i in range(5):
        y = mb + (size_h - mb) * i / 4
        line = Line(0, y, size_w, y)
        line.strokeColor = PARCH3
        line.strokeWidth = 0.3
        d.add(line)
    for i, (yr, val) in enumerate(zip(years, values)):
        x = bar_w * (2*i + 1)
        h = (size_h - mb) * val / max_val
        rect = Rect(x, mb, bar_w, h)
        rect.fillColor = GREEN3
        rect.strokeColor = GREEN2
        rect.strokeWidth = 0.5
        d.add(rect)
        sv = String(x + bar_w/2, mb + h + 2, str(val))
        sv.fontName = "Courier"
        sv.fontSize = 5
        sv.fillColor = INK3
        sv.textAnchor = "middle"
        d.add(sv)
        sy = String(x + bar_w/2, 2, yr)
        sy.fontName = "Courier"
        sy.fontSize = 5
        sy.fillColor = INK3
        sy.textAnchor = "middle"
        d.add(sy)
    return d


def gen_keyence_report():
    path = os.path.join(OUT_DIR, "keyence-integrated-report.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
        leftMargin=M, rightMargin=M, topMargin=1.5*cm, bottomMargin=1.3*cm)
    f = []

    # === HEADER ===
    f.append(Paragraph("TSE 6861  |  ELECTRONICS", ST["code"]))
    f.append(Paragraph("キーエンス", ST["title"]))
    f.append(Paragraph("KEYENCE CORPORATION", ST["title_en"]))
    f.append(Paragraph("直販 x ファブレス x コンサルティング営業 —— 世界最高水準の利益率を生む構造", ST["subtitle"]))
    f.append(HRFlowable(width="100%", thickness=0.5, color=GREEN3, spaceAfter=6, spaceBefore=3))

    # === KPI GRID (2x4) ===
    f.append(Paragraph("KEY METRICS", ST["sec_label"]))
    col_w = CW / 4
    kpi_rows = []
    kpis = [
        ("OP MARGIN", "55%", "製造業世界最高水準"),
        ("ROIC", "25%", "投下資本効率"),
        ("ROE", "20%", "無借金で高ROE"),
        ("FCF MARGIN", "40%", "圧倒的CF創出力"),
        ("DEBT", "0", "完全無借金経営"),
        ("OVERSEAS", "52%", "海外売上比率"),
        ("MKT CAP", "16兆", "日本製造業最大級"),
        ("EMPLOYEES", "1.1万", "少人数で巨大利益"),
    ]
    for row_start in (0, 4):
        row = []
        for i in range(4):
            k = kpis[row_start + i]
            row.append([
                Paragraph(k[0], ST["kpi_label"]),
                Paragraph(f"<b>{k[1]}</b>", ST["kpi_value"]),
                Paragraph(k[2], ST["kpi_unit"]),
            ])
        kpi_rows.append(row)

    t = Table(kpi_rows, colWidths=[col_w]*4, rowHeights=[38, 38])
    t.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.3, PARCH3),
        ("BACKGROUND", (0,0), (-1,-1), PARCH2),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("LEFTPADDING", (0,0), (-1,-1), 3),
        ("RIGHTPADDING", (0,0), (-1,-1), 3),
    ]))
    f.append(t)
    f.append(Spacer(1, 5))

    # === RADAR + FCF SIDE BY SIDE ===
    f.append(Paragraph("MOAT RADAR  &  FREE CASH FLOW (B JPY)", ST["sec_label"]))
    radar = make_radar(
        scores=[5, 4, 3, 2, 3, 3],
        labels=["SW Cost", "無形資産", "コスト優位", "NW効果", "効率的規模", "Toll Road"],
        size=120
    )
    fcf_chart = make_bar_chart(
        years=["19","20","21","22","23","24"],
        values=[168, 185, 290, 340, 380, 410],
        size_w=170, size_h=90
    )
    chart_table = Table([[radar, fcf_chart]], colWidths=[CW*0.42, CW*0.58])
    chart_table.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("ALIGN", (0,0), (0,0), "CENTER"),
        ("ALIGN", (1,0), (1,0), "CENTER"),
        ("BACKGROUND", (0,0), (-1,-1), PARCH2),
        ("BOX", (0,0), (-1,-1), 0.3, PARCH3),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    f.append(chart_table)
    f.append(Spacer(1, 5))

    # === INVESTMENT THESIS (callout) ===
    f.append(Paragraph("INVESTMENT THESIS", ST["sec_label"]))
    thesis = [[Paragraph(
        "世界中の工場ラインに組み込まれた静かなるインフラ企業。"
        "営業利益率55%の源泉は製品ではなく<b>販売モデル</b>。"
        "ファブレス経営で固定費を極限まで抑え、売上の大部分が自由現金として残る。"
        "moat最大の源泉はスイッチングコスト（5/5）。", ST["body"])]]
    tt = Table(thesis, colWidths=[CW])
    tt.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), PARCH2),
        ("BOX", (0,0), (-1,-1), 0.3, PARCH3),
        ("LINEBEFORE", (0,0), (0,-1), 2.5, GREEN3),
        ("LEFTPADDING", (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    f.append(tt)
    f.append(Spacer(1, 5))

    # === 4 PERSPECTIVES (compact) ===
    f.append(Paragraph("MULTIPLE PERSPECTIVES", ST["sec_label"]))
    perspectives = [
        ("A moat重視", GOLD, "直販体制が価格競争を回避。顧客の製造現場に入り込む構造が参入障壁"),
        ("B FCF重視", GOLD2, "驚異的なFCFマージン。設備投資が少なく、売上の大部分が自由現金"),
        ("C 経営重視", GREEN3, "創業者・滝崎武光の合理的経営文化。高給与と高い離職率の両面"),
        ("D 崩壊シナリオ", HexColor("#c05020"), "中国需要減速・為替リスク・直販の海外展開限界・競合技術進化"),
    ]
    persp_rows = []
    for label, color, text in perspectives:
        persp_rows.append([
            Paragraph(f"<font color='{color.hexval()}'>{label}</font>", ST["persp_label"]),
            Paragraph(text, ST["persp_body"]),
        ])
    pt = Table(persp_rows, colWidths=[CW*0.18, CW*0.82])
    pt.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.3, PARCH3),
        ("BACKGROUND", (0,0), (-1,-1), PARCH2),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("LEFTPADDING", (0,0), (-1,-1), 5),
    ]))
    f.append(pt)
    f.append(Spacer(1, 5))

    # === RISKS (compact table) ===
    f.append(Paragraph("RISKS TO MONITOR", ST["sec_label"]))
    risk_data = [
        [Paragraph("Risk", ST["cell_head"]), Paragraph("Content", ST["cell_head"]), Paragraph("Level", ST["cell_head"])],
        [Paragraph("中国依存", ST["cell_bold"]), Paragraph("主要市場。地政学・経済減速の直接影響", ST["cell"]), Paragraph("中", ST["cell"])],
        [Paragraph("技術転換", ST["cell_bold"]), Paragraph("AI・次世代センサーによる陳腐化（適応力は高い）", ST["cell"]), Paragraph("低〜中", ST["cell"])],
        [Paragraph("高PER", ST["cell_bold"]), Paragraph("優秀さは織り込み済み。購入価格が長期リターンを左右", ST["cell"]), Paragraph("高", ST["cell"])],
    ]
    rt = Table(risk_data, colWidths=[CW*0.16, CW*0.68, CW*0.16])
    rt.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), INK),
        ("TEXTCOLOR", (0,0), (-1,0), GOLD3),
        ("GRID", (0,0), (-1,-1), 0.3, PARCH3),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("LEFTPADDING", (0,0), (-1,-1), 4),
        ("BACKGROUND", (0,1), (-1,-1), PARCH2),
    ]))
    f.append(rt)
    f.append(Spacer(1, 4))

    # === DISCLAIMER ===
    f.append(Paragraph(
        "本レポートは情報提供を目的とし、投資助言ではありません。掲載データは概算・参考値です。投資判断は一次情報を確認の上、自己責任で行ってください。",
        ST["disclaimer"]))

    doc.build(f, onFirstPage=page_bg, onLaterPages=page_bg)
    print(f"  OK: {path}")


if __name__ == "__main__":
    init_styles()
    print("Generating Keyence Integrated Report (1-page)...")
    gen_keyence_report()
    print("Done!")
