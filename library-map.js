/* ═══════════════════════════════════════════════════════
   library-map.js – 書庫地図 (Obelisk.js Isometric 2.5D)
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ══════════════════════════════════════
     1. CONSTANTS & COLORS
     ══════════════════════════════════════ */
  var COLORS = {
    floor:        0xE8D8BE,
    floorDark:    0xDFC9A8,
    floorStone:   0xB8A898,
    wall:         0x2D2010,
    wallTop:      0x4A3520,
    wallLight:    0x5A4530,
    bookshelf:    0x6A4A2A,
    shelfDark:    0x4A3218,
    bookRed:      0x8B3A1A,
    bookRed2:     0xA04828,
    bookBlue:     0x2A3D6A,
    bookBlue2:    0x3A5080,
    bookGreen:    0x2A4A1A,
    bookGreen2:   0x3A6028,
    bookGold:     0xD4AA22,
    bookBrown:    0x5A3A1A,
    bookMaroon:   0x6A2030,
    desk:         0x8B6914,
    deskTop:      0xA88020,
    carpet:       0x4A2A6A,
    carpetLight:  0x5A3A7A,
    carpetGreen:  0x2A5A3A,
    carpetGreenL: 0x3A6A4A,
    carpetRed:    0x6A2020,
    carpetRedL:   0x7A3030,
    carpetGold:   0x8B7020,
    carpetGoldL:  0x9B8030,
    lamp:         0xF0CC55,
    lampGlow:     0xFFF0A0,
    plant:        0x3D6828,
    plantDark:    0x2A4A18,
    plantPot:     0x8B5A2A,
    water:        0x3A6090,
    waterLight:   0x5080B0,
    vault:        0xC8A030,
    vaultDark:    0xA08020,
    chair:        0x5A3A1A,
    chairSeat:    0x7A5A30,
    paper:        0xF0E8D0,
    candle:       0xE08020,
    candleFlame:  0xF0D040,
    portrait:     0x3A2A1A,
    portraitFrame:0xB8900A,
    stone:        0x808078,
    stoneDark:    0x606058,
    fountainBase: 0x9A8A78,
    fountainWater:0x6090B0,
    bench:        0x7A5A30,
    newsRack:     0x8A8A80,
    signBoard:    0xC0A870
  };

  /* ══════════════════════════════════════
     2. ROOM DEFINITIONS
     ══════════════════════════════════════ */
  // Grid layout: each unit = 1 obelisk tile
  // Total map: ~58 wide x ~44 deep
  var GRID = 10; // pixels per grid unit for obelisk primitives

  var ROOMS = {
    entrance:   { gx: 0,  gy: 0,  gw: 18, gh: 12, label: '入口ホール',            labelEn: 'ENTRANCE',    url: 'hajimete/' },
    principles: { gx: 19, gy: 0,  gw: 18, gh: 12, label: '投資原則の間',          labelEn: 'PRINCIPLES',  url: 'principles/' },
    moat:       { gx: 38, gy: 0,  gw: 18, gh: 12, label: 'Moatの間',              labelEn: 'MOAT',        url: 'moat/' },
    companies:  { gx: 0,  gy: 13, gw: 18, gh: 12, label: '企業分析書架',          labelEn: 'COMPANIES',   url: 'companies/' },
    hub:        { gx: 19, gy: 13, gw: 18, gh: 12, label: '中央広間',              labelEn: 'MAIN HALL',   url: null },
    fcf:        { gx: 38, gy: 13, gw: 18, gh: 12, label: 'FCFの間',               labelEn: 'FCF',         url: 'fcf/' },
    research:   { gx: 0,  gy: 26, gw: 18, gh: 8,  label: '論考の棚',              labelEn: 'RESEARCH',    url: 'research/' },
    news:       { gx: 19, gy: 26, gw: 18, gh: 8,  label: 'ニュース解説室',        labelEn: 'NEWS',        url: 'news/' },
    horizons:   { gx: 38, gy: 26, gw: 18, gh: 8,  label: '古典と思想の棚',        labelEn: 'HORIZONS',    url: 'horizons/' },
    corridor:   { gx: 0,  gy: 35, gw: 56, gh: 6,  label: '思考の案内人たちの回廊', labelEn: 'CORRIDOR',   url: 'corridors/' }
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
    { room: 'entrance',  label: '案内人',   offsetX: -3, offsetY: 2 },
    { room: 'hub',       label: '執事',     offsetX: 3,  offsetY: 3 },
    { room: 'horizons',  label: '語り部',   offsetX: 2,  offsetY: 1 },
    { room: 'companies', label: '司書',     offsetX: -3, offsetY: 2 },
    { room: 'corridor',  label: '宿屋主人', offsetX: 20, offsetY: 0 }
  ];

  /* ── avatar sprites (kept from original) ── */
  var AVATAR_SPRITES = {
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

  var AVATAR_MAIN_COLORS = {
    sage: '#4a2a6a', scholar: '#2a3d6a', traveler: '#6a4a2a',
    scribe: '#4a4a4a', morning: '#2a5a3a', merchant: '#6a2a2a'
  };

  function avatarPalette(type) {
    return {
      1: '#e8c8a0',
      2: AVATAR_MAIN_COLORS[type] || '#6a4a2a',
      3: '#d4aa22',
      4: '#2d2010',
      5: '#f5ede0'
    };
  }

  var COMPANION_SPRITES = {
    book: [
      [0,0,1,1,1,1,0,0],[0,1,2,2,2,2,1,0],[1,2,1,1,1,1,2,1],[1,2,1,3,1,1,2,1],
      [1,2,1,1,1,1,2,1],[1,2,1,1,3,1,2,1],[0,1,2,2,2,2,1,0],[0,0,1,1,1,1,0,0]
    ],
    coin: [
      [0,0,1,1,1,1,0,0],[0,1,2,2,2,2,1,0],[1,2,2,1,1,2,2,1],[1,2,1,2,2,1,2,1],
      [1,2,1,2,2,1,2,1],[1,2,2,1,1,2,2,1],[0,1,2,2,2,2,1,0],[0,0,1,1,1,1,0,0]
    ],
    candle: [
      [0,0,0,2,2,0,0,0],[0,0,2,1,1,2,0,0],[0,2,1,1,1,1,2,0],[0,2,1,1,1,1,2,0],
      [0,0,1,1,1,1,0,0],[0,0,0,1,1,0,0,0],[0,0,0,3,3,0,0,0],[0,0,3,3,3,3,0,0]
    ],
    quill: [
      [0,0,0,1,1,0,0,0],[0,0,1,1,1,1,0,0],[0,1,1,3,1,1,2,0],[0,1,1,1,1,1,2,2],
      [0,0,1,1,1,1,0,0],[0,0,1,1,1,1,0,0],[0,0,0,1,1,0,0,0],[0,0,1,0,0,1,0,0]
    ],
    clock: [
      [0,0,1,1,1,1,0,0],[0,1,0,2,2,0,1,0],[1,0,2,2,2,2,0,1],[1,2,2,3,3,2,2,1],
      [1,2,2,3,2,2,2,1],[1,0,2,2,2,2,0,1],[0,1,0,2,2,0,1,0],[0,0,1,1,1,1,0,0]
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
    book: '本の精霊', coin: '金貨の守り手', candle: '蝋燭の火',
    quill: '羽ペン鳥', clock: '時計の番人'
  };

  var AVATAR_LABELS = {
    sage: '静観の賢者', scholar: '探究の研究者', traveler: '放浪の旅人',
    scribe: '記録の書記官', morning: '朝の実践者', merchant: '交易の商人'
  };

  var NPC_SPRITE = [
    [0,0,1,1,1,1,0,0],[0,1,1,1,1,1,1,0],[0,1,0,1,1,0,1,0],[0,1,1,1,1,1,1,0],
    [0,0,2,2,2,2,0,0],[0,2,2,2,2,2,2,0],[0,0,2,0,0,2,0,0],[0,0,3,0,0,3,0,0]
  ];
  var NPC_PAL = { 1: '#d4b896', 2: '#4a6a3a', 3: '#3a2a1a' };

  /* ══════════════════════════════════════
     3. TRAVELER CONFIG (localStorage)
     ══════════════════════════════════════ */
  var _travelerData = (function () {
    try { return JSON.parse(localStorage.getItem('library_traveler') || '{}'); }
    catch (e) { return {}; }
  })();
  var _avatarType = (_travelerData.avatar && _travelerData.avatar.type) ? _travelerData.avatar.type : 'traveler';
  var _companionType = _travelerData.companion || 'book';
  var _nickname = _travelerData.nickname || '';

  /* ══════════════════════════════════════
     4. STATE
     ══════════════════════════════════════ */
  var canvas, ctx, pixelView, originPoint;
  var CW = 1400, CH = 620;
  var currentRoom = 'hub';
  var hoveredRoom = null;
  var selectedRoom = null;
  var dirty = true;
  var rafId = null;

  // Avatar animation state (in iso grid coords)
  var avatarIsoPos = { x: 0, y: 0 };
  var avatarTarget = null;
  var animStart = 0;
  var animDuration = 800;
  var animFrom = { x: 0, y: 0 };
  var navigating = false;

  /* ══════════════════════════════════════
     5. COORDINATE HELPERS
     ══════════════════════════════════════ */
  // Convert iso grid (gx, gy) to screen pixel
  // Obelisk maps Point3D(x,y,z) to screen: sx = origin.x + (x-y), sy = origin.y + (x+y)/2 - z
  // Our grid: Point3D = (gx*GRID, gy*GRID, 0)
  function isoToScreen(gx, gy) {
    var px = gx * GRID;
    var py = gy * GRID;
    return {
      x: originPoint.x + (px - py),
      y: originPoint.y + (px + py) / 2
    };
  }

  // Convert screen pixel to iso grid (approximate)
  function screenToIso(sx, sy) {
    var dx = sx - originPoint.x;
    var dy = sy - originPoint.y;
    // Inverse of: dx = px - py, dy = (px + py) / 2
    // px = (dx + 2*dy) / 2, py = (2*dy - dx) / 2
    var px = (dx + 2 * dy) / 2;
    var py = (2 * dy - dx) / 2;
    return { x: px / GRID, y: py / GRID };
  }

  function roomIsoCenter(id) {
    var r = ROOMS[id];
    return { x: r.gx + r.gw / 2, y: r.gy + r.gh / 2 };
  }

  function hitTestRoom(sx, sy) {
    var iso = screenToIso(sx, sy);
    var ids = Object.keys(ROOMS);
    for (var i = 0; i < ids.length; i++) {
      var r = ROOMS[ids[i]];
      if (iso.x >= r.gx && iso.x < r.gx + r.gw && iso.y >= r.gy && iso.y < r.gy + r.gh) {
        return ids[i];
      }
    }
    return null;
  }

  /* ══════════════════════════════════════
     6. FURNITURE DRAWING FUNCTIONS
     ══════════════════════════════════════ */

  function makeColor(hex) {
    return new obelisk.CubeColor().getByHorizontalColor(hex);
  }

  function makeSideColor(hex) {
    return new obelisk.SideColor().getByInnerColor(hex);
  }

  function makeBrickColor(hex) {
    // BrickColor doesn't exist -- use SideColor for bricks
    return new obelisk.SideColor().getByInnerColor(hex);
  }

  function safeInt(v) { return Math.max(2, Math.round(v)); }

  // Draw a single cube at iso position
  function drawCube(px, py, pz, xdim, ydim, zdim, color) {
    try {
      var dim = new obelisk.CubeDimension(safeInt(xdim), safeInt(ydim), safeInt(zdim));
      var col = makeColor(color);
      var cube = new obelisk.Cube(dim, col, false);
      var p3d = new obelisk.Point3D(Math.round(px * GRID), Math.round(py * GRID), Math.round(pz * GRID));
      pixelView.renderObject(cube, p3d);
    } catch(e) { /* skip invalid dimensions */ }
  }

  // Draw a flat brick at iso position
  function drawBrick(px, py, pz, xdim, ydim, color) {
    try {
      var dim = new obelisk.BrickDimension(safeInt(xdim), safeInt(ydim));
      var col = makeBrickColor(color);
      var brick = new obelisk.Brick(dim, col, false);
      var p3d = new obelisk.Point3D(Math.round(px * GRID), Math.round(py * GRID), Math.round(pz * GRID));
      pixelView.renderObject(brick, p3d);
    } catch(e) { /* skip invalid dimensions */ }
  }

  // Draw floor for a room
  function drawFloor(room, color1, color2) {
    for (var x = 0; x < room.gw; x++) {
      for (var y = 0; y < room.gh; y++) {
        var c = ((x + y) % 2 === 0) ? color1 : color2;
        drawBrick(room.gx + x, room.gy + y, 0, GRID, GRID, c);
      }
    }
  }

  // Draw carpet (centered rectangle within room)
  function drawCarpet(room, inset, color1, color2) {
    for (var x = inset; x < room.gw - inset; x++) {
      for (var y = inset; y < room.gh - inset; y++) {
        var c = ((x + y) % 2 === 0) ? color1 : color2;
        drawBrick(room.gx + x, room.gy + y, 0.1, GRID, GRID, c);
      }
    }
  }

  // Draw walls along left (Y-axis) and back (X-axis) edges
  function drawWalls(room, height, color) {
    // Back wall (along X axis at gy=0)
    for (var x = 0; x < room.gw; x++) {
      drawCube(room.gx + x, room.gy, 0, GRID, GRID, height * GRID, color);
    }
    // Left wall (along Y axis at gx=0)
    for (var y = 1; y < room.gh; y++) {
      drawCube(room.gx, room.gy + y, 0, GRID, GRID, height * GRID, color);
    }
  }

  // Bookshelf: vertical structure with colored books
  function drawBookshelf(px, py, pz, shelfWidth, shelfHeight) {
    var bookColors = [COLORS.bookRed, COLORS.bookBlue, COLORS.bookGreen, COLORS.bookGold,
                      COLORS.bookBrown, COLORS.bookMaroon, COLORS.bookRed2, COLORS.bookBlue2, COLORS.bookGreen2];
    // Shelf frame (back panel)
    drawCube(px, py, pz, shelfWidth * GRID, GRID, shelfHeight * GRID, COLORS.bookshelf);
    // Shelves and books on each level
    for (var level = 0; level < shelfHeight; level++) {
      // Shelf plank
      drawBrick(px, py - 1, pz + level + 0.15, shelfWidth * GRID, GRID, COLORS.shelfDark);
      // Books on this shelf
      for (var b = 0; b < shelfWidth; b++) {
        var bookH = 0.6 + Math.random() * 0.35;
        var bc = bookColors[(level * shelfWidth + b + px * 7 + py * 3) % bookColors.length];
        drawCube(px + b, py - 1, pz + level + 0.15, GRID, GRID * 0.7, bookH * GRID, bc);
      }
    }
  }

  // Desk with legs and items on top
  function drawDesk(px, py, pz, width, depth) {
    // Legs (4 corners)
    var legH = 1;
    drawCube(px, py, pz, GRID * 0.3, GRID * 0.3, legH * GRID, COLORS.desk);
    drawCube(px + width - 0.3, py, pz, GRID * 0.3, GRID * 0.3, legH * GRID, COLORS.desk);
    drawCube(px, py + depth - 0.3, pz, GRID * 0.3, GRID * 0.3, legH * GRID, COLORS.desk);
    drawCube(px + width - 0.3, py + depth - 0.3, pz, GRID * 0.3, GRID * 0.3, legH * GRID, COLORS.desk);
    // Tabletop
    drawBrick(px, py, pz + legH, width * GRID, depth * GRID, COLORS.deskTop);
    // Papers on desk
    drawBrick(px + 0.3, py + 0.3, pz + legH + 0.05, GRID * 0.6, GRID * 0.4, COLORS.paper);
  }

  // Chair
  function drawChair(px, py, pz) {
    // Seat
    drawCube(px, py, pz, GRID * 0.8, GRID * 0.8, GRID * 0.5, COLORS.chairSeat);
    // Backrest
    drawCube(px, py, pz + 0.5, GRID * 0.8, GRID * 0.2, GRID * 0.7, COLORS.chair);
  }

  // Lamp (warm glow pillar)
  function drawLamp(px, py, pz) {
    // Stand
    drawCube(px, py, pz, GRID * 0.3, GRID * 0.3, GRID * 1.5, COLORS.desk);
    // Light bulb
    drawCube(px - 0.1, py - 0.1, pz + 1.5, GRID * 0.5, GRID * 0.5, GRID * 0.4, COLORS.lamp);
  }

  // Tall lamp for larger rooms
  function drawTallLamp(px, py, pz) {
    drawCube(px, py, pz, GRID * 0.3, GRID * 0.3, GRID * 2.5, COLORS.desk);
    drawCube(px - 0.15, py - 0.15, pz + 2.5, GRID * 0.6, GRID * 0.6, GRID * 0.5, COLORS.lamp);
  }

  // Plant
  function drawPlant(px, py, pz) {
    // Pot
    drawCube(px, py, pz, GRID * 0.7, GRID * 0.7, GRID * 0.5, COLORS.plantPot);
    // Foliage (stacked cubes of green)
    drawCube(px - 0.1, py - 0.1, pz + 0.5, GRID * 0.9, GRID * 0.9, GRID * 0.6, COLORS.plant);
    drawCube(px + 0.1, py + 0.1, pz + 1.0, GRID * 0.6, GRID * 0.6, GRID * 0.5, COLORS.plantDark);
  }

  // Candle
  function drawCandle(px, py, pz) {
    drawCube(px, py, pz, GRID * 0.2, GRID * 0.2, GRID * 0.6, COLORS.paper);
    drawCube(px, py, pz + 0.6, GRID * 0.2, GRID * 0.2, GRID * 0.3, COLORS.candleFlame);
  }

  // Bench
  function drawBench(px, py, pz, width) {
    drawCube(px, py, pz, GRID * 0.3, GRID * 0.3, GRID * 0.4, COLORS.bench);
    drawCube(px + width - 0.3, py, pz, GRID * 0.3, GRID * 0.3, GRID * 0.4, COLORS.bench);
    drawBrick(px, py, pz + 0.4, width * GRID, GRID * 0.8, COLORS.bench);
  }

  // Sign board
  function drawSignBoard(px, py, pz) {
    drawCube(px + 0.3, py + 0.3, pz, GRID * 0.2, GRID * 0.2, GRID * 1.5, COLORS.desk);
    drawCube(px, py, pz + 1.5, GRID * 0.8, GRID * 0.15, GRID * 0.6, COLORS.signBoard);
  }

  // Portrait frame on wall
  function drawPortrait(px, py, pz) {
    drawCube(px, py, pz, GRID * 0.15, GRID * 1.2, GRID * 1.5, COLORS.portraitFrame);
    drawCube(px, py + 0.1, pz + 0.1, GRID * 0.1, GRID, GRID * 1.3, COLORS.portrait);
  }

  // Vault (large gold cube)
  function drawVault(px, py, pz) {
    drawCube(px, py, pz, GRID * 3, GRID * 2, GRID * 2.5, COLORS.vaultDark);
    drawCube(px + 0.5, py + 0.2, pz + 0.5, GRID * 2, GRID * 0.2, GRID * 1.5, COLORS.vault);
    // Handle
    drawCube(px + 1, py - 0.1, pz + 1, GRID * 0.4, GRID * 0.2, GRID * 0.4, COLORS.lamp);
  }

  // News rack
  function drawNewsRack(px, py, pz, width) {
    drawCube(px, py, pz, width * GRID, GRID * 0.5, GRID * 1.2, COLORS.newsRack);
    // Papers sticking out
    for (var i = 0; i < width; i++) {
      drawBrick(px + i, py - 0.3, pz + 0.8, GRID * 0.8, GRID * 0.3, COLORS.paper);
    }
  }

  // Fountain (decorative for hub)
  function drawFountain(px, py, pz) {
    // Base
    drawCube(px, py, pz, GRID * 3, GRID * 3, GRID * 0.5, COLORS.fountainBase);
    // Water surface
    drawBrick(px + 0.3, py + 0.3, pz + 0.5, GRID * 2.4, GRID * 2.4, COLORS.fountainWater);
    // Center pillar
    drawCube(px + 1.1, py + 1.1, pz, GRID * 0.8, GRID * 0.8, GRID * 2, COLORS.stone);
    // Top
    drawCube(px + 0.8, py + 0.8, pz + 2, GRID * 1.4, GRID * 1.4, GRID * 0.3, COLORS.stoneDark);
  }

  // Armchair (comfy reading chair)
  function drawArmchair(px, py, pz, color) {
    drawCube(px, py, pz, GRID * 1.2, GRID * 1.2, GRID * 0.5, color || COLORS.carpetRed);
    drawCube(px, py, pz + 0.5, GRID * 1.2, GRID * 0.3, GRID * 0.8, color || COLORS.carpetRed);
    drawCube(px, py, pz + 0.5, GRID * 0.25, GRID * 1.2, GRID * 0.4, color || COLORS.carpetRedL);
    drawCube(px + 0.95, py, pz + 0.5, GRID * 0.25, GRID * 1.2, GRID * 0.4, color || COLORS.carpetRedL);
  }

  /* ══════════════════════════════════════
     7. ROOM DRAWING FUNCTIONS
     ══════════════════════════════════════ */

  function drawRoom_entrance() {
    var r = ROOMS.entrance;
    // Floor
    drawFloor(r, COLORS.floor, COLORS.floorDark);
    // Walls
    drawWalls(r, 3, COLORS.wall);
    // Sign board in center
    drawSignBoard(r.gx + 8, r.gy + 5, 0);
    // Benches
    drawBench(r.gx + 3, r.gy + 4, 0, 3);
    drawBench(r.gx + 12, r.gy + 4, 0, 3);
    // Plants in corners
    drawPlant(r.gx + 2, r.gy + 2, 0);
    drawPlant(r.gx + 15, r.gy + 2, 0);
    drawPlant(r.gx + 2, r.gy + 9, 0);
    drawPlant(r.gx + 15, r.gy + 9, 0);
    // Lamps
    drawLamp(r.gx + 4, r.gy + 2, 0);
    drawLamp(r.gx + 13, r.gy + 2, 0);
  }

  function drawRoom_principles() {
    var r = ROOMS.principles;
    // Floor
    drawFloor(r, COLORS.floor, COLORS.floorDark);
    // Carpet (purple)
    drawCarpet(r, 3, COLORS.carpet, COLORS.carpetLight);
    // Walls
    drawWalls(r, 3, COLORS.wall);
    // 4 bookshelves along back wall
    drawBookshelf(r.gx + 2, r.gy + 1, 0, 3, 3);
    drawBookshelf(r.gx + 6, r.gy + 1, 0, 3, 3);
    drawBookshelf(r.gx + 10, r.gy + 1, 0, 3, 3);
    drawBookshelf(r.gx + 14, r.gy + 1, 0, 3, 3);
    // 2 desks in center
    drawDesk(r.gx + 5, r.gy + 5, 0, 3, 2);
    drawDesk(r.gx + 10, r.gy + 5, 0, 3, 2);
    // 4 chairs
    drawChair(r.gx + 5, r.gy + 7.5, 0);
    drawChair(r.gx + 7, r.gy + 7.5, 0);
    drawChair(r.gx + 10, r.gy + 7.5, 0);
    drawChair(r.gx + 12, r.gy + 7.5, 0);
    // Lamps on desks
    drawLamp(r.gx + 6, r.gy + 5.3, 1);
    drawLamp(r.gx + 11, r.gy + 5.3, 1);
  }

  function drawRoom_moat() {
    var r = ROOMS.moat;
    // Stone floor
    drawFloor(r, COLORS.floorStone, COLORS.stoneDark);
    // Water moat around edges (inner 2 tiles)
    for (var x = 1; x < r.gw - 1; x++) {
      drawBrick(r.gx + x, r.gy + 1, 0.05, GRID, GRID, COLORS.water);
      drawBrick(r.gx + x, r.gy + r.gh - 2, 0.05, GRID, GRID, COLORS.water);
    }
    for (var y = 2; y < r.gh - 2; y++) {
      drawBrick(r.gx + 1, r.gy + y, 0.05, GRID, GRID, COLORS.water);
      drawBrick(r.gx + r.gw - 2, r.gy + y, 0.05, GRID, GRID, COLORS.waterLight);
    }
    // Walls
    drawWalls(r, 3, COLORS.wall);
    // 2 bookshelves along back
    drawBookshelf(r.gx + 4, r.gy + 1, 0, 4, 3);
    drawBookshelf(r.gx + 10, r.gy + 1, 0, 4, 3);
    // Desk and chairs
    drawDesk(r.gx + 7, r.gy + 5, 0, 3, 2);
    drawChair(r.gx + 7, r.gy + 7.5, 0);
    drawChair(r.gx + 9, r.gy + 7.5, 0);
  }

  function drawRoom_companies() {
    var r = ROOMS.companies;
    // Dark wood floor
    drawFloor(r, COLORS.floorDark, 0xC8B898);
    // Walls
    drawWalls(r, 3, COLORS.wall);
    // 5 bookshelves along back wall
    drawBookshelf(r.gx + 1, r.gy + 1, 0, 3, 3);
    drawBookshelf(r.gx + 4, r.gy + 1, 0, 3, 3);
    drawBookshelf(r.gx + 7, r.gy + 1, 0, 3, 3);
    drawBookshelf(r.gx + 10, r.gy + 1, 0, 3, 3);
    drawBookshelf(r.gx + 13, r.gy + 1, 0, 3, 3);
    // 2 island bookshelves
    drawBookshelf(r.gx + 3, r.gy + 6, 0, 4, 2);
    drawBookshelf(r.gx + 10, r.gy + 6, 0, 4, 2);
    // Large analysis table
    drawDesk(r.gx + 6, r.gy + 8, 0, 5, 3);
    // 6 chairs
    drawChair(r.gx + 6, r.gy + 5.5, 0);
    drawChair(r.gx + 8, r.gy + 5.5, 0);
    drawChair(r.gx + 10, r.gy + 5.5, 0);
    drawChair(r.gx + 6, r.gy + 9, 0);  // modified: moved behind desk
    drawChair(r.gx + 8, r.gy + 9, 0);  // modified: behind desk
    drawChair(r.gx + 10, r.gy + 9, 0); // modified: behind desk
    // 4 lamps (bright room)
    drawTallLamp(r.gx + 2, r.gy + 4, 0);
    drawTallLamp(r.gx + 15, r.gy + 4, 0);
    drawTallLamp(r.gx + 2, r.gy + 9, 0);
    drawTallLamp(r.gx + 15, r.gy + 9, 0);
  }

  function drawRoom_hub() {
    var r = ROOMS.hub;
    // Stone floor with gold carpet center
    drawFloor(r, COLORS.floorStone, COLORS.stoneDark);
    drawCarpet(r, 3, COLORS.carpetGold, COLORS.carpetGoldL);
    // NO full walls - open passages on all sides
    // Just corner pillars for structure
    drawCube(r.gx, r.gy, 0, GRID, GRID, 4 * GRID, COLORS.wallTop);
    drawCube(r.gx + r.gw - 1, r.gy, 0, GRID, GRID, 4 * GRID, COLORS.wallTop);
    drawCube(r.gx, r.gy + r.gh - 1, 0, GRID, GRID, 4 * GRID, COLORS.wallTop);
    drawCube(r.gx + r.gw - 1, r.gy + r.gh - 1, 0, GRID, GRID, 4 * GRID, COLORS.wallTop);
    // Fountain in center
    drawFountain(r.gx + 7, r.gy + 4, 0);
    // Plants in each corner
    drawPlant(r.gx + 2, r.gy + 2, 0);
    drawPlant(r.gx + 15, r.gy + 2, 0);
    drawPlant(r.gx + 2, r.gy + 9, 0);
    drawPlant(r.gx + 15, r.gy + 9, 0);
    // Floating ceiling lamps (golden cubes at height)
    drawCube(r.gx + 5, r.gy + 3, 4, GRID * 0.5, GRID * 0.5, GRID * 0.4, COLORS.lamp);
    drawCube(r.gx + 12, r.gy + 3, 4, GRID * 0.5, GRID * 0.5, GRID * 0.4, COLORS.lamp);
    drawCube(r.gx + 5, r.gy + 8, 4, GRID * 0.5, GRID * 0.5, GRID * 0.4, COLORS.lamp);
    drawCube(r.gx + 12, r.gy + 8, 4, GRID * 0.5, GRID * 0.5, GRID * 0.4, COLORS.lamp);
    drawCube(r.gx + 8.5, r.gy + 5.5, 4.5, GRID * 0.6, GRID * 0.6, GRID * 0.5, COLORS.lampGlow);
  }

  function drawRoom_fcf() {
    var r = ROOMS.fcf;
    // Floor with green carpet
    drawFloor(r, COLORS.floor, COLORS.floorDark);
    drawCarpet(r, 3, COLORS.carpetGreen, COLORS.carpetGreenL);
    // Walls
    drawWalls(r, 3, COLORS.wall);
    // Vault in the back
    drawVault(r.gx + 7, r.gy + 1, 0);
    // 2 bookshelves along back wall sides
    drawBookshelf(r.gx + 2, r.gy + 1, 0, 4, 3);
    drawBookshelf(r.gx + 12, r.gy + 1, 0, 4, 3);
    // 2 calculation desks
    drawDesk(r.gx + 4, r.gy + 6, 0, 3, 2);
    drawDesk(r.gx + 10, r.gy + 6, 0, 3, 2);
    // 4 chairs
    drawChair(r.gx + 4, r.gy + 8.5, 0);
    drawChair(r.gx + 6, r.gy + 8.5, 0);
    drawChair(r.gx + 10, r.gy + 8.5, 0);
    drawChair(r.gx + 12, r.gy + 8.5, 0);
    // Lamps
    drawLamp(r.gx + 5, r.gy + 6.3, 1);
    drawLamp(r.gx + 11, r.gy + 6.3, 1);
  }

  function drawRoom_research() {
    var r = ROOMS.research;
    // Floor
    drawFloor(r, COLORS.floorDark, 0xC8B898);
    // Walls
    drawWalls(r, 3, COLORS.wall);
    // 2 bookshelves
    drawBookshelf(r.gx + 2, r.gy + 1, 0, 4, 3);
    drawBookshelf(r.gx + 8, r.gy + 1, 0, 4, 3);
    // Small desk and chair (cozy study)
    drawDesk(r.gx + 6, r.gy + 4, 0, 2, 1.5);
    drawChair(r.gx + 6, r.gy + 6, 0);
    // Old book stacks
    drawCube(r.gx + 14, r.gy + 2, 0, GRID * 0.8, GRID * 0.8, GRID * 0.5, COLORS.bookBrown);
    drawCube(r.gx + 14.2, r.gy + 2.2, 0.5, GRID * 0.6, GRID * 0.6, GRID * 0.4, COLORS.bookRed);
    drawCube(r.gx + 14.1, r.gy + 2.1, 0.9, GRID * 0.5, GRID * 0.5, GRID * 0.3, COLORS.bookGreen);
    // Candles
    drawCandle(r.gx + 7, r.gy + 4.2, 1);
    drawCandle(r.gx + 15, r.gy + 3, 0);
  }

  function drawRoom_news() {
    var r = ROOMS.news;
    // Floor
    drawFloor(r, COLORS.floor, COLORS.floorDark);
    // Walls
    drawWalls(r, 3, COLORS.wall);
    // News racks
    drawNewsRack(r.gx + 2, r.gy + 1, 0, 5);
    drawNewsRack(r.gx + 10, r.gy + 1, 0, 5);
    // Large conference table
    drawDesk(r.gx + 5, r.gy + 3.5, 0, 6, 3);
    // 6 chairs around table
    drawChair(r.gx + 5, r.gy + 3, 0);
    drawChair(r.gx + 7, r.gy + 3, 0);
    drawChair(r.gx + 9, r.gy + 3, 0);
    drawChair(r.gx + 5, r.gy + 6.5, 0);
    drawChair(r.gx + 7, r.gy + 6.5, 0);
    drawChair(r.gx + 9, r.gy + 6.5, 0);
    // Lamps
    drawTallLamp(r.gx + 15, r.gy + 2, 0);
    drawTallLamp(r.gx + 15, r.gy + 5, 0);
  }

  function drawRoom_horizons() {
    var r = ROOMS.horizons;
    // Floor with deep red carpet
    drawFloor(r, COLORS.floorDark, 0xC0A888);
    drawCarpet(r, 2, COLORS.carpetRed, COLORS.carpetRedL);
    // Walls
    drawWalls(r, 4, COLORS.wall);
    // 3 tall bookshelves (height 4)
    drawBookshelf(r.gx + 2, r.gy + 1, 0, 4, 4);
    drawBookshelf(r.gx + 7, r.gy + 1, 0, 4, 4);
    drawBookshelf(r.gx + 12, r.gy + 1, 0, 4, 4);
    // 2 armchairs
    drawArmchair(r.gx + 5, r.gy + 5, 0, COLORS.carpetRed);
    drawArmchair(r.gx + 10, r.gy + 5, 0, COLORS.carpetRed);
    // Candles
    drawCandle(r.gx + 3, r.gy + 4, 0);
    drawCandle(r.gx + 8, r.gy + 4, 0);
    drawCandle(r.gx + 14, r.gy + 4, 0);
    drawCandle(r.gx + 16, r.gy + 2, 0);
  }

  function drawRoom_corridor() {
    var r = ROOMS.corridor;
    // Floor
    drawFloor(r, COLORS.floorStone, COLORS.stoneDark);
    // Red carpet runner down the center
    for (var x = 2; x < r.gw - 2; x++) {
      for (var y = 2; y < r.gh - 2; y++) {
        var c = ((x + y) % 2 === 0) ? COLORS.carpetRed : COLORS.carpetRedL;
        drawBrick(r.gx + x, r.gy + y, 0.1, GRID, GRID, c);
      }
    }
    // Walls on both long sides
    for (var x = 0; x < r.gw; x++) {
      drawCube(r.gx + x, r.gy, 0, GRID, GRID, 3 * GRID, COLORS.wall);
      drawCube(r.gx + x, r.gy + r.gh - 1, 0, GRID, GRID, 3 * GRID, COLORS.wall);
    }
    // 8 portrait frames along back wall
    var portraitSpacing = Math.floor((r.gw - 4) / 8);
    for (var i = 0; i < 8; i++) {
      var ppx = r.gx + 3 + i * portraitSpacing;
      drawPortrait(ppx, r.gy + 0.5, 0.5);
      // Lamp below each portrait
      drawLamp(ppx + 0.3, r.gy + 1.5, 0);
    }
    // Plants at ends
    drawPlant(r.gx + 1, r.gy + 3, 0);
    drawPlant(r.gx + r.gw - 2, r.gy + 3, 0);
  }

  /* ── Lamp glow positions (iso coords) ── */
  var LAMP_POSITIONS = [];
  function collectLampPositions() {
    LAMP_POSITIONS = [];
    var r;
    // Entrance lamps
    r = ROOMS.entrance;
    LAMP_POSITIONS.push({x: r.gx+4, y: r.gy+2}, {x: r.gx+13, y: r.gy+2});
    // Principles desk lamps
    r = ROOMS.principles;
    LAMP_POSITIONS.push({x: r.gx+6, y: r.gy+5.3}, {x: r.gx+11, y: r.gy+5.3});
    // Companies tall lamps
    r = ROOMS.companies;
    LAMP_POSITIONS.push({x: r.gx+2, y: r.gy+4}, {x: r.gx+15, y: r.gy+4},
                        {x: r.gx+2, y: r.gy+9}, {x: r.gx+15, y: r.gy+9});
    // Hub ceiling lamps
    r = ROOMS.hub;
    LAMP_POSITIONS.push({x: r.gx+5, y: r.gy+3}, {x: r.gx+12, y: r.gy+3},
                        {x: r.gx+5, y: r.gy+8}, {x: r.gx+12, y: r.gy+8},
                        {x: r.gx+8.5, y: r.gy+5.5}); // center lamp brighter
    // FCF lamps
    r = ROOMS.fcf;
    LAMP_POSITIONS.push({x: r.gx+5, y: r.gy+6.3}, {x: r.gx+11, y: r.gy+6.3});
    // Research candles
    r = ROOMS.research;
    LAMP_POSITIONS.push({x: r.gx+7, y: r.gy+4.2, small:true}, {x: r.gx+15, y: r.gy+3, small:true});
    // News lamps
    r = ROOMS.news;
    LAMP_POSITIONS.push({x: r.gx+15, y: r.gy+2}, {x: r.gx+15, y: r.gy+5});
    // Horizons candles
    r = ROOMS.horizons;
    LAMP_POSITIONS.push({x: r.gx+3, y: r.gy+4, small:true}, {x: r.gx+8, y: r.gy+4, small:true},
                        {x: r.gx+14, y: r.gy+4, small:true}, {x: r.gx+16, y: r.gy+2, small:true});
    // Corridor lamps (below portraits)
    r = ROOMS.corridor;
    var spacing = Math.floor((r.gw - 4) / 8);
    for (var i = 0; i < 8; i++) {
      LAMP_POSITIONS.push({x: r.gx+3+i*spacing+0.3, y: r.gy+1.5, small:true});
    }
  }

  function drawLampGlows() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < LAMP_POSITIONS.length; i++) {
      var lp = LAMP_POSITIONS[i];
      var screen = isoToScreen(lp.x, lp.y);
      var radius = lp.small ? 18 : 30;
      var grad = ctx.createRadialGradient(screen.x, screen.y - 8, 0, screen.x, screen.y - 8, radius);
      grad.addColorStop(0, 'rgba(240,204,85,0.15)');
      grad.addColorStop(0.5, 'rgba(240,180,60,0.06)');
      grad.addColorStop(1, 'rgba(240,180,60,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(screen.x - radius, screen.y - 8 - radius, radius * 2, radius * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  }

  /* ══════════════════════════════════════
     8. MAIN DRAW FUNCTION
     ══════════════════════════════════════ */
  function drawMap() {
    // Clear canvas
    ctx.fillStyle = '#0a0804';
    ctx.fillRect(0, 0, CW, CH);

    // Re-create pixelView each frame (Obelisk has no clear method)
    pixelView = new obelisk.PixelView(canvas, originPoint);

    // Draw rooms back-to-front (isometric sort: top-left rooms first)
    // Drawing order matters for correct overlapping
    drawRoom_entrance();
    drawRoom_principles();
    drawRoom_moat();
    drawRoom_companies();
    drawRoom_hub();
    drawRoom_fcf();
    drawRoom_research();
    drawRoom_news();
    drawRoom_horizons();
    drawRoom_corridor();

    // Draw warm lamp glow effects
    drawLampGlows();

    // Draw room highlight for hovered/selected room
    if (hoveredRoom || selectedRoom) {
      var hlRoom = selectedRoom || hoveredRoom;
      var r = ROOMS[hlRoom];
      // Draw a subtle glow border using Canvas 2D
      var tl = isoToScreen(r.gx, r.gy);
      var tr = isoToScreen(r.gx + r.gw, r.gy);
      var br = isoToScreen(r.gx + r.gw, r.gy + r.gh);
      var bl = isoToScreen(r.gx, r.gy + r.gh);

      ctx.save();
      ctx.strokeStyle = selectedRoom === hlRoom ? 'rgba(212,170,34,0.8)' : 'rgba(212,170,34,0.4)';
      ctx.lineWidth = selectedRoom === hlRoom ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(tl.x, tl.y);
      ctx.lineTo(tr.x, tr.y);
      ctx.lineTo(br.x, br.y);
      ctx.lineTo(bl.x, bl.y);
      ctx.closePath();
      ctx.stroke();

      // Subtle fill glow
      ctx.fillStyle = selectedRoom === hlRoom ? 'rgba(212,170,34,0.06)' : 'rgba(212,170,34,0.03)';
      ctx.fill();
      ctx.restore();
    }

    // Draw labels on top (Canvas 2D overlay)
    drawLabels();

    // Draw other travelers
    drawOtherTravelers();

    // Draw NPCs
    drawNPCs();

    // Draw avatar
    drawAvatar();

    // Draw room badges
    var others = getOtherTravelers();
    drawRoomBadges(others);
  }

  function drawLabels() {
    ctx.save();
    var ids = Object.keys(ROOMS);
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var r = ROOMS[id];
      var center = isoToScreen(r.gx + r.gw / 2, r.gy + r.gh / 2);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Background pill for readability
      ctx.fillStyle = 'rgba(10,8,4,0.55)';
      var labelW = r.label.length * 7 + 16;
      ctx.fillRect(center.x - labelW / 2, center.y - 12, labelW, 24);

      // Japanese label
      ctx.font = 'bold 10px "Noto Serif JP", serif';
      ctx.fillStyle = 'rgba(245,237,224,0.85)';
      ctx.fillText(r.label, center.x, center.y - 2);

      // English sub-label
      ctx.font = '8px "DM Mono", monospace';
      ctx.fillStyle = 'rgba(212,170,34,0.6)';
      ctx.fillText(r.labelEn, center.x, center.y + 10);
    }
    ctx.restore();
  }

  /* ══════════════════════════════════════
     9. AVATAR, NPC, PRESENCE
     ══════════════════════════════════════ */

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

  function drawAvatar() {
    var screen = isoToScreen(avatarIsoPos.x, avatarIsoPos.y);
    var ax = screen.x - 8;
    var ay = screen.y - 20; // offset up so avatar appears to stand on the floor
    var sprite = AVATAR_SPRITES[_avatarType] || AVATAR_SPRITES.traveler;
    var pal = avatarPalette(_avatarType);
    drawSprite(sprite, pal, ax, ay, 1);
    // Companion
    drawCompanion(ax + 12, ay + 10);
    // Nickname
    if (_nickname) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '7px "DM Mono", monospace';
      ctx.fillStyle = 'rgba(212,170,34,0.7)';
      ctx.fillText(_nickname, screen.x, ay - 3);
      ctx.restore();
    }
  }

  function drawCompanion(px, py) {
    var sprite = COMPANION_SPRITES[_companionType];
    var pal = COMPANION_PALETTES[_companionType];
    if (!sprite || !pal) return;
    drawSprite(sprite, pal, px, py, 1);
  }

  function drawNPCs() {
    for (var i = 0; i < NPCS.length; i++) {
      var npc = NPCS[i];
      var center = roomIsoCenter(npc.room);
      var isoX = center.x + npc.offsetX;
      var isoY = center.y + npc.offsetY;
      var screen = isoToScreen(isoX, isoY);
      drawSprite(NPC_SPRITE, NPC_PAL, screen.x - 4, screen.y - 10, 1);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.font = '6px sans-serif';
      ctx.fillStyle = 'rgba(212,170,34,0.5)';
      ctx.fillText(npc.label, screen.x, screen.y);
      ctx.restore();
    }
  }

  /* ── Presence (other travelers) ── */
  var _otherTravelersCache = null;
  var _otherTravelersLastUpdate = 0;
  var OTHER_TRAVELER_INTERVAL = 30000;

  function getOtherTravelers() {
    var now = Date.now();
    if (_otherTravelersCache && (now - _otherTravelersLastUpdate) < OTHER_TRAVELER_INTERVAL) {
      return _otherTravelersCache;
    }
    _otherTravelersLastUpdate = now;
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
      var hour = new Date().getHours();
      var baseCount;
      if (hour >= 6 && hour < 10) baseCount = 1;
      else if (hour >= 10 && hour < 18) baseCount = 3;
      else if (hour >= 18 && hour < 23) baseCount = 2;
      else baseCount = 1;
      for (var i = 0; i < roomIds.length; i++) {
        var rid = roomIds[i];
        var variance = Math.floor(rng() * 2);
        var count = Math.max(0, Math.min(3, baseCount + variance - 1));
        if (rid === 'hub') count = Math.min(3, count + 1);
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
        isoX: r.gx + 2 + Math.floor(rng() * (r.gw - 4)),
        isoY: r.gy + 2 + Math.floor(rng() * (r.gh - 4)),
        type: types[Math.floor(rng() * types.length)]
      });
    }
    return ghosts;
  }

  function drawOtherTravelers() {
    var others = getOtherTravelers();
    var roomIds = Object.keys(others);
    ctx.save();
    ctx.globalAlpha = 0.3;
    for (var i = 0; i < roomIds.length; i++) {
      var ghosts = others[roomIds[i]];
      for (var g = 0; g < ghosts.length; g++) {
        var ghost = ghosts[g];
        var screen = isoToScreen(ghost.isoX, ghost.isoY);
        var sprite = AVATAR_SPRITES[ghost.type] || AVATAR_SPRITES.traveler;
        var pal = avatarPalette(ghost.type);
        drawMiniSprite(sprite, pal, screen.x - 4, screen.y - 6);
      }
    }
    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  function drawRoomBadges(others) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    var roomIds = Object.keys(others);
    for (var i = 0; i < roomIds.length; i++) {
      var rid = roomIds[i];
      var count = others[rid].length;
      if (count <= 0) continue;
      var r = ROOMS[rid];
      if (!r) continue;
      var corner = isoToScreen(r.gx + r.gw - 1, r.gy + r.gh - 1);
      ctx.fillStyle = 'rgba(26,18,8,0.7)';
      ctx.fillRect(corner.x - 12, corner.y - 6, 24, 12);
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(212,170,34,0.8)';
      ctx.fillText(count + '\u4eba', corner.x, corner.y);
    }
    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  /* ══════════════════════════════════════
     10. INTERACTION & ANIMATION
     ══════════════════════════════════════ */

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function moveAvatarTo(roomId, andNavigate) {
    var target = roomIsoCenter(roomId);
    animFrom.x = avatarIsoPos.x;
    animFrom.y = avatarIsoPos.y;
    avatarTarget = target;
    animStart = performance.now();
    currentRoom = roomId;
    navigating = !!andNavigate;
    dirty = true;
  }

  function frame(ts) {
    if (avatarTarget) {
      var elapsed = ts - animStart;
      var t = Math.min(elapsed / animDuration, 1);
      var e = easeInOut(t);
      avatarIsoPos.x = animFrom.x + (avatarTarget.x - animFrom.x) * e;
      avatarIsoPos.y = animFrom.y + (avatarTarget.y - animFrom.y) * e;
      dirty = true;
      if (t >= 1) {
        avatarIsoPos.x = avatarTarget.x;
        avatarIsoPos.y = avatarTarget.y;
        avatarTarget = null;
        if (navigating) {
          var url = ROOMS[currentRoom].url;
          if (url) window.location.href = url;
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

  /* ── Room info panel ── */
  function showRoomInfo(roomId) {
    var infoEl = document.getElementById('mapRoomInfo');
    if (!infoEl) return;
    var r = ROOMS[roomId];
    var desc = ROOM_DESC[roomId] || '';
    var btnHtml = '';
    if (r.url) {
      btnHtml = '<a class="map-room-btn" href="' + r.url + '" data-room="' + roomId + '">この部屋に入る \u2192</a>';
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
    if (infoEl) infoEl.style.opacity = '0';
  }

  /* ── Canvas events ── */
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
    var room = hitTestRoom(pos.x, pos.y);
    if (room) {
      selectedRoom = room;
      moveAvatarTo(room, false);
      showRoomInfo(room);
      dirty = true;
    }
  }

  function onCanvasMove(e) {
    var pos = canvasCoords(e);
    var room = hitTestRoom(pos.x, pos.y);
    if (room !== hoveredRoom) {
      hoveredRoom = room;
      canvas.style.cursor = room ? 'pointer' : 'default';
      dirty = true;
    }
  }

  function onCanvasLeave() {
    if (hoveredRoom) {
      hoveredRoom = null;
      dirty = true;
    }
  }

  /* ── Traveler info ── */
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
      '  <span class="traveler-companion-tag">相棒: ' + companionLabel + '</span></span>';
    el.style.display = 'block';
  }

  /* ══════════════════════════════════════
     11. INITIALIZATION
     ══════════════════════════════════════ */
  function init() {
    canvas = document.getElementById('libraryMapCanvas');
    if (!canvas) return;

    canvas.width = CW;
    canvas.height = CH;
    ctx = canvas.getContext('2d');

    originPoint = new obelisk.Point(630, 40);
    pixelView = new obelisk.PixelView(canvas, originPoint);
    collectLampPositions();

    // Initial avatar position
    var startIso = roomIsoCenter(currentRoom);
    avatarIsoPos.x = startIso.x;
    avatarIsoPos.y = startIso.y;

    // Events
    canvas.addEventListener('click', onCanvasClick);
    canvas.addEventListener('touchstart', onCanvasClick, { passive: false });
    canvas.addEventListener('mousemove', onCanvasMove);
    canvas.addEventListener('mouseleave', onCanvasLeave);

    initTravelerInfo();

    // Refresh presence periodically
    setInterval(function () {
      _otherTravelersCache = null;
      dirty = true;
    }, OTHER_TRAVELER_INTERVAL);

    dirty = true;
    rafId = requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
