import {chromium, firefox, webkit, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = process.env.ASTRYX_TEST_URL ?? 'https://astryx-fixture.ddev.site';
const directory = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-navigation-evidence';
fs.mkdirSync(directory, {recursive: true});
const report = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,firefox,webkit').split(',')) {
  const browser = await ({chromium, firefox, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    const context = await browser.newContext({ignoreHTTPSErrors: true, viewport: {width: 1440, height: 900}, colorScheme: 'light'});
    const page = await context.newPage();
    const errors = [], badAssets = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(base) && response.status() >= 400) badAssets.push(response.url());
    });
    assert.equal((await page.goto(base, {waitUntil: 'networkidle'})).status(), 200);
    await expect(page.locator('.astryx-logo')).toBeVisible();
    await expect(page.locator('[data-nav-open]')).toBeHidden();
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
    await page.keyboard.press('Escape');
    await dropdown.evaluate(element => element.parentElement.style.left = '0px');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    assert((await panel.boundingBox()).x >= 15);
    await page.keyboard.press('Escape');
    await dropdown.evaluate(element => element.parentElement.removeAttribute('style'));
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
    const dialog = page.locator('#astryx-navigation-dialog');
    await expect(dialog).toBeVisible();
    const mobileToggle = dialog.locator('summary').first();
    await mobileToggle.click();
    await expect(dialog.locator('.astryx-dropdown-panel').first()).toBeVisible();
    await page.screenshot({path: `${directory}/${name}-mobile.png`});
    await page.keyboard.press('Escape');
    await expect(dialog.locator('.astryx-dropdown-panel').first()).toBeHidden();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.locator('[data-nav-open]')).toBeFocused();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('[data-nav-open]').click();
    await page.setViewportSize({width: 1440, height: 900});
    await expect(dialog).toBeHidden();
    assert.deepEqual(errors, []);
    assert.deepEqual(badAssets, []);
    await context.close();

    const noJs = await browser.newContext({ignoreHTTPSErrors: true, javaScriptEnabled: false, viewport: {width: 390, height: 844}});
    const fallback = await noJs.newPage();
    await fallback.goto(base);
    await expect(fallback.locator('.astryx-navigation > ul')).toBeVisible();
    await expect(fallback.locator('[data-astryx-mode-toggle]')).toBeHidden();
    await fallback.locator('.astryx-navigation > ul summary').first().click();
    await expect(fallback.locator('.astryx-navigation > ul .astryx-dropdown-panel').first()).toBeVisible();
    assert(await fallback.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await noJs.close();
    report.push({browser: name, status: 'passed', checks: 'Desktop dropdown, keyboard, outside click, focus, sticky header, saved theme, active/current links, mobile dialog, resize, no JavaScript, header accessibility and asset health'});
  } finally {
    await browser.close();
    fs.writeFileSync(`${directory}/report.json`, JSON.stringify(report, null, 2) + '\n');
  }
}
console.log(JSON.stringify(report, null, 2));
