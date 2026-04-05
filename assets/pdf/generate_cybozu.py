"""
サイボウズ統合レポートPDF（1ページ）
KPI・moatレーダー・FCF推移・AI破壊分析・リスクをA4 1枚に凝縮
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
ACCENT = HexColor("#4888d0")  # サイボウズ青系
ACCENT2 = HexColor("#2a5a9a")
ACCENT3 = HexColor("#1a3a6a")

# === Font ===
FONT_DIR = "C:/Windows/Fonts"
pdfmetrics.registerFont(TTFont("NotoSerifJP", os.path.join(FONT_DIR, "NotoSerifJP-VF.ttf")))

# === Page ===
PAGE_W, PAGE_H = A4
M = 1.5 * cm
CW = PAGE_W - 2 * M

OUT_DIR = os.path.dirname(__file__)

def s(name, **kw):
    defaults = {"fontName": "NotoSerifJP", "textColor": INK2, "leading": 12}
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)

ST = {}
def init_styles():
    ST["title"] = s("title", fontSize=16, textColor=INK, alignment=TA_CENTER, leading=20, spaceAfter=0)
    ST["title_en"] = s("title_en", fontName="Courier", fontSize=7, textColor=ACCENT, alignment=TA_CENTER, leading=10, spaceAfter=2)
    ST["code"] = s("code", fontName="Courier", fontSize=6, textColor=ACCENT, alignment=TA_CENTER, spaceAfter=3)
    ST["subtitle"] = s("subtitle", fontSize=7.5, textColor=INK3, alignment=TA_CENTER, leading=12, spaceAfter=6)
    ST["sec_label"] = s("sec_label", fontName="Courier", fontSize=5.5, textColor=GOLD, spaceAfter=2)
    ST["body"] = s("body", fontSize=7.5, textColor=INK2, leading=12, spaceAfter=3)
    ST["body_xs"] = s("body_xs", fontSize=6.5, textColor=INK3, leading=10, spaceAfter=2)
    ST["cell"] = s("cell", fontSize=6.5, textColor=INK2, leading=10)
    ST["cell_head"] = s("cell_head", fontSize=5.5, textColor=GOLD3, fontName="Courier", leading=9)
    ST["cell_bold"] = s("cell_bold", fontSize=6.5, textColor=INK, leading=10)
    ST["kpi_value"] = s("kpi_value", fontSize=13, textColor=INK, alignment=TA_CENTER, leading=16)
    ST["kpi_label"] = s("kpi_label", fontName="Courier", fontSize=5, textColor=GOLD, alignment=TA_CENTER, leading=8)
    ST["kpi_unit"] = s("kpi_unit", fontSize=5.5, textColor=INK3, alignment=TA_CENTER, leading=8)
    ST["phase_label"] = s("phase_label", fontName="Courier", fontSize=5, textColor=GOLD3, leading=8)
    ST["phase_body"] = s("phase_body", fontSize=6.5, textColor=INK2, leading=10)
    ST["disclaimer"] = s("disclaimer", fontSize=5.5, textColor=PARCH4, leading=8)


def page_bg(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PARCH)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=True, stroke=False)
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.5)
    canvas.line(M, PAGE_H - 1.1*cm, PAGE_W - M, PAGE_H - 1.1*cm)
    canvas.line(M, 0.9*cm, PAGE_W - M, 0.9*cm)
    canvas.setFont("Courier", 5)
    canvas.setFillColor(PARCH4)
    canvas.drawCentredString(PAGE_W/2, 0.5*cm, "investment library  |  CYBOZU (4776) Integrated Report  |  Data as of FY2024 (estimates)")
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
    poly.fillColor = HexColor("#4888d040")
    poly.fillOpacity = 0.2
    poly.strokeColor = ACCENT
    poly.strokeWidth = 1.5
    d.add(poly)
    for i, sc in enumerate(scores):
        r = r_max * sc / 5
        x = cx + r*math.cos(angles[i])
        y = cy + r*math.sin(angles[i])
        dot = Circle(x, y, 2.5)
        dot.fillColor = ACCENT
        dot.strokeColor = None
        d.add(dot)
    for i, label in enumerate(labels):
        r_label = r_max + 12
        x = cx + r_label*math.cos(angles[i])
        y = cy + r_label*math.sin(angles[i])
        st = String(x, y-2, label)
        st.fontName = "NotoSerifJP"
        st.fontSize = 5.5
        st.fillColor = INK3
        st.textAnchor = "middle"
        d.add(st)
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
        rect.fillColor = ACCENT
        rect.strokeColor = ACCENT2
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


def gen_cybozu_report():
    path = os.path.join(OUT_DIR, "cybozu-integrated-report.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
        leftMargin=M, rightMargin=M, topMargin=1.5*cm, bottomMargin=1.3*cm)
    f = []

    # === HEADER ===
    f.append(Paragraph("TSE 4776  |  IT & TELECOM", ST["code"]))
    f.append(Paragraph("サイボウズ", ST["title"]))
    f.append(Paragraph("CYBOZU, INC.", ST["title_en"]))
    f.append(Paragraph("kintone x チームワーク経営 x SaaS —— ノーコードの堀とAI時代のリスク", ST["subtitle"]))
    f.append(HRFlowable(width="100%", thickness=0.5, color=ACCENT, spaceAfter=6, spaceBefore=3))

    # === KPI GRID (2x4) ===
    f.append(Paragraph("KEY METRICS", ST["sec_label"]))
    col_w = CW / 4
    kpis = [
        ("REVENUE", "260億", "FY2024概算"),
        ("KINTONE", "3万社+", "契約社数"),
        ("GROWTH", "10-15%", "年率売上成長"),
        ("OVERSEAS", "10%", "海外比率・拡大中"),
        ("SW COST", "5/5", "moat最高評価"),
        ("NW EFFECT", "4/5", "パートナー網"),
        ("BRAND", "4/5", "社名=製品の認知"),
        ("TOLL ROAD", "3/5", "SaaS継続課金"),
    ]
    kpi_rows = []
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

    # === RADAR + FCF ===
    f.append(Paragraph("MOAT RADAR  &  FCF TREND (B JPY, est.)", ST["sec_label"]))
    radar = make_radar(
        scores=[4, 4, 5, 3, 3, 3],
        labels=["ブランド", "NW効果", "SW Cost", "Toll Road", "効率的規模", "コスト優位"],
        size=120
    )
    fcf_chart = make_bar_chart(
        years=["19","20","21","22","23","24"],
        values=[8, 12, 18, 25, 30, 38],
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

    # === INVESTMENT THESIS ===
    f.append(Paragraph("INVESTMENT THESIS", ST["sec_label"]))
    thesis = [[Paragraph(
        "kintoneを軸としたSaaSグループウェア企業。moatの核心は<b>スイッチングコスト（5/5）</b>。"
        "業務アプリ・データ・ワークフローが深く組み込まれ、移行は極めて困難。"
        "「100人100通りの働き方」が採用ブランドとして機能し、国内グループウェア市場トップシェアを維持。"
        "SaaS転換後の安定した継続課金モデルが成長の礎。", ST["body"])]]
    tt = Table(thesis, colWidths=[CW])
    tt.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), PARCH2),
        ("BOX", (0,0), (-1,-1), 0.3, PARCH3),
        ("LINEBEFORE", (0,0), (0,-1), 2.5, ACCENT),
        ("LEFTPADDING", (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    f.append(tt)
    f.append(Spacer(1, 5))

    # === AI DISRUPTION TIMELINE ===
    f.append(Paragraph("AI DISRUPTION SCENARIO", ST["sec_label"]))
    phases = [
        ("PHASE 1  ~2027", HexColor("#2a4a1a"),
         "共存期: AIがkintoneを強化。アプリ生成・データ分析が自動化。顧客満足度向上、解約率安定"),
        ("PHASE 2  2027-29", GOLD,
         "分岐期: 「AIに直接作らせた方が速い」と気づく層出現。新規契約鈍化。成長の天井が意識される"),
        ("PHASE 3  2029-31", INK2,
         "淘汰か転換か: AIがUI・DB・WFを都度生成。「中間層」としてのkintoneの存在意義が問われる"),
    ]
    phase_rows = []
    for label, color, text in phases:
        phase_rows.append([
            Paragraph(f"<font color='{color.hexval()}'>{label}</font>", ST["phase_label"]),
            Paragraph(text, ST["phase_body"]),
        ])
    pht = Table(phase_rows, colWidths=[CW*0.22, CW*0.78])
    pht.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.3, PARCH3),
        ("BACKGROUND", (0,0), (-1,-1), PARCH2),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("LEFTPADDING", (0,0), (-1,-1), 5),
    ]))
    f.append(pht)
    f.append(Spacer(1, 5))

    # === RISKS ===
    f.append(Paragraph("RISKS TO MONITOR", ST["sec_label"]))
    risk_data = [
        [Paragraph("Risk", ST["cell_head"]), Paragraph("Content", ST["cell_head"]), Paragraph("Level", ST["cell_head"])],
        [Paragraph("競合激化", ST["cell_bold"]),
         Paragraph("Power Apps・Salesforce・Notionなど大手参入。大企業セグメントで競争激化", ST["cell"]),
         Paragraph("高", ST["cell"])],
        [Paragraph("成長鈍化", ST["cell_bold"]),
         Paragraph("国内GW市場成熟化。海外展開の成否が中長期の成長を左右", ST["cell"]),
         Paragraph("中", ST["cell"])],
        [Paragraph("人材依存", ST["cell_bold"]),
         Paragraph("青野社長のリーダーシップ依存。エンジニア確保の競争激化", ST["cell"]),
         Paragraph("中", ST["cell"])],
        [Paragraph("AI破壊", ST["cell_bold"]),
         Paragraph("ノーコードの存在意義がAIに飲み込まれるリスク。Phase 3で顕在化", ST["cell"]),
         Paragraph("高(長期)", ST["cell"])],
    ]
    rt = Table(risk_data, colWidths=[CW*0.14, CW*0.68, CW*0.18])
    rt.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), ACCENT3),
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

    f.append(Paragraph(
        "本レポートは情報提供を目的とし、投資助言ではありません。掲載データは概算・参考値です。投資判断は一次情報を確認の上、自己責任で行ってください。",
        ST["disclaimer"]))

    doc.build(f, onFirstPage=page_bg, onLaterPages=page_bg)
    print(f"  OK: {path}")


if __name__ == "__main__":
    init_styles()
    print("Generating Cybozu Integrated Report (1-page)...")
    gen_cybozu_report()
    print("Done!")
