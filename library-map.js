/* ═══════════════════════════════════════════════════════
   library-map.js – 書庫地図 v3 (Connected Floor Plan)
   One unified library · Tileset textures · LPC characters
   Candles & atmospheric lighting
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
    entrance: {a:'#4a3a20',b:'#5a4a30'}, principles: {a:'#4a2a2a',b:'#5a3535'},
    moat: {a:'#2a3a5a',b:'#3a4a6a'}, companies: {a:'#2a4a3a',b:'#3a5a4a'},
    hub: {a:'#5a4a20',b:'#6a5a30'}, fcf: {a:'#4a2a2a',b:'#5a3535'},
    research: {a:'#3a3a20',b:'#4a4a30'}, news: {a:'#3a2a3a',b:'#4a3a4a'},
    horizons: {a:'#2a3a4a',b:'#3a4a5a'}, finhistory: {a:'#3a2a20',b:'#4a3a30'},
    corridor: {a:'#2a3a2a',b:'#3a4a3a'}
  };

  /* ══════════════════════════════════════
     2. ROOM LAYOUT (Connected, no gaps)
     ══════════════════════════════════════ */
  var IX = OW, IY = OW; // interior origin
  var IW_TOTAL = CW - OW * 2, IH_TOTAL = CH - OW * 2;

  // Row heights
  var RH1 = 200, RH2 = 200, RH3 = 150, RH4 = IH_TOTAL - RH1 - RH2 - RH3;
  // Column widths (3-col rows)
  var CW3 = Math.floor(IW_TOTAL / 3);
  var CW3R = IW_TOTAL - CW3 * 2; // last col gets remainder
  // Column widths (4-col rows)
  var CW4 = Math.floor(IW_TOTAL / 4);
  var CW4R = IW_TOTAL - CW4 * 3;

  var ROOMS = {
    entrance:   { x:IX,          y:IY,              w:CW3,  h:RH1, label:'入口ホール',       labelEn:'ENTRANCE',    url:'hajimete/',                    floor:'stone'  },
    principles: { x:IX+CW3,      y:IY,              w:CW3,  h:RH1, label:'投資原則の間',     labelEn:'PRINCIPLES',  url:'principles/',                  floor:'wood'   },
    moat:       { x:IX+CW3*2,    y:IY,              w:CW3R, h:RH1, label:'Moatの間',         labelEn:'MOAT',        url:'moat/',                        floor:'ornate' },
    companies:  { x:IX,          y:IY+RH1,          w:CW3,  h:RH2, label:'企業分析書架',     labelEn:'COMPANIES',   url:'companies/',                   floor:'wood'   },
    hub:        { x:IX+CW3,      y:IY+RH1,          w:CW3,  h:RH2, label:'中央広間',         labelEn:'MAIN HALL',   url:null,                           floor:'marble' },
    fcf:        { x:IX+CW3*2,    y:IY+RH1,          w:CW3R, h:RH2, label:'FCFの間',          labelEn:'FCF',         url:'fcf/',                         floor:'wood'   },
    research:   { x:IX,          y:IY+RH1+RH2,      w:CW4,  h:RH3, label:'論考の棚',         labelEn:'RESEARCH',    url:'research/',                    floor:'dark'   },
    news:       { x:IX+CW4,      y:IY+RH1+RH2,      w:CW4,  h:RH3, label:'ニュース解説室',   labelEn:'NEWS',        url:'news/',                        floor:'stone'  },
    horizons:   { x:IX+CW4*2,    y:IY+RH1+RH2,      w:CW4,  h:RH3, label:'古典と思想の棚',   labelEn:'HORIZONS',    url:'horizons/',                    floor:'ornate' },
    finhistory: { x:IX+CW4*3,    y:IY+RH1+RH2,      w:CW4R, h:RH3, label:'金融史の書庫',     labelEn:'FIN HISTORY', url:'horizons/financial-history/',   floor:'dark'   },
    corridor:   { x:IX,          y:IY+RH1+RH2+RH3,  w:IW_TOTAL, h:RH4, label:'思考の回廊',   labelEn:'CORRIDOR',    url:'thinkers/',                    floor:'stone'  }
  };

  var ROOM_DESC = {
    entrance:'はじめての方へ。投資図書館の歩き方。', principles:'バフェット、マンガー、フィッシャーの投資原則。',
    moat:'経済的な堀（モート）の分類と事例。', companies:'企業分析ページの一覧と検索。',
    hub:'書庫の中央広間。各部屋への分岐点。', fcf:'フリーキャッシュフローの読み方と活用。',
    research:'独自の論考・分析記事のアーカイブ。', news:'最新ニュースの解説と考察。',
    horizons:'禅・哲学・テクノロジー思想の書棚。', finhistory:'メソポタミアからAI革命まで。7000年の金融史。',
    corridor:'投資思想家たちの人物録。'
  };

  /* ══════════════════════════════════════
     3. INTERNAL WALLS (with doorways)
     ══════════════════════════════════════ */
  // Each wall: {x,y,w,h, doorPos} doorPos = fraction along wall for door center
  function getInternalWalls() {
    var walls = [];
    // Vertical walls between columns (row 1)
    walls.push({ x:IX+CW3-IW/2, y:IY, w:IW, h:RH1, dir:'v', doorY:0.5 });
    walls.push({ x:IX+CW3*2-IW/2, y:IY, w:IW, h:RH1, dir:'v', doorY:0.5 });
    // Vertical walls between columns (row 2)
    walls.push({ x:IX+CW3-IW/2, y:IY+RH1, w:IW, h:RH2, dir:'v', doorY:0.5 });
    walls.push({ x:IX+CW3*2-IW/2, y:IY+RH1, w:IW, h:RH2, dir:'v', doorY:0.5 });
    // Vertical walls between columns (row 3)
    walls.push({ x:IX+CW4-IW/2, y:IY+RH1+RH2, w:IW, h:RH3, dir:'v', doorY:0.5 });
    walls.push({ x:IX+CW4*2-IW/2, y:IY+RH1+RH2, w:IW, h:RH3, dir:'v', doorY:0.5 });
    walls.push({ x:IX+CW4*3-IW/2, y:IY+RH1+RH2, w:IW, h:RH3, dir:'v', doorY:0.5 });
    // Horizontal walls between rows
    // Row 1 <-> Row 2
    walls.push({ x:IX, y:IY+RH1-IW/2, w:CW3, h:IW, dir:'h', doorX:0.5 });
    walls.push({ x:IX+CW3, y:IY+RH1-IW/2, w:CW3, h:IW, dir:'h', doorX:0.5 });
    walls.push({ x:IX+CW3*2, y:IY+RH1-IW/2, w:CW3R, h:IW, dir:'h', doorX:0.5 });
    // Row 2 <-> Row 3
    walls.push({ x:IX, y:IY+RH1+RH2-IW/2, w:IW_TOTAL, h:IW, dir:'h', doorX:0.15 });
    walls.push({ x:IX, y:IY+RH1+RH2-IW/2, w:IW_TOTAL, h:IW, dir:'h', doorX:0.4 });
    walls.push({ x:IX, y:IY+RH1+RH2-IW/2, w:IW_TOTAL, h:IW, dir:'h', doorX:0.65 });
    walls.push({ x:IX, y:IY+RH1+RH2-IW/2, w:IW_TOTAL, h:IW, dir:'h', doorX:0.88 });
    // Row 3 <-> Corridor
    walls.push({ x:IX, y:IY+RH1+RH2+RH3-IW/2, w:IW_TOTAL, h:IW, dir:'h', doorX:0.12 });
    walls.push({ x:IX, y:IY+RH1+RH2+RH3-IW/2, w:IW_TOTAL, h:IW, dir:'h', doorX:0.38 });
    walls.push({ x:IX, y:IY+RH1+RH2+RH3-IW/2, w:IW_TOTAL, h:IW, dir:'h', doorX:0.62 });
    walls.push({ x:IX, y:IY+RH1+RH2+RH3-IW/2, w:IW_TOTAL, h:IW, dir:'h', doorX:0.88 });
    return walls;
  }

  /* ══════════════════════════════════════
     4. NPC DEFINITIONS
     ══════════════════════════════════════ */
  var NPCS = [
    { room:'entrance',   name:'案内人', rx:0.6, ry:0.55, dir:0, tx:0, ty:0, state:'idle', wait:0, walkFrame:0 },
    { room:'hub',        name:'執事',   rx:0.5, ry:0.5,  dir:0, tx:0, ty:0, state:'idle', wait:0, walkFrame:0 },
    { room:'principles', name:'学者',   rx:0.35,ry:0.6,  dir:2, tx:0, ty:0, state:'idle', wait:0, walkFrame:0 },
    { room:'companies',  name:'司書',   rx:0.7, ry:0.5,  dir:1, tx:0, ty:0, state:'idle', wait:0, walkFrame:0 },
    { room:'corridor',   name:'旅人',   rx:0.5, ry:0.4,  dir:0, tx:0, ty:0, state:'idle', wait:0, walkFrame:0 },
    { room:'finhistory', name:'語り部', rx:0.5, ry:0.55, dir:0, tx:0, ty:0, state:'idle', wait:0, walkFrame:0 }
  ];
  for (var ni = 0; ni < NPCS.length; ni++) { NPCS[ni].tx = NPCS[ni].rx; NPCS[ni].ty = NPCS[ni].ry; }

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
     9. DRAWING — CARPETS
     ══════════════════════════════════════ */
  function drawCarpets() {
    var ids = Object.keys(ROOMS);
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i], r = ROOMS[id], cc = CARPET_COLORS[id];
      if (!cc || id === 'corridor') continue;
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

  /* ══════════════════════════════════════
     10. DRAWING — OUTER WALLS
     ══════════════════════════════════════ */
  function drawOuterWalls() {
    var grad;
    // Top
    grad = ctx.createLinearGradient(0,0,0,OW);
    grad.addColorStop(0,'#0e0a04'); grad.addColorStop(0.6,C.wallMid); grad.addColorStop(1,C.wallInner);
    ctx.fillStyle = grad; ctx.fillRect(0,0,CW,OW);
    // Bottom
    grad = ctx.createLinearGradient(0,CH-OW,0,CH);
    grad.addColorStop(0,C.wallInner); grad.addColorStop(0.4,C.wallMid); grad.addColorStop(1,'#0e0a04');
    ctx.fillStyle = grad; ctx.fillRect(0,CH-OW,CW,OW);
    // Left
    grad = ctx.createLinearGradient(0,0,OW,0);
    grad.addColorStop(0,'#0e0a04'); grad.addColorStop(0.6,C.wallMid); grad.addColorStop(1,C.wallInner);
    ctx.fillStyle = grad; ctx.fillRect(0,0,OW,CH);
    // Right
    grad = ctx.createLinearGradient(CW-OW,0,CW,0);
    grad.addColorStop(0,C.wallInner); grad.addColorStop(0.4,C.wallMid); grad.addColorStop(1,'#0e0a04');
    ctx.fillStyle = grad; ctx.fillRect(CW-OW,0,OW,CH);
  }

  /* ══════════════════════════════════════
     11. DRAWING — INTERNAL WALLS
     ══════════════════════════════════════ */
  function drawInternalWalls() {
    // Deduplicated horizontal walls
    var hWalls = [
      // Row1 <-> Row2 (3 segments with doors)
      { y:IY+RH1-IW/2, segments:[ {x:IX,w:CW3,door:0.5},{x:IX+CW3,w:CW3,door:0.5},{x:IX+CW3*2,w:CW3R,door:0.5} ] },
      // Row2 <-> Row3
      { y:IY+RH1+RH2-IW/2, segments:[ {x:IX,w:IW_TOTAL,doors:[0.12,0.38,0.62,0.88]} ] },
      // Row3 <-> Corridor
      { y:IY+RH1+RH2+RH3-IW/2, segments:[ {x:IX,w:IW_TOTAL,doors:[0.12,0.38,0.62,0.88]} ] }
    ];

    // Draw horizontal walls
    for (var hi = 0; hi < hWalls.length; hi++) {
      var hw = hWalls[hi];
      for (var si = 0; si < hw.segments.length; si++) {
        var seg = hw.segments[si];
        var doors = seg.doors || (seg.door !== undefined ? [seg.door] : []);
        // Build mask of wall sections
        var sections = [];
        var sx = seg.x;
        for (var di = 0; di < doors.length; di++) {
          var doorCenter = seg.x + seg.w * doors[di];
          var doorStart = doorCenter - DOOR/2;
          var doorEnd = doorCenter + DOOR/2;
          if (doorStart > sx) sections.push({x:sx, w:doorStart-sx});
          sx = doorEnd;
        }
        if (sx < seg.x + seg.w) sections.push({x:sx, w:seg.x+seg.w-sx});
        for (var si2 = 0; si2 < sections.length; si2++) {
          var s = sections[si2];
          ctx.fillStyle = C.wallMid; ctx.fillRect(s.x, hw.y, s.w, IW);
          ctx.fillStyle = 'rgba(184,144,10,.15)'; ctx.fillRect(s.x, hw.y+IW/2, s.w, 0.5);
        }
        // Pillars at door edges
        for (var di2 = 0; di2 < doors.length; di2++) {
          var dc = seg.x + seg.w * doors[di2];
          drawPillar(dc - DOOR/2 - 3, hw.y - 3);
          drawPillar(dc + DOOR/2 - 3, hw.y - 3);
        }
      }
    }

    // Vertical walls
    var vWalls = [
      // Row 1 columns
      { x:IX+CW3-IW/2, y:IY, h:RH1, door:0.5 },
      { x:IX+CW3*2-IW/2, y:IY, h:RH1, door:0.5 },
      // Row 2 columns
      { x:IX+CW3-IW/2, y:IY+RH1, h:RH2, door:0.5 },
      { x:IX+CW3*2-IW/2, y:IY+RH1, h:RH2, door:0.5 },
      // Row 3 columns
      { x:IX+CW4-IW/2, y:IY+RH1+RH2, h:RH3, door:0.5 },
      { x:IX+CW4*2-IW/2, y:IY+RH1+RH2, h:RH3, door:0.5 },
      { x:IX+CW4*3-IW/2, y:IY+RH1+RH2, h:RH3, door:0.5 }
    ];

    for (var vi = 0; vi < vWalls.length; vi++) {
      var vw = vWalls[vi];
      var doorCenter = vw.y + vw.h * vw.door;
      var doorStart = doorCenter - DOOR/2, doorEnd = doorCenter + DOOR/2;
      // Top section
      if (doorStart > vw.y) {
        ctx.fillStyle = C.wallMid; ctx.fillRect(vw.x, vw.y, IW, doorStart - vw.y);
      }
      // Bottom section
      if (doorEnd < vw.y + vw.h) {
        ctx.fillStyle = C.wallMid; ctx.fillRect(vw.x, doorEnd, IW, vw.y + vw.h - doorEnd);
      }
      // Gold trim
      ctx.fillStyle = 'rgba(184,144,10,.15)'; ctx.fillRect(vw.x+IW/2, vw.y, 0.5, vw.h);
      // Pillars
      drawPillar(vw.x - 2, doorStart - 6);
      drawPillar(vw.x - 2, doorEnd - 0);
    }
  }

  function drawPillar(x, y) {
    ctx.fillStyle = C.wallInner; ctx.fillRect(x, y, IW+4, IW+4);
    ctx.fillStyle = C.wallHighlight; ctx.fillRect(x+1, y+1, IW+2, IW+2);
    ctx.fillStyle = 'rgba(184,144,10,.2)'; ctx.fillRect(x+2, y+2, IW, IW);
  }

  /* ══════════════════════════════════════
     12. DRAWING — FURNITURE
     ══════════════════════════════════════ */
  var bookColors = [C.bookRed,C.bookBlue,C.bookGreen,C.bookGold,C.bookBrown,C.bookMaroon,C.bookPurple,C.bookTeal,C.bookRed2,C.bookBlue2,C.bookGreen2];

  function seededRand(seed) { return function(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}; }

  function drawBookshelf(x,y,w,h,seed) {
    var rng=seededRand(seed||42);
    ctx.fillStyle=C.woodDark; ctx.fillRect(x,y,w,h);
    ctx.fillStyle=C.woodMid; ctx.fillRect(x+1,y+1,w-2,h-2);
    var sc=Math.max(2,Math.floor(h/12)), sh=h/sc;
    for(var s=0;s<sc;s++){var sy=y+s*sh; var bx=x+2;
      while(bx<x+w-3){var bw=2+Math.floor(rng()*3),bh=sh*(0.6+rng()*0.35),bc=bookColors[Math.floor(rng()*bookColors.length)];
        ctx.fillStyle=bc; ctx.fillRect(bx,sy+(sh-bh),bw,bh-1);
        ctx.fillStyle='rgba(255,255,255,.1)'; ctx.fillRect(bx,sy+(sh-bh),1,bh-1); bx+=bw+1;}
      ctx.fillStyle=C.woodLight; ctx.fillRect(x+1,sy+sh-1,w-2,1);}
    ctx.fillStyle='rgba(0,0,0,.12)'; ctx.fillRect(x,y+h,w,3);
  }

  function drawDesk(x,y,w,h) {
    ctx.fillStyle='rgba(0,0,0,.1)'; ctx.fillRect(x+2,y+2,w,h);
    ctx.fillStyle=C.woodLight; ctx.fillRect(x,y,w,h);
    ctx.fillStyle=C.woodMid; ctx.fillRect(x+1,y+1,w-2,h-2);
    ctx.strokeStyle=C.woodDark; ctx.lineWidth=0.5; ctx.strokeRect(x,y,w,h);
    ctx.fillStyle=C.paper; ctx.fillRect(x+4,y+3,w*0.3,h*0.4);
    ctx.fillStyle=C.ink; ctx.fillRect(x+w-10,y+4,4,4);
  }

  function drawChair(x,y) { ctx.fillStyle=C.woodMid; ctx.fillRect(x,y,10,12); ctx.fillStyle=C.woodDark; ctx.fillRect(x+1,y,8,3); }
  function drawPlantPot(x,y) { ctx.fillStyle='#8b5a2a'; ctx.fillRect(x,y+4,10,8); ctx.fillStyle='#3d6828'; ctx.fillRect(x-2,y,14,6); ctx.fillStyle='#2a4a18'; ctx.fillRect(x+1,y-3,8,5); }

  /* ══════════════════════════════════════
     13. DRAWING — CANDLES & LIGHTING
     ══════════════════════════════════════ */
  function drawCandle(x, y) {
    // Warm glow
    var glow = ctx.createRadialGradient(x,y,1,x,y,28);
    glow.addColorStop(0,'rgba(255,210,80,.14)'); glow.addColorStop(0.5,'rgba(240,180,40,.06)'); glow.addColorStop(1,'rgba(240,180,40,0)');
    ctx.fillStyle=glow; ctx.fillRect(x-30,y-30,60,60);
    // Candle body
    ctx.fillStyle='#f0e8d0'; ctx.fillRect(x-1,y,3,6);
    // Flame (flicker)
    var flicker = Math.sin(frameCount * 0.15 + x) * 0.5;
    ctx.fillStyle=C.flame; ctx.fillRect(x-1+flicker, y-3, 2, 3);
    ctx.fillStyle='#fff8e0'; ctx.fillRect(x+flicker, y-2, 1, 1);
  }

  function drawWallSconce(x, y) {
    // Glow
    var glow = ctx.createRadialGradient(x,y,2,x,y,45);
    glow.addColorStop(0,'rgba(255,200,60,.15)'); glow.addColorStop(0.4,'rgba(240,180,40,.07)'); glow.addColorStop(1,'rgba(240,180,40,0)');
    ctx.fillStyle=glow; ctx.fillRect(x-50,y-50,100,100);
    // Bracket
    ctx.fillStyle=C.sconce; ctx.fillRect(x-2,y-1,5,3);
    ctx.fillStyle=C.gold; ctx.fillRect(x-1,y-4,3,4);
    // Flame
    var flicker = Math.sin(frameCount * 0.12 + y) * 0.5;
    ctx.fillStyle=C.flame; ctx.fillRect(x-1+flicker, y-7, 2, 3);
    ctx.fillStyle='#fff8e0'; ctx.fillRect(x+flicker, y-6, 1, 1);
  }

  function drawChandelier(cx, cy) {
    // Large warm glow
    var glow = ctx.createRadialGradient(cx,cy,5,cx,cy,80);
    glow.addColorStop(0,'rgba(255,210,80,.18)'); glow.addColorStop(0.3,'rgba(240,180,40,.10)'); glow.addColorStop(1,'rgba(240,180,40,0)');
    ctx.fillStyle=glow; ctx.fillRect(cx-80,cy-80,160,160);
    // Ring
    ctx.strokeStyle=C.gold; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(cx,cy,12,0,Math.PI*2); ctx.stroke();
    // Candles (8 points)
    for (var i=0;i<8;i++) {
      var angle = (i/8)*Math.PI*2;
      var fx = cx + Math.cos(angle)*12, fy = cy + Math.sin(angle)*12;
      var flicker = Math.sin(frameCount*0.1+i*1.3)*0.5;
      ctx.fillStyle=C.flame; ctx.fillRect(fx-1+flicker,fy-2,2,2);
      ctx.fillStyle='#fff8e0'; ctx.fillRect(fx+flicker,fy-1,1,1);
    }
    // Center
    ctx.fillStyle=C.gold; ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2); ctx.fill();
  }

  function drawLamp(x,y,large) {
    var s=large?8:5, radius=large?50:30;
    var glow=ctx.createRadialGradient(x+s/2,y+s/2,2,x+s/2,y+s/2,radius);
    glow.addColorStop(0,'rgba(240,200,60,.12)'); glow.addColorStop(1,'rgba(240,200,60,0)');
    ctx.fillStyle=glow; ctx.fillRect(x-radius,y-radius,radius*2+s,radius*2+s);
    ctx.fillStyle=C.woodDark; ctx.fillRect(x+1,y+1,s-2,s-2);
    var flicker=Math.sin(frameCount*0.13+x)*0.5;
    ctx.fillStyle=C.flame; ctx.fillRect(x+s/2-1+flicker,y+s/2-1,2,2);
  }

  function drawAllLighting() {
    // Wall sconces along outer walls
    var spacing = 80;
    // Top wall
    for (var sx=IX+40; sx<IX+IW_TOTAL-20; sx+=spacing) drawWallSconce(sx, IY+OW+4);
    // Bottom wall
    for (var sx2=IX+40; sx2<IX+IW_TOTAL-20; sx2+=spacing) drawWallSconce(sx2, CH-OW-6);
    // Left wall
    for (var sy=IY+50; sy<IY+IH_TOTAL-20; sy+=spacing) drawWallSconce(IX+OW+4, sy);
    // Right wall
    for (var sy2=IY+50; sy2<IY+IH_TOTAL-20; sy2+=spacing) drawWallSconce(CW-OW-6, sy2);

    // Candles on desks / floor candles in rooms
    var ids = Object.keys(ROOMS);
    for (var i=0;i<ids.length;i++) {
      var r = ROOMS[ids[i]];
      // Floor candles near internal corners
      drawCandle(r.x + 20, r.y + 20);
      drawCandle(r.x + r.w - 20, r.y + 20);
      if (ids[i] !== 'corridor') {
        drawCandle(r.x + 20, r.y + r.h - 20);
        drawCandle(r.x + r.w - 20, r.y + r.h - 20);
      }
    }

    // Grand chandelier in hub
    var hub = ROOMS.hub;
    drawChandelier(hub.x + hub.w/2, hub.y + hub.h/2);
  }

  /* ══════════════════════════════════════
     14. DRAWING — ROOM FURNITURE
     ══════════════════════════════════════ */
  function drawAllFurniture() {
    var ids = Object.keys(ROOMS);
    for (var i=0;i<ids.length;i++) {
      var id=ids[i], r=ROOMS[id];
      var ix=r.x+8, iy=r.y+6, iw=r.w-16, ih=r.h-12;
      var seed = id.charCodeAt(0)*100+(id.charCodeAt(1)||0);

      // Bookshelves along top wall (most rooms)
      if (id !== 'corridor' && id !== 'hub') {
        var sc = Math.floor(iw/50);
        for(var s=0;s<sc;s++) drawBookshelf(ix+s*50+4, iy, 44, 28, seed+s*37);
      }

      switch(id) {
        case 'entrance':
          drawBookshelf(ix,iy+32,14,ih-38,seed+100);
          drawDesk(ix+iw*0.35,iy+ih*0.45,55,28); drawChair(ix+iw*0.35+20,iy+ih*0.45+30);
          drawLamp(ix+iw*0.35+2,iy+ih*0.45-10,true); drawPlantPot(ix+iw-16,iy+ih-18); break;
        case 'principles':
          drawBookshelf(ix+iw-18,iy+32,14,ih-38,seed+200);
          drawDesk(ix+iw*0.4,iy+ih*0.5,48,24); drawChair(ix+iw*0.4+16,iy+ih*0.5+26);
          drawLamp(ix+iw*0.4+52,iy+ih*0.5,false); drawPlantPot(ix+4,iy+ih-14); break;
        case 'moat':
          drawDesk(ix+iw*0.15,iy+ih*0.5,52,24); drawDesk(ix+iw*0.55,iy+ih*0.5,52,24);
          drawChair(ix+iw*0.15+18,iy+ih*0.5+26); drawChair(ix+iw*0.55+18,iy+ih*0.5+26);
          drawLamp(ix+iw*0.45,iy+ih*0.35,true); break;
        case 'companies':
          drawBookshelf(ix,iy+32,14,ih-38,seed+300); drawBookshelf(ix+iw-18,iy+32,14,ih-38,seed+310);
          drawDesk(ix+iw*0.35,iy+ih*0.55,52,24); drawChair(ix+iw*0.35+18,iy+ih*0.55+26);
          drawLamp(ix+iw*0.35+56,iy+ih*0.55+4,false); break;
        case 'hub':
          var hcx=ix+iw/2, hcy=iy+ih/2;
          ctx.beginPath(); ctx.arc(hcx,hcy,18,0,Math.PI*2); ctx.fillStyle='#8a7a68'; ctx.fill();
          ctx.beginPath(); ctx.arc(hcx,hcy,14,0,Math.PI*2); ctx.fillStyle='#6090b0'; ctx.fill();
          ctx.beginPath(); ctx.arc(hcx,hcy,8,0,Math.PI*2); ctx.fillStyle='#7aa0c0'; ctx.fill();
          drawPlantPot(ix+6,iy+6); drawPlantPot(ix+iw-18,iy+6); drawPlantPot(ix+6,iy+ih-18); drawPlantPot(ix+iw-18,iy+ih-18);
          ctx.fillStyle=C.woodMid; ctx.fillRect(hcx-28,hcy+24,56,8); ctx.fillRect(hcx-28,hcy-32,56,8); break;
        case 'fcf':
          drawBookshelf(ix+iw-18,iy+32,14,ih-38,seed+400);
          drawDesk(ix+iw*0.25,iy+ih*0.5,48,24); drawChair(ix+iw*0.25+16,iy+ih*0.5+26);
          drawLamp(ix+iw*0.25-10,iy+ih*0.4,true); drawPlantPot(ix+iw-16,iy+ih-14); break;
        case 'research':
          drawDesk(ix+iw*0.35,iy+ih*0.5,42,20); drawLamp(ix+iw*0.35+46,iy+ih*0.5,false); break;
        case 'news':
          drawDesk(ix+iw*0.3,iy+ih*0.5,42,20); drawLamp(ix+iw*0.7,iy+ih*0.3,false); break;
        case 'horizons':
          drawDesk(ix+iw*0.3,iy+ih*0.5,42,20); drawPlantPot(ix+iw-14,iy+ih-14); drawLamp(ix+6,iy+ih*0.4,false); break;
        case 'finhistory':
          drawBookshelf(ix+iw-16,iy+4,12,ih-10,seed+500);
          drawDesk(ix+iw*0.2,iy+ih*0.5,42,20); drawLamp(ix+iw*0.2+46,iy+ih*0.5,false); break;
        case 'corridor':
          for(var p=0;p<8;p++){var px=ix+30+p*(iw/8);
            ctx.fillStyle='#b8900a'; ctx.fillRect(px,iy+2,24,20);
            ctx.fillStyle='#2a1a0a'; ctx.fillRect(px+2,iy+4,20,16);
            ctx.fillStyle='#5a4a3a'; ctx.fillRect(px+4,iy+6,16,12);
            ctx.fillStyle='#3a2a1a'; ctx.beginPath(); ctx.arc(px+12,iy+10,4,0,Math.PI*2); ctx.fill(); ctx.fillRect(px+8,iy+13,8,5);}
          ctx.fillStyle=C.woodMid; ctx.fillRect(ix+iw*0.2,iy+ih*0.6,50,8); ctx.fillRect(ix+iw*0.6,iy+ih*0.6,50,8); break;
      }
    }
  }

  /* ══════════════════════════════════════
     15. DRAWING — ROOM LABELS
     ══════════════════════════════════════ */
  function drawRoomLabels() {
    var ids = Object.keys(ROOMS);
    for (var i=0;i<ids.length;i++) {
      var id=ids[i], r=ROOMS[id], hov=(hoveredRoom===id);
      var cx=r.x+r.w/2, cy=r.y+r.h-16;
      var lw = Math.min(r.w-30, 180);
      ctx.fillStyle = hov ? 'rgba(26,18,8,.88)' : 'rgba(26,18,8,.6)';
      ctx.fillRect(cx-lw/2, cy-8, lw, 22);
      ctx.strokeStyle = hov ? 'rgba(184,144,10,.5)' : 'rgba(184,144,10,.2)';
      ctx.lineWidth = 0.5; ctx.strokeRect(cx-lw/2, cy-8, lw, 22);
      ctx.font='500 6px "DM Mono",monospace'; ctx.textAlign='center';
      ctx.fillStyle = hov ? C.gold : 'rgba(184,144,10,.5)'; ctx.fillText(r.labelEn, cx, cy);
      ctx.font='700 9px "Noto Serif JP",serif';
      ctx.fillStyle = hov ? C.parch : 'rgba(245,237,224,.75)'; ctx.fillText(r.label, cx, cy+10);
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
  var CHAR_W=64, CHAR_H=64, NPC_SPEED=0.003;

  function updateNPCs() {
    for(var i=0;i<NPCS.length;i++){
      var npc=NPCS[i];
      if(npc.state==='idle'){npc.wait--;
        if(npc.wait<=0){npc.tx=0.2+Math.random()*0.6; npc.ty=0.3+Math.random()*0.5; npc.state='walk';}
      } else {
        var dx=npc.tx-npc.rx, dy=npc.ty-npc.ry, dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<NPC_SPEED*2){npc.rx=npc.tx; npc.ry=npc.ty; npc.state='idle'; npc.wait=60+Math.floor(Math.random()*120); npc.walkFrame=0;}
        else{npc.rx+=dx/dist*NPC_SPEED; npc.ry+=dy/dist*NPC_SPEED; npc.walkFrame++;
          npc.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?2:1):(dy>0?0:3);}
        dirty=true;
      }
    }
  }

  function drawNPCs() {
    for(var i=0;i<NPCS.length;i++){
      var npc=NPCS[i], r=ROOMS[npc.room]; if(!r)continue;
      var x=r.x+r.w*npc.rx, y=r.y+r.h*npc.ry, dw=28, dh=28;
      ctx.fillStyle='rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(x,y+dh/2+1,dw/2.5,3,0,0,Math.PI*2); ctx.fill();
      var sheet=null, col=0, row=npc.dir||0;
      if(npc.state==='walk'&&assets.charWalk&&assets.charWalk.complete&&assets.charWalk.naturalWidth>0){sheet=assets.charWalk; col=Math.floor(npc.walkFrame/4)%9;}
      else if(assets.charIdle&&assets.charIdle.complete&&assets.charIdle.naturalWidth>0){sheet=assets.charIdle; col=0;}
      if(sheet){try{ctx.drawImage(sheet,col*CHAR_W,row*CHAR_H,CHAR_W,CHAR_H,x-dw/2,y-dh/2,dw,dh);}catch(e){}}
      ctx.font='600 7px "Noto Serif JP",serif'; ctx.textAlign='center';
      ctx.fillStyle='rgba(0,0,0,.4)'; ctx.fillText(npc.name,x+1,y-dh/2+1);
      ctx.fillStyle=C.gold; ctx.fillText(npc.name,x,y-dh/2);
    }
  }

  /* ══════════════════════════════════════
     18. ATMOSPHERE
     ══════════════════════════════════════ */
  function drawAtmosphere() {
    var vg=ctx.createRadialGradient(CW/2,CH/2,CH*0.25,CW/2,CH/2,CH*0.85);
    vg.addColorStop(0,'rgba(10,8,4,0)'); vg.addColorStop(1,'rgba(10,8,4,.3)');
    ctx.fillStyle=vg; ctx.fillRect(0,0,CW,CH);
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
    ctx.fillStyle='rgba(184,144,10,.4)'; ctx.fillText('THE LIBRARY · 書庫の全景', OW+8, CH-OW-4);
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
        info.innerHTML='<div class="map-room-info-inner"><span class="map-room-name">'+r.label+'</span><span class="map-room-name-en">'+r.labelEn+'</span><div class="map-room-desc">'+(ROOM_DESC[hit]||'')+'</div>'+(r.url?'<a class="map-room-btn" href="'+r.url+'">この部屋へ →</a>':'<span class="map-room-btn disabled">中央広間</span>')+'</div>';
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
    // Candle flicker needs continuous redraw
    if(frameCount%3===0)dirty=true;
    if(dirty){render();dirty=false;}
    requestAnimationFrame(tick);
  }

  /* ══════════════════════════════════════
     22. INIT
     ══════════════════════════════════════ */
  function init(){
    canvas=document.getElementById('libraryMapCanvas'); if(!canvas)return;
    canvas.width=CW; canvas.height=CH; ctx=canvas.getContext('2d');
    ctx.imageSmoothingEnabled=false;
    canvas.addEventListener('mousemove',onMouseMove);
    canvas.addEventListener('click',onClick);
    canvas.addEventListener('mouseleave',function(){hoveredRoom=null;canvas.style.cursor='default';dirty=true;var info=document.getElementById('mapRoomInfo');if(info)info.style.opacity='0';});
    canvas.addEventListener('touchstart',function(e){e.preventDefault();var t=e.touches[0];onMouseMove({clientX:t.clientX,clientY:t.clientY});onClick({clientX:t.clientX,clientY:t.clientY});},{passive:false});
    loadAssets(function(){initFloorPatterns();dirty=true;tick();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
