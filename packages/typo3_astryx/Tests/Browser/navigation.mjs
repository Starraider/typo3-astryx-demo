import {chromium, firefox, webkit, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = process.env.ASTRYX_TEST_URL ?? 'https://astryx-fixture.ddev.site';
const directory = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-navigation-evidence';
fs.mkdirSync(directory, {recursive: true});
const report = [];
const assets = process.env.ASTRYX_NAVIGATION_ASSETS ?? 'vite';
async function useAssets(context) {
  if (assets !== 'packaged') return;
  const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json', 'utf8'));
  const entry = Object.values(manifest).find(e => e.src?.includes('typo3-astryx/') && e.src.endsWith('/Main.entry.js'));
  assert(entry, 'Consuming extension entry exists');
  const shared = Object.values(manifest).filter(e => e.file.endsWith('.css') && e.src?.startsWith('_Main-')).map(e => e.file);
  const published = fs.readdirSync('public/_assets').find(d => {
    try {return fs.realpathSync(`public/_assets/${d}`).endsWith('/packages/typo3_astryx/Resources/Public');} catch {return false;}
  });
  assert(published, 'Packaged assets are published');
  await context.route('**/*', async route => {
    if (route.request().resourceType() !== 'document' || !route.request().url().startsWith(base)) return route.continue();
    const response = await route.fetch();
    let html = await response.text();
    html = html.replace(/<link\b[^>]*>/g, tag => [...entry.css, ...shared].some(file => tag.includes(`/_assets/vite/${file}`)) ? '' : tag);
    html = html.replace('</head>', `<link rel="stylesheet" href="/_assets/${published}/Assets/astryx.css"></head>`);
    html = html.replace(`/_assets/vite/${entry.file}`, `/_assets/${published}/Assets/astryx.js`);
    await route.fulfill({response, body: html});
  });
}
async function checkLanguageMenu(page, mobile = false, noJs = false) {
  const language = page.locator('.astryx-language-menu');
  const toggle = language.locator('summary');
  const panel = language.locator('.astryx-language-options');
  await toggle.click();
  await expect(panel).toBeVisible();
  assert.equal(await panel.evaluate(e => getComputedStyle(e).padding), '4px');
  assert((await panel.boundingBox()).width < 240, 'Language panel fits its labels instead of a fixed minimum');
  const rows = panel.locator(':scope > li > a, :scope > li > span');
  const metrics = await rows.evaluateAll(elements => elements.map(e => {
    const css = getComputedStyle(e), flag = e.querySelector('.astryx-language-flag');
    return {height: e.getBoundingClientRect().height, padding: css.padding, gap: css.gap,
      flag: flag && {width: flag.getBoundingClientRect().width, height: flag.getBoundingClientRect().height, radius: getComputedStyle(flag).borderRadius, loaded: flag.querySelector('img').complete && flag.querySelector('img').naturalWidth > 0}};
  }));
  assert(metrics.every(m => m.height === (mobile ? 44 : 32) && m.padding === (mobile ? '10px 8px' : '6px 8px') && m.gap === '8px'));
  assert(metrics.every(m => m.flag?.width === 20 && m.flag.height === 20 && m.flag.radius === '50%' && m.flag.loaded), 'Language flags stay round, 20px and loaded');
  await expect(panel.locator('[aria-current="true"]')).toHaveCount(1);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  if (!mobile) {
    const width = (await panel.boundingBox()).width;
    const original = await rows.last().evaluate(e => {
      const text = [...e.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      const original = text.textContent;
      text.textContent = 'A much longer language navigation title';
      return original;
    });
    assert((await panel.boundingBox()).width > width + 50, 'Language panel expands for longer titles while retaining the flag');
    await rows.last().evaluate((e, original) => [...e.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()).textContent = original, original);
  }
  await page.screenshot({path: `${directory}/${page.context().browser().browserType().name()}-language-${mobile ? 'mobile' : 'desktop'}${noJs ? '-no-js' : ''}.png`});
  if (noJs) await toggle.click();
  else {
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
  }
  await expect(panel).toBeHidden();
}
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,firefox,webkit').split(',')) {
  const browser = await ({chromium, firefox, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    const context = await browser.newContext({ignoreHTTPSErrors: true, viewport: {width: 1440, height: 900}, colorScheme: 'light', reducedMotion: 'reduce'});
    await useAssets(context);
    const page = await context.newPage();
    const errors = [], badAssets = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(base) && response.status() >= 400) badAssets.push(response.url());
    });
    assert.equal((await page.goto(base, {waitUntil: 'networkidle'})).status(), 200);
    await expect(page.locator('.astryx-logo')).toBeVisible();
    await expect(page.locator('[data-nav-open]')).toBeHidden();
    await checkLanguageMenu(page);
    const menu = page.locator('.astryx-navigation > .astryx-main-menu');
    const dropdown = menu.locator('[data-astryx-dropdown]').first();
    const toggle = dropdown.locator(':scope > summary');
    const panel = dropdown.locator(':scope > .astryx-dropdown-panel');
    await expect(panel).toBeHidden();
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const childUrl = await panel.locator('a').first().getAttribute('href');
    const metrics = await panel.evaluate(element => ({padding: getComputedStyle(element).padding, width: element.offsetWidth, row: element.querySelector('a').offsetHeight}));
    assert.equal(metrics.padding, '4px');
    assert.equal(metrics.row, 32);
    assert(metrics.width < 240, 'Short labels do not inherit the previous 15rem minimum');
    const label = panel.locator(':scope > ul > li > a').last();
    const originalLabel = await label.textContent();
    await label.evaluate(element => element.textContent = 'A longer submenu destination title');
    assert((await panel.boundingBox()).width > metrics.width + 50, 'Panel expands with its own label widths');
    await label.evaluate((element, text) => element.textContent = text, originalLabel);
    const flyout = panel.locator('[data-astryx-dropdown]').first();
    assert(await flyout.count(), 'Navigation fixture needs a third-level branch');
    const flyoutToggle = flyout.locator(':scope > summary');
    const flyoutPanel = flyout.locator(':scope > .astryx-dropdown-panel');
    const branchLink = flyout.locator('..').locator(':scope > a');
    await branchLink.focus();
    await page.keyboard.press('ArrowRight');
    await expect(flyoutPanel).toBeVisible();
    await expect(flyoutPanel.locator('a').first()).toBeFocused();
    assert((await flyoutPanel.boundingBox()).x >= (await panel.boundingBox()).x + (await panel.boundingBox()).width - 5, 'Third-level panel opens beside its parent');
    assert(Math.abs((await panel.boundingBox()).width - metrics.width) < 1, 'Open flyout does not widen its parent');
    await page.screenshot({path: `${directory}/${name}-flyout.png`});
    await page.keyboard.press('ArrowLeft');
    await expect(flyoutPanel).toBeHidden();
    await expect(flyoutToggle).toBeFocused();
    await expect(panel).toBeVisible();
    await branchLink.hover();
    await expect(flyoutPanel).toBeVisible();
    await flyoutPanel.locator('a').first().hover();
    await expect(flyoutPanel).toBeVisible();
    await flyoutToggle.click();
    await expect(flyoutPanel).toBeVisible();
    await page.screenshot({path: `${directory}/${name}-flyout-pointer.png`});
    await flyoutPanel.locator('a').first().focus();
    assert.equal(await flyoutToggle.locator('.astryx-chevron').evaluate(e => getComputedStyle(e).transitionDuration), '0s');
    await page.keyboard.press('Escape');
    await expect(flyoutPanel).toBeHidden();
    await expect(panel).toBeVisible();
    await toggle.focus();
    await page.screenshot({path: `${directory}/${name}-desktop.png`});
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Space');
    await expect(panel).toBeVisible();
    await page.locator('main').click({position: {x: 10, y: 300}});
    await expect(panel).toBeHidden();
    await toggle.click();
    await page.locator('.astryx-logo').focus();
    await expect(panel).toBeHidden();
    // Menus near either viewport edge must remain readable.
    await dropdown.evaluate(element => {
      const item = element.parentElement;
      item.style.cssText = `position: fixed; top: 8px; left: ${innerWidth - item.offsetWidth - 8}px`;
    });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    assert((await panel.boundingBox()).x + (await panel.boundingBox()).width <= 1440 - 15);
    await branchLink.focus();
    await page.keyboard.press('ArrowRight');
    await expect(flyoutPanel).toBeVisible();
    await expect(flyout).toHaveAttribute('data-side', 'start');
    assert((await flyoutPanel.boundingBox()).x + (await flyoutPanel.boundingBox()).width <= (await panel.boundingBox()).x + 5, 'Flyout flips beside the parent near the right edge');
    await page.keyboard.press('Escape');
    await toggle.focus();
    await page.keyboard.press('Escape');
    await dropdown.evaluate(element => element.parentElement.style.left = '0px');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    assert((await panel.boundingBox()).x >= 15);
    await page.keyboard.press('Escape');
    await dropdown.evaluate(element => element.parentElement.removeAttribute('style'));
    await page.evaluate(() => document.documentElement.dir = 'rtl');
    await toggle.click();
    await branchLink.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(flyoutPanel).toBeVisible();
    await expect.poll(async () => {
      const flyoutBounds = await flyoutPanel.boundingBox(), parentBounds = await panel.boundingBox();
      return flyoutBounds.x + flyoutBounds.width <= parentBounds.x + 5;
    }, {message: 'RTL flyout opens toward inline end after disclosure positioning'}).toBe(true);
    await page.keyboard.press('ArrowRight');
    await expect(flyoutPanel).toBeHidden();
    await toggle.focus();
    await page.keyboard.press('Escape');
    await page.evaluate(() => document.documentElement.removeAttribute('dir'));
    await page.evaluate(() => scrollTo(0, 600));
    assert(Math.abs((await page.locator('header').boundingBox()).y) < 1, 'Header stays at the top while scrolling');
    await page.evaluate(() => scrollTo(0, 0));

    const theme = page.locator('[data-astryx-mode-toggle]');
    await expect(theme).toHaveAccessibleName('Switch to dark mode');
    await theme.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.astryx-root')).toHaveAttribute('data-astryx-mode', 'dark');
    await expect(theme).toHaveAccessibleName('Switch to light mode');
    await expect(theme.locator('[data-theme-icon="light"]')).toBeVisible();
    await expect(theme.locator('[data-theme-icon="dark"]')).toBeHidden();
    const darkBackground = await page.locator('header').evaluate(root => getComputedStyle(root).backgroundColor);
    await page.reload({waitUntil: 'networkidle'});
    await expect(theme).toHaveAccessibleName('Switch to light mode');
    await theme.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('.astryx-root')).toHaveAttribute('data-astryx-mode', 'light');
    assert.notEqual(await page.locator('header').evaluate(root => getComputedStyle(root).backgroundColor), darkBackground);
    assert.equal(await page.evaluate(() => localStorage.getItem('astryx-mode')), 'light');
    assert.equal(await theme.innerText(), '');
    const target = await theme.boundingBox();
    assert(target.width >= 44 && target.height >= 44);

    const violations = (await new AxeBuilder({page}).include('header').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations;
    assert.deepEqual(violations.map(v => ({id: v.id, nodes: v.nodes.map(n => n.html)})), []);
    await page.goto(new URL(childUrl, base).href, {waitUntil: 'networkidle'});
    await expect(page.locator('.astryx-navigation > ul .astryx-menu-item--active').first()).toBeVisible();
    assert.equal(await menu.locator('[aria-current="page"]').count(), 1);

    await page.setViewportSize({width: 390, height: 844});
    await expect(page.locator('[data-nav-open]')).toBeVisible();
    await page.locator('[data-nav-open]').click();
    const dialog = page.locator('[data-astryx-mobile-nav] > dialog');
    await expect(dialog).toBeVisible();
    const mobileToggle = dialog.locator('summary').first();
    await mobileToggle.click();
    await expect(dialog.locator('.astryx-dropdown-panel').first()).toBeVisible();
    const mobileNested = dialog.locator('.astryx-submenu [data-astryx-dropdown]').first();
    await mobileNested.locator(':scope > summary').click();
    await expect(mobileNested.locator(':scope > .astryx-dropdown-panel')).toBeVisible();
    assert.equal(await mobileNested.locator(':scope > .astryx-dropdown-panel').evaluate(e => getComputedStyle(e).position), 'static');
    await page.keyboard.press('Escape');
    await expect(mobileNested.locator(':scope > .astryx-dropdown-panel')).toBeHidden();
    await mobileToggle.focus();
    await page.screenshot({path: `${directory}/${name}-mobile.png`});
    await page.keyboard.press('Escape');
    await expect(dialog.locator('.astryx-dropdown-panel').first()).toBeHidden();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.locator('[data-nav-open]')).toBeFocused();
    await checkLanguageMenu(page, true);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('[data-nav-open]').click();
    await page.setViewportSize({width: 1440, height: 900});
    await expect(dialog).toBeHidden();
    assert.deepEqual(errors, []);
    assert.deepEqual(badAssets, []);
    await context.close();

    const noJs = await browser.newContext({ignoreHTTPSErrors: true, javaScriptEnabled: false, viewport: {width: 390, height: 844}});
    await useAssets(noJs);
    const fallback = await noJs.newPage();
    await fallback.goto(base);
    await expect(fallback.locator('.astryx-navigation > ul')).toBeVisible();
    await expect(fallback.locator('[data-astryx-mode-toggle]')).toBeHidden();
    await checkLanguageMenu(fallback, true, true);
    await fallback.locator('.astryx-navigation > ul summary').first().click();
    await expect(fallback.locator('.astryx-navigation > ul .astryx-dropdown-panel').first()).toBeVisible();
    assert(await fallback.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await fallback.setViewportSize({width: 1440, height: 900});
    const nativeNested = fallback.locator('.astryx-navigation > ul .astryx-submenu [data-astryx-dropdown]').first();
    await nativeNested.locator(':scope > summary').click();
    await expect(nativeNested.locator(':scope > .astryx-dropdown-panel')).toBeVisible();
    assert.equal(await nativeNested.locator(':scope > .astryx-dropdown-panel').evaluate(e => getComputedStyle(e).position), 'absolute');
    await noJs.close();
    report.push({browser: name, assets, status: 'passed', checks: 'Compact main/language rows, content-sized panels, circular loaded language flags, side flyouts, hover/click, arrow keys, edge flipping, RTL, reduced motion, dismissal, focus, sticky header, saved theme, active/current links, nested mobile dialog, resize, no JavaScript, header accessibility and asset health'});
  } finally {
    await browser.close();
    fs.writeFileSync(`${directory}/report.json`, JSON.stringify(report, null, 2) + '\n');
  }
}
console.log(JSON.stringify(report, null, 2));
