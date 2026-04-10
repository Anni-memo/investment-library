#!/usr/bin/env python3
"""
Research/Cybozu系6ページにもりもり版テンプレート不足要素を適用するスクリプト
- 既存の nav-cockpit / 目次 / cockpit系CSS は保持
- 追加するもの: hero-3col, graph-card, qa-card の CSS / 3カラムヒーロー / Knowledge Graph JS
- MyNote FAB は shared mynote.js が既に読み込み済みのためスキップ
- セクションIDは既存の sec-xxx を使用（article-section未使用のため付与スキップ）
"""

import os
import re
import glob

BASE = os.path.dirname(os.path.abspath(__file__))
RESEARCH_DIR = os.path.join(BASE, "research")

TARGETS = [
    "cybozu-agm-2026",
    "cybozu-digital-nature",
    "cybozu-investment",
    "cybozu-moat",
    "cybozu-saas-future",
    "cybozu-verdict",
]

# Cybozuシリーズ各ページの短縮ラベル（グラフ用）
CYBOZU_LABELS = {
    "cybozu-agm-2026": "AGM2026",
    "cybozu-digital-nature": "デジタルネイチャー",
    "cybozu-investment": "投資",
    "cybozu-moat": "moat",
    "cybozu-saas-future": "SaaSの未来",
    "cybozu-verdict": "評価",
}

CYBOZU_FULL_NAMES = {
    "cybozu-agm-2026": "サイボウズ株主総会2026",
    "cybozu-digital-nature": "デジタルネイチャーとサイボウズ",
    "cybozu-investment": "AIエージェントはチームを殺すか",
    "cybozu-moat": "サイボウズ moat解剖",
    "cybozu-saas-future": "kintoneは生き残るか",
    "cybozu-verdict": "投資判断：サイボウズ",
}

# ===== 追加CSS（cockpit系は既存なので重複させない。hero-3col/graph/qaのみ） =====
MORIMORI_ADDON_CSS = """
/* ===== Morimori Addon: Hero 3-col ===== */
.hero-3col{display:grid;grid-template-columns:1fr 1.618fr 1fr;gap:28px;max-width:1200px;margin:0 auto;align-items:center;position:relative;}
@media(max-width:960px){.hero-3col{grid-template-columns:1fr;max-width:600px;gap:16px;}}
.hero-col-center{text-align:center;padding:0;}
.hero-col-side{min-width:0;}

/* Graph Card */
.graph-card{background:transparent;border:1px solid rgba(184,144,10,.15);border-radius:4px;position:relative;overflow:hidden;}
.graph-card canvas{display:block;width:100%;cursor:grab;}
.graph-card-label{position:absolute;top:10px;left:14px;font-family:'DM Mono',monospace;font-size:.46rem;color:rgba(212,170,34,.55);letter-spacing:.2em;z-index:2;pointer-events:none;}
.graph-tooltip{position:absolute;background:rgba(13,15,20,.92);border:1px solid rgba(184,144,10,.25);padding:8px 12px;border-radius:3px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:10;max-width:200px;}
.graph-tooltip-title{font-family:'Noto Serif JP',serif;font-size:.72rem;color:#f5ede0;font-weight:600;margin-bottom:2px;}
.graph-tooltip-cat{font-family:'DM Mono',monospace;font-size:.42rem;color:#d4aa22;letter-spacing:.1em;text-transform:uppercase;}
.graph-tooltip-desc{font-family:'Noto Serif JP',serif;font-size:.62rem;color:rgba(245,237,224,.75);margin-top:4px;line-height:1.5;}

/* Quick Actions */
.qa-card{background:rgba(184,144,10,.05);border:1px solid rgba(184,144,10,.15);border-radius:4px;padding:14px 16px;}
.qa-card-label{font-family:'DM Mono',monospace;font-size:.58rem;color:rgba(212,170,34,.55);letter-spacing:.2em;margin-bottom:10px;}
.quick-actions-v{display:flex;flex-direction:column;gap:6px;}
.qa-btn-v{display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(184,144,10,.08);border:1px solid rgba(184,144,10,.18);color:rgba(245,237,224,.82);text-decoration:none;font-family:'DM Mono',monospace;font-size:.68rem;transition:all .15s;border-radius:3px;}
.qa-btn-v:hover{background:rgba(184,144,10,.18);border-color:#d4aa22;color:#f5ede0;}
.qa-btn-v .qa-icon{font-size:.85rem;flex-shrink:0;}
"""


def extract_hero(html):
    """Extract hero components from either hero-eyebrow-based or hero-inner-based layouts."""
    info = {
        'eyebrow': '',     # hero-eyebrow or hero-breadcrumb
        'label': '',       # hero-label (optional, for hero-inner style)
        'title_html': '',  # <h1> full inner HTML
        'sub_html': '',    # p.hero-sub or p.hero-subtitle inner HTML
        'meta_html': '',   # hero-meta inner HTML
    }
    m = re.search(r'<div class="hero-eyebrow">(.*?)</div>', html, re.DOTALL)
    if m:
        info['eyebrow'] = m.group(1).strip()
    else:
        m = re.search(r'<div class="hero-breadcrumb">(.*?)</div>', html, re.DOTALL)
        if m:
            info['eyebrow'] = m.group(1).strip()

    m = re.search(r'<div class="hero-label">(.*?)</div>', html, re.DOTALL)
    if m:
        info['label'] = m.group(1).strip()

    m = re.search(r'<h1(?:\s+class="hero-title")?>(.*?)</h1>', html, re.DOTALL)
    if m:
        info['title_html'] = m.group(1).strip()

    m = re.search(r'<p class="hero-sub(?:title)?">(.*?)</p>', html, re.DOTALL)
    if m:
        info['sub_html'] = m.group(1).strip()

    m = re.search(r'<div class="hero-meta">(.*?)</div>', html, re.DOTALL)
    if m:
        info['meta_html'] = m.group(1).strip()

    return info


HERO_BLOCK_RE = re.compile(
    r'<div class="hero">\s*(?:<div class="hero-inner">\s*)?'
    r'(?:<div class="hero-(?:eyebrow|breadcrumb)">.*?</div>\s*)?'
    r'(?:<div class="hero-label">.*?</div>\s*)?'
    r'<h1(?:\s+class="hero-title")?>.*?</h1>\s*'
    r'<p class="hero-sub(?:title)?">.*?</p>\s*'
    r'(?:<div class="hero-meta">.*?</div>\s*)?'
    r'(?:</div>\s*)?'  # close hero-inner if any
    r'</div>',
    re.DOTALL
)


def extract_toc(html):
    """Parse <ol class="toc-list">...</ol> into list of {href,title}."""
    m = re.search(r'<ol class="toc-list">(.*?)</ol>', html, re.DOTALL)
    if not m:
        return []
    block = m.group(1)
    items = []
    for mi in re.finditer(r'<li>\s*<span class="toc-num">(.*?)</span>\s*<a href="([^"]+)">(.*?)</a>\s*</li>', block, re.DOTALL):
        items.append({
            'num': mi.group(1).strip(),
            'href': mi.group(2).strip(),
            'title': re.sub(r'<[^>]+>', '', mi.group(3)).strip(),
        })
    return items


def build_qa_links(toc):
    """Build vertical quick action buttons from first 5 TOC entries."""
    icons = ["🔍", "⏰", "🧭", "🔄", "📖"]
    lines = []
    for i, it in enumerate(toc[:5]):
        icon = icons[i] if i < len(icons) else "📄"
        label = it['title']
        if len(label) > 14:
            label = label[:14] + '…'
        lines.append(
            f'          <a class="qa-btn-v" href="{it["href"]}"><span class="qa-icon">{icon}</span> {label}</a>'
        )
    return "\n".join(lines)


def build_graph(slug, title_text, toc):
    """Build knowledge graph nodes/edges string and JS."""
    self_label = title_text[:12] if len(title_text) > 12 else title_text
    nodes = [
        f"    {{id:'self',label:{js_str(self_label)},x:0,y:0,r:22,color:'#d4aa22',cat:'self',url:null,desc:{js_str('この記事')}}}"
    ]
    edges = []

    # Section nodes from TOC (max 5)
    positions = [(-110, -60), (110, -55), (120, 35), (-90, 70), (20, 105)]
    for i, it in enumerate(toc[:5]):
        sid = f"sec{i}"
        x, y = positions[i]
        label = it['title']
        if len(label) > 10:
            label = label[:10]
        nodes.append(
            f"    {{id:'{sid}',label:{js_str(label)},x:{x},y:{y},r:14,color:'#b8900a',cat:'section',url:{js_str(it['href'])},desc:{js_str(it['title'])}}}"
        )
        edges.append(f"    {{from:'self',to:'{sid}'}}")

    # Related cybozu pages (others)
    rel_positions = [(-170, -30), (175, -10), (-150, 110), (170, 95), (0, -120)]
    ri = 0
    for other_slug, short in CYBOZU_LABELS.items():
        if other_slug == slug:
            continue
        if ri >= 5:
            break
        x, y = rel_positions[ri]
        rid = f"rel{ri}"
        href = f"../{other_slug}/"
        full = CYBOZU_FULL_NAMES[other_slug]
        nodes.append(
            f"    {{id:'{rid}',label:{js_str(short)},x:{x},y:{y},r:12,color:'#2a3d6a',cat:'related',url:{js_str(href)},desc:{js_str(full)}}}"
        )
        edges.append(f"    {{from:'self',to:'{rid}'}}")
        ri += 1

    # Extra inter-section edges
    if len(toc) >= 2:
        edges.append("    {from:'sec0',to:'sec1'}")
    if len(toc) >= 4:
        edges.append("    {from:'sec2',to:'sec3'}")

    return ",\n".join(nodes), ",\n".join(edges)


def js_str(s):
    """JSON-safe JS single-quoted string."""
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


GRAPH_JS_TEMPLATE = r"""
/* ===== Knowledge Graph ===== */
(function(){
  var canvas=document.getElementById('graphCanvas');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var dpr=window.devicePixelRatio||1;
  var tooltip=document.getElementById('graphTooltip');
  var ttTitle=document.getElementById('ttTitle');
  var ttCat=document.getElementById('ttCat');
  var ttDesc=document.getElementById('ttDesc');
  var W,H;

  var catLabels={self:'この記事',section:'セクション',related:'関連記事'};

  var nodes=[
__NODES__
  ];

  var edges=[
__EDGES__
  ];

  var connMap={};
  nodes.forEach(function(n){connMap[n.id]=[];});
  edges.forEach(function(e){
    if(connMap[e.from])connMap[e.from].push(e.to);
    if(connMap[e.to])connMap[e.to].push(e.from);
  });
  var defaultLabels={self:true};
  if(connMap.self)connMap.self.forEach(function(id){defaultLabels[id]=true;});

  function findNode(id){for(var i=0;i<nodes.length;i++){if(nodes[i].id===id)return nodes[i];}return null;}

  nodes.forEach(function(n){n.px=0;n.py=0;n.vx=0;n.vy=0;n.hover=false;n.dragging=false;});

  function resize(){
    var rect=canvas.parentElement.getBoundingClientRect();
    W=rect.width;H=window.innerWidth>960?200:240;
    canvas.width=W*dpr;canvas.height=H*dpr;
    canvas.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    nodes.forEach(function(n){
      n.px=W/2+n.x*(W/520)*0.85;
      n.py=H/2+n.y*(H/420)*0.75;
      n.vx=0;n.vy=0;
    });
  }
  resize();
  window.addEventListener('resize',resize);

  function simulate(){
    for(var i=0;i<nodes.length;i++){
      var a=nodes[i];
      for(var j=i+1;j<nodes.length;j++){
        var b=nodes[j];
        var dx=b.px-a.px,dy=b.py-a.py;
        var dist=Math.sqrt(dx*dx+dy*dy)||1;
        var force=180/dist;
        var fx=dx/dist*force,fy=dy/dist*force;
        if(!a.dragging){a.vx-=fx*0.008;a.vy-=fy*0.008;}
        if(!b.dragging){b.vx+=fx*0.008;b.vy+=fy*0.008;}
      }
    }
    edges.forEach(function(e){
      var a=findNode(e.from),b=findNode(e.to);
      if(!a||!b)return;
      var dx=b.px-a.px,dy=b.py-a.py;
      var dist=Math.sqrt(dx*dx+dy*dy)||1;
      var force=(dist-90)*0.0025;
      var fx=dx/dist*force,fy=dy/dist*force;
      if(!a.dragging){a.vx+=fx;a.vy+=fy;}
      if(!b.dragging){b.vx-=fx;b.vy-=fy;}
    });
    nodes.forEach(function(n){
      if(n.dragging)return;
      n.vx+=(W/2-n.px)*0.0002;
      n.vy+=(H/2-n.py)*0.0002;
      n.vx*=0.91;n.vy*=0.91;
      n.px+=n.vx;n.py+=n.vy;
      n.px=Math.max(n.r+10,Math.min(W-n.r-10,n.px));
      n.py=Math.max(n.r+10,Math.min(H-n.r-10,n.py));
    });
  }

  var time=0;
  function draw(){
    time+=0.006;
    simulate();
    ctx.clearRect(0,0,W,H);
    var hovId=null,hovConns={};
    nodes.forEach(function(n){if(n.hover)hovId=n.id;});
    if(hovId){hovConns[hovId]=true;(connMap[hovId]||[]).forEach(function(id){hovConns[id]=true;});}

    edges.forEach(function(e){
      var a=findNode(e.from),b=findNode(e.to);if(!a||!b)return;
      var hl=hovId&&(hovConns[e.from]||hovConns[e.to]);
      ctx.beginPath();ctx.moveTo(a.px,a.py);ctx.lineTo(b.px,b.py);
      ctx.strokeStyle=hl?'rgba(212,170,34,.4)':'rgba(184,144,10,.1)';
      ctx.lineWidth=hl?1.8:0.6;ctx.stroke();
    });

    nodes.forEach(function(n,i){
      var isHov=n.hover;var isConn=hovId&&hovConns[n.id]&&!isHov;
      var pulse=Math.sin(time+i*0.7)*0.06+1;var r=n.r*(isHov?1.2:pulse);
      ctx.beginPath();ctx.arc(n.px,n.py,r+5,0,Math.PI*2);
      ctx.fillStyle=n.color+(isHov?'20':'06');ctx.fill();
      ctx.beginPath();ctx.arc(n.px,n.py,r,0,Math.PI*2);
      ctx.fillStyle=n.color+'18';ctx.fill();
      ctx.strokeStyle=n.color+(isHov?'dd':isConn?'88':'55');
      ctx.lineWidth=isHov?2.5:isConn?1.8:1;ctx.stroke();
      ctx.fillStyle=n.color;
      ctx.beginPath();ctx.arc(n.px,n.py,isHov?4.5:isConn?3:2,0,Math.PI*2);ctx.fill();
      var showLabel=isHov||isConn||(!hovId&&defaultLabels[n.id]);
      if(showLabel){
        var fs=isHov?10:isConn?9:8;
        ctx.font=(isHov?'600':'400')+' '+fs+'px "Noto Serif JP","DM Mono",sans-serif';
        ctx.fillStyle=isHov?'rgba(245,237,224,.95)':isConn?'rgba(245,237,224,.8)':'rgba(245,237,224,.55)';
        ctx.textAlign='center';ctx.fillText(n.label,n.px,n.py+r+12);
      }
    });

    var legend=[{l:'この記事',c:'#d4aa22'},{l:'セクション',c:'#b8900a'},{l:'関連記事',c:'#2a3d6a'}];
    var lx=8,ly=H-10;
    legend.forEach(function(item){
      ctx.fillStyle=item.c;ctx.beginPath();ctx.arc(lx+3,ly,2.5,0,Math.PI*2);ctx.fill();
      ctx.font='400 7px "Noto Serif JP","DM Mono",sans-serif';
      ctx.fillStyle='rgba(245,237,224,.4)';ctx.textAlign='left';
      ctx.fillText(item.l,lx+8,ly+2.5);
      lx+=ctx.measureText(item.l).width+16;
    });
    requestAnimationFrame(draw);
  }
  draw();

  function hitTest(x,y){for(var i=nodes.length-1;i>=0;i--){var n=nodes[i];if(Math.sqrt((x-n.px)*(x-n.px)+(y-n.py)*(y-n.py))<n.r+8)return n;}return null;}
  function getXY(e){var rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)*(W/rect.width),y:(e.clientY-rect.top)*(H/rect.height)};}
  var dragging=null,dragOff={x:0,y:0},dragStart=null;
  canvas.addEventListener('mousemove',function(e){
    var p=getXY(e);
    if(dragging){dragging.px=p.x+dragOff.x;dragging.py=p.y+dragOff.y;dragging.vx=0;dragging.vy=0;return;}
    nodes.forEach(function(n){n.hover=false;});
    var hit=hitTest(p.x,p.y);
    if(hit){hit.hover=true;ttTitle.textContent=hit.label;ttCat.textContent=catLabels[hit.cat]||hit.cat;ttDesc.textContent=hit.desc;tooltip.style.opacity='1';tooltip.style.left=Math.min(hit.px+20,W-160)+'px';tooltip.style.top=(hit.py-55)+'px';canvas.style.cursor='pointer';}
    else{tooltip.style.opacity='0';canvas.style.cursor='grab';}
  });
  canvas.addEventListener('mouseleave',function(){nodes.forEach(function(n){n.hover=false;});tooltip.style.opacity='0';dragging=null;});
  canvas.addEventListener('mousedown',function(e){var p=getXY(e);var hit=hitTest(p.x,p.y);if(hit){dragging=hit;hit.dragging=true;dragOff={x:hit.px-p.x,y:hit.py-p.y};dragStart={x:p.x,y:p.y};canvas.style.cursor='grabbing';}});
  canvas.addEventListener('mouseup',function(e){
    if(dragging){var p=getXY(e);var moved=Math.sqrt((p.x-dragStart.x)*(p.x-dragStart.x)+(p.y-dragStart.y)*(p.y-dragStart.y));dragging.dragging=false;
    if(moved<5&&dragging.url){if(dragging.url.charAt(0)==='#'){var el=document.getElementById(dragging.url.slice(1));if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}else{window.location.href=dragging.url;}}}
    dragging=null;canvas.style.cursor='grab';
  });
  canvas.addEventListener('touchstart',function(e){e.preventDefault();var t=e.touches[0];var rect=canvas.getBoundingClientRect();var mx=(t.clientX-rect.left)*(W/rect.width),my=(t.clientY-rect.top)*(H/rect.height);var hit=hitTest(mx,my);if(hit){dragging=hit;hit.dragging=true;dragOff={x:hit.px-mx,y:hit.py-my};dragStart={x:mx,y:my};}},{passive:false});
  canvas.addEventListener('touchmove',function(e){e.preventDefault();if(!dragging)return;var t=e.touches[0];var rect=canvas.getBoundingClientRect();var mx=(t.clientX-rect.left)*(W/rect.width),my=(t.clientY-rect.top)*(H/rect.height);dragging.px=mx+dragOff.x;dragging.py=my+dragOff.y;dragging.vx=0;dragging.vy=0;},{passive:false});
  canvas.addEventListener('touchend',function(){if(dragging){dragging.dragging=false;if(dragging.url){if(dragging.url.charAt(0)==='#'){var el=document.getElementById(dragging.url.slice(1));if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}else{window.location.href=dragging.url;}}}dragging=null;});
})();
"""


def build_graph_js(nodes_str, edges_str):
    return GRAPH_JS_TEMPLATE.replace("__NODES__", nodes_str).replace("__EDGES__", edges_str)


def process_page(filepath, slug):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    if 'hero-3col' in html:
        print(f"  SKIP (already applied): {slug}")
        return False

    hero = extract_hero(html)
    toc = extract_toc(html)

    if not hero['title_html']:
        print(f"  SKIP (no hero title): {slug}")
        return False
    if not toc:
        print(f"  WARN (no toc): {slug}")

    # 1. Inject CSS before </style> (first occurrence)
    if '</style>' not in html:
        print(f"  SKIP (no </style>): {slug}")
        return False
    html = html.replace('</style>', MORIMORI_ADDON_CSS + '\n</style>', 1)

    # 2. Adjust hero padding to 24px 40px 24px (3-col friendly)
    html = re.sub(
        r"(\.hero\s*\{[^}]*?)padding\s*:\s*\d+px\s+\d+px\s+\d+px",
        r"\1padding:24px 40px 24px",
        html, count=1
    )

    # 3. Replace hero block with 3-col version
    m = HERO_BLOCK_RE.search(html)
    if not m:
        print(f"  SKIP (hero pattern not matched): {slug}")
        return False

    # Reconstruct center column from existing parts
    center_parts = []
    if hero['eyebrow']:
        center_parts.append(f'      <div class="hero-eyebrow">{hero["eyebrow"]}</div>')
    if hero['label']:
        center_parts.append(f'      <div class="hero-label">{hero["label"]}</div>')
    center_parts.append(f'      <h1 class="hero-title">{hero["title_html"]}</h1>')
    center_parts.append(f'      <p class="hero-subtitle">{hero["sub_html"]}</p>')
    if hero['meta_html']:
        center_parts.append(f'      <div class="hero-meta">{hero["meta_html"]}</div>')
    center_block = "\n".join(center_parts)

    qa_links = build_qa_links(toc)

    new_hero = f"""<!-- ── HERO (3-column, morimori) ── -->
<div class="hero">
  <div class="hero-3col">
    <!-- Left: Knowledge Graph -->
    <div class="hero-col-side hero-col-left">
      <div class="graph-card">
        <div class="graph-card-label">KNOWLEDGE GRAPH</div>
        <canvas id="graphCanvas"></canvas>
        <div class="graph-tooltip" id="graphTooltip">
          <div class="graph-tooltip-title" id="ttTitle"></div>
          <div class="graph-tooltip-cat" id="ttCat"></div>
          <div class="graph-tooltip-desc" id="ttDesc"></div>
        </div>
      </div>
    </div>

    <!-- Center -->
    <div class="hero-col-center">
{center_block}
    </div>

    <!-- Right: Quick Actions -->
    <div class="hero-col-side hero-col-right">
      <div class="qa-card">
        <div class="qa-card-label">QUICK START</div>
        <div class="quick-actions-v">
{qa_links}
        </div>
      </div>
    </div>
  </div>
</div>"""

    html = html[:m.start()] + new_hero + html[m.end():]

    # 4. Build graph JS
    title_text = re.sub(r'<[^>]+>', '', hero['title_html']).strip()
    nodes_str, edges_str = build_graph(slug, title_text, toc)
    graph_js = build_graph_js(nodes_str, edges_str)

    scripts_block = f"""
<script>
{graph_js}
</script>
"""
    html = html.replace('</body>', scripts_block + '</body>', 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    return True


def main():
    applied = []
    skipped = []
    for slug in TARGETS:
        filepath = os.path.join(RESEARCH_DIR, slug, "index.html")
        if not os.path.exists(filepath):
            print(f"  MISSING: {filepath}")
            skipped.append(slug)
            continue
        print(f"Processing: {slug}...")
        if process_page(filepath, slug):
            applied.append(slug)
            print(f"  OK: {slug}")
        else:
            skipped.append(slug)

    print("\n=== Summary ===")
    print(f"Applied ({len(applied)}):")
    for s in applied:
        print(f"  - research/{s}/index.html")
    print(f"Skipped ({len(skipped)}):")
    for s in skipped:
        print(f"  - {s}")


if __name__ == '__main__':
    main()
