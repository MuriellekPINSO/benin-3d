(function () {
  // À l'intérieur d'un iframe (voyage.html embarque cotonou.html et ouidah.html),
  // seule la page hôte joue le son : sinon les deux pistes se superposent.
  if (window.self !== window.top) return;

  var LEVEL = 0.32, FADE_IN = 1200, FADE_OUT = 420, KEY = 'benin3d:sound';
  // Sur les pages avec un bandeau de lieux en bas d'écran, le bouton remonte
  // pour ne pas se poser sur le texte fin ou les boutons de la visite.
  var BOTTOM = (document.currentScript && document.currentScript.dataset.bottom) || '16px';

  function readPref() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function writePref(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var audio = document.createElement('audio');
  audio.loop = true;
  audio.preload = 'none';
  ['/audio/ambience.m4a', '/audio/ambience.mp3'].forEach(function (src) {
    var s = document.createElement('source');
    s.src = src;
    s.type = src.endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg';
    audio.appendChild(s);
  });
  document.body.appendChild(audio);

  var style = document.createElement('style');
  style.textContent =
    '#ambience-toggle{position:fixed;right:16px;bottom:calc(env(safe-area-inset-bottom,0px) + ' + BOTTOM + ');z-index:20;' +
    'display:flex;align-items:center;gap:8px;appearance:none;border:1px solid rgba(255,255,255,.18);' +
    'background:rgba(10,14,13,.72);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#EAF4EF;' +
    'font:600 12px/1 "Instrument Sans",system-ui,sans-serif;padding:10px 13px;border-radius:999px;cursor:pointer}' +
    '#ambience-toggle:hover{background:rgba(78,157,110,.28)}' +
    '#ambience-toggle .b{display:flex;align-items:flex-end;gap:2px;height:11px}' +
    '#ambience-toggle .b i{width:2px;background:currentColor;opacity:.45;height:4px;display:block}' +
    '#ambience-toggle[aria-pressed="true"] .b i{opacity:1;animation:ambience-bar 900ms ease-in-out infinite}' +
    '#ambience-toggle .b i:nth-child(2){animation-delay:.15s}#ambience-toggle .b i:nth-child(3){animation-delay:.3s}#ambience-toggle .b i:nth-child(4){animation-delay:.45s}' +
    '@keyframes ambience-bar{0%,100%{height:4px}50%{height:11px}}';
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.id = 'ambience-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-pressed', 'false');
  btn.innerHTML = 'Sound<span class="b" aria-hidden><i></i><i></i><i></i><i></i></span>';
  document.body.appendChild(btn);

  var raf = 0;
  function fadeTo(target, ms, done) {
    cancelAnimationFrame(raf);
    var from = audio.volume, start = performance.now();
    function step(now) {
      var t = Math.min(1, Math.max(0, (now - start) / ms));
      audio.volume = Math.min(1, Math.max(0, from + (target - from) * t));
      if (t < 1) raf = requestAnimationFrame(step);
      else if (done) done();
    }
    raf = requestAnimationFrame(step);
  }
  function setPlaying(p) { btn.setAttribute('aria-pressed', p ? 'true' : 'false'); }
  function start() {
    audio.volume = 0;
    return audio.play().then(function () {
      fadeTo(LEVEL, FADE_IN);
      setPlaying(true);
      return true;
    }).catch(function () { return false; });
  }
  function stop() {
    fadeTo(0, FADE_OUT, function () { audio.pause(); });
    setPlaying(false);
  }

  if (readPref() !== 'off') {
    start().then(function (ok) {
      if (ok) return;
      var events = ['pointerdown', 'keydown', 'touchstart'];
      function onGesture(e) {
        if (btn.contains(e.target)) return;
        events.forEach(function (t) { window.removeEventListener(t, onGesture); });
        start();
      }
      events.forEach(function (t) { window.addEventListener(t, onGesture, { passive: true }); });
    });
  }

  btn.addEventListener('click', function () {
    if (btn.getAttribute('aria-pressed') === 'true') { stop(); writePref('off'); }
    else start().then(function (ok) { if (ok) writePref('on'); });
  });
})();
