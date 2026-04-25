# v2-glossary 公開前チェックリスト

各指標ページを公開する前に、この8+3項目を1ページずつ確認。

---

## v2必須8項目（全テンプレ共通）

### 1. 母艦+補助群構造
- [ ] 母艦（ジャンルINDEX）の `hasPart` / `hasDefinedTerm` に本ページが登録されている
- [ ] 母艦の TOC に本ページが toc-live として表示される
- [ ] 本ページから母艦への back-link が機能している

### 2. パッセージ最適化
- [ ] 1見出し1論点（H2配下のセクションは1テーマに絞る）
- [ ] 節単位で400-900字（長すぎれば分割）
- [ ] 原子塊（段落単位）150-400字
- [ ] H2が問い型または断定型（「PERとは何か」「PERは回収年数」等）
- [ ] 冒頭lede 2文に **主語 / 結論 / 時点 / 単位** が揃っている

### 3. JSON-LD
- [ ] `@graph` に Article + **DefinedTerm** + Organization + BreadcrumbList 4種が揃う
- [ ] `Article.mainEntity` が `DefinedTerm.@id` を指す
- [ ] `DefinedTerm.inDefinedTermSet` が母艦 `DefinedTermSet.@id` を指す
- [ ] BreadcrumbList が 3階層（サイト / ジャンル / 用語）

### 4. 時点メタデータ
- [ ] `<meta name="as-of-date">` を本日の日付に更新
- [ ] `<meta name="referenced-fiscal-period">` に対象決算期を記載（該当する場合）
- [ ] `.meta-line` に「INITIAL / UPDATED / 字数」が表示される
- [ ] JSON-LD `datePublished` / `dateModified` が正しい
- [ ] glossary-facts.json の `as_of_date` / `last_updated` が同期している

### 5. 構造化JSON
- [ ] `_data/{{TERM_SLUG}}.json` が存在する
- [ ] `<link rel="alternate" type="application/json">` で正しいJSONを案内
- [ ] JSONの内容（definition / formula / related_metrics）が本文と矛盾しない

### 6. robots.txt Bot別ポリシー
- [ ] サイトルートの `robots.txt` が全AI Bot Allow方針（2026-04-23標準）で記述されている
- [ ] （母艦・補助の各ページ自体にnoindexがない）

### 7. /llms.txt
- [ ] サイトルートの `/llms.txt` に本辞書セクション（母艦URL）が登録されている
- [ ] 個別指標は母艦経由で辿れる前提で、個別登録不要

### 8. 計測4点
- [ ] Search Console 側で本URLがカバレッジに入る想定（サイトマップ経由）
- [ ] GA4 計測タグ設置済み
- [ ] 固定プロンプト50問に本指標の問いが含まれる（例: 「PERとは」「PERの読み方」）
- [ ] サイトマップに本URLが追加されている

---

## v2-glossary 特有チェック（3項目）

### G1. DefinedTerm の @id 整合性
- [ ] `DefinedTerm.@id` が `{canonical}/#term` 形式で統一
- [ ] `Article.mainEntity` が同じ @id を参照
- [ ] 母艦 `DefinedTermSet.hasDefinedTerm` が同じ @id を参照
- [ ] 関連指標の `mentions` リンクが実在ページを指す（404なし）

### G2. 定義ボックスの必須要素
- [ ] 定義本文（1-3段落）
- [ ] 計算式または主要フィールド（なければ「定義式なし」と明記）
- [ ] 単位 / 目安レンジ / データ出典 の3要素
- [ ] 核心フレーズ `<strong>` が2-4箇所ある

### G3. 読み方ガイド
- [ ] `.reading-guide` に最低3軸（水準 / 業種 / 時期 等）
- [ ] 各軸に具体的な参照基準（「10年中央値±1σ」「同業種中央値」等）
- [ ] 「よくある誤解」に該当する注意書きが本文 or summary-box に1つ以上

---

## 執筆時間の目安

| 作業 | 所要時間 |
|---|---|
| 定義・計算式の調査 | 20-30分 |
| 本文セクション3-5本 | 60-90分 |
| 関連指標リンク検証 | 10分 |
| JSON-LD + facts.json 整備 | 15分 |
| v2チェックリスト通し | 15分 |
| **1指標あたり合計** | **約2時間** |

---

## 第一号実装への参照

- 決算ナビ `/guide/per/` （2026-04-23 予定）
- `🤖Claude/プロジェクト/決算ナビ設計/決算ナビ_v2適用設計案_2026-04-23.md`
