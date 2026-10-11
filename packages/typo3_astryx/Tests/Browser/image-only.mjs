import {chromium, webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Actual TYPO3 templates and FAL sources rendered by Functional/image-only.php --html.
const base = new URL(process.env.ASTRYX_TEST_URL ?? 'https://typo3-astryx.ddev.site').origin;
const fixtures = fs.readFileSync(process.env.ASTRYX_IMAGE_ONLY_HTML ?? '/tmp/astryx-image-only-fixtures.html', 'utf8');
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-image-only-evidence';
fs.mkdirSync(output, {recursive: true});
const asset = fs.readdirSync('public/_assets').find(name => {
  const path = `public/_assets/${name}`;
  return fs.lstatSync(path).isSymbolicLink() && /typo3[-_]astryx/.test(fs.readlinkSync(path));
});
const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json', 'utf8'));
const entry = Object.entries(manifest).find(([key]) => /typo3[-_]astryx\/Resources\/Private\/JavaScript\/Main\.entry\.js$/.test(key))?.[1];
assert(asset && entry, 'Missing published assets');
const sharedCss = Object.values(manifest).filter(item => item.src?.startsWith('_') && item.file.endsWith('.css')).map(item => item.file);
const modes = {
  packaged: [`_assets/${asset}/Assets/astryx.css`],
  vite: [...new Set([...sharedCss, ...entry.css])].map(file => `_assets/vite/${file}`),
};
const columns = {one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, default: 3, invalid: 3};
const ratios = {landscape: 4 / 3, wide: 16 / 9, square: 1};
const report = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    for (const [mode, css] of Object.entries(modes)) {
      const page = await browser.newPage({ignoreHTTPSErrors: true, javaScriptEnabled: false, reducedMotion: 'reduce'});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {if (response.status() >= 400) errors.push(response.url());});
      const document = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="${base}/"><title>Image Only</title>${[...css, `_assets/${asset}/Css/backend-preview.css`].map(file => `<link rel="stylesheet" href="${file}">`).join('')}<style>main{max-width:1000px;margin:auto;padding:16px}section{margin-bottom:32px}</style></head><body class="astryx-root" data-astryx-theme="neutral" data-astryx-mode="light"><main>${fixtures}</main></body></html>`;
      await page.route(base + '/__astryx-image-only-test__', route => route.fulfill({contentType: 'text/html', body: document}));
      await page.goto(base + '/__astryx-image-only-test__', {waitUntil: 'networkidle'});
      // Lazy images must load before checking intrinsic dimensions.
      await page.locator('img').evaluateAll(images => images.forEach(image => image.loading = 'eager'));
      await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
      for (const width of [1280, 390]) {
        await page.setViewportSize({width, height: 900});
        const grids = await page.locator('[data-test-columns]').evaluateAll(elements => elements.map(element => {
          const grid = element.querySelector('.astryx-image-only'), css = getComputedStyle(grid), rect = grid.getBoundingClientRect();
          return {columns: element.dataset.testColumns, aspect: element.dataset.testAspect, incomplete: !!element.dataset.testIncomplete,
            tracks: css.gridTemplateColumns.split(' ').length, gap: parseFloat(css.columnGap), rowGap: parseFloat(css.rowGap), width: rect.width,
            images: [...grid.querySelectorAll('img')].map(image => {
              const rect = image.getBoundingClientRect(), figure = image.closest('figure').getBoundingClientRect();
              return {left: figure.left, top: figure.top, bottom: figure.bottom, width: rect.width, height: rect.height,
                sourceRatio: Number(image.getAttribute('width')) / Number(image.getAttribute('height')), fit: getComputedStyle(image).objectFit};
            })};
        }));
        assert.equal(grids.length, 41);
        for (const grid of grids) {
          const count = columns[grid.columns];
          assert.equal(grid.tracks, count, `${name}/${mode}/${width}: ${grid.columns}`);
          assert.equal(grid.gap, 16); assert.equal(grid.rowGap, 16);
          const expectedWidth = (grid.width - (count - 1) * grid.gap) / count;
          for (const [i, image] of grid.images.entries()) {
            assert(Math.abs(image.width - expectedWidth) < 1, 'Equal tracks, including incomplete rows');
            const expectedRatio = ratios[grid.aspect] ?? image.sourceRatio;
            assert(Math.abs(image.width / image.height - expectedRatio) < 0.025, `${grid.columns}/${grid.aspect}: incorrect image ratio`);
            assert.equal(image.fit, 'cover');
            const firstInRow = grid.images[Math.floor(i / count) * count];
            assert(Math.abs(image.top - firstInRow.top) < 1, 'Images align at row start');
            if (i % count !== 0) assert(Math.abs(image.left - grid.images[i - 1].left - expectedWidth - 16) < 1, 'Column spacing');
            if (i >= count && i % count === 0) {
              const previousRow = grid.images.slice(i - count, i);
              assert(Math.abs(image.top - Math.max(...previousRow.map(item => item.bottom)) - 16) < 1, 'Rows clear all images/captions');
            }
          }
          if (grid.columns === 'three' && !grid.incomplete) assert.equal(new Set(grid.images.map(image => Math.round(image.top))).size, 2, 'Six images form two rows of three');
        }
        const preview = await page.locator('.astryx-image-only-preview').evaluate(grid => ({tracks: getComputedStyle(grid).gridTemplateColumns.split(' ').length, images: grid.querySelectorAll('img').length}));
        assert.deepEqual(preview, {tracks: 3, images: 6});
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No mobile horizontal overflow');
        await page.locator('[data-test-columns="three"][data-test-aspect="landscape"]').screenshot({path: `${output}/${name}-${mode}-${width}.png`});
        report.push({browser: name, mode, width, cases: grids.length, noJavaScript: true, reducedMotion: true, status: 'passed'});
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {await browser.close();}
}
fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
