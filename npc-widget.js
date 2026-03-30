/* ══════════════════════════════════════════════
   投資と思考の書斎 — NPC Widget
   5体のNPCキャラクターがセリフ吹き出しで案内
   ══════════════════════════════════════════════ */

(function(){
'use strict';

// ── NPC定義 ──
var NPCS = [
  {
    id: 'npc-guide',
    icon: '\uD83D\uDCDA',
    name: '\u66F8\u658E\u306E\u6848\u5185\u4EBA',
    anchor: '.hero',
    side: 'left',
    lines: [
      '\u3088\u3046\u3053\u305D\u3001\u6295\u8CC7\u3068\u601D\u8003\u306E\u66F8\u658E\u3078\u3002\u307E\u305A\u306F\u6C17\u306B\u306A\u308B\u68DA\u304B\u3089\u6B69\u3044\u3066\u307F\u3066\u304F\u3060\u3055\u3044\u3002',
      '\u3053\u306E\u66F8\u658E\u306B\u306F\u3001\u6295\u8CC7\u306E\u77E5\u6075\u3068\u4EBA\u751F\u306E\u6559\u990A\u304C\u8A70\u307E\u3063\u3066\u3044\u307E\u3059\u3002\u3054\u3086\u3063\u304F\u308A\u3069\u3046\u305E\u3002',
      '\u521D\u3081\u3066\u306E\u65B9\u306F\u300C\u66F8\u658E\u306E\u6B69\u304D\u65B9\u300D\u304B\u3089\u59CB\u3081\u308B\u3068\u3001\u8FF7\u308F\u305A\u6B69\u3051\u307E\u3059\u3088\u3002'
    ]
  },
  {
    id: 'npc-butler',
    icon: '\u2615',
    name: '\u671D\u306E\u57F7\u4E8B',
    anchor: '#morningSection',
    side: 'right',
    lines: [
      '\u304A\u306F\u3088\u3046\u3054\u3056\u3044\u307E\u3059\u3002\u4ECA\u671D\u306F\u3069\u3093\u306A\u4E00\u6B69\u3092\u8E0F\u307F\u51FA\u3057\u307E\u3057\u3087\u3046\u304B\u3002',
      '\u30E2\u30FC\u30CB\u30F3\u30B0\u30E1\u30BD\u30C3\u30C9\u306F\u3001\u6295\u8CC7\u5BB6\u306B\u3068\u3063\u3066\u6700\u826F\u306E\u6669\u8ABF\u3002\u4ECA\u65E5\u3082\u826F\u3044\u4E00\u65E5\u3092\u3002',
      '\u671D\u306E\u7FD2\u6163\u304C\u6574\u3048\u3070\u3001\u5224\u65AD\u3082\u6574\u3046\u3002\u30D0\u30D5\u30A7\u30C3\u30C8\u3082\u65E9\u8D77\u304D\u3067\u3059\u3088\u3002'
    ]
  },
  {
    id: 'npc-storyteller',
    icon: '\uD83D\uDCDC',
    name: '\u8A9E\u308A\u90E8',
    anchor: '.core-reads',
    side: 'left',
    lines: [
      '\u3053\u3053\u306B\u306F\u30D0\u30D5\u30A7\u30C3\u30C8\u30FB\u30DE\u30F3\u30AC\u30FC\u30FB\u30D5\u30A3\u30C3\u30B7\u30E3\u30FC\u306E\u8A00\u8449\u304C\u606F\u3065\u3044\u3066\u3044\u307E\u3059\u3002',
      '\u5148\u4EBA\u305F\u3061\u306E\u8A00\u8449\u306F\u3001\u6642\u4EE3\u3092\u8D85\u3048\u3066\u8F1D\u304D\u7D9A\u3051\u308B\u3002\u8033\u3092\u50BE\u3051\u3066\u307F\u3066\u304F\u3060\u3055\u3044\u3002',
      '\u300C\u9006\u304B\u3089\u8003\u3048\u3088\u300D\u2014\u2014\u30DE\u30F3\u30AC\u30FC\u306E\u6559\u3048\u306F\u3001\u6295\u8CC7\u3060\u3051\u3067\u306A\u304F\u4EBA\u751F\u306B\u3082\u52B9\u304D\u307E\u3059\u3002'
    ]
  },
  {
    id: 'npc-librarian',
    icon: '\uD83D\uDD0D',
    name: '\u53F8\u66F8',
    anchor: '.site-nav',
    side: 'right',
    lines: [
      'moat\u3001FCF\u3001\u4F01\u696D\u5206\u6790\u3002\u4F53\u7CFB\u7684\u306B\u5B66\u3076\u306A\u3089\u3053\u306E\u68DA\u304B\u3089\u3002',
      '\u6295\u8CC7\u539F\u5247\u2192moat\u2192FCF\u306E\u9806\u3067\u8AAD\u3080\u3068\u3001\u77E5\u8B58\u304C\u3064\u306A\u304C\u308A\u307E\u3059\u3088\u3002',
      '\u8FF7\u3063\u305F\u3089\u300C\u4F01\u696D\u5206\u6790\u30C6\u30F3\u30D7\u30EC\u30FC\u30C8\u300D\u304B\u3089\u59CB\u3081\u3066\u307F\u3066\u304F\u3060\u3055\u3044\u3002\u5B9F\u8DF5\u7684\u3067\u3059\u3002'
    ]
  },
  {
    id: 'npc-innkeeper',
    icon: '\uD83C\uDFE0',
    name: '\u5BBF\u5C4B\u4E3B\u4EBA',
    anchor: '.footer',
    side: 'left',
    lines: [
      '\u4ECA\u65E5\u306F\u3053\u3053\u307E\u3067\u306B\u3057\u307E\u3059\u304B\uFF1F\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u3057\u3066\u3001\u307E\u305F\u6765\u3066\u304F\u3060\u3055\u3044\u306D\u3002',
      '\u304A\u75B2\u308C\u3055\u307E\u3067\u3057\u305F\u3002\u77E5\u8B58\u306F\u8907\u5229\u3067\u52B9\u304D\u307E\u3059\u3002\u307E\u305F\u660E\u65E5\u3002',
      '\u826F\u3044\u6295\u8CC7\u5BB6\u306F\u826F\u3044\u7761\u7720\u304B\u3089\u3002\u4ECA\u65E5\u5B66\u3093\u3060\u3053\u3068\u3092\u80F8\u306B\u3001\u304A\u4F11\u307F\u306A\u3055\u3044\u3002'
    ]
  }
];

var activeNpc = null;
var hideTimer = null;

// ── CSS注入 ──
function injectCSS(){
  if(document.getElementById('npcWidgetCSS')) return;
  var style = document.createElement('style');
  style.id = 'npcWidgetCSS';
  style.textContent = [
    '.npc-widget{position:absolute;z-index:500;cursor:pointer;transition:transform .2s,opacity .3s;opacity:0;transform:translateY(10px);}',
    '.npc-widget.visible{opacity:1;transform:translateY(0);}',
    '.npc-widget.side-left{left:8px;}',
    '.npc-widget.side-right{right:8px;}',
    '.npc-icon{width:48px;height:48px;border-radius:50%;background:var(--ink,#1a1208);border:2px solid rgba(184,144,10,.3);display:flex;align-items:center;justify-content:center;font-size:1.3rem;box-shadow:0 2px 12px rgba(26,18,8,.3);transition:all .2s;}',
    '.npc-icon:hover{border-color:var(--gold3,#d4aa22);box-shadow:0 4px 20px rgba(184,144,10,.25);transform:scale(1.08);}',
    '.npc-name{font-family:var(--mono,"DM Mono",monospace);font-size:.42rem;color:var(--gold3,#d4aa22);letter-spacing:.08em;text-align:center;margin-top:3px;white-space:nowrap;}',
    '.npc-bubble{position:absolute;top:50%;transform:translateY(-50%);width:240px;padding:14px 16px;background:var(--ink,#1a1208);border:1px solid rgba(184,144,10,.25);box-shadow:0 4px 24px rgba(26,18,8,.4);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;z-index:501;}',
    '.npc-bubble.active{opacity:1;pointer-events:auto;}',
    '.npc-bubble.bubble-left{left:calc(100% + 12px);transform:translateY(-50%) translateX(-6px);}',
    '.npc-bubble.bubble-left.active{transform:translateY(-50%) translateX(0);}',
    '.npc-bubble.bubble-right{right:calc(100% + 12px);transform:translateY(-50%) translateX(6px);}',
    '.npc-bubble.bubble-right.active{transform:translateY(-50%) translateX(0);}',
    '.npc-bubble::before{content:"";position:absolute;top:50%;width:8px;height:8px;background:var(--ink,#1a1208);border:1px solid rgba(184,144,10,.25);transform:translateY(-50%) rotate(45deg);}',
    '.npc-bubble.bubble-left::before{left:-5px;border-right:none;border-top:none;}',
    '.npc-bubble.bubble-right::before{right:-5px;border-left:none;border-bottom:none;}',
    '.npc-bubble-name{font-family:var(--mono,"DM Mono",monospace);font-size:.44rem;color:var(--gold3,#d4aa22);letter-spacing:.1em;margin-bottom:6px;}',
    '.npc-bubble-text{font-family:var(--jp,"Noto Serif JP",serif);font-size:.78rem;color:var(--parch,#f5ede0);line-height:1.85;font-weight:300;}',
    /* スマホ対応 */
    '@media(max-width:768px){',
    '  .npc-icon{width:38px;height:38px;font-size:1rem;}',
    '  .npc-name{font-size:.36rem;}',
    '  .npc-bubble{position:fixed;top:auto;bottom:80px;left:12px;right:12px;width:auto;transform:none;max-width:100vw;}',
    '  .npc-bubble.bubble-left,.npc-bubble.bubble-right{left:12px;right:12px;transform:translateY(8px);}',
    '  .npc-bubble.bubble-left.active,.npc-bubble.bubble-right.active{transform:translateY(0);}',
    '  .npc-bubble::before{display:none;}',
    '}',
    '@media(max-width:480px){',
    '  .npc-icon{width:34px;height:34px;font-size:.9rem;}',
    '  .npc-bubble{bottom:70px;left:8px;right:8px;}',
    '}'
  ].join('\n');
  document.head.appendChild(style);
}

// ── NPC要素を生成 ──
function createNpcElement(npc){
  var el = document.createElement('div');
  el.className = 'npc-widget side-' + npc.side;
  el.id = npc.id;
  el.setAttribute('data-npc', npc.id);

  var bubbleSide = npc.side === 'left' ? 'bubble-left' : 'bubble-right';

  el.innerHTML =
    '<div class="npc-icon">' + npc.icon + '</div>' +
    '<div class="npc-name">' + npc.name + '</div>' +
    '<div class="npc-bubble ' + bubbleSide + '">' +
      '<div class="npc-bubble-name">' + npc.icon + ' ' + npc.name + '</div>' +
      '<div class="npc-bubble-text"></div>' +
    '</div>';

  // クリックイベント
  el.addEventListener('click', function(e){
    e.stopPropagation();
    toggleBubble(npc, el);
  });

  return el;
}

// ── 吹き出し表示/非表示 ──
function toggleBubble(npc, el){
  var bubble = el.querySelector('.npc-bubble');
  var textEl = el.querySelector('.npc-bubble-text');

  // 既に開いている場合は閉じる
  if(bubble.classList.contains('active')){
    closeBubble(bubble);
    return;
  }

  // 他の吹き出しを閉じる
  closeAllBubbles();

  // ランダムセリフ
  var line = npc.lines[Math.floor(Math.random() * npc.lines.length)];
  textEl.textContent = line;
  bubble.classList.add('active');
  activeNpc = npc.id;

  // 3秒後に自動非表示
  clearTimeout(hideTimer);
  hideTimer = setTimeout(function(){
    closeBubble(bubble);
  }, 3000);
}

function closeBubble(bubble){
  if(bubble) bubble.classList.remove('active');
  activeNpc = null;
  clearTimeout(hideTimer);
}

function closeAllBubbles(){
  var bubbles = document.querySelectorAll('.npc-bubble.active');
  for(var i = 0; i < bubbles.length; i++){
    bubbles[i].classList.remove('active');
  }
  activeNpc = null;
  clearTimeout(hideTimer);
}

// ── NPCを配置 ──
function placeNpcs(){
  NPCS.forEach(function(npc){
    var anchor = document.querySelector(npc.anchor);
    if(!anchor) return;

    // アンカー要素をposition:relativeに
    var cs = window.getComputedStyle(anchor);
    if(cs.position === 'static'){
      anchor.style.position = 'relative';
    }

    var el = createNpcElement(npc);
    anchor.appendChild(el);

    // スクロールで表示するためのIntersectionObserver
    if('IntersectionObserver' in window){
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            el.classList.add('visible');
          }
        });
      }, {threshold: 0.1});
      observer.observe(anchor);
    } else {
      el.classList.add('visible');
    }
  });
}

// ── 画面外クリックで閉じる ──
document.addEventListener('click', function(e){
  if(activeNpc && !e.target.closest('.npc-widget')){
    closeAllBubbles();
  }
});

// ── 初期化 ──
function init(){
  injectCSS();
  placeNpcs();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
