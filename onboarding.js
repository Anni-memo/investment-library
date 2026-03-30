/* ═══════════════════════════════════════════════════════
   Onboarding — 旅人アバター 3問ルート案内
   投資と思考の書斎
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ---------- LocalStorage keys ---------- */
  var LS_DONE = 'ob_done';
  var LS_NAME = 'ob_name';
  var LS_ROUTE = 'ob_route';

  /* ---------- 既に完了済みなら「おかえりなさい」表示だけ ---------- */
  if (localStorage.getItem(LS_DONE) === '1') {
    showWelcomeBack();
    return;
  }

  /* ====================================================
     質問データ
     ==================================================== */
  var questions = [
    {
      id: 1,
      text: 'あなたが今いちばん知りたいのは？',
      sub: 'まずは興味のある方向を教えてください',
      choices: [
        { label: '投資の基本を学びたい', icon: '📖', key: 'basic' },
        { label: '企業を分析する力をつけたい', icon: '🔍', key: 'analysis' },
        { label: '思考や教養を深めたい', icon: '🌿', key: 'horizon' }
      ]
    },
    {
      id: 2,
      text: 'どのくらい投資に触れてきましたか？',
      sub: '経験レベルに合ったコンテンツを案内します',
      choices: [
        { label: 'まだ始めていない', icon: '🌱', key: 'beginner' },
        { label: '少し経験がある', icon: '🌾', key: 'intermediate' },
        { label: '5年以上やっている', icon: '🌳', key: 'advanced' }
      ]
    },
    {
      id: 3,
      text: '読み方の好みは？',
      sub: 'あなたに合ったスタイルで案内します',
      choices: [
        { label: '短い記事をさくさく', icon: '⚡', key: 'quick' },
        { label: '一冊の本のように順番に', icon: '📚', key: 'sequential' },
        { label: '気になるところから自由に', icon: '🗺️', key: 'free' }
      ]
    }
  ];

  /* ====================================================
     ルート決定ロジック
     ==================================================== */
  function resolveRoute(answers) {
    // answers = { 1: key, 2: key, 3: key }
    var q1 = answers[1];
    var q2 = answers[2];
    var q3 = answers[3];

    // Q3 が最優先でスタイル分岐
    if (q3 === 'sequential') return { url: 'reading-routes/', label: '読書ルート', desc: '体系的に順番に読み進められるルートです' };
    if (q3 === 'free') return { url: '', label: 'トップページ（棚一覧）', desc: '自由に気になる棚を巡ってみてください' };

    // Q1 × Q2 のマトリクス
    if (q1 === 'basic' || q2 === 'beginner') return { url: 'hajimete/', label: 'はじめての投資', desc: '投資の基本から丁寧に学べるコーナーです' };
    if (q1 === 'analysis') {
      if (q2 === 'advanced') return { url: 'analysis-template/', label: '企業分析テンプレート', desc: '実践的な分析フレームワークを活用できます' };
      return { url: 'moat/', label: '競争優位性（Moat）', desc: '企業の「堀」を見抜く力を養います' };
    }
    if (q1 === 'horizon') return { url: 'horizons/', label: '知の水平線', desc: '投資を超えた教養と思考の世界へ' };
    if (q2 === 'intermediate') return { url: 'principles/', label: '投資原則', desc: 'バフェット・マンガーの原則を学びます' };
    if (q2 === 'advanced') return { url: 'fcf/', label: 'FCF分析', desc: 'フリーキャッシュフローの深い分析へ' };

    return { url: 'reading-routes/', label: '読書ルート', desc: 'おすすめの読書コースをご用意しました' };
  }

  /* ====================================================
     CSS 注入
     ==================================================== */
  var style = document.createElement('style');
  style.textContent = [
    '/* --- Onboarding Overlay --- */',
    '#ob-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(26,18,8,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .5s ease;font-family:var(--jp,"Noto Serif JP","Cormorant Garamond",serif)}',
    '#ob-overlay.show{opacity:1}',
    '#ob-card{position:relative;width:92%;max-width:520px;background:var(--parch,#f5ede0);border:1px solid var(--parch3,#e8d8be);border-radius:14px;box-shadow:0 20px 60px rgba(26,18,8,.45);padding:40px 32px 32px;text-align:center;transform:translateY(30px) scale(.96);opacity:0;transition:transform .5s cubic-bezier(.22,1,.36,1),opacity .5s ease}',
    '#ob-overlay.show #ob-card{transform:translateY(0) scale(1);opacity:1}',

    '/* progress */',
    '#ob-progress{display:flex;justify-content:center;gap:8px;margin-bottom:24px}',
    '.ob-dot{width:10px;height:10px;border-radius:50%;background:var(--parch3,#e8d8be);transition:background .3s,transform .3s}',
    '.ob-dot.active{background:var(--gold,#8b6914);transform:scale(1.25)}',
    '.ob-dot.done{background:var(--gold3,#d4aa22)}',

    '/* question */',
    '#ob-question{font-size:1.25rem;font-weight:600;color:var(--ink,#1a1208);margin:0 0 6px;line-height:1.5}',
    '#ob-sub{font-size:.85rem;color:var(--ink3,#4a3520);margin:0 0 24px;opacity:.7}',

    '/* choices */',
    '.ob-choices{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}',
    '.ob-choice{display:flex;align-items:center;gap:12px;padding:14px 18px;border:1.5px solid var(--parch3,#e8d8be);border-radius:10px;background:var(--parch2,#efe4d0);cursor:pointer;transition:border-color .25s,background .25s,transform .15s;font-size:.95rem;color:var(--ink,#1a1208);text-align:left}',
    '.ob-choice:hover{border-color:var(--gold,#8b6914);background:var(--parch,#f5ede0);transform:translateX(4px)}',
    '.ob-choice .ob-icon{font-size:1.3rem;flex-shrink:0}',

    '/* skip */',
    '#ob-skip{display:inline-block;margin-top:4px;font-size:.8rem;color:var(--ink3,#4a3520);opacity:.5;cursor:pointer;border:none;background:none;font-family:inherit;transition:opacity .2s}',
    '#ob-skip:hover{opacity:.9;text-decoration:underline}',

    '/* result */',
    '#ob-result{display:none}',
    '#ob-result h2{font-size:1.15rem;color:var(--ink,#1a1208);margin:0 0 8px;font-family:var(--serif,"Cormorant Garamond",serif)}',
    '#ob-result .ob-route-name{display:inline-block;font-size:1.4rem;font-weight:700;color:var(--gold,#8b6914);margin:8px 0;font-family:var(--serif,"Cormorant Garamond",serif)}',
    '#ob-result .ob-route-desc{font-size:.88rem;color:var(--ink3,#4a3520);margin:0 0 20px}',
    '#ob-result .ob-go{display:inline-block;padding:12px 32px;border:none;border-radius:8px;background:var(--gold,#8b6914);color:var(--parch,#f5ede0);font-size:.95rem;font-family:inherit;cursor:pointer;transition:background .25s,transform .15s}',
    '#ob-result .ob-go:hover{background:var(--gold2,#b8900a);transform:scale(1.03)}',

    '/* name input */',
    '#ob-name-section{margin-bottom:20px}',
    '#ob-name-section label{display:block;font-size:.88rem;color:var(--ink3,#4a3520);margin-bottom:8px}',
    '#ob-name-input{width:70%;max-width:240px;padding:10px 14px;border:1.5px solid var(--parch3,#e8d8be);border-radius:8px;background:var(--parch2,#efe4d0);font-size:1rem;font-family:var(--jp);color:var(--ink,#1a1208);text-align:center;outline:none;transition:border-color .25s}',
    '#ob-name-input:focus{border-color:var(--gold,#8b6914)}',
    '#ob-name-input::placeholder{color:var(--ink3,#4a3520);opacity:.4}',

    '/* welcome back */',
    '#ob-welcome{position:fixed;top:16px;right:16px;z-index:9998;background:var(--parch,#f5ede0);border:1px solid var(--parch3,#e8d8be);border-radius:10px;padding:12px 20px;box-shadow:0 4px 20px rgba(26,18,8,.18);font-family:var(--jp);font-size:.9rem;color:var(--ink,#1a1208);opacity:0;transform:translateY(-12px);transition:opacity .5s,transform .5s;pointer-events:none}',
    '#ob-welcome.show{opacity:1;transform:translateY(0);pointer-events:auto}',
    '#ob-welcome .ob-wb-name{color:var(--gold,#8b6914);font-weight:600}',

    '/* fade-out */',
    '#ob-overlay.hide{opacity:0;pointer-events:none}',

    '/* responsive */',
    '@media(max-width:540px){#ob-card{padding:28px 18px 22px}#ob-question{font-size:1.1rem}.ob-choice{padding:12px 14px;font-size:.9rem}}'
  ].join('\n');
  document.head.appendChild(style);

  /* ====================================================
     DOM 構築
     ==================================================== */
  var overlay = document.createElement('div');
  overlay.id = 'ob-overlay';
  overlay.innerHTML = [
    '<div id="ob-card">',
    '  <div id="ob-progress"></div>',
    '  <div id="ob-body">',
    '    <p id="ob-question"></p>',
    '    <p id="ob-sub"></p>',
    '    <div class="ob-choices" id="ob-choices"></div>',
    '  </div>',
    '  <div id="ob-result">',
    '    <h2>あなたへのおすすめルート</h2>',
    '    <div class="ob-route-name" id="ob-route-label"></div>',
    '    <p class="ob-route-desc" id="ob-route-desc"></p>',
    '    <div id="ob-name-section">',
    '      <label>旅の名前を教えてください（任意）</label>',
    '      <input id="ob-name-input" type="text" placeholder="ニックネーム" maxlength="20">',
    '    </div>',
    '    <button class="ob-go" id="ob-go">このルートへ進む</button>',
    '  </div>',
    '  <button id="ob-skip">スキップして自由に探索する</button>',
    '</div>'
  ].join('\n');
  document.body.appendChild(overlay);

  /* ---------- 要素参照 ---------- */
  var elProgress = document.getElementById('ob-progress');
  var elQuestion = document.getElementById('ob-question');
  var elSub = document.getElementById('ob-sub');
  var elChoices = document.getElementById('ob-choices');
  var elBody = document.getElementById('ob-body');
  var elResult = document.getElementById('ob-result');
  var elRouteLabel = document.getElementById('ob-route-label');
  var elRouteDesc = document.getElementById('ob-route-desc');
  var elGo = document.getElementById('ob-go');
  var elSkip = document.getElementById('ob-skip');
  var elNameInput = document.getElementById('ob-name-input');

  /* ---------- 状態 ---------- */
  var current = 0;
  var answers = {};
  var resolvedRoute = null;

  /* ---------- プログレスドット ---------- */
  function renderDots() {
    elProgress.innerHTML = '';
    for (var i = 0; i < questions.length; i++) {
      var dot = document.createElement('span');
      dot.className = 'ob-dot';
      if (i < current) dot.className += ' done';
      if (i === current) dot.className += ' active';
      elProgress.appendChild(dot);
    }
  }

  /* ---------- 質問描画 ---------- */
  function renderQuestion(idx) {
    var q = questions[idx];
    elQuestion.textContent = 'Q' + q.id + '. ' + q.text;
    elSub.textContent = q.sub;
    elChoices.innerHTML = '';
    q.choices.forEach(function (c) {
      var btn = document.createElement('button');
      btn.className = 'ob-choice';
      btn.innerHTML = '<span class="ob-icon">' + c.icon + '</span><span>' + c.label + '</span>';
      btn.addEventListener('click', function () {
        answers[q.id] = c.key;
        next();
      });
      elChoices.appendChild(btn);
    });
    renderDots();
  }

  /* ---------- 次へ / 結果表示 ---------- */
  function next() {
    current++;
    if (current >= questions.length) {
      showResult();
      return;
    }
    // アニメーション付き切替
    elBody.style.opacity = '0';
    elBody.style.transform = 'translateX(24px)';
    setTimeout(function () {
      renderQuestion(current);
      elBody.style.transition = 'opacity .35s, transform .35s';
      elBody.style.opacity = '1';
      elBody.style.transform = 'translateX(0)';
    }, 200);
  }

  function showResult() {
    resolvedRoute = resolveRoute(answers);
    elBody.style.display = 'none';
    elSkip.style.display = 'none';
    elResult.style.display = 'block';
    elRouteLabel.textContent = resolvedRoute.label;
    elRouteDesc.textContent = resolvedRoute.desc;
    renderDots();
  }

  /* ---------- ルートへ進む ---------- */
  elGo.addEventListener('click', function () {
    var name = (elNameInput.value || '').trim();
    if (name) localStorage.setItem(LS_NAME, name);
    localStorage.setItem(LS_DONE, '1');
    if (resolvedRoute) localStorage.setItem(LS_ROUTE, resolvedRoute.url);
    closeOverlay(function () {
      if (resolvedRoute && resolvedRoute.url) {
        window.location.href = resolvedRoute.url;
      }
    });
  });

  /* ---------- スキップ ---------- */
  elSkip.addEventListener('click', function () {
    localStorage.setItem(LS_DONE, '1');
    closeOverlay();
  });

  /* ---------- オーバーレイ開閉 ---------- */
  function closeOverlay(cb) {
    overlay.classList.add('hide');
    setTimeout(function () {
      overlay.remove();
      if (cb) cb();
    }, 500);
  }

  /* ---------- 表示開始 ---------- */
  renderQuestion(0);
  // 少し遅延してフェードイン
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      overlay.classList.add('show');
    });
  });

  /* ====================================================
     おかえりなさい表示
     ==================================================== */
  function showWelcomeBack() {
    var name = localStorage.getItem(LS_NAME);
    if (!name) return;
    var wb = document.createElement('div');
    wb.id = 'ob-welcome';
    wb.innerHTML = 'おかえりなさい、<span class="ob-wb-name">' + escapeHtml(name) + '</span>さん';
    document.body.appendChild(wb);
    setTimeout(function () { wb.classList.add('show'); }, 600);
    // 5秒後に自動フェードアウト
    setTimeout(function () {
      wb.classList.remove('show');
      setTimeout(function () { wb.remove(); }, 600);
    }, 5600);
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }

})();
