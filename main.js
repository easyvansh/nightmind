// Nightmind Screensaver · Studio (with minimal dock + extra theme)
(() => {
  const STORAGE_KEY = 'nightmind-saver-v5';

  const state = {
    theme: 'space',      // space | nebula | void | dust | aurora | ocean | fireflies | sakura
    mood: 'calm',        // calm | flow | alive
    showClock: true,
    showQuotes: true,
    extraDark: false,
    motion: 1,           // 0 low | 1 medium | 2 high
    density: 1,          // 0 low | 1 medium | 2 high
    dockCollapsed: false // full dock vs minimal dock
  };

  // Restore from localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch (_) {}

  // Canvas setup ----------------------------------------------------
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let DPR = window.devicePixelRatio || 1;
  let w = window.innerWidth;
  let h = window.innerHeight;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    DPR = window.devicePixelRatio || 1;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', () => {
    resize();
    initThemeData();
  });

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  // Idle handling ---------------------------------------------------
  const IDLE_MS = 30000;
  let idleTimer;
  function resetIdle() {
    document.body.classList.remove('is-idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => document.body.classList.add('is-idle'), IDLE_MS);
  }
  ['mousemove','mousedown','keydown','touchstart'].forEach(evt => {
    window.addEventListener(evt, resetIdle, { passive:true });
  });
  resetIdle();

  // Fullscreen shortcut ---------------------------------------------
  window.addEventListener('keydown', e => {
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  });

  // Clock -----------------------------------------------------------
  const clockOverlay = document.getElementById('clock-overlay');
  const clockTime = document.getElementById('clock-time');
  const clockDate = document.getElementById('clock-date');

  function updateClock() {
    const now = new Date();
    clockTime.textContent = now.toLocaleTimeString([], {
      hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
    });
    clockDate.textContent = now.toLocaleDateString([], {
      weekday:'short', month:'short', day:'numeric', year:'numeric'
    });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Quotes ----------------------------------------------------------
  const quotes = [
    "Simplicity is the place where complexity goes to rest.",
    "Attention is a quiet form of love.",
    "In the darkness, every small light is a universe.",
    "You are not behind; you are mid-chapter.",
    "The quieter the room, the louder your inner life.",
    "Tonight belongs to one honest intention."
  ];
  const quoteOverlay = document.getElementById('quote-overlay');
  const quoteText = document.getElementById('quote-text');
  const quoteAuthor = document.getElementById('quote-author');

  function newQuote() {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    quoteText.textContent = `“${q}”`;
    quoteAuthor.textContent = 'Nightmind';
  }
  newQuote();
  setInterval(newQuote, 25000);

  // Overlay visibility ----------------------------------------------
  function applyOverlayVisibility() {
    clockOverlay.classList.toggle('hiddenOverlay', !state.showClock);
    quoteOverlay.classList.toggle('hiddenOverlay', !state.showQuotes);
  }
  applyOverlayVisibility();

  // Keyboard shortcuts (clock/quote/theme/menu) ---------------------
  window.addEventListener('keydown', e => {
    if (e.key === 'c' || e.key === 'C') {
      state.showClock = !state.showClock;
      applyOverlayVisibility();
      syncUI();
      save();
    } else if (e.key === 'q' || e.key === 'Q') {
      state.showQuotes = !state.showQuotes;
      applyOverlayVisibility();
      syncUI();
      save();
    } else if (e.key === 't' || e.key === 'T') {
      const order = ['space','nebula','void','dust','aurora','ocean','fireflies','sakura'];
      const idx = order.indexOf(state.theme);
      const next = order[(idx + 1) % order.length];
      state.theme = next;
      initThemeData();
      syncUI();
      save();
      animateThemeBadge();
    } else if (e.key === 'm' || e.key === 'M') {
      // toggle dock mode
      state.dockCollapsed = !state.dockCollapsed;
      syncDockMode();
      save();
    }
  });

  // UI references ---------------------------------------------------
  const panelBadgeText = document.getElementById('panel-badge-text');
  const themeGroup = document.getElementById('theme-group');
  const moodGroup = document.getElementById('mood-group');
  const toggleGroup = document.getElementById('toggle-group');
  const motionSlider = document.getElementById('motion-slider');
  const densitySlider = document.getElementById('density-slider');
  const motionLabel = document.getElementById('motion-label');
  const densityLabel = document.getElementById('density-label');
  const dock = document.getElementById('control-dock');
  const dockCollapse = document.getElementById('dock-collapse');
  const miniDock = document.getElementById('mini-dock');
  const miniDockLabel = document.getElementById('mini-dock-label');
  const miniDockOpen = document.getElementById('mini-dock-open');
  const hint = document.getElementById('hint');

  const motionMap = ['Low','Medium','High'];
  const densityMap = ['Low','Medium','High'];

  // Dock collapse / minimal mode -----------------------------------
  dockCollapse.addEventListener('click', () => {
    state.dockCollapsed = true;
    syncDockMode();
    save();
  });

  miniDockOpen.addEventListener('click', () => {
    state.dockCollapsed = false;
    syncDockMode();
    save();
  });

  function syncDockMode() {
    if (state.dockCollapsed) {
      dock.classList.add('is-hidden');
      miniDock.classList.remove('is-hidden');
      animateMiniDock();
    } else {
      dock.classList.remove('is-hidden');
      miniDock.classList.add('is-hidden');
      animateDock();
    }
  }

  // UI events -------------------------------------------------------
  themeGroup.addEventListener('click', e => {
    const btn = e.target.closest('.pill[data-theme]');
    if (!btn) return;
    state.theme = btn.dataset.theme;
    initThemeData();
    syncUI();
    save();
    animatePill(btn);
    animateThemeBadge();
  });

  moodGroup.addEventListener('click', e => {
    const btn = e.target.closest('.pill[data-mood]');
    if (!btn) return;
    state.mood = btn.dataset.mood;
    syncUI();
    save();
    animatePill(btn);
    animateThemeBadge();
  });

  toggleGroup.addEventListener('click', e => {
    const lab = e.target.closest('.toggle-pill[data-toggle]');
    if (!lab) return;
    const key = lab.dataset.toggle;
    if (key === 'clock') {
      state.showClock = !state.showClock;
      applyOverlayVisibility();
    } else if (key === 'quotes') {
      state.showQuotes = !state.showQuotes;
      applyOverlayVisibility();
    } else if (key === 'dark') {
      state.extraDark = !state.extraDark;
    }
    syncUI();
    save();
    animateToggle(lab);
  });

  motionSlider.addEventListener('input', () => {
    state.motion = Number(motionSlider.value);
    syncUI();
    initThemeData();
    save();
  });

  densitySlider.addEventListener('input', () => {
    state.density = Number(densitySlider.value);
    initThemeData();
    syncUI();
    save();
  });

  // Helpers ---------------------------------------------------------
  function themeName() {
    switch (state.theme) {
      case 'space': return 'Space Drift';
      case 'nebula': return 'Nebula Drift';
      case 'void': return 'Deep Void';
      case 'dust': return 'Cosmic Dust';
      case 'aurora': return 'Aurora';
      case 'ocean': return 'Night Ocean';
      case 'fireflies': return 'Fireflies';
      case 'sakura': return 'Sakura';
      default: return 'Custom';
    }
  }

  function moodName() {
    switch (state.mood) {
      case 'calm': return 'Calm';
      case 'flow': return 'Flow';
      case 'alive': return 'Alive';
      default: return '';
    }
  }

  function syncUI() {
    // Theme pills
    themeGroup.querySelectorAll('.pill[data-theme]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === state.theme);
    });
    // Mood pills
    moodGroup.querySelectorAll('.pill[data-mood]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mood === state.mood);
    });
    // Toggles
    toggleGroup.querySelectorAll('.toggle-pill').forEach(lab => {
      const key = lab.dataset.toggle;
      let active = false;
      if (key === 'clock') active = state.showClock;
      if (key === 'quotes') active = state.showQuotes;
      if (key === 'dark') active = state.extraDark;
      lab.classList.toggle('active', active);
    });
    // Sliders
    motionSlider.value = state.motion;
    densitySlider.value = state.density;
    motionLabel.textContent = motionMap[state.motion] || 'Medium';
    densityLabel.textContent = densityMap[state.density] || 'Medium';

    const badgeText = `${themeName()} · ${moodName()}`;
    panelBadgeText.textContent = badgeText;
    miniDockLabel.textContent = badgeText;

    document.body.dataset.theme = state.theme;
    document.body.dataset.mood = state.mood;
  }
  syncUI();
  syncDockMode();

  // Anime.js micro-interactions -------------------------------------
  function animatePill(el) {
    if (!window.anime) return;
    anime.remove(el);
    anime({
      targets: el,
      scale: [0.96, 1],
      duration: 220,
      easing: 'easeOutQuad'
    });
  }

  function animateToggle(el) {
    if (!window.anime) return;
    anime.remove(el);
    anime({
      targets: el,
      scale: [0.96, 1],
      duration: 200,
      easing: 'easeOutQuad'
    });
  }

  function animateThemeBadge() {
    if (!window.anime) return;
    anime.remove('#dock-badge');
    anime({
      targets: '#dock-badge',
      translateY: [-2, 0],
      opacity: [0.7, 1],
      duration: 260,
      easing: 'easeOutQuad'
    });
  }

  function animateDock() {
    if (!window.anime) return;
    anime.remove('#control-dock');
    anime({
      targets: '#control-dock',
      translateY: [12, 0],
      opacity: [0, 1],
      duration: 420,
      easing: 'easeOutCubic'
    });
  }

  function animateMiniDock() {
    if (!window.anime) return;
    anime.remove('#mini-dock');
    anime({
      targets: '#mini-dock',
      translateY: [8, 0],
      opacity: [0, 1],
      duration: 320,
      easing: 'easeOutCubic'
    });
  }

  function introAnimation() {
    if (!window.anime) return;
    if (!state.dockCollapsed) {
      animateDock();
    } else {
      animateMiniDock();
    }
    anime({
      targets: '#hint',
      translateY: [-10, 0],
      opacity: [0, 1],
      duration: 650,
      delay: 300,
      easing: 'easeOutCubic'
    });
    anime({
      targets: '#clock-time',
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 800,
      easing: 'easeOutCubic'
    });
    // subtle pulse
    anime({
      targets: '#clock-time',
      opacity: [0.96,1],
      duration: 3200,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    introAnimation();
  } else {
    document.addEventListener('DOMContentLoaded', introAnimation);
  }

  // THEME ENGINE ----------------------------------------------------
  let stars = [];
  let dustParticles = [];
  let fireflies = [];

  function moodFactor() {
    if (state.mood === 'calm') return 0.55;
    if (state.mood === 'flow') return 1.0;
    if (state.mood === 'alive') return 1.55;
    return 1.0;
  }
  function motionFactor() {
    if (state.motion === 0) return 0.6;
    if (state.motion === 1) return 1.0;
    if (state.motion === 2) return 1.4;
    return 1.0;
  }
  function densityFactor() {
    if (state.density === 0) return 0.7;
    if (state.density === 1) return 1.0;
    if (state.density === 2) return 1.35;
    return 1.0;
  }

  function initThemeData() {
    const factor = moodFactor();
    const dFactor = densityFactor();

    if (['space','fireflies','sakura','nebula'].includes(state.theme)) {
      const base =
        state.theme === 'space'   ? 220 :
        state.theme === 'nebula'  ? 200 :
        state.theme === 'fireflies' ? 160 : 140;
      const count = Math.floor(base * (0.6 + factor * 0.4) * dFactor);
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          s: Math.random() * 1.2 + 0.4,
          o: Math.random() * 0.5 + 0.4,
          vx: (Math.random() - 0.5) * factor * 0.35,
          vy: (Math.random() - 0.5) * factor * 0.35
        });
      }
      fireflies = stars.map(s => ({ x:s.x, y:s.y, o:s.o }));
    }

    if (state.theme === 'dust') {
      const count = Math.floor(260 * (0.7 + factor * 0.45) * dFactor);
      dustParticles = [];
      for (let i = 0; i < count; i++) {
        dustParticles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.4,
          alpha: Math.random() * 0.6 + 0.18
        });
      }
    }
  }
  initThemeData();

  // Drawing functions -----------------------------------------------
  function drawSpace() {
    const f = moodFactor() * motionFactor();
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.fillRect(0, 0, w, h);
    for (const s of stars) {
      s.x += (0.35 + s.s * 0.65) * f;
      if (s.x > w) s.x = 0;
      ctx.fillStyle = `rgba(255,255,255,${s.o})`;
      ctx.fillRect(s.x, s.y, s.s * 1.8, s.s * 1.8);
    }
  }

  function drawNebula() {
    const t = Date.now() * 0.00035 * motionFactor();
    ctx.fillStyle = '#02000b';
    ctx.fillRect(0, 0, w, h);

    // soft nebula clouds
    for (let i = 0; i < 4; i++) {
      const cx = w * (0.2 + 0.2 * i) + Math.sin(t + i) * 60;
      const cy = h * (0.3 + 0.1 * i) + Math.cos(t * 0.8 + i) * 50;
      const radius = Math.max(w,h) * (0.35 + i * 0.08);
      const hue = 190 + Math.sin(t + i) * 60;  // teal / magenta mix
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `hsla(${hue},80%,65%,0.36)`);
      grad.addColorStop(0.6, `hsla(${(hue+60)%360},70%,50%,0.16)`);
      grad.addColorStop(1, 'rgba(0,0,0,0.95)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // star field on top
    const f = moodFactor();
    for (const s of stars) {
      s.x += s.vx * f;
      s.y += s.vy * f;
      if (s.x < 0) s.x = w;
      if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h;
      if (s.y > h) s.y = 0;
      ctx.fillStyle = `rgba(255,255,255,${s.o})`;
      ctx.fillRect(s.x, s.y, s.s * 1.4, s.s * 1.4);
    }
  }

  function drawVoid() {
    const t = Date.now() * 0.00018 * motionFactor();
    ctx.fillStyle = '#000007';
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 0; i < 3; i++) {
      const r = Math.max(w, h) * 0.9 + i * 70;
      const angle = t + i * 1.3;
      const gx = cx + Math.cos(angle) * 40;
      const gy = cy + Math.sin(angle) * 32;
      const grad = ctx.createRadialGradient(gx, gy, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(10,10,30,0.86)');
      grad.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function drawDust() {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, w, h);
    const jitterScale = 0.3 * motionFactor();
    for (const p of dustParticles) {
      const jitterX = (Math.random() - 0.5) * jitterScale;
      const jitterY = (Math.random() - 0.5) * jitterScale;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = 'rgba(255,255,255,0.96)';
      ctx.beginPath();
      ctx.arc(p.x + jitterX, p.y + jitterY, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawAurora() {
    const t = Date.now() * 0.0004 * moodFactor() * motionFactor();
    ctx.fillStyle = '#02020f';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      const x = w / 2 + Math.sin(t + i) * 260;
      const y = h / 2 + Math.cos(t * 0.7 + i) * 190;
      const hue = 150 + Math.sin(t + i * 0.4) * 65;
      ctx.fillStyle = `hsla(${hue},78%,58%,0.19)`;
      ctx.beginPath();
      ctx.arc(x, y, h * 0.95, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawOcean() {
    const t = Date.now() * 0.00075 * moodFactor() * motionFactor();
    ctx.fillStyle = '#00050d';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'hsla(200,80%,60%,0.19)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(
        w / 2 + Math.sin(t + i) * 160,
        h * 0.7 + Math.sin(t * 0.8 + i * 1.3) * 70,
        h * 0.55 + i * 32,
        0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  function drawFireflies() {
    const t = Date.now() * 0.001 * moodFactor() * motionFactor();
    ctx.fillStyle = 'rgba(0,0,10,0.3)';
    ctx.fillRect(0, 0, w, h);
    for (const ffly of fireflies) {
      ffly.x += Math.sin(t + ffly.x * 0.01) * 0.5;
      ffly.y += Math.cos(t * 0.8 + ffly.y * 0.01) * 0.4;
      if (ffly.x < 0 || ffly.x > w) ffly.x = Math.random() * w;
      if (ffly.y < 0 || ffly.y > h) ffly.y = Math.random() * h;
      const b = Math.sin(t * 4 + ffly.x * 0.02) * 0.5 + 0.8;
      ctx.fillStyle = `rgba(255,250,190,${b})`;
      ctx.beginPath();
      ctx.arc(ffly.x, ffly.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSakura() {
    const f = moodFactor() * motionFactor();
    ctx.fillStyle = '#050011';
    ctx.fillRect(0, 0, w, h);
    for (const s of stars) {
      s.y += s.s * 0.55 * f;
      if (s.y > h) {
        s.y = -10;
        s.x = Math.random() * w;
      }
      ctx.fillStyle = `rgba(255,182,193,${s.o})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    switch (state.theme) {
      case 'space':      drawSpace();  break;
      case 'nebula':     drawNebula(); break;
      case 'void':       drawVoid();   break;
      case 'dust':       drawDust();   break;
      case 'aurora':     drawAurora(); break;
      case 'ocean':      drawOcean();  break;
      case 'fireflies':  drawFireflies(); break;
      case 'sakura':     drawSakura(); break;
    }
    if (state.extraDark) {
      ctx.fillStyle = 'rgba(0,0,0,0.26)';
      ctx.fillRect(0, 0, w, h);
    }
    requestAnimationFrame(loop);
  }
  loop();
})();
