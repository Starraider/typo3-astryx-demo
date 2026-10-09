import {chromium, webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Uses a real page with Heading and text-only Textmedia, without changing records.
const url = process.env.ASTRYX_TEST_URL ?? 'https://typo3-astryx.ddev.site/page-2';
const base = new URL(url).origin;
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-heading-spacing-evidence';
fs.mkdirSync(output, {recursive: true});
const asset = fs.readdirSync('public/_assets').find(name => {
  const path = `public/_assets/${name}`;
  return fs.lstatSync(path).isSymbolicLink() && /typo3[-_]astryx/.test(fs.readlinkSync(path));
});
const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json', 'utf8'));
const entry = Object.entries(manifest).find(([key]) => /typo3[-_]astryx\/Resources\/Private\/JavaScript\/Main\.entry\.js$/.test(key))?.[1];
assert(asset && entry);
// Vite extracts shared StyleX recipes into a separate CSS asset also loaded by the site.
const sharedCss = Object.values(manifest).filter(item => item.src?.startsWith('_') && item.file.endsWith('.css')).map(item => item.file);
const modes = {packaged: [`_assets/${asset}/Assets/astryx.css`], vite: [...new Set([...sharedCss, ...entry.css])].map(file => `_assets/vite/${file}`)};
const report = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    const page = await browser.newPage({ignoreHTTPSErrors: true});
    assert.equal((await page.goto(url, {waitUntil: 'networkidle'})).status(), 200);
    const main = await page.locator('main').evaluate(el => el.outerHTML);
    for (const [mode, css] of Object.entries(modes)) {
      const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="${base}/"><title>Heading spacing</title>${css.map(file => `<link rel="stylesheet" href="${file}">`).join('')}</head><body class="astryx-root" data-astryx-theme="neutral" data-astryx-mode="light">${main}</body></html>`;
      await page.route(base + '/__astryx-heading-spacing-test__', route => route.fulfill({contentType: 'text/html', body: html}));
      await page.goto(base + '/__astryx-heading-spacing-test__', {waitUntil: 'networkidle'});
      // Exercise the no-subheader case using a clone of the actual Textmedia markup.
      await page.locator('.astryx-textmedia').first().evaluate(media => {
        const clone = media.closest('.astryx-element').cloneNode(true);
        clone.id = 'heading-spacing-without-subheader';
        clone.querySelector('.astryx-lead')?.remove();
        media.closest('.astryx-element').after(clone);
      });
      for (const width of [1280, 390]) {
        await page.setViewportSize({width, height: 850});
        const metrics = await page.locator('.astryx-heading').evaluateAll(elements => elements.map(heading => {
          const subtitle = heading.nextElementSibling?.matches('.astryx-lead') ? heading.nextElementSibling : null;
          const body = (subtitle ?? heading).nextElementSibling;
          const box = el => el.getBoundingClientRect();
          return {classes: heading.className, margin: getComputedStyle(heading).margin, subtitleMargin: subtitle && getComputedStyle(subtitle).margin,
            subtitleGap: subtitle && box(subtitle).top - box(heading).bottom,
            bodyGap: body && box(body).top - box(subtitle ?? heading).bottom};
        }));
        assert(metrics.length >= 3, 'Expected Heading, Textmedia and the no-subheader case');
        assert(metrics.some(item => item.subtitleGap === null && item.bodyGap !== null));
        for (const item of metrics) {
          assert.equal(item.margin, '0px', `${name}/${mode}/${width}: ${item.classes}`);
          if (item.subtitleGap !== null) {
            assert.equal(item.subtitleMargin, '0px');
            assert.equal(item.subtitleGap, 0, 'Supporting text sits directly below the heading');
          }
          if (item.bodyGap !== null) assert.equal(item.bodyGap, 8, 'Compact heading group to body gap');
        }
        const media = await page.locator('.astryx-textmedia').evaluateAll(elements => elements.map(el => {
          const text = el.querySelector('.astryx-textmedia-text'), r = el.getBoundingClientRect(), t = text.getBoundingClientRect();
          return {emptyMedia: el.querySelectorAll(':scope > .astryx-media:empty').length, textOnly: el.children.length === 1, width: r.width, textWidth: t.width, bottomGap: r.bottom - t.bottom};
        }));
        assert(media.some(item => item.textOnly), 'Expected text-only Textmedia');
        for (const item of media) {
          assert.equal(item.emptyMedia, 0);
          if (item.textOnly) { assert.equal(item.textWidth, item.width); assert.equal(item.bottomGap, 0); }
        }
        report.push({browser: name, mode, width, status: 'passed'});
      }
    }
    await page.goto(url, {waitUntil: 'networkidle'});
    await page.setViewportSize({width: 1280, height: 850});
    await page.screenshot({path: `${output}/${name}-page-2.png`});
  } finally {await browser.close();}
}
fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
