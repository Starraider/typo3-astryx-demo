import {chromium, webkit, expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inspectIdentifiers} from './identifier-diagnostics.mjs';

// Real TYPO3/RECORDS/lazy ContentArea rendering, including a warm page-cache hit.
const base = process.env.ASTRYX_TEST_URL ?? 'https://astryx-fixture.ddev.site';
const assetBase = process.env.ASTRYX_VITE_ASSET_URL ?? 'https://typo3-astryx.ddev.site';
const fixture = JSON.parse(fs.readFileSync(process.env.ASTRYX_IDENTIFIERS_FIXTURE ?? 'var/astryx-fixture/var/identifiers-fixture.json'));
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-identifiers-evidence';
fs.mkdirSync(output, {recursive: true});
const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json'));
const entry = Object.entries(manifest).find(([key]) => /(?:typo3-astryx|typo3_astryx)\/Resources\/Private\/JavaScript\/Main\.entry\.js$/.test(key))?.[1];
assert(entry, 'Missing consuming Vite entrypoint');
const css = [...new Set([...(entry.css ?? []), ...Object.entries(manifest).filter(([key, value]) => key.startsWith('_') && value.file.endsWith('.css')).map(([, value]) => value.file)])];
const report = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    for (const pipeline of ['packaged', 'vite']) for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ignoreHTTPSErrors: true, javaScriptEnabled, reducedMotion: 'reduce'});
      if (pipeline === 'vite') {
        await context.route(base + '/_assets/vite/**', async route => {
          const response = await route.fetch({url: route.request().url().replace(base, assetBase)});
          await route.fulfill({response});
        });
        await context.route(base + '/astryx-identifiers-check*', async route => {
          const response = await route.fetch();
          const html = (await response.text())
            .replace(/<link\b[^>]*href="[^"]*\/Assets\/astryx\.css[^>]*>/g, '')
            .replace(/<script\b[^>]*src="[^"]*\/Assets\/astryx\.js[^>]*><\/script>/g, '')
            .replace('</head>', css.map(file => `<link rel="stylesheet" href="/_assets/vite/${file}">`).join('') + `<script type="module" src="/_assets/vite/${entry.file}"></script></head>`);
          await route.fulfill({response, body: html});
        });
      }
      const page = await context.newPage();
      const errors = [], failedAssets = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.status() >= 400) failedAssets.push(response.url()); });
      for (const width of [1440, 390]) {
        await page.setViewportSize({width, height: 1000});
        let cachedIds;
        for (let load = 0; load < 2; load++) {
          assert.equal((await page.goto(base + '/astryx-identifiers-check', {waitUntil: 'networkidle'})).status(), 200);
          assert.deepEqual(await page.evaluate(inspectIdentifiers), {duplicates: [], references: []});
          const ids = await page.locator('[data-astryx-occurrence]').evaluateAll(nodes => nodes.map(node => node.dataset.astryxOccurrence));
          if (load) assert.deepEqual(ids, cachedIds, 'Warm page cache retains the complete allocated namespaces');
          cachedIds = ids;
        }
        assert.equal(await page.locator('[aria-controls]').evaluateAll(nodes => nodes.every(node => {
          const owner = node.closest('[data-astryx-accordion], [data-astryx-carousel], [data-astryx-classic-gallery], [data-astryx-tree-list], .astryx-language-menu, [data-astryx-mobile-nav], [data-identifier-duplicate-branches]');
          return !owner || owner.contains(document.getElementById(node.getAttribute('aria-controls')));
        })), true, 'Controls target their own component occurrence');
        const assets = await page.locator('link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(node => node.href));
        assert(assets.some(url => pipeline === 'packaged' ? url.includes('/Assets/astryx.css') : url.includes('/_assets/vite/')), 'Selected assets loaded');
        for (const uid of Object.values(fixture.originals)) {
          const occurrences = page.locator(`[data-astryx-record-anchor="c${uid}"]`);
          await expect(occurrences).toHaveCount(14); // original + shortcut + six nested originals and six repeated containers
          await expect(page.locator(`#c${uid}`)).toHaveCount(1);
          const anchors = await occurrences.evaluateAll(nodes => nodes.map(node => node.id));
          for (const id of [anchors[0], anchors.at(-1)]) {
            await page.evaluate(id => { location.hash = id; }, id);
            assert(await page.locator(`[id="${id}"]`).evaluate(node => node.matches(':target') && node.getBoundingClientRect().top < innerHeight && node.getBoundingClientRect().bottom > 0), 'Canonical and occurrence fragment links scroll to their wrapper');
          }
        }
        for (const uid of Object.values(fixture.containers)) await expect(page.locator(`[data-astryx-record-anchor="c${uid}"]`)).toHaveCount(2);
        const first = page.locator('[data-astryx-accordion]').nth(0);
        const second = page.locator('[data-astryx-accordion]').nth(1);
        await first.locator('summary').first().focus(); await page.keyboard.press('Enter');
        await expect(first.locator('details').first()).toHaveAttribute('open', '');
        await second.locator('summary').first().focus(); await page.keyboard.press('Enter');
        await expect(first.locator('details').first()).toHaveAttribute('open', '');
        await expect(second.locator('details').first()).toHaveAttribute('open', '');
        await first.locator('summary').nth(1).click();
        await expect(first.locator('details').first()).not.toHaveAttribute('open', '');
        await expect(second.locator('details').first()).toHaveAttribute('open', '');
        if (!javaScriptEnabled) {
          const groups = await page.locator('[data-astryx-accordion]').evaluateAll(nodes => nodes.map(node => node.querySelector('details').getAttribute('name')));
          assert.equal(new Set(groups).size, groups.length, 'Native Accordion groups must stay independent');
        }
        const language = page.locator('.astryx-language-menu');
        assert(await language.count() >= 2, 'Repeated language menus are present');
        await language.nth(0).locator('summary').focus(); await page.keyboard.press('Enter');
        await expect(language.nth(0).locator('details')).toHaveAttribute('open', '');
        await expect(language.nth(1).locator('details')).not.toHaveAttribute('open', '');
        const trees = page.locator('[data-astryx-tree-prefix="repeated-tree"]');
        await expect(trees).toHaveCount(2);
        const branches = page.locator('[data-identifier-duplicate-branches] > ul > li > details');
        await expect(branches).toHaveCount(2);
        await branches.nth(0).locator(':scope > summary').focus(); await page.keyboard.press('Enter');
        await expect(branches.nth(0)).toHaveAttribute('open', '');
        await expect(branches.nth(1)).not.toHaveAttribute('open', '');
        await branches.nth(0).locator(':scope > summary').focus(); await page.keyboard.press('Enter');
        await expect(branches.nth(0)).not.toHaveAttribute('open', '');
        if (javaScriptEnabled) {
          await expect(trees.nth(0)).toHaveAttribute('data-enhanced', '');
          await expect(trees.nth(1)).toHaveAttribute('data-enhanced', '');
          await trees.nth(0).locator('[data-tree-toggle]').first().click();
          await expect(trees.nth(0).locator('[data-tree-toggle]').first()).toHaveAttribute('aria-expanded', 'true');
          await expect(trees.nth(1).locator('[data-tree-toggle]').first()).toHaveAttribute('aria-expanded', 'false');
          const carousels = page.locator('[data-astryx-carousel]');
          const before = await carousels.nth(1).locator('ul').evaluate(node => node.scrollLeft);
          await carousels.nth(0).locator('[data-next]').click();
          await expect.poll(() => carousels.nth(0).locator('ul').evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
          assert.equal(await carousels.nth(1).locator('ul').evaluate(node => node.scrollLeft), before);
          const galleries = page.locator('[data-astryx-classic-gallery]');
          await galleries.nth(0).locator('[data-gallery-open]').first().click();
          await expect(galleries.nth(0).locator('dialog')).toHaveAttribute('open', '');
          await expect(galleries.nth(1).locator('dialog')).not.toHaveAttribute('open', '');
          await page.keyboard.press('Escape');
          if (width === 390) {
            const navs = page.locator('[data-astryx-mobile-nav]');
            await navs.nth(1).locator('[data-nav-open]').click();
            await expect(navs.nth(1).locator('dialog')).toHaveAttribute('open', '');
            await expect(navs.nth(0).locator('dialog')).not.toHaveAttribute('open', '');
            await page.keyboard.press('Escape');
            await expect(navs.nth(1).locator('[data-nav-open]')).toBeFocused();
          }
        }
        assert.deepEqual(await page.evaluate(inspectIdentifiers), {duplicates: [], references: []});
        await page.screenshot({path: `${output}/${name}-${pipeline}-${width}-${javaScriptEnabled ? 'js' : 'native'}.png`});
        report.push({browser: name, pipeline, width, javaScriptEnabled, status: 'passed', occurrencesPerRecord: 14});
        console.log(`${name}/${pipeline}/${width}/${javaScriptEnabled ? 'js' : 'native'} passed`);
      }
      // Authored/plugin diagnostics report ambiguity without rewriting external IDs.
      await page.evaluate(() => {
        for (const type of ['html', 'external_plugin']) {
          const scope = document.createElement('div');
          scope.dataset.astryxRecordType = type; scope.dataset.astryxRecordAnchor = 'c999';
          scope.innerHTML = '<label for="authored-input">Authored label</label><input id="authored-input"><a href="#authored-input">Authored fragment</a>';
          document.body.append(scope);
        }
      });
      const diagnostics = await page.evaluate(inspectIdentifiers);
      assert.equal(diagnostics.duplicates.length, 1);
      assert.equal(diagnostics.references.length, 4);
      assert.deepEqual(diagnostics.duplicates[0].occurrences.map(node => node.type), ['html', 'external_plugin']);
      assert.deepEqual(errors, []); assert.deepEqual(failedAssets, []);
      await context.close();
    }
  } finally { await browser.close(); }
}
fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2) + '\n');
console.log(`Occurrence identifiers: ${report.length} real TYPO3 repeated/nested, cache, fragment, reference, keyboard and independent-state checks passed.`);
