import {chromium, webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Render read-only fixtures first with Tests/Functional/spacing.php --html.
const base = process.env.ASTRYX_TEST_URL ?? 'https://typo3-astryx.ddev.site';
const fixtures = fs.readFileSync(process.env.ASTRYX_SPACING_HTML ?? '/tmp/astryx-spacing-fixtures.html', 'utf8');
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-spacing-evidence';
fs.mkdirSync(output, {recursive: true});
const assetDirectory = fs.readdirSync('public/_assets').find(name => {
  const file = `public/_assets/${name}`;
  return fs.lstatSync(file).isSymbolicLink() && /typo3[-_]astryx/.test(fs.readlinkSync(file));
});
assert(assetDirectory, 'Missing published extension assets');
const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json', 'utf8'));
const entry = Object.entries(manifest).find(([key]) => /(?:typo3-astryx|typo3_astryx)\/Resources\/Private\/JavaScript\/Main\.entry\.js$/.test(key))?.[1];
assert(entry, 'Missing consuming Vite entrypoint');
const modes = {
  packaged: [`_assets/${assetDirectory}/Assets/astryx.css`],
  vite: entry.css.map(file => `_assets/vite/${file}`),
};
const report = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    for (const [mode, css] of Object.entries(modes)) {
      const page = await browser.newPage({ignoreHTTPSErrors: true});
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
      const document = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="${base}/"><title>Spacing</title>${css.map(file => `<link rel="stylesheet" href="${file}">`).join('')}<style>body{padding:24px}main{max-width:800px;margin:auto}#fixtures p{margin:0}</style></head><body class="astryx-root" data-astryx-theme="neutral" data-astryx-mode="light"><main id="fixtures" class="astryx-regions">${fixtures}</main></body></html>`;
      await page.route(base + '/__astryx-spacing-test__', route => route.fulfill({contentType: 'text/html', body: document}));
      await page.goto(base + '/__astryx-spacing-test__', {waitUntil: 'networkidle'});
      for (const width of [1280, 390]) {
        await page.setViewportSize({width, height: 850});
        const elements = await page.locator('#fixtures > .astryx-element').evaluateAll(elements => elements.map(element => {
          const css = getComputedStyle(element), rect = element.getBoundingClientRect();
          return {before: parseFloat(css.marginBlockStart), after: parseFloat(css.marginBlockEnd), font: parseFloat(css.fontSize), paddingBefore: css.paddingBlockStart, paddingAfter: css.paddingBlockEnd, top: rect.top, bottom: rect.bottom};
        }));
        assert.equal(elements.length, 36);
        const scale = [8, 2, 4, 8, 16, 24];
        for (const [index, element] of elements.entries()) {
          assert.equal(element.before, scale[Math.floor(index / 6)], `${name}/${mode}/${width}: before ${index}`);
          assert.equal(element.after, scale[index % 6], `${name}/${mode}/${width}: after ${index}`);
          assert.equal(element.paddingBefore, '0px');
          assert.equal(element.paddingAfter, '0px');
          if (index > 0) {
            assert(Math.abs(element.top - elements[index - 1].bottom - Math.max(elements[index - 1].after, element.before)) < 1, 'Content region must not add a grid gap or combine both outer margins');
          }
        }
        assert.equal(elements[0].before, elements[18].before, 'Default before equals Medium');
        assert.equal(elements[0].after, elements[3].after, 'Default after equals Medium');
        report.push({browser: name, mode, width, combinations: elements.length, status: 'passed'});
      }
      await page.screenshot({path: `${output}/${name}-${mode}-mobile.png`});
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally { await browser.close(); }
}
fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
