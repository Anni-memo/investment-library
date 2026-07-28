# _templates/shared — 全PJ共通テンプレ

## 収録ファイル

| ファイル | 用途 | 配置先例 |
|---|---|---|
| `robots-v2.txt` | AI可読資産戦略v2 Bot別ポリシー標準版（全Bot Allow） | 各リポ `/robots.txt` または `/public/robots.txt` |

## robots-v2.txt の使い方

1. 複製先を決める:
   - 静的サイト（GitHub Pages等）: `<リポルート>/robots.txt`
   - Next.js等: `<リポ>/public/robots.txt`
2. `{{SITEMAP_URL}}` / `{{LLMS_TXT_URL}}` をサイトのURLで置換
3. 非公開エリアがあるサイトは `User-agent: *` ブロックの直下に `Disallow:` 行を追加（ただしAI学習Botへの明示Disallowはv2方針に反する）

## v2方針メモ

- **全Bot Allow** が標準（ユーザー承認: 2026-04-23）
- 例外的にDisallowするのは「認証エリア」「準備中ページ」「APIエンドポイント」等、公開を意図しないURL配下のみ
- AI学習Botへの Disallow は v2 戦略と矛盾するため、原則として追加しない
- 変更時は `_templates/shared/robots-v2.txt` 本体を更新してから各PJに展開する
