// Theme engine: procedural canvas + wallpaper support

const WALLPAPER_THEME_KEYS = ['aurora', 'nebula', 'forest'];

const WALLPAPER_IMAGES = {
  // You can swap these to your own assets later
  aurora: 'https://images.pexels.com/photos/1933320/pexels-photo-1933320.jpeg?auto=compress&cs=tinysrgb&w=1600',
  nebula: 'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=1600',
  forest: 'https://images.pexels.com/photos/240040/pexels-photo-240040.jpeg?auto=compress&cs=tinysrgb&w=1600'
};

export function isWallpaperTheme(theme) {
  return WALLPAPER_THEME_KEYS.includes(theme);
}

export function createThemeEngine(canvas, mediaEl, getState) {
  const ctx = canvas.getContext('2d');
  let DPR = window.devicePixelRatio || 1;
  let w = window.innerWidth;
  let h = window.innerHeight;

  let stars = [];
  let dustParticles = [];
  let fireflies = [];

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

  function moodFactor() {
    const { mood } = getState();
    if (mood === 'calm') return 0.55;
    if (mood === 'flow') return 1.0;
    if (mood === 'alive') return 1.55;
    return 1.0;
  }
  function motionFactor() {
    const { motion } = getState();
    if (motion === 0) return 0.6;
    if (motion === 1) return 1.0;
    if (motion === 2) return 1.4;
    return 1.0;
  }
  function densityFactor() {
    const { density } = getState();
    if (density === 0) return 0.7;
    if (density === 1) return 1.0;
    if (density === 2) return 1.35;
    return 1.0;
  }

  function updateWallpaper() {
    const { theme, tint } = getState();
    if (isWallpaperTheme(theme)) {
      const url = WALLPAPER_IMAGES[theme];
      if (url) {
        mediaEl.style.backgroundImage = `url("${url}")`;
      } else {
        mediaEl.style.backgroundImage = 'none';
      }
      const tintValue = Math.min(Math.max(tint, 0), 100) / 100;
      mediaEl.style.setProperty('--wallpaper-tint', String(tintValue));
    } else {
      mediaEl.style.backgroundImage = 'none';
      mediaEl.style.setProperty('--wallpaper-tint', '0');
    }
  }

  function initThemeData() {
    const { theme } = getState();
    const factor = moodFactor();
    const dFactor = densityFactor();

    if (theme === 'space' || theme === 'fireflies' || theme === 'sakura') {
      const base = (theme === 'space') ? 220 :
                   (theme === 'fireflies' ? 160 : 140);
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

    if (theme === 'dust') {
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

    updateWallpaper();
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
    const { theme, extraDark } = getState();

    // For wallpapers, we still draw a subtle base so transitions feel smooth
    switch (theme) {
      case 'space':      drawSpace(); break;
      case 'void':       drawVoid();  break;
      case 'dust':       drawDust();  break;
      case 'aurora':     drawAurora();break;
      case 'ocean':      drawOcean(); break;
      case 'fireflies':  drawFireflies(); break;
      case 'sakura':     drawSakura(); break;
      case 'nebula':
      case 'forest':
        // treat as wallpaper-only: light ambient void
        drawVoid();
        break;
    }

    if (extraDark) {
      ctx.fillStyle = 'rgba(0,0,0,0.26)';
      ctx.fillRect(0, 0, w, h);
    }
    requestAnimationFrame(loop);
  }
  loop();

  return {
    refresh: () => {
      initThemeData();
    }
  };
}
