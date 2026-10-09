import {chromium, webkit, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Render fixtures first with Tests/Functional/code-block.php --html. No CMS records are changed.
const base = process.env.ASTRYX_TEST_URL ?? 'https://typo3-astryx.ddev.site';
const fixtures = fs.readFileSync(process.env.ASTRYX_CODE_BLOCK_HTML ?? '/tmp/astryx-code-block-fixtures.html', 'utf8');
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-code-block-evidence';
fs.mkdirSync(output, {recursive: true});
const extension = path.resolve('packages/typo3_astryx');
const publicAssets = path.resolve('public/_assets');
const assetDirectory = fs.readdirSync(publicAssets).find(name => {
  try { return fs.realpathSync(path.join(publicAssets, name)) === path.join(extension, 'Resources/Public'); } catch { return false; }
});
assert(assetDirectory, 'Missing Composer public-asset link');
const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json', 'utf8'));
const entry = Object.entries(manifest).find(([key]) => /(?:typo3-astryx|typo3_astryx)\/Resources\/Private\/JavaScript\/Main\.entry\.js$/.test(key))?.[1];
assert(entry, 'Missing consuming Vite entrypoint');
const assetModes = {
  packaged: {js: `_assets/${assetDirectory}/Assets/astryx.js`, css: [`_assets/${assetDirectory}/Assets/astryx.css`]},
  vite: {js: `_assets/vite/${entry.file}`, css: entry.css.map(file => `_assets/vite/${file}`)},
};
const documentHtml = mode => `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="${base}/"><title>Code Block preview</title>${assetModes[mode].css.map(file => `<link rel="stylesheet" href="${file}">`).join('')}<style>body{margin:0;padding:24px}main{max-width:800px;margin:auto}h1{font-size:28px;margin-bottom:16px}</style><script type="module" src="${assetModes[mode].js}"></script></head><body class="astryx-root" data-astryx-theme="neutral" data-astryx-mode="light"><main><h1>Code Block</h1>${fixtures}</main></body></html>`;
const report = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    for (const mode of Object.keys(assetModes)) {
      const context = await browser.newContext({ignoreHTTPSErrors: true, viewport: {width: 1100, height: 850}});
      if (name === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write'], {origin: base});
      else await context.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: async text => { window.copiedCode = text; }}});
      });
      const page = await context.newPage();
      const errors = [], failedAssets = [], highlighterRequests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) failedAssets.push(response.url()); });
      page.on('request', request => { if (request.url().includes('code-highlighter')) highlighterRequests.push(request.url()); });
      await page.route(base + '/__astryx-code-block-test__', route => route.fulfill({contentType: 'text/html', body: documentHtml(mode)}));
      await page.goto(base + '/__astryx-code-block-test__', {waitUntil: 'networkidle'});
      const blocks = page.locator('[data-astryx-code-block]');
      await expect(blocks).toHaveCount(11);
      assert.equal(highlighterRequests.length, 1, 'One shared highlighter chunk per page');
      assert.equal(await page.evaluate(() => window.codeWasExecuted), undefined);
      for (const block of await blocks.all()) {
        const code = block.locator('code');
        const original = await code.textContent();
        const language = await block.getAttribute('data-language');
        assert.equal(await block.locator('.astryx-code-block-gutter').count(), (await block.getAttribute('data-line-numbers')) === '1' ? 1 : 0);
        if (language !== 'plaintext') assert(await code.locator('[class^="hljs-"]').count() > 0, `Missing ${language} syntax highlighting`);
        const button = block.locator('[data-code-copy]');
        await expect(button).toHaveAttribute('aria-label', 'Copy code');
        await button.focus();
        await button.press('Enter');
        await expect(button).toHaveAttribute('data-state', 'copied');
        const copied = await page.evaluate(real => real ? navigator.clipboard.readText() : window.copiedCode, name === 'chromium');
        assert.equal(copied, original, `${language}: copy must preserve original whitespace without line numbers`);
        await expect(button).toBeFocused();
      }
      const first = blocks.first();
      const copy = first.locator('[data-code-copy]');
      await expect(copy).toHaveAttribute('aria-label', 'Copy code', {timeout: 5000});
      // Exercise denied Clipboard API, fallback success, failure feedback and focus restoration.
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: async () => { throw new Error('Clipboard denied'); }}});
        document.execCommand = () => { window.fallbackCode = document.querySelector('.astryx-code-copy-buffer').value; return true; };
      });
      await copy.press('Space');
      await expect(copy).toHaveAttribute('data-state', 'copied');
      assert.equal(await page.evaluate(() => window.fallbackCode), await first.locator('code').textContent());
      await expect(copy).toBeFocused();
      assert.equal(await page.locator('.astryx-code-copy-buffer').count(), 0);
      await page.evaluate(() => { document.execCommand = () => false; });
      await copy.click();
      await expect(copy).toHaveAttribute('data-state', 'error');
      await expect(first.locator('[role="status"]')).toHaveText('Copy failed. Select the code and copy it manually.');
      await expect(copy).toHaveAttribute('aria-label', 'Copy code', {timeout: 5000});
      const colors = [];
      for (const theme of ['neutral', 'stone', 'ocean']) for (const colorMode of ['light', 'dark']) {
        await page.locator('body').evaluate((body, values) => { body.dataset.astryxTheme = values.theme; body.dataset.astryxMode = values.colorMode; }, {theme, colorMode});
        colors.push({theme, colorMode, background: await first.evaluate(block => getComputedStyle(block).backgroundColor)});
        const axe = await new AxeBuilder({page}).include('[data-astryx-code-block]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        assert.deepEqual(axe.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.target)})), [], `${theme}/${colorMode} accessibility`);
        if (theme === 'neutral') {
          await page.screenshot({path: `${output}/${name}-${mode}-${colorMode}.png`});
          await first.screenshot({path: `${output}/${name}-${mode}-${colorMode}-component.png`});
        }
      }
      assert.notEqual(colors[0].background, colors[1].background);
      await page.setViewportSize({width: 390, height: 844});
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert(await first.locator('pre').evaluate(pre => pre.scrollWidth > pre.clientWidth), 'Long code scrolls inside the block on mobile');
      await page.screenshot({path: `${output}/${name}-${mode}-mobile.png`});
      assert.deepEqual(errors, []);
      assert.deepEqual(failedAssets, []);
      // A page without code must not request syntax grammars.
      highlighterRequests.length = 0;
      await page.route(base + '/__astryx-no-code-test__', route => route.fulfill({contentType: 'text/html', body: documentHtml(mode).replace(fixtures, '')}));
      await page.goto(base + '/__astryx-no-code-test__', {waitUntil: 'networkidle'});
      assert.equal(highlighterRequests.length, 0);
      await context.close();
      const noJs = await browser.newContext({ignoreHTTPSErrors: true, javaScriptEnabled: false, viewport: {width: 390, height: 844}});
      const fallback = await noJs.newPage();
      await fallback.route(base + '/__astryx-code-block-test__', route => route.fulfill({contentType: 'text/html', body: documentHtml(mode)}));
      await fallback.goto(base + '/__astryx-code-block-test__');
      await expect(fallback.locator('[data-astryx-code-block]')).toHaveCount(11);
      assert.equal(await fallback.locator('[data-code-copy]:visible').count(), 0);
      assert.equal(await fallback.evaluate(() => window.codeWasExecuted), undefined);
      assert(await fallback.locator('code').nth(3).textContent().then(text => text.includes('<script>')));
      assert(await fallback.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await noJs.close();
      report.push({browser: name, assets: mode, status: 'passed', languages: 11, colors});
      fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
      console.log(`${name}/${mode}: syntax, clipboard, failure/fallback, accessibility, mobile and no-JS passed`);
    }
  } finally { await browser.close(); }
}
