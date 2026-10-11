import {chromium, webkit, expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Uses a real TYPO3-rendered page with DataHandler-created parent/child records.
const base = process.env.ASTRYX_TEST_URL ?? 'https://astryx-fixture.ddev.site';
const viteBase = process.env.ASTRYX_VITE_ASSET_URL ?? 'https://typo3-astryx.ddev.site';
const fixture = JSON.parse(fs.readFileSync(process.env.ASTRYX_CONTAINERS_FIXTURE ?? 'var/astryx-fixture/var/containers-fixture.json'));
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-containers-evidence';
fs.mkdirSync(output, {recursive: true});
const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json'));
const entry = Object.entries(manifest).find(([key]) => /(?:typo3-astryx|typo3_astryx)\/Resources\/Private\/JavaScript\/Main\.entry\.js$/.test(key))?.[1];
assert(entry, 'Missing consuming Vite entrypoint');
const viteCss = [...new Set([...entry.css, ...Object.entries(manifest).filter(([key, value]) => key.startsWith('_') && value.file.endsWith('.css')).map(([, value]) => value.file)])];
const report = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    for (const mode of ['packaged', 'vite']) {
      const context = await browser.newContext({ignoreHTTPSErrors: true, javaScriptEnabled: false, reducedMotion: 'reduce'});
      const page = await context.newPage();
      const failedAssets = [];
      page.on('response', response => { if (response.status() >= 400) failedAssets.push(response.url()); });
      if (mode === 'vite') {
        // Serve the current integration bundles at the fixture's same-origin URLs.
        // TYPO3's Content Security Policy correctly blocks cross-origin stylesheets.
        await page.route(base + '/_assets/vite/**', async route => {
          const response = await route.fetch({url: route.request().url().replace(base, viteBase)});
          await route.fulfill({response});
        });
        await page.route(base + '/astryx-containers-check', async route => {
          const response = await route.fetch();
          const html = (await response.text())
            .replace(/<link\b[^>]*href="[^"]*\/Assets\/astryx\.css[^>]*>/g, '')
            .replace(/<script\b[^>]*src="[^"]*\/Assets\/astryx\.js[^>]*><\/script>/g, '')
            .replace('</head>', viteCss.map(file => `<link rel="stylesheet" href="${base}/_assets/vite/${file}">`).join('') + '</head>');
          await route.fulfill({response, body: html});
        });
      }
      for (const width of [1440, 900, 390]) {
        await page.setViewportSize({width, height: 1000});
        await page.goto(base + '/astryx-containers-check', {waitUntil: 'networkidle'});
        await expect(page.locator('.astryx-grid')).toHaveCount(Object.keys(fixture.records).length);
        const stylesheets = await page.locator('link[rel="stylesheet"]').evaluateAll(links => links.map(link => link.href));
        assert(stylesheets.some(url => mode === 'packaged' ? /\/Assets\/astryx\.css/.test(url) : url.startsWith(base + '/_assets/vite/')), 'Expected asset pipeline not loaded');
        for (const [key, record] of Object.entries(fixture.records)) {
          const grid = page.locator(`#c${record.uid} > .astryx-grid`);
          await expect(grid).toBeVisible();
          const dimensions = await grid.evaluate(grid => {
            const columns = [...grid.children].map(column => {
              const box = column.getBoundingClientRect();
              return {width: box.width, top: box.top};
            });
            const style = getComputedStyle(grid);
            return {width: grid.clientWidth, columns, gap: parseFloat(style.columnGap), normal: style.getPropertyValue('--astryx-space-6'), small: style.getPropertyValue('--astryx-space-3'), large: style.getPropertyValue('--astryx-space-8')};
          });
          const weights = {'50-50': [1, 1], '25-75': [1, 3], '75-25': [3, 1], '66-33': [2, 1], '33-66': [1, 2], three: [1, 1, 1], four: [1, 1, 1, 1]}[record.ratio];
          assert.equal(dimensions.columns.length, weights.length, `${key}: column count`);
          const first = dimensions.columns[0];
          if (dimensions.width < 640) {
            dimensions.columns.forEach((column, index) => {
              assert(Math.abs(column.width - dimensions.width) < 1 && (!index || column.top > dimensions.columns[index - 1].top), `${name}/${mode}/${key}/${width}: stacked column ${index + 1}`);
            });
          } else {
            dimensions.columns.forEach((column, index) => {
              assert(Math.abs(column.width / first.width - weights[index] / weights[0]) < .02 && Math.abs(column.top - first.top) < 1, `${name}/${mode}/${key}/${width}: column ${index + 1} width: ${JSON.stringify(dimensions)}`);
            });
          }
          assert(Math.abs(dimensions.gap - parseFloat(dimensions[record.gap])) < .1, `${key}: gap token`);
          if (key.includes('-normal') || key.includes('-small') || key.includes('-large')) {
            for (const side of record.sides ?? ['left', 'right']) {
              await expect(page.getByText(`${key} ${side} child`, {exact: false})).toHaveCount(1);
            }
          }
        }
        const links = page.locator('.astryx-grid a');
        await links.first().focus();
        for (let index = 0; index < await links.count(); index++) {
          await expect(links.nth(index)).toBeFocused();
          if (index + 1 < await links.count()) await page.keyboard.press(name === 'webkit' ? 'Alt+Tab' : 'Tab');
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal page overflow');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({path: `${output}/${name}-${mode}-${width}.png`, fullPage: true});
      }
      assert.deepEqual(failedAssets, [], 'Failed stylesheet/font requests');
      await context.close();
      report.push({browser: name, assets: mode, status: 'passed', widths: [1440, 900, 390], containers: Object.keys(fixture.records).length, javascript: false, reducedMotion: true});
      fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
      console.log(`${name}/${mode}: fixed/legacy ratios, gaps, nested content, mobile stacking, keyboard and no-JS passed`);
    }
  } finally { await browser.close(); }
}
