/* ══════════════════════════════════════════════
   投資と思考の書斎 — 品質向上エンハンスメント
   UI効果音・パーティクル・昼夜サイクル・
   マイクロインタラクション・実績・キーボードナビ
   ══════════════════════════════════════════════ */

(function(){
'use strict';

// ── reduced-motion チェック ──
var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ════════════════════════════════════════
// 1. UI効果音システム（Web Audio API合成）
// ════════════════════════════════════════
var UISounds = {
  ctx: null,
  enabled: false,

  init: function(){
    // ユーザー操作後にAudioContext生成
    var self = this;
    var initAudio = function(){
      if(self.ctx) return;
      self.ctx = new (window.AudioContext || window.webkitAudioContext)();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);

    // 音量設定をlocalStorageから
    this.enabled = localStorage.getItem('sfx_enabled') !== 'false';
  },

  // チップチューン風クリック音
  click: function(){
    if(!this.ctx || !this.enabled) return;
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.08);
  },

  // ソフトなホバー音
  hover: function(){
    if(!this.ctx || !this.enabled) return;
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.03);
  },

  // ページ遷移音（上昇アルペジオ）
  navigate: function(){
    if(!this.ctx || !this.enabled) return;
    var self = this;
    [523, 659, 784].forEach(function(freq, i){
      var osc = self.ctx.createOscillator();
      var gain = self.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, self.ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, self.ctx.currentTime + i * 0.07 + 0.12);
      osc.connect(gain).connect(self.ctx.destination);
      osc.start(self.ctx.currentTime + i * 0.07);
      osc.stop(self.ctx.currentTime + i * 0.07 + 0.12);
    });
  },

  // 実績アンロック音（ファンファーレ風）
  achievement: function(){
    if(!this.ctx || !this.enabled) return;
    var self = this;
    [523, 659, 784, 1047].forEach(function(freq, i){
      var osc = self.ctx.createOscillator();
      var gain = self.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.07, self.ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, self.ctx.currentTime + i * 0.1 + 0.2);
      osc.connect(gain).connect(self.ctx.destination);
      osc.start(self.ctx.currentTime + i * 0.1);
      osc.stop(self.ctx.currentTime + i * 0.1 + 0.2);
    });
  }
};

// ════════════════════════════════════════
// 2. パーティクルエフェクト（ヒーロー部分）
// ════════════════════════════════════════
function initParticles(){
  if(reducedMotion) return;
  var hero = document.querySelector('.hero');
  if(!hero) return;

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;opacity:0.7;';
  canvas.width = hero.offsetWidth;
  canvas.height = hero.offsetHeight;
  hero.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var particles = [];
  var PARTICLE_COUNT = 35;

  function createParticle(){
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.2 - Math.random() * 0.4,
      size: Math.random() < 0.3 ? 2 : 1,
      life: 0.3 + Math.random() * 0.7,
      decay: 0.001 + Math.random() * 0.003,
      color: Math.random() < 0.6 ? '212,170,34' : '245,237,224' // gold or parch
    };
  }

  for(var i = 0; i < PARTICLE_COUNT; i++){
    particles.push(createParticle());
  }

  function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var i = particles.length - 1; i >= 0; i--){
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if(p.life <= 0 || p.y < -10){
        particles[i] = createParticle();
        particles[i].y = canvas.height + 5;
        continue;
      }

      ctx.globalAlpha = p.life * 0.6;
      ctx.fillStyle = 'rgba(' + p.color + ',' + p.life + ')';
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();

  // リサイズ対応
  var resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }, 200);
  });
}

// ════════════════════════════════════════
// 3. 昼夜サイクル（実時刻連動）
// ════════════════════════════════════════
function initDayNightCycle(){
  var hour = new Date().getHours();
  var root = document.documentElement;
  var body = document.body;

  // ダークモードが有効なら昼夜サイクルはスキップ
  if(root.getAttribute('data-theme') === 'dark') return;

  var timeLabel = '';

  if(hour >= 5 && hour < 8){
    // 朝（暖かいゴールド）
    root.style.setProperty('--time-overlay', 'rgba(255, 200, 100, 0.03)');
    timeLabel = 'morning';
  } else if(hour >= 8 && hour < 17){
    // 昼（ニュートラル）
    root.style.setProperty('--time-overlay', 'rgba(0, 0, 0, 0)');
    timeLabel = 'day';
  } else if(hour >= 17 && hour < 20){
    // 夕方（暖かいオレンジ）
    root.style.setProperty('--time-overlay', 'rgba(255, 120, 50, 0.03)');
    timeLabel = 'evening';
  } else {
    // 夜（落ち着いたブルー）
    root.style.setProperty('--time-overlay', 'rgba(10, 20, 60, 0.06)');
    timeLabel = 'night';
  }

  // body に時間帯クラスを付与（CSS連携用）
  body.setAttribute('data-time', timeLabel);

  // 時間帯に応じたオーバーレイを追加
  var overlay = document.createElement('div');
  overlay.id = 'time-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:999;' +
    'background:var(--time-overlay);transition:background 2s ease;';
  body.appendChild(overlay);
}

// ════════════════════════════════════════
// 4. マイクロインタラクション強化
// ════════════════════════════════════════
function initMicroInteractions(){

  // 4a. ナビカードのtilt効果
  var cards = document.querySelectorAll('.site-nav-card, .guide-btn, .shelf-item');
  cards.forEach(function(card){
    if(reducedMotion) return;
    card.addEventListener('mouseenter', function(){ UISounds.hover(); });
    card.addEventListener('click', function(){ UISounds.click(); });

    card.addEventListener('mousemove', function(e){
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var tiltX = (y - 0.5) * 4;
      var tiltY = (x - 0.5) * -4;
      card.style.transform = 'perspective(600px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-2px)';
    });

    card.addEventListener('mouseleave', function(){
      card.style.transform = '';
    });
  });

  // 4b. スクロール連動フェードイン（IntersectionObserver）
  if('IntersectionObserver' in window && !reducedMotion){
    var fadeTargets = document.querySelectorAll(
      '.site-nav-card, .shelf-item, .core-card, .horizons-item, ' +
      '.flagship-card, .investor-card, .quote-card'
    );

    fadeTargets.forEach(function(el){
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
    });

    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          // stagger effect（同時に複数見える場合に順番にフェード）
          var siblings = entry.target.parentElement.children;
          var idx = Array.prototype.indexOf.call(siblings, entry.target);
          var delay = Math.min(idx, 8) * 0.06;

          entry.target.style.transitionDelay = delay + 's';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeTargets.forEach(function(el){ observer.observe(el); });
  }

  // 4c. リンククリック時のナビゲーション音
  document.addEventListener('click', function(e){
    var link = e.target.closest('a[href]');
    if(link && !link.href.startsWith('javascript') && !link.getAttribute('href').startsWith('#')){
      UISounds.navigate();
    }
  });

  // 4d. ガイドボタンのホバーグロー
  var style = document.createElement('style');
  style.textContent =
    '.guide-btn{position:relative;overflow:hidden;}' +
    '.guide-btn::after{content:"";position:absolute;top:0;left:-100%;width:100%;height:100%;' +
    'background:linear-gradient(90deg,transparent,rgba(212,170,34,0.06),transparent);' +
    'transition:left 0.4s ease;}' +
    '.guide-btn:hover::after{left:100%;}' +

    /* 引用カードのホバー時左ボーダー */
    '.quote-card{border-left:3px solid transparent;transition:border-color 0.2s,background 0.15s;}' +
    '.quote-card:hover{border-left-color:var(--gold2);}' +

    /* SFXトグルボタン */
    '.sfx-toggle{position:fixed;bottom:70px;right:24px;z-index:200;width:36px;height:36px;' +
    'background:var(--ink);border:1px solid rgba(139,105,20,0.3);border-radius:50%;' +
    'display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.8rem;' +
    'color:var(--gold3);box-shadow:var(--shadow);transition:all 0.2s;opacity:0.6;}' +
    '.sfx-toggle:hover{opacity:1;border-color:var(--gold2);}' +
    '.sfx-toggle.muted{opacity:0.3;}' +

    /* 実績通知 */
    '.achievement-popup{position:fixed;top:20px;right:20px;z-index:10000;' +
    'background:linear-gradient(135deg,var(--ink) 0%,#2a1c0a 100%);' +
    'border:1px solid var(--gold2);padding:14px 20px;min-width:240px;' +
    'box-shadow:0 8px 32px rgba(0,0,0,0.4);transform:translateX(120%);' +
    'transition:transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);}' +
    '.achievement-popup.show{transform:translateX(0);}' +
    '.achievement-popup .ach-icon{font-size:1.4rem;margin-right:10px;float:left;}' +
    '.achievement-popup .ach-label{font-family:var(--mono);font-size:0.46rem;' +
    'color:var(--gold3);letter-spacing:0.14em;margin-bottom:4px;}' +
    '.achievement-popup .ach-title{font-family:var(--serif);font-size:0.92rem;' +
    'font-weight:600;color:var(--parch);}' +
    '.achievement-popup .ach-desc{font-size:0.7rem;color:var(--parch4);margin-top:2px;}' +

    /* 昼夜サイクル用 */
    '[data-time="night"] .hero-video-overlay{' +
    'background:linear-gradient(180deg,rgba(5,5,20,0.6) 0%,rgba(5,5,20,0.35) 50%,rgba(5,5,20,0.65) 100%)!important;}' +
    '[data-time="morning"] .hero-video-overlay::before{' +
    'background:radial-gradient(ellipse 60% 40% at 50% 20%,rgba(255,200,100,0.08) 0%,transparent 60%)!important;}' +

    /* キーボードフォーカス */
    '.site-nav-card:focus-visible,.guide-btn:focus-visible,.shelf-item:focus-visible,' +
    '.horizons-item:focus-visible{outline:2px solid var(--gold3);outline-offset:2px;}';
  document.head.appendChild(style);
}

// ════════════════════════════════════════
// 5. 訪問ジャーナル＋実績システム
// ════════════════════════════════════════
var Journal = {
  KEY: 'library_journal',

  getData: function(){
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || {
        visits: [],
        pages: [],
        achievements: [],
        firstVisit: null,
        totalVisits: 0
      };
    } catch(e){
      return { visits: [], pages: [], achievements: [], firstVisit: null, totalVisits: 0 };
    }
  },

  save: function(data){
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  recordVisit: function(){
    var data = this.getData();
    var now = new Date();
    var today = now.toISOString().split('T')[0];
    var page = window.location.pathname;

    // 初回訪問記録
    if(!data.firstVisit){
      data.firstVisit = now.toISOString();
    }

    data.totalVisits++;

    // 今日の訪問を記録
    if(data.visits.indexOf(today) === -1){
      data.visits.push(today);
    }

    // ページ訪問記録（重複なし）
    if(data.pages.indexOf(page) === -1){
      data.pages.push(page);
    }

    this.save(data);
    return data;
  }
};

var Achievements = {
  DEFS: {
    first_visit:    { title: '初来館',           desc: 'ライブラリを訪問した',            icon: '\uD83D\uDCDA' },
    night_owl:      { title: '夜のライブラリ',   desc: '22時以降に訪問した',              icon: '\uD83E\uDD89' },
    early_bird:     { title: '朝の実践者',       desc: '6時台に訪問した',                 icon: '\uD83C\uDF05' },
    explorer_5:     { title: '探検家',           desc: '5つ以上のページを訪問した',        icon: '\uD83D\uDDFA\uFE0F' },
    explorer_15:    { title: '書斎の常連',       desc: '15以上のページを訪問した',         icon: '\u2B50' },
    week_streak:    { title: '7日間の旅人',      desc: '7日間以上訪問を続けた',           icon: '\uD83D\uDD25' },
    quote_lover:    { title: '言葉の収集家',     desc: '名言をお気に入りに追加した',       icon: '\u2764\uFE0F' },
    dark_reader:    { title: '夜の読書家',       desc: 'ダークモードで読書した',           icon: '\uD83C\uDF19' },
  },

  check: function(data){
    var hour = new Date().getHours();
    var unlocked = [];

    // 初来館
    if(this._tryUnlock(data, 'first_visit')) unlocked.push('first_visit');

    // 夜のライブラリ
    if(hour >= 22 || hour < 4){
      if(this._tryUnlock(data, 'night_owl')) unlocked.push('night_owl');
    }

    // 朝の実践者
    if(hour >= 5 && hour < 7){
      if(this._tryUnlock(data, 'early_bird')) unlocked.push('early_bird');
    }

    // 探検家
    if(data.pages.length >= 5){
      if(this._tryUnlock(data, 'explorer_5')) unlocked.push('explorer_5');
    }

    // 書斎の常連
    if(data.pages.length >= 15){
      if(this._tryUnlock(data, 'explorer_15')) unlocked.push('explorer_15');
    }

    // 7日間の旅人
    if(data.visits.length >= 7){
      if(this._tryUnlock(data, 'week_streak')) unlocked.push('week_streak');
    }

    // ダークモード
    if(document.documentElement.getAttribute('data-theme') === 'dark'){
      if(this._tryUnlock(data, 'dark_reader')) unlocked.push('dark_reader');
    }

    // お気に入り追加チェック
    var favs = JSON.parse(localStorage.getItem('munger_favs') || '[]');
    if(favs.length > 0){
      if(this._tryUnlock(data, 'quote_lover')) unlocked.push('quote_lover');
    }

    if(unlocked.length > 0){
      Journal.save(data);
    }

    return unlocked;
  },

  _tryUnlock: function(data, id){
    if(data.achievements.indexOf(id) === -1){
      data.achievements.push(id);
      return true;
    }
    return false;
  },

  showNotification: function(id){
    var def = this.DEFS[id];
    if(!def) return;

    UISounds.achievement();

    var popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML =
      '<div class="ach-icon">' + def.icon + '</div>' +
      '<div class="ach-label">ACHIEVEMENT UNLOCKED</div>' +
      '<div class="ach-title">' + def.title + '</div>' +
      '<div class="ach-desc">' + def.desc + '</div>';
    document.body.appendChild(popup);

    // アニメーション
    requestAnimationFrame(function(){
      popup.classList.add('show');
    });

    setTimeout(function(){
      popup.classList.remove('show');
      setTimeout(function(){ popup.remove(); }, 500);
    }, 3500);
  }
};

// ════════════════════════════════════════
// 6. キーボードナビゲーション
// ════════════════════════════════════════
function initKeyboardNav(){
  // ナビカードにtabindexを追加
  var navItems = document.querySelectorAll('.site-nav-card, .guide-btn, .shelf-item, .horizons-item');
  navItems.forEach(function(el){
    if(!el.getAttribute('tabindex')){
      el.setAttribute('tabindex', '0');
    }
  });

  // Enterキーでリンクを開く（div要素用）
  document.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && e.target.classList.contains('guide-btn')){
      e.target.click();
    }

    // "/" キーで検索にフォーカス
    if(e.key === '/' && !e.target.matches('input, textarea')){
      var search = document.getElementById('siteSearch') || document.getElementById('guideInput');
      if(search){
        e.preventDefault();
        search.focus();
        search.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Escape で検索からフォーカスを外す
    if(e.key === 'Escape' && e.target.matches('input')){
      e.target.blur();
    }
  });

  // ARIA属性追加
  var guide = document.querySelector('.guide');
  if(guide){
    guide.setAttribute('role', 'navigation');
    guide.setAttribute('aria-label', '書斎の案内人');
  }

  var siteNav = document.querySelector('.site-nav');
  if(siteNav){
    siteNav.setAttribute('role', 'navigation');
    siteNav.setAttribute('aria-label', '書斎を探索する');
  }
}

// ════════════════════════════════════════
// 7. SFXトグルボタン
// ════════════════════════════════════════
function initSFXToggle(){
  var btn = document.createElement('button');
  btn.className = 'sfx-toggle' + (UISounds.enabled ? '' : ' muted');
  btn.title = '効果音 ON/OFF';
  btn.setAttribute('aria-label', '効果音の切り替え');
  btn.textContent = UISounds.enabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
  btn.addEventListener('click', function(){
    UISounds.enabled = !UISounds.enabled;
    localStorage.setItem('sfx_enabled', UISounds.enabled);
    btn.classList.toggle('muted', !UISounds.enabled);
    btn.textContent = UISounds.enabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
    if(UISounds.enabled) UISounds.click();
  });
  document.body.appendChild(btn);
}

// ════════════════════════════════════════
// 8. イージング強化CSS
// ════════════════════════════════════════
function injectEasingCSS(){
  var style = document.createElement('style');
  style.textContent =
    /* カード系のトランジション改善 */
    '.site-nav-card{transition:all 0.3s cubic-bezier(0.22, 1, 0.36, 1);}' +
    '.site-nav-card:hover{transform:translateY(-3px) scale(1.01);}' +

    '.shelf-item{transition:all 0.25s cubic-bezier(0.22, 1, 0.36, 1);}' +
    'a.shelf-item:hover{transform:translateX(4px);}' +

    '.horizons-item{transition:all 0.25s cubic-bezier(0.22, 1, 0.36, 1);}' +
    '.horizons-item:hover{transform:translateY(-2px);}' +

    '.core-card{transition:all 0.25s cubic-bezier(0.22, 1, 0.36, 1);}' +
    '.core-card:hover{transform:translateX(4px);}' +

    /* ヒーローCTAボタン */
    '.hero-cta-primary,.hero-cta-secondary,.hero-cta-tertiary{' +
    'transition:all 0.25s cubic-bezier(0.22, 1, 0.36, 1);}' +
    '.hero-cta-primary:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(139,105,20,0.3);}' +
    '.hero-cta-secondary:hover,.hero-cta-tertiary:hover{transform:translateY(-2px);}' +

    /* スクロールトップボタン */
    '.scroll-top{transition:all 0.3s cubic-bezier(0.22, 1, 0.36, 1);}' +
    '.scroll-top:hover{transform:scale(1.1);}' +

    /* ガイドボタン */
    '.guide-btn{transition:all 0.2s cubic-bezier(0.22, 1, 0.36, 1);}' +
    '.guide-btn:hover{transform:translateX(6px);}' +

    /* フェードイン基礎アニメーション */
    '@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}' +
    '@keyframes fadeScale{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}' +

    /* ヒーロー要素のエントランスアニメーション */
    '.hero-title{animation:slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;}' +
    '.hero-tagline{animation:slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;}' +
    '.hero-message{animation:slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both;}' +
    '.hero-cta-row{animation:slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.55s both;}' +
    '.hero-stats{animation:fadeScale 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.7s both;}';

  document.head.appendChild(style);
}

// ════════════════════════════════════════
// 9. ページ遷移エフェクト
// ════════════════════════════════════════
function initPageTransitions(){
  if(reducedMotion) return;

  // フェードカーテン要素
  var curtain = document.createElement('div');
  curtain.id = 'page-curtain';
  curtain.style.cssText =
    'position:fixed;inset:0;z-index:9999;pointer-events:none;' +
    'background:var(--ink);opacity:0;transition:opacity 0.35s cubic-bezier(0.22,1,0.36,1);';
  document.body.appendChild(curtain);

  // ページロード時にフェードイン
  curtain.style.opacity = '1';
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      curtain.style.opacity = '0';
    });
  });

  // 内部リンククリック時にフェードアウト→遷移
  document.addEventListener('click', function(e){
    var link = e.target.closest('a[href]');
    if(!link) return;

    var href = link.getAttribute('href');
    // 外部リンク、ハッシュ、javascript、新しいタブを除外
    if(!href || href.startsWith('#') || href.startsWith('javascript') ||
       href.startsWith('http') || link.target === '_blank') return;

    var absoluteUrl = link.href; // ブラウザが解決した絶対URL
    e.preventDefault();
    curtain.style.opacity = '1';
    curtain.style.pointerEvents = 'all';

    setTimeout(function(){
      window.location.href = absoluteUrl;
    }, 300);
  });
}

// ════════════════════════════════════════
// 10. ツールチップシステム
// ════════════════════════════════════════
function initTooltips(){
  // ツールチップデータ
  var tips = {
    'hajimete/':     '投資初心者向け。判断基準を育てる第一歩',
    'moat/':         '企業の競争優位性を6種類のレンズで分析',
    'industries/':   '14業種の構造・特性を俯瞰する',
    'hajimete/memo/':'個別銘柄の分析メモ。思考の記録',
    'research/':     '時間が経っても読み返せる深掘り記事',
    'news/':         '投資家視点のニュース解説',
    'fcf/':          'フリーキャッシュフローの本質を理解する',
    'principles/':   '8つの投資原則。判断の軸を持つ',
    'companies/':    '69社の企業分析データベース',
    'horizons/':     '投資を超えた教養と思想の世界',
    'people/':       '品位と知的誠実さで選んだ人物録',
    'morning-method/':'朝の1時間を最高の投資にする実践法',
    'morning-practice/':'3分で整える朝の実践室',
    'book-guide/':   '投資家のための読書・音声ガイド',
    'classics/':     '古典と先人の知恵から学ぶ',
    'reading-routes/':'目的別の読書ルート案内',
    'life-shelf/':   '人生の書架。生き方を深める',
    'thinkers/':     '思考の案内人たち。8人のレンズ',
    'night-reading/':'夜の読書室。静かに考える時間',
    'glossary/':     '投資用語集。50以上の用語を解説',
  };

  // ツールチップ要素
  var tooltip = document.createElement('div');
  tooltip.id = 'nav-tooltip';
  tooltip.style.cssText =
    'position:fixed;z-index:8000;pointer-events:none;' +
    'background:var(--ink);color:var(--parch3);border:1px solid var(--gold)44;' +
    'padding:6px 12px;font-size:0.7rem;font-family:var(--jp);' +
    'max-width:220px;line-height:1.6;letter-spacing:0.02em;' +
    'opacity:0;transform:translateY(4px);' +
    'transition:opacity 0.2s,transform 0.2s cubic-bezier(0.22,1,0.36,1);' +
    'box-shadow:0 4px 16px rgba(0,0,0,0.3);';
  document.body.appendChild(tooltip);

  var showTimer = null;

  document.addEventListener('mouseover', function(e){
    var link = e.target.closest('a[href]');
    if(!link) return;

    var href = link.getAttribute('href');
    var tipText = tips[href];
    if(!tipText) return;

    clearTimeout(showTimer);
    showTimer = setTimeout(function(){
      tooltip.textContent = tipText;
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateY(0)';
    }, 400);

    // 位置追従
    var updatePos = function(ev){
      tooltip.style.left = Math.min(ev.clientX + 12, window.innerWidth - 240) + 'px';
      tooltip.style.top = (ev.clientY + 18) + 'px';
    };
    updatePos(e);
    link._tooltipMove = updatePos;
    link.addEventListener('mousemove', updatePos);
  });

  document.addEventListener('mouseout', function(e){
    var link = e.target.closest('a[href]');
    if(!link) return;
    clearTimeout(showTimer);
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(4px)';
    if(link._tooltipMove){
      link.removeEventListener('mousemove', link._tooltipMove);
      link._tooltipMove = null;
    }
  });
}

// ════════════════════════════════════════
// 11. おかえりなさいバナー
// ════════════════════════════════════════
function initWelcomeback(){
  var data = Journal.getData();

  // 初回訪問 or 2回目以降
  if(!data.firstVisit || data.totalVisits < 2) return;

  var daysSinceFirst = Math.floor(
    (Date.now() - new Date(data.firstVisit).getTime()) / (1000 * 60 * 60 * 24)
  );
  var pagesVisited = data.pages.length;
  var achievementCount = data.achievements.length;

  // 名前（オンボーディングから）
  var name = '';
  try { var _t = JSON.parse(localStorage.getItem('library_traveler')); if(_t && _t.name) name = _t.name; } catch(e){}
  if(!name) name = localStorage.getItem('ob_name') || '';
  var greeting = name ? (name + 'さん、') : '';

  // 時間帯に応じた挨拶
  var hour = new Date().getHours();
  var timeGreeting = '';
  if(hour >= 5 && hour < 12) timeGreeting = 'おはようございます。';
  else if(hour >= 12 && hour < 18) timeGreeting = 'こんにちは。';
  else timeGreeting = 'こんばんは。';

  var text = greeting + timeGreeting + '<span style="color:var(--gold3);">おかえりなさい。</span>';

  // ガイドラベルの横にインライン表示
  var guideLabel = document.querySelector('.guide-label');
  if(guideLabel){
    var wb = document.createElement('span');
    wb.id = 'welcomeback-inline';
    wb.style.cssText =
      'font-family:var(--serif);font-size:0.78rem;color:var(--parch3);' +
      'margin-left:12px;letter-spacing:0;opacity:0;transition:opacity 0.6s ease;';
    wb.innerHTML = text;
    guideLabel.style.display = 'flex';
    guideLabel.style.alignItems = 'baseline';
    guideLabel.style.justifyContent = 'center';
    guideLabel.style.gap = '8px';
    guideLabel.appendChild(wb);
    setTimeout(function(){ wb.style.opacity = '1'; }, 100);
  }
}

// ════════════════════════════════════════
// 12. 読書進捗バー（スクロール連動）
// ════════════════════════════════════════
function initReadingProgress(){
  var bar = document.createElement('div');
  bar.id = 'reading-progress';
  bar.style.cssText =
    'position:fixed;top:0;left:0;height:2px;z-index:9998;' +
    'background:linear-gradient(90deg,var(--gold),var(--gold3),var(--gold4));' +
    'width:0;transition:width 0.1s linear;pointer-events:none;' +
    'box-shadow:0 0 6px rgba(212,170,34,0.3);';
  document.body.appendChild(bar);

  var ticking = false;
  window.addEventListener('scroll', function(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = Math.min(progress, 100) + '%';
      ticking = false;
    });
  });
}

// ════════════════════════════════════════
// 13. ヒーロー統計カウントアップアニメーション
// ════════════════════════════════════════
function initCountUp(){
  if(reducedMotion) return;

  var statNums = document.querySelectorAll('.hero-stat-num');
  if(!statNums.length) return;

  var animated = false;

  function animateNumbers(){
    if(animated) return;
    animated = true;

    statNums.forEach(function(el){
      var target = parseInt(el.textContent, 10);
      if(isNaN(target)) return;

      var start = 0;
      var duration = 1200;
      var startTime = null;

      el.textContent = '0';

      function step(timestamp){
        if(!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var t = Math.min(elapsed / duration, 1);
        // easeOutCubic
        var eased = 1 - Math.pow(1 - t, 3);
        var current = Math.round(start + (target - start) * eased);
        el.textContent = current;
        if(t < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  }

  // IntersectionObserverでヒーローが見えたらカウント開始
  if('IntersectionObserver' in window){
    var heroStats = document.querySelector('.hero-stats');
    if(heroStats){
      var obs = new IntersectionObserver(function(entries){
        if(entries[0].isIntersecting){
          setTimeout(animateNumbers, 300);
          obs.disconnect();
        }
      }, { threshold: 0.5 });
      obs.observe(heroStats);
    }
  } else {
    setTimeout(animateNumbers, 500);
  }
}

// ════════════════════════════════════════
// 14. 名言ローテーション（タイプライター演出）
// ════════════════════════════════════════
function initQuoteTypewriter(){
  var quoteSection = document.querySelector('.featured-quote');
  if(!quoteSection) return;

  var textEl = quoteSection.querySelector('.fq-text');
  var authorEl = quoteSection.querySelector('.fq-author');
  if(!textEl) return;

  // 名言プール（index.htmlのQUOTES配列から代表的なものを選択）
  var featuredQuotes = [
    { text: '素晴らしい企業を公正な価格で買うほうが、公正な企業を素晴らしい価格で買うよりはるかに良い。', author: 'Charlie Munger' },
    { text: '他人が貪欲なときに恐れ、他人が恐れているときに貪欲になれ。', author: 'Warren Buffett' },
    { text: '株を買う最良の時期は、あなたが良い企業を見つけたときだ。', author: 'Philip Fisher' },
    { text: '逆から考えよ。常に逆から考えよ。問題を逆転させると、解決策が見えてくることが多い。', author: 'Charlie Munger' },
    { text: '10年間保有する意思がない株は、10分間でも保有すべきではない。', author: 'Warren Buffett' },
    { text: '読書は最も確かな自己投資だ。知識は複利で効いてくる。', author: 'Charlie Munger' },
    { text: 'リスクとは、自分が何をしているか分からないことから生まれる。', author: 'Warren Buffett' },
    { text: '偉大な企業の株を売るべき理由はほとんどない。忍耐こそが最大のリターンをもたらす。', author: 'Philip Fisher' },
  ];

  var currentIdx = 0;
  var typewriterTimer = null;

  function typewrite(text, callback){
    var i = 0;
    textEl.textContent = '';
    textEl.style.opacity = '1';

    function addChar(){
      if(i < text.length){
        textEl.textContent += text[i];
        i++;
        typewriterTimer = setTimeout(addChar, reducedMotion ? 0 : 30);
      } else {
        if(callback) callback();
      }
    }
    addChar();
  }

  function showNextQuote(){
    currentIdx = (currentIdx + 1) % featuredQuotes.length;
    var q = featuredQuotes[currentIdx];

    // フェードアウト
    textEl.style.opacity = '0';
    if(authorEl) authorEl.style.opacity = '0';

    setTimeout(function(){
      if(authorEl){
        authorEl.textContent = '— ' + q.author;
        authorEl.style.opacity = '1';
      }
      typewrite(q.text);
    }, 400);
  }

  // クリックで次の名言
  quoteSection.addEventListener('click', function(e){
    e.preventDefault();
    clearTimeout(typewriterTimer);
    UISounds.click();
    showNextQuote();
  });

  // 15秒ごとに自動ローテーション
  setInterval(showNextQuote, 15000);
}

// ════════════════════════════════════════
// 15. ビネット効果（画面周辺を暗く）
// ════════════════════════════════════════
function initVignette(){
  if(reducedMotion) return;

  var vignette = document.createElement('div');
  vignette.id = 'vignette';
  vignette.style.cssText =
    'position:fixed;inset:0;z-index:998;pointer-events:none;' +
    'background:radial-gradient(ellipse 70% 65% at 50% 50%,transparent 50%,rgba(10,8,4,0.15) 100%);';
  document.body.appendChild(vignette);
}

// ════════════════════════════════════════
// 16. スムーズスクロールインジケーター
// ════════════════════════════════════════
function initSectionIndicator(){
  var sections = [
    { selector: '.hero', label: 'TOP' },
    { selector: '.guide', label: 'GUIDE' },
    { selector: '.site-nav', label: 'EXPLORE' },
    { selector: '.shelves', label: 'SHELVES' },
    { selector: '.core-reads', label: 'READS' },
    { selector: '.horizons', label: 'HORIZONS' },
    { selector: '.footer', label: 'END' },
  ];

  // 現在のセクションを検出して表示する小さなインジケーター
  var indicator = document.createElement('div');
  indicator.id = 'section-indicator';
  indicator.style.cssText =
    'position:fixed;right:12px;top:50%;transform:translateY(-50%);z-index:800;' +
    'display:flex;flex-direction:column;gap:8px;align-items:flex-end;';

  var dots = [];
  sections.forEach(function(sec, i){
    var el = document.querySelector(sec.selector);
    if(!el) return;

    var dot = document.createElement('div');
    dot.title = sec.label;
    dot.style.cssText =
      'width:4px;height:4px;border-radius:50%;' +
      'background:var(--gold3);opacity:0.2;cursor:pointer;' +
      'transition:all 0.3s cubic-bezier(0.22,1,0.36,1);';

    dot.addEventListener('click', function(){
      el.scrollIntoView({ behavior: 'smooth' });
      UISounds.click();
    });

    // ホバーでラベル表示
    dot.addEventListener('mouseenter', function(){
      dot.style.width = 'auto';
      dot.style.height = 'auto';
      dot.style.padding = '2px 8px';
      dot.style.borderRadius = '8px';
      dot.style.fontSize = '0.46rem';
      dot.style.fontFamily = 'var(--mono)';
      dot.style.color = 'var(--parch)';
      dot.style.background = 'var(--ink)';
      dot.style.border = '1px solid var(--gold)44';
      dot.style.opacity = '1';
      dot.textContent = sec.label;
    });
    dot.addEventListener('mouseleave', function(){
      dot.style.cssText =
        'width:4px;height:4px;border-radius:50%;' +
        'background:var(--gold3);opacity:' + (dot._active ? '0.8' : '0.2') + ';cursor:pointer;' +
        'transition:all 0.3s cubic-bezier(0.22,1,0.36,1);';
      if(dot._active){
        dot.style.width = '6px';
        dot.style.height = '6px';
      }
      dot.textContent = '';
    });

    indicator.appendChild(dot);
    dots.push({ dot: dot, el: el });
  });

  if(dots.length > 0){
    document.body.appendChild(indicator);

    // スクロールで現在セクションを追跡
    var ticking2 = false;
    window.addEventListener('scroll', function(){
      if(ticking2) return;
      ticking2 = true;
      requestAnimationFrame(function(){
        var scrollMid = window.scrollY + window.innerHeight / 2;
        dots.forEach(function(d){
          var rect = d.el.getBoundingClientRect();
          var elTop = rect.top + window.scrollY;
          var elBot = elTop + rect.height;
          var isActive = scrollMid >= elTop && scrollMid < elBot;
          d.dot._active = isActive;
          d.dot.style.opacity = isActive ? '0.8' : '0.2';
          if(isActive){
            d.dot.style.width = '6px';
            d.dot.style.height = '6px';
          } else {
            d.dot.style.width = '4px';
            d.dot.style.height = '4px';
          }
        });
        ticking2 = false;
      });
    });
  }
}

// ════════════════════════════════════════
// 初期化
// ════════════════════════════════════════
function init(){
  UISounds.init();
  injectEasingCSS();
  initDayNightCycle();
  initParticles();
  initMicroInteractions();
  initKeyboardNav();
  initSFXToggle();
  initPageTransitions();
  initTooltips();
  initWelcomeback();
  initReadingProgress();
  initCountUp();
  initQuoteTypewriter();
  initVignette();
  initSectionIndicator();

  // ジャー���ル記録 + 実績チェック
  var journalData = Journal.recordVisit();
  var newAchievements = Achievements.check(journalData);

  // 実績通知（複数あれば順番に表示）
  newAchievements.forEach(function(id, i){
    setTimeout(function(){
      Achievements.showNotification(id);
    }, i * 4000 + 500);
  });
}

// DOMContentLoaded or 即実行
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
