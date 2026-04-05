/* ══════════════════════════════════════════════
   MyNote FAB — 全ページ共通メモ機能
   localStorage で日付別にメモを保存。
   どのページでも同じメモが共有される。
   ══════════════════════════════════════════════ */

(function(){
'use strict';

// ── CSS注入 ──
var css = [
'.mynote-fab{position:fixed;bottom:90px;right:42px;z-index:200;cursor:pointer;transition:transform .2s,filter .2s;filter:drop-shadow(0 4px 12px rgba(26,18,8,.4));}',
'.mynote-fab:hover{transform:translateY(-3px);filter:drop-shadow(0 6px 16px rgba(26,18,8,.5));}',
'.mynote-fab-paper{width:42px;height:52px;background:linear-gradient(135deg,#f5ede0 0%,#efe4d0 100%);border:1px solid #dfc9a8;border-radius:2px 6px 2px 2px;position:relative;box-shadow:1px 2px 6px rgba(26,18,8,.2);}',
'.mynote-fab-paper::before{content:"";position:absolute;top:0;right:0;width:10px;height:10px;background:linear-gradient(135deg,#dfc9a8 50%,#efe4d0 50%);border-bottom-left-radius:4px;}',
'.mynote-fab-lines{position:absolute;top:16px;left:8px;right:8px;}',
'.mynote-fab-lines span{display:block;height:1px;background:#dfc9a8;margin-bottom:5px;}',
'.mynote-fab-text{position:absolute;bottom:5px;left:0;right:0;text-align:center;font-family:var(--mono,monospace);font-size:6px;color:var(--gold,#8b6914);letter-spacing:.15em;opacity:.7;}',
'.mynote-fab-streak{position:absolute;top:-6px;right:-6px;background:var(--gold3,#d4aa22);color:var(--ink,#1a1208);font-family:var(--mono,monospace);font-size:8px;font-weight:700;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(26,18,8,.3);}',
'.mynote-panel{display:none;position:fixed;bottom:90px;right:42px;width:380px;max-height:80vh;background:var(--parch,#f5ede0);border:1px solid var(--parch3,#e8d8be);box-shadow:0 4px 24px rgba(26,18,8,.18);z-index:201;border-radius:4px;overflow:hidden;}',
'.mynote-panel.open{display:flex;flex-direction:column;}',
'.mynote-panel-header{background:var(--ink,#1a1208);padding:12px 16px;display:flex;align-items:center;justify-content:space-between;}',
'[data-theme="dark"] .mynote-panel-header{background:#0d0a04;}',
'.mynote-panel-title{font-family:var(--mono,monospace);font-size:.52rem;color:var(--gold3,#d4aa22);letter-spacing:.15em;}',
'.mynote-panel-close{background:none;border:none;color:var(--parch4,#dfc9a8);font-size:1.1rem;cursor:pointer;padding:0 4px;transition:color .15s;}',
'.mynote-panel-close:hover{color:var(--gold4,#f0cc55);}',
'.mynote-panel-body{padding:16px;overflow-y:auto;flex:1;background-image:repeating-linear-gradient(transparent,transparent 27px,var(--parch3,#e8d8be) 27px,var(--parch3,#e8d8be) 28px);background-size:100% 28px;background-position:0 12px;}',
'.mynote-card-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;}',
'.mynote-card-nav-btn{background:none;border:1px solid var(--parch3,#e8d8be);color:var(--ink3,#4a3520);cursor:pointer;padding:4px 8px;font-size:.7rem;border-radius:3px;transition:all .15s;}',
'.mynote-card-nav-btn:hover{border-color:var(--gold,#8b6914);color:var(--gold,#8b6914);}',
'.mynote-card-date{font-family:var(--mono,monospace);font-size:.52rem;color:var(--gold,#8b6914);letter-spacing:.1em;}',
'.mynote-card-status{display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:8px;border-top:1px solid var(--parch3,#e8d8be);}',
'.mynote-card-saved{font-family:var(--mono,monospace);font-size:.42rem;color:var(--gold,#8b6914);opacity:.6;}',
'.mynote-card-wordcount{font-family:var(--mono,monospace);font-size:.42rem;color:var(--ink3,#4a3520);opacity:.5;}',
'@media(max-width:600px){.mynote-fab{bottom:70px;right:16px;}.mynote-panel{right:8px;left:8px;width:auto;bottom:70px;}}'
].join('\n');

var style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

// ── HTML注入 ──
var fab = document.createElement('div');
fab.id = 'mynoteFab';
fab.className = 'mynote-fab';
fab.innerHTML = '<div class="mynote-fab-paper"><div class="mynote-fab-lines"><span></span><span></span><span></span></div><div class="mynote-fab-text">NOTE</div><div class="mynote-fab-streak"></div></div>';

var panel = document.createElement('div');
panel.id = 'mynotePanel';
panel.className = 'mynote-panel';
panel.innerHTML =
  '<div class="mynote-panel-header"><div class="mynote-panel-title">MY NOTE</div><button class="mynote-panel-close">&times;</button></div>' +
  '<div class="mynote-panel-body">' +
    '<div class="mynote-card-nav"><button class="mynote-card-nav-btn">&larr;</button><div class="mynote-card-date"></div><button class="mynote-card-nav-btn">&rarr;</button></div>' +
    '<textarea style="width:100%;min-height:160px;border:1px solid var(--parch3,#e8d8be);background:transparent;font-family:var(--jp,serif);font-size:.82rem;color:var(--ink,#1a1208);padding:12px;resize:vertical;outline:none;" placeholder="気づいたこと、考えたことを書き留めよう..."></textarea>' +
    '<div class="mynote-card-status"><div class="mynote-card-saved"></div><div class="mynote-card-wordcount">0 chars</div></div>' +
  '</div>';

document.body.appendChild(fab);
document.body.appendChild(panel);

// ── ロジック ──
var STORAGE_PREFIX = 'myNote_';
var today = new Date();
var currentViewDate = new Date(today);
var saveTimer = null;

var textarea = panel.querySelector('textarea');
var dateLabel = panel.querySelector('.mynote-card-date');
var savedLabel = panel.querySelector('.mynote-card-saved');
var wcLabel = panel.querySelector('.mynote-card-wordcount');
var streakBadge = fab.querySelector('.mynote-fab-streak');
var navBtns = panel.querySelectorAll('.mynote-card-nav-btn');

function dateKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
function isFuture(d) {
  var t = new Date(); t.setHours(0,0,0,0);
  var c = new Date(d); c.setHours(0,0,0,0);
  return c > t;
}
function loadNote() {
  var key = dateKey(currentViewDate);
  dateLabel.textContent = key;
  textarea.value = localStorage.getItem(STORAGE_PREFIX + key) || '';
  updateWC();
  updateStreak();
}
function saveNote() {
  var key = dateKey(currentViewDate);
  localStorage.setItem(STORAGE_PREFIX + key, textarea.value);
  savedLabel.textContent = 'saved ' + new Date().toLocaleTimeString();
  updateStreak();
}
function updateWC() {
  wcLabel.textContent = textarea.value.length + ' chars';
}
function updateStreak() {
  var streak = 0;
  var d = new Date(today);
  while(true) {
    var v = localStorage.getItem(STORAGE_PREFIX + dateKey(d));
    if (v && v.trim()) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  streakBadge.textContent = streak > 0 ? streak : '';
  streakBadge.style.display = streak > 0 ? 'flex' : 'none';
}

fab.addEventListener('click', function(){ panel.classList.toggle('open'); if(panel.classList.contains('open')) loadNote(); });
panel.querySelector('.mynote-panel-close').addEventListener('click', function(){ panel.classList.remove('open'); });
navBtns[0].addEventListener('click', function(){ currentViewDate.setDate(currentViewDate.getDate()-1); loadNote(); });
navBtns[1].addEventListener('click', function(){ if(!isFuture(new Date(currentViewDate.getTime()+86400000))){ currentViewDate.setDate(currentViewDate.getDate()+1); loadNote(); } });
textarea.addEventListener('input', function(){ clearTimeout(saveTimer); saveTimer = setTimeout(saveNote, 500); updateWC(); });

loadNote();

})();
