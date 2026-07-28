# v2-textbook 公開前チェックリスト

> AI可読資産戦略v2 必須8項目 + 教科書テンプレ固有チェックのセット。
> 補助ページを公開する前に毎回このチェックを通す（母艦公開時は全項目、補助公開時は★項目のみで可）。

---

## 1. 母艦+補助群構造 ★

- [ ] 母艦 `index.html` が `company-textbook/{slug}/` に存在
- [ ] 母艦のTOCに全補助ページが列挙されている（公開済みは `toc-live` / 未公開は `toc-wip`）
- [ ] 母艦の JSON-LD `hasPart` が公開済み補助ページをすべて含む
- [ ] 共通9項目の対応関係が埋まっている:
  - [ ] 総論（INTRO・hero）
  - [ ] 収益モデル（numbers章 または products章）
  - [ ] 年表（history章）
  - [ ] リスク（risks章）
  - [ ] KPI辞書（kpi章）
  - [ ] プロダクト体系（products章）
  - [ ] 文化・思想（culture章）
  - [ ] 関連企業比較（compare章）
  - [ ] 更新履歴（changelog章）

## 2. パッセージ最適化 ★

- [ ] 1見出し1論点（H2は問い型または断定型で1文）
- [ ] 原子塊150-400字（`.sec-body > p` 単位）
- [ ] セクション400-900字（`.sec` 単位）
- [ ] 冒頭2文で主語/結論/時点/指標のうち3つ以上を提示（`.lede` 冒頭）
- [ ] `<strong>` 強調が核心フレーズに限定されている（乱用していない）

## 3. JSON-LD ★

- [ ] `@graph` 形式で記述（配列内に複数エンティティ）
- [ ] **母艦**: Article + Organization（会社） + Organization（発行元） + BreadcrumbList 3階層
- [ ] **補助**: Article（isPartOf母艦付き・wordCount・articleSection付き） + Organization（発行元） + BreadcrumbList 4階層
- [ ] Article の `mainEntity` / `about` / `mentions` が会社・論点・関連語で埋まっている
- [ ] 全 `@id` URL が正しい（カノニカル URL と一致）
- [ ] FAQ Schema は使わない（v2方針: 後回し）
- [ ] JSONパーサーで有効性確認（オンラインバリデータ推奨: https://validator.schema.org/）

## 4. 時点メタデータ ★

- [ ] `<meta name="as-of-date" content="YYYY-MM-DD"/>` が現在値
- [ ] `<meta name="referenced-fiscal-period" content="20XX年X月期"/>` が設定されている
- [ ] JSON-LD の `datePublished` が初版日
- [ ] JSON-LD の `dateModified` が最終更新日
- [ ] 会社ファクトJSON の `as_of_date` / `last_updated` が更新されている
- [ ] 補助ページ冒頭の `.meta-line` が最新

## 5. 構造化JSON（会社ファクト）

- [ ] `{slug}.json` が母艦ディレクトリ直下に存在
- [ ] 全補助ページから `<link rel="alternate" type="application/json" href="../{slug}.json"/>` で参照されている
- [ ] 手動二重管理していない（HTML埋込版とJSON版が同じ情報で重複していない）
- [ ] 数値/文字列の型が Phase1（"N百万円" の文字列）で統一されている
- [ ] `pages` セクションが全補助ページのパスを含む
- [ ] `changelog` に今回の変更が1行追記されている

## 6. robots.txt Bot別ポリシー（母艦公開時に全PJ横断で確認）

- [ ] `/robots.txt` が Bot別ポリシー表に更新されている（未実装の場合は B→C タスクで対応）
- [ ] 検索Bot（Googlebot/Bingbot）: allow
- [ ] 引用Bot（OAI-SearchBot/Claude-SearchBot/PerplexityBot）: allow
- [ ] 学習Bot（GPTBot/ClaudeBot/Google-Extended）: ユーザー判断済み

## 7. /llms.txt（補助4番手）

- [ ] 投資Library ルートの `/llms.txt` に母艦URLが1行追加されている
- [ ] 補助ページ群は llms.txt に個別列挙しない（母艦のみ案内）

## 8. 計測4点（母艦公開時）

- [ ] Search Console に母艦URLがインデックス登録申請されている
- [ ] GA4 で chatgpt.com / perplexity.ai / claude.ai のリファラ追跡が有効
- [ ] CDN Botログ取得の設計確認済み（GitHub Pagesの場合は別途Cloudflare等）
- [ ] 固定プロンプト50問の週次監視対象に追加されている（ファイル: `サイボウズ_固定プロンプト50問.md` と同様式）

---

## 教科書テンプレ固有チェック（v2 8項目外）

- [ ] ヒーロータイトルの英語サブタイトル（`.hero-title em`）が入っている
- [ ] 相対パス: 母艦は `../../shared.css`、補助は `../../../shared.css`（階層注意）
- [ ] 決算ナビ外部リンク `{{KESSAN_NAVI_URL}}` が設定されている
- [ ] 補助ページに次章ナビ `.next-card` が入っている（最終章以外）
- [ ] 補助ページに `.summary-box`（3点要点 + FOR INVESTORS/CUSTOMERS）が入っている
- [ ] フッター8項目リンクが有効（書斎の入口/初めての方へ/...）
- [ ] GA4 ID `G-VYPK32EB6B` が `<head>` に入っている

---

## 静的検証コマンド例

```bash
# 全補助ページのJSON-LD有効性を確認（Python）
for f in company-textbook/{slug}/*/index.html; do
  python -c "
import re, json, sys
html = open('$f').read()
for m in re.finditer(r'<script type=\"application/ld\+json\">(.+?)</script>', html, re.S):
    try: json.loads(m.group(1))
    except Exception as e: print('$f:', e)
"
done

# 相対パス解決チェック（存在しないsharedファイルがないか）
grep -r 'href="../../../shared' company-textbook/{slug}/*/index.html
```

---

## 参考

- 第一号実装（完成形）: `company-textbook/cybozu/`
- テンプレ集: `_templates/v2-textbook/`
- 戦略正本: `🤖Claude/運用/AI可読資産戦略_v2_2026-04-22.md`
