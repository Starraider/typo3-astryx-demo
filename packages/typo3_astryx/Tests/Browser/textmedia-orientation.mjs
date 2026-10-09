import {chromium, webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Generate the fixtures with Tests/Functional/textmedia-orientation.php --html.
const html = fs.readFileSync(process.env.ASTRYX_ORIENTATION_HTML ?? '/tmp/astryx-textmedia-orientations.html', 'utf8');
const base = process.env.ASTRYX_TEST_URL ?? 'https://typo3-astryx.ddev.site/?id=7';
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-textmedia-evidence';
fs.mkdirSync(output, {recursive: true});
const report = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch();
  try {
    const context = await browser.newContext({ignoreHTTPSErrors: true, viewport: {width: 1440, height: 900}});
    const page = await context.newPage();
    const errors = [], badAssets = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(new URL(base).origin) && response.status() >= 400) badAssets.push(response.url());
    });
    assert.equal((await page.goto(base, {waitUntil: 'networkidle'})).status(), 200);
    const live = await page.locator('.astryx-textmedia').evaluateAll(elements => elements.map(element => ({
      id: element.closest('.astryx-element').id,
      orientation: element.dataset.orientation, alignment: element.dataset.alignment,
      images: element.querySelectorAll('img').length,
    })));
    assert(live.length > 0, 'Real Textmedia elements render, including valid text-only elements');
    assert(live.every(element => ['above', 'below', 'intext'].includes(element.orientation) &&
      ['left', 'center', 'right'].includes(element.alignment)), 'Live templates expose both position axes');

    await page.evaluate(html => {
      const section = document.createElement('section');
      section.id = 'orientation-fixtures';
      section.innerHTML = html;
      const image = document.querySelector('.astryx-textmedia img') ?? document.querySelector('.astryx-root img');
      if (!image) throw new Error('The orientation fixtures need an image specimen from the page');
      for (const element of section.querySelectorAll('.astryx-textmedia')) {
        // Exercise the actual Fluid-rendered wrappers and two figures per element.
        let media = element.querySelector(':scope > .astryx-media');
        if (!media) {
          // The text-only Fluid fixture correctly omits empty media; add it for the image cases.
          media = document.createElement('div');
          media.className = 'astryx-media';
          element.prepend(media);
        }
        for (let index = 0; index < 2; index++) {
          const figure = document.createElement('figure');
          figure.className = 'astryx-media';
          const img = image.cloneNode();
          img.removeAttribute('srcset');
          img.loading = 'eager';
          img.style.aspectRatio = '3 / 1';
          figure.append(img);
          media.append(figure);
        }
        const prose = element.querySelector('.astryx-prose');
        prose.innerHTML = '<p><span data-first>First words</span> ' +
          'Text should remain readable beside the image and continue across the full element below it. '.repeat(110) +
          '</p><p><span data-last>Last words</span></p>';
      }
      document.querySelector('main').append(section);
    }, html);
    await page.locator('#orientation-fixtures img').evaluateAll(images => Promise.all(images.map(image => image.decode())));

    for (const width of [1120, 480]) {
      await page.locator('#orientation-fixtures > .astryx-element').evaluateAll((elements, width) => {
        elements.forEach(element => element.style.inlineSize = `${width}px`);
      }, width);
      const geometries = await page.locator('#orientation-fixtures .astryx-textmedia').evaluateAll(elements => {
        const box = element => {
          const rect = element.getBoundingClientRect();
          return {left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width};
        };
        return elements.map(element => ({
          id: element.parentElement.id, orientation: element.dataset.orientation,
          alignment: element.dataset.alignment, noWrap: element.dataset.nowrap === 'true',
          root: box(element), media: box(element.querySelector(':scope > .astryx-media')),
          text: box(element.querySelector(':scope > .astryx-textmedia-text')),
          first: box(element.querySelector('[data-first]')), last: box(element.querySelector('[data-last]')),
          figures: Array.from(element.querySelectorAll('figure')).map(figure => ({...box(figure), order: getComputedStyle(figure).order})),
        }));
      });
      for (const item of geometries) {
        const label = `${name} ${width}px ${item.id} ${item.orientation}/${item.alignment}`;
        assert.equal(item.figures.length, 2, `${label}: each image renders once`);
        assert(item.figures.every(figure => figure.order === '0'), `${label}: wrapper placement does not reorder figures`);
        assert(item.figures[1].top >= item.figures[0].bottom - 1, `${label}: figures stay in sequence`);
        if (item.orientation !== 'intext' || width < 640) {
          const afterText = item.orientation === 'below' || (item.orientation === 'intext' && item.alignment === 'right');
          assert(afterText ? item.media.top >= item.text.bottom : item.media.bottom <= item.text.top, `${label}: vertical placement`);
        } else if (item.noWrap) {
          assert(Math.abs(item.media.top - item.text.top) < 1, `${label}: columns start together`);
          assert(item.alignment === 'right' ? item.media.left > item.text.right : item.media.right < item.text.left, `${label}: correct side`);
        } else {
          assert(item.alignment === 'right' ? item.first.right < item.media.left : item.first.left > item.media.right, `${label}: text starts beside the image`);
          assert(item.last.top > item.media.bottom, `${label}: long text continues below images`);
          assert(Math.abs(item.last.left - item.root.left) < 1, `${label}: text uses the full width below images`);
        }
        const expected = item.alignment === 'center' ? (item.root.left + item.root.right) / 2 : item.root[item.alignment];
        const actual = item.alignment === 'center' ? (item.media.left + item.media.right) / 2 : item.media[item.alignment];
        assert(Math.abs(actual - expected) < 1, `${label}: horizontal alignment`);
      }
      report.push({browser: name, containerWidth: width, orientations: geometries.length, status: 'passed'});
      await page.locator('#orientation-fixtures #c8').screenshot({path: `${output}/${name}-${width}-below-center.png`});
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(badAssets, []);
  } finally {
    await browser.close();
  }
}
fs.writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
