'use strict';

// ─── Preloader ────────────────────────────────────────────────────────────────

const preloader = document.getElementById('preloader');

window.addEventListener('load', () => {
  if (!preloader) return;
  preloader.classList.add('fade-out');
  setTimeout(() => {
    preloader.style.display = 'none';
  }, 550);
});


// ─── Theme toggle ─────────────────────────────────────────────────────────────

const THEME_KEY = 'bfd-theme';
const THEME_DARK  = 'dark';
const THEME_LIGHT = 'light';

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || THEME_DARK;
  } catch {
    return THEME_DARK;
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch { /* noop */ }
}

function initTheme() {
  const theme = getStoredTheme();
  applyTheme(theme);
}

function initThemeToggle() {
  const btn = document.querySelector('.js-theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === THEME_DARK ? THEME_LIGHT : THEME_DARK);
  });
}


// ─── Header scroll behaviour ─────────────────────────────────────────────────

function initHeaderScroll() {
  const header = document.querySelector('.js-header');
  if (!header) return;

  const SCROLL_THRESHOLD = 10;

  const handleScroll = () => {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}


// ─── Water drop cursor ────────────────────────────────────────────────────────

function initCursorDrop() {
  if (window.matchMedia('(hover: none)').matches) return;

  const drop = document.createElement('div');
  drop.className = 'cursor-drop';
  document.body.appendChild(drop);
  document.documentElement.classList.add('has-custom-cursor');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let x = mouseX, y = mouseY;
  let prevX = mouseX, prevY = mouseY;
  let isVisible = false;

  // Spring state for elastic deformation
  let sx = 1, sy = 1;
  let svx = 0, svy = 0;

  const LERP       = 0.13;   // lag factor — how fast drop follows cursor
  const SPEED_MUL  = 0.058;  // speed → stretch ratio
  const MAX_SCALE  = 3.0;    // max elongation
  const SPRING     = 0.11;   // spring stiffness (pull back to round)
  const DAMPING    = 0.66;   // damping < 1 = wobble on settle

  drop.style.opacity = '0';
  drop.style.transition = 'opacity 0.25s ease';

  const lerp = (a, b, t) => a + (b - a) * t;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      // Snap position before showing to avoid flying in from center
      x = mouseX; y = mouseY;
      prevX = mouseX; prevY = mouseY;
      drop.style.opacity = '1';
      isVisible = true;
    }
  });

  document.addEventListener('mouseleave', () => {
    drop.style.opacity = '0';
    isVisible = false;
    // Freeze target at current display position — no jump
    mouseX = x;
    mouseY = y;
  });

  // Squish on click — tactile water splash
  document.addEventListener('mousedown', () => {
    sx = 1.5;
    sy = 0.65;
    svx = 0;
    svy = 0;
  });

  function tick() {
    x = lerp(x, mouseX, LERP);
    y = lerp(y, mouseY, LERP);

    const vx = x - prevX;
    const vy = y - prevY;
    prevX = x;
    prevY = y;

    const speed = Math.sqrt(vx * vx + vy * vy);
    const angle = Math.atan2(vy, vx) * (180 / Math.PI);

    // Target scale: stretch along motion axis, compress perpendicular
    const tsX = Math.min(1 + speed * SPEED_MUL, MAX_SCALE);
    const tsY = Math.max(1 / tsX, 1 / MAX_SCALE);

    // Spring physics toward target scale
    svx += (tsX - sx) * SPRING;
    svy += (tsY - sy) * SPRING;
    svx *= DAMPING;
    svy *= DAMPING;
    sx += svx;
    sy += svy;

    drop.style.transform =
      `translate(${x}px,${y}px) translate(-50%,-50%) ` +
      `rotate(${angle}deg) scaleX(${sx.toFixed(4)}) scaleY(${sy.toFixed(4)})`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}


// ─── Init ─────────────────────────────────────────────────────────────────────

initTheme();
initThemeToggle();
initHeaderScroll();
initCursorDrop();
