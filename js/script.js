"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var windowWidth = window.innerWidth;
var dots = document.querySelectorAll('.dots__item');

var _loop = function _loop(i) {
  var count = 0;
  var letter = dots[i].firstElementChild;
  dots[i].addEventListener('click', function () {
    count++;

    if (count < 9) {
      var red = Math.round(Math.random() * 255 + 1);
      var green = Math.round(Math.random() * 255 + 1);
      var blue = Math.round(Math.random() * 255 + 1);
      dots[i].style.backgroundColor = "rgba(" + red + ", " + green + "," + blue + ")";
      dotJump(this);
    } else if (count == 9) {
      var _red = Math.round(Math.random() * 255 + 1);

      var _green = Math.round(Math.random() * 255 + 1);

      var _blue = Math.round(Math.random() * 255 + 1); // dots[i].style.backgroundColor = "rgba(" + red + ", " + green + "," + blue + ")";


      this.classList.add('jump');
      setTimeout(function () {
        dots[i].classList.remove('jump');
        dots[i].style.backgroundColor = "transparent";
        letter.style.color = "rgba(" + _red + ", " + _green + "," + _blue + ")";
        dots[i].classList.add('stopJump');
      }, 500);
    }
  });
};

for (var i = 0; i < dots.length; i++) {
  _loop(i);
}

function dotJump(el) {
  el.classList.add('jump');
  setTimeout(function () {
    el.classList.remove('jump');
  }, 500);
} // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// ОБРАБОТКА МОБИЛЬНОГО МЕНЮ


var menuToggle = document.querySelector('.top-menu-toggle'),
    menu = document.querySelector('.top-nav'),
    // menuOverl  	= document.querySelector('.top-nav-overl'),
menuOverl = document.createElement('div'),
    body = document.querySelector('body');
menuOverl.className = 'top-nav-overl';
menu.after(menuOverl);
menuToggle.addEventListener('click', function () {
  menuToggle.classList.toggle('open');
  menu.classList.toggle('open');
  body.classList.toggle('scroll-hidden');
  menuOverl.classList.toggle('open');
});
menuOverl.addEventListener('click', menuClose);

function menuClose() {
  menuToggle.classList.remove('open');
  menu.classList.remove('open');
  body.classList.remove('scroll-hidden');
  menuOverl.classList.remove('open');
} // let setupMenuDash = function(){
// 	const menuDashed	= document.querySelector('.top-menu_underlined');
// 	const menuItems		= menuDashed.querySelectorAll('.top-menu__item > a');
// 	for (let menuItem of menuItems) {
// 		let dash = document.createElement('div');
// 		dash.className = 'menu-dash';
// 		menuItem.append(dash);
// 		menuItem.addEventListener('mouseover', function() {
// 			dash.classList.remove('shrink-right');
// 			dash.classList.add('grow-right');
// 		})
// 		menuItem.addEventListener('mouseout', function() {
// 			dash.classList.remove('grow-right');
// 			dash.classList.add('shrink-right');
// 		})
// 	}
// }
// setupMenuDash();
// ОБРАБОТКА ПОДЧЕРКИВАНИЯ ПУНКТОВ МЕНЮ


var menuDashed = document.querySelector('.top-menu_underlined.responsive');
var menuItems = menuDashed.querySelectorAll('.top-menu__item > a');

function setupMenuDashResponsive() {
  var _iterator = _createForOfIteratorHelper(menuItems),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var menuItem = _step.value;
      var dash = document.createElement('div');
      dash.className = 'menu-dash';
      menuItem.append(dash);
      menuDashHandler(menuItem, dash);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

function menuDashHandler(item, dash) {
  // Определение середины пункта меню
  var menuItemMiddle = item.getBoundingClientRect().x + item.getBoundingClientRect().width / 2;
  item.addEventListener('mouseover', function (e) {
    dash.className = 'menu-dash'; //Сброс всех лишних классов (появления и исчезания)

    menuItemMiddle >= e.clientX ? dash.classList.add('grow-right') : dash.classList.add('grow-left');
  });
  item.addEventListener('mouseout', function (e) {
    dash.className = 'menu-dash';
    menuItemMiddle >= e.clientX ? dash.classList.add('shrink-left') : dash.classList.add('shrink-right');
  });
} // Запуск установки только на мобильных


if (windowWidth >= 992) {
  setupMenuDashResponsive();
} // Обработка при изменении экрана


window.onresize = function () {
  windowWidth = window.innerWidth;
  var dash = document.querySelector('.menu-dash'); //Получить .dash

  if (windowWidth >= 992) {
    if (dash) {
      //Если хоть одна .dash существует
      var _iterator2 = _createForOfIteratorHelper(menuItems),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var menuItem = _step2.value;

          var _dash = menuItem.querySelector('.menu-dash'); //то получаем все имеющиеся в меню


          _dash.className = 'menu-dash'; //и сбрасываем лишние стили

          menuDashHandler(menuItem, _dash); //и обработка снова
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    } else {
      setupMenuDashResponsive(); //если .dash не существует - просто установка
    }
  } else {
    //Удаление всех .dash на мобильном
    var _iterator3 = _createForOfIteratorHelper(menuItems),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var _menuItem = _step3.value;

        var _dash2 = _menuItem.querySelector('.menu-dash');

        if (_dash2) {
          _dash2.remove();
        }
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }
}; // ===================================================