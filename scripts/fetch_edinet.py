"""
EDINET DB API から日本株ランキング上位の財務データを取得し、スクリーナー用JSONを生成する。

戦略:
  /rankings/{metric} エンドポイントを各 metric ごとに呼び出し、TOP100 を取得。
  これらを edinet_code をキーに統合する。
  /screener API が不安定のため代替手段。

使い方:
  EDINETDB_API_KEY=xxx python scripts/fetch_edinet.py

出力:
  data/screener/stocks.json
"""
import json
import os
import sys
import time
import io
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import quote

if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

BASE_URL = "https://edinetdb.jp/v1"
API_KEY = os.environ.get("EDINETDB_API_KEY", "")
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "data" / "screener" / "stocks.json"

# rankings から取得する metric とそれに対応する出力フィールド名・降順/昇順
# rankings はデフォルト降順（高→低）。低い方が良い指標は order=asc を指定。
METRICS = [
    {"api": "operating-margin", "field": "op_margin",     "order": "desc", "label": "営業利益率"},
    {"api": "roe",              "field": "roe",           "order": "desc", "label": "ROE"},
    {"api": "dividend-yield",   "field": "div_yield",     "order": "desc", "label": "配当利回り"},
    {"api": "market-cap",       "field": "market_cap_mln","order": "desc", "label": "時価総額"},
    {"api": "equity-ratio",     "field": "equity_ratio",  "order": "desc", "label": "自己資本比率"},
    {"api": "pbr",              "field": "pbr",           "order": "asc",  "label": "PBR(低)"},
    {"api": "per",              "field": "per",           "order": "asc",  "label": "PER(低)"},
    {"api": "net-margin",       "field": "net_margin",    "order": "desc", "label": "純利益率"},
    {"api": "roa",              "field": "roa",           "order": "desc", "label": "ROA"},
    {"api": "revenue-growth",   "field": "revenue_growth","order": "desc", "label": "売上成長率"},
]

PER_PAGE = 100  # rankings の最大件数（API側で固定）


def api_get(endpoint: str, params: dict | None = None) -> dict:
    """EDINET DB API にGETリクエストを送信する。"""
    url = f"{BASE_URL}{endpoint}"
    if params:
        qs = "&".join(f"{k}={quote(str(v), safe='')}" for k, v in params.items())
        if qs:
            url += f"?{qs}"
    req = Request(url, headers={
        "X-API-Key": API_KEY,
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; investment-library-screener/1.0)"
    })
    try:
        with urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode())
    except HTTPError as e:
        body = e.read().decode() if e.fp else ""
        if e.code == 429:
            print("  レートリミット到達。60秒待機して再試行...", file=sys.stderr)
            time.sleep(60)
            with urlopen(req, timeout=60) as resp:
                return json.loads(resp.read().decode())
        print(f"  HTTP {e.code}: {url}", file=sys.stderr)
        print(f"  body: {body[:300]}", file=sys.stderr)
        raise


def normalize_sec_code(sec_code: str) -> str:
    """5桁sec_code（"72030"）を4桁（"7203"）に正規化。"""
    s = str(sec_code or "").strip()
    if len(s) == 5 and s.endswith("0"):
        return s[:4]
    if len(s) >= 4:
        return s[:4]
    return s


def main():
    if not API_KEY:
        print("エラー: EDINETDB_API_KEY 環境変数を設定してください。", file=sys.stderr)
        sys.exit(1)

    print(f"EDINET DB ランキング取得開始 ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')})")
    print(f"取得対象: {len(METRICS)} 指標 × TOP{PER_PAGE}\n")

    # edinet_code をキーに、各社の情報を統合
    companies: dict[str, dict] = {}
    request_count = 0

    for m in METRICS:
        print(f"  [{m['api']:<18}] {m['label']:<12} 取得中...", end=" ", flush=True)
        try:
            data = api_get(f"/rankings/{m['api']}", {
                "per_page": str(PER_PAGE),
                "order": m["order"],
            })
            request_count += 1
        except Exception as e:
            print(f"FAILED: {e}")
            continue

        items = data.get("data", [])
        meta = data.get("meta", {})
        new_count = 0

        for item in items:
            edinet_code = item.get("edinet_code", "")
            if not edinet_code:
                continue

            if edinet_code not in companies:
                # 新規エントリ
                companies[edinet_code] = {
                    "code": normalize_sec_code(item.get("sec_code")),
                    "edinet_code": edinet_code,
                    "name": item.get("name") or item.get("name_ja", ""),
                    "industry": item.get("industry", ""),
                    "fiscal_year": str(item.get("fiscal_year", "")),
                    "op_margin": None,
                    "per": None,
                    "pbr": None,
                    "roe": None,
                    "roa": None,
                    "div_yield": None,
                    "equity_ratio": None,
                    "market_cap": None,
                    "net_margin": None,
                    "revenue_growth": None,
                    "ranks": {},
                }
                new_count += 1

            # value と rank を統合
            companies[edinet_code][m["field"]] = item.get("value")
            companies[edinet_code]["ranks"][m["api"]] = item.get("rank")

        print(f"{len(items)} 件 (新規 {new_count})")
        time.sleep(0.5)

    # 時価総額は百万円単位 → 円に変換
    for c in companies.values():
        mc = c.pop("market_cap_mln", None)
        if mc is not None:
            c["market_cap"] = float(mc) * 1_000_000

    records = list(companies.values())
    # 営業利益率の降順でソート（None は最後）
    records.sort(key=lambda r: r.get("op_margin") if r.get("op_margin") is not None else -999999, reverse=True)

    # JSON 出力
    output = {
        "updated": datetime.now().strftime("%Y-%m-%d"),
        "source": "EDINET DB（金融庁データを構造化）",
        "source_url": "https://edinetdb.jp/",
        "license": "EDINET（金融庁）公開データ + EDINET DB",
        "method": "rankings TOP100 × 10 metrics aggregated",
        "count": len(records),
        "request_count": request_count,
        "companies": records,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, separators=(",", ":"))

    file_size_kb = OUTPUT_PATH.stat().st_size / 1024
    print(f"\n完了: {len(records)} 社（重複除外後）のデータを保存")
    print(f"  ファイル: {OUTPUT_PATH}")
    print(f"  サイズ: {file_size_kb:.1f} KB")
    print(f"  リクエスト数: {request_count}")


if __name__ == "__main__":
    main()
