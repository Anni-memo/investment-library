#!/usr/bin/env python3
"""
Researchページ「その他3ページ」にもりもり版テンプレートの不足要素を追加するスクリプト
（cockpitは既存、hero-3col / graphCanvas / mynoteFab を追加する）

対象:
- research/buyback-anatomy
- research/cheap-vs-good
- research/operating-margin-screening

既存の nav-cockpit・目次・既存CSSは絶対に削除しない。
既存ヒーロー内容（hero-inner 系）は完全保持したまま、hero-3col でラップし
左に Knowledge Graph、右に Quick Actions を追加する。
"""

import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESEARCH_DIR = os.path.join(BASE_DIR, "research")

TARGETS = [
    "buyback-anatomy",
    "cheap-vs-good",
    "operating-margin-screening",
]

# スラッグ→短縮名（グラフ用）
SLUG_NAMES = {
    "buyback-anatomy": "自社株買い",
    "cheap-vs-good": "安い vs 良い",
    "operating-margin-screening": "営業利益率",
    "keyence-moat": "キーエンス",
    "buffett-shosha": "バフェット商社",
    "tsmc-ecosystem-moat": "TSMC",
    "cybozu-moat": "サイボウズ",
}

ALL_RELATED_SLUGS = list(SLUG_NAMES.keys())

# ===== CSS to inject (cockpit系は既存なので重複させない) =====
MORIMORI_CSS = """
/* ===== Morimori Template: Hero 3-col ===== */
.hero-3col{display:grid;grid-template-columns:1fr 1.618fr 1fr;gap:28px;max-width:1200px;margin:0 auto;align-items:center;position:relative;}
@media(max-width:960px){.hero-3col{grid-template-columns:1fr;max-width:600px;gap:16px;}}
.hero-col-center{text-align:center;padding:0;}
.hero-col-side{min-width:0;}
.hero-col-center .hero-inner{max-width:100%;}

/* Graph Card */
.graph-card{background:transparent;border:1px solid rgba(200,140,80,.2);border-radius:4px;position:relative;overflow:hidden;}
.graph-card canvas{display:block;width:100%;cursor:grab;}
.graph-card-label{position:absolute;top:10px;left:14px;font-family:var(--mono);font-size:.46rem;color:rgba(220,170,110,.55);letter-spacing:.2em;z-index:2;pointer-events:none;}
.graph-tooltip{position:absolute;background:rgba(13,15,20,.92);border:1px solid rgba(200,140,80,.3);padding:8px 12px;border-radius:3px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:10;max-width:200px;}
.graph-tooltip-title{font-family:var(--serif);font-size:.72rem;color:var(--parch);font-weight:600;margin-bottom:2px;}
.graph-tooltip-cat{font-family:var(--mono);font-size:.42rem;color:rgba(220,170,110,.85);letter-spacing:.1em;text-transform:uppercase;}
.graph-tooltip-desc{font-family:var(--serif);font-size:.62rem;color:rgba(220,200,170,.75);margin-top:4px;line-height:1.5;}

/* Quick Actions */
.qa-card{background:rgba(200,140,80,.06);border:1px solid rgba(200,140,80,.18);border-radius:4px;padding:14px 16px;}
.qa-card-label{font-family:var(--mono);font-size:.58rem;color:rgba(220,170,110,.6);letter-spacing:.2em;margin-bottom:10px;}
.quick-actions-v{display:flex;flex-direction:column;gap:6px;}
.qa-btn-v{display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(200,140,80,.08);border:1px solid rgba(200,140,80,.2);color:rgba(220,200,170,.85);text-decoration:none;font-family:var(--mono);font-size:.72rem;transition:all .15s;border-radius:3px;}
.qa-btn-v:hover{background:rgba(200,140,80,.18);border-color:rgba(220,170,110,.6);color:var(--parch);}
.qa-btn-v .qa-icon{font-size:.85rem;flex-shrink:0;}

/* ===== MyNote FAB ===== */
.mynote-fab{position:fixed;right:22px;bottom:22px;width:58px;height:58px;z-index:9998;cursor:pointer;transition:transform .2s;}
.mynote-fab:hover{transform:scale(1.08);}
.mynote-fab-paper{width:100%;height:100%;background:linear-gradient(145deg,#f5ecd8,#e8dcc0);border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,.25),inset 0 1px 2px rgba(255,255,255,.4);position:relative;overflow:hidden;border:1px solid rgba(139,105,20,.3);}
.mynote-fab-lines{position:absolute;inset:10px 8px;background-image:repeating-linear-gradient(transparent 0,transparent 6px,rgba(139,105,20,.18) 6px,rgba(139,105,20,.18) 7px);}
.mynote-fab-text{position:absolute;bottom:6px;left:0;right:0;text-align:center;font-family:var(--mono,monospace);font-size:.44rem;color:rgba(80,55,10,.75);letter-spacing:.12em;}
.mynote-fab-streak{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;padding:0 5px;background:#d4aa22;color:#1a1208;border-radius:9px;font-family:var(--mono,monospace);font-size:.6rem;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.3);}
.mynote-fab-streak:empty{display:none;}
.mynote-panel{position:fixed;right:22px;bottom:90px;width:320px;max-width:calc(100vw - 44px);max-height:calc(100vh - 120px);background:#f5ecd8;border:1px solid rgba(139,105,20,.4);border-radius:6px;box-shadow:0 12px 36px rgba(0,0,0,.35);z-index:9999;display:none;flex-direction:column;overflow:hidden;}
.mynote-panel.open{display:flex;}
.mynote-panel-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid rgba(139,105,20,.2);background:rgba(139,105,20,.08);}
.mynote-panel-title{font-family:var(--mono,monospace);font-size:.62rem;color:rgba(80,55,10,.85);letter-spacing:.18em;}
.mynote-panel-close{background:none;border:none;font-size:1.2rem;color:rgba(80,55,10,.7);cursor:pointer;line-height:1;}
.mynote-panel-body{padding:14px;overflow-y:auto;flex:1;}
.mynote-card-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
.mynote-card-nav-btn{background:none;border:1px solid rgba(139,105,20,.3);color:rgba(80,55,10,.8);padding:2px 10px;border-radius:3px;cursor:pointer;font-family:var(--mono,monospace);}
.mynote-card-nav-date{font-family:var(--mono,monospace);font-size:.7rem;color:rgba(80,55,10,.85);}
#mcText{width:100%;min-height:100px;background:transparent;border:none;outline:none;resize:none;font-family:var(--serif,serif);font-size:.82rem;color:#2a1f08;line-height:1.8;background-image:repeating-linear-gradient(transparent 0,transparent 27px,rgba(139,105,20,.2) 27px,rgba(139,105,20,.2) 28px);}
.mynote-card-status{display:flex;justify-content:space-between;margin-top:8px;font-family:var(--mono,monospace);font-size:.52rem;color:rgba(80,55,10,.55);}
.mynote-card-saved{opacity:0;transition:opacity .3s;}
.mynote-card-saved.visible{opacity:1;}
.mynote-card-streak{display:block;margin-top:6px;font-family:var(--mono,monospace);font-size:.58rem;color:#b8900a;}
.mynote-card-calendar{margin-top:14px;padding-top:10px;border-top:1px solid rgba(139,105,20,.2);}
.mynote-card-calendar-label{font-family:var(--mono,monospace);font-size:.5rem;color:rgba(80,55,10,.6);letter-spacing:.14em;margin-bottom:6px;}
.mynote-card-calendar-weekdays{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;font-family:var(--mono,monospace);font-size:.46rem;color:rgba(80,55,10,.5);text-align:center;margin-bottom:4px;}
.mynote-card-calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
.mc-day{aspect-ratio:1;border:1px solid rgba(139,105,20,.15);border-radius:2px;}
.mc-day.has-note{background:#d4aa22;border-color:#b8900a;}
.mc-day.today{box-shadow:0 0 0 1px #8b4513;}
.mc-day.future{opacity:.3;}
.mynote-card-challenge{margin-top:10px;font-family:var(--mono,monospace);font-size:.52rem;color:rgba(80,55,10,.7);letter-spacing:.06em;}
.mynote-card-challenge-bar{margin-top:4px;height:4px;background:rgba(139,105,20,.15);border-radius:2px;overflow:hidden;}
.mynote-card-challenge-fill{height:100%;background:linear-gradient(90deg,#d4aa22,#b8900a);transition:width .4s;}
"""

MYNOTE_FAB_HTML = """
<!-- MyNote FAB -->
<div class="mynote-fab" id="mynoteFab">
  <div class="mynote-fab-paper">
    <div class="mynote-fab-lines"></div>
    <div class="mynote-fab-text">MY NOTE</div>
    <span class="mynote-fab-streak" id="mcFabStreak"></span>
  </div>
</div>
<div class="mynote-panel" id="mynotePanel">
  <div class="mynote-panel-header">
    <span class="mynote-panel-title">MY NOTE</span>
    <button class="mynote-panel-close" id="mynoteClose">&times;</button>
  </div>
  <div class="mynote-panel-body">
    <div class="mynote-card-nav">
      <button class="mynote-card-nav-btn" id="mcPrev">&larr;</button>
      <span class="mynote-card-nav-date" id="mcDate"></span>
      <button class="mynote-card-nav-btn" id="mcNext">&rarr;</button>
    </div>
    <textarea id="mcText" placeholder="今日の気づきを書く..."></textarea>
    <div class="mynote-card-status">
      <span class="mynote-card-saved" id="mcSaved">saved</span>
      <span class="mynote-card-wordcount" id="mcWc"></span>
    </div>
    <span class="mynote-card-streak" id="mcStreak"></span>
    <div class="mynote-card-calendar">
      <div class="mynote-card-calendar-label">THIS MONTH</div>
      <div class="mynote-card-calendar-weekdays"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
      <div class="mynote-card-calendar-grid" id="mcCalendar"></div>
    </div>
    <div class="mynote-card-challenge" id="mcChallenge"></div>
    <div class="mynote-card-challenge-bar"><div class="mynote-card-challenge-fill" id="mcChallengeFill"></div></div>
  </div>
</div>
"""

MYNOTE_JS = """
/* ===== MyNote FAB ===== */
(function(){
  const STORAGE_PREFIX='myNote_';
  const fab=document.getElementById('mynoteFab');
  const panel=document.getElementById('mynotePanel');
  const closeBtn=document.getElementById('mynoteClose');
  const textarea=document.getElementById('mcText');
  const savedEl=document.getElementById('mcSaved');
  const wcEl=document.getElementById('mcWc');
  const dateEl=document.getElementById('mcDate');
  const prevBtn=document.getElementById('mcPrev');
  const nextBtn=document.getElementById('mcNext');
  const streakEl=document.getElementById('mcStreak');
  const fabStreakEl=document.getElementById('mcFabStreak');
  const calendarEl=document.getElementById('mcCalendar');
  const challengeEl=document.getElementById('mcChallenge');
  const challengeFill=document.getElementById('mcChallengeFill');
  if(!fab||!panel)return;
  let currentDate=new Date().toISOString().slice(0,10);
  let saveTimer;
  function getNote(date){return localStorage.getItem(STORAGE_PREFIX+date)||'';}
  function setNote(date,val){if(val.trim())localStorage.setItem(STORAGE_PREFIX+date,val);else localStorage.removeItem(STORAGE_PREFIX+date);}
  function hasNote(date){return!!localStorage.getItem(STORAGE_PREFIX+date);}
  function render(){dateEl.textContent=currentDate;textarea.value=getNote(currentDate);updateWc();updateStreak();renderCalendar();renderChallenge();}
  function updateWc(){const len=(textarea.value||'').length;wcEl.textContent=len?len+' chars':'';}
  function save(){setNote(currentDate,textarea.value);savedEl.classList.add('visible');setTimeout(()=>savedEl.classList.remove('visible'),1200);renderCalendar();renderChallenge();updateStreak();}
  function getStreak(){let streak=0,d=new Date();while(true){const k=d.toISOString().slice(0,10);if(hasNote(k)){streak++;d.setDate(d.getDate()-1);}else break;}return streak;}
  function updateStreak(){const streak=getStreak();streakEl.textContent=streak?streak+'d streak':'';fabStreakEl.textContent=streak||'';}
  function renderCalendar(){if(!calendarEl)return;calendarEl.innerHTML='';const d=new Date(currentDate);const year=d.getFullYear(),month=d.getMonth();const firstDay=new Date(year,month,1).getDay();const daysInMonth=new Date(year,month+1,0).getDate();const today=new Date().toISOString().slice(0,10);const offset=(firstDay+6)%7;for(let i=0;i<offset;i++){const el=document.createElement('div');el.className='mc-day';el.style.opacity='0';calendarEl.appendChild(el);}for(let day=1;day<=daysInMonth;day++){const dateStr=year+'-'+String(month+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');const el=document.createElement('div');el.className='mc-day';if(hasNote(dateStr)){el.classList.add('has-note');if(dateStr===today)el.classList.add('today');}else if(dateStr>today)el.classList.add('future');calendarEl.appendChild(el);}}
  function renderChallenge(){if(!challengeEl||!challengeFill)return;const totalDays=66;const streak=getStreak();const pct=Math.min(streak/totalDays*100,100);challengeEl.textContent='66-DAY CHALLENGE: '+streak+' / '+totalDays+(streak>=totalDays?' \\u2714':'');challengeFill.style.width=pct+'%';}
  function shift(days){const d=new Date(currentDate);d.setDate(d.getDate()+days);currentDate=d.toISOString().slice(0,10);render();}
  fab.addEventListener('click',()=>panel.classList.toggle('open'));
  closeBtn.addEventListener('click',()=>panel.classList.remove('open'));
  textarea.addEventListener('input',()=>{updateWc();clearTimeout(saveTimer);saveTimer=setTimeout(save,500);});
  prevBtn.addEventListener('click',()=>shift(-1));
  nextBtn.addEventListener('click',()=>shift(1));
  textarea.addEventListener('input',function(){this.style.height='auto';this.style.height=Math.max(100,this.scrollHeight)+'px';});
  render();
})();
"""


def extract_sections_from_toc(html):
    """既存の目次 (<ol class="toc-list">...<li><a href="#X">title</a></li>...) から抽出"""
    sections = []
    toc_match = re.search(r'<(?:ol|ul) class="toc-list">(.*?)</(?:ol|ul)>', html, re.DOTALL)
    if not toc_match:
        return sections
    toc_body = toc_match.group(1)
    for m in re.finditer(r'<li[^>]*>\s*<a[^>]*href="(#[^"]+)"[^>]*>(.*?)</a>', toc_body, re.DOTALL):
        href = m.group(1)
        title = re.sub(r'<[^>]+>', '', m.group(2)).strip()
        sections.append({'href': href, 'title': title})
    return sections


def extract_hero_inner(html):
    """<div class="hero"><div class="hero-inner">...</div></div> の中身と title を取得。"""
    m = re.search(r'<div class="hero">\s*(<div class="hero-inner">.*?</div>)\s*</div>', html, re.DOTALL)
    if not m:
        return None, None, None
    inner_full = m.group(1)
    title_m = re.search(r'<h1 class="hero-title">(.*?)</h1>', inner_full, re.DOTALL)
    title = title_m.group(1).strip() if title_m else ''
    return m, inner_full, title


def get_related_slugs(current_slug):
    related = [s for s in ALL_RELATED_SLUGS if s != current_slug]
    return related[:4]


def build_graph_nodes(title, sections, current_slug):
    nodes = []
    edges = []
    name = re.sub(r'<[^>]+>', '', title).strip()
    short_name = SLUG_NAMES.get(current_slug, name[:8])
    nodes.append(f"    {{id:'self',label:'{short_name}',x:0,y:0,r:22,color:'#d4aa22',cat:'self',url:null,desc:'{name}'}}")

    sec_positions = [(-100,-60),(100,-50),(120,40),(-80,70),(30,100)]
    for i, sec in enumerate(sections[:5]):
        sid = f"sec{i}"
        label = sec['title'][:8]
        x, y = sec_positions[i]
        # 既存ID (#sec-xxx) をそのまま使う
        href = sec['href']
        desc = sec['title'].replace("'", "\\'")
        nodes.append(f"    {{id:'{sid}',label:'{label}',x:{x},y:{y},r:14,color:'#b8900a',cat:'section',url:'{href}',desc:'{desc}'}}")
        edges.append(f"    {{from:'self',to:'{sid}'}}")

    related_slugs = get_related_slugs(current_slug)
    rel_positions = [(-160,-20,12),(170,0,12),(-140,100,11),(160,90,11)]
    for i, slug in enumerate(related_slugs):
        rid = f"rel{i}"
        rname = SLUG_NAMES.get(slug, slug[:8])
        pos = rel_positions[i]
        href = f"../{slug}/"
        nodes.append(f"    {{id:'{rid}',label:'{rname}',x:{pos[0]},y:{pos[1]},r:{pos[2]},color:'#2a3d6a',cat:'related',url:'{href}',desc:'{rname}'}}")
        edges.append(f"    {{from:'self',to:'{rid}'}}")

    if len(sections) >= 2:
        edges.append("    {from:'sec0',to:'sec1'}")
    if len(sections) >= 4:
        edges.append("    {from:'sec2',to:'sec3'}")

    return nodes, edges


def build_graph_js(nodes, edges):
    nodes_str = ",\n".join(nodes)
    edges_str = ",\n".join(edges)
    return f"""
/* ===== Knowledge Graph ===== */
(function(){{
  var canvas=document.getElementById('graphCanvas');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var dpr=window.devicePixelRatio||1;
  var tooltip=document.getElementById('graphTooltip');
  var ttTitle=document.getElementById('ttTitle');
  var ttCat=document.getElementById('ttCat');
  var ttDesc=document.getElementById('ttDesc');
  var W,H;

  var catLabels={{self:'この記事',section:'セクション',related:'関連記事'}};
  var catColors={{self:'#d4aa22',section:'#b8900a',related:'#2a3d6a'}};

  var nodes=[
{nodes_str}
  ];

  var edges=[
{edges_str}
  ];

  var connMap={{}};
  nodes.forEach(function(n){{connMap[n.id]=[];}});
  edges.forEach(function(e){{
    if(connMap[e.from])connMap[e.from].push(e.to);
    if(connMap[e.to])connMap[e.to].push(e.from);
  }});
  var defaultLabels={{self:true}};
  if(connMap.self)connMap.self.forEach(function(id){{defaultLabels[id]=true;}});

  function findNode(id){{for(var i=0;i<nodes.length;i++){{if(nodes[i].id===id)return nodes[i];}}return null;}}

  nodes.forEach(function(n){{n.px=0;n.py=0;n.vx=0;n.vy=0;n.hover=false;n.dragging=false;}});

  function resize(){{
    var rect=canvas.parentElement.getBoundingClientRect();
    W=rect.width;H=window.innerWidth>960?200:240;
    canvas.width=W*dpr;canvas.height=H*dpr;
    canvas.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    nodes.forEach(function(n){{
      n.px=W/2+n.x*(W/520)*0.85;
      n.py=H/2+n.y*(H/420)*0.75;
      n.vx=0;n.vy=0;
    }});
  }}
  resize();
  window.addEventListener('resize',resize);

  function simulate(){{
    for(var i=0;i<nodes.length;i++){{
      var a=nodes[i];
      for(var j=i+1;j<nodes.length;j++){{
        var b=nodes[j];
        var dx=b.px-a.px,dy=b.py-a.py;
        var dist=Math.sqrt(dx*dx+dy*dy)||1;
        var force=180/dist;
        var fx=dx/dist*force,fy=dy/dist*force;
        if(!a.dragging){{a.vx-=fx*0.008;a.vy-=fy*0.008;}}
        if(!b.dragging){{b.vx+=fx*0.008;b.vy+=fy*0.008;}}
      }}
    }}
    edges.forEach(function(e){{
      var a=findNode(e.from),b=findNode(e.to);
      if(!a||!b)return;
      var dx=b.px-a.px,dy=b.py-a.py;
      var dist=Math.sqrt(dx*dx+dy*dy)||1;
      var force=(dist-90)*0.0025;
      var fx=dx/dist*force,fy=dy/dist*force;
      if(!a.dragging){{a.vx+=fx;a.vy+=fy;}}
      if(!b.dragging){{b.vx-=fx;b.vy-=fy;}}
    }});
    nodes.forEach(function(n){{
      if(n.dragging)return;
      n.vx+=(W/2-n.px)*0.0002;
      n.vy+=(H/2-n.py)*0.0002;
      n.vx*=0.91;n.vy*=0.91;
      n.px+=n.vx;n.py+=n.vy;
      n.px=Math.max(n.r+10,Math.min(W-n.r-10,n.px));
      n.py=Math.max(n.r+10,Math.min(H-n.r-10,n.py));
    }});
  }}

  var time=0;
  function draw(){{
    time+=0.006;
    simulate();
    ctx.clearRect(0,0,W,H);
    var hovId=null,hovConns={{}};
    nodes.forEach(function(n){{if(n.hover)hovId=n.id;}});
    if(hovId){{hovConns[hovId]=true;(connMap[hovId]||[]).forEach(function(id){{hovConns[id]=true;}});}};

    edges.forEach(function(e){{
      var a=findNode(e.from),b=findNode(e.to);if(!a||!b)return;
      var hl=hovId&&(hovConns[e.from]||hovConns[e.to]);
      ctx.beginPath();ctx.moveTo(a.px,a.py);ctx.lineTo(b.px,b.py);
      ctx.strokeStyle=hl?'rgba(212,170,34,.4)':'rgba(184,144,10,.08)';
      ctx.lineWidth=hl?1.8:0.6;ctx.stroke();
    }});

    nodes.forEach(function(n,i){{
      var isHov=n.hover;var isConn=hovId&&hovConns[n.id]&&!isHov;
      var pulse=Math.sin(time+i*0.7)*0.06+1;var r=n.r*(isHov?1.2:pulse);
      ctx.beginPath();ctx.arc(n.px,n.py,r+5,0,Math.PI*2);
      ctx.fillStyle=n.color+(isHov?'20':'06');ctx.fill();
      ctx.beginPath();ctx.arc(n.px,n.py,r,0,Math.PI*2);
      ctx.fillStyle=n.color+'18';ctx.fill();
      ctx.strokeStyle=n.color+(isHov?'dd':isConn?'88':'44');
      ctx.lineWidth=isHov?2.5:isConn?1.8:1;ctx.stroke();
      ctx.fillStyle=n.color;
      ctx.beginPath();ctx.arc(n.px,n.py,isHov?4.5:isConn?3:2,0,Math.PI*2);ctx.fill();
      var showLabel=isHov||isConn||(!hovId&&defaultLabels[n.id]);
      if(showLabel){{
        var fs=isHov?10:isConn?9:8;
        ctx.font=(isHov?'600':'400')+' '+fs+'px "Noto Serif JP","DM Mono",sans-serif';
        ctx.fillStyle=isHov?'rgba(245,237,224,.95)':isConn?'rgba(245,237,224,.8)':'rgba(245,237,224,.5)';
        ctx.textAlign='center';ctx.fillText(n.label,n.px,n.py+r+12);
      }}
    }});

    var legend=[{{l:'\\u3053\\u306e\\u8a18\\u4e8b',c:'#d4aa22'}},{{l:'\\u30bb\\u30af\\u30b7\\u30e7\\u30f3',c:'#b8900a'}},{{l:'\\u95a2\\u9023\\u8a18\\u4e8b',c:'#2a3d6a'}}];
    var lx=8,ly=H-10;
    legend.forEach(function(item){{
      ctx.fillStyle=item.c;ctx.beginPath();ctx.arc(lx+3,ly,2.5,0,Math.PI*2);ctx.fill();
      ctx.font='400 7px "Noto Serif JP","DM Mono",sans-serif';
      ctx.fillStyle='rgba(245,237,224,.35)';ctx.textAlign='left';
      ctx.fillText(item.l,lx+8,ly+2.5);
      lx+=ctx.measureText(item.l).width+16;
    }});
    requestAnimationFrame(draw);
  }}
  draw();

  function hitTest(x,y){{for(var i=nodes.length-1;i>=0;i--){{var n=nodes[i];if(Math.sqrt((x-n.px)*(x-n.px)+(y-n.py)*(y-n.py))<n.r+8)return n;}}return null;}}
  function getXY(e){{var rect=canvas.getBoundingClientRect();return{{x:(e.clientX-rect.left)*(W/rect.width),y:(e.clientY-rect.top)*(H/rect.height)}};}}
  var dragging=null,dragOff={{x:0,y:0}},dragStart=null;
  canvas.addEventListener('mousemove',function(e){{
    var p=getXY(e);
    if(dragging){{dragging.px=p.x+dragOff.x;dragging.py=p.y+dragOff.y;dragging.vx=0;dragging.vy=0;return;}}
    nodes.forEach(function(n){{n.hover=false;}});
    var hit=hitTest(p.x,p.y);
    if(hit){{hit.hover=true;ttTitle.textContent=hit.label;ttCat.textContent=catLabels[hit.cat]||hit.cat;ttDesc.textContent=hit.desc;tooltip.style.opacity='1';tooltip.style.left=Math.min(hit.px+20,W-160)+'px';tooltip.style.top=(hit.py-55)+'px';canvas.style.cursor='pointer';}}
    else{{tooltip.style.opacity='0';canvas.style.cursor='grab';}}
  }});
  canvas.addEventListener('mouseleave',function(){{nodes.forEach(function(n){{n.hover=false;}});tooltip.style.opacity='0';dragging=null;}});
  canvas.addEventListener('mousedown',function(e){{var p=getXY(e);var hit=hitTest(p.x,p.y);if(hit){{dragging=hit;hit.dragging=true;dragOff={{x:hit.px-p.x,y:hit.py-p.y}};dragStart={{x:p.x,y:p.y}};canvas.style.cursor='grabbing';}}}});
  canvas.addEventListener('mouseup',function(e){{
    if(dragging){{var p=getXY(e);var moved=Math.sqrt((p.x-dragStart.x)*(p.x-dragStart.x)+(p.y-dragStart.y)*(p.y-dragStart.y));dragging.dragging=false;
    if(moved<5&&dragging.url){{if(dragging.url.startsWith('#')){{var el=document.getElementById(dragging.url.slice(1));if(el)el.scrollIntoView({{behavior:'smooth',block:'start'}});}}else{{window.open(dragging.url,'_blank');}}}}}}
    dragging=null;canvas.style.cursor='grab';
  }});
  canvas.addEventListener('touchstart',function(e){{e.preventDefault();var t=e.touches[0];var rect=canvas.getBoundingClientRect();var mx=(t.clientX-rect.left)*(W/rect.width),my=(t.clientY-rect.top)*(H/rect.height);var hit=hitTest(mx,my);if(hit){{dragging=hit;hit.dragging=true;dragOff={{x:hit.px-mx,y:hit.py-my}};dragStart={{x:mx,y:my}};}}}},{{passive:false}});
  canvas.addEventListener('touchmove',function(e){{e.preventDefault();if(!dragging)return;var t=e.touches[0];var rect=canvas.getBoundingClientRect();var mx=(t.clientX-rect.left)*(W/rect.width),my=(t.clientY-rect.top)*(H/rect.height);dragging.px=mx+dragOff.x;dragging.py=my+dragOff.y;dragging.vx=0;dragging.vy=0;}},{{passive:false}});
  canvas.addEventListener('touchend',function(){{if(dragging){{dragging.dragging=false;if(dragging.url){{if(dragging.url.startsWith('#')){{var el=document.getElementById(dragging.url.slice(1));if(el)el.scrollIntoView({{behavior:'smooth',block:'start'}});}}else{{window.open(dragging.url,'_blank');}}}}}}dragging=null;}});
}})();
"""


def build_qa_links(sections):
    icons = ["\U0001F50D", "\u23F0", "\U0001F9ED", "\U0001F504", "\U0001F4D6", "\U0001F517"]
    links = []
    for i, sec in enumerate(sections[:5]):
        icon = icons[i] if i < len(icons) else "\U0001F4C4"
        title_short = sec['title'][:10]
        href = sec['href']
        links.append(f'          <a class="qa-btn-v" href="{href}"><span class="qa-icon">{icon}</span> {title_short}</a>')
    return "\n".join(links)


def add_article_section_ids(html):
    """既にIDがない article-section があれば連番で付与 (このテンプレ群はh2に既存IDあり、通常ヒットしない)"""
    counter = [0]
    def replacer(m):
        counter[0] += 1
        num = f"{counter[0]:02d}"
        return f'<div class="article-section" id="sec{num}"'
    return re.sub(r'<div class="article-section"(?!\s+id=)', replacer, html)


def repair_previous_corruption(html):
    """直前の壊れた適用を除去してクリーンな状態に戻す。"""
    # 壊れた Morimori CSS ブロック (先頭マーカーから、mynote-card-challenge-fill まで) を削除
    pattern_css = re.compile(
        r"\n?/\* ===== Morimori Template: Hero 3-col ===== \*/.*?transition:width \.4s;\}\n?",
        re.DOTALL,
    )
    html = pattern_css.sub("", html)
    # 先に挿入された MyNote FAB HTML ブロック全体を削除 (<!-- MyNote FAB --> から次の <footer> 直前まで)
    pattern_fab = re.compile(
        r"\n?<!-- MyNote FAB -->\s*<div class=\"mynote-fab\" id=\"mynoteFab\">.*?(?=<footer)",
        re.DOTALL,
    )
    html = pattern_fab.sub("\n", html)
    # 末尾 </body> 直前に挿入された <script>…</script> ブロックを削除
    pattern_scripts = re.compile(
        r"\n?<script>\s*/\* ===== Knowledge Graph ===== \*/.*?</script>\s*",
        re.DOTALL,
    )
    html = pattern_scripts.sub("\n", html)
    return html


def process_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    slug = os.path.basename(os.path.dirname(filepath))

    # 壊れた以前の適用があれば除去
    if 'Morimori Template: Hero 3-col' in html or '<div class="mynote-fab"' in html:
        print(f"  REPAIR: removing previous corrupted application: {slug}")
        html = repair_previous_corruption(html)

    if 'hero-3col' in html:
        print(f"  SKIP (still has hero-3col after repair): {slug}")
        return False

    sections = extract_sections_from_toc(html)
    if not sections:
        print(f"  WARN (no TOC sections found): {slug}")

    # 1. セクションID付与 (article-section 用・このテンプレでは通常ヒットしない)
    html = add_article_section_ids(html)

    # 2. CSS を </style> の直前に挿入
    html = html.replace('</style>', MORIMORI_CSS + '\n</style>', 1)

    # 3. hero padding を 24px 40px 24px に調整
    html = re.sub(
        r"(\.hero\s*\{[^}]*?)padding:\s*\d+px\s+\d+px(?:\s+\d+px)?",
        r"\1padding:24px 40px 24px",
        html
    )

    # 4. hero 内を 3-column にラップ (CSS 挿入後に body 内のヒーローを抽出する)
    # style ブロック除外用に、まず <body> 以降のみを対象にする
    body_start = html.find('<body')
    if body_start == -1:
        print(f"  SKIP (no <body>): {slug}")
        return False

    hero_re = re.compile(
        r'<div class="hero">\s*(<div class="hero-inner">.*?</div>)\s*</div>',
        re.DOTALL,
    )
    hero_match = hero_re.search(html, body_start)
    if not hero_match:
        print(f"  SKIP (hero-inner pattern not matched in body): {slug}")
        return False

    hero_inner_full = hero_match.group(1)
    title_m = re.search(r'<h1 class="hero-title">(.*?)</h1>', hero_inner_full, re.DOTALL)
    title = title_m.group(1).strip() if title_m else ''

    qa_links = build_qa_links(sections)
    new_hero_block = f"""<!-- \u2500\u2500 HERO (3-column, Morimori) \u2500\u2500 -->
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

    <!-- Center: 既存ヒーロー内容を完全保持 -->
    <div class="hero-col-center">
      {hero_inner_full}
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

    html = html[:hero_match.start()] + new_hero_block + html[hero_match.end():]

    # 5. MyNote FAB を footer (site-footer or footer) の直前に挿入
    footer_pattern = re.search(r'<footer\s+class="(?:site-footer|footer)"', html)
    if footer_pattern:
        html = html[:footer_pattern.start()] + MYNOTE_FAB_HTML + "\n" + html[footer_pattern.start():]

    # 6. Knowledge Graph JS + MyNote JS を </body> の直前に追加
    graph_nodes, graph_edges = build_graph_nodes(title, sections, slug)
    graph_js = build_graph_js(graph_nodes, graph_edges)

    scripts_block = f"""
<script>
{graph_js}
{MYNOTE_JS}
</script>
"""
    html = html.replace('</body>', scripts_block + '</body>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

    return True


def main():
    applied = 0
    skipped = 0
    for slug in TARGETS:
        filepath = os.path.join(RESEARCH_DIR, slug, "index.html")
        if not os.path.exists(filepath):
            print(f"  NOT FOUND: {filepath}")
            skipped += 1
            continue
        print(f"Processing: {slug}...")
        if process_page(filepath):
            applied += 1
            print(f"  OK: {slug}")
        else:
            skipped += 1
    print(f"\nDone! Applied: {applied}, Skipped: {skipped}")


if __name__ == '__main__':
    main()
