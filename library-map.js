/* ═══════════════════════════════════════════════════════
   library-map.js – 書庫地図 v4 (The Living Library)
   Central Grand Reading Hall · Varied room archetypes
   Silence gradients · Stationary NPCs · Canvas optimized
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ══════════════════════════════════════
     1. CONSTANTS & COLORS
     ══════════════════════════════════════ */
  var CW = 1400, CH = 740;
  var OW = 10; // outer wall thickness
  var IW = 4;  // inner wall thickness
  var DOOR = 36; // doorway opening width

  var C = {
    bg: '#0a0804',
    wallOuter: '#1a1208', wallMid: '#3a2a18', wallInner: '#4a3520', wallHighlight: '#5a4530',
    woodDark: '#3a2410', woodMid: '#5a3a18', woodLight: '#7a5a30',
    bookRed:'#8b3a1a', bookBlue:'#2a3d6a', bookGreen:'#2a4a1a', bookGold:'#d4aa22',
    bookBrown:'#5a3a1a', bookMaroon:'#6a2030', bookPurple:'#4a2a6a', bookTeal:'#2a5a5a',
    bookRed2:'#a04828', bookBlue2:'#3a5080', bookGreen2:'#3a6028',
    gold: '#d4aa22', gold2: '#b8900a', gold3: '#f0cc55',
    parch: '#f5ede0', ink: '#1a1208',
    paper: '#f0e8d0', candle: '#e08020', flame: '#f0d040',
    sconce: '#b8900a'
  };

  var CARPET_COLORS = {
    entrance:   {a:'#4a3a20',b:'#5a4a30'},
    principles: {a:'#4a2a2a',b:'#5a3535'},
    moat:       {a:'#2a3a5a',b:'#3a4a6a'},
    companies:  {a:'#2a4a3a',b:'#3a5a4a'},
    hub:        {a:'#5a3828',b:'#6a4838'},
    fcf:        {a:'#4a2a2a',b:'#5a3535'},
    research:   {a:'#3a3a20',b:'#4a4a30'},
    news:       {a:'#3a2a3a',b:'#4a3a4a'},
    horizons:   {a:'#2a3a4a',b:'#3a4a5a'},
    finhistory: {a:'#3a2a20',b:'#4a3a30'},
    corridor:   {a:'#2a3a2a',b:'#3a4a3a'}
  };

  /* ══════════════════════════════════════
     2. ROOM LAYOUT (v4 — Hub-centric, varied sizes)
     ══════════════════════════════════════ */
  var IX = OW, IY = OW;
  var IW_TOTAL = CW - OW * 2, IH_TOTAL = CH - OW * 2;

  // Row heights (varied for emphasis)
  var RH1 = 170, RH2 = 250, RH3 = 140, RH4 = IH_TOTAL - RH1 - RH2 - RH3;
  // Rows 1-2 share column breaks (aligned walls)
  // Symmetric: COL_A === COL_C, hub center === canvas center (CW/2)
  var COL_A = 420, COL_B = 540, COL_C = IW_TOTAL - COL_A - COL_B;
  // Row 3: R3_A === R3_D (outer symmetric), R3_B === R3_C (inner symmetric)
  var R3_A = 330, R3_B = 360, R3_C = 360, R3_D = IW_TOTAL - R3_A - R3_B - R3_C;

  var ROOMS = {
    entrance:   { x:IX,            y:IY,                w:COL_A,    h:RH1, label:'はじめての資産形成',  labelEn:'BEGINNER\'S GUIDE',  sub:'投資図書館の歩き方',             url:'hajimete/',                    floor:'stone'  },
    principles: { x:IX+COL_A,      y:IY,                w:COL_B,    h:RH1, label:'私の投資原則',       labelEn:'MY PRINCIPLES',      sub:'バフェット・マンガー・フィッシャー', url:'principles/',                  floor:'wood'   },
    moat:       { x:IX+COL_A+COL_B,y:IY,                w:COL_C,    h:RH1, label:'強い会社の見抜き方',  labelEn:'COMPETITIVE MOAT',   sub:'moat / 競争優位を学ぶ',          url:'moat/',                        floor:'ornate' },
    companies:  { x:IX,            y:IY+RH1,            w:COL_A,    h:RH2, label:'企業研究室',         labelEn:'COMPANY RESEARCH',   sub:'企業分析と銘柄研究',             url:'companies/',                   floor:'wood'   },
    hub:        { x:IX+COL_A,      y:IY+RH1,            w:COL_B,    h:RH2, label:'NISAではじめる',     labelEn:'START WITH NISA',    sub:'はじめての資産形成',              url:null,                           floor:'marble' },
    fcf:        { x:IX+COL_A+COL_B,y:IY+RH1,            w:COL_C,    h:RH2, label:'企業の稼ぐ力',       labelEn:'CASH FLOW POWER',    sub:'FCF / キャッシュ創出力',          url:'fcf/',                         floor:'wood'   },
    research:   { x:IX,            y:IY+RH1+RH2,        w:R3_A,     h:RH3, label:'学びの書庫',         labelEn:'RESEARCH',           sub:'独自の分析と論考',               url:'research/',                    floor:'dark'   },
    news:       { x:IX+R3_A,       y:IY+RH1+RH2,        w:R3_B,     h:RH3, label:'ニュース解説室',     labelEn:'NEWS & INSIGHTS',    sub:'最新ニュースの考察',             url:'news/',                        floor:'stone'  },
    horizons:   { x:IX+R3_A+R3_B,  y:IY+RH1+RH2,        w:R3_C,     h:RH3, label:'人類の智慧の棚',     labelEn:'HORIZONS',           sub:'禅・哲学・テクノロジー',          url:'horizons/',                    floor:'ornate' },
    finhistory: { x:IX+R3_A+R3_B+R3_C, y:IY+RH1+RH2,    w:R3_D,     h:RH3, label:'金融史の回廊',       labelEn:'FINANCIAL HISTORY',  sub:'7000年の金融史',                url:'horizons/financial-history/',   floor:'dark'   },
    corridor:   { x:IX,            y:IY+RH1+RH2+RH3,    w:IW_TOTAL, h:RH4, label:'思索の回廊',         labelEn:'THINKERS\' GALLERY', sub:'投資思想家の人物録',             url:'thinkers/',                    floor:'stone'  }
  };

  var ROOM_DESC = {
    entrance:'はじめての方へ。NISAや積立投資の基本を学べます。',
    principles:'バフェット、マンガー、フィッシャーの投資哲学を収録。',
    moat:'経済的な堀（モート）で強い企業を見抜く方法。',
    companies:'個別企業の分析ページ。銘柄研究の書架。',
    hub:'書庫の心臓部。ここから各テーマの部屋へ。',
    fcf:'フリーキャッシュフローで企業の本質的な価値を読む。',
    research:'独自の論考・分析記事のアーカイブ。',
    news:'最新ニュースの背景と投資家視点の考察。',
    horizons:'禅・哲学・テクノロジー。投資を超えた思索の書棚。',
    finhistory:'メソポタミアからAI革命まで。7000年の金融史を歩く。',
    corridor:'バフェットからマンガーまで。投資思想家の人物録。'
  };

  /* ══════════════════════════════════════
     3. INTERNAL WALLS (with doorways)
     ══════════════════════════════════════ */
  // Deduplicated wall definitions for clean rendering

  /* ══════════════════════════════════════
     4. NPC DEFINITIONS (v4 — 滞在型中心)
     ══════════════════════════════════════ */
  // reading 62%, shelving 25%, idle 6%, walk 6%
  var NPCS = [
    // === 歩行NPC（1体のみ — 回廊の旅人） ===
    { room:'corridor', name:'旅人',   rx:0.3, ry:0.4,  dir:2, pose:'walk', bodyColor:'#6a4a3a', tx:0,ty:0,state:'idle',wait:60,walkFrame:0 },
    // === 座って読書中NPC（10体） ===
    { room:'hub',        name:'学者A',   rx:0.30, ry:0.42, dir:0, pose:'reading', bodyColor:'#3a4a6a' },
    { room:'hub',        name:'学者B',   rx:0.60, ry:0.42, dir:0, pose:'reading', bodyColor:'#5a3a5a' },
    { room:'hub',        name:'研究者',  rx:0.45, ry:0.62, dir:0, pose:'reading', bodyColor:'#4a5a4a' },
    { room:'entrance',   name:'案内人',  rx:0.50, ry:0.55, dir:0, pose:'reading', bodyColor:'#4a6a3a' },
    { room:'principles', name:'賢者',    rx:0.40, ry:0.60, dir:0, pose:'reading', bodyColor:'#3a4a6a' },
    { room:'moat',       name:'分析家',  rx:0.25, ry:0.60, dir:0, pose:'reading', bodyColor:'#5a3a5a' },
    { room:'moat',       name:'投資家',  rx:0.65, ry:0.60, dir:0, pose:'reading', bodyColor:'#4a4a3a' },
    { room:'fcf',        name:'会計士',  rx:0.40, ry:0.58, dir:0, pose:'reading', bodyColor:'#3a3a5a' },
    { room:'news',       name:'記者',    rx:0.40, ry:0.55, dir:0, pose:'reading', bodyColor:'#4a3a4a' },
    { room:'research',   name:'著述家',  rx:0.55, ry:0.55, dir:0, pose:'reading', bodyColor:'#5a4a2a' },
    // === 本棚で探索中NPC（4体） ===
    { room:'companies',  name:'司書',    rx:0.12, ry:0.30, dir:3, pose:'shelving', bodyColor:'#5a6a3a' },
    { room:'finhistory', name:'語り部',  rx:0.78, ry:0.25, dir:3, pose:'shelving', bodyColor:'#6a3a2a' },
    { room:'principles', name:'書生',    rx:0.82, ry:0.25, dir:3, pose:'shelving', bodyColor:'#4a5a5a' },
    { room:'fcf',        name:'調査員',  rx:0.85, ry:0.30, dir:3, pose:'shelving', bodyColor:'#5a4a5a' },
    // === 静止NPC（1体 — hubの案内役） ===
    { room:'hub',        name:'執事',    rx:0.50, ry:0.20, dir:0, pose:'idle', bodyColor:'#3a5a4a' }
  ];
  // 歩行NPCのtx/ty初期化
  for (var ni = 0; ni < NPCS.length; ni++) { if(NPCS[ni].pose==='walk'){NPCS[ni].tx=NPCS[ni].rx;NPCS[ni].ty=NPCS[ni].ry;} }

  /* ══════════════════════════════════════
     5. STATE
     ══════════════════════════════════════ */
  var canvas, ctx;
  var hoveredRoom = null;
  var assets = {};
  var floorPatterns = {};
  var animFrame = 0, frameCount = 0, dirty = true;

  /* ══════════════════════════════════════
     6. ASSET LOADING
     ══════════════════════════════════════ */
  function loadAssets(cb) {
    var srcs = { floor:'assets/map/tileset_interior_floor.png', wall:'assets/map/tileset_wall.png',
      charIdle:'assets/map/player_idle.png', charWalk:'assets/map/player_walk.png' };
    var count = 0, total = Object.keys(srcs).length;
    function done() { if (++count >= total) cb(); }
    for (var key in srcs) { assets[key] = new Image(); assets[key].onload = done; assets[key].onerror = done; assets[key].src = srcs[key]; }
  }

  /* ══════════════════════════════════════
     7. FLOOR PATTERNS
     ══════════════════════════════════════ */
  function makePattern(fn, s) {
    var c = document.createElement('canvas'); c.width = s; c.height = s;
    fn(c.getContext('2d'), s);
    return ctx.createPattern(c, 'repeat');
  }

  function initFloorPatterns() {
    floorPatterns.wood = makePattern(function(pc, s) {
      pc.fillStyle = '#4a3218'; pc.fillRect(0,0,s,s);
      for (var i=0;i<s;i+=8){ pc.fillStyle=(i/8)%2===0?'#523a1e':'#3e2c14'; pc.fillRect(0,i,s,7); pc.fillStyle='#2d2010'; pc.fillRect(0,i+7,s,1); }
      pc.globalAlpha=0.12; for(var j=0;j<4;j++){pc.fillStyle='#6a5a30';pc.fillRect(0,Math.floor(Math.random()*s),s,1);} pc.globalAlpha=1;
    }, 32);

    floorPatterns.stone = makePattern(function(pc, s) {
      pc.fillStyle = '#5a5248'; pc.fillRect(0,0,s,s);
      for(var gx=0;gx<s;gx+=16)for(var gy=0;gy<s;gy+=16){
        var v=0.9+Math.random()*0.2; pc.fillStyle='rgb('+Math.floor(90*v)+','+Math.floor(82*v)+','+Math.floor(72*v)+')';
        pc.fillRect(gx+1,gy+1,14,14);
      }
      pc.fillStyle='#3a3230'; for(var x=0;x<s;x+=16)pc.fillRect(x,0,1,s); for(var y=0;y<s;y+=16)pc.fillRect(0,y,s,1);
    }, 32);

    floorPatterns.ornate = makePattern(function(pc, s) {
      pc.fillStyle='#3a3228'; pc.fillRect(0,0,s,s);
      for(var gx=0;gx<s;gx+=16)for(var gy=0;gy<s;gy+=16){
        pc.fillStyle=((gx+gy)/16)%2===0?'#4a4238':'#3a352a'; pc.fillRect(gx+1,gy+1,14,14);
        if(((gx+gy)/16)%2===0){pc.fillStyle='rgba(184,144,10,.08)';pc.fillRect(gx+3,gy+3,10,10);}
      }
    }, 32);

    floorPatterns.dark = makePattern(function(pc, s) {
      pc.fillStyle='#2a2420'; pc.fillRect(0,0,s,s);
      for(var gx=0;gx<s;gx+=16)for(var gy=0;gy<s;gy+=16){
        var v=0.85+Math.random()*0.3; pc.fillStyle='rgb('+Math.floor(42*v)+','+Math.floor(36*v)+','+Math.floor(32*v)+')';
        pc.fillRect(gx+1,gy+1,14,14);
      }
    }, 32);

    floorPatterns.marble = makePattern(function(pc, s) {
      pc.fillStyle='#ddd0b8'; pc.fillRect(0,0,s,s);
      for(var gx=0;gx<s;gx+=16)for(var gy=0;gy<s;gy+=16){
        pc.fillStyle=((gx+gy)/16)%2===0?'#d8c8a8':'#c4b898'; pc.fillRect(gx,gy,16,16);
      }
      pc.strokeStyle='#b0a488'; pc.lineWidth=0.5;
      for(var x=0;x<s;x+=16){pc.beginPath();pc.moveTo(x,0);pc.lineTo(x,s);pc.stroke();}
      for(var y=0;y<s;y+=16){pc.beginPath();pc.moveTo(0,y);pc.lineTo(s,y);pc.stroke();}
    }, 32);
  }

  /* ══════════════════════════════════════
     8. DRAWING — FLOORS
     ══════════════════════════════════════ */
  function drawFloors() {
    var ids = Object.keys(ROOMS);
    for (var i = 0; i < ids.length; i++) {
      var r = ROOMS[ids[i]];
      ctx.save();
      ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
      ctx.fillStyle = floorPatterns[r.floor] || '#4a3a28';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.restore();
    }
  }

  /* ══════════════════════════════════════
     9. DRAWING — CARPETS (v4 — room-specific)
     ══════════════════════════════════════ */
  function drawCarpets() {
    var ids = Object.keys(ROOMS);
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i], r = ROOMS[id], cc = CARPET_COLORS[id];
      if (!cc || id === 'corridor') continue;

      // Hub gets a grand carpet
      if (id === 'hub') {
        drawGrandCarpet(r);
        continue;
      }

      var inX = r.w * 0.18, inY = r.h * 0.22;
      var cx = r.x + inX, cy = r.y + inY, cw = r.w - inX*2, ch = r.h - inY*2;
      if (cw < 30 || ch < 20) continue;
      ctx.fillStyle = cc.a; ctx.fillRect(cx, cy, cw, ch);
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.strokeRect(cx+3, cy+3, cw-6, ch-6);
      ctx.globalAlpha = 0.1; ctx.strokeStyle = C.gold; ctx.lineWidth = 0.5;
      ctx.strokeRect(cx+8, cy+8, cw-16, ch-16);
      var mx = cx+cw/2, my = cy+ch/2;
      ctx.beginPath(); ctx.moveTo(mx,cy+10); ctx.lineTo(cx+cw-10,my); ctx.lineTo(mx,cy+ch-10); ctx.lineTo(cx+10,my); ctx.closePath(); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // Corridor: runner carpet
    var cr = ROOMS.corridor, cc2 = CARPET_COLORS.corridor;
    ctx.fillStyle = cc2.a;
    ctx.fillRect(cr.x + 30, cr.y + cr.h*0.25, cr.w - 60, cr.h*0.5);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.strokeRect(cr.x + 33, cr.y + cr.h*0.25 + 3, cr.w - 66, cr.h*0.5 - 6);
  }

  function drawGrandCarpet(r) {
    var cc = CARPET_COLORS.hub;
    var mx = r.x + r.w * 0.10, my = r.y + r.h * 0.12;
    var mw = r.w * 0.80, mh = r.h * 0.76;
    // Outer carpet
    ctx.fillStyle = cc.a; ctx.fillRect(mx, my, mw, mh);
    // Ornate border (triple line)
    ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.strokeRect(mx+4, my+4, mw-8, mh-8);
    ctx.strokeStyle = 'rgba(184,144,10,.3)'; ctx.lineWidth = 1;
    ctx.strokeRect(mx+8, my+8, mw-16, mh-16);
    ctx.strokeRect(mx+12, my+12, mw-24, mh-24);
    // Inner field (slightly lighter)
    ctx.fillStyle = cc.b; ctx.fillRect(mx+14, my+14, mw-28, mh-28);
    // Diamond pattern in center
    ctx.globalAlpha = 0.15; ctx.strokeStyle = C.gold; ctx.lineWidth = 0.5;
    var cx = mx + mw/2, cy = my + mh/2;
    ctx.beginPath(); ctx.moveTo(cx, my+20); ctx.lineTo(mx+mw-20, cy); ctx.lineTo(cx, my+mh-20); ctx.lineTo(mx+20, cy); ctx.closePath(); ctx.stroke();
    // Smaller inner diamond
    ctx.beginPath(); ctx.moveTo(cx, my+40); ctx.lineTo(mx+mw-40, cy); ctx.lineTo(cx, my+mh-40); ctx.lineTo(mx+40, cy); ctx.closePath(); ctx.stroke();
    // Corner rosettes
    var corners = [[mx+20,my+20],[mx+mw-20,my+20],[mx+20,my+mh-20],[mx+mw-20,my+mh-20]];
    for (var ci=0;ci<corners.length;ci++) {
      ctx.beginPath(); ctx.arc(corners[ci][0],corners[ci][1],8,0,Math.PI*2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  /* ══════════════════════════════════════
     10. DRAWING — OUTER WALLS
     ══════════════════════════════════════ */
  function drawOuterWalls() {
    var grad;
    grad = ctx.createLinearGradient(0,0,0,OW);
    grad.addColorStop(0,'#0e0a04'); grad.addColorStop(0.6,C.wallMid); grad.addColorStop(1,C.wallInner);
    ctx.fillStyle = grad; ctx.fillRect(0,0,CW,OW);
    grad = ctx.createLinearGradient(0,CH-OW,0,CH);
    grad.addColorStop(0,C.wallInner); grad.addColorStop(0.4,C.wallMid); grad.addColorStop(1,'#0e0a04');
    ctx.fillStyle = grad; ctx.fillRect(0,CH-OW,CW,OW);
    grad = ctx.createLinearGradient(0,0,OW,0);
    grad.addColorStop(0,'#0e0a04'); grad.addColorStop(0.6,C.wallMid); grad.addColorStop(1,C.wallInner);
    ctx.fillStyle = grad; ctx.fillRect(0,0,OW,CH);
    grad = ctx.createLinearGradient(CW-OW,0,CW,0);
    grad.addColorStop(0,C.wallInner); grad.addColorStop(0.4,C.wallMid); grad.addColorStop(1,'#0e0a04');
    ctx.fillStyle = grad; ctx.fillRect(CW-OW,0,OW,CH);
  }

  /* ══════════════════════════════════════
     11. DRAWING — INTERNAL WALLS
     ══════════════════════════════════════ */
  function drawPillar(x, y) {
    ctx.fillStyle = C.wallInner; ctx.fillRect(x, y, IW+4, IW+4);
    ctx.fillStyle = C.wallHighlight; ctx.fillRect(x+1, y+1, IW+2, IW+2);
    ctx.fillStyle = 'rgba(184,144,10,.2)'; ctx.fillRect(x+2, y+2, IW, IW);
  }

  function drawHWallSegment(x, y, w, doors) {
    // Build solid sections around doors
    var sections = [], sx = x;
    for (var di = 0; di < doors.length; di++) {
      var doorCenter = x + w * doors[di];
      var doorStart = doorCenter - DOOR/2, doorEnd = doorCenter + DOOR/2;
      if (doorStart > sx) sections.push({x:sx, w:doorStart-sx});
      sx = doorEnd;
    }
    if (sx < x + w) sections.push({x:sx, w:x+w-sx});
    for (var si = 0; si < sections.length; si++) {
      var s = sections[si];
      ctx.fillStyle = C.wallMid; ctx.fillRect(s.x, y, s.w, IW);
      ctx.fillStyle = 'rgba(184,144,10,.15)'; ctx.fillRect(s.x, y+IW/2, s.w, 0.5);
    }
    for (var di2 = 0; di2 < doors.length; di2++) {
      var dc = x + w * doors[di2];
      drawPillar(dc - DOOR/2 - 3, y - 3);
      drawPillar(dc + DOOR/2 - 3, y - 3);
    }
  }

  function drawVWallSegment(x, y, h, doorFrac) {
    var doorCenter = y + h * doorFrac;
    var doorStart = doorCenter - DOOR/2, doorEnd = doorCenter + DOOR/2;
    if (doorStart > y) { ctx.fillStyle = C.wallMid; ctx.fillRect(x, y, IW, doorStart - y); }
    if (doorEnd < y + h) { ctx.fillStyle = C.wallMid; ctx.fillRect(x, doorEnd, IW, y + h - doorEnd); }
    ctx.fillStyle = 'rgba(184,144,10,.15)'; ctx.fillRect(x+IW/2, y, 0.5, h);
    drawPillar(x - 2, doorStart - 6);
    drawPillar(x - 2, doorEnd);
  }

  function drawInternalWalls() {
    var r12y = IY + RH1 - IW/2;   // Row1 <-> Row2
    var r23y = IY + RH1 + RH2 - IW/2; // Row2 <-> Row3
    var r34y = IY + RH1 + RH2 + RH3 - IW/2; // Row3 <-> Corridor

    // Horizontal: Row1 <-> Row2 (3 segments matching column breaks)
    drawHWallSegment(IX, r12y, COL_A, [0.5]);
    drawHWallSegment(IX + COL_A, r12y, COL_B, [0.5]);
    drawHWallSegment(IX + COL_A + COL_B, r12y, COL_C, [0.5]);

    // Horizontal: Row2 <-> Row3 (full width, 4 doors)
    drawHWallSegment(IX, r23y, IW_TOTAL, [0.12, 0.38, 0.62, 0.88]);

    // Horizontal: Row3 <-> Corridor (full width, 4 doors)
    drawHWallSegment(IX, r34y, IW_TOTAL, [0.12, 0.38, 0.62, 0.88]);

    // Vertical: Row 1 columns
    drawVWallSegment(IX + COL_A - IW/2, IY, RH1, 0.5);
    drawVWallSegment(IX + COL_A + COL_B - IW/2, IY, RH1, 0.5);

    // Vertical: Row 2 columns
    drawVWallSegment(IX + COL_A - IW/2, IY + RH1, RH2, 0.5);
    drawVWallSegment(IX + COL_A + COL_B - IW/2, IY + RH1, RH2, 0.5);

    // Vertical: Row 3 columns
    drawVWallSegment(IX + R3_A - IW/2, IY + RH1 + RH2, RH3, 0.5);
    drawVWallSegment(IX + R3_A + R3_B - IW/2, IY + RH1 + RH2, RH3, 0.5);
    drawVWallSegment(IX + R3_A + R3_B + R3_C - IW/2, IY + RH1 + RH2, RH3, 0.5);
  }

  /* ══════════════════════════════════════
     12. DRAWING — FURNITURE PRIMITIVES
     ══════════════════════════════════════ */
  var bookColors = [C.bookRed,C.bookBlue,C.bookGreen,C.bookGold,C.bookBrown,C.bookMaroon,C.bookPurple,C.bookTeal,C.bookRed2,C.bookBlue2,C.bookGreen2];

  function seededRand(seed) { return function(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}; }

  function drawBookshelf(x,y,w,h,seed) {
    var rng=seededRand(seed||42);
    ctx.fillStyle=C.woodDark; ctx.fillRect(x,y,w,h);
    ctx.fillStyle=C.woodMid; ctx.fillRect(x+1,y+1,w-2,h-2);
    ctx.fillStyle='rgba(0,0,0,.08)'; ctx.fillRect(x+2,y+2,w-4,h-4);
    var sc=Math.max(2,Math.floor(h/12)), sh=h/sc;
    for(var s=0;s<sc;s++){var sy=y+s*sh; var bx=x+2;
      while(bx<x+w-3){var bw=2+Math.floor(rng()*3),bh=sh*(0.55+rng()*0.4),bc=bookColors[Math.floor(rng()*bookColors.length)];
        var by=sy+(sh-bh);
        ctx.fillStyle=bc; ctx.fillRect(bx,by,bw,bh-1);
        ctx.fillStyle='rgba(255,255,255,.15)'; ctx.fillRect(bx,by,bw,1);
        ctx.fillStyle='rgba(0,0,0,.2)'; ctx.fillRect(bx+bw-1,by,1,bh-1);
        ctx.fillStyle='rgba(255,255,255,.08)'; ctx.fillRect(bx,by,1,bh-1);
        bx+=bw+1;}
      ctx.fillStyle=C.woodLight; ctx.fillRect(x+1,sy+sh-1,w-2,1);}
    ctx.fillStyle='rgba(0,0,0,.18)'; ctx.fillRect(x,y+h,w,3);
    ctx.fillStyle='rgba(184,144,10,.08)'; ctx.fillRect(x,y,1,h); ctx.fillRect(x+w-1,y,1,h);
  }

  function drawDesk(x,y,w,h) {
    ctx.fillStyle=C.woodDark;
    ctx.fillRect(x+2,y+h-2,3,4); ctx.fillRect(x+w-5,y+h-2,3,4);
    ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(x+2,y+h+1,w-4,2);
    ctx.fillStyle=C.woodLight; ctx.fillRect(x,y,w,h);
    ctx.fillStyle=C.woodMid; ctx.fillRect(x+1,y+1,w-2,h-2);
    ctx.fillStyle='rgba(0,0,0,.04)'; for(var g=0;g<w;g+=3) ctx.fillRect(x+g,y+1,1,h-2);
    ctx.strokeStyle=C.woodDark; ctx.lineWidth=0.5; ctx.strokeRect(x,y,w,h);
    ctx.fillStyle=C.paper; ctx.fillRect(x+4,y+3,w*0.3,h*0.45);
    ctx.fillStyle='#e8e0d0'; ctx.fillRect(x+5,y+4,w*0.25,h*0.35);
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(x+w-11,y+4,5,5);
    ctx.fillStyle='#8a6a4a'; ctx.fillRect(x+w-10,y+3,3,1);
    ctx.strokeStyle=C.gold; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.moveTo(x+w-14,y+3); ctx.lineTo(x+w-7,y+7); ctx.stroke();
  }

  // 大型長机（4人用）
  function drawLongDesk(x,y,w,h) {
    // 4 legs
    ctx.fillStyle=C.woodDark;
    ctx.fillRect(x+3,y+h,3,5); ctx.fillRect(x+w-6,y+h,3,5);
    ctx.fillRect(x+Math.floor(w/3),y+h,3,5); ctx.fillRect(x+Math.floor(w*2/3),y+h,3,5);
    ctx.fillStyle='rgba(0,0,0,.15)'; ctx.fillRect(x+2,y+h+4,w-4,2);
    // Tabletop
    ctx.fillStyle=C.woodLight; ctx.fillRect(x,y,w,h);
    ctx.fillStyle=C.woodMid; ctx.fillRect(x+1,y+1,w-2,h-2);
    ctx.fillStyle='rgba(0,0,0,.04)'; for(var g=0;g<w;g+=3) ctx.fillRect(x+g,y+1,1,h-2);
    ctx.strokeStyle=C.woodDark; ctx.lineWidth=0.5; ctx.strokeRect(x,y,w,h);
    // Items on desk
    ctx.fillStyle=C.paper; ctx.fillRect(x+6,y+3,w*0.15,h*0.5);
    ctx.fillStyle='#e8e0d0'; ctx.fillRect(x+w*0.35,y+4,w*0.12,h*0.4);
    ctx.fillStyle=C.paper; ctx.fillRect(x+w*0.6,y+3,w*0.18,h*0.5);
    // Book stacks on desk
    drawBookStackSmall(x+w*0.2,y+2);
    drawBookStackSmall(x+w*0.75,y+2);
    // Ink well
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(x+w-14,y+4,5,5);
  }

  function drawBookStackSmall(x,y) {
    var colors = [C.bookRed,C.bookBlue,C.bookGreen,C.bookBrown];
    for(var i=0;i<3;i++){
      ctx.fillStyle=colors[i%colors.length]; ctx.fillRect(x-3+i,y+i*2,8,2);
    }
  }

  function drawChair(x,y) {
    ctx.fillStyle=C.woodDark;
    ctx.fillRect(x+1,y+9,2,4); ctx.fillRect(x+7,y+9,2,4);
    ctx.fillStyle=C.woodMid; ctx.fillRect(x,y+7,10,4);
    ctx.fillStyle='rgba(0,0,0,.08)'; ctx.fillRect(x,y+10,10,1);
    ctx.fillStyle=C.woodDark; ctx.fillRect(x+1,y,8,8);
    ctx.fillStyle=C.woodMid; ctx.fillRect(x+2,y+1,6,6);
  }

  function drawPlantPot(x,y) {
    ctx.fillStyle='#8b5a2a'; ctx.fillRect(x,y+4,10,8);
    ctx.fillStyle='#3d6828'; ctx.fillRect(x-2,y,14,6);
    ctx.fillStyle='#2a4a18'; ctx.fillRect(x+1,y-3,8,5);
  }

  function drawGlobe(x,y) {
    ctx.fillStyle=C.woodDark; ctx.fillRect(x-2,y+8,4,3); ctx.fillRect(x-6,y+10,12,2);
    ctx.fillStyle='#4a8ac0'; ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#2a6a1a'; ctx.fillRect(x-3,y-3,3,3); ctx.fillRect(x+1,y+1,4,2); ctx.fillRect(x-2,y+3,2,2);
    ctx.fillStyle='rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(x-2,y-3,2.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=C.gold; ctx.lineWidth=0.8; ctx.beginPath(); ctx.ellipse(x,y,8,8,0,0,Math.PI*2); ctx.stroke();
  }

  function drawScroll(x,y) {
    ctx.fillStyle='#e8dcc0'; ctx.fillRect(x+2,y,16,7);
    ctx.fillStyle='#8b6a4a'; ctx.fillRect(x,y-1,3,9); ctx.fillRect(x+17,y-1,3,9);
    ctx.fillStyle='rgba(26,18,8,.1)'; ctx.fillRect(x+4,y+2,12,0.5); ctx.fillRect(x+4,y+4,12,0.5);
  }

  // カタログ箱
  function drawCatalogBox(x,y) {
    ctx.fillStyle=C.woodDark; ctx.fillRect(x,y,18,12);
    ctx.fillStyle=C.woodMid; ctx.fillRect(x+1,y+1,16,10);
    // Drawers
    for(var d=0;d<3;d++){
      ctx.fillStyle=C.woodLight; ctx.fillRect(x+2,y+2+d*3.5,14,3);
      ctx.fillStyle=C.gold2; ctx.fillRect(x+8,y+3+d*3.5,2,1);
    }
  }

  // 本の山
  function drawBookStack(x,y) {
    var colors = [C.bookMaroon,C.bookBlue,C.bookGreen,C.bookRed,C.bookGold];
    for(var i=0;i<5;i++){
      var off = (i%2===0) ? 0 : 1;
      ctx.fillStyle=colors[i]; ctx.fillRect(x-5+off,y+i*3,12,3);
    }
  }

  // ベンチ（改良版）
  function drawBench(x,y,w) {
    ctx.fillStyle=C.woodDark;
    ctx.fillRect(x+2,y+6,2,4); ctx.fillRect(x+w-4,y+6,2,4);
    ctx.fillStyle=C.woodMid; ctx.fillRect(x,y+3,w,4);
    ctx.fillStyle=C.woodLight; ctx.fillRect(x+1,y+4,w-2,2);
  }

  // 展示台
  function drawDisplayCase(x,y,w,h) {
    ctx.fillStyle=C.woodDark; ctx.fillRect(x,y,w,h);
    ctx.fillStyle='rgba(180,200,220,.15)'; ctx.fillRect(x+1,y+1,w-2,h-2);
    ctx.strokeStyle=C.gold; ctx.lineWidth=0.5; ctx.strokeRect(x,y,w,h);
    // Item inside
    ctx.fillStyle=C.bookGold; ctx.fillRect(x+3,y+2,w-6,h-4);
  }

  // 読書カレル（個人ブース）
  function drawReadingCarrel(x,y) {
    // 3方向を棚で囲んだ小机
    drawBookshelf(x,y,30,14,x*7+y);      // 背面棚
    drawBookshelf(x,y+14,8,18,x*11+y);   // 左側壁
    drawBookshelf(x+22,y+14,8,18,x*13+y);// 右側壁
    // 机（内部）
    ctx.fillStyle=C.woodMid; ctx.fillRect(x+8,y+16,14,8);
    ctx.fillStyle=C.woodLight; ctx.fillRect(x+9,y+17,12,6);
    // 椅子
    drawChair(x+10,y+26);
  }

  /* ══════════════════════════════════════
     13. DRAWING — CANDLES & LIGHTING
     ══════════════════════════════════════ */
  function drawCandle(x, y) {
    var glow = ctx.createRadialGradient(x,y,1,x,y,28);
    glow.addColorStop(0,'rgba(255,210,80,.14)'); glow.addColorStop(0.5,'rgba(240,180,40,.06)'); glow.addColorStop(1,'rgba(240,180,40,0)');
    ctx.fillStyle=glow; ctx.fillRect(x-30,y-30,60,60);
    ctx.fillStyle='#f0e8d0'; ctx.fillRect(x-1,y,3,6);
    var flicker = Math.sin(frameCount * 0.15 + x) * 0.5;
    ctx.fillStyle=C.flame; ctx.fillRect(Math.round(x-1+flicker), y-3, 2, 3);
    ctx.fillStyle='#fff8e0'; ctx.fillRect(Math.round(x+flicker), y-2, 1, 1);
  }

  function drawWallSconce(x, y) {
    var glow = ctx.createRadialGradient(x,y,2,x,y,45);
    glow.addColorStop(0,'rgba(255,200,60,.15)'); glow.addColorStop(0.4,'rgba(240,180,40,.07)'); glow.addColorStop(1,'rgba(240,180,40,0)');
    ctx.fillStyle=glow; ctx.fillRect(x-50,y-50,100,100);
    ctx.fillStyle=C.sconce; ctx.fillRect(x-2,y-1,5,3);
    ctx.fillStyle=C.gold; ctx.fillRect(x-1,y-4,3,4);
    var flicker = Math.sin(frameCount * 0.12 + y) * 0.5;
    ctx.fillStyle=C.flame; ctx.fillRect(Math.round(x-1+flicker), y-7, 2, 3);
    ctx.fillStyle='#fff8e0'; ctx.fillRect(Math.round(x+flicker), y-6, 1, 1);
  }

  function drawChandelier(cx, cy) {
    var glow = ctx.createRadialGradient(cx,cy,5,cx,cy,80);
    glow.addColorStop(0,'rgba(255,210,80,.18)'); glow.addColorStop(0.3,'rgba(240,180,40,.10)'); glow.addColorStop(1,'rgba(240,180,40,0)');
    ctx.fillStyle=glow; ctx.fillRect(cx-80,cy-80,160,160);
    ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(cx,cy,12,0,Math.PI*2); ctx.stroke();
    for (var i=0;i<8;i++) {
      var angle = (i/8)*Math.PI*2;
      var fx = cx + Math.cos(angle)*12, fy = cy + Math.sin(angle)*12;
      var flicker = Math.sin(frameCount*0.1+i*1.3)*0.5;
      ctx.fillStyle=C.flame; ctx.fillRect(Math.round(fx-1+flicker),Math.round(fy-2),2,2);
      ctx.fillStyle='#fff8e0'; ctx.fillRect(Math.round(fx+flicker),Math.round(fy-1),1,1);
    }
    ctx.fillStyle=C.gold; ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2); ctx.fill();
  }

  function drawLamp(x,y,large) {
    var s=large?8:5, radius=large?50:30;
    var glow=ctx.createRadialGradient(x+s/2,y+s/2,2,x+s/2,y+s/2,radius);
    glow.addColorStop(0,'rgba(240,200,60,.12)'); glow.addColorStop(1,'rgba(240,200,60,0)');
    ctx.fillStyle=glow; ctx.fillRect(x-radius,y-radius,radius*2+s,radius*2+s);
    ctx.fillStyle=C.woodDark; ctx.fillRect(x+1,y+1,s-2,s-2);
    var flicker=Math.sin(frameCount*0.13+x)*0.5;
    ctx.fillStyle=C.flame; ctx.fillRect(Math.round(x+s/2-1+flicker),Math.round(y+s/2-1),2,2);
  }

  function drawAllLighting() {
    // Wall sconces
    var spacing = 80;
    for (var sx=IX+40; sx<IX+IW_TOTAL-20; sx+=spacing) drawWallSconce(sx, IY+OW+4);
    for (var sx2=IX+40; sx2<IX+IW_TOTAL-20; sx2+=spacing) drawWallSconce(sx2, CH-OW-6);
    for (var sy=IY+50; sy<IY+IH_TOTAL-20; sy+=spacing) drawWallSconce(IX+OW+4, sy);
    for (var sy2=IY+50; sy2<IY+IH_TOTAL-20; sy2+=spacing) drawWallSconce(CW-OW-6, sy2);

    // Room-specific candles (fewer in quiet rooms, more in hub)
    var ids = Object.keys(ROOMS);
    for (var i=0;i<ids.length;i++) {
      var id=ids[i], r = ROOMS[id];
      if (id === 'hub') {
        // Hub: extra candles for grandeur
        drawCandle(r.x + 30, r.y + 30);
        drawCandle(r.x + r.w - 30, r.y + 30);
        drawCandle(r.x + 30, r.y + r.h - 30);
        drawCandle(r.x + r.w - 30, r.y + r.h - 30);
        drawCandle(r.x + r.w*0.3, r.y + r.h*0.3);
        drawCandle(r.x + r.w*0.7, r.y + r.h*0.3);
      } else if (id === 'finhistory' || id === 'research') {
        // Quiet rooms: minimal candles
        drawCandle(r.x + r.w/2, r.y + 20);
      } else if (id !== 'corridor') {
        // Standard rooms
        drawCandle(r.x + 20, r.y + 20);
        drawCandle(r.x + r.w - 20, r.y + 20);
      }
    }

    // Grand chandelier in hub (2 chandeliers for the large room)
    var hub = ROOMS.hub;
    drawChandelier(hub.x + hub.w*0.35, hub.y + hub.h*0.45);
    drawChandelier(hub.x + hub.w*0.65, hub.y + hub.h*0.45);
  }

  /* ══════════════════════════════════════
     14. DRAWING — ROOM FURNITURE (v4)
     ══════════════════════════════════════ */
  function drawAllFurniture() {
    var ids = Object.keys(ROOMS);
    for (var i=0;i<ids.length;i++) {
      var id=ids[i], r=ROOMS[id];
      var ix=r.x+8, iy=r.y+6, iw=r.w-16, ih=r.h-12;
      var seed = id.charCodeAt(0)*100+(id.charCodeAt(1)||0);

      switch(id) {

        /* ─── 入口ホール: 歓迎の空間 ─── */
        case 'entrance':
          // Top wall bookshelves (7 units — wider room)
          for(var s=0;s<7;s++) drawBookshelf(ix+s*50+4, iy, 44, 28, seed+s*37);
          // Left wall tall bookshelf
          drawBookshelf(ix, iy+32, 14, ih-42, seed+100);
          // Welcome desk (medium) + chair + lamp
          drawDesk(ix+iw*0.35, iy+ih*0.45, 60, 28);
          drawChair(ix+iw*0.35+24, iy+ih*0.45+30);
          drawLamp(ix+iw*0.35+2, iy+ih*0.45-12, true);
          // Globe
          drawGlobe(ix+iw*0.78, iy+ih*0.28);
          // Plants
          drawPlantPot(ix+iw-16, iy+ih-18);
          drawPlantPot(ix+4, iy+ih-18);
          // Catalog box near entrance
          drawCatalogBox(ix+iw*0.7, iy+ih*0.65);
          break;

        /* ─── 投資原則の間: 壁沿い書架＋島型書架 ─── */
        case 'principles':
          // Top wall bookshelves (8 units, wider room)
          for(var s=0;s<8;s++) drawBookshelf(ix+s*54+4, iy, 48, 28, seed+s*41);
          // Right wall tall bookshelf
          drawBookshelf(ix+iw-18, iy+32, 14, ih-42, seed+200);
          // Two island bookshelves (different sizes, staggered)
          drawBookshelf(ix+iw*0.12, iy+ih*0.38, 48, 18, seed+210);
          drawBookshelf(ix+iw*0.32, iy+ih*0.32, 36, 16, seed+215);
          // Large study desk (4-person) + chairs
          drawLongDesk(ix+iw*0.48, iy+ih*0.52, 90, 28);
          drawChair(ix+iw*0.48+10, iy+ih*0.52+30);
          drawChair(ix+iw*0.48+35, iy+ih*0.52+30);
          drawChair(ix+iw*0.48+60, iy+ih*0.52+30);
          // Side reading desk
          drawDesk(ix+iw*0.05, iy+ih*0.62, 48, 22);
          drawChair(ix+iw*0.05+18, iy+ih*0.62+24);
          drawLamp(ix+iw*0.48+94, iy+ih*0.52, false);
          drawPlantPot(ix+4, iy+ih-14);
          break;

        /* ─── Moatの間: 共同研究室 ─── */
        case 'moat':
          // Top wall bookshelves
          for(var s=0;s<7;s++) drawBookshelf(ix+s*52+4, iy, 46, 26, seed+s*43);
          // Right wall bookshelf
          drawBookshelf(ix+iw-16, iy+32, 14, ih-42, seed+250);
          // Island bookshelf (offset)
          drawBookshelf(ix+iw*0.42, iy+ih*0.30, 44, 16, seed+260);
          // Two collaborative desks + chairs
          drawDesk(ix+iw*0.08, iy+ih*0.50, 58, 26);
          drawDesk(ix+iw*0.52, iy+ih*0.50, 58, 26);
          drawChair(ix+iw*0.08+22, iy+ih*0.50+28);
          drawChair(ix+iw*0.52+22, iy+ih*0.50+28);
          drawLamp(ix+iw*0.38, iy+ih*0.38, true);
          // Book stack on each desk area
          drawBookStack(ix+iw*0.20, iy+ih*0.42);
          break;

        /* ─── 企業分析書架: 密集書架室 ─── */
        case 'companies':
          // Top wall bookshelves (7 units — wider room)
          for(var s=0;s<7;s++) drawBookshelf(ix+s*50+4, iy, 44, 28, seed+s*37);
          // Both side walls
          drawBookshelf(ix, iy+32, 14, ih-42, seed+300);
          drawBookshelf(ix+iw-18, iy+32, 14, ih-42, seed+310);
          // Two island bookshelves (staggered — not parallel)
          drawBookshelf(ix+iw*0.25, iy+ih*0.28, 50, 18, seed+320);
          drawBookshelf(ix+iw*0.35, iy+ih*0.52, 42, 16, seed+325);
          // Catalog box between islands
          drawCatalogBox(ix+iw*0.28, iy+ih*0.48);
          // Desk + chair (small, between shelves)
          drawDesk(ix+iw*0.55, iy+ih*0.65, 52, 24);
          drawChair(ix+iw*0.55+18, iy+ih*0.65+26);
          // Second desk (reading spot)
          drawDesk(ix+iw*0.20, iy+ih*0.72, 44, 20);
          drawChair(ix+iw*0.20+14, iy+ih*0.72+22);
          drawLamp(ix+iw*0.55+56, iy+ih*0.65, false);
          drawBookStack(ix+iw*0.62, iy+ih*0.42);
          drawBookStack(ix+iw*0.42, iy+ih*0.38);
          drawPlantPot(ix+iw-16, iy+ih-16);
          break;

        /* ─── 中央大閲覧室: ★ 書庫の心臓部 ★ ─── */
        case 'hub':
          drawHubFurniture(ix, iy, iw, ih, seed);
          break;

        /* ─── FCFの間: アルコーブ型読書室 ─── */
        case 'fcf':
          // Top wall bookshelves
          for(var s=0;s<6;s++) drawBookshelf(ix+s*54+4, iy, 48, 28, seed+s*39);
          // Right wall bookshelves
          drawBookshelf(ix+iw-18, iy+32, 14, ih-42, seed+400);
          // L-shaped alcove (left side)
          drawBookshelf(ix+4, iy+ih*0.25, 40, 16, seed+410);
          drawBookshelf(ix+4, iy+ih*0.25+16, 12, ih*0.35, seed+415);
          // Second island bookshelf (staggered right)
          drawBookshelf(ix+iw*0.55, iy+ih*0.25, 36, 16, seed+420);
          // Reading carrel in alcove
          drawDesk(ix+18, iy+ih*0.50, 30, 18);
          drawChair(ix+24, iy+ih*0.50+20);
          // Main desk
          drawDesk(ix+iw*0.40, iy+ih*0.55, 56, 24);
          drawChair(ix+iw*0.40+20, iy+ih*0.55+26);
          drawLamp(ix+iw*0.40-10, iy+ih*0.42, true);
          // Additional: globe + catalog + plant
          drawGlobe(ix+iw*0.72, iy+ih*0.50);
          drawCatalogBox(ix+iw*0.30, iy+ih*0.72);
          drawPlantPot(ix+iw-16, iy+ih-14);
          drawPlantPot(ix+4, iy+ih-14);
          drawBookStack(ix+iw*0.70, iy+ih*0.35);
          break;

        /* ─── 論考の棚: 静かな研究室 ─── */
        case 'research':
          // Top wall bookshelves (dense)
          for(var s=0;s<5;s++) drawBookshelf(ix+s*48+4, iy, 42, 26, seed+s*37);
          // Left wall bookshelf
          drawBookshelf(ix, iy+30, 12, ih-36, seed+450);
          // Island bookshelf
          drawBookshelf(ix+iw*0.35, iy+ih*0.30, 38, 16, seed+455);
          // Small desk + chair
          drawDesk(ix+iw*0.55, iy+ih*0.48, 48, 20);
          drawChair(ix+iw*0.55+16, iy+ih*0.48+22);
          drawLamp(ix+iw*0.55+52, iy+ih*0.48, false);
          break;

        /* ─── ニュース解説室 ─── */
        case 'news':
          // Top wall bookshelves
          for(var s=0;s<5;s++) drawBookshelf(ix+s*52+4, iy, 46, 24, seed+s*43);
          // Two reading desks
          drawDesk(ix+iw*0.10, iy+ih*0.45, 52, 22);
          drawDesk(ix+iw*0.55, iy+ih*0.45, 52, 22);
          drawChair(ix+iw*0.10+18, iy+ih*0.45+24);
          drawChair(ix+iw*0.55+18, iy+ih*0.45+24);
          drawLamp(ix+iw*0.40, iy+ih*0.28, false);
          // Bulletin board (wall decoration)
          ctx.fillStyle=C.woodDark; ctx.fillRect(ix+iw*0.78, iy+4, 28, 22);
          ctx.fillStyle='#5a4a38'; ctx.fillRect(ix+iw*0.78+2, iy+6, 24, 18);
          ctx.fillStyle=C.paper; ctx.fillRect(ix+iw*0.78+5, iy+8, 8, 6);
          ctx.fillStyle='#e8e0d0'; ctx.fillRect(ix+iw*0.78+15, iy+9, 8, 8);
          break;

        /* ─── 人類の智慧の棚: 瞑想的読書空間 ─── */
        case 'horizons':
          // Top wall bookshelves
          for(var s=0;s<5;s++) drawBookshelf(ix+s*52+4, iy, 46, 24, seed+s*47);
          // Right wall full bookshelf
          drawBookshelf(ix+iw-16, iy+4, 14, ih-10, seed+460);
          // Left wall partial bookshelf
          drawBookshelf(ix+4, iy+4, 12, ih*0.45, seed+462);
          // Reading alcove (left corner shelves forming nook)
          drawBookshelf(ix+4, iy+ih*0.25, 30, 14, seed+465);
          drawBookshelf(ix+4, iy+ih*0.25+14, 10, ih*0.3, seed+468);
          // Island bookshelf
          drawBookshelf(ix+iw*0.40, iy+ih*0.30, 34, 14, seed+470);
          // Desk in nook
          drawDesk(ix+16, iy+ih*0.50, 40, 20);
          drawChair(ix+28, iy+ih*0.50+22);
          // Second desk (right side)
          drawDesk(ix+iw*0.55, iy+ih*0.48, 42, 18);
          drawChair(ix+iw*0.55+14, iy+ih*0.48+20);
          drawPlantPot(ix+4, iy+ih-14);
          drawPlantPot(ix+iw-14, iy+ih-14);
          drawLamp(ix+8, iy+ih*0.38, false);
          drawGlobe(ix+iw*0.75, iy+ih*0.30);
          break;

        /* ─── 金融史の回廊: 深層アーカイブ ─── */
        case 'finhistory':
          // Top wall bookshelves (dense)
          for(var s=0;s<5;s++) drawBookshelf(ix+s*50+4, iy, 44, 26, seed+s*37);
          // Both side walls — full height
          drawBookshelf(ix, iy+4, 14, ih-10, seed+500);
          drawBookshelf(ix+iw-16, iy+4, 14, ih-10, seed+505);
          // Two island bookshelves (staggered)
          drawBookshelf(ix+iw*0.25, iy+ih*0.28, 40, 18, seed+510);
          drawBookshelf(ix+iw*0.50, iy+ih*0.35, 34, 16, seed+515);
          // Small desk
          drawDesk(ix+iw*0.35, iy+ih*0.58, 46, 20);
          drawChair(ix+iw*0.35+16, iy+ih*0.58+22);
          drawLamp(ix+iw*0.35+50, iy+ih*0.58, false);
          // Scrolls, display, catalog
          drawScroll(ix+iw*0.18, iy+ih*0.72);
          drawScroll(ix+iw*0.68, iy+ih*0.72);
          drawDisplayCase(ix+iw*0.18, iy+ih*0.50, 20, 14);
          drawDisplayCase(ix+iw*0.65, iy+ih*0.50, 20, 14);
          drawCatalogBox(ix+iw*0.78, iy+ih*0.62);
          break;

        /* ─── 思索の回廊: 展示ギャラリー ─── */
        case 'corridor':
          // Portraits of thinkers (larger, with spot lighting)
          for(var p=0;p<14;p++){
            var px=ix+15+p*(iw/14);
            // Spot light above portrait
            var spotGlow = ctx.createRadialGradient(px+11,iy+2,1,px+11,iy+2,18);
            spotGlow.addColorStop(0,'rgba(255,210,80,.08)');
            spotGlow.addColorStop(1,'rgba(255,210,80,0)');
            ctx.fillStyle=spotGlow; ctx.fillRect(px-7,iy-8,36,30);
            // Frame
            ctx.fillStyle=C.gold2; ctx.fillRect(px,iy+2,22,20);
            ctx.fillStyle='#1a1208'; ctx.fillRect(px+2,iy+4,18,16);
            ctx.fillStyle='#4a3a2a'; ctx.fillRect(px+3,iy+5,16,13);
            // Bust silhouette
            ctx.fillStyle='#d4b896'; ctx.beginPath(); ctx.arc(px+11,iy+10,3.5,0,Math.PI*2); ctx.fill();
            ctx.fillRect(px+7,iy+13,8,5);
          }
          // Bust pedestals between portraits (exhibition markers)
          for(var bp=0;bp<5;bp++){
            var bpx = ix + iw*0.10 + bp*(iw/5);
            // Pedestal
            ctx.fillStyle=C.woodDark; ctx.fillRect(bpx,iy+ih*0.35,12,14);
            ctx.fillStyle=C.woodMid; ctx.fillRect(bpx+1,iy+ih*0.35+1,10,12);
            ctx.fillStyle=C.woodLight; ctx.fillRect(bpx+2,iy+ih*0.35,8,2);
            // Small bust on top
            ctx.fillStyle='#c8b898'; ctx.beginPath(); ctx.arc(bpx+6,iy+ih*0.35-3,3,0,Math.PI*2); ctx.fill();
            ctx.fillRect(bpx+3,iy+ih*0.35-1,6,2);
          }
          // Benches (between pedestals)
          drawBench(ix+iw*0.17, iy+ih*0.60, 50);
          drawBench(ix+iw*0.37, iy+ih*0.60, 50);
          drawBench(ix+iw*0.57, iy+ih*0.60, 50);
          drawBench(ix+iw*0.77, iy+ih*0.60, 50);
          // Plants at rhythm intervals
          drawPlantPot(ix+iw*0.05, iy+ih*0.45);
          drawPlantPot(ix+iw*0.27, iy+ih*0.45);
          drawPlantPot(ix+iw*0.47, iy+ih*0.45);
          drawPlantPot(ix+iw*0.67, iy+ih*0.45);
          drawPlantPot(ix+iw*0.87, iy+ih*0.45);
          // Globe at corridor center
          drawGlobe(ix+iw*0.50, iy+ih*0.45);
          break;
      }
    }
  }

  /* ── Hub special: 中央大閲覧室 ── */
  function drawHubFurniture(ix, iy, iw, ih, seed) {
    // ★ Central island display shelves (low, glass-top style)
    drawBookshelf(ix+iw*0.15, iy+ih*0.12, 52, 16, seed+600);
    drawBookshelf(ix+iw*0.68, iy+ih*0.12, 52, 16, seed+605);

    // ★ Two grand long desks (4-person, the heart of the room)
    drawLongDesk(ix+iw*0.15, iy+ih*0.35, 100, 30);
    drawLongDesk(ix+iw*0.55, iy+ih*0.35, 100, 30);

    // Chairs around left desk
    drawChair(ix+iw*0.15+8,  iy+ih*0.35+34);
    drawChair(ix+iw*0.15+35, iy+ih*0.35+34);
    drawChair(ix+iw*0.15+62, iy+ih*0.35+34);
    drawChair(ix+iw*0.15+85, iy+ih*0.35+34);

    // Chairs around right desk
    drawChair(ix+iw*0.55+8,  iy+ih*0.35+34);
    drawChair(ix+iw*0.55+35, iy+ih*0.35+34);
    drawChair(ix+iw*0.55+62, iy+ih*0.35+34);
    drawChair(ix+iw*0.55+85, iy+ih*0.35+34);

    // ★ Center piece: globe + catalog
    drawGlobe(ix+iw*0.50, iy+ih*0.20);
    drawCatalogBox(ix+iw*0.50-9, iy+ih*0.30);

    // Side display shelves (smaller, offset)
    drawBookshelf(ix+iw*0.03, iy+ih*0.30, 14, ih*0.40, seed+610);
    drawBookshelf(ix+iw-22,   iy+ih*0.30, 14, ih*0.40, seed+615);

    // Reading benches (flanking)
    drawBench(ix+iw*0.08, iy+ih*0.75, 60);
    drawBench(ix+iw*0.78, iy+ih*0.75, 60);

    // Scrolls & book stacks
    drawScroll(ix+iw*0.22, iy+ih*0.72);
    drawScroll(ix+iw*0.65, iy+ih*0.72);
    drawBookStack(ix+iw*0.42, iy+ih*0.68);
    drawBookStack(ix+iw*0.58, iy+ih*0.68);

    // Plants in all corners
    drawPlantPot(ix+6, iy+6);
    drawPlantPot(ix+iw-18, iy+6);
    drawPlantPot(ix+6, iy+ih-18);
    drawPlantPot(ix+iw-18, iy+ih-18);

    // Additional lamps at desk ends
    drawLamp(ix+iw*0.13, iy+ih*0.35, true);
    drawLamp(ix+iw*0.53, iy+ih*0.35, true);
  }

  /* ══════════════════════════════════════
     15. DRAWING — ROOM LABELS
     ══════════════════════════════════════ */
  /* 木製プレート型タイトル + 案C部屋ごと差し色 */
  var PLATE_COLORS = {
    entrance:   {bg:'rgba(58,36,20,.82)', hi:'rgba(110,80,45,.30)'},
    principles: {bg:'rgba(62,30,30,.82)', hi:'rgba(110,60,50,.30)'},
    moat:       {bg:'rgba(28,36,58,.82)', hi:'rgba(50,65,100,.30)'},
    companies:  {bg:'rgba(28,48,32,.82)', hi:'rgba(50,80,55,.30)'},
    hub:        {bg:'rgba(65,42,22,.88)', hi:'rgba(130,95,50,.40)'},
    fcf:        {bg:'rgba(58,36,20,.82)', hi:'rgba(110,80,45,.30)'},
    research:   {bg:'rgba(48,38,22,.82)', hi:'rgba(90,75,40,.30)'},
    news:       {bg:'rgba(50,32,48,.82)', hi:'rgba(90,60,80,.30)'},
    horizons:   {bg:'rgba(30,48,58,.82)', hi:'rgba(55,80,95,.30)'},
    finhistory: {bg:'rgba(42,28,18,.85)', hi:'rgba(80,60,35,.30)'},
    corridor:   {bg:'rgba(38,48,38,.82)', hi:'rgba(65,80,60,.30)'}
  };

  function drawRoomLabels() {
    var ids = Object.keys(ROOMS);
    for (var i=0;i<ids.length;i++) {
      var id=ids[i], r=ROOMS[id], hov=(hoveredRoom===id);
      var cx = r.x + r.w/2;
      var isHub = (id==='hub');
      var isSmall = (r.h < 160);
      var pc = PLATE_COLORS[id] || PLATE_COLORS.entrance;

      var enSz  = isHub ? 10 : (isSmall ? 7 : 9);
      var jpSz  = isHub ? 18 : (isSmall ? 13 : 15);
      var subSz = isHub ? 9  : 7;

      var pw = Math.min(r.w - 20, isHub ? 280 : 220);
      var ph = isSmall ? 30 : (isHub ? 46 : 38);
      var py = r.y + r.h - ph - 6;
      var px = cx - pw/2;

      // ── Wood plate background (room-specific tone) ──
      ctx.fillStyle = pc.bg;
      ctx.fillRect(px, py, pw, ph);

      // Top-edge highlight (wood light reflection)
      ctx.fillStyle = pc.hi;
      ctx.fillRect(px+1, py, pw-2, 2);

      // Second highlight line (subtle wood grain)
      ctx.fillStyle = 'rgba(255,220,140,.06)';
      ctx.fillRect(px+2, py+2, pw-4, 1);

      // Bottom shadow
      ctx.fillStyle = 'rgba(0,0,0,.30)';
      ctx.fillRect(px+2, py+ph, pw-4, 2);
      ctx.fillStyle = 'rgba(0,0,0,.12)';
      ctx.fillRect(px+4, py+ph+2, pw-8, 1);

      // Gold border
      ctx.strokeStyle = hov ? 'rgba(196,155,74,.90)' : 'rgba(196,155,74,.50)';
      ctx.lineWidth = isHub ? 1.5 : 1;
      ctx.strokeRect(px+0.5, py+0.5, pw-1, ph-1);

      // Hub gets an inner gold border too
      if (isHub) {
        ctx.strokeStyle = hov ? 'rgba(196,155,74,.30)' : 'rgba(196,155,74,.15)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(px+3, py+3, pw-6, ph-6);
      }

      // Ensure sharp text: no blur, integer coords
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
      var tcx = Math.round(cx);

      // ── English category (gold, sharp) ──
      ctx.font = '500 '+enSz+'px "DM Mono",monospace';
      ctx.fillStyle = hov ? '#c9a85a' : 'rgba(201,168,90,.65)';
      var enY = Math.round(py + enSz + 4);
      ctx.fillText(r.labelEn, tcx, enY);

      // ── Thin gold separator ──
      var sepY = Math.round(enY + 3) + 0.5; // .5 for crisp 1px line
      ctx.strokeStyle = hov ? 'rgba(196,155,74,.40)' : 'rgba(196,155,74,.20)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(Math.round(tcx-pw*0.25), sepY); ctx.lineTo(Math.round(tcx+pw*0.25), sepY); ctx.stroke();

      // ── Japanese main title (warm cream, no glow) ──
      // Subtle dark outline for crispness on dark plate
      ctx.font = '700 '+jpSz+'px "Noto Serif JP",serif';
      var jpY = Math.round(sepY + jpSz + 2);
      ctx.fillStyle = 'rgba(20,10,0,.35)';
      ctx.fillText(r.label, tcx+1, jpY+1); // tiny shadow offset
      ctx.fillStyle = hov ? '#F3E7D3' : '#EEDFC7';
      ctx.fillText(r.label, tcx, jpY);

      // ── Subtitle (muted gold — skip for small rooms) ──
      if (r.sub && !isSmall) {
        ctx.font = '400 '+subSz+'px "DM Mono",monospace';
        ctx.fillStyle = hov ? 'rgba(201,168,90,.55)' : 'rgba(201,168,90,.35)';
        ctx.fillText(r.sub, tcx, Math.round(jpY + subSz + 3));
      }
    }
  }

  /* ══════════════════════════════════════
     16. DRAWING — HOVER EFFECT
     ══════════════════════════════════════ */
  function drawHover() {
    if (!hoveredRoom) return;
    var r = ROOMS[hoveredRoom];
    ctx.fillStyle = 'rgba(212,170,34,.06)'; ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = 'rgba(212,170,34,.5)'; ctx.lineWidth = 2; ctx.strokeRect(r.x+1, r.y+1, r.w-2, r.h-2);
  }

  /* ══════════════════════════════════════
     17. NPC MOVEMENT & DRAWING
     ══════════════════════════════════════ */
  var CHAR_W=64, CHAR_H=64, NPC_SPEED=0.003, WALK_FRAMES=36, WALK_DURATION=4;

  function updateNPCs() {
    for(var i=0;i<NPCS.length;i++){
      var npc=NPCS[i];
      if(npc.pose!=='walk') continue;
      if(npc.state==='idle'){npc.wait--;
        if(npc.wait<=0){npc.tx=0.15+Math.random()*0.7; npc.ty=0.25+Math.random()*0.55; npc.state='walk';}
      } else {
        var dx=npc.tx-npc.rx, dy=npc.ty-npc.ry, dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<NPC_SPEED*2){npc.rx=npc.tx; npc.ry=npc.ty; npc.state='idle'; npc.wait=80+Math.floor(Math.random()*160); npc.walkFrame=0;}
        else{npc.rx+=dx/dist*NPC_SPEED; npc.ry+=dy/dist*NPC_SPEED;
          npc.walkFrame=(npc.walkFrame+1)%WALK_FRAMES;
          npc.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?2:1):(dy>0?0:3);}
        dirty=true;
      }
    }
  }

  function drawNPCs() {
    for(var i=0;i<NPCS.length;i++){
      var npc=NPCS[i], r=ROOMS[npc.room]; if(!r)continue;
      var x=Math.round(r.x+r.w*npc.rx), y=Math.round(r.y+r.h*npc.ry);
      var bc=npc.bodyColor||'#4a6a3a';

      // Shadow
      ctx.fillStyle='rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x,y+15,8,3,0,0,Math.PI*2); ctx.fill();

      if(npc.pose==='reading') {
        drawNPCReading(x,y,bc,i);
      } else if(npc.pose==='shelving') {
        drawNPCShelving(x,y,bc,i);
      } else if(npc.pose==='idle') {
        drawNPCIdle(x,y,bc,npc);
      } else {
        drawNPCWalking(x,y,npc);
      }

      // Name label
      ctx.font='600 7px "Noto Serif JP",serif'; ctx.textAlign='center';
      ctx.fillStyle='rgba(0,0,0,.4)'; ctx.fillText(npc.name,x+1,y-16);
      ctx.fillStyle=C.gold; ctx.fillText(npc.name,x,y-17);
    }
  }

  function drawNPCWalking(x,y,npc) {
    var sheet=null, col=0, row=npc.dir||0, dw=28, dh=28;
    if(npc.state==='walk'&&assets.charWalk&&assets.charWalk.complete&&assets.charWalk.naturalWidth>0){
      sheet=assets.charWalk;
      col=Math.floor(npc.walkFrame/WALK_DURATION);
      col = ((col % 9) + 9) % 9; // safe mod
    } else if(assets.charIdle&&assets.charIdle.complete&&assets.charIdle.naturalWidth>0){
      sheet=assets.charIdle; col=0;
    }
    if(sheet){
      var sx=col*CHAR_W, sy=row*CHAR_H;
      // Boundary check — no blue fallback
      if(sx>=0 && sy>=0 && sx+CHAR_W<=sheet.naturalWidth && sy+CHAR_H<=sheet.naturalHeight){
        try{ctx.drawImage(sheet,sx,sy,CHAR_W,CHAR_H,Math.round(x-dw/2),Math.round(y-dh/2),dw,dh);}catch(e){}
      }
    }
  }

  // idle NPC: sprite idle pose
  function drawNPCIdle(x,y,bc,npc) {
    var dw=28, dh=28;
    if(assets.charIdle&&assets.charIdle.complete&&assets.charIdle.naturalWidth>0){
      var row = npc.dir || 0;
      var sx=0, sy=row*CHAR_H;
      if(sx+CHAR_W<=assets.charIdle.naturalWidth && sy+CHAR_H<=assets.charIdle.naturalHeight){
        try{ctx.drawImage(assets.charIdle,sx,sy,CHAR_W,CHAR_H,Math.round(x-dw/2),Math.round(y-dh/2),dw,dh);}catch(e){}
        return;
      }
    }
    // Fallback: simple standing figure
    ctx.fillStyle='#d4b896'; ctx.beginPath(); ctx.arc(x,y-6,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=bc; ctx.fillRect(x-5,y-1,10,11);
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(x-3,y+10,3,5); ctx.fillRect(x+1,y+10,3,5);
  }

  function drawNPCReading(x,y,bc,idx) {
    // Chair
    ctx.fillStyle=C.woodMid; ctx.fillRect(x-6,y+4,12,8);
    ctx.fillStyle=C.woodDark; ctx.fillRect(x-5,y,10,5);
    // Head
    ctx.fillStyle='#d4b896'; ctx.beginPath(); ctx.arc(x,y-6,5,0,Math.PI*2); ctx.fill();
    // Hair
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(x-4,y-11,8,4);
    // Body (leaning forward)
    ctx.fillStyle=bc; ctx.fillRect(x-5,y-1,10,8);
    // Arms reaching to desk
    ctx.fillStyle=bc; ctx.fillRect(x-7,y+1,4,3); ctx.fillRect(x+3,y+1,4,3);
    // Hands
    ctx.fillStyle='#d4b896'; ctx.fillRect(x-8,y+1,2,2); ctx.fillRect(x+6,y+1,2,2);
    // Open book on desk
    ctx.fillStyle='#f0e8d0'; ctx.fillRect(x-8,y+3,16,8);
    ctx.fillStyle=bookColors[idx%bookColors.length]; ctx.fillRect(x-8,y+3,1,8); ctx.fillRect(x+7,y+3,1,8);
    ctx.fillStyle='rgba(26,18,8,.15)'; ctx.fillRect(x-1,y+4,1,6);
    // Text lines
    ctx.fillStyle='rgba(26,18,8,.1)';
    ctx.fillRect(x-6,y+5,5,0.5); ctx.fillRect(x-6,y+7,5,0.5);
    ctx.fillRect(x+1,y+5,5,0.5); ctx.fillRect(x+1,y+7,5,0.5);
  }

  function drawNPCShelving(x,y,bc,idx) {
    // Legs
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(x-3,y+8,3,5); ctx.fillRect(x+1,y+8,3,5);
    // Body
    ctx.fillStyle=bc; ctx.fillRect(x-5,y-2,10,11);
    // Head (looking up)
    ctx.fillStyle='#d4b896'; ctx.beginPath(); ctx.arc(x,y-7,5,0,Math.PI*2); ctx.fill();
    // Hair
    ctx.fillStyle='#3a2a1a'; ctx.fillRect(x-4,y-12,8,4);
    // Right arm reaching up
    ctx.fillStyle=bc; ctx.fillRect(x+4,y-8,3,10);
    ctx.fillStyle='#d4b896'; ctx.fillRect(x+4,y-10,3,3);
    // Left arm with book
    ctx.fillStyle=bc; ctx.fillRect(x-7,y+1,3,5);
    ctx.fillStyle=bookColors[idx%bookColors.length]; ctx.fillRect(x-9,y+3,4,6);
  }

  /* ══════════════════════════════════════
     18. ATMOSPHERE (v4 — room-specific dimming)
     ══════════════════════════════════════ */
  function drawAtmosphere() {
    // Global vignette (lighter center for hub emphasis)
    var hub = ROOMS.hub;
    var hcx = hub.x + hub.w/2, hcy = hub.y + hub.h/2;
    var vg = ctx.createRadialGradient(hcx, hcy, CH*0.20, hcx, hcy, CH*0.90);
    vg.addColorStop(0,'rgba(10,8,4,0)');
    vg.addColorStop(0.5,'rgba(10,8,4,.15)');
    vg.addColorStop(1,'rgba(10,8,4,.35)');
    ctx.fillStyle=vg; ctx.fillRect(0,0,CW,CH);

    // Extra dimming for quiet rooms (finhistory, research)
    var quietRooms = ['finhistory','research'];
    for (var qi=0;qi<quietRooms.length;qi++) {
      var qr = ROOMS[quietRooms[qi]];
      if(qr) { ctx.fillStyle='rgba(10,8,4,.10)'; ctx.fillRect(qr.x,qr.y,qr.w,qr.h); }
    }
  }

  /* ══════════════════════════════════════
     19. MAIN RENDER
     ══════════════════════════════════════ */
  function render() {
    ctx.fillStyle=C.bg; ctx.fillRect(0,0,CW,CH);
    drawFloors();
    drawCarpets();
    drawHover();
    drawAllFurniture();
    drawInternalWalls();
    drawOuterWalls();
    drawAllLighting();
    drawNPCs();
    drawAtmosphere();
    drawRoomLabels();
    // Title
    ctx.font='500 8px "DM Mono",monospace'; ctx.textAlign='left';
    ctx.fillStyle='rgba(184,144,10,.4)'; ctx.fillText('THE LIBRARY \u00b7 \u66f8\u5eab\u306e\u5168\u666f', OW+8, CH-OW-4);
  }

  /* ══════════════════════════════════════
     20. INTERACTION
     ══════════════════════════════════════ */
  function hitTest(mx,my){var ids=Object.keys(ROOMS);for(var i=0;i<ids.length;i++){var r=ROOMS[ids[i]];if(mx>=r.x&&mx<r.x+r.w&&my>=r.y&&my<r.y+r.h)return ids[i];}return null;}
  function getPos(e){var rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)*CW/rect.width,y:(e.clientY-rect.top)*CH/rect.height};}

  function onMouseMove(e){
    var p=getPos(e), hit=hitTest(p.x,p.y);
    if(hit!==hoveredRoom){hoveredRoom=hit; canvas.style.cursor=(hit&&ROOMS[hit].url)?'pointer':'default'; dirty=true;
      var info=document.getElementById('mapRoomInfo');
      if(info){if(hit){var r=ROOMS[hit]; info.style.opacity='1';
        info.innerHTML='<div class="map-room-info-inner"><span class="map-room-name">'+r.label+'</span><span class="map-room-name-en">'+r.labelEn+'</span><div class="map-room-desc">'+(ROOM_DESC[hit]||'')+'</div>'+(r.url?'<a class="map-room-btn" href="'+r.url+'">この部屋へ \u2192</a>':'<span class="map-room-btn disabled">各部屋への分岐点</span>')+'</div>';
      }else{info.style.opacity='0';}}
    }
  }

  function onClick(e){var p=getPos(e),hit=hitTest(p.x,p.y);if(hit&&ROOMS[hit].url)window.location.href=ROOMS[hit].url;}

  /* ══════════════════════════════════════
     21. ANIMATION LOOP
     ══════════════════════════════════════ */
  function tick(){
    frameCount++;
    if(frameCount%30===0){animFrame++;dirty=true;}
    if(frameCount%2===0)updateNPCs();
    if(frameCount%3===0)dirty=true;
    if(dirty){render();dirty=false;}
    requestAnimationFrame(tick);
  }

  /* ══════════════════════════════════════
     22. INIT
     ══════════════════════════════════════ */
  function init(){
    canvas=document.getElementById('libraryMapCanvas'); if(!canvas)return;
    // HiDPI: internal resolution = display size × devicePixelRatio
    var dpr = window.devicePixelRatio || 1;
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;
    canvas.style.width = CW + 'px';
    canvas.style.height = CH + 'px';
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;
    canvas.addEventListener('mousemove',onMouseMove);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('mouseleave',function(){hoveredRoom=null;canvas.style.cursor='default';dirty=true;var info=document.getElementById('mapRoomInfo');if(info)info.style.opacity='0';});
    canvas.addEventListener('touchstart',function(e){e.preventDefault();var t=e.touches[0];onMouseMove({clientX:t.clientX,clientY:t.clientY});onClick({clientX:t.clientX,clientY:t.clientY});},{passive:false});
    loadAssets(function(){initFloorPatterns();dirty=true;tick();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
