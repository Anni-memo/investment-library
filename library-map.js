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

  /* ── avatar sprites 16x16 (6 types) ── */
  /* 0=transparent,1=skin(#e8c8a0),2=main color,3=gold accent(#d4aa22),4=hair(#2d2010),5=white(#f5ede0) */

  var AVATAR_SPRITES = {
    /* 賢者: 長いローブ、フード */
    sage: [
      [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
      [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
      [0,0,0,0,2,2,4,4,4,4,2,2,0,0,0,0],
      [0,0,0,0,2,1,1,1,1,1,1,2,0,0,0,0],
      [0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
      [0,0,0,3,2,2,2,2,2,2,2,2,3,0,0,0],
      [0,0,3,2,2,2,2,2,2,2,2,2,2,3,0,0],
      [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
      [0,0,2,2,2,2,2,1,1,2,2,2,2,2,0,0],
      [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
      [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
      [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0],
      [0,0,0,2,2,2,2,0,0,2,2,2,2,0,0,0],
      [0,0,0,0,2,2,2,0,0,2,2,2,0,0,0,0]
    ],
    /* 研究者: コート、メガネ(1px) */
    scholar: [
      [0,0,0,0,0,0,4,4,4,4,0,0,0,0,0,0],
      [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
      [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,0,1,5,5,1,1,5,5,1,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
      [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
      [0,0,0,2,2,5,2,2,2,2,5,2,2,0,0,0],
      [0,0,0,2,2,5,2,1,1,2,5,2,2,0,0,0],
      [0,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0],
      [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
      [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
      [0,0,0,0,0,2,4,0,0,4,2,0,0,0,0,0],
      [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0]
    ],
    /* 旅人: マント、帽子（既存ベース） */
    traveler: [
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
      [0,0,0,0,0,2,4,0,0,4,2,0,0,0,0,0],
      [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0]
    ],
    /* 書記官: 直立、巻物を持つ */
    scribe: [
      [0,0,0,0,0,0,4,4,4,4,0,0,0,0,0,0],
      [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
      [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,0,1,0,1,1,1,1,0,1,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
      [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
      [0,0,0,0,2,2,2,1,1,2,2,2,5,3,0,0],
      [0,0,0,0,2,2,2,1,1,2,2,2,5,3,0,0],
      [0,0,0,0,2,2,2,2,2,2,2,2,5,0,0,0],
      [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
      [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
      [0,0,0,0,0,2,4,0,0,4,2,0,0,0,0,0],
      [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0]
    ],
    /* 朝の実践者: 軽装、走るポーズ風 */
    morning: [
      [0,0,0,0,0,0,4,4,4,4,0,0,0,0,0,0],
      [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
      [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,0,1,0,1,1,1,1,0,1,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
      [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
      [0,0,1,0,2,2,2,2,2,2,2,2,0,1,0,0],
      [0,0,0,0,2,2,2,1,1,2,2,2,0,0,0,0],
      [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
      [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
      [0,0,0,0,0,4,0,2,2,0,4,0,0,0,0,0],
      [0,0,0,0,4,0,0,0,0,0,0,4,0,0,0,0],
      [0,0,0,4,4,0,0,0,0,0,0,4,4,0,0,0]
    ],
    /* 商人: 帽子、ベスト */
    merchant: [
      [0,0,0,0,0,3,3,3,3,3,3,0,0,0,0,0],
      [0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0],
      [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,0,1,0,1,1,1,1,0,1,0,0,0,0],
      [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,2,2,3,2,2,3,2,2,0,0,0,0],
      [0,0,0,0,2,2,3,2,2,3,2,2,0,0,0,0],
      [0,0,0,1,2,2,3,1,1,3,2,2,1,0,0,0],
      [0,0,0,1,2,2,2,1,1,2,2,2,1,0,0,0],
      [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0],
      [0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0],
      [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0],
      [0,0,0,0,0,2,4,0,0,4,2,0,0,0,0,0],
      [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0]
    ]
  };

  /* main colour per avatar type */
  var AVATAR_MAIN_COLORS = {
    sage:     '#4a2a6a',
    scholar:  '#2a3d6a',
    traveler: '#6a4a2a',
    scribe:   '#4a4a4a',
    morning:  '#2a5a3a',
    merchant: '#6a2a2a'
  };

  /* build palette for a given avatar type */
  function avatarPalette(type) {
    return {
      1: '#e8c8a0',
      2: AVATAR_MAIN_COLORS[type] || '#6a4a2a',
      3: '#d4aa22',
      4: '#2d2010',
      5: '#f5ede0'
    };
  }

  /* ── companion sprites 8x8 (5 types) ── */
  /* 0=transparent, 1=main, 2=accent, 3=eye(black) */
  var COMPANION_SPRITES = {
    /* 本の精霊: 小さな開いた本 */
    book: [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [1,2,1,1,1,1,2,1],
      [1,2,1,3,1,1,2,1],
      [1,2,1,1,1,1,2,1],
      [1,2,1,1,3,1,2,1],
      [0,1,2,2,2,2,1,0],
      [0,0,1,1,1,1,0,0]
    ],
    /* 金貨の守り手: 丸い金貨型 */
    coin: [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [1,2,2,1,1,2,2,1],
      [1,2,1,2,2,1,2,1],
      [1,2,1,2,2,1,2,1],
      [1,2,2,1,1,2,2,1],
      [0,1,2,2,2,2,1,0],
      [0,0,1,1,1,1,0,0]
    ],
    /* 蝋燭の火: 揺れる炎型 */
    candle: [
      [0,0,0,2,2,0,0,0],
      [0,0,2,1,1,2,0,0],
      [0,2,1,1,1,1,2,0],
      [0,2,1,1,1,1,2,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,0,3,3,0,0,0],
      [0,0,3,3,3,3,0,0]
    ],
    /* 羽ペン鳥: 小鳥型 */
    quill: [
      [0,0,0,1,1,0,0,0],
      [0,0,1,1,1,1,0,0],
      [0,1,1,3,1,1,2,0],
      [0,1,1,1,1,1,2,2],
      [0,0,1,1,1,1,0,0],
      [0,0,1,1,1,1,0,0],
      [0,0,0,1,1,0,0,0],
      [0,0,1,0,0,1,0,0]
    ],
    /* 時計の番人: 歯車型 */
    clock: [
      [0,0,1,1,1,1,0,0],
      [0,1,0,2,2,0,1,0],
      [1,0,2,2,2,2,0,1],
      [1,2,2,3,3,2,2,1],
      [1,2,2,3,2,2,2,1],
      [1,0,2,2,2,2,0,1],
      [0,1,0,2,2,0,1,0],
      [0,0,1,1,1,1,0,0]
    ]
  };

  var COMPANION_PALETTES = {
    book:   { 1: '#d4aa22', 2: '#f5ede0', 3: '#1a1208' },
    coin:   { 1: '#d4aa22', 2: '#f0d060', 3: '#8b6914' },
    candle: { 1: '#e08020', 2: '#f0c040', 3: '#4a3520' },
    quill:  { 1: '#f5ede0', 2: '#d4aa22', 3: '#1a1208' },
    clock:  { 1: '#a0a0a0', 2: '#d0d0d0', 3: '#1a1208' }
  };

  var COMPANION_LABELS = {
    book:   '本の精霊',
    coin:   '金貨の守り手',
    candle: '蝋燭の火',
    quill:  '羽ペン鳥',
    clock:  '時計の番人'
  };

  var AVATAR_LABELS = {
    sage:     '静観の賢者',
    scholar:  '探究の研究者',
    traveler: '放浪の旅人',
    scribe:   '記録の書記官',
    morning:  '朝の実践者',
    merchant: '交易の商人'
  };

  /* ── read traveler config from localStorage ── */
  var _travelerData = (function () {
    try {
      return JSON.parse(localStorage.getItem('library_traveler') || '{}');
    } catch (e) { return {}; }
  })();
  var _avatarType = (_travelerData.avatar && _travelerData.avatar.type) ? _travelerData.avatar.type : 'traveler';
  var _companionType = _travelerData.companion || 'book';
  var _nickname = _travelerData.nickname || '';

  /* backwards compat: keep AVATAR_SPRITE pointing to current type */
  var AVATAR_SPRITE = AVATAR_SPRITES[_avatarType] || AVATAR_SPRITES.traveler;
  var AVATAR_PAL = avatarPalette(_avatarType);

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

    // draw other travelers (presence ghosts)
    drawOtherTravelers();

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
    var sprite = AVATAR_SPRITES[_avatarType] || AVATAR_SPRITES.traveler;
    var pal = avatarPalette(_avatarType);
    drawSprite(sprite, pal, ax, ay, 1);
    // draw companion at bottom-right offset
    drawCompanion(ax + 12, ay + 10);
  }

  function drawCompanion(px, py) {
    var sprite = COMPANION_SPRITES[_companionType];
    var pal = COMPANION_PALETTES[_companionType];
    if (!sprite || !pal) return;
    drawSprite(sprite, pal, px, py, 1);
  }

  /* ── other travelers (Presence) ── */
  var _otherTravelersCache = null;
  var _otherTravelersLastUpdate = 0;
  var OTHER_TRAVELER_INTERVAL = 30000; // 30s refresh

  function getOtherTravelers() {
    var now = Date.now();
    if (_otherTravelersCache && (now - _otherTravelersLastUpdate) < OTHER_TRAVELER_INTERVAL) {
      return _otherTravelersCache;
    }
    _otherTravelersLastUpdate = now;

    // try real presence data
    var presenceData = window.__shelfPresence;
    var roomIds = Object.keys(ROOMS);
    var result = {};
    var rng = pseudoRandom(Math.floor(now / OTHER_TRAVELER_INTERVAL));

    if (presenceData && typeof presenceData === 'object') {
      for (var i = 0; i < roomIds.length; i++) {
        var rid = roomIds[i];
        var count = presenceData[rid] || 0;
        result[rid] = generateGhosts(rid, count, rng);
      }
    } else {
      // pseudo-generate based on time of day
      var hour = new Date().getHours();
      var baseCount;
      if (hour >= 6 && hour < 10) baseCount = 1;        // morning: few
      else if (hour >= 10 && hour < 18) baseCount = 3;   // daytime: more
      else if (hour >= 18 && hour < 23) baseCount = 2;   // evening: medium
      else baseCount = 1;                                 // night: few

      for (var i = 0; i < roomIds.length; i++) {
        var rid = roomIds[i];
        var variance = Math.floor(rng() * 2);
        var count = Math.max(0, Math.min(3, baseCount + variance - 1));
        if (rid === 'hub') count = Math.min(3, count + 1); // hub is busier
        result[rid] = generateGhosts(rid, count, rng);
      }
    }

    _otherTravelersCache = result;
    return result;
  }

  function pseudoRandom(seed) {
    var s = seed || 1;
    return function () {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function generateGhosts(roomId, count, rng) {
    var r = ROOMS[roomId];
    if (!r) return [];
    var ghosts = [];
    var types = ['sage','scholar','traveler','scribe','morning','merchant'];
    for (var i = 0; i < count; i++) {
      ghosts.push({
        x: r.x * TILE + 8 + Math.floor(rng() * (r.w * TILE - 16)),
        y: r.y * TILE + 8 + Math.floor(rng() * (r.h * TILE - 16)),
        type: types[Math.floor(rng() * types.length)]
      });
    }
    return ghosts;
  }

  function drawOtherTravelers() {
    var others = getOtherTravelers();
    var roomIds = Object.keys(others);
    ctx.globalAlpha = 0.3;
    for (var i = 0; i < roomIds.length; i++) {
      var ghosts = others[roomIds[i]];
      for (var g = 0; g < ghosts.length; g++) {
        var ghost = ghosts[g];
        var sprite = AVATAR_SPRITES[ghost.type] || AVATAR_SPRITES.traveler;
        var pal = avatarPalette(ghost.type);
        // draw at half size (8x8 effective) by sampling every other pixel
        drawMiniSprite(sprite, pal, ghost.x - 4, ghost.y - 4);
      }
    }
    ctx.globalAlpha = 1.0;

    // draw person count badges per room
    drawRoomBadges(others);
  }

  /* draw a 16x16 sprite scaled down to 8x8 (sample every 2nd pixel) */
  function drawMiniSprite(sprite, pal, px, py) {
    for (var row = 0; row < 16; row += 2) {
      for (var col = 0; col < 16; col += 2) {
        var v = sprite[row][col];
        if (v === 0) continue;
        ctx.fillStyle = pal[v] || '#ff00ff';
        ctx.fillRect(px + col / 2, py + row / 2, 1, 1);
      }
    }
  }

  function drawRoomBadges(others) {
    ctx.globalAlpha = 0.7;
    var roomIds = Object.keys(others);
    for (var i = 0; i < roomIds.length; i++) {
      var rid = roomIds[i];
      var count = others[rid].length;
      if (count <= 0) continue;
      var r = ROOMS[rid];
      if (!r) continue;
      var bx = (r.x + r.w) * TILE - 16;
      var by = (r.y + r.h) * TILE - 10;
      ctx.fillStyle = 'rgba(26,18,8,0.6)';
      ctx.fillRect(bx - 1, by - 1, 16, 9);
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(212,170,34,0.8)';
      ctx.fillText(count + '人', bx + 7, by + 3);
    }
    ctx.globalAlpha = 1.0;
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

  /* ── traveler info panel ── */
  function initTravelerInfo() {
    var el = document.getElementById('mapTravelerInfo');
    if (!el) return;
    var avatarLabel = AVATAR_LABELS[_avatarType] || '放浪の旅人';
    var companionLabel = COMPANION_LABELS[_companionType] || '本の精霊';
    var nameStr = _nickname ? ' ' + _nickname : '';
    var avatarEmoji = {
      sage: '\uD83E\uDDD9', scholar: '\uD83D\uDD2C', traveler: '\uD83E\uDDD3',
      scribe: '\uD83D\uDCDC', morning: '\uD83C\uDF05', merchant: '\uD83D\uDCB0'
    };
    var emoji = avatarEmoji[_avatarType] || '\uD83E\uDDD3';
    el.innerHTML = '<span class="traveler-info-text">' +
      emoji + ' ' + avatarLabel + nameStr +
      '  <span class="traveler-companion-tag">相棒: ' + companionLabel + '</span>' +
      '</span>';
    el.style.display = 'block';
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

    // populate traveler info panel
    initTravelerInfo();

    // refresh other travelers periodically
    setInterval(function () {
      _otherTravelersCache = null; // force refresh
      dirty = true;
    }, OTHER_TRAVELER_INTERVAL);

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
