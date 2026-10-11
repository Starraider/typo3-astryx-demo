import {chromium, webkit, expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = process.env.ASTRYX_TEST_URL ?? 'https://astryx-fixture.ddev.site';
const viteBase = process.env.ASTRYX_VITE_ASSET_URL ?? 'https://typo3-astryx.ddev.site';
const fixture = JSON.parse(fs.readFileSync(process.env.ASTRYX_SINGLE_COLUMN_FIXTURE ?? 'var/astryx-fixture/var/single-column-fixture.json'));
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-single-column-evidence';
fs.mkdirSync(output, {recursive: true});
const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json'));
const entry = Object.entries(manifest).find(([key]) => /(?:typo3-astryx|typo3_astryx)\/Resources\/Private\/JavaScript\/Main\.entry\.js$/.test(key))?.[1];
assert(entry, 'Missing consuming Vite entrypoint');
const viteCss = [...new Set([...entry.css, ...Object.entries(manifest).filter(([key, value]) => key.startsWith('_') && value.file.endsWith('.css')).map(([, value]) => value.file)])];
const report = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    for (const mode of ['packaged', 'vite']) for (const javascript of [false, true]) {
      const context = await browser.newContext({ignoreHTTPSErrors: true, javaScriptEnabled: javascript, reducedMotion: 'reduce'});
      const page = await context.newPage();
      const failures = [];
      page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
      page.on('pageerror', error => failures.push(error.message));
      try {
      if (mode === 'vite') {
        await page.route(base + '/_assets/vite/**', async route => {
          const response = await route.fetch({url: route.request().url().replace(base, viteBase)});
          await route.fulfill({response});
        });
        await page.route(base + '/astryx-single-column-check', async route => {
          const response = await route.fetch();
          const html = (await response.text())
            .replace(/<link\b[^>]*href="[^"]*\/Assets\/astryx\.css[^>]*>/g, '')
            .replace(/<script\b[^>]*src="[^"]*\/Assets\/astryx\.js[^>]*><\/script>/g, '')
            .replace('</head>', viteCss.map(file => `<link rel="stylesheet" href="${base}/_assets/vite/${file}">`).join('') + `<script type="module" src="${base}/_assets/vite/${entry.file}"></script></head>`);
          await route.fulfill({response, body: html});
        });
      }
      for (const width of [1440, 900, 390]) {
        await page.setViewportSize({width, height: 900});
        await page.goto(base + '/astryx-single-column-check', {waitUntil: 'networkidle'});
        await expect(page.locator('[data-astryx-single-column]')).toHaveCount(Object.keys(fixture.records).length);
        const sheets = await page.locator('link[rel="stylesheet"]').evaluateAll(links => links.map(link => link.href));
        assert(sheets.some(url => mode === 'packaged' ? /\/Assets\/astryx\.css/.test(url) : url.startsWith(base + '/_assets/vite/')), 'Wrong asset path');
        for (const [key, record] of Object.entries(fixture.records)) {
          const root = page.locator(`#c${record.uid} > [data-astryx-single-column]`);
          await expect(root).toBeVisible();
          await expect(root).toHaveAttribute('data-astryx-background', record.background);
          await expect(root).toHaveAttribute('data-astryx-single-column', record.width);
          if (record.child) {
            await expect(page.locator(`#c${record.child}`)).toHaveCount(1);
            await expect(root.locator(`#c${record.child}`)).toBeVisible();
          }
          const geometry = await root.evaluate(element => {
            const rect = element.getBoundingClientRect();
            const parent = element.parentElement.getBoundingClientRect();
            return {left: rect.left, width: rect.width, parent: parent.width, viewport: document.documentElement.clientWidth};
          });
          if (record.width === 'constrained' || (!javascript && key === 'nested')) assert(Math.abs(geometry.width - geometry.parent) < 1, `${key}: constrained width`);
          else if (javascript || key !== 'nested') {
            assert(Math.abs(geometry.left) < 1 && Math.abs(geometry.width - geometry.viewport) < 1, `${name}/${mode}/${javascript}/${width}/${key}: full-bleed geometry ${JSON.stringify(geometry)}`);
          }
          if (record.width === 'full-bleed') {
            const contentBox = await root.locator(':scope > .astryx-container-single-col-content').boundingBox();
            const shellBox = await page.locator('.astryx-header .astryx-shell-width').boundingBox();
            assert(contentBox.width <= shellBox.width + 1, `${key}: child content exceeds normal site width`);
            if (javascript || key !== 'nested') {
              assert(Math.abs(contentBox.x - shellBox.x) < 1 && Math.abs(contentBox.width - shellBox.width) < 1,
                `${key}: heading/children must align with normal content width`);
            }
            if (record.child) {
              const childBox = await root.locator(`#c${record.child}`).boundingBox();
              assert(Math.abs(childBox.width - contentBox.width) < 1, `${key}: child record width`);
            }
          }
          const image = root.locator('.astryx-background-media img');
          await expect(image).toHaveCount(record.image ? 1 : 0);
          if (record.image) {
            await image.scrollIntoViewIfNeeded();
            await expect.poll(() => image.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
            await expect(image).toHaveAttribute('alt', '');
            await expect(image).toHaveAttribute('srcset', /640w.*1280w.*1920w/);
            const coverage = await image.evaluate(image => {
              const rect = image.getBoundingClientRect(), root = image.parentElement.parentElement.getBoundingClientRect();
              return {loaded: image.complete && image.naturalWidth > 0, cover: getComputedStyle(image).objectFit, width: rect.width - root.width, height: rect.height - root.height};
            });
            assert(coverage.loaded && coverage.cover === 'cover' && Math.abs(coverage.width) < 1 && Math.abs(coverage.height) < 1, `${key}: cover image ${JSON.stringify(coverage)}`);
            await expect(root.locator('figcaption')).toHaveCount(0);
            // The background must grow with its child records, without a fixed height.
            await root.locator('.astryx-container-single-col-content').evaluate(content => content.style.minHeight = '700px');
            const tall = await image.boundingBox(), outer = await root.boundingBox();
            assert(Math.abs(tall.height - outer.height) < 1, `${key}: growing background`);
            await root.locator('.astryx-container-single-col-content').evaluate(content => content.style.removeProperty('min-height'));
          }
        }
        for (const theme of ['neutral', 'stone', 'ocean']) for (const pageMode of ['light', 'dark']) {
          await page.locator('.astryx-root').evaluate((root, {theme, pageMode}) => { root.dataset.astryxTheme = theme; root.dataset.astryxMode = pageMode; }, {theme, pageMode});
          const palettes = await page.locator('[data-astryx-single-column]').evaluateAll(roots => {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            const ctx = canvas.getContext('2d');
            const rgb = color => {
              ctx.clearRect(0, 0, 1, 1);
              ctx.fillStyle = color;
              ctx.fillRect(0, 0, 1, 1);
              return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
            };
            const luminance = channels => channels.map(channel => {
              const value = channel / 255;
              return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
            }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
            const pageStyle = getComputedStyle(document.querySelector('.astryx-root'));
            return roots.filter(root => root.querySelector('a')).map(root => {
              const style = getComputedStyle(root);
              const heading = root.querySelector('.astryx-heading'), prose = root.querySelector('.astryx-prose');
              const matches = style.color === pageStyle.color && !root.hasAttribute('data-astryx-mode')
                && (!heading || getComputedStyle(heading).color === pageStyle.color)
                && (!prose || getComputedStyle(prose).color === pageStyle.color);
              const bg = luminance(rgb(style.backgroundColor)), text = luminance(rgb(style.color));
              const contrast = (Math.max(bg, text) + 0.05) / (Math.min(bg, text) + 0.05);
              const outlined = style.outlineStyle === 'solid' && style.outlineWidth === '1px' && style.outlineOffset === '-1px';
              const distinct = rgb(style.backgroundColor).some((value, index) => value !== rgb(pageStyle.backgroundColor)[index]);
              return {matches, outlined, distinct, bg, contrast, scheme: style.colorScheme, shade: root.dataset.astryxBackground};
            });
          });
          assert(palettes.every(item => item.matches && item.scheme === pageMode), `${theme}/${pageMode}: inherited page palette`);
          assert(palettes.every(item => item.distinct && item.outlined && item.contrast >= 4.5), `${theme}/${pageMode}: distinct, readable sections ${JSON.stringify(palettes)}`);
          const lighter = palettes.filter(item => item.shade === 'light'), darker = palettes.filter(item => item.shade === 'dark');
          assert(lighter.length && darker.length && Math.min(...lighter.map(item => item.bg)) > Math.max(...darker.map(item => item.bg)), `${theme}/${pageMode}: ordered background shades`);
          assert(palettes.every(item => pageMode === 'light' ? item.bg > 0.5 : item.bg < 0.15), `${theme}/${pageMode}: both shades follow page mode`);
        }
        // Keyboard navigation follows the editorial order inside the child areas.
        const links = page.locator('[data-astryx-single-column] .astryx-prose a');
        await links.first().focus();
        for (let index = 0; index < await links.count(); index++) {
          await expect(links.nth(index)).toBeFocused();
          if (index + 1 < await links.count()) await page.keyboard.press(name === 'webkit' ? 'Alt+Tab' : 'Tab');
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'Horizontal overflow');
        await page.evaluate(() => { document.documentElement.dir = 'rtl'; window.dispatchEvent(new Event('resize')); });
        for (const [key, record] of Object.entries(fixture.records)) {
          if (record.width !== 'full-bleed' || (!javascript && key === 'nested')) continue;
          await expect.poll(() => page.locator(`#c${record.uid} > [data-astryx-single-column]`).evaluate(root => {
            const rect = root.getBoundingClientRect();
            return Math.abs(rect.left) < 1 && Math.abs(rect.width - document.documentElement.clientWidth) < 1;
          }), `${key}: RTL viewport edges`).toBe(true);
        }
        await page.evaluate(() => { document.documentElement.dir = 'ltr'; window.dispatchEvent(new Event('resize')); });
        if (javascript) {
          await page.setViewportSize({width: width + 20, height: 900});
          await expect.poll(() => page.locator(`#c${fixture.records.nested.uid} > [data-astryx-single-column]`).evaluate(root => {
            const rect = root.getBoundingClientRect();
            return Math.abs(rect.left) < 1 && Math.abs(rect.width - document.documentElement.clientWidth) < 1;
          })).toBe(true);
          await page.setViewportSize({width, height: 900});
        }
        // Honor the configured site content width instead of a fixed recipe width.
        const configuredWidth = await page.locator('.astryx-root').evaluate(root => root.style.getPropertyValue('--astryx-content-width'));
        await page.locator('.astryx-root').evaluate(root => root.style.setProperty('--astryx-content-width', '48rem'));
        for (const [key, record] of Object.entries(fixture.records)) {
          if (record.width !== 'full-bleed' || (!javascript && key === 'nested')) continue;
          await expect.poll(async () => {
            const box = await page.locator(`#c${record.uid} > [data-astryx-single-column] > .astryx-container-single-col-content`).boundingBox();
            const shell = await page.locator('.astryx-header .astryx-shell-width').boundingBox();
            return Math.abs(box.x - shell.x) < 1 && Math.abs(box.width - shell.width) < 1;
          }, `${key}: configured content width`).toBe(true);
        }
        await page.locator('.astryx-root').evaluate((root, value) => root.style.setProperty('--astryx-content-width', value), configuredWidth);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({path: `${output}/${name}-${mode}-${javascript ? 'js' : 'no-js'}-${width}.png`, fullPage: true});
      }
      assert.deepEqual(failures, [], 'Browser errors or failed assets');
      report.push({browser: name, assets: mode, javascript, widths: [1440, 900, 390], themes: ['neutral', 'stone', 'ocean'], status: 'passed'});
      fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
      console.log(`${name}/${mode}/${javascript ? 'js' : 'no-js'}: backgrounds, image cover, widths, nested children, theme palettes, keyboard and mobile passed`);
      } finally {
        await page.unrouteAll({behavior: 'ignoreErrors'});
        await context.close();
      }
    }
  } finally { await browser.close(); }
}
