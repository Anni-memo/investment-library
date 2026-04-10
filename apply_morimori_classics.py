#!/usr/bin/env python3
"""
Classicsページにもりもり版テンプレートを一括適用するスクリプト
- 3カラムヒーロー（Knowledge Graph + タイトル + Quick Actions）
- ナビコックピット（現在地ツリー + 目次）
- MyNote FAB HTML + JS
- Knowledge Graph JS
"""

import os
import re
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLASSICS_DIR = os.path.join(BASE_DIR, "classics")

# 対象ページ
TARGETS = [
    "adversity", "analects", "fukuzawa", "habits", "lives",
    "night-and-fog", "seven-habits", "shibusawa", "thought"
]

# スラッグとタイトルの対応
SLUG_TITLES = {
    "adversity": "逆境と意味の棚",
    "analects": "論語",
    "fukuzawa": "福澤諭吉",
    "habits": "習慣と組織の棚",
    "lives": "人生と生き方の棚",
    "night-and-fog": "夜と霧",
    "seven-habits": "7つの習慣",
    "shibusawa": "渋沢栄一",
    "thought": "古典と思想の棚",
}

# ===== CSS to inject (same as people version) =====
MORIMORI_CSS = """
/* ===== Morimori Template: Hero 3-col ===== */
.hero-3col{display:grid;grid-template-columns:1fr 1.618fr 1fr;gap:28px;max-width:1200px;margin:0 auto;align-items:center;position:relative;}
@media(max-width:960px){.hero-3col{grid-template-columns:1fr;max-width:600px;gap:16px;}}
.hero-col-center{text-align:center;padding:0;}
.hero-col-side{min-width:0;}

/* Graph Card */
.graph-card{background:transparent;border:1px solid rgba(184,144,10,.15);border-radius:4px;position:relative;overflow:hidden;}
.graph-card canvas{display:block;width:100%;cursor:grab;}
.graph-card-label{position:absolute;top:10px;left:14px;font-family:var(--mono);font-size:.46rem;color:rgba(212,170,34,.45);letter-spacing:.2em;z-index:2;pointer-events:none;}
.graph-tooltip{position:absolute;background:rgba(13,15,20,.92);border:1px solid rgba(184,144,10,.25);padding:8px 12px;border-radius:3px;pointer-events:none;opacity:0;transition:opacity .15s;z-index:10;max-width:200px;}
.graph-tooltip-title{font-family:var(--jp);font-size:.72rem;color:var(--parch);font-weight:600;margin-bottom:2px;}
.graph-tooltip-cat{font-family:var(--mono);font-size:.42rem;color:var(--gold3);letter-spacing:.1em;text-transform:uppercase;}
.graph-tooltip-desc{font-family:var(--jp);font-size:.62rem;color:var(--parch3);margin-top:4px;line-height:1.5;}

/* Quick Actions */
.qa-card{background:rgba(184,144,10,.04);border:1px solid rgba(184,144,10,.12);border-radius:4px;padding:14px 16px;}
.qa-card-label{font-family:var(--mono);font-size:.58rem;color:rgba(212,170,34,.45);letter-spacing:.2em;margin-bottom:10px;}
.quick-actions-v{display:flex;flex-direction:column;gap:6px;}
.qa-btn-v{display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(184,144,10,.06);border:1px solid rgba(184,144,10,.15);color:var(--parch3);text-decoration:none;font-family:var(--mono);font-size:.72rem;transition:all .15s;border-radius:3px;}
.qa-btn-v:hover{background:rgba(184,144,10,.15);border-color:var(--gold3);color:var(--parch);}
.qa-btn-v .qa-icon{font-size:.85rem;flex-shrink:0;}

/* Nav Cockpit */
.nav-cockpit{max-width:1200px;margin:0 auto;padding:20px 40px 0;display:grid;grid-template-columns:1fr 1fr;gap:20px;}
.cockpit-panel{background:var(--parch2);border:1px solid var(--parch3);padding:16px 18px;border-radius:4px;}
.cockpit-label{font-family:var(--mono);font-size:.52rem;color:var(--gold);letter-spacing:.18em;margin-bottom:10px;display:flex;align-items:center;gap:10px;}
.cockpit-label::after{content:'';flex:1;height:1px;background:var(--parch4);}
.cockpit-sublabel{font-family:var(--mono);font-size:.42rem;color:var(--ink3);letter-spacing:.1em;opacity:.5;}
.cockpit-tree{font-family:var(--mono);font-size:.68rem;line-height:1.7;}
.ct-item{display:flex;align-items:center;gap:6px;padding:3px 6px;border-radius:3px;transition:background .15s;}
.ct-icon{font-size:.72rem;flex-shrink:0;width:18px;text-align:center;}
.ct-item a{color:var(--ink3);text-decoration:none;transition:color .15s;}
.ct-item a:hover{color:var(--gold);}
.ct-count{font-size:.48rem;color:var(--gold);opacity:.6;margin-left:auto;}
.ct-children{padding-left:20px;position:relative;}
.ct-children::before{content:'';position:absolute;left:8px;top:0;bottom:12px;width:1px;background:rgba(139,105,20,.4);}
.ct-children .ct-item{position:relative;}
.ct-children .ct-item::before{content:'';position:absolute;left:-12px;top:50%;width:10px;height:1.5px;background:rgba(139,105,20,.55);}
.ct-children .ct-item:last-child::after{content:'';position:absolute;left:-12px;top:50%;bottom:0;width:1px;background:var(--parch2);}
.ct-root{opacity:.7;}
.ct-sibling{opacity:.55;}
.ct-sibling:hover{opacity:1;background:rgba(139,105,20,.06);}
.ct-current{background:rgba(139,105,20,.1);border-left:2px solid var(--gold);padding-left:4px;}
.ct-current span:not(.ct-icon){color:var(--gold);font-weight:500;}
.cockpit-reading{font-family:var(--mono);font-size:.46rem;color:var(--gold);letter-spacing:.12em;opacity:.6;margin-top:12px;padding-top:10px;border-top:1px solid var(--parch3);}
.toc-list{list-style:none;padding:0;margin:0;}
.toc-list li{border-bottom:1px solid rgba(139,105,20,.08);}
.toc-list li:last-child{border-bottom:none;}
.toc-list a{font-family:var(--jp);font-size:.76rem;color:var(--ink2);text-decoration:none;display:flex;align-items:baseline;gap:8px;padding:6px 4px;transition:all .15s;font-weight:300;line-height:1.5;}
.toc-list a:hover{color:var(--gold);background:rgba(139,105,20,.04);}
.toc-num{font-family:var(--mono);font-size:.48rem;color:var(--gold);letter-spacing:.05em;flex-shrink:0;min-width:18px;}
@media(max-width:960px){.nav-cockpit{padding:16px 16px 0;gap:12px;}}
@media(max-width:480px){.nav-cockpit{gap:8px;padding:12px 10px 0;}.toc-list a{font-size:.68rem;padding:5px 2px;}.cockpit-panel{padding:12px 14px;}}
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


def extract_hero_info(html):
    """Extract hero-shelf, hero-title, hero-lead."""
    shelf = re.search(r'<div class="hero-shelf">(.*?)</div>', html, re.DOTALL)
    title = re.search(r'<h1 class="hero-title">(.*?)</h1>', html, re.DOTALL)
    lead = re.search(r'<p class="hero-lead">(.*?)</p>', html, re.DOTALL)
    return {
        'shelf': shelf.group(1).strip() if shelf else '',
        'title': title.group(1).strip() if title else '',
        'lead': lead.group(1).strip() if lead else '',
    }


def extract_sections(html):
    """Extract section labels and titles for TOC."""
    sections = []
    for m in re.finditer(r'<div class="section-label">(.*?)</div>\s*<h2 class="section-title">(.*?)</h2>', html, re.DOTALL):
        label = m.group(1).strip()
        title = re.sub(r'<[^>]+>', '', m.group(2)).strip()
        sections.append({'label': label, 'title': title})
    return sections


def extract_nav_current(html):
    """Extract current page name from nav."""
    m = re.search(r'<span class="nav-current">(.*?)</span>', html)
    return m.group(1).strip() if m else ''


def get_related_pages(current_slug):
    """Get up to 4 random related pages from the same section (excluding self)."""
    others = [s for s in TARGETS if s != current_slug]
    random.seed(hash(current_slug))  # deterministic per slug
    selected = random.sample(others, min(4, len(others)))
    return selected


def build_graph_nodes(hero_info, sections, slug):
    """Build Knowledge Graph nodes and edges for classics."""
    nodes = []
    edges = []
    # Self node (article title)
    title_text = re.sub(r'<[^>]+>', '', hero_info['title']).strip()
    nodes.append(f"    {{id:'self',label:'{title_text}',x:0,y:0,r:22,color:'#d4aa22',cat:'self',url:null,desc:'この記事'}}")

    # Section nodes
    sec_positions = [
        (-100, -60), (100, -50), (120, 40), (-80, 70), (30, 100), (-30, -90)
    ]
    for i, sec in enumerate(sections[:6]):
        sid = f"sec{i}"
        num = f"{i+1:02d}"
        x, y = sec_positions[i] if i < len(sec_positions) else (50 * (i % 3 - 1), 60 * (i // 3))
        sec_title = sec['title'][:8]
        nodes.append(f"    {{id:'{sid}',label:'{sec_title}',x:{x},y:{y},r:14,color:'#b8900a',cat:'section',url:'#sec{num}',desc:'{sec['title']}'}}")
        edges.append(f"    {{from:'self',to:'{sid}'}}")

    # Related page nodes
    related = get_related_pages(slug)
    rel_positions = [(-160, -20, 12), (170, 0, 12), (-140, 100, 11), (160, 90, 11)]
    for i, rel_slug in enumerate(related[:4]):
        rid = f"rel{i}"
        rname = SLUG_TITLES[rel_slug][:8]
        full_name = SLUG_TITLES[rel_slug]
        pos = rel_positions[i]
        href = f"../{rel_slug}/"
        nodes.append(f"    {{id:'{rid}',label:'{rname}',x:{pos[0]},y:{pos[1]},r:{pos[2]},color:'#2a3d6a',cat:'related',url:'{href}',desc:'{full_name}'}}")
        edges.append(f"    {{from:'self',to:'{rid}'}}")

    # Extra edges between sections
    if len(sections) >= 2:
        edges.append("    {from:'sec0',to:'sec1'}")
    if len(sections) >= 4:
        edges.append("    {from:'sec2',to:'sec3'}")

    return nodes, edges


def build_graph_js(nodes, edges):
    """Build the full Knowledge Graph JS."""
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

  var catLabels={{self:'\\u3053\\u306e\\u8a18\\u4e8b',section:'\\u30bb\\u30af\\u30b7\\u30e7\\u30f3',related:'\\u95a2\\u9023\\u8a18\\u4e8b'}};
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


def build_toc_html(sections):
    """Build TOC list from sections."""
    items = []
    for i, sec in enumerate(sections):
        num = f"{i+1:02d}"
        items.append(f'      <li><a href="#sec{num}"><span class="toc-num">{num}</span>{sec["title"]}</a></li>')
    return "\n".join(items)


def build_qa_links(sections):
    """Build Quick Action links from first few sections."""
    icons = ["🔍", "⏰", "🧭", "🔄", "📖", "🔗"]
    links = []
    for i, sec in enumerate(sections[:5]):
        num = f"{i+1:02d}"
        icon = icons[i] if i < len(icons) else "📄"
        title_short = sec['title'][:10]
        links.append(f'          <a class="qa-btn-v" href="#sec{num}"><span class="qa-icon">{icon}</span> {title_short}</a>')
    return "\n".join(links)


def add_section_ids(html):
    """Add id attributes to article-sections."""
    counter = [0]
    def replacer(m):
        counter[0] += 1
        num = f"{counter[0]:02d}"
        return f'<div class="article-section" id="sec{num}"'
    html = re.sub(r'<div class="article-section"(?!\s+id=)', replacer, html)
    return html


def process_page(filepath, slug):
    """Apply morimori template to a single classics page."""
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Skip if already has morimori template
    if 'hero-3col' in html:
        print(f"  SKIP (already applied): {slug}")
        return False

    hero = extract_hero_info(html)
    sections = extract_sections(html)
    nav_name = extract_nav_current(html)

    if not hero['title']:
        print(f"  SKIP (no hero title): {slug}")
        return False

    # 1. Add section IDs
    html = add_section_ids(html)

    # 2. Inject CSS before </style>
    html = html.replace('</style>', MORIMORI_CSS + '\n</style>', 1)

    # 3. Update hero padding for 3-col
    html = re.sub(
        r"(\.hero\{[^}]*?)padding:\s*\d+px\s+\d+px\s+\d+px",
        r"\1padding:24px 40px 24px",
        html
    )

    # 4. Replace hero content with 3-column layout
    old_hero = re.search(
        r'<div class="hero">\s*'
        r'(?:<div class="hero-shelf">.*?</div>\s*)?'
        r'(?:<h1 class="hero-title">.*?</h1>\s*)?'
        r'(?:<p class="hero-lead">.*?</p>\s*)?'
        r'</div>',
        html, re.DOTALL
    )

    if not old_hero:
        print(f"  SKIP (hero pattern not matched): {slug}")
        return False

    qa_links = build_qa_links(sections)
    toc_html = build_toc_html(sections)
    read_time = max(5, len(sections) * 2)

    new_hero = f"""<!-- ── HERO (3-column) ── -->
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
      <div class="hero-shelf">{hero['shelf']}</div>
      <h1 class="hero-title">{hero['title']}</h1>
      <p class="hero-lead">{hero['lead']}</p>
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

    html = html[:old_hero.start()] + new_hero + html[old_hero.end():]

    # 5. Add nav-cockpit before <main class="article">
    cockpit = f"""<!-- ── Navigation Cockpit ── -->
<div class="nav-cockpit">
  <div class="cockpit-panel">
    <div class="cockpit-label">現在地 <span class="cockpit-sublabel">YOU ARE HERE</span></div>
    <div class="cockpit-tree">
      <div class="ct-item ct-root"><span class="ct-icon">&#128218;</span><a href="../../">書斎の入口</a></div>
      <div class="ct-children">
        <div class="ct-item ct-folder"><span class="ct-icon">&#128194;</span><a href="../">教養と人間理解</a><span class="ct-count">9</span></div>
        <div class="ct-children">
          <div class="ct-item ct-current"><span class="ct-icon">&#128221;</span><span>{nav_name}</span></div>
        </div>
      </div>
    </div>
    <div class="cockpit-reading">&#128214; APPROX. {read_time} MIN READ</div>
  </div>
  <div class="cockpit-panel">
    <div class="cockpit-label">目次 <span class="cockpit-sublabel">CONTENTS</span></div>
    <ul class="toc-list">
{toc_html}
    </ul>
  </div>
</div>"""

    html = html.replace('<main class="article">', cockpit + '\n\n<main class="article">')

    # 6. Add MyNote FAB HTML before footer
    footer_match = re.search(r'<footer class="footer">', html)
    if footer_match:
        html = html[:footer_match.start()] + MYNOTE_FAB_HTML + "\n" + html[footer_match.start():]

    # 7. Build and add graph JS + MyNote JS before </body>
    graph_nodes, graph_edges = build_graph_nodes(hero, sections, slug)
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
        filepath = os.path.join(CLASSICS_DIR, slug, "index.html")
        if not os.path.exists(filepath):
            print(f"  NOT FOUND: {filepath}")
            skipped += 1
            continue

        print(f"Processing: {slug}...")
        if process_page(filepath, slug):
            applied += 1
            print(f"  OK: {slug}")
        else:
            skipped += 1

    print(f"\nDone! Applied: {applied}, Skipped: {skipped}")


if __name__ == '__main__':
    main()
