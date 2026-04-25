# v2-glossary テンプレ集

> AI可読資産戦略v2 準拠の「指標・用語辞書」型コンテンツ用テンプレート。
> 決算ナビ `/guide/` 配下、金融教育の「用語解説」、健康クリニックの「症状・薬剤辞書」等に流用可能。
> v2-textbook（企業の教科書）の辞書系派生として、同じCSS・パッセージ原則を踏襲する。

最終更新: 2026-04-23
ベース: `_templates/v2-textbook/` + Schema.org `DefinedTerm`

---

## v2-textbookとの違い（派生ポイント）

| 観点 | v2-textbook | v2-glossary |
|---|---|---|
| 対象 | 1社の教科書 | 1指標・1用語の解説 |
| 母艦 | 会社名で1つ | ジャンル（バリュエーション/需給/財務 等）で1つ |
| 補助 | 章（9項目） | 個別指標（PER/PBR/空売り比率 等） |
| Schema.org | Article + Organization | Article + **DefinedTerm** |
| ファクトJSON | company-facts.json | **glossary-facts.json** |
| 独自コンポ | .layer-triad 等 | **.definition-box / .formula-card / .reading-guide / .related-metrics** |
| CTA | 決算ナビで該社の決算 | 決算ナビの関連機能（バンド/ヒートマップ等） |

---

## ファイル構成

| ファイル | 用途 | 配置先（実装時） |
|---|---|---|
| `hub.html` | 母艦テンプレ（ジャンル1本） | 例: `/guide/index.html` |
| `spoke.html` | 補助テンプレ（個別指標） | 例: `/guide/per/index.html` |
| `glossary-facts.json` | 指標ファクトJSONテンプレ | 例: `/guide/_data/per.json` |
| `components.html` | 辞書独自コンポーネント集 | spoke.html に必要分をコピー |
| `checklist.md` | v2必須8項目＋辞書特有チェック | 公開前1ページずつ確認 |

**CSS**は v2-textbook の `v2-styles-partial.html` を **そのまま再利用**。二重管理しない。

---

## 使い方（5ステップ）

### STEP 1. ディレクトリ作成

```
{site-root}/guide/
├── index.html          ← hub.html を複製（ジャンル母艦）
├── _data/
│   ├── per.json        ← glossary-facts.json を複製
│   ├── pbr.json
│   └── ...
└── per/
    └── index.html      ← spoke.html を複製（個別指標）
```

### STEP 2. プレースホルダ一括置換（共通）

| プレースホルダ | 例 | 説明 |
|---|---|---|
| `{{SITE_NAME}}` | 決算ナビ | サイト名 |
| `{{SITE_URL_BASE}}` | https://kessan.constella-hd.co.jp | サイト絶対URL |
| `{{SITE_ROOT_LABEL}}` | 決算ナビ | パンくず第1層 |
| `{{SECTION_SLUG}}` | guide | 辞書セクションのURLセグメント |
| `{{SECTION_LABEL}}` | 指標辞書 | セクション表示名 |
| `{{GENRE_SLUG}}` | valuation | ジャンル（バリュエーション/需給/財務 等） |
| `{{GENRE_LABEL}}` | バリュエーション | ジャンル表示名 |
| `{{AS_OF_DATE}}` | 2026-04-23 | 時点メタ（ISO8601） |
| `{{INITIAL_PUBLISHED}}` | 2026-04-23 | 初版日 |

### STEP 3. 個別指標（spoke）固有プレースホルダ

| プレースホルダ | 例 | 説明 |
|---|---|---|
| `{{TERM_SLUG}}` | per | URLスラッグ |
| `{{TERM_SLUG_UPPER}}` | PER | パンくず・ヘッダー大文字 |
| `{{TERM_NAME_JA}}` | PER（株価収益率） | 日本語表記 |
| `{{TERM_NAME_EN}}` | Price Earnings Ratio | 英語正式名 |
| `{{TERM_SHORT}}` | PER | 略称 |
| `{{TERM_SUBTITLE}}` | 10年バンドで「割高・割安」を読む | 副題 |
| `{{EPIGRAPH}}` | PERは「何年で回収できるか」を語る比率。 | 冒頭エピグラフ1文 |
| `{{LEDE_HTML}}` | `<p>...</p><p>...</p>` | 導入2-4段落 |
| `{{DEFINITION_HTML}}` | `<p>...</p>` | 定義ボックス本文 |
| `{{FORMULA_DISPLAY}}` | 株価 ÷ 1株当たり純利益(EPS) | 計算式（表示用） |
| `{{FORMULA_NOTE}}` | EPSは当期予想または実績ベース | 計算式補足 |
| `{{UNIT}}` | 倍 | 単位 |
| `{{TYPICAL_RANGE}}` | 8〜20倍（業種により変動） | 目安レンジ |
| `{{SECTIONS_HTML}}` | `<div class="sec">...` | 本文セクション |
| `{{SUMMARY_POINTS_HTML}}` | `<li>...</li>` | 章末3点要点 |
| `{{RELATED_METRICS_HTML}}` | `<a class="related">...` | 関連指標リンク群 |
| `{{KN_FEATURE_URL}}` | https://kessan.constella-hd.co.jp/bands/ | 決算ナビ該当機能URL |
| `{{KN_FEATURE_LABEL}}` | 10年バリュエーション・バンド | 機能名 |
| `{{KN_FEATURE_DESC}}` | PER/PBRの10年レンジを自動描画 | 機能説明 |
| `{{DATA_SOURCE}}` | J-Quants API Standard | データ出典 |

### STEP 4. 母艦の hasPart リスト更新

`hub.html` の `{{HASPART_ITEMS}}` と `{{TOC_ITEMS}}` に、補助ページ（個別指標）を追加するたびに1行追記。

### STEP 5. 公開前チェック

`checklist.md` の v2必須8項目＋辞書特有3項目を確認してから公開。

---

## Schema.org 設計（辞書特有）

v2-textbook が `Article + Organization` だったのに対し、v2-glossary は **`Article + DefinedTerm`** の @graph を使う。

```json
{
  "@type": "DefinedTerm",
  "@id": ".../guide/per/#term",
  "name": "PER",
  "alternateName": ["Price Earnings Ratio", "株価収益率"],
  "description": "...",
  "inDefinedTermSet": {"@type": "DefinedTermSet", "name": "決算ナビ指標辞書"},
  "termCode": "PER"
}
```

`Article.mainEntity` から `DefinedTerm.@id` を参照することで「この記事は PER という用語を解説している」と明示。AI検索（特にPerplexity / ChatGPT）は `DefinedTerm` を重視する傾向。

---

## 関連

- ベーステンプレ: `_templates/v2-textbook/`
- 戦略正本: `🤖Claude/運用/AI可読資産戦略_v2_2026-04-22.md`
- 第一号実装: `kessan-navi` の `/guide/` 配下（予定）
- 流用先候補: 金融教育 `/terms/`、健康クリニック `/terms/`
