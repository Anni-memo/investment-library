"""
個人憲法セクション PDF生成スクリプト（5ファイル・7ページ）
書庫テーマ（パーチメント＋ゴールド）でA4全面使い切り
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Circle

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
GOLD4 = HexColor("#f0cc55")

# === Font ===
FONT_DIR = "C:/Windows/Fonts"
pdfmetrics.registerFont(TTFont("NotoSerifJP", os.path.join(FONT_DIR, "NotoSerifJP-VF.ttf")))

# === Page ===
PAGE_W, PAGE_H = A4
M = 2.0 * cm
CW = PAGE_W - 2 * M

# === Output dir ===
OUT_DIR = os.path.dirname(__file__)

# === Styles ===
def s(name, **kw):
    defaults = {"fontName": "NotoSerifJP", "textColor": INK2, "leading": 18}
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)

ST = {}
def init_styles():
    ST["shelf"] = s("shelf", fontName="Courier", fontSize=7, textColor=GOLD3, alignment=TA_CENTER, spaceAfter=2)
    ST["title"] = s("title", fontSize=20, textColor=INK, alignment=TA_CENTER, leading=30, spaceAfter=4)
    ST["subtitle"] = s("subtitle", fontSize=11, textColor=INK3, alignment=TA_CENTER, leading=18, spaceAfter=16)
    ST["section_label"] = s("section_label", fontName="Courier", fontSize=6.5, textColor=GOLD, spaceAfter=4)
    ST["section_title"] = s("section_title", fontSize=13, textColor=INK, leading=22, spaceAfter=8)
    ST["body"] = s("body", fontSize=9.5, textColor=INK2, leading=18, spaceAfter=8)
    ST["body_small"] = s("body_small", fontSize=8.5, textColor=INK3, leading=16, spaceAfter=6)
    ST["quote"] = s("quote", fontSize=10, textColor=INK, leading=18, spaceAfter=4, leftIndent=12)
    ST["quote_src"] = s("quote_src", fontName="Courier", fontSize=6.5, textColor=GOLD, spaceAfter=12, leftIndent=12)
    ST["bullet"] = s("bullet", fontSize=9, textColor=INK2, leading=17, spaceAfter=4, leftIndent=14, firstLineIndent=-10)
    ST["label"] = s("label", fontName="Courier", fontSize=6, textColor=GOLD3, spaceAfter=2)
    ST["memo_label"] = s("memo_label", fontName="Courier", fontSize=7, textColor=GOLD, spaceAfter=6)
    ST["footer"] = s("footer", fontName="Courier", fontSize=6, textColor=PARCH4, alignment=TA_CENTER)
    ST["cell"] = s("cell", fontSize=8.5, textColor=INK2, leading=14)
    ST["cell_head"] = s("cell_head", fontSize=7, textColor=GOLD3, fontName="Courier", leading=12)
    ST["cell_num"] = s("cell_num", fontSize=7, textColor=INK3, alignment=TA_CENTER, leading=12)
    ST["ws_prompt"] = s("ws_prompt", fontSize=10, textColor=INK, leading=20, spaceAfter=4)
    ST["ws_line"] = s("ws_line", fontSize=9, textColor=PARCH3, leading=26, spaceAfter=0)


def gold_line():
    return HRFlowable(width="100%", thickness=0.5, color=GOLD3, spaceAfter=12, spaceBefore=8)

def thin_line():
    return HRFlowable(width="100%", thickness=0.3, color=PARCH3, spaceAfter=8, spaceBefore=4)

def memo_area(lines=6):
    """メモ用罫線エリア"""
    elements = [Paragraph("MEMO", ST["memo_label"])]
    for _ in range(lines):
        elements.append(HRFlowable(width="100%", thickness=0.3, color=PARCH3, spaceAfter=14, spaceBefore=0))
    return elements

def page_bg(canvas, doc):
    """A4全面パーチメント背景"""
    canvas.saveState()
    canvas.setFillColor(PARCH)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=True, stroke=False)
    # Top gold line
    canvas.setStrokeColor(GOLD3)
    canvas.setLineWidth(2)
    canvas.line(M, PAGE_H - 1.4*cm, PAGE_W - M, PAGE_H - 1.4*cm)
    # Bottom gold line
    canvas.line(M, 1.2*cm, PAGE_W - M, 1.2*cm)
    # Footer
    canvas.setFont("Courier", 6)
    canvas.setFillColor(PARCH4)
    canvas.drawCentredString(PAGE_W/2, 0.7*cm, "investmentlibrary  |  SHELF 00 — FOUNDATION")
    canvas.restoreState()


# ═══════════════════════════════════════════════
# PDF 1: インスピレーションシート
# ═══════════════════════════════════════════════
def gen_inspiration():
    path = os.path.join(OUT_DIR, "foundation-inspiration-sheet.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
        leftMargin=M, rightMargin=M, topMargin=2.0*cm, bottomMargin=1.8*cm)
    f = []
    f.append(Paragraph("SHELF 00 — FOUNDATION", ST["shelf"]))
    f.append(Paragraph("あなたはなぜここにいるのか？", ST["title"]))
    f.append(Paragraph("Inspiration Sheet — 個人憲法を書く前に", ST["subtitle"]))
    f.append(gold_line())

    f.append(Paragraph("01 — DRUCKER'S QUESTION", ST["section_label"]))
    f.append(Paragraph("ドラッカーの問い", ST["section_title"]))
    f.append(Paragraph("<i>「何によって憶えられたいか？」</i>", ST["quote"]))
    f.append(Paragraph("PETER F. DRUCKER", ST["quote_src"]))
    f.append(Paragraph("5分間、思いつくまま書いてみよう。正解はない。", ST["body"]))
    f.extend(memo_area(5))

    f.append(Spacer(1, 8))
    f.append(Paragraph("02 — BUFFETT'S TRUTH", ST["section_label"]))
    f.append(Paragraph("バフェットの真理", ST["section_title"]))
    f.append(Paragraph("<i>「最も大切な投資先は、自分自身だ。」</i>", ST["quote"]))
    f.append(Paragraph("WARREN BUFFETT", ST["quote_src"]))
    f.append(Paragraph("あなたの「自己投資」とは何か？ 3つ書いてみよう。", ST["body"]))
    f.extend(memo_area(4))

    f.append(Spacer(1, 8))
    f.append(Paragraph("03 — 80TH BIRTHDAY", ST["section_label"]))
    f.append(Paragraph("80歳の誕生日", ST["section_title"]))
    f.append(Paragraph("大切な人たちが集まっている。彼らにどんなスピーチを贈られたいか？", ST["body"]))
    f.extend(memo_area(5))

    doc.build(f, onFirstPage=page_bg, onLaterPages=page_bg)
    print(f"  OK: {path}")


# ═══════════════════════════════════════════════
# PDF 2: 脳科学まとめシート
# ═══════════════════════════════════════════════
def gen_brain_summary():
    path = os.path.join(OUT_DIR, "foundation-brain-summary.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
        leftMargin=M, rightMargin=M, topMargin=2.0*cm, bottomMargin=1.8*cm)
    f = []
    f.append(Paragraph("SHELF 00 — FOUNDATION", ST["shelf"]))
    f.append(Paragraph("脳科学まとめ", ST["title"]))
    f.append(Paragraph("RAS・アファメーション・習慣形成の科学的根拠", ST["subtitle"]))
    f.append(gold_line())

    # RAS
    f.append(Paragraph("01 — RAS (RETICULAR ACTIVATING SYSTEM)", ST["section_label"]))
    f.append(Paragraph("網様体賦活系 — 脳の情報フィルター", ST["section_title"]))
    f.append(Paragraph("意識: 40 bit/秒　|　無意識: 1,100万 bit/秒（Wilson, 2002）", ST["body"]))
    f.append(Paragraph("RASは「今の自分に重要な情報」だけを意識に上げる選択的注意のメカニズム。\n個人憲法を毎朝読むことで、RASのフィルター設定を意図的にプログラムできる。", ST["body_small"]))
    f.append(thin_line())

    # Affirmation
    f.append(Paragraph("02 — AFFIRMATION NEUROSCIENCE", ST["section_label"]))
    f.append(Paragraph("アファメーションの脳活動", ST["section_title"]))
    tdata = [
        [Paragraph("脳領域", ST["cell_head"]), Paragraph("機能", ST["cell_head"]), Paragraph("効果", ST["cell_head"])],
        [Paragraph("腹側線条体", ST["cell"]), Paragraph("報酬・動機づけ", ST["cell"]), Paragraph("自己肯定が「報酬」として処理", ST["cell"])],
        [Paragraph("内側前頭前皮質", ST["cell"]), Paragraph("自己参照処理", ST["cell"]), Paragraph("「自分ごと」として深く処理", ST["cell"])],
        [Paragraph("前部島皮質", ST["cell"]), Paragraph("脅威処理の低下", ST["cell"]), Paragraph("ストレス耐性が向上", ST["cell"])],
    ]
    t = Table(tdata, colWidths=[CW*0.28, CW*0.30, CW*0.42])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), PARCH2),
        ("GRID", (0,0), (-1,-1), 0.3, PARCH3),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
    ]))
    f.append(t)
    f.append(Spacer(1, 4))
    f.append(Paragraph("出典: Cascio et al. 2016 (PMC4814782), Dutcher et al. 2020", ST["body_small"]))
    f.append(thin_line())

    # 66 days
    f.append(Paragraph("03 — HABIT FORMATION", ST["section_label"]))
    f.append(Paragraph("66日の習慣化", ST["section_title"]))
    f.append(Paragraph("• 習慣が「自動的」になるまで: 平均 <b>66日</b>（範囲 18〜254日）", ST["bullet"]))
    f.append(Paragraph("• 1〜2日のミスは統計的に影響なし", ST["bullet"]))
    f.append(Paragraph("• 意志力より<b>環境設計</b>が重要", ST["bullet"]))
    f.append(Paragraph("出典: Lally et al. UCL 2009", ST["body_small"]))
    f.append(thin_line())

    # Matthews
    f.append(Paragraph("04 — WRITING POWER", ST["section_label"]))
    f.append(Paragraph("書くだけで2倍", ST["section_title"]))
    f.append(Paragraph("• 考えるだけ: 35%　→　書き出す: 46%　→　+行動計画: 55%　→　+共有+報告: <b>70%</b>", ST["bullet"]))
    f.append(Paragraph("出典: Gail Matthews, Dominican University", ST["body_small"]))
    f.append(thin_line())

    f.append(Spacer(1, 6))
    f.append(Paragraph("KEY TAKEAWAY", ST["section_label"]))
    f.append(Paragraph("個人憲法を<b>書き</b>、毎朝<b>声に出して読み</b>、<b>66日間</b>続ける。\nこの3ステップが、RASをプログラムし、脳の報酬系を活性化し、行動を自動化する。", ST["body"]))

    f.extend(memo_area(3))

    doc.build(f, onFirstPage=page_bg, onLaterPages=page_bg)
    print(f"  OK: {path}")


# ═══════════════════════════════════════════════
# PDF 3: ワークシート4枚セット
# ═══════════════════════════════════════════════
def gen_worksheets():
    path = os.path.join(OUT_DIR, "foundation-worksheet-set.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
        leftMargin=M, rightMargin=M, topMargin=2.0*cm, bottomMargin=1.8*cm)
    f = []

    # --- Sheet 1: 棚卸し ---
    f.append(Paragraph("WORKSHEET 1 / 4", ST["shelf"]))
    f.append(Paragraph("STEP 1 — 棚卸し", ST["title"]))
    f.append(gold_line())

    f.append(Paragraph("A. ドラッカーの問い", ST["section_title"]))
    f.append(Paragraph("「何によって憶えられたいか？」 — 5分間、思いつくまま書く。", ST["body"]))
    f.extend(memo_area(4))

    f.append(Paragraph("B. 80歳バースデースピーチ — 3人分想像して書く", ST["section_title"]))
    f.extend(memo_area(4))

    f.append(Paragraph("C. 役割マトリクス（10点満点で満足度をつける）", ST["section_title"]))
    roles = [
        [Paragraph("役割", ST["cell_head"]), Paragraph("満足度", ST["cell_head"]), Paragraph("理想の姿", ST["cell_head"])],
    ]
    for r in ["父 / 母", "投資家", "学習者", "パートナー", "友人", "市民 / 社会人", "創造者", "　"]:
        roles.append([Paragraph(r, ST["cell"]), Paragraph("　/10", ST["cell_num"]), Paragraph("", ST["cell"])])
    t = Table(roles, colWidths=[CW*0.25, CW*0.15, CW*0.60])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), PARCH2),
        ("GRID", (0,0), (-1,-1), 0.3, PARCH3),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ]))
    f.append(t)

    f.append(PageBreak())

    # --- Sheet 2: 起草 ---
    f.append(Paragraph("WORKSHEET 2 / 4", ST["shelf"]))
    f.append(Paragraph("STEP 2 — 起草", ST["title"]))
    f.append(gold_line())
    f.append(Paragraph("「私は〜する人間だ」の形式で、5〜7条を書く。1分以内に読める量。", ST["body"]))
    f.append(Spacer(1, 8))
    for i in range(1, 8):
        f.append(Paragraph(f"第{i}条", ST["label"]))
        f.append(HRFlowable(width="100%", thickness=0.3, color=PARCH3, spaceAfter=6))
        f.append(HRFlowable(width="100%", thickness=0.3, color=PARCH3, spaceAfter=16))

    f.append(Spacer(1, 8))
    f.append(Paragraph("NG CHECK", ST["section_label"]))
    f.append(Paragraph("□ 抽象的すぎないか（「良い人になる」→ NG）", ST["bullet"]))
    f.append(Paragraph("□ 否定形ではないか（「怒らない」→「穏やかに対話する」に変換）", ST["bullet"]))
    f.append(Paragraph("□ 7条以内に収まっているか", ST["bullet"]))
    f.append(Paragraph("□ 声に出して1分以内に読めるか", ST["bullet"]))

    f.append(PageBreak())

    # --- Sheet 3: アファメーション変換 ---
    f.append(Paragraph("WORKSHEET 3 / 4", ST["shelf"]))
    f.append(Paragraph("STEP 3 — アファメーション変換", ST["title"]))
    f.append(gold_line())

    f.append(Paragraph("3つのルールに従って、条文をアファメーション形式に変換する。", ST["body"]))
    f.append(Paragraph("① 現在形で書く（「〜したい」→「私は〜だ」）", ST["bullet"]))
    f.append(Paragraph("② 感情ワードを含める（誇り・喜び・感謝）", ST["bullet"]))
    f.append(Paragraph("③ 1分朗読テスト（胸が熱くなるか？）", ST["bullet"]))
    f.append(Spacer(1, 12))

    conv = [
        [Paragraph("変換前（STEP 2の条文）", ST["cell_head"]), Paragraph("変換後（アファメーション形式）", ST["cell_head"])],
    ]
    for _ in range(7):
        conv.append([Paragraph("", ST["cell"]), Paragraph("", ST["cell"])])
    t = Table(conv, colWidths=[CW*0.45, CW*0.55], rowHeights=[20] + [36]*7)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), PARCH2),
        ("GRID", (0,0), (-1,-1), 0.3, PARCH3),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    f.append(t)

    f.append(Spacer(1, 16))
    f.append(Paragraph("1分朗読テスト結果", ST["section_label"]))
    f.append(Paragraph("□ 全条文を声に出して読んだ　□ 1分以内だった　□ 胸が熱くなった", ST["body"]))
    f.extend(memo_area(3))

    f.append(PageBreak())

    # --- Sheet 4: 実践計画 ---
    f.append(Paragraph("WORKSHEET 4 / 4", ST["shelf"]))
    f.append(Paragraph("STEP 4 — 実践計画", ST["title"]))
    f.append(gold_line())

    f.append(Paragraph("66日チャレンジ開始日: _______ 年 _____ 月 _____ 日", ST["body"]))
    f.append(Paragraph("66日目（目標日）: _______ 年 _____ 月 _____ 日", ST["body"]))
    f.append(Spacer(1, 8))

    f.append(Paragraph("DAILY ROUTINE", ST["section_label"]))
    f.append(Paragraph("毎朝のルーティン（SAVERSに組み込む場合の時間配分）", ST["section_title"]))
    routine = [
        [Paragraph("S", ST["cell_head"]), Paragraph("Silence（瞑想）", ST["cell"]), Paragraph("　　分", ST["cell"])],
        [Paragraph("A", ST["cell_head"]), Paragraph("Affirmation（個人憲法朗読）", ST["cell"]), Paragraph("　　分", ST["cell"])],
        [Paragraph("V", ST["cell_head"]), Paragraph("Visualization（視覚化）", ST["cell"]), Paragraph("　　分", ST["cell"])],
        [Paragraph("E", ST["cell_head"]), Paragraph("Exercise（運動）", ST["cell"]), Paragraph("　　分", ST["cell"])],
        [Paragraph("R", ST["cell_head"]), Paragraph("Reading（読書）", ST["cell"]), Paragraph("　　分", ST["cell"])],
        [Paragraph("S", ST["cell_head"]), Paragraph("Scribing（ジャーナリング）", ST["cell"]), Paragraph("　　分", ST["cell"])],
    ]
    t = Table(routine, colWidths=[CW*0.08, CW*0.65, CW*0.27])
    t.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.3, PARCH3),
        ("BACKGROUND", (0,0), (0,-1), PARCH2),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ]))
    f.append(t)
    f.append(Spacer(1, 12))

    f.append(Paragraph("FEAR SETTING", ST["section_label"]))
    f.append(Paragraph("個人憲法を持たないまま5年過ごしたら？", ST["section_title"]))
    f.extend(memo_area(4))

    f.append(Paragraph("QUARTERLY REVIEW DATES", ST["section_label"]))
    f.append(Paragraph("Q1: ___/___　　Q2: ___/___　　Q3: ___/___　　Q4: ___/___", ST["body"]))

    doc.build(f, onFirstPage=page_bg, onLaterPages=page_bg)
    print(f"  OK: {path}")


# ═══════════════════════════════════════════════
# PDF 4: 66日チャレンジカレンダー
# ═══════════════════════════════════════════════
def gen_66day_calendar():
    path = os.path.join(OUT_DIR, "foundation-66day-calendar.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
        leftMargin=M, rightMargin=M, topMargin=2.0*cm, bottomMargin=1.8*cm)
    f = []
    f.append(Paragraph("SHELF 00 — FOUNDATION", ST["shelf"]))
    f.append(Paragraph("66日チャレンジカレンダー", ST["title"]))
    f.append(Paragraph("毎朝、個人憲法を声に出して読んだら ✓ をつける", ST["subtitle"]))
    f.append(gold_line())

    f.append(Paragraph("開始日: _______ 年 _____ 月 _____ 日", ST["body"]))
    f.append(Spacer(1, 8))

    # 66日を11行×6列のグリッドで
    rows = []
    header = []
    for c in range(6):
        header.append(Paragraph(f"", ST["cell_head"]))

    day = 1
    for r in range(11):
        row = []
        for c in range(6):
            if day <= 66:
                row.append(Paragraph(f"Day {day}\n□", ST["cell_num"]))
                day += 1
            else:
                row.append(Paragraph("", ST["cell"]))
        rows.append(row)

    col_w = CW / 6
    t = Table(rows, colWidths=[col_w]*6, rowHeights=[32]*11)
    t.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.3, PARCH3),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        # Day 21 highlight
        ("BACKGROUND", (2,3), (2,3), HexColor("#efe4d0")),
        # Day 42 highlight
        ("BACKGROUND", (5,6), (5,6), HexColor("#efe4d0")),
        # Day 66 highlight (last cell)
        ("BACKGROUND", (5,10), (5,10), HexColor("#d4aa22")),
        ("TEXTCOLOR", (5,10), (5,10), HexColor("#f5ede0")),
    ]))
    f.append(t)
    f.append(Spacer(1, 8))

    f.append(Paragraph("MILESTONES", ST["section_label"]))
    f.append(Paragraph("• Day 21: 最初の壁を超えた。ここまで来れば3分の1。", ST["bullet"]))
    f.append(Paragraph("• Day 42: 折り返し。脳が新しいパターンを受け入れ始める。", ST["bullet"]))
    f.append(Paragraph("• Day 66: 習慣が「自動的」になる平均日数（Lally, UCL 2009）。", ST["bullet"]))
    f.append(Spacer(1, 4))
    f.append(Paragraph("1〜2日のミスは問題ない。統計的に影響しない。大切なのは「やめないこと」。", ST["body_small"]))

    doc.build(f, onFirstPage=page_bg, onLaterPages=page_bg)
    print(f"  OK: {path}")


# ═══════════════════════════════════════════════
# PDF 5: 四半期改訂チェックリスト
# ═══════════════════════════════════════════════
def gen_quarterly_checklist():
    path = os.path.join(OUT_DIR, "foundation-quarterly-checklist.pdf")
    doc = SimpleDocTemplate(path, pagesize=A4,
        leftMargin=M, rightMargin=M, topMargin=2.0*cm, bottomMargin=1.8*cm)
    f = []
    f.append(Paragraph("SHELF 00 — FOUNDATION", ST["shelf"]))
    f.append(Paragraph("四半期改訂チェックリスト", ST["title"]))
    f.append(Paragraph("3ヶ月ごとに個人憲法を見直す — 投資方針書と同じように", ST["subtitle"]))
    f.append(gold_line())

    f.append(Paragraph("改訂日: _______ 年 _____ 月 _____ 日　　（Q1 / Q2 / Q3 / Q4）", ST["body"]))
    f.append(Spacer(1, 8))

    f.append(Paragraph("01 — REVIEW", ST["section_label"]))
    f.append(Paragraph("振り返り", ST["section_title"]))
    f.append(Paragraph("この3ヶ月で最も誇れる行動は？", ST["ws_prompt"]))
    f.extend(memo_area(3))

    f.append(Paragraph("条文と実生活の乖離はどこにあったか？", ST["ws_prompt"]))
    f.extend(memo_area(3))

    f.append(thin_line())

    f.append(Paragraph("02 — REVISE", ST["section_label"]))
    f.append(Paragraph("改訂", ST["section_title"]))
    f.append(Paragraph("各条文をチェック（✓=維持 / △=修正 / ×=削除）", ST["body"]))
    rev = [
        [Paragraph("条文", ST["cell_head"]), Paragraph("判定", ST["cell_head"]), Paragraph("修正内容・理由", ST["cell_head"])],
    ]
    for i in range(1, 8):
        rev.append([Paragraph(f"第{i}条", ST["cell"]), Paragraph("", ST["cell_num"]), Paragraph("", ST["cell"])])
    t = Table(rev, colWidths=[CW*0.15, CW*0.12, CW*0.73], rowHeights=[18] + [28]*7)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), PARCH2),
        ("GRID", (0,0), (-1,-1), 0.3, PARCH3),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
    ]))
    f.append(t)
    f.append(Spacer(1, 8))

    f.append(thin_line())
    f.append(Paragraph("03 — FOCUS", ST["section_label"]))
    f.append(Paragraph("次の3ヶ月のフォーカス", ST["section_title"]))
    f.append(Paragraph("次の四半期で最も注力する条文は？", ST["ws_prompt"]))
    f.extend(memo_area(2))

    f.append(Paragraph("DELETE CHECK", ST["section_label"]))
    f.append(Paragraph("□ 3ヶ月読んでも心が動かない条文はないか", ST["bullet"]))
    f.append(Paragraph("□ 人生のフェーズが変わった条文はないか", ST["bullet"]))
    f.append(Paragraph("□ より正確な表現が見つかった条文はないか", ST["bullet"]))

    doc.build(f, onFirstPage=page_bg, onLaterPages=page_bg)
    print(f"  OK: {path}")


# ═══════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════
if __name__ == "__main__":
    init_styles()
    print("Generating Foundation PDFs...")
    gen_inspiration()
    gen_brain_summary()
    gen_worksheets()
    gen_66day_calendar()
    gen_quarterly_checklist()
    print("Done! 5 files (7 pages) generated.")
