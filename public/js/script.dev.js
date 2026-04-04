'use strict';

// ─── Preloader ────────────────────────────────────────────────────────────────
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var preloader = document.getElementById('preloader');
window.addEventListener('load', function () {
  if (!preloader) return;
  preloader.classList.add('fade-out');
  setTimeout(function () {
    preloader.style.display = 'none';
  }, 550);
});

// ─── Theme toggle ─────────────────────────────────────────────────────────────

var THEME_KEY = 'bfd-theme';
var THEME_DARK = 'dark';
var THEME_LIGHT = 'light';
function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || THEME_DARK;
  } catch (_unused) {
    return THEME_DARK;
  }
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (_unused2) {/* noop */}
}
function initTheme() {
  var theme = getStoredTheme();
  applyTheme(theme);
}
function initThemeToggle() {
  var btn = document.querySelector('.js-theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === THEME_DARK ? THEME_LIGHT : THEME_DARK);
  });
}

// ─── Header scroll behaviour ─────────────────────────────────────────────────

function initHeaderScroll() {
  var header = document.querySelector('.js-header');
  if (!header) return;
  var SCROLL_THRESHOLD = 10;
  var handleScroll = function handleScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, {
    passive: true
  });
  handleScroll();
}

// ─── Water drop cursor ────────────────────────────────────────────────────────

function initCursorDrop() {
  if (window.matchMedia('(hover: none)').matches) return;
  var drop = document.createElement('div');
  drop.className = 'cursor-drop';
  document.body.appendChild(drop);
  document.documentElement.classList.add('has-custom-cursor');
  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var x = mouseX,
    y = mouseY;
  var prevX = mouseX,
    prevY = mouseY;
  var isVisible = false;

  // Spring state for elastic deformation
  var sx = 1,
    sy = 1;
  var svx = 0,
    svy = 0;
  var LERP = 0.13; // lag factor — how fast drop follows cursor
  var SPEED_MUL = 0.058; // speed → stretch ratio
  var MAX_SCALE = 3.0; // max elongation
  var SPRING = 0.11; // spring stiffness (pull back to round)
  var DAMPING = 0.66; // damping < 1 = wobble on settle

  drop.style.opacity = '0';
  drop.style.transition = 'opacity 0.25s ease';
  var lerp = function lerp(a, b, t) {
    return a + (b - a) * t;
  };
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      // Snap position before showing to avoid flying in from center
      x = mouseX;
      y = mouseY;
      prevX = mouseX;
      prevY = mouseY;
      drop.style.opacity = '1';
      isVisible = true;
    }
  });
  document.addEventListener('mouseleave', function () {
    drop.style.opacity = '0';
    isVisible = false;
    // Freeze target at current display position — no jump
    mouseX = x;
    mouseY = y;
  });

  // Squish on click — tactile water splash
  document.addEventListener('mousedown', function () {
    sx = 1.5;
    sy = 0.65;
    svx = 0;
    svy = 0;
  });
  function tick() {
    x = lerp(x, mouseX, LERP);
    y = lerp(y, mouseY, LERP);
    var vx = x - prevX;
    var vy = y - prevY;
    prevX = x;
    prevY = y;
    var speed = Math.sqrt(vx * vx + vy * vy);
    var angle = Math.atan2(vy, vx) * (180 / Math.PI);

    // Target scale: stretch along motion axis, compress perpendicular
    var tsX = Math.min(1 + speed * SPEED_MUL, MAX_SCALE);
    var tsY = Math.max(1 / tsX, 1 / MAX_SCALE);

    // Spring physics toward target scale
    svx += (tsX - sx) * SPRING;
    svy += (tsY - sy) * SPRING;
    svx *= DAMPING;
    svy *= DAMPING;
    sx += svx;
    sy += svy;
    drop.style.transform = "translate(".concat(x, "px,").concat(y, "px) translate(-50%,-50%) ") + "rotate(".concat(angle, "deg) scaleX(").concat(sx.toFixed(4), ") scaleY(").concat(sy.toFixed(4), ")");
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

initTheme();
initThemeToggle();
initHeaderScroll();
initCursorDrop();

// Cards 3D

var cards3D = document.querySelectorAll(".card");
var _iterator = _createForOfIteratorHelper(cards3D),
  _step;
try {
  var _loop = function _loop() {
    var card = _step.value;
    var cardInner = card.querySelector(".card__inner");
    var cardCoords = card.getBoundingClientRect();
    var cardCenter = {
      x: cardCoords.right - cardCoords.width / 2,
      y: cardCoords.bottom + scrollY - cardCoords.height / 2
    };
    card.fixed = false;
    var maxHypotenuse = Math.sqrt(Math.pow(cardCoords.width / 2, 2) + Math.pow(cardCoords.height / 2, 2));
    var timerID = null;
    var cardCurrentTransform = null;
    card.addEventListener("mouseover", function () {
      // Очищаю таймаут
      clearTimeout(timerID);
      // Задаю новый не постоянно, а только в случае transition не равному 0, чтобы не добавлять лишних
      if (cardInner.style.transition !== "transform 0s ease 0s") {
        timerID = setTimeout(function () {
          cardInner.style.transition = "transform 0s";
        }, 300);
      }
    });
    card.addEventListener("click", function (e) {
      if (card.fixed == false) {
        card.fixed = true;
      } else {
        card.fixed = false;
        cardInner.style.transition = "transform .3s";
        calcCardTransform(e);
      }
    });
    card.addEventListener("mousemove", function (e) {
      if (card.fixed == false) {
        calcCardTransform(e);
      }
    });
    card.addEventListener("mouseleave", function () {
      if (card.fixed == false) {
        clearTimeout(timerID);
        cardInner.style.transition = "transform .3s";
        cardInner.style.transform = "";
      }
    });

    // Functions
    function calcCardTransform(e) {
      var cardCenterOffsetX = e.pageX - cardCenter.x;
      var cardCenterOffsetY = e.pageY - cardCenter.y;
      cardCurrentTransform = "rotate3d(".concat(-cardCenterOffsetY / (cardCoords.height / 2), ", ").concat(cardCenterOffsetX / (cardCoords.width / 2), ", 0, ").concat((Math.sqrt(Math.pow(cardCenterOffsetX, 2) + Math.pow(cardCenterOffsetY, 2)) / maxHypotenuse * 10).toFixed(2), "deg)");
      cardInner.style.transform = cardCurrentTransform;
    }
  };
  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    _loop();
  }
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}