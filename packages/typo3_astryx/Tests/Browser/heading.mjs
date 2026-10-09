import {chromium, webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Uses the real templates rendered by Functional/heading.php; creates no records.
const base = new URL(process.env.ASTRYX_TEST_URL ?? 'https://typo3-astryx.ddev.site').origin;
const fixtures = fs.readFileSync(process.env.ASTRYX_HEADING_HTML ?? '/tmp/astryx-heading-fixtures.html', 'utf8');
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-heading-evidence';
fs.mkdirSync(output, {recursive: true});
const asset = fs.readdirSync('public/_assets').find(name => {
  const path = `public/_assets/${name}`;
  return fs.lstatSync(path).isSymbolicLink() && /typo3[-_]astryx/.test(fs.readlinkSync(path));
});
const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json', 'utf8'));
const entry = Object.entries(manifest).find(([key]) => /typo3[-_]astryx\/Resources\/Private\/JavaScript\/Main\.entry\.js$/.test(key))?.[1];
assert(asset && entry);
const sharedCss = Object.values(manifest).filter(item => item.src?.startsWith('_') && item.file.endsWith('.css')).map(item => item.file);
const modes = {packaged: [`_assets/${asset}/Assets/astryx.css`], vite: [...new Set([...sharedCss, ...entry.css])].map(file => `_assets/vite/${file}`)};
const report = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    const page = await browser.newPage({ignoreHTTPSErrors: true});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {if (response.status() >= 400) errors.push(response.url());});
    for (const [mode, css] of Object.entries(modes)) {
      const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="${base}/"><title>Heading alignment and links</title>${css.map(file => `<link rel="stylesheet" href="${file}">`).join('')}<style>main{max-width:1000px;margin:auto;padding:16px}body{--astryx-link:#2763c2}</style></head><body class="astryx-root" data-astryx-theme="neutral" data-astryx-mode="light"><main>${fixtures}</main></body></html>`;
      await page.route(base + '/__astryx-heading-test__', route => route.fulfill({contentType: 'text/html', body: html}));
      await page.goto(base + '/__astryx-heading-test__', {waitUntil: 'networkidle'});
      for (const width of [1280, 390]) {
        await page.setViewportSize({width, height: 850});
        for (const direction of ['ltr', 'rtl']) {
          await page.locator('main').evaluate((main, direction) => {main.dir = direction;}, direction);
          const metrics = await page.locator('[data-test-type]').evaluateAll(elements => elements.map(element => {
            const heading = element.querySelector('.astryx-heading'), link = heading?.querySelector('a'), subtitle = element.querySelector('.astryx-lead');
            return {type: element.dataset.testType, expected: element.dataset.testAlign, linked: element.dataset.testLinked === '1', align: heading && getComputedStyle(heading).textAlign,
              color: heading && getComputedStyle(heading).color, linkColor: link && getComputedStyle(link).color, subtitleAlign: subtitle && getComputedStyle(subtitle).textAlign};
          }));
          assert.equal(metrics.length, 160, 'Twenty content types × four choices × linked/unlinked');
          for (const item of metrics) {
            assert.equal(item.align, item.expected, `${name}/${mode}/${width}/${direction}: ${item.type}`);
            if (item.subtitleAlign) assert.equal(item.subtitleAlign, item.expected);
            if (item.linked) {
              assert.equal(item.color, item.linkColor, `${item.type}: heading must use link color`);
              assert.equal(item.linkColor, 'rgb(39, 99, 194)', 'Custom theme link color is respected');
            }
          }
          report.push({browser: name, mode, width, direction, cases: metrics.length, status: 'passed'});
        }
      }
      await page.locator('main').evaluate(main => {main.dir = 'ltr';});
      const link = page.locator('.astryx-heading a').first();
      await link.focus();
      assert(await link.evaluate(el => el === document.activeElement), 'Heading link is keyboard focusable');
      await page.screenshot({path: `${output}/${name}-${mode}.png`});
    }
    assert.deepEqual(errors, []);
    await page.goto(base + '/page-2', {waitUntil: 'networkidle'});
    assert(await page.locator('.astryx-heading').count() > 0, 'Live frontend renders the shared heading component');
    assert.deepEqual(errors, []);
  } finally {await browser.close();}
}
fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
