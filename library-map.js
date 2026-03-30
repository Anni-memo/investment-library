/* ═══════════════════════════════════════════════════════
   library-map.js – 書庫地図 (Canvas 2D Tile Map)
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── palette ── */
  var INK   = '#1a1208';
  var PARCH = '#f5ede0';
  var GOLD  = '#d4aa22';
  var GOLD2 = '#8b6914';
  var GREEN = '#5a9a78';
  var BLUE  = '#2a3d6a';
  var WALL  = '#0e0a04';
  var FLOOR = '#2d2010';
  var DOOR  = '#6b5020';

  /* room accent colours (floor tint) */
  var ROOM_COLORS = {
    entrance:   '#3a2a14',
    principles: '#2e2818',
    moat:       '#28301a',
    companies:  '#2a2014',
    hub:        '#33280e',
    fcf:        '#1e2838',
    research:   '#302418',
    news:       '#1e2a28',
    horizons:   '#2a2030',
    corridor:   '#241e14'
  };

  /* room highlight colours */
  var ROOM_HIGHLIGHT = {
    entrance:   '#4a3a24',
    principles: '#3e3828',
    moat:       '#384028',
    companies:  '#3a3024',
    hub:        '#43381e',
    fcf:        '#2e3848',
    research:   '#403428',
    news:       '#2e3a38',
    horizons:   '#3a3040',
    corridor:   '#342e24'
  };

  /* ── grid constants ── */
  var COLS = 30, ROWS = 22, TILE = 16;
  var CW = COLS * TILE, CH = ROWS * TILE; // 480x352

  /* ── room definitions (grid coords: x,y,w,h in tiles) ── */
  var ROOMS = {
    entrance:   { x: 1,  y: 1,  w: 9,  h: 6, label: '入口ホール',       labelEn: 'Entrance Hall',    url: 'hajimete/' },
    principles: { x: 11, y: 1,  w: 9,  h: 6, label: '投資原則の間',     labelEn: 'Principles',       url: 'principles/' },
    moat:       { x: 21, y: 1,  w: 8,  h: 6, label: 'Moatの間',         labelEn: 'Moat Room',        url: 'moat/' },
    companies:  { x: 1,  y: 8,  w: 9,  h: 6, label: '企業分析書架',     labelEn: 'Companies',        url: 'companies/' },
    hub:        { x: 11, y: 8,  w: 9,  h: 6, label: '中央広間',         labelEn: 'Central Hall',     url: null },
    fcf:        { x: 21, y: 8,  w: 8,  h: 6, label: 'FCFの間',          labelEn: 'FCF Room',         url: 'fcf/' },
    research:   { x: 1,  y: 15, w: 9,  h: 3, label: '論考の棚',         labelEn: 'Research',         url: 'research/' },
    news:       { x: 11, y: 15, w: 9,  h: 3, label: 'ニュース解説室',   labelEn: 'News Room',        url: 'news/' },
    horizons:   { x: 21, y: 15, w: 8,  h: 3, label: '古典と思想の棚',   labelEn: 'Horizons',         url: 'horizons/' },
    corridor:   { x: 1,  y: 19, w: 28, h: 2, label: '思考の案内人たちの回廊', labelEn: 'Corridor', url: 'corridors/' }
  };

  var ROOM_DESC = {
    entrance:   'はじめての方へ。投資図書館の歩き方。',
    principles: 'バフェット、マンガー、フィッシャーの投資原則。',
    moat:       '経済的な堀（モート）の分類と事例。',
    companies:  '企業分析ページの一覧と検索。',
    hub:        '書庫の中央広間。各部屋への分岐点。',
    fcf:        'フリーキャッシュフローの読み方と活用。',
    research:   '独自の論考・分析記事のアーカイブ。',
    news:       '最新ニュースの解説と考察。',
    horizons:   '禅・哲学・テクノロジー思想の書棚。',
    corridor:   '投資思想家たちの人物録。'
  };

  /* ── NPC definitions ── */
  var NPCS = [
    { room: 'entrance',  label: '案内人', offsetX: -2, offsetY: -1 },
    { room: 'hub',       label: '執事',   offsetX:  2, offsetY:  1 },
    { room: 'horizons',  label: '語り部', offsetX:  1, offsetY:  0 },
    { room: 'companies', label: '司書',   offsetX: -2, offsetY:  1 },
    { room: 'corridor',  label: '宿屋主人', offsetX: 10, offsetY: 0 }
  ];

  /* ── avatar sprite 16x16 ── */
  /* 0=transparent,1=skin,2=cloak,3=gold accent,4=hair,5=shadow */
  var AVATAR_SPRITE = [
    [0,0,0,0,0,0,4,4,4,4,0,0,0,0,0,0],
    [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
    [0,0,0,0,4,4,4,4,4,4,4,4,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,0,1,1,1,1,0,1,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,3,2,2,2,2,2,2,2,2,3,0,0,0],
    [0,0,3,2,2,2,2,2,2,2,2,2,2,3,0,0],
    [0,0,2,2,2,2,2,1,1,2,2,2,2,2,0,0],
    [0,0,2,2,2,2,2,1,1,2,2,2,2,2,0,0],
    [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
    [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
    [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
    [0,0,0,0,0,2,5,0,0,5,2,0,0,0,0,0],
    [0,0,0,0,0,5,5,0,0,5,5,0,0,0,0,0]
  ];

  var AVATAR_PAL = {
    1: '#e8c8a0', // skin
    2: '#5a3a1a', // cloak
    3: GOLD,      // gold accent
    4: '#3a2810', // hair
    5: '#2a1a0a'  // shadow / boots
  };

  /* NPC sprite 8x8 */
  var NPC_SPRITE = [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [0,1,0,1,1,0,1,0],
    [0,1,1,1,1,1,1,0],
    [0,0,2,2,2,2,0,0],
    [0,2,2,2,2,2,2,0],
    [0,0,2,0,0,2,0,0],
    [0,0,3,0,0,3,0,0]
  ];

  var NPC_PAL = {
    1: '#d4b896',
    2: '#4a6a3a',
    3: '#3a2a1a'
  };

  /* ── state ── */
  var canvas, ctx;
  var currentRoom = 'hub';
  var hoveredRoom = null;
  var selectedRoom = null;
  var avatarPos = { x: 0, y: 0 };
  var avatarTarget = null;
  var animStart = 0;
  var animDuration = 800;
  var animFrom = { x: 0, y: 0 };
  var dirty = true;
  var rafId = null;
  var navigating = false;

  /* ── helpers ── */
  function roomCenter(id) {
    var r = ROOMS[id];
    return {
      x: (r.x + r.w / 2) * TILE,
      y: (r.y + r.h / 2) * TILE
    };
  }

  function hitTest(mx, my) {
    var tx = mx / TILE;
    var ty = my / TILE;
    var ids = Object.keys(ROOMS);
    for (var i = 0; i < ids.length; i++) {
      var r = ROOMS[ids[i]];
      if (tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) {
        return ids[i];
      }
    }
    return null;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /* ── drawing ── */
  function drawMap() {
    ctx.fillStyle = WALL;
    ctx.fillRect(0, 0, CW, CH);

    var ids = Object.keys(ROOMS);
    // draw room floors
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var r = ROOMS[id];
      var col = (hoveredRoom === id || selectedRoom === id) ? ROOM_HIGHLIGHT[id] : ROOM_COLORS[id];
      ctx.fillStyle = col;
      ctx.fillRect(r.x * TILE, r.y * TILE, r.w * TILE, r.h * TILE);

      // floor pattern (subtle dots)
      ctx.fillStyle = 'rgba(245,237,224,0.03)';
      for (var gy = r.y; gy < r.y + r.h; gy++) {
        for (var gx = r.x; gx < r.x + r.w; gx++) {
          if ((gx + gy) % 2 === 0) {
            ctx.fillRect(gx * TILE + 4, gy * TILE + 4, 8, 8);
          }
        }
      }
    }

    // draw doors (gaps in walls between adjacent rooms)
    drawDoors();

    // draw walls (borders around rooms)
    ctx.strokeStyle = WALL;
    ctx.lineWidth = 2;
    for (var i = 0; i < ids.length; i++) {
      var r = ROOMS[ids[i]];
      ctx.strokeRect(r.x * TILE, r.y * TILE, r.w * TILE, r.h * TILE);
    }

    // selected room glow
    if (selectedRoom) {
      var sr = ROOMS[selectedRoom];
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.strokeRect(sr.x * TILE + 1, sr.y * TILE + 1, sr.w * TILE - 2, sr.h * TILE - 2);
    }

    // room labels
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var r = ROOMS[id];
      var cx = (r.x + r.w / 2) * TILE;
      var cy = (r.y + r.h / 2) * TILE;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Japanese label
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = 'rgba(245,237,224,0.7)';
      ctx.fillText(r.label, cx, cy - 6);

      // English sub-label
      ctx.font = '7px monospace';
      ctx.fillStyle = 'rgba(212,170,34,0.5)';
      ctx.fillText(r.labelEn, cx, cy + 6);
    }

    // draw NPCs
    drawNPCs();

    // draw avatar
    drawAvatar();
  }

  function drawDoors() {
    ctx.fillStyle = DOOR;
    // Vertical doors (between left-center and center-right columns)
    // Row 1: entrance<->principles at x=10, y~3-4
    drawDoor(10, 3, true);
    // principles<->moat at x=20, y~3-4
    drawDoor(20, 3, true);
    // Row 2: companies<->hub
    drawDoor(10, 10, true);
    // hub<->fcf
    drawDoor(20, 10, true);
    // Row 3: research<->news
    drawDoor(10, 16, true);
    // news<->horizons
    drawDoor(20, 16, true);

    // Horizontal doors (between rows)
    // entrance<->companies at y=7
    drawDoor(5, 7, false);
    // principles<->hub at y=7
    drawDoor(15, 7, false);
    // moat<->fcf at y=7
    drawDoor(25, 7, false);
    // companies<->research at y=14
    drawDoor(5, 14, false);
    // hub<->news at y=14
    drawDoor(15, 14, false);
    // fcf<->horizons at y=14
    drawDoor(25, 14, false);
    // research<->corridor at y=18
    drawDoor(5, 18, false);
    // news<->corridor at y=18
    drawDoor(15, 18, false);
    // horizons<->corridor at y=18
    drawDoor(25, 18, false);
  }

  function drawDoor(tileX, tileY, vertical) {
    var px = tileX * TILE;
    var py = tileY * TILE;
    if (vertical) {
      // vertical wall gap
      ctx.fillStyle = DOOR;
      ctx.fillRect(px - 2, py, 4, TILE * 2);
      // door frame accent
      ctx.fillStyle = GOLD2;
      ctx.fillRect(px - 1, py + 2, 2, 2);
      ctx.fillRect(px - 1, py + TILE * 2 - 4, 2, 2);
    } else {
      // horizontal wall gap
      ctx.fillStyle = DOOR;
      ctx.fillRect(px, py - 2, TILE * 2, 4);
      ctx.fillStyle = GOLD2;
      ctx.fillRect(px + 2, py - 1, 2, 2);
      ctx.fillRect(px + TILE * 2 - 4, py - 1, 2, 2);
    }
  }

  function drawSprite(sprite, pal, px, py, scale) {
    scale = scale || 1;
    for (var row = 0; row < sprite.length; row++) {
      for (var col = 0; col < sprite[row].length; col++) {
        var v = sprite[row][col];
        if (v === 0) continue;
        ctx.fillStyle = pal[v] || '#ff00ff';
        ctx.fillRect(px + col * scale, py + row * scale, scale, scale);
      }
    }
  }

  function drawAvatar() {
    var ax = avatarPos.x - 8;
    var ay = avatarPos.y - 8;
    drawSprite(AVATAR_SPRITE, AVATAR_PAL, ax, ay, 1);
  }

  function drawNPCs() {
    for (var i = 0; i < NPCS.length; i++) {
      var npc = NPCS[i];
      var c = roomCenter(npc.room);
      var nx = c.x + npc.offsetX * TILE - 4;
      var ny = c.y + npc.offsetY * TILE - 4;
      drawSprite(NPC_SPRITE, NPC_PAL, nx, ny, 1);

      // tiny label
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = '6px sans-serif';
      ctx.fillStyle = 'rgba(212,170,34,0.5)';
      ctx.fillText(npc.label, nx + 4, ny + 10);
    }
  }

  /* ── animation loop ── */
  function frame(ts) {
    if (avatarTarget) {
      var elapsed = ts - animStart;
      var t = Math.min(elapsed / animDuration, 1);
      var e = easeInOut(t);
      avatarPos.x = animFrom.x + (avatarTarget.x - animFrom.x) * e;
      avatarPos.y = animFrom.y + (avatarTarget.y - animFrom.y) * e;
      dirty = true;
      if (t >= 1) {
        avatarPos.x = avatarTarget.x;
        avatarPos.y = avatarTarget.y;
        avatarTarget = null;
        if (navigating) {
          var url = ROOMS[currentRoom].url;
          if (url) {
            window.location.href = url;
          }
          navigating = false;
        }
      }
    }

    if (dirty) {
      drawMap();
      dirty = false;
    }

    rafId = requestAnimationFrame(frame);
  }

  function moveAvatarTo(roomId, andNavigate) {
    var target = roomCenter(roomId);
    animFrom.x = avatarPos.x;
    animFrom.y = avatarPos.y;
    avatarTarget = target;
    animStart = performance.now();
    currentRoom = roomId;
    navigating = !!andNavigate;
    dirty = true;
  }

  /* ── room info panel ── */
  function showRoomInfo(roomId) {
    var infoEl = document.getElementById('mapRoomInfo');
    if (!infoEl) return;
    var r = ROOMS[roomId];
    var desc = ROOM_DESC[roomId] || '';
    var btnHtml = '';
    if (r.url) {
      btnHtml = '<a class="map-room-btn" href="' + r.url + '" data-room="' + roomId + '">この部屋に入る →</a>';
    } else {
      btnHtml = '<span class="map-room-btn disabled">ここは中央広間です</span>';
    }
    infoEl.innerHTML =
      '<div class="map-room-info-inner">' +
        '<div class="map-room-name">' + r.label + ' <span class="map-room-name-en">' + r.labelEn + '</span></div>' +
        '<div class="map-room-desc">' + desc + '</div>' +
        btnHtml +
      '</div>';
    infoEl.style.opacity = '1';

    // attach navigation handler
    var btn = infoEl.querySelector('.map-room-btn[data-room]');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        moveAvatarTo(roomId, true);
      });
    }
  }

  function hideRoomInfo() {
    var infoEl = document.getElementById('mapRoomInfo');
    if (infoEl) {
      infoEl.style.opacity = '0';
    }
  }

  /* ── canvas events ── */
  function canvasCoords(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = CW / rect.width;
    var scaleY = CH / rect.height;
    var clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function onCanvasClick(e) {
    e.preventDefault();
    var pos = canvasCoords(e);
    var room = hitTest(pos.x, pos.y);
    if (room) {
      selectedRoom = room;
      moveAvatarTo(room, false);
      showRoomInfo(room);
      dirty = true;
    }
  }

  function onCanvasMove(e) {
    var pos = canvasCoords(e);
    var room = hitTest(pos.x, pos.y);
    if (room !== hoveredRoom) {
      hoveredRoom = room;
      dirty = true;
    }
  }

  function onCanvasLeave() {
    if (hoveredRoom) {
      hoveredRoom = null;
      dirty = true;
    }
  }

  /* ── init ── */
  function init() {
    canvas = document.getElementById('libraryMapCanvas');
    if (!canvas) return;
    canvas.width = CW;
    canvas.height = CH;
    ctx = canvas.getContext('2d');

    // initial avatar position
    var startPos = roomCenter(currentRoom);
    avatarPos.x = startPos.x;
    avatarPos.y = startPos.y;

    // events
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('touchstart', onCanvasClick, { passive: false });
    canvas.addEventListener('mousemove', onCanvasMove);
    canvas.addEventListener('mouseleave', onCanvasLeave);

    // start render loop
    dirty = true;
    rafId = requestAnimationFrame(frame);
  }

  // run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
