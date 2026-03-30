"""未実装企業の情報を抽出するスクリプト"""
import os, re, json

base = r"C:\Users\mineo\ClaudeProjects\investment-library\companies"
results = []

for d in sorted(os.listdir(base)):
    p = os.path.join(base, d, "index.html")
    if not os.path.isfile(p):
        continue
    with open(p, encoding="utf-8") as f:
        html = f.read()
    if "MULTIPLE PERSPECTIVES" in html:
        continue
    # Extract info
    name_m = re.search(r'<h1 class="hero-name">(.*?)</h1>', html)
    code_m = re.search(r'<div class="hero-code">(.*?)</div>', html)
    verdict_m = re.search(r'<p class="hero-verdict">(.*?)</p>', html, re.DOTALL)
    tags_m = re.findall(r'<span class="hero-tag">(.*?)</span>', html)
    biz_m = re.search(r'BUSINESS OVERVIEW.*?<div class="section-body">(.*?)</div>', html, re.DOTALL)
    moat_m = re.search(r'MOAT SCORECARD.*?<div class="section-body">(.*?)</div>', html, re.DOTALL)
    fcf_m = re.search(r'FREE CASH FLOW.*?<div class="section-body">(.*?)</div>', html, re.DOTALL)

    def clean(s):
        if not s: return ""
        return re.sub(r'<[^>]+>', '', s).strip()

    results.append({
        "dir": d,
        "name": clean(name_m.group(1)) if name_m else d,
        "code": clean(code_m.group(1)) if code_m else "",
        "verdict": clean(verdict_m.group(1)) if verdict_m else "",
        "tags": tags_m,
        "biz": clean(biz_m.group(1)) if biz_m else "",
        "moat": clean(moat_m.group(1)) if moat_m else "",
        "fcf": clean(fcf_m.group(1)) if fcf_m else "",
    })

with open(os.path.join(os.path.dirname(base), "missing_companies.json"), "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"未実装企業数: {len(results)}")
for r in results:
    print(f"  {r['dir']}: {r['name']} | {r['verdict'][:60]}")
