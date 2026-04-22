# scripts/maintenance

投資Libraryサイト全体の一括更新を行うユーティリティスクリプト。
全て**冪等**で設計されており、二重実行しても同じ結果になる。

## スクリプト一覧

### `_replace_sitename.py`
サイト名文字列をリポジトリ全体から置換する。
- 対象拡張子: `.html / .js / .json / .txt / .xml / .md / .css / .py`
- スキップ: `*.backup.html`
- 用途例: 「投資と思考の書斎」→「投資Library」のリブランド（2026-04-22、572ファイル・2,166箇所置換）

### `_inject_kessan_navi.py`
全HTMLの `</footer>` 直前に決算ナビ外部リンクブロックを注入する。
- 冪等（既に `kessan-navi` が含まれるファイルはスキップ）
- `</footer>` 未保有ファイル（ブックリーダー等）は意図的に対象外
- 用途例: 全546ページに決算ナビ外部リンクを一括埋込（2026-04-22）

### `_check_no_footer.py`
`</footer>` を持たないHTMLを監査する（注入前後の確認用）。

### `_update_kessan_navi_url.py`
決算ナビの URL をリポジトリ全体から置換する。
- デフォルト: `https://kessan.constella-hd.co.jp/` → `https://kessan.constella-hd.co.jp/`
- `--dry` で事前確認、`--old` `--new` で任意URLに変更可能
- 冪等（旧URL未存在のファイルはスキップ）
- 用途例: Vercel本番ドメイン確定時の一括差替え（2026-04-22 時点で549ファイル対象）
```bash
python scripts/maintenance/_update_kessan_navi_url.py --dry
python scripts/maintenance/_update_kessan_navi_url.py --old https://kessan.constella-hd.co.jp/ --new https://kessan-navi.jp/
```

## 実行場所
リポジトリルート（`investment-library/`）から実行する前提。
```bash
cd C:/Users/mineo/ClaudeProjects/investment-library
python scripts/maintenance/_replace_sitename.py
```

## 履歴
- 2026-04-22 作成（投資Libraryリブランド＆決算ナビ外部リンク一括注入で使用）
- 2026-04-22 `_update_kessan_navi_url.py` 追加（Vercelドメイン確定時の差替用）
