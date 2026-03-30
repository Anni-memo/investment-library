/* ══════════════════════════════════════════════
   語り部NPC — 投資と思考の書斎
   各人物ページに名言・思想を対話形式で紹介する
   ══════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 人物データ ── */
  var DATA = {
    'tanaka-kei': {
      name: '田中渓',
      quotes: [
        { text: '投資とは、世の中の変化を読み、未来に資本を配分すること', link: '../../principles/', linkLabel: '原則の棚' },
        { text: '朝を制する者が1日を制する', link: '../../morning-practice/', linkLabel: '朝の実践' },
        { text: '身体は資産。走ることで判断の質が上がる', link: '../../morning-method/', linkLabel: '朝の設計法' }
      ]
    },
    'bnf': {
      name: 'BNF',
      quotes: [
        { text: 'チャートは過去、需給は現在、仮説は未来', link: '../../principles/', linkLabel: '原則の棚' },
        { text: '損切りを躊躇しない。それが生き残る条件', link: '../../principles/stop-loss/', linkLabel: '損切りの原則' },
        { text: '孤独であることが集中力の源泉', link: '../../horizons/stoicism/', linkLabel: 'ストア哲学' }
      ]
    },
    'inamori-kazuo': {
      name: '稲盛和夫',
      quotes: [
        { text: '利他の心で経営すれば、結果は必ずついてくる', link: '../../principles/', linkLabel: '原則の棚' },
        { text: '動機善なりや、私心なかりしか', link: '../../life-shelf/', linkLabel: '生活の棚' },
        { text: '一日一日をど真剣に生きる', link: '../../morning-practice/', linkLabel: '朝の実践' },
        { text: '楽観的に構想し、悲観的に計画し、楽観的に実行する', link: '../../analysis-template/', linkLabel: '分析テンプレート' }
      ]
    },
    'taleb': {
      name: 'ナシーム・タレブ',
      quotes: [
        { text: '脆さの反対は頑丈さではない。反脆弱性だ', link: '../../horizons/', linkLabel: '思考の地平' },
        { text: 'ブラック・スワンは予測できない。だから備える', link: '../../principles/', linkLabel: '原則の棚' },
        { text: '皮膚を賭けよ。自分のリスクを取れ', link: '../../principles/circle-of-competence/', linkLabel: '能力の輪' }
      ]
    },
    'seneca': {
      name: 'セネカ',
      quotes: [
        { text: '時間を浪費する者は、人生を浪費する', link: '../../morning-practice/', linkLabel: '朝の実践' },
        { text: '運命が望まない者を引きずる。望む者を導く', link: '../../horizons/stoicism/', linkLabel: 'ストア哲学' },
        { text: '怒りは短い狂気である', link: '../../human/loss-aversion/', linkLabel: '損失回避の心理' }
      ]
    }
  };

  /* ── URLパスから人物キーを検出 ── */
  var path = window.location.pathname;
  var key = null;
  var keys = Object.keys(DATA);
  for (var i = 0; i < keys.length; i++) {
    if (path.indexOf('/people/' + keys[i]) !== -1) {
      key = keys[i];
      break;
    }
  }
  if (!key) return;

  var person = DATA[key];
  var currentIndex = 0;

  /* ── CSS注入 ── */
  var style = document.createElement('style');
  style.textContent = [
    /* トリガーボタン */
    '.narrator-trigger{',
    '  position:fixed;bottom:24px;right:24px;z-index:9990;',
    '  width:52px;height:52px;border-radius:50%;',
    '  background:var(--ink,#1a1208);border:1.5px solid var(--gold3,#d4aa22);',
    '  cursor:pointer;display:flex;align-items:center;justify-content:center;',
    '  box-shadow:0 4px 20px rgba(26,18,8,.4);',
    '  transition:all .25s ease;',
    '  font-size:22px;color:var(--gold3,#d4aa22);',
    '}',
    '.narrator-trigger:hover{',
    '  transform:scale(1.08);',
    '  box-shadow:0 6px 28px rgba(212,170,34,.25);',
    '  border-color:var(--gold4,#f0cc55);',
    '}',
    '.narrator-trigger.active{',
    '  background:var(--gold3,#d4aa22);color:var(--ink,#1a1208);',
    '}',

    /* パネル */
    '.narrator-panel{',
    '  position:fixed;bottom:88px;right:24px;z-index:9989;',
    '  width:340px;max-width:calc(100vw - 48px);',
    '  background:var(--ink,#1a1208);',
    '  border:1px solid rgba(212,170,34,.2);',
    '  box-shadow:0 8px 40px rgba(26,18,8,.55);',
    '  opacity:0;visibility:hidden;',
    '  transform:translateY(12px);',
    '  transition:opacity .3s ease,transform .3s ease,visibility .3s;',
    '  font-family:"Noto Serif JP",serif;',
    '}',
    '.narrator-panel.open{',
    '  opacity:1;visibility:visible;transform:translateY(0);',
    '}',

    /* パネルヘッダー */
    '.narrator-header{',
    '  display:flex;align-items:center;justify-content:space-between;',
    '  padding:14px 16px 10px;',
    '  border-bottom:1px solid rgba(212,170,34,.1);',
    '}',
    '.narrator-label{',
    '  font-family:"DM Mono",monospace;font-size:.56rem;',
    '  color:var(--gold3,#d4aa22);letter-spacing:.18em;opacity:.7;',
    '}',
    '.narrator-close{',
    '  background:none;border:none;cursor:pointer;',
    '  color:var(--parch4,#dfc9a8);font-size:1rem;',
    '  padding:0 2px;line-height:1;opacity:.5;transition:opacity .2s;',
    '}',
    '.narrator-close:hover{opacity:1;}',

    /* パネルボディ */
    '.narrator-body{padding:16px;}',

    /* 名言テキスト */
    '.narrator-quote{',
    '  font-size:.88rem;color:var(--parch,#f5ede0);',
    '  line-height:1.9;font-weight:300;',
    '  min-height:60px;margin-bottom:14px;',
    '}',
    '.narrator-quote::before{',
    '  content:"\u300C";color:var(--gold3,#d4aa22);',
    '}',
    '.narrator-quote-text{}',
    '.narrator-quote::after{',
    '  content:"\u300D";color:var(--gold3,#d4aa22);',
    '}',

    /* 棚リンク */
    '.narrator-shelf-link{',
    '  display:inline-flex;align-items:center;gap:6px;',
    '  font-family:"DM Mono",monospace;font-size:.62rem;',
    '  color:var(--gold3,#d4aa22);text-decoration:none;',
    '  letter-spacing:.06em;padding:5px 12px;',
    '  border:1px solid rgba(212,170,34,.15);',
    '  background:rgba(212,170,34,.04);',
    '  transition:all .2s;margin-bottom:16px;',
    '}',
    '.narrator-shelf-link:hover{',
    '  border-color:rgba(212,170,34,.35);',
    '  background:rgba(212,170,34,.08);',
    '}',
    '.narrator-shelf-link::before{content:"\u2192 ";}',

    /* フッター（ナビゲーション） */
    '.narrator-footer{',
    '  display:flex;align-items:center;justify-content:space-between;',
    '  padding:10px 16px 14px;',
    '  border-top:1px solid rgba(212,170,34,.08);',
    '}',
    '.narrator-counter{',
    '  font-family:"DM Mono",monospace;font-size:.52rem;',
    '  color:var(--parch4,#dfc9a8);opacity:.5;letter-spacing:.1em;',
    '}',
    '.narrator-next{',
    '  background:none;border:1px solid rgba(212,170,34,.2);',
    '  color:var(--gold3,#d4aa22);',
    '  font-family:"DM Mono",monospace;font-size:.58rem;',
    '  letter-spacing:.08em;padding:6px 16px;cursor:pointer;',
    '  transition:all .2s;',
    '}',
    '.narrator-next:hover{',
    '  background:rgba(212,170,34,.08);',
    '  border-color:rgba(212,170,34,.35);',
    '}',

    /* タイプライター用カーソル */
    '.narrator-cursor{',
    '  display:inline-block;width:2px;height:1em;',
    '  background:var(--gold3,#d4aa22);',
    '  margin-left:2px;vertical-align:text-bottom;',
    '  animation:narrator-blink .7s step-end infinite;',
    '}',
    '@keyframes narrator-blink{0%,100%{opacity:1;}50%{opacity:0;}}',

    /* モバイル対応 */
    '@media(max-width:480px){',
    '  .narrator-trigger{bottom:16px;right:16px;width:46px;height:46px;font-size:19px;}',
    '  .narrator-panel{bottom:74px;right:16px;width:calc(100vw - 32px);}',
    '  .narrator-quote{font-size:.82rem;}',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  /* ── DOM構築 ── */

  /* トリガーボタン */
  var trigger = document.createElement('div');
  trigger.className = 'narrator-trigger';
  trigger.setAttribute('role', 'button');
  trigger.setAttribute('aria-label', '語り部を開く');
  trigger.setAttribute('tabindex', '0');
  trigger.innerHTML = '\uD83D\uDCD6'; // 書物マーク
  document.body.appendChild(trigger);

  /* パネル */
  var panel = document.createElement('div');
  panel.className = 'narrator-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', person.name + 'の語り部');

  var header = document.createElement('div');
  header.className = 'narrator-header';
  var label = document.createElement('span');
  label.className = 'narrator-label';
  label.textContent = person.name + ' \u306E\u8A00\u8449'; // の言葉
  var closeBtn = document.createElement('button');
  closeBtn.className = 'narrator-close';
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.innerHTML = '&times;';
  header.appendChild(label);
  header.appendChild(closeBtn);

  var body = document.createElement('div');
  body.className = 'narrator-body';
  var quoteEl = document.createElement('div');
  quoteEl.className = 'narrator-quote';
  var quoteText = document.createElement('span');
  quoteText.className = 'narrator-quote-text';
  quoteEl.insertBefore(quoteText, quoteEl.childNodes[0] ? quoteEl.childNodes[0].nextSibling : null);
  // ::before と ::after で鉤括弧を付けるので、テキストだけ挿入
  quoteEl.innerHTML = '';
  quoteEl.appendChild(quoteText);

  var shelfLink = document.createElement('a');
  shelfLink.className = 'narrator-shelf-link';
  body.appendChild(quoteEl);
  body.appendChild(shelfLink);

  var footer = document.createElement('div');
  footer.className = 'narrator-footer';
  var counter = document.createElement('span');
  counter.className = 'narrator-counter';
  var nextBtn = document.createElement('button');
  nextBtn.className = 'narrator-next';
  nextBtn.textContent = '\u6B21\u306E\u8A00\u8449\u3078'; // 次の言葉へ
  footer.appendChild(counter);
  footer.appendChild(nextBtn);

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);
  document.body.appendChild(panel);

  /* ── タイプライター表示 ── */
  var typeTimer = null;
  function typewrite(el, text, callback) {
    if (typeTimer) clearTimeout(typeTimer);
    el.textContent = '';
    var cursor = document.createElement('span');
    cursor.className = 'narrator-cursor';
    el.appendChild(cursor);
    var idx = 0;
    function tick() {
      if (idx < text.length) {
        el.insertBefore(document.createTextNode(text[idx]), cursor);
        idx++;
        typeTimer = setTimeout(tick, 28 + Math.random() * 18);
      } else {
        // タイピング完了、カーソル消去
        setTimeout(function () {
          if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
          if (callback) callback();
        }, 400);
      }
    }
    tick();
  }

  /* ── 名言を表示 ── */
  function showQuote(index) {
    var q = person.quotes[index];
    counter.textContent = (index + 1) + ' / ' + person.quotes.length;
    shelfLink.href = q.link;
    shelfLink.textContent = q.linkLabel;
    shelfLink.style.display = 'none';
    typewrite(quoteText, q.text, function () {
      shelfLink.style.display = '';
    });
  }

  /* ── 開閉制御 ── */
  var isOpen = false;

  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    trigger.classList.add('active');
    showQuote(currentIndex);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
    trigger.classList.remove('active');
    if (typeTimer) clearTimeout(typeTimer);
  }

  trigger.addEventListener('click', function () {
    if (isOpen) { closePanel(); } else { openPanel(); }
  });
  trigger.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen) { closePanel(); } else { openPanel(); }
    }
  });

  closeBtn.addEventListener('click', function () {
    closePanel();
  });

  nextBtn.addEventListener('click', function () {
    currentIndex = (currentIndex + 1) % person.quotes.length;
    showQuote(currentIndex);
  });

  /* ESCで閉じる */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

})();
