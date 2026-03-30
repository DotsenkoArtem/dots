'use strict';

const author = 'Artem Dots';
const themeColor = '#506690';
const ieBung = false;

// Шрифты для preload в <head> — указывать .woff2 имена
// ИНСТРУКЦИЯ: после добавления .ttf в src/assets/fonts/
// gulp сконвертирует их в .woff и .woff2, добавь сюда имена .woff2 файлов
const fontsPreload = [
  'OpenSans-Light.woff2',
  'OpenSans-Regular.woff2',
  'OpenSans-SemiBold.woff2',
  'OpenSans-Bold.woff2',
  'OpenSans-ExtraBold.woff2',
];

// URL страницы определяется автоматически в миксине меню: key + '.html'
// Для дочерних страниц URL = ключ объекта + '.html'
const pages = {
  index: {
    name: 'Главная',
    title: 'Dots....',
    descr: '',
    fileStem: 'index',
    author,
    isMenuItem: true,
  },
  // page2: {
  //   name: 'Страница-2',
  //   title: 'Страница-2 - Название',
  //   descr: '',
  //   fileStem: 'page2',
  //   author,
  //   isMenuItem: true,
  //   isMenuItemHasChildren: {
  //     'child-page-21': {
  //       name: 'Страница 2-1',
  //       title: 'Страница 2-1 - Название',
  //       descr: '',
  //       fileStem: 'child-page',
  //       author,
  //       isMenuItem: true,
  //     },
  //     'child-page-22': {
  //       name: 'Страница 2-2',
  //       title: 'Страница 2-2 - Название',
  //       descр: '',
  //       fileStem: 'child-page',
  //       author,
  //       isMenuItem: true,
  //     },
  //   },
  // },
};

module.exports = { author, themeColor, ieBung, fontsPreload, pages };
