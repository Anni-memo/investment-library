/* ═══════════════════════════════════════════════════════
   Onboarding — 書庫の旅人 3問オンボーディング
   投資と思考の書斎
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ---------- LocalStorage ---------- */
  var LS_KEY = 'library_traveler';

  /* ---------- 既存の旧キーからの移行 ---------- */
  function migrateOldKeys() {
    var oldDone = localStorage.getItem('ob_done');
    var oldName = localStorage.getItem('ob_name');
    if (oldDone === '1' && !localStorage.getItem(LS_KEY)) {
      var data = {
        version: 1,
        name: oldName || '',
        avatar: { type: 'traveler', colorIdx: 0 },
        companion: 'candle',
        title: '放浪の旅人',
        currentRoom: 'hub',
        visitedRooms: ['hub'],
        npcTalked: [],
        onboardingDone: true,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(LS_KEY, JSON.stringify(data));
      localStorage.removeItem('ob_done');
      localStorage.removeItem('ob_name');
      localStorage.removeItem('ob_route');
    }
  }
  migrateOldKeys();

  /* ---------- 既に完了済みなら「おかえりなさい」表示だけ ---------- */
  var existing = null;
  try { existing = JSON.parse(localStorage.getItem(LS_KEY)); } catch(e) {}
  if (existing && existing.onboardingDone) {
    showWelcomeBack(existing);
    return;
  }

  /* ====================================================
     質問データ
     ==================================================== */
  var questions = [
    {
      id: 1,
      text: 'この書庫で、今日は何を探しますか',
      sub: '最初の一歩を選んでください',
      choices: [
        { label: '朝を整える言葉', key: 'morning' },
        { label: '投資の判断基準', key: 'invest' },
        { label: '企業分析のヒント', key: 'company' },
        { label: '人物の生き方', key: 'people' },
        { label: '教養と古典', key: 'culture' },
        { label: '今日読む一篇', key: 'reading' }
      ]
    },
    {
      id: 2,
      text: '今のあなたに、いちばん近い気分はどれですか',
      sub: 'あなたの今の心に合わせてご案内します',
      choices: [
        { label: '静かに考えたい', key: 'quiet' },
        { label: 'まず一歩進みたい', key: 'step' },
        { label: '深く学びたい', key: 'deep' },
        { label: '誰かの思想に触れたい', key: 'thought' },
        { label: '少し話したい', key: 'talk' },
        { label: 'まだ迷っている', key: 'lost' }
      ]
    },
    {
      id: 3,
      text: 'ここで、どんな人になりたいですか',
      sub: 'あなたの旅の方角が決まります',
      choices: [
        { label: '冷静に判断できる人', key: 'calm' },
        { label: '深く読む人', key: 'reader' },
        { label: '企業を見抜ける人', key: 'analyst' },
        { label: '習慣を整えられる人', key: 'habit' },
        { label: '品のある投資家', key: 'elegant' },
        { label: '自分の原則を持つ人', key: 'principle' }
      ]
    }
  ];

  /* ====================================================
     結果生成ロジック
     ==================================================== */

  /* アバター6系統 */
  function resolveAvatar(a) {
    var q1 = a[1], q2 = a[2], q3 = a[3];
    if (q3 === 'calm' || q2 === 'quiet') return { type: 'sage', title: '静観の賢者' };
    if (q3 === 'reader' || q1 === 'culture') return { type: 'researcher', title: '探究の研究者' };
    if (q2 === 'step' || q2 === 'lost') return { type: 'traveler', title: '放浪の旅人' };
    if (q3 === 'analyst' || q1 === 'company') return { type: 'scribe', title: '分析の書記官' };
    if (q1 === 'morning' || q3 === 'habit') return { type: 'practitioner', title: '朝の実践者' };
    if (q3 === 'elegant' || q1 === 'invest') return { type: 'merchant', title: '思慮深い商人' };
    // fallback
    return { type: 'traveler', title: '放浪の旅人' };
  }

  /* モンスター相棒5種 */
  function resolveCompanion(a) {
    var q1 = a[1], q2 = a[2], q3 = a[3];
    if (q1 === 'culture' || q3 === 'reader') return { key: 'book_spirit', name: '本の精霊' };
    if (q1 === 'invest' || q1 === 'company') return { key: 'gold_keeper', name: '金貨の守り手' };
    if (q2 === 'quiet' || q1 === 'morning') return { key: 'candle', name: '蝋燭の火' };
    if (q2 === 'thought' || q1 === 'people') return { key: 'quill_bird', name: '羽ペン鳥' };
    if (q3 === 'habit' || q3 === 'principle') return { key: 'clock_keeper', name: '時計の番人' };
    // fallback
    return { key: 'candle', name: '蝋燭の火' };
  }

  /* 初期スポーン部屋（Q1から） */
  function resolveRoom(q1) {
    var map = {
      morning: 'morning-method',
      invest: 'principles',
      company: 'companies',
      people: 'people',
      culture: 'horizons',
      reading: 'hub'
    };
    return map[q1] || 'hub';
  }

  /* 部屋のURL */
  function roomUrl(room) {
    var urls = {
      'morning-method': 'morning-method/',
      'principles': 'principles/',
      'companies': 'companies/',
      'people': 'people/',
      'horizons': 'horizons/',
      'hub': ''
    };
    return urls[room] || '';
  }

  /* 部屋の日本語名 */
  function roomLabel(room) {
    var labels = {
      'morning-method': 'モーニングメソッド室',
      'principles': '投資原則の間',
      'companies': '企業分析書架',
      'people': '入口ホール',
      'horizons': '古典と思想の棚',
      'hub': '中央広間'
    };
    return labels[room] || '中央広間';
  }

  /* ====================================================
     CSS 注入
     ==================================================== */
  var style = document.createElement('style');
  style.textContent = [
    '/* --- Onboarding Overlay --- */',
    '#ob-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(26,18,8,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .5s ease;font-family:var(--jp,"Noto Serif JP","Cormorant Garamond",serif)}',
    '#ob-overlay.show{opacity:1}',
    '#ob-card{position:relative;width:92%;max-width:520px;background:var(--parch,#f5ede0);border:1px solid var(--parch3,#e8d8be);border-radius:14px;box-shadow:0 20px 60px rgba(26,18,8,.45);padding:40px 32px 32px;text-align:center;transform:translateY(30px) scale(.96);opacity:0;transition:transform .5s cubic-bezier(.22,1,.36,1),opacity .5s ease;max-height:90vh;overflow-y:auto}',
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
    '.ob-choices{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px}',
    '.ob-choice{display:flex;align-items:center;justify-content:center;padding:14px 12px;border:1.5px solid var(--parch3,#e8d8be);border-radius:10px;background:var(--parch2,#efe4d0);cursor:pointer;transition:border-color .25s,background .25s,transform .15s;font-size:.88rem;color:var(--ink,#1a1208);text-align:center}',
    '.ob-choice:hover{border-color:var(--gold,#8b6914);background:var(--parch,#f5ede0);transform:translateY(-2px)}',

    '/* skip */',
    '#ob-skip{display:inline-block;margin-top:4px;font-size:.8rem;color:var(--ink3,#4a3520);opacity:.5;cursor:pointer;border:none;background:none;font-family:inherit;transition:opacity .2s}',
    '#ob-skip:hover{opacity:.9;text-decoration:underline}',

    '/* result */',
    '#ob-result{display:none}',
    '#ob-result h2{font-size:1rem;color:var(--ink3,#4a3520);margin:0 0 16px;font-family:var(--jp)}',
    '.ob-result-box{background:var(--parch2,#efe4d0);border:1px solid var(--parch3,#e8d8be);border-radius:10px;padding:24px 20px;margin-bottom:20px;text-align:left;line-height:1.9}',
    '.ob-result-title{font-size:1.1rem;font-weight:700;color:var(--ink,#1a1208);margin-bottom:8px;font-family:var(--serif,"Cormorant Garamond",serif)}',
    '.ob-result-line{font-size:.85rem;color:var(--ink2,#2d2010);margin-bottom:4px}',
    '.ob-result-line strong{color:var(--gold,#8b6914)}',
    '.ob-result-room{font-size:.88rem;color:var(--ink3,#4a3520);font-style:italic;margin-top:8px}',
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
    '#ob-welcome .ob-wb-title{font-size:.75rem;color:var(--ink3,#4a3520);margin-top:2px}',

    '/* fade-out */',
    '#ob-overlay.hide{opacity:0;pointer-events:none}',

    '/* responsive */',
    '@media(max-width:540px){#ob-card{padding:28px 18px 22px}#ob-question{font-size:1.1rem}.ob-choices{grid-template-columns:1fr;}.ob-choice{padding:12px 14px;font-size:.85rem}}'
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
    '    <h2>あなたの旅が始まります</h2>',
    '    <div class="ob-result-box" id="ob-result-box"></div>',
    '    <div id="ob-name-section">',
    '      <label>旅の名前を教えてください（任意）</label>',
    '      <input id="ob-name-input" type="text" placeholder="ニックネーム" maxlength="20">',
    '    </div>',
    '    <button class="ob-go" id="ob-go">書庫に入る</button>',
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
  var elResultBox = document.getElementById('ob-result-box');
  var elGo = document.getElementById('ob-go');
  var elSkip = document.getElementById('ob-skip');
  var elNameInput = document.getElementById('ob-name-input');

  /* ---------- 状態 ---------- */
  var current = 0;
  var answers = {};
  var resolvedData = null;

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
      btn.textContent = c.label;
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
    var avatar = resolveAvatar(answers);
    var companion = resolveCompanion(answers);
    var room = resolveRoom(answers[1]);

    resolvedData = {
      avatar: avatar,
      companion: companion,
      room: room
    };

    elBody.style.display = 'none';
    elSkip.style.display = 'none';
    elResult.style.display = 'block';

    elResultBox.innerHTML = [
      '<div class="ob-result-title">あなたは今、「' + avatar.title + '」として書庫に入りました。</div>',
      '<div class="ob-result-line">相棒：<strong>' + companion.name + '</strong></div>',
      '<div class="ob-result-room">まずは' + roomLabel(room) + 'から歩きましょう。</div>'
    ].join('');

    renderDots();
  }

  /* ---------- 書庫に入る ---------- */
  elGo.addEventListener('click', function () {
    var name = (elNameInput.value || '').trim();
    var data = {
      version: 1,
      name: name,
      avatar: { type: resolvedData.avatar.type, colorIdx: 0 },
      companion: resolvedData.companion.key,
      title: resolvedData.avatar.title,
      currentRoom: resolvedData.room,
      visitedRooms: [resolvedData.room],
      npcTalked: [],
      onboardingDone: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    closeOverlay(function () {
      var url = roomUrl(resolvedData.room);
      if (url) {
        window.location.href = url;
      }
    });
  });

  /* ---------- スキップ ---------- */
  elSkip.addEventListener('click', function () {
    var data = {
      version: 1,
      name: '',
      avatar: { type: 'traveler', colorIdx: 0 },
      companion: 'candle',
      title: '放浪の旅人',
      currentRoom: 'hub',
      visitedRooms: ['hub'],
      npcTalked: [],
      onboardingDone: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(LS_KEY, JSON.stringify(data));
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
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      overlay.classList.add('show');
    });
  });

  /* ====================================================
     おかえりなさい表示
     ==================================================== */
  function showWelcomeBack(traveler) {
    if (!traveler.name) return;
    var wb = document.createElement('div');
    wb.id = 'ob-welcome';
    var html = 'おかえりなさい、<span class="ob-wb-name">' + escapeHtml(traveler.name) + '</span>さん';
    if (traveler.title) {
      html += '<div class="ob-wb-title">' + escapeHtml(traveler.title) + '</div>';
    }
    wb.innerHTML = html;
    document.body.appendChild(wb);
    setTimeout(function () { wb.classList.add('show'); }, 600);
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
