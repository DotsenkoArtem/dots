'use strict';

/**
 * Integration tests for the Gulp build system.
 * Runs `gulp build` via before() hook, then asserts on:
 *   1. src/data/pages.js structure integrity
 *   2. Output files existence in public/
 *   3. HTML content correctness
 *   4. CSS content correctness
 */

const { test, before, describe } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

const siteData = require('../src/data/pages.js');

// ── helpers ──────────────────────────────────────────────────────────────────

function filePath(rel) {
  return path.join(PUBLIC, rel);
}

function exists(rel) {
  return fs.existsSync(filePath(rel));
}

function read(rel) {
  return fs.readFileSync(filePath(rel), 'utf8');
}

function fileSize(rel) {
  return fs.statSync(filePath(rel)).size;
}

function allChildPages() {
  const children = [];
  for (const [parentKey, page] of Object.entries(siteData.pages)) {
    if (!page.isMenuItemHasChildren) continue;
    for (const [childKey, child] of Object.entries(page.isMenuItemHasChildren)) {
      children.push({ parentKey, childKey, child });
    }
  }
  return children;
}

// ── run build before all tests ───────────────────────────────────────────────

before(() => {
  console.log('\n  [build] running `gulp build` (production)...');
  execSync('npx cross-env NODE_ENV=production gulp build', {
    cwd: ROOT,
    stdio: 'inherit',
    timeout: 180_000,
  });
  console.log('  [build] done\n');
});

// ── 1. src/data/pages.js structure ───────────────────────────────────────────

describe('data: src/data/pages.js integrity', () => {
  test('exports required fields', () => {
    assert.ok(siteData.pages, 'pages missing');
    assert.ok(Array.isArray(siteData.fontsPreload), 'fontsPreload should be array');
    assert.ok(typeof siteData.author === 'string', 'author should be string');
    assert.ok(typeof siteData.themeColor === 'string', 'themeColor should be string');
    assert.ok(typeof siteData.ieBung === 'boolean', 'ieBung should be boolean');
  });

  test('fontsPreload entries all end in .woff2', () => {
    assert.ok(siteData.fontsPreload.length > 0, 'fontsPreload is empty');
    for (const font of siteData.fontsPreload) {
      assert.match(font, /\.woff2$/, `"${font}" should end in .woff2`);
    }
  });

  test('all top-level pages have name and title', () => {
    for (const [key, page] of Object.entries(siteData.pages)) {
      assert.ok(page.name, `pages.${key} missing name`);
      assert.ok(page.title, `pages.${key} missing title`);
    }
  });

  test('all pages have required fileStem field', () => {
    for (const [key, page] of Object.entries(siteData.pages)) {
      assert.ok(page.fileStem, `pages.${key} missing fileStem`);
    }
    for (const { parentKey, childKey, child } of allChildPages()) {
      assert.ok(
        child.fileStem,
        `pages.${parentKey}.isMenuItemHasChildren.${childKey} missing fileStem`
      );
      assert.ok(
        child.name,
        `pages.${parentKey}.isMenuItemHasChildren.${childKey} missing name`
      );
      assert.ok(
        child.title,
        `pages.${parentKey}.isMenuItemHasChildren.${childKey} missing title`
      );
    }
  });

  test('no duplicate child page keys across all pages', () => {
    const seen = new Set();
    for (const { childKey } of allChildPages()) {
      assert.ok(!seen.has(childKey), `Duplicate child key: "${childKey}"`);
      seen.add(childKey);
    }
  });

  test('fileStem values reference existing pug templates', () => {
    const stems = new Set();
    for (const page of Object.values(siteData.pages)) {
      if (page.fileStem) stems.add(page.fileStem);
    }
    for (const { child } of allChildPages()) {
      if (child.fileStem) stems.add(child.fileStem);
    }
    for (const stem of stems) {
      const tmplPath = path.join(ROOT, 'src/pug/pages', `${stem}.pug`);
      assert.ok(
        fs.existsSync(tmplPath),
        `Template src/pug/pages/${stem}.pug not found`
      );
    }
  });
});

// ── 2. output files exist ────────────────────────────────────────────────────

describe('output: required files exist in public/', () => {
  for (const [key] of Object.entries(siteData.pages)) {
    test(`${key}.html`, () => {
      assert.ok(exists(`${key}.html`), `public/${key}.html not found`);
    });
  }

  for (const { childKey } of allChildPages()) {
    test(`${childKey}.html (child page)`, () => {
      assert.ok(exists(`${childKey}.html`), `public/${childKey}.html not found`);
    });
  }

  test('css/style.css', () => assert.ok(exists('css/style.css')));
  test('css/style.min.css', () => assert.ok(exists('css/style.min.css')));
  // Sourcemaps are only emitted in development mode — production build should NOT have them
  test('css/style.css.map absent in production build', () => {
    assert.ok(!exists('css/style.css.map'), 'sourcemap should not be emitted in production build');
  });

  for (const font of siteData.fontsPreload) {
    const woff = font.replace('.woff2', '.woff');
    test(`fonts/${font}`, () => assert.ok(exists(`fonts/${font}`), `public/fonts/${font} not found`));
    test(`fonts/${woff}`, () => assert.ok(exists(`fonts/${woff}`), `public/fonts/${woff} not found`));
  }
});

// ── 3. HTML content ───────────────────────────────────────────────────────────

describe('output: HTML content', () => {
  for (const [key, page] of Object.entries(siteData.pages)) {
    test(`${key}.html — <title> matches pages.js`, () => {
      const html = read(`${key}.html`);
      assert.ok(
        html.includes(`<title>${page.title}</title>`),
        `${key}.html: expected title "${page.title}"`
      );
    });
  }

  for (const { childKey, child } of allChildPages()) {
    test(`${childKey}.html — <title> matches child page data`, () => {
      const html = read(`${childKey}.html`);
      assert.ok(
        html.includes(`<title>${child.title}</title>`),
        `${childKey}.html: expected title "${child.title}"`
      );
    });

    test(`${childKey}.html — preloads only .woff2 fonts`, () => {
      const html = read(`${childKey}.html`);
      assert.doesNotMatch(
        html,
        /rel="preload"[^>]+href="fonts\/[^"]+\.ttf"/,
        `${childKey}.html: should not preload .ttf fonts`
      );
      assert.doesNotMatch(
        html,
        /type="font\/ttf"/,
        `${childKey}.html: should not have type="font/ttf"`
      );
    });

    test(`${childKey}.html — <meta name="author"> present`, () => {
      const html = read(`${childKey}.html`);
      assert.match(html, /meta name="author"/, `${childKey}.html: missing author meta`);
    });
  }

  test('index.html — preloads all woff2 fonts from fontsPreload', () => {
    const html = read('index.html');
    for (const font of siteData.fontsPreload) {
      assert.ok(
        html.includes(`href="fonts/${font}"`),
        `index.html: missing preload href for "${font}"`
      );
    }
  });

  test('index.html — no .ttf font preloads', () => {
    const html = read('index.html');
    assert.doesNotMatch(html, /href="fonts\/[^"]+\.ttf"/, 'index.html: .ttf href found in preload');
  });

  test('index.html — font preload type is font/woff2', () => {
    const html = read('index.html');
    // All preload links should declare font/woff2, not font/ttf
    const preloadBlocks = html.match(/<link rel="preload"[^>]+>/g) || [];
    const fontPreloads = preloadBlocks.filter((l) => l.includes('as="font"'));
    assert.ok(fontPreloads.length > 0, 'index.html: no font preload links found');
    for (const link of fontPreloads) {
      assert.ok(
        link.includes('type="font/woff2"'),
        `index.html: font preload missing type="font/woff2": ${link}`
      );
    }
  });
});

// ── 4. CSS content ────────────────────────────────────────────────────────────

describe('output: CSS content', () => {
  test('style.min.css is smaller than style.css', () => {
    assert.ok(
      fileSize('css/style.min.css') < fileSize('css/style.css'),
      `style.min.css (${fileSize('css/style.min.css')} bytes) should be smaller than style.css (${fileSize('css/style.css')} bytes)`
    );
  });

  test('style.css contains no "block2" typo', () => {
    assert.doesNotMatch(read('css/style.css'), /block2/, 'style.css: found "block2" typo');
  });

  test('style.min.css contains no "block2" typo', () => {
    assert.doesNotMatch(read('css/style.min.css'), /block2/, 'style.min.css: found "block2" typo');
  });

  test('style.css is not empty', () => {
    assert.ok(fileSize('css/style.css') > 100, 'style.css is suspiciously small');
  });

  test('style.min.css is not empty', () => {
    assert.ok(fileSize('css/style.min.css') > 100, 'style.min.css is suspiciously small');
  });
});
