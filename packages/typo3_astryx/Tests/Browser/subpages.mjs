import {chromium, webkit, expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = process.env.ASTRYX_TEST_URL ?? 'https://typo3-astryx.ddev.site';
const fixture = fs.readFileSync(process.env.ASTRYX_SUBPAGES_HTML ?? '/tmp/astryx-subpages-fixtures.html', 'utf8');
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-subpages-evidence';
fs.mkdirSync(output, {recursive: true});
const report = [];
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium, webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    const context = await browser.newContext({ignoreHTTPSErrors: true, javaScriptEnabled: true, reducedMotion: 'reduce'});
    const page = await context.newPage();
    const badAssets = [];
    page.on('response', r => {if (r.url().startsWith(base) && r.status() >= 400) badAssets.push(r.url());});
    await page.goto(`${base}/code/menues`, {waitUntil: 'networkidle'});
    const vite = await page.locator('link[rel="stylesheet"]').evaluateAll(elements => elements.map(e => e.href));
    const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json', 'utf8'));
    const extensionEntry = Object.keys(manifest).find(k => k.includes('typo3-astryx/') && k.endsWith('/Main.entry.js'));
    const packaged = [`${base}/_assets/`];
    // Resolve packaged CSS from its installed extension URL, using an actual published asset on the server.
    const packagePath = fs.realpathSync('public/_assets/' + fs.readdirSync('public/_assets').find(d => {
      try {return fs.realpathSync(`public/_assets/${d}`).endsWith('/packages/typo3_astryx/Resources/Public');} catch {return false;}
    }));
    const published = fs.readdirSync('public/_assets').find(d => {try {return fs.realpathSync(`public/_assets/${d}`) === packagePath;} catch {return false;}});
    packaged[0] = `${base}/_assets/${published}/Assets/astryx.css`;
    assert(extensionEntry && vite.some(url => url.includes('/_assets/vite/')), 'Live page loads the consuming Vite assets');
    for (const [pipeline, assets] of [['vite', vite], ['packaged', packaged]]) {
      for (const width of [1440, 390]) for (const mode of ['light', 'dark']) {
        await page.setViewportSize({width, height: 900});
        await page.setContent(`<!doctype html><html lang="en"><head>${assets.map(href => `<link rel="stylesheet" href="${href}">`).join('')}</head><body class="astryx-root" data-astryx-theme="neutral" data-astryx-mode="${mode}"><main style="width: min(100% - 32px, 720px); margin: 24px auto">${fixture}</main></body></html>`);
        await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('Font loading timed out')), 10000))]));
        await page.mouse.click(0, 0);
        const links = page.locator('.astryx-side-nav-item');
        const current = links.nth(0), ancestor = links.nth(1), regular = links.nth(2);
        const metrics = await links.evaluateAll(els => els.map(e => {const c=getComputedStyle(e);return {x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,parent:e.closest('main').getBoundingClientRect().width,size:c.fontSize,font:c.fontFamily,weight:c.fontWeight,line:c.lineHeight,radius:c.borderRadius};}));
        assert(metrics.every(m => Math.abs(m.width-m.parent)<1 && m.size==='14px' && m.font.startsWith('Figtree') && m.radius==='10px'));
        assert(metrics.slice(1).every((m,i)=>m.y >= metrics[i].y+metrics[i].height+1));
        assert.equal(metrics[0].weight,'500'); assert.equal(metrics[2].weight,'400');
        assert(metrics[3].height > 32, 'Long labels wrap without truncation');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const selected = mode==='light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)';
        const hover = mode==='light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
        const pressed = mode==='light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
        await page.keyboard.press(name === 'webkit' ? 'Alt+Tab' : 'Tab'); await expect(current).toBeFocused();
        assert.equal(await current.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
        const background = locator => locator.evaluate(e=>getComputedStyle(e).backgroundColor);
        assert.equal(await background(current),selected); assert.equal(await background(ancestor),selected);
        await regular.hover(); assert.equal(await background(regular),hover);
        await page.mouse.down(); assert.equal(await background(regular),pressed); await page.mouse.move(0,0); await page.mouse.up();
        await current.hover(); assert.equal(await background(current),selected);
        await page.mouse.down(); assert.equal(await background(current),selected); await page.mouse.move(0,0); await page.mouse.up();
        report.push({browser:name,pipeline,width,mode,status:'passed'});
      }
    }
    const noJs = await browser.newContext({ignoreHTTPSErrors: true, javaScriptEnabled: false, reducedMotion: 'reduce'});
    const live = await noJs.newPage();
    for (const width of [1440,390]) {
      await live.setViewportSize({width,height:900});
      await live.goto(`${base}/code/menues`,{waitUntil:'networkidle'});
      const menu = live.locator('#c58 .astryx-side-nav');
      await expect(menu).toBeVisible();
      assert.equal(await menu.locator('a').count(),6);
      await menu.locator('a').first().hover();
      await live.screenshot({path:`${output}/${name}-${width}.png`});
    }
    assert.deepEqual(badAssets,[]);
    await noJs.close();
    await context.close();
  } finally {await browser.close();}
}
fs.writeFileSync(`${output}/report.json`,JSON.stringify(report,null,2)+'\n');
console.log(`Subpages: ${report.length} browser/pipeline/viewport/mode checks passed; live TYPO3 pages and assets verified without JavaScript and with reduced motion.`);
