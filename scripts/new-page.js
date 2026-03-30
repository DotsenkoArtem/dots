#!/usr/bin/env node
'use strict';

/**
 * Scaffold-скрипт для создания новой страницы.
 *
 * Использование:
 *   node scripts/new-page.js <slug> [name]
 *
 * Примеры:
 *   node scripts/new-page.js about
 *   node scripts/new-page.js about "О компании"
 *
 * Что делает:
 *   1. Создаёт src/pug/pages/<slug>.pug на основе шаблона
 *   2. Добавляет запись в src/data/pages.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ── Аргументы ──────────────────────────────────────────────────────────────

const [,, slug, nameArg] = process.argv;

if (!slug) {
  console.error('Укажи slug страницы: node scripts/new-page.js <slug> [name]');
  process.exit(1);
}

if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error('Slug должен содержать только строчные буквы, цифры и дефис');
  process.exit(1);
}

const name  = nameArg || slug;
const key   = slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); // slug → camelCase
const title = `${name} - Название`;

// ── Создать pug-файл ───────────────────────────────────────────────────────

const pugPath = path.join(ROOT, 'src', 'pug', 'pages', `${slug}.pug`);

if (fs.existsSync(pugPath)) {
  console.error(`Файл уже существует: ${pugPath}`);
  process.exit(1);
}

const pugContent = `extends ../_templates/_base.pug

block page-vars
  -
    let page = pages.${key};


block main
  main
    section.section
      .container
        h1= page.title
`;

fs.writeFileSync(pugPath, pugContent, 'utf8');
console.log(`✓ Создан: src/pug/pages/${slug}.pug`);

// ── Добавить запись в pages.js ─────────────────────────────────────────────

const dataPath = path.join(ROOT, 'src', 'data', 'pages.js');
let dataContent = fs.readFileSync(dataPath, 'utf8');

const newEntry = `  ${key}: {
    name: '${name}',
    title: '${title}',
    descr: '',
    author,
    isMenuItem: true,
  },`;

// Вставляем перед закрывающей скобкой объекта pages (перед `};`)
if (dataContent.includes(`  ${key}:`)) {
  console.warn(`Запись pages.${key} уже существует в src/data/pages.js — пропускаем.`);
} else {
  dataContent = dataContent.replace(/^(};)$/m, `${newEntry}\n$1`);
  fs.writeFileSync(dataPath, dataContent, 'utf8');
  console.log(`✓ Добавлен pages.${key} в src/data/pages.js`);
}

console.log(`\nГотово! Не забудь перезапустить gulp.`);
