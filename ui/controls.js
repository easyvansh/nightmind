// UI wiring, clock, quotes, profiles, shortcuts, anime.js micro-interactions

export function initUI({
  getState,
  setState,
  saveState,
  engineRefresh,
  isWallpaperTheme
}) {
  const state = getState;

  // ---------- DOM refs ----------
  const clockOverlay = document.getElementById('clock-overlay');
  const clockTime = document.getElementById('clock-time');
  const clockDate = document.getElementById('clock-date');

  const quoteOverlay = document.getElementById('quote-overlay');
  const quoteText = document.getElementById('quote-text');
  const quoteAuthor = document.getElementById('quote-author');

  const dock = document.getElementById('control-dock');
  const hint = document.getElementById('hint');
  const badgeText = document.getElementById('panel-badge-text');

  const abstractThemes = document.getElementById('abstract-themes');
  const wallpaperThemes = document.getElementById('wallpaper-themes');
  const moodGroup = document.getElementById('mood-group');
  const toggleGroup = document.getElementById('toggle-group');
  const clockControls = document.getElementById('clock-controls');
  const profileGroup = document.getElementById('profile-group');

  const motionSlider = document.getElementById('motion-slider');
  const densitySlider = document.getElementById('density-slider');
  const tintSlider = document.getElementById('tint-slider');
  const motionLabel = document.getElementById('motion-label');
  const densityLabel = document.getElementById('density-label');
  const tintLabel = document.getElementById('tint-label');

  const mediaBg = document.getElementById('media-background');

  const motionMap = ['Low', 'Medium', 'High'];
  const densityMap = ['Low', 'Medium', 'High'];

  // ---------- Idle handling ----------
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

  // ---------- Clock ----------
  function updateClock() {
    const now = new Date();
    const { clockFormat } = state();
    const showSeconds = clockFormat === 'hms';
    clockTime.textContent = now.toLocaleTimeString([], {
      hour:'2-digit',
      minute:'2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12:false
    });
    clockDate.textContent = now.toLocaleDateString([], {
      weekday:'short',
      month:'short',
      day:'numeric',
      year:'numeric'
    });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // ---------- Quotes ----------
  const quotes = [
    "Simplicity is the place where complexity goes to rest.",
    "Attention is a quiet form of love.",
    "In the darkness, every small light is a universe.",
    "You are not behind; you are mid-chapter.",
    "The quieter the room, the louder your inner life.",
    "Tonight belongs to one honest intention."
  ];

  function newQuote() {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    quoteText.textContent = `“${q}”`;
    quoteAuthor.textContent = 'Nightmind';
  }
  newQuote();
  setInterval(newQuote, 25000);

  // ---------- Overlay visibility ----------
  function applyOverlayVisibility() {
    const { showClock, showQuotes } = state();
    clockOverlay.classList.toggle('hiddenOverlay', !showClock);
    quoteOverlay.classList.toggle('hiddenOverlay', !showQuotes);
  }

  // ---------- Keyboard shortcuts ----------
  window.addEventListener('keydown', e => {
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } else if (e.key === 'c' || e.key === 'C') {
      const s = state();
      setState({ showClock: !s.showClock });
      applyOverlayVisibility();
      syncUI();
    } else if (e.key === 'q' || e.key === 'Q') {
      const s = state();
      setState({ showQuotes: !s.showQuotes });
      applyOverlayVisibility();
      syncUI();
    } else if (e.key === 't' || e.key === 'T') {
      const order = ['space','void','dust','aurora','nebula','forest'];
      const s = state();
      const idx = order.indexOf(s.theme);
      const next = order[(idx + 1) % order.length];
      setState({ theme: next, profile:'custom' });
      engineRefresh();
      syncUI();
      animateThemeBadge();
    }
  });

  // ---------- Theme + mood pills ----------
  function handleThemeClick(evt) {
    const btn = evt.target.closest('.pill[data-theme]');
    if (!btn) return;
    const theme = btn.dataset.theme;
    setState({ theme, profile:'custom' });
    engineRefresh();
    syncUI();
    animatePill(btn);
    animateThemeBadge();
  }

  abstractThemes.addEventListener('click', handleThemeClick);
  wallpaperThemes.addEventListener('click', handleThemeClick);

  moodGroup.addEventListener('click', evt => {
    const btn = evt.target.closest('.pill[data-mood]');
    if (!btn) return;
    const mood = btn.dataset.mood;
    setState({ mood, profile:'custom' });
    syncUI();
    animatePill(btn);
    animateThemeBadge();
  });

  // ---------- Toggles ----------
  toggleGroup.addEventListener('click', evt => {
    const lab = evt.target.closest('.toggle-pill[data-toggle]');
    if (!lab) return;
    const key = lab.dataset.toggle;
    const s = state();
    let patch = {};
    if (key === 'clock') patch.showClock = !s.showClock;
    if (key === 'quotes') patch.showQuotes = !s.showQuotes;
    if (key === 'dark') patch.extraDark = !s.extraDark;
    if (key === 'minimal') patch.minimalMode = !s.minimalMode;
    setState(patch);
    applyOverlayVisibility();
    syncUI();
    animateToggle(lab);
  });

  // ---------- Clock format pills ----------
  clockControls.addEventListener('click', evt => {
    const btn = evt.target.closest('.pill[data-format]');
    if (!btn) return;
    const format = btn.dataset.format;
    setState({ clockFormat: format });
    updateClock();
    syncUI();
    animatePill(btn);
  });

  // ---------- Profiles ----------
  const PROFILES = {
    deep: {
      theme: 'forest',
      mood: 'calm',
      motion: 0,
      density: 0,
      showClock: false,
      showQuotes: false,
      extraDark: true,
      tint: 50
    },
    sleep: {
      theme: 'nebula',
      mood: 'calm',
      motion: 0,
      density: 0,
      showClock: false,
      showQuotes: true,
      extraDark: true,
      tint: 70
    },
    space: {
      theme: 'space',
      mood: 'flow',
      motion: 1,
      density: 1,
      showClock: true,
      showQuotes: false,
      extraDark: false,
      tint: 0
    }
  };

  profileGroup.addEventListener('click', evt => {
    const btn = evt.target.closest('.pill[data-profile]');
    if (!btn) return;
    const key = btn.dataset.profile;
    const preset = PROFILES[key];
    if (!preset) return;

    setState({
      ...preset,
      profile: key
    });
    engineRefresh();
    applyOverlayVisibility();
    syncUI();
    animatePill(btn);
    animateThemeBadge();
  });

  // ---------- Sliders ----------
  motionSlider.addEventListener('input', () => {
    const val = Number(motionSlider.value);
    setState({ motion: val, profile:'custom' });
    engineRefresh();
    syncUI();
  });

  densitySlider.addEventListener('input', () => {
    const val = Number(densitySlider.value);
    setState({ density: val, profile:'custom' });
    engineRefresh();
    syncUI();
  });

  tintSlider.addEventListener('input', () => {
    const val = Number(tintSlider.value);
    setState({ tint: val, profile:'custom' });
    // just update tint var; no need to rebuild theme
    const tintValue = Math.min(Math.max(val, 0), 100) / 100;
    mediaBg.style.setProperty('--wallpaper-tint', String(tintValue));
    syncUI();
  });

  // ---------- Helpers ----------
  function themeName(t) {
    switch (t) {
      case 'space': return 'Space Drift';
      case 'void': return 'Deep Void';
      case 'dust': return 'Cosmic Dust';
      case 'aurora': return 'Aurora Borealis';
      case 'nebula': return 'Crimson Nebula';
      case 'forest': return 'Zen Forest';
      default: return 'Custom';
    }
  }
  function moodName(m) {
    switch (m) {
      case 'calm': return 'Calm';
      case 'flow': return 'Flow';
      case 'alive': return 'Alive';
      default: return '';
    }
  }

  function syncUI() {
    const s = state();

    // Theme pills
    [...abstractThemes.querySelectorAll('.pill[data-theme]'),
     ...wallpaperThemes.querySelectorAll('.pill[data-theme]')]
      .forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === s.theme);
      });

    // Mood pills
    moodGroup.querySelectorAll('.pill[data-mood]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mood === s.mood);
    });

    // Toggles
    toggleGroup.querySelectorAll('.toggle-pill').forEach(lab => {
      const key = lab.dataset.toggle;
      let active = false;
      if (key === 'clock') active = s.showClock;
      if (key === 'quotes') active = s.showQuotes;
      if (key === 'dark') active = s.extraDark;
      if (key === 'minimal') active = s.minimalMode;
      lab.classList.toggle('active', active);
    });

    // Clock format
    clockControls.querySelectorAll('.pill[data-format]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.format === s.clockFormat);
    });

    // Profiles
    profileGroup.querySelectorAll('.pill[data-profile]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.profile === s.profile);
    });

    // Sliders
    motionSlider.value = s.motion;
    densitySlider.value = s.density;
    tintSlider.value = s.tint;
    motionLabel.textContent = motionMap[s.motion] || 'Medium';
    densityLabel.textContent = densityMap[s.density] || 'Medium';
    tintLabel.textContent = `${s.tint}%`;

    // Badge
    badgeText.textContent = `${themeName(s.theme)} · ${moodName(s.mood)}`;

    // Body data attributes for CSS
    document.body.dataset.theme = s.theme;
    document.body.dataset.mood = s.mood;
    document.body.dataset.themeType = isWallpaperTheme(s.theme) ? 'wallpaper' : 'procedural';
    document.body.dataset.minimal = s.minimalMode ? 'true' : 'false';

    applyOverlayVisibility();
  }

  // ---------- Anime.js micro-interactions ----------
  function animatePill(el) {
    if (typeof anime === 'undefined' || !el) return;
    anime.remove(el);
    anime({
      targets: el,
      scale: [0.96, 1],
      duration: 220,
      easing: 'easeOutQuad'
    });
  }

  function animateToggle(el) {
    if (typeof anime === 'undefined' || !el) return;
    anime.remove(el);
    anime({
      targets: el,
      scale: [0.96, 1],
      duration: 200,
      easing: 'easeOutQuad'
    });
  }

  function animateThemeBadge() {
    if (typeof anime === 'undefined') return;
    anime.remove('#dock-badge');
    anime({
      targets: '#dock-badge',
      translateY: [-2, 0],
      opacity: [0.7, 1],
      duration: 260,
      easing: 'easeOutQuad'
    });
  }

  function introAnimation() {
    if (typeof anime === 'undefined') return;
    anime({
      targets: '#control-dock',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 700,
      delay: 150,
      easing: 'easeOutCubic'
    });
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
    anime({
      targets: '#clock-time',
      opacity: [0.96, 1],
      duration: 3200,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
  }

  // Initial draw
  syncUI();
  introAnimation();
}
