"""
Claude Code チートシート PDF（1ページ）
全コマンド・Tips・ショートカットをA4 1枚に凝縮
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
from reportlab.graphics.shapes import Drawing, Rect, String, Line

# === Colors ===
INK = HexColor("#0a0a14")
INK2 = HexColor("#1a1832")
INK3 = HexColor("#3a3558")
PARCH = HexColor("#f5ede0")
PARCH2 = HexColor("#efe4d0")
PARCH3 = HexColor("#e8d8be")
PARCH4 = HexColor("#dfc9a8")
GOLD = HexColor("#8b6914")
GOLD2 = HexColor("#b8900a")
GOLD3 = HexColor("#d4aa22")
PURPLE = HexColor("#6a3d8a")
PURPLE2 = HexColor("#9b59b6")
WHITE = HexColor("#f5f0e8")

# === Font ===
FONT_DIR = "C:/Windows/Fonts"
pdfmetrics.registerFont(TTFont("NotoSerifJP", os.path.join(FONT_DIR, "NotoSerifJP-VF.ttf")))

# === Page ===
PAGE_W, PAGE_H = A4
M = 1.2 * cm
CW = PAGE_W - 2 * M

# === Output dir ===
OUT_DIR = os.path.dirname(__file__)

# === Styles ===
def s(name, **kw):
    defaults = {"fontName": "NotoSerifJP", "textColor": INK, "leading": 10}
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)

sCode = s("code", fontSize=5.5, textColor=PURPLE2, leading=8)
sTitle = s("title", fontSize=16, textColor=INK, leading=20, alignment=TA_CENTER)
sSub = s("sub", fontSize=6.5, textColor=INK3, leading=9, alignment=TA_CENTER)
sH2 = s("h2", fontSize=7.5, textColor=PURPLE, leading=10, spaceBefore=2, spaceAfter=1)
sBody = s("body", fontSize=5.8, textColor=INK2, leading=8.5)
sCmd = s("cmd", fontSize=5.5, textColor=INK, leading=7.5)
sDesc = s("desc", fontSize=5.2, textColor=INK3, leading=7.5)
sSmall = s("small", fontSize=4.5, textColor=INK3, leading=6.5)
sFooter = s("footer", fontSize=4, textColor=PARCH4, leading=6, alignment=TA_CENTER)

def build():
    path = os.path.join(OUT_DIR, "claude-code-cheatsheet.pdf")
    doc = SimpleDocTemplate(
        path, pagesize=A4,
        leftMargin=M, rightMargin=M, topMargin=M, bottomMargin=M
    )

    story = []

    # === HEADER ===
    story.append(Paragraph("ANTHROPIC CLI &middot; AI-POWERED DEVELOPMENT", sCode))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph("Claude Code チートシート", sTitle))
    story.append(Paragraph("全コマンド・ショートカット・Tips を A4 1枚に凝縮", sSub))
    story.append(Spacer(1, 2*mm))

    # HR
    story.append(HRFlowable(width="100%", thickness=1.5, color=PURPLE, spaceAfter=3*mm))

    # === ESSENTIAL COMMANDS (Top 7) ===
    story.append(Paragraph("<b>ESSENTIAL COMMANDS</b> &mdash; まず覚える7つ", sH2))
    cmds_top = [
        ["/clear", "会話履歴をクリア・リセット（/reset, /new も同義）"],
        ["/compact", "会話を圧縮してトークン節約。引数で焦点指定可"],
        ["/config", "設定画面（テーマ・モデル・権限）を開く"],
        ["/model", "AIモデル切替（opus / sonnet / haiku）"],
        ["/resume", "前回セッションを再開（/continue も同義）"],
        ["/plan", "プランモードに入り、実装前に分析・設計��る"],
        ["/fast", "高速モード切替（同モデルで出力速度UP）"],
    ]
    t_data = [[Paragraph("<b>"+c[0]+"</b>", sCmd), Paragraph(c[1], sDesc)] for c in cmds_top]
    t = Table(t_data, colWidths=[2.2*cm, CW-2.2*cm])
    t.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 1.5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 1.5),
        ("LINEBELOW", (0,0), (-1,-1), 0.3, PARCH3),
        ("BACKGROUND", (0,0), (0,-1), HexColor("#f0ecf8")),
    ]))
    story.append(t)
    story.append(Spacer(1, 2*mm))

    # === TWO COLUMN LAYOUT: Daily Commands + Settings ===
    # Daily commands
    story.append(Paragraph("<b>DAILY WORKFLOW</b> &mdash; 開発で日常的に使う", sH2))
    cmds_daily = [
        ["/diff", "未コミット変更・ターン毎の差分表示"],
        ["/rewind", "会話・コード変更を前の状態に戻す"],
        ["/mcp", "MCPサーバー接続管理・OAuth認証"],
        ["/memory", "CLAUDE.md メモリの編集・確認"],
        ["/cost", "トークン使用量・コスト表示"],
        ["/effort", "思考レベル（low/medium/high/max）"],
        ["/btw", "サイド質問（履歴に残らない一時的な問い）"],
        ["/agents", "サブエージェント設定管理"],
        ["/copy", "最後の回答をクリップボードにコピー"],
    ]
    t2_data = [[Paragraph("<b>"+c[0]+"</b>", sCmd), Paragraph(c[1], sDesc)] for c in cmds_daily]
    t2 = Table(t2_data, colWidths=[2.2*cm, CW-2.2*cm])
    t2.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 1.2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 1.2),
        ("LINEBELOW", (0,0), (-1,-1), 0.2, PARCH3),
    ]))
    story.append(t2)
    story.append(Spacer(1, 2*mm))

    # === Settings & Environment ===
    story.append(Paragraph("<b>SETTINGS &amp; ENVIRONMENT</b>", sH2))
    cmds_settings = [
        ["/init", "プロジェクトCLAUDE.md初期化"],
        ["/theme", "カラーテーマ変更"],
        ["/permission-mode", "権限モード変更（default/accept/plan/auto）"],
        ["/sandbox", "サンドボックスモード切替"],
        ["/add-dir", "作業ディレクトリ追加"],
        ["/status", "バージョン・モデル・接続状態"],
        ["/doctor", "インストール・設定診断"],
        ["/export", "会話をテキストファイルに出力"],
        ["/context", "コンテキスト使用率を可視化"],
    ]
    t3_data = [[Paragraph("<b>"+c[0]+"</b>", sCmd), Paragraph(c[1], sDesc)] for c in cmds_settings]
    t3 = Table(t3_data, colWidths=[2.2*cm, CW-2.2*cm])
    t3.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 1.2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 1.2),
        ("LINEBELOW", (0,0), (-1,-1), 0.2, PARCH3),
    ]))
    story.append(t3)
    story.append(Spacer(1, 2*mm))

    # === KEYBOARD SHORTCUTS ===
    story.append(HRFlowable(width="100%", thickness=0.8, color=GOLD2, spaceAfter=2*mm))
    story.append(Paragraph("<b>KEYBOARD SHORTCUTS</b>", sH2))
    shortcuts = [
        ["Esc", "生成中断"],
        ["&uarr; キー", "前の入力を呼び出し"],
        ["Shift+Tab", "ファイル添付"],
        ["! コマンド", "シェルコマンド直接実行"],
        ["@ ファイル名", "ファイルをコンテキストに追加"],
        ["Tab", "入力中の補完"],
    ]
    t4_data = [[Paragraph("<b>"+s[0]+"</b>", sCmd), Paragraph(s[1], sDesc)] for s in shortcuts]
    t4 = Table(t4_data, colWidths=[2.5*cm, CW/2-2.5*cm, 2.5*cm, CW/2-2.5*cm])
    # Reshape to 2 columns
    t4_2col = []
    for i in range(0, len(shortcuts), 2):
        row = list(t4_data[i])
        if i+1 < len(shortcuts):
            row += list(t4_data[i+1])
        else:
            row += [Paragraph("", sCmd), Paragraph("", sDesc)]
        t4_2col.append(row)
    t4b = Table(t4_2col, colWidths=[2.2*cm, CW/2-2.2*cm, 2.2*cm, CW/2-2.2*cm])
    t4b.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 1.5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 1.5),
        ("LINEBELOW", (0,0), (-1,-1), 0.2, PARCH3),
        ("BACKGROUND", (0,0), (0,-1), HexColor("#f0ecf8")),
        ("BACKGROUND", (2,0), (2,-1), HexColor("#f0ecf8")),
    ]))
    story.append(t4b)
    story.append(Spacer(1, 2*mm))

    # === MEMORY SYSTEM ===
    story.append(HRFlowable(width="100%", thickness=0.8, color=GOLD2, spaceAfter=2*mm))
    story.append(Paragraph("<b>MEMORY SYSTEM</b> &mdash; 3層の記憶", sH2))
    mem_data = [
        ["CLAUDE.md", "プロジェクト固有のルール。git管理でチーム共有可能"],
        ["Auto Memory", "会話から自動学習した事実・好み。~/.claude/projects/ に保存"],
        ["Session Context", "現在の会話内の一時文脈。/compact で圧縮管理"],
    ]
    t5_data = [[Paragraph("<b>"+m[0]+"</b>", sCmd), Paragraph(m[1], sDesc)] for m in mem_data]
    t5 = Table(t5_data, colWidths=[2.5*cm, CW-2.5*cm])
    t5.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("TOPPADDING", (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
        ("LINEBELOW", (0,0), (-1,-1), 0.3, PARCH3),
        ("BACKGROUND", (0,0), (-1,-1), HexColor("#f5f0e8")),
    ]))
    story.append(t5)
    story.append(Spacer(1, 2*mm))

    # === TIPS ===
    story.append(Paragraph("<b>TIPS</b>", sH2))
    tips = [
        "CLAUDE.md にプ��ジェクトルールを書くと、毎セッション自動で読み込まれる",
        "/compact &lt;焦点&gt; で「この部分だけ残して」と指示できる",
        "/plan で設計レビュー → 確認後に実装、の流れが最も安全",
        "MCP設定は settings.json に書く。/mcp で接続状態を確認",
        "! コマンド でターミナル操作がそのまま会話コンテキストに入る",
    ]
    tips_text = "<br/>".join(["&bull; " + t for t in tips])
    story.append(Paragraph(tips_text, sBody))
    story.append(Spacer(1, 3*mm))

    # === FOOTER ===
    story.append(HRFlowable(width="100%", thickness=0.5, color=PARCH4, spaceAfter=1.5*mm))
    story.append(Paragraph(
        "Claude Code Cheatsheet &middot; 投資と思考の書斎 &middot; anni-memo.github.io/investment-library/ &middot; 2026-04-06",
        sFooter
    ))

    doc.build(story)
    print(f"PDF generated: {path} ({os.path.getsize(path):,} bytes)")

if __name__ == "__main__":
    build()
