import {chromium, webkit, expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = process.env.ASTRYX_TEST_URL ?? 'https://astryx-fixture.ddev.site';
const fixture = JSON.parse(fs.readFileSync(process.env.ASTRYX_SELECTED_PAGES_FIXTURE ?? 'var/astryx-fixture/var/selected-pages-fixture.json', 'utf8'));
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-selected-pages-evidence';
fs.mkdirSync(output, {recursive: true});
const report = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    const context = await browser.newContext({ignoreHTTPSErrors: true, javaScriptEnabled: false, reducedMotion: 'reduce'});
    const page = await context.newPage();
    const failures = [];
    page.on('response', response => {if (response.url().startsWith(base) && response.status() >= 400) failures.push(response.url());});
    for (const width of [1440, 390]) {
      await page.setViewportSize({width, height: 1000});
      const response = await page.goto(`${base}/astryx-selected-pages-check`, {waitUntil: 'networkidle'});
      assert.equal(response.status(), 200);
      const selected = page.locator(`#c${fixture.records.selected}`);
      const subpages = page.locator(`#c${fixture.records.subpages}`);
      const empty = page.locator(`#c${fixture.records.empty}`);
      const links = selected.locator('.astryx-side-nav-item');
      await expect(links).toHaveCount(4);
      await expect(subpages.locator('.astryx-side-nav-item')).toHaveCount(3);
      await expect(empty.locator('a')).toHaveCount(0);
      await expect(selected.locator('h2')).toHaveText('Menu check: selected');
      assert((await selected.getAttribute('class')).includes('frame-space-before-small frame-space-after-large'));
      const entries = await links.evaluateAll(elements => elements.map(element => ({
        href: element.getAttribute('href'), text: element.textContent.trim(), target: element.getAttribute('target'),
        classes: element.className, current: element.getAttribute('aria-current'), active: element.getAttribute('data-active'),
        markup: element.outerHTML,
      })));
      assert.deepEqual(entries.map(entry => entry.href), [
        '/astryx-selected-pages-check/third', '/astryx-selected-pages-check/first',
        '/astryx-selected-pages-check/second', '/astryx-selected-pages-check',
      ], 'Page selections determine menu order; hidden, restricted and invalid pages are omitted');
      assert.equal(entries[1].text, 'First & selected');
      assert.equal(entries[2].target, '_blank');
      assert.equal(entries[3].current, 'page');
      assert.equal(entries[3].active, 'true');
      const siblingEntries = await subpages.locator('.astryx-side-nav-item').evaluateAll(elements => elements.map(element => element.outerHTML));
      assert.deepEqual(entries.slice(0, 3).map(entry => entry.markup).sort(), siblingEntries.sort(), 'The same pages have identical submenu link markup and classes');
      const metrics = await links.evaluateAll(elements => elements.map(element => {
        const style = getComputedStyle(element), rect = element.getBoundingClientRect();
        return {width: rect.width, container: element.closest('ul').getBoundingClientRect().width,
          height: rect.height, font: style.fontFamily, size: style.fontSize, radius: style.borderRadius};
      }));
      assert(metrics.every(metric => Math.abs(metric.width - metric.container) < 1 && metric.size === '14px' && metric.font.startsWith('Figtree') && metric.radius === '10px'));
      if (width === 390) assert(metrics[0].height > 32, 'Long page titles wrap on mobile');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await links.nth(1).focus();
      await expect(links.nth(1)).toBeFocused();
      await page.keyboard.press(name === 'webkit' ? 'Alt+Tab' : 'Tab');
      await expect(links.nth(2)).toBeFocused();
      assert.equal(await links.nth(2).evaluate(element => getComputedStyle(element).outlineStyle), 'solid');
      await page.screenshot({path: `${output}/${name}-${width}.png`, fullPage: true});
      report.push({browser: name, width, status: 'passed'});
    }
    await page.goto(`${base}/de/astryx-selected-pages-check`, {waitUntil: 'networkidle'});
    const translated = page.locator(`#c${fixture.records.selected} .astryx-side-nav-item`).nth(1);
    await expect(translated).toHaveText('Erste ausgewählte Seite');
    assert((await translated.getAttribute('href')).startsWith('/de/'));
    assert.deepEqual(failures, []);
    await context.close();
  } finally {await browser.close();}
}
fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2) + '\n');
console.log('Selected pages: actual TYPO3 menu order, filtering, empty selection, identical Subpages markup/classes, current state, targets, translations, desktop/mobile, keyboard, reduced motion and no-JavaScript output pass in Chromium/WebKit.');
