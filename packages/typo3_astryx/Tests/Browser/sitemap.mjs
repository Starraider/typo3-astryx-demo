import {chromium, webkit, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = process.env.ASTRYX_TEST_URL ?? 'https://typo3-astryx.ddev.site';
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-sitemap-evidence';
const fixture = fs.readFileSync(process.env.ASTRYX_SITEMAP_HTML ?? '/tmp/astryx-sitemap-fixtures.html', 'utf8');
const report = [];
fs.mkdirSync(output, {recursive: true});
const published = fs.readdirSync('public/_assets').find(dir => {
  try { return fs.realpathSync(`public/_assets/${dir}`).endsWith('/packages/typo3_astryx/Resources/Public'); } catch { return false; }
});
assert(published, 'Extension assets must be published');
const packaged = `${base}/_assets/${published}/Assets`;

for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ignoreHTTPSErrors: true, javaScriptEnabled, reducedMotion: 'reduce'});
      const page = await context.newPage();
      const badAssets = [], errors = [];
      page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) badAssets.push(response.url()); });
      page.on('pageerror', error => errors.push(error.message));
      for (const width of [1440, 390]) {
        await page.setViewportSize({width, height: 1000});
        await page.goto(`${base}/sitemap`, {waitUntil: 'networkidle'});
        const tree = page.locator('[data-astryx-tree-list]');
        await expect(tree).toBeVisible();
        const links = tree.locator('.astryx-tree-list-link');
        assert(await links.count() > 5, 'Real TYPO3 descendants must be available');
        assert.equal(await tree.locator('[aria-current="page"]').count(), 1);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        if (javaScriptEnabled) {
          await expect(tree).toHaveAttribute('data-enhanced', '');
          const toggle = tree.locator('[data-tree-toggle]').first();
          await expect(toggle).toHaveAttribute('aria-expanded', 'false');
          await toggle.click();
          await expect(toggle).toHaveAttribute('aria-expanded', 'true');
          const child = tree.locator('[data-tree-item]').nth(1);
          await expect(child).toBeVisible();
          await page.keyboard.press('ArrowRight');
          await expect(child).toBeFocused();
          await page.keyboard.press('ArrowLeft');
          await expect(tree.locator('[data-tree-item]').first()).toBeFocused();
          const ax = await new AxeBuilder({page}).include('[data-astryx-tree-list]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
          assert.deepEqual(ax.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.target)})), []);
          await tree.screenshot({path: `${output}/${name}-live-${width}.png`});
        } else {
          assert.equal(await tree.locator('[role="tree"]').count(), 0);
          for (const link of await links.all()) await expect(link).toBeVisible();
          for (const toggle of await tree.locator('[data-tree-toggle]').all()) await expect(toggle).toBeHidden();
          await tree.screenshot({path: `${output}/${name}-no-js-${width}.png`});
        }
        report.push({browser: name, pipeline: 'live-vite', width, javaScriptEnabled, status: 'passed'});
      }
      assert.deepEqual(badAssets, []);
      assert.deepEqual(errors, []);
      await context.close();
    }

    const context = await browser.newContext({ignoreHTTPSErrors: true, reducedMotion: 'reduce'});
    await context.route('https://example.org/**', route => route.fulfill({body: '<!doctype html><title>Linked destination</title>'}));
    const page = await context.newPage();
    await page.goto(`${base}/sitemap`, {waitUntil: 'networkidle'});
    const viteCss = await page.locator('link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(node => node.href));
    const viteJs = await page.locator('script[type="module"][src]').evaluateAll(nodes => nodes.map(node => node.src));
    assert(viteCss.some(url => url.includes('/_assets/vite/')) && viteJs.length, 'Live page must load consuming production bundles');
    const render = async (css, js, theme, mode, direction = 'ltr') => {
      // Real Fluid-rendered four-level/multiple-tree fixture, exercising both shipped pipelines.
      const url = `${base}/__astryx_sitemap_browser_fixture`;
      await page.unroute(url);
      await page.route(url, route => route.fulfill({contentType: 'text/html', body: `<!doctype html><html lang="en" dir="${direction}"><head><base href="${base}/"><title>Sitemap fixture</title>${css.map(url => `<link rel="stylesheet" href="${url}">`).join('')}</head><body class="astryx-root" data-astryx-theme="${theme}" data-astryx-mode="${mode}"><main style="width: min(100% - 32px, 720px); margin: 24px auto"><h1>Sitemap fixture</h1>${fixture}<button id="after-tree">After tree</button></main>${js.map(url => `<script type="module" src="${url}"></script>`).join('')}</body></html>`}));
      await page.goto(url, {waitUntil: 'networkidle'});
      await expect(page.locator('[data-astryx-tree-prefix="fixture-tree"]')).toHaveAttribute('data-enhanced', '');
    };
    for (const [pipeline, css, js] of [['vite', viteCss, viteJs], ['packaged', [`${packaged}/astryx.css`], [`${packaged}/astryx.js`]]]) {
      for (const width of [1440, 390]) for (const theme of ['neutral', 'stone', 'ocean']) for (const mode of ['light', 'dark']) {
        await page.setViewportSize({width, height: 1000});
        await render(css, js, theme, mode);
        const tree = page.locator('[data-astryx-tree-prefix="fixture-tree"]');
        const parent = tree.locator('[data-tree-item]').nth(0);
        const child = tree.locator('[data-tree-item]').nth(1);
        const grandchild = tree.locator('[data-tree-item]').nth(2);
        const current = tree.locator('[data-tree-item]').nth(3);
        const closed = tree.locator('[data-tree-item]').nth(6);
        const hidden = tree.locator('[data-tree-item]').nth(7);
        const last = tree.locator('[data-tree-item]').nth(8);
        const oneStop = async () => assert.equal(await tree.locator('[tabindex="0"]').count(), 1);
        await expect(parent).toHaveAttribute('aria-expanded', 'true');
        await expect(tree.getByRole('treeitem', {name: 'Parent & page', exact: true})).toHaveCount(1);
        await expect(child).toHaveAttribute('aria-expanded', 'true');
        await expect(grandchild).toHaveAttribute('aria-expanded', 'true');
        await expect(hidden).toBeHidden();
        await oneStop();
        await current.focus();
        await current.press('Home'); await expect(parent).toBeFocused();
        assert.equal(await parent.locator(':scope > .astryx-tree-list-row').evaluate(node => getComputedStyle(node).outlineStyle), 'solid');
        await parent.press('ArrowRight'); await expect(child).toBeFocused();
        await child.press('ArrowDown'); await expect(grandchild).toBeFocused();
        await grandchild.press('ArrowRight'); await expect(current).toBeFocused();
        await current.press('ArrowLeft'); await expect(grandchild).toBeFocused();
        await grandchild.press('ArrowLeft'); await expect(grandchild).toHaveAttribute('aria-expanded', 'false');
        await expect(current).toBeHidden();
        await grandchild.press(' '); await expect(current).toBeVisible();
        await grandchild.press('Home'); await parent.press(' '); await expect(child).toBeHidden();
        await parent.press('ArrowDown'); await expect(closed).toBeFocused();
        await closed.press('ArrowRight'); await expect(hidden).toBeVisible();
        await closed.press('ArrowRight'); await expect(hidden).toBeFocused();
        await hidden.press('ArrowUp'); await expect(closed).toBeFocused();
        await closed.press('End'); await expect(last).toBeFocused();
        await last.press('p'); await expect(parent).toBeFocused();
        await parent.press('*'); await expect(child).toBeVisible();
        await expect(closed).toHaveAttribute('aria-expanded', 'true');
        await oneStop();
        // Collapse a branch while its descendant owns focus; no invisible tab stop remains.
        await current.focus();
        await parent.locator(':scope > .astryx-tree-list-row > button').click();
        await expect(parent).toBeFocused(); await oneStop();
        await parent.press('ArrowRight');
        await expect(grandchild).toHaveAttribute('aria-expanded', 'true');
        const rows = tree.locator('.astryx-tree-list-row');
        const boxes = await rows.evaluateAll(nodes => nodes.map(node => {const b=node.getBoundingClientRect(); return {x:b.x,y:b.y,width:b.width,height:b.height,label:node.querySelector('a').getBoundingClientRect().x};}));
        assert(Math.abs(boxes[1].x - boxes[0].x - 16) < 1, 'Children advance one 16px step');
        assert(Math.abs(boxes[3].x - boxes[0].x - 48) < 1, 'Deep branches retain indentation');
        assert(Math.abs(boxes[6].label - boxes[8].label) < 1, 'Root leaves align with branch labels');
        assert(Math.abs(boxes[3].label - boxes[2].label - 16) < 1, 'Nested leaves reserve the chevron column');
        assert(boxes[8].height > boxes[6].height, 'Long labels wrap');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No mobile overflow');
        const guides = await tree.locator('li > ul').evaluateAll(nodes => nodes.map(node => {const c=getComputedStyle(node,'::before');return {content:c.content,width:c.borderInlineStartWidth,color:c.borderInlineStartColor};}));
        assert(guides.every(guide => guide.content === '""' && guide.width === '1px' && guide.color !== 'transparent'), 'Every branch has a visible guide');
        assert.equal(await tree.locator('.astryx-tree-list-chevron').first().evaluate(node => getComputedStyle(node).transitionDuration), '0s');
        await last.press('Tab');
        assert(await page.locator('[data-astryx-tree-prefix="second-tree"]').evaluate(node => node.contains(document.activeElement)), 'Tab leaves the first tree for the next');
        await tree.screenshot({path: `${output}/${name}-${pipeline}-${width}-${theme}-${mode}.png`});
        report.push({browser: name, pipeline, width, theme, mode, status: 'passed'});
      }
      await render(css, js, 'neutral', 'light', 'rtl');
      const parent = page.locator('[data-astryx-tree-prefix="fixture-tree"] [data-tree-item]').first();
      const child = page.locator('[data-astryx-tree-prefix="fixture-tree"] [data-tree-item]').nth(1);
      await parent.focus(); await parent.press('ArrowLeft'); await expect(child).toBeFocused();
      await child.press('ArrowRight'); await expect(child).toHaveAttribute('aria-expanded', 'false');
      await child.press('ArrowRight'); await expect(parent).toBeFocused();
      const target = page.locator('[data-astryx-tree-prefix="fixture-tree"] [data-tree-item]').nth(5);
      const popupPromise = page.waitForEvent('popup');
      await target.press('Enter');
      const popup = await popupPromise;
      await popup.waitForLoadState();
      assert.equal(popup.url(), 'https://example.org/unsafe');
      await popup.close();
    }
    await page.goto(`${base}/sitemap`, {waitUntil: 'networkidle'});
    const liveFirst = page.locator('[data-tree-item]').first();
    const destination = await liveFirst.locator(':scope > .astryx-tree-list-row > a').getAttribute('href');
    await liveFirst.press('Enter');
    await page.waitForURL(new URL(destination, base).href);
    await context.close();
  } finally { await browser.close(); }
}
fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2) + '\n');
console.log(`Sitemap: ${report.length} live/pipeline/viewport/theme/mode checks passed, including no-JavaScript navigation, nested keyboard focus, guide alignment, RTL, original link targets and axe accessibility.`);
