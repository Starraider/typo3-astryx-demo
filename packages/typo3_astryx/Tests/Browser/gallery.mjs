import {chromium, webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Read-only Fluid/FAL markup; photo pixels and long metadata change only in browser memory.
const base = new URL(process.env.ASTRYX_TEST_URL || 'https://typo3-astryx.ddev.site').origin;
const fixture = fs.readFileSync(process.env.ASTRYX_GALLERY_HTML || '/tmp/astryx-gallery-fixtures.html', 'utf8');
const output = process.env.ASTRYX_TEST_OUTPUT || '/tmp/astryx-gallery-evidence';
fs.mkdirSync(output, {recursive: true});
const extension = fs.readdirSync('public/_assets').find(name => {
  try { return fs.realpathSync(`public/_assets/${name}`) === path.join(process.cwd(), 'packages/typo3_astryx/Resources/Public'); } catch { return false; }
});
const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json'));
const entry = Object.entries(manifest).find(([key]) => /typo3[-_]astryx\/Resources\/Private\/JavaScript\/Main\.entry\.js$/.test(key))?.[1];
assert(extension && entry, 'Published extension and Vite assets required');
const css = new Set(entry.css);
for (const [key, item] of Object.entries(manifest)) if (key.startsWith('_') && item.file.endsWith('.css')) css.add(item.file);
const pipelines = {
  packaged: {css: [`/_assets/${extension}/Assets/astryx.css`], js: `/_assets/${extension}/Assets/astryx.js`},
  vite: {css: [...css].map(file => `/_assets/vite/${file}`), js: `/_assets/vite/${entry.file}`},
};
const photos = {
  white: '<rect width="1400" height="1000" fill="white"/>',
  black: '<rect width="1400" height="1000" fill="black"/>',
  busy: '<defs><pattern id="busy" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill="white"/><path d="M0 0h16v16H0zM16 16h16v16H16z" fill="black"/><path d="M0 0l32 32M0 32L32 0" stroke="red" stroke-width="4"/></pattern></defs><rect width="1400" height="1000" fill="url(#busy)"/>',
};
const report = {matrix: [], live: [], fallback: [], forcedColors: []};
const document = (assets, theme, mode) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gallery contrast regression</title>${assets.css.map(file => `<link rel="stylesheet" href="${base + file}">`).join('')}<script type="module" src="${base + assets.js}"></script><style>body{margin:0}main{max-width:1000px;margin:auto;padding:16px}</style></head><body class="astryx-root" data-astryx-theme="${theme}" data-astryx-mode="${mode}"><main>${fixture}</main></body></html>`;
// Exact sRGB alpha composition, with white as the worst pixel for white foregrounds.
const contrast = (front, back) => {
  const rgba = color => { const values = color.match(/[\d.]+/g).map(Number); return [...values.slice(0, 3), values[3] ?? 1]; };
  const fg = rgba(front), bg = rgba(back);
  const background = bg.slice(0, 3).map(value => value * bg[3] + 255 * (1 - bg[3]));
  const foreground = fg.slice(0, 3).map((value, i) => value * fg[3] + background[i] * (1 - fg[3]));
  const luminance = color => color.map(value => { value /= 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; }).reduce((sum, value, i) => sum + value * [.2126, .7152, .0722][i], 0);
  const a = luminance(foreground), b = luminance(background);
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
};
const focus = locator => locator.evaluate(element => {
  const style = getComputedStyle(element), after = getComputedStyle(element, '::after');
  return {active: document.activeElement === element, style: style.outlineStyle, color: style.outlineColor, width: style.outlineWidth, offset: style.outlineOffset, inner: after.borderColor, innerWidth: after.borderWidth, innerInset: after.inset, shadow: style.boxShadow};
});
for (const name of (process.env.ASTRYX_TEST_BROWSERS || 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    const context = await browser.newContext({ignoreHTTPSErrors: true, reducedMotion: 'reduce'});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    const url = `${base}/__astryx-gallery__`;
    for (const [pipeline, assets] of Object.entries(pipelines)) for (const theme of ['neutral', 'stone', 'ocean']) for (const mode of ['light', 'dark']) {
      await page.route(url, route => route.fulfill({contentType: 'text/html', body: document(assets, theme, mode)}));
      await page.goto(url, {waitUntil: 'networkidle'});
      const gallery = page.locator('[data-astryx-classic-gallery]').first();
      await page.waitForFunction(() => document.querySelector('[data-gallery-open]')?.getAttribute('aria-haspopup') === 'dialog');
      const opener = gallery.locator('[data-gallery-open]').first();
      const dialog = gallery.locator('dialog');
      const samples = [];
      for (const width of [1100, 390]) for (const [photo, pixels] of Object.entries(photos)) {
        await page.setViewportSize({width, height: 900});
        const uri = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1000">${pixels}</svg>`)}`;
        await gallery.evaluate((element, uri) => {
          for (const link of element.querySelectorAll('[data-gallery-open]')) {
            link.href = uri;
            link.querySelector('img').src = uri;
            link.querySelector('img').srcset = `${uri} 1400w`;
            link.dataset.galleryCaption = 'A long gallery description with bright, dark and busy photos. '.repeat(70);
          }
        }, uri);
        await page.keyboard.press('Tab'); await opener.focus();
        const ring = await focus(opener);
        assert(ring.active && ring.style === 'solid' && ring.width === '3px' && ring.offset === '-5px');
        assert.equal(contrast(ring.color, ring.inner), 21, 'Adjacent white/black thumbnail focus rings');
        assert.equal(ring.innerWidth, '3px'); assert.equal(ring.innerInset, '5px');
        await opener.press('Enter');
        await page.waitForFunction(() => document.querySelector('dialog').open);
        await dialog.locator('[data-lightbox-media] > img').evaluate(image => image.decode());
        const caption = dialog.locator('figcaption');
        const protection = await dialog.evaluate(element => {
          const caption = element.querySelector('figcaption'), image = element.querySelector('[data-lightbox-media] > img');
          const counter = element.querySelector('[data-lightbox-counter]');
          const style = getComputedStyle(caption), backdrop = getComputedStyle(element, '::backdrop'), counterStyle = getComputedStyle(counter);
          return {backdrop: backdrop.backgroundColor, dialog: getComputedStyle(element).backgroundColor, caption: style.color, captionBackground: style.backgroundColor, captionGap: caption.getBoundingClientRect().top - image.getBoundingClientRect().bottom, scrollHeight: caption.scrollHeight, clientHeight: caption.clientHeight, counter: counterStyle.color, counterBackground: counterStyle.backgroundColor};
        });
        assert.equal(protection.backdrop, 'rgba(0, 0, 0, 0.54)');
        assert.equal(protection.dialog, 'rgba(0, 0, 0, 0)', 'Photo remains undimmed');
        assert.equal(protection.captionBackground, 'rgba(0, 0, 0, 0)', 'Caption needs only the backdrop below the photo');
        assert(protection.captionGap >= -1, 'Caption must stay off image pixels');
        const textRatio = contrast(protection.caption, protection.backdrop);
        const counterRatio = contrast(protection.counter, protection.counterBackground);
        assert(textRatio >= 4.5 && counterRatio >= 4.5);
        const controlSamples = [];
        for (const control of await dialog.locator('button:not(:disabled)').all()) {
          await page.mouse.move(0, 0);
          for (const state of ['normal', 'hover', 'focus']) {
            if (state === 'hover') await control.hover();
            if (state === 'focus') { await page.mouse.move(0, 0); await page.keyboard.press('Tab'); await control.focus(); }
            const colors = await control.evaluate(element => { const style = getComputedStyle(element); return {color: style.color, background: style.backgroundColor, filter: getComputedStyle(element.querySelector('img')).filter}; });
            const ratio = contrast(colors.color, colors.background);
            assert(ratio >= 3, `${name}/${pipeline}/${theme}/${mode}/${photo}/${state}: ${ratio}`);
            assert.equal(colors.filter, 'brightness(0) invert(1)', 'White SVG pixels match measured foreground');
            if (state === 'focus') { const ring = await focus(control); assert(ring.active && ring.style === 'solid'); assert(contrast(ring.color, colors.background) >= 3); }
            controlSamples.push({state, ...colors, ratio});
          }
        }
        assert(protection.scrollHeight > protection.clientHeight, 'Long caption fixture must overflow');
        await caption.focus(); await caption.press('End');
        await page.waitForFunction(() => document.querySelector('dialog[open] figcaption').scrollTop > 0);
        const captionRing = await focus(caption);
        assert(captionRing.active && captionRing.style === 'solid' && contrast(captionRing.color, protection.backdrop) >= 3);
        await dialog.locator('[data-lightbox-close]').focus();
        await page.keyboard.press('Shift+Tab');
        assert(await dialog.locator('[data-lightbox-next]').evaluate(element => document.activeElement === element));
        await page.keyboard.press('Tab');
        assert(await dialog.locator('[data-lightbox-close]').evaluate(element => document.activeElement === element));
        await page.keyboard.press('Tab');
        assert(await caption.evaluate(element => document.activeElement === element), 'Caption is reachable in modal Tab order');
        await page.keyboard.press('ArrowRight');
        assert.equal(await dialog.locator('[data-lightbox-counter]').textContent(), '2 / 11');
        assert(await caption.evaluate(element => document.activeElement === element), 'Changing the photo preserves caption focus');
        if (name === 'chromium' && pipeline === 'packaged' && theme === 'neutral' && mode === 'light' && photo === 'busy') await page.screenshot({path: `${output}/busy-${width}.png`});
        await gallery.locator('[data-gallery-open]').nth(2).evaluate(element => { element.dataset.galleryCaption = ''; });
        await page.keyboard.press('ArrowRight');
        assert(await caption.evaluate(element => element.hidden));
        assert(await dialog.locator('[data-lightbox-close]').evaluate(element => document.activeElement === element), 'An empty replacement caption returns focus to Close');
        await page.keyboard.press('Escape');
        // Native close dispatch is asynchronous; await controller cleanup before reopening.
        await page.waitForFunction(() => !document.querySelector('dialog').open && !document.querySelector('[data-lightbox-media]').children.length);
        assert(await opener.evaluate(element => document.activeElement === element), 'Escape returns focus to the photo');
        samples.push({width, photo, protection, textRatio, counterRatio, controlSamples, thumbnailFocus: ring, captionScroll: 'passed', focusReturn: 'passed'});
      }
      assert.deepEqual(errors, []);
      report.matrix.push({browser: name, pipeline, theme, mode, reducedMotion: true, samples});
      await page.unroute(url);
    }
    // Actual TYPO3-rendered page and its chosen production assets.
    await page.setViewportSize({width: 1100, height: 900});
    const response = await page.goto(`${base}/ueber-uns/gallery`, {waitUntil: 'networkidle'});
    assert.equal(response.status(), 200);
    const gallery = page.locator('[data-astryx-classic-gallery]').first();
    const opener = gallery.locator('[data-gallery-open]').first();
    await opener.focus(); await opener.press('Enter');
    assert.equal(await gallery.locator('dialog').evaluate(element => getComputedStyle(element, '::backdrop').backgroundColor), 'rgba(0, 0, 0, 0.54)');
    await gallery.locator('dialog [data-lightbox-media] > img').evaluate(image => image.decode());
    await page.keyboard.press('Escape');
    assert(await opener.evaluate(element => document.activeElement === element));
    assert.deepEqual(errors, []);
    report.live.push({browser: name, path: '/ueber-uns/gallery', stylesheets: await page.locator('link[rel=stylesheet]').evaluateAll(elements => elements.map(element => element.href)), openEscapeFocus: 'passed'});
    if (name === 'chromium') for (const scheme of ['light', 'dark']) {
      await page.emulateMedia({forcedColors: 'active', colorScheme: scheme});
      await page.keyboard.press('Tab'); await opener.focus();
      const ring = await focus(opener);
      assert(ring.style === 'solid' && contrast(ring.color, ring.inner) >= 3);
      await opener.press('Enter');
      const colors = await gallery.locator('[data-lightbox-counter]').evaluate(element => { const style = getComputedStyle(element); return {color: style.color, background: style.backgroundColor}; });
      assert(contrast(colors.color, colors.background) >= 4.5);
      const control = gallery.locator('[data-lightbox-close]');
      await control.focus(); const controlRing = await focus(control);
      const button = await control.evaluate(element => { const style = getComputedStyle(element); return {color: style.color, background: style.backgroundColor, adjust: style.forcedColorAdjust}; });
      assert.equal(button.adjust, 'none'); assert(contrast(button.color, button.background) >= 3 && contrast(controlRing.color, button.background) >= 3);
      report.forcedColors.push({scheme, thumbnail: ring, counter: colors, button, focus: controlRing});
      await page.keyboard.press('Escape');
    }
    await context.close();
    const fallback = await browser.newContext({ignoreHTTPSErrors: true, javaScriptEnabled: false, reducedMotion: 'reduce', viewport: {width: 390, height: 900}});
    const fallbackPage = await fallback.newPage();
    await fallbackPage.goto(`${base}/ueber-uns/gallery`, {waitUntil: 'domcontentloaded'});
    await fallbackPage.waitForFunction(() => [...document.querySelectorAll('link[rel=stylesheet]')].every(link => link.sheet));
    const link = fallbackPage.locator('[data-gallery-open]').first();
    await link.locator('img').evaluate(image => image.decode());
    await fallbackPage.keyboard.press('Tab'); await link.focus();
    assert((await focus(link)).style === 'solid');
    const original = await link.getAttribute('href');
    const originalResponse = await fallback.request.get(new URL(original, base).href);
    assert.equal(originalResponse.status(), 200); assert(originalResponse.headers()['content-type'].startsWith('image/'));
    assert.equal(await fallbackPage.locator('dialog[open]').count(), 0);
    report.fallback.push({browser: name, noJavaScript: true, reducedMotion: true, originalImage: 'passed', photoFocus: 'passed'});
    await fallback.close();
  } finally {
    await browser.close();
    fs.writeFileSync(`${output}/measurements.json`, JSON.stringify(report, null, 2));
  }
}
console.log(JSON.stringify({configurations: report.matrix.length,photoViewportSamples: report.matrix.flatMap(row => row.samples).length, minimumText: Math.min(...report.matrix.flatMap(row => row.samples.map(sample => sample.textRatio))), minimumControl: Math.min(...report.matrix.flatMap(row => row.samples.flatMap(sample => sample.controlSamples.map(control => control.ratio)))), live: report.live.length, fallback: report.fallback.length, forcedColors: report.forcedColors.length, output}, null, 2));
