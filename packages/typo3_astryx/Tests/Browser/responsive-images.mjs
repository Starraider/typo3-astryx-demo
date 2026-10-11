import {chromium, webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = new URL(process.env.ASTRYX_TEST_URL ?? 'https://typo3-astryx.ddev.site').origin;
const fixtures = fs.readFileSync(process.env.ASTRYX_RESPONSIVE_IMAGES_HTML ?? '/tmp/astryx-responsive-images-fixtures.html', 'utf8');
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-responsive-images-evidence';
fs.mkdirSync(output, {recursive: true});
const asset = fs.readdirSync('public/_assets').find(name => fs.lstatSync(`public/_assets/${name}`).isSymbolicLink() && /typo3[-_]astryx/.test(fs.readlinkSync(`public/_assets/${name}`)));
const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json', 'utf8'));
const entry = Object.entries(manifest).find(([key]) => /typo3[-_]astryx\/Resources\/Private\/JavaScript\/Main\.entry\.js$/.test(key))?.[1];
assert(asset && entry, 'Missing published assets');
const sharedCss = Object.values(manifest).filter(item => item.src?.startsWith('_') && item.file.endsWith('.css')).map(item => item.file);
const modes = {packaged: [`_assets/${asset}/Assets/astryx.css`], vite: [...new Set([...sharedCss, ...entry.css])].map(file => `_assets/vite/${file}`)};
// Unique query strings prevent a larger candidate cached by another component from
// obscuring what each consumer would request on its own. FAL paths/crops are unchanged.
const isolated = fixtures.replace(/(<section data-test="([^"]+)">)([\s\S]*?)(?=<section data-test=|$)/g,
  (_, start, id, body) => start + body.replace(/(fileadmin\/_processed_\/[^"\s,]+)/g, '$1?astryx_image_case=' + id));
const report = [];
const comparisons = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    for (const [mode, css] of (process.env.ASTRYX_RESPONSIVE_IMAGES_COMPARISON_ONLY ? [] : Object.entries(modes))) {
      for (const scenario of [{viewport: 1280, host: 1152}, {viewport: 390, host: 358}, {viewport: 1280, host: 320}]) {
        for (const dpr of [1, 2]) {
          const context = await browser.newContext({ignoreHTTPSErrors: true, viewport: {width: scenario.viewport, height: 900}, deviceScaleFactor: dpr, reducedMotion: 'reduce'});
          context.setDefaultTimeout(30000);
          const page = await context.newPage();
          const errors = [], bodies = new Map(), pending = [];
          page.on('response', response => {
            if (response.status() >= 400) errors.push(response.url());
            if (response.request().resourceType() === 'image') pending.push(response.body().then(body => bodies.set(response.url(), body.length)));
          });
          const document = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="${base}/"><title>Responsive image slots</title>${css.map(file => `<link rel="stylesheet" href="${file}">`).join('')}<style>main{width:${scenario.host}px;margin:auto}section[data-test]{margin-bottom:32px}</style></head><body class="astryx-root" data-astryx-theme="neutral" data-astryx-mode="light"><main>${isolated}</main></body></html>`;
          await page.route(base + '/__astryx-responsive-images__', route => route.fulfill({contentType: 'text/html', body: document}));
          await page.goto(base + '/__astryx-responsive-images__', {waitUntil: 'networkidle'});
          // Retain lazy loading: changing it to eager would disable native auto-sizes.
          await page.evaluate(async () => {
            for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
              scrollTo(0, y); await new Promise(resolve => requestAnimationFrame(resolve));
            }
          });
          await page.waitForFunction(() => [...document.querySelectorAll('[data-test] img[srcset]')].every(img => img.complete && img.naturalWidth > 0));
          await Promise.all(pending);
          const images = await page.locator('[data-test] img[srcset]').evaluateAll(images => images.map(img => {
            const candidates = img.srcset.split(',').map(candidate => {
              const [url, width] = candidate.trim().split(/\s+/);
              return {url: new URL(url, document.baseURI).href, width: parseInt(width)};
            });
            return {id: img.closest('[data-test]').dataset.test, slot: img.getBoundingClientRect().width, height: img.getBoundingClientRect().height,
              currentSrc: img.currentSrc, selected: candidates.find(candidate => candidate.url === img.currentSrc)?.width,
              candidates: candidates.map(candidate => candidate.width), sizes: img.sizes};
          }));
          assert(images.length > 100, 'All rendered consumers must be present');
          for (const image of images) {
            assert(image.slot > 0 && image.height > 0, 'Image dimensions lost');
            assert(image.sizes.startsWith('auto, '));
            assert(image.selected, 'Candidate must come from the initial HTML srcset');
            assert(bodies.get(image.currentSrc) > 0, 'Capture actual image response bytes');
            const ideal = image.candidates.find(width => width >= image.slot * dpr - 1) ?? image.candidates.at(-1);
            assert(image.selected >= ideal, `${name}/${mode}/${image.id}: undersized ${image.selected} for ${image.slot} at DPR ${dpr}`);
            // For these fresh requests, native auto sizing should choose the smallest sufficient candidate.
            assert.equal(image.selected, ideal, `${name}/${mode}/${image.id}: oversized candidate`);
            image.responseBytes = bodies.get(image.currentSrc);
          }
          assert.deepEqual(errors, []);
          report.push({browser: name, mode, ...scenario, dpr, images});
          if (dpr === 1 && scenario.host === 1152 && mode === 'packaged') {
            await page.locator('[data-test="gallery-4"] .astryx-classic-gallery-tile').evaluateAll(tiles => tiles.forEach((tile, index) => tile.hidden = index > 0));
            await page.locator('[data-test="gallery-4"] img[srcset]').first().scrollIntoViewIfNeeded();
            await page.waitForFunction(() => {
              const img = document.querySelector('[data-test="gallery-4"] img[srcset]');
              const selected = img.srcset.split(',').find(candidate => new URL(candidate.trim().split(/\s+/)[0], document.baseURI).href === img.currentSrc);
              return parseInt(selected?.trim().split(/\s+/)[1]) >= img.getBoundingClientRect().width;
            });
            report.at(-1).expandedGallery = await page.locator('[data-test="gallery-4"] img[srcset]').first().evaluate(img => ({slot: img.getBoundingClientRect().width, currentSrc: img.currentSrc}));
          }
          if (dpr === 1) {
            await page.locator('[data-test="images-three"]').screenshot({path: `${output}/${name}-${mode}-${scenario.host}.png`});
          }
          await context.close();
        }
      }
    }
    // Compare cold requests with the former full-page declaration at the same host.
    for (const policy of ['old', 'new', 'new-no-js']) {
      console.log(`${name}: measuring ${policy}`);
      const context = await browser.newContext({ignoreHTTPSErrors: true, viewport: {width: 1280, height: 900}, javaScriptEnabled: policy !== 'new-no-js', reducedMotion: 'reduce'});
      context.setDefaultTimeout(30000);
      const page = await context.newPage();
      const bytes = new Map(), pending = [];
      page.on('response', response => {
        if (response.request().resourceType() === 'image') pending.push(response.body().then(body => bytes.set(response.url(), body.length)));
      });
      const body = policy === 'old' ? isolated.replace(/sizes="auto,[^"]*"/g, 'sizes="(min-width: 75rem) 72rem, 100vw"') : isolated;
      await page.route(base + '/__astryx-responsive-baseline__', route => route.fulfill({contentType: 'text/html', body: `<!doctype html><html><head><base href="${base}/">${modes.packaged.map(file => `<link rel="stylesheet" href="${file}">`).join('')}<style>main{width:1152px;margin:auto}</style></head><body class="astryx-root" data-astryx-theme="stone" data-astryx-mode="dark"><main>${body}</main></body></html>`}));
      await page.goto(base + '/__astryx-responsive-baseline__', {waitUntil: 'networkidle'});
      if (policy !== 'new-no-js') await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
          scrollTo(0, y); await new Promise(resolve => requestAnimationFrame(resolve));
        }
      });
      await page.waitForFunction(() => [...document.querySelectorAll('[data-test] img[srcset]')].every(img => img.complete && img.naturalWidth > 0));
      await Promise.all(pending);
      const images = await page.locator('[data-test] img[srcset]').evaluateAll(images => images.map(img => ({id: img.closest('[data-test]').dataset.test, slot: img.getBoundingClientRect().width, currentSrc: img.currentSrc, sizes: img.sizes})));
      assert.equal(images.length, 147);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No-JS layout overflow');
      comparisons.push({browser: name, policy, noJavaScript: policy === 'new-no-js', theme: 'stone', mode: 'dark', responseBytes: [...bytes.values()].reduce((sum, size) => sum + size, 0), images: images.map(image => ({...image, responseBytes: bytes.get(image.currentSrc)}))});
      if (policy === 'new') {
        const checks = [];
        for (const theme of ['neutral', 'stone', 'ocean']) for (const colorMode of ['light', 'dark']) {
          await page.locator('body').evaluate((body, state) => {
            body.dataset.astryxTheme = state.theme; body.dataset.astryxMode = state.colorMode;
          }, {theme, colorMode});
          await page.evaluate(() => document.fonts.ready);
          const slots = await page.locator('[data-test] img[srcset]').evaluateAll(images => images.map(img => {
            const candidates = img.srcset.split(',').map(candidate => {const [url, width] = candidate.trim().split(/\s+/); return {url: new URL(url, document.baseURI).href, width: parseInt(width)};});
            return {slot: img.getBoundingClientRect().width, selected: candidates.find(candidate => candidate.url === img.currentSrc).width, maximum: candidates.at(-1).width};
          }));
          assert(slots.every(img => img.slot > 0 && img.selected >= Math.min(img.slot, img.maximum)), 'Theme slot must retain sufficient resolution');
          checks.push({theme, mode: colorMode, images: slots.length});
        }
        comparisons.at(-1).themeChecks = checks;
      }
      await context.close();
    }
    const before = comparisons.find(item => item.browser === name && item.policy === 'old');
    const after = comparisons.find(item => item.browser === name && item.policy === 'new');
    fs.writeFileSync(`${output}/comparisons.json`, JSON.stringify(comparisons, null, 2));
    assert(after.responseBytes < before.responseBytes, `New slot sizes should reduce cold image bytes: ${before.responseBytes} -> ${after.responseBytes}`);

    const page = await browser.newPage({ignoreHTTPSErrors: true});
    await page.goto(base + (process.env.ASTRYX_RESPONSIVE_IMAGES_PAGE ?? '/code/images'), {waitUntil: 'networkidle'});
    const live = await page.locator('.astryx-element img[srcset]').evaluateAll(images => images.map(img => ({sizes: img.sizes, loading: img.loading, slot: img.getBoundingClientRect().width})));
    assert(live.length, 'Live TYPO3 page must contain responsive images');
    assert(live.some(img => img.loading === 'lazy'), 'Live consumer must contain lazy images');
    assert(live.filter(img => img.loading === 'lazy').every(img => img.sizes.startsWith('auto, ') && !img.sizes.includes('{')));
    const styles = await page.locator('link[rel="stylesheet"]').evaluateAll(links => links.map(link => ({href: link.href, loaded: !!link.sheet})));
    assert(styles.some(style => /astryx\.css|\/vite\//.test(style.href) && style.loaded), 'Live page must load an Astryx asset path');
    comparisons.push({browser: name, policy: 'live-page', url: page.url(), images: live, styles});
    await page.screenshot({path: `${output}/${name}-live.png`});
    await page.close();
  } finally {await browser.close();}
}
if (report.length) fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
fs.writeFileSync(`${output}/comparisons.json`, JSON.stringify(comparisons, null, 2));
console.log(report.length ? `${report.length} browser/asset/host/DPR scenarios plus comparison/theme/live checks passed; evidence saved to ${output}` : `Comparison/theme/live checks passed; evidence saved to ${output}/comparisons.json`);
