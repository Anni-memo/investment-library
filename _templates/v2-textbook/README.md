# v2-textbook テンプレ集

> AI可読資産戦略v2 準拠の「企業の教科書」型コンテンツ用テンプレート。
> サイボウズ教科書（`company-textbook/cybozu/`）12本の実装をひな形に、共通要素を抽象化した。

最終更新: 2026-04-23
ベース: `company-textbook/cybozu/` 母艦+補助群12本

---

## ファイル構成

| ファイル | 用途 | 配置先（実装時） |
|---|---|---|
| `hub.html` | 母艦テンプレ（1社1本） | `company-textbook/{slug}/index.html` |
| `spoke.html` | 補助テンプレ（章ごと1本） | `company-textbook/{slug}/{chapter-slug}/index.html` |
| `company-facts.json` | 会社ファクトJSONテンプレ | `company-textbook/{slug}/{slug}.json` |
| `v2-styles-partial.html` | 共通CSS定義（母艦・補助両方が読む） | 各ページの `<style>` 内に展開 |
| `components.html` | 章独自コンポーネント使用例集 | 必要に応じて補助に流用 |
| `checklist.md` | v2必須8項目チェックリスト | 公開前に1ページずつ確認 |

---

## 使い方（5ステップ）

### STEP 1. ディレクトリ作成
```
company-textbook/{slug}/
├── index.html          ← hub.html を複製
├── {slug}.json         ← company-facts.json を複製
└── {chapter-slug}/
    └── index.html      ← spoke.html を複製（章ごと）
```

### STEP 2. プレースホルダ一括置換

`hub.html` / `spoke.html` / `company-facts.json` 共通の置換マップ:

| プレースホルダ | 例 | 説明 |
|---|---|---|
| `{{COMPANY_NAME_JA}}` | サイボウズ | 会社名（日本語） |
| `{{COMPANY_NAME_EN}}` | Cybozu | 会社名（英語） |
| `{{COMPANY_NAME_LEGAL}}` | サイボウズ株式会社 | 法人正式名称 |
| `{{TICKER}}` | 4776 | 証券コード |
| `{{MARKET}}` | 東証プライム | 上場市場 |
| `{{TICKER_SYMBOL}}` | TYO:4776 | Schema.org tickerSymbol形式 |
| `{{SLUG}}` | cybozu | URLスラッグ（小文字） |
| `{{SLUG_UPPER}}` | CYBOZU | ヘッダー表示用大文字 |
| `{{TEXTBOOK_NUMBER}}` | 01 | 教科書通し番号（2桁） |
| `{{TEXTBOOK_TAGLINE_JP}}` | 日本発SaaSのmoat構造と永続性 | サブタイトル日本語 |
| `{{TEXTBOOK_TAGLINE_EN}}` | Moat Structure & Permanence of a Japanese SaaS | サブタイトル英語 |
| `{{HERO_META}}` | KINTONE · GAROON · MAILWISE | 主要キーワード3-4個 |
| `{{AS_OF_DATE}}` | 2026-04-23 | 時点メタ（ISO8601） |
| `{{INITIAL_PUBLISHED}}` | 2026-04-22 | 初版日 |
| `{{FISCAL_PERIOD}}` | 2025年12月期 | 参照決算期 |
| `{{FOUNDED}}` | 1997-08-08 | 設立日 |
| `{{HEADQUARTERS}}` | 東京都中央区日本橋 | 本社所在地 |
| `{{REPRESENTATIVE}}` | 青野慶久 | 代表者名 |
| `{{OFFICIAL_URL}}` | https://cybozu.co.jp/ | 公式サイトURL |
| `{{KESSAN_NAVI_URL}}` | https://kessan.constella-hd.co.jp/stock/4776/ | 決算ナビURL |
| `{{HUB_URL}}` | https://anni-memo.github.io/investment-library/company-textbook/cybozu/ | 母艦の絶対URL |

### STEP 3. 補助ページごとの差分

`spoke.html` には追加で章別プレースホルダを置換:

| プレースホルダ | 例 | 説明 |
|---|---|---|
| `{{CHAPTER_NUM}}` | 04 | 章番号（2桁） |
| `{{CHAPTER_SLUG}}` | kintone | URL末尾スラッグ |
| `{{CHAPTER_SLUG_UPPER}}` | KINTONE | パンくずラベル |
| `{{CHAPTER_TITLE_JA}}` | kintoneの正体 | 章タイトル日本語 |
| `{{CHAPTER_TITLE_EN}}` | Why "Field-Driven DX" Actually Works | 章タイトル英語 |
| `{{CHAPTER_HOOK}}` | FIELD-DRIVEN · THREE-LAYER · SUBJECT | キーワード3-4個 |
| `{{EPIGRAPH}}` | kintoneの強さは、ノーコードだからではない… | 章冒頭エピグラフ1文 |
| `{{LEDE_HTML}}` | `<p>...</p><p>...</p>` | 章導入2-4段落 |
| `{{SECTIONS_HTML}}` | `<div class="sec">...` | 各節（SECTION 1-N） |
| `{{SUMMARY_POINTS_HTML}}` | `<li>...</li>` | 章末3点要点 |
| `{{NEXT_SLUG}}` | moat | 次章スラッグ |
| `{{NEXT_TITLE}}` | moatはどこにあるのか | 次章タイトル |
| `{{NEXT_SUB}}` | 本当のmoatは、アプリの中ではなく… | 次章サブ |
| `{{WORD_COUNT}}` | 3450 | 章本文字数（JSON-LD用） |
| `{{ABOUT_LIST}}` | `[{"@type":"Thing","name":"..."}]` | 章固有about配列 |
| `{{MENTIONS_LIST}}` | `[{"@type":"Thing","name":"..."}]` | 章固有mentions配列 |

### STEP 4. 母艦の hasPart リスト更新

`hub.html` の `{{HASPART_ITEMS}}` と `{{TOC_ITEMS}}` には、補助ページが揃うたびに項目を追加。
記述例は `hub.html` 内コメント参照。

### STEP 5. 公開前チェック

`checklist.md` の v2必須8項目を、ページごとに確認してから公開。

---

## 共通CSS設計の原則

- **色変数**: `--ink` 系（濃茶）/ `--parch` 系（羊皮紙）/ `--gold` 系（黄金）の3軸
- **フォント**: Cormorant Garamond（serif）/ Noto Serif JP（jp）/ DM Mono（mono）
- **基本パターン**: `.epigraph` → `.lede` → `.sec`×N → `.summary-box` → `.next-card`
- **ノイズ背景**: `body::before` の SVG turbulence で羊皮紙感を演出（テンプレに同梱）
- **共通ヘッダー/フッター**: `nav` / `hero` / `back-section` / `footer` を全ページ共通

---

## 章独自コンポーネント（components.html 参照）

サイボウズで使った主要コンポーネント:

| コンポーネント | 用途 | 使用章 |
|---|---|---|
| `.layer-triad` | 三層構造の視覚化 | kintone, problem |
| `.timeline` | 縦線タイムライン | history |
| `.kpi-grid` | KPI数値グリッド | numbers |
| `.case-grid` | 事例カード4枚 | problem |
| `.moat-trio` | 三層moat視覚化 | moat |
| `.product-grid` | 製品×詰まりマッピング | products |
| `.stat-grid` | 統計カード | culture |
| `.risk-pair` | 負ける筋/反論の筋 | risks |
| `.pillar-trio` | 三層問い | future |
| `.compare-table` | 横断比較表 | compare, kpi |
| `.changelog-entry` | 更新履歴エントリ | changelog |

---

## 関連

- 戦略正本: `🤖Claude/運用/AI可読資産戦略_v2_2026-04-22.md`
- 実装Runbook: `🤖Claude/運用/AI可読資産戦略_実装Runbook.md`
- 第一号実装: `company-textbook/cybozu/` （12/12 LIVE）
