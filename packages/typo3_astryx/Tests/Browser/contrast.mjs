import {chromium, webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = process.env.ASTRYX_TEST_URL || 'https://typo3-astryx.ddev.site';
const output = process.env.ASTRYX_TEST_OUTPUT || '/tmp/astryx-contrast-evidence';
fs.mkdirSync(output, {recursive: true});
const extension = fs.readdirSync('public/_assets').find(name => {
  try { return fs.realpathSync(`public/_assets/${name}`) === path.join(root, 'packages/typo3_astryx/Resources/Public'); } catch { return false; }
});
assert(extension, 'Published extension assets required');
const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json'));
const entry = Object.entries(manifest).find(([key]) => /typo3[-_]astryx\/Resources\/Private\/JavaScript\/Main\.entry\.js$/.test(key))[1];
const css = new Set();
const collect = item => { for (const file of item.css || []) css.add(file); for (const key of item.imports || []) collect(manifest[key]); if (item.file.endsWith('.css')) css.add(item.file); };
collect(entry);
// StyleX is extracted into shared CSS emitted alongside the registered Main entries.
for (const [key,item] of Object.entries(manifest)) if (key.startsWith('_') && item.file.endsWith('.css')) css.add(item.file);
const pipelines = {packaged: {css: [`/_assets/${extension}/Assets/astryx.css`], js: `/_assets/${extension}/Assets/astryx.js`}, vite: {css: [...css].map(file => `/_assets/vite/${file}`), js: `/_assets/vite/${entry.file}`}};
let fixture = fs.readFileSync(process.env.ASTRYX_CONTRAST_HTML || '/tmp/astryx-contrast-fixtures.html', 'utf8');
const photos = {
  white: '<rect width="800" height="600" fill="white"/>',
  black: '<rect width="800" height="600" fill="black"/>',
  busy: '<defs><pattern id="busy" width="32" height="32" patternUnits="userSpaceOnUse"><rect width="32" height="32" fill="white"/><path d="M0 0h16v16H0zM16 16h16v16H16z" fill="black"/><path d="M0 0l32 32M0 32L32 0" stroke="red" stroke-width="4"/></pattern></defs><rect width="800" height="600" fill="url(#busy)"/>',
};
// Substitute only response image pixels, retaining real Fluid/FAL markup and metadata.
fixture = fixture.replace(/<article data-photo="(white|black|busy)"[\s\S]*?<\/article>/g, (article, photo) => {
  const uri = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">${photos[photo]}</svg>`)}`;
  return article.replace(/src="[^"]*"/, `src="${uri}"`).replace(/srcset="[^"]*"/, `srcset="${uri} 800w"`);
});
const report = {date: '2026-10-11', method: 'Read-only TYPO3 Fluid/FAL HTML and published CSS/JS; computed sRGB alpha composites include exact white/black fixture pixels and the black-pixel minimum for busy black/white/red images.', matrix: [], live: []};
for (const [browserName, type] of Object.entries({chromium, webkit})) {
  if (process.env.ASTRYX_TEST_BROWSERS && !process.env.ASTRYX_TEST_BROWSERS.split(',').includes(browserName)) continue;
  const browser = await type.launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    const context = await browser.newContext({ignoreHTTPSErrors: true, viewport: {width: 1100, height: 900}});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    for (const [pipeline, assets] of Object.entries(pipelines)) for (const theme of ['neutral', 'stone', 'ocean']) for (const mode of ['light', 'dark']) {
      const url = `${base}/__astryx-contrast__`;
      const buttonsOnly=fixture.slice(0,fixture.indexOf('</section>')+10);
      await page.route(url, route => route.fulfill({contentType: 'text/html', body: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contrast regression</title>${assets.css.map(file => `<link rel="stylesheet" href="${base + file}">`).join('')}<script type="module" src="${base + assets.js}"></script><style>body{margin:0}.host{padding:16px;max-width:850px;margin:auto}article{margin-block:24px}[data-test=buttons]{display:flex;flex-wrap:wrap;gap:12px}</style></head><body class="astryx-root" data-astryx-theme="${theme}" data-astryx-mode="${mode}"><main class="host"><div data-astryx-mode="${mode === 'light' ? 'dark' : 'light'}"><div data-boundary="mode-only" data-astryx-mode="${mode}">${buttonsOnly}</div></div><div data-boundary="direct">${fixture}</div><div data-astryx-theme="${theme === 'stone' ? 'ocean' : 'stone'}" data-astryx-mode="${mode === 'light' ? 'dark' : 'light'}"><div data-boundary="nested" data-astryx-theme="${theme}" data-astryx-mode="${mode}">${fixture.replace(/ id="[^"]*"/g, '')}</div></div></main></body></html>`}));
      await page.goto(url, {waitUntil: 'networkidle'});
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
      // Keep helper functions in the browser so hover/focus samples use identical calculations.
      await page.evaluate(() => {
        const rgba = color => { const values = color.match(/[\d.]+/g).map(Number); return [values[0], values[1], values[2], values[3] ?? 1]; };
        const composite = (front, back) => [...front.slice(0,3).map((value,i) => value * front[3] + back[i] * (1-front[3])), 1];
        const background = element => {
          const stack = []; for (let node=element; node; node=node.parentElement) stack.unshift(node);
          return stack.reduce((back,node) => {
            const painted=composite(rgba(getComputedStyle(node).backgroundColor),back);
            if(node.matches('.astryx-hero[data-layout=overlay]') && node.querySelector('img')) {
              // White/black are exact fixture pixels. For busy black/white/red pixels,
              // black bounds the lowest luminance of our white-panel/black-text pair.
              const photo=node.closest('[data-photo]')?.dataset.photo;
              if(photo) return photo==='white' ? [255,255,255,1] : [0,0,0,1];
            }
            return painted;
          },[255,255,255,1]);
        };
        const luminance = color => color.slice(0,3).map(value => {value /= 255; return value <= .04045 ? value/12.92 : ((value+.055)/1.055)**2.4;}).reduce((sum,value,index) => sum+value*[.2126,.7152,.0722][index], 0);
        const ratio = (front, back) => { const a=luminance(front), b=luminance(back); return (Math.max(a,b)+.05)/(Math.min(a,b)+.05); };
        window.contrastSample = element => { const style = getComputedStyle(element), bg = background(element); return {foreground: style.color, background: style.backgroundColor, effectiveBackground: bg.slice(0,3), ratio: ratio(composite(rgba(style.color),bg), bg), opacity: style.opacity}; };
        window.focusSample = element => { const style = getComputedStyle(element), bg = background(element.parentElement); return {color: style.outlineColor, width: style.outlineWidth, style: style.outlineStyle, offset: style.outlineOffset, surface: bg.slice(0,3), ratio: ratio(rgba(style.outlineColor),bg)}; };
      });
      const sample = async locator => locator.evaluate(element => window.contrastSample(element));
      const buttons = [], disabled = [];
      for (const boundary of ['direct', 'nested', 'mode-only']) for (const size of ['small', 'medium', 'large']) for (const kind of ['action', 'link']) {
        const button = page.locator(`[data-boundary=${boundary}] [data-size=${size}][data-kind=${kind}]`).locator('button,a');
        await page.mouse.move(0,0); await button.evaluate(element => element.blur());
        for (const state of ['normal','hover','focus']) {
          if (state === 'hover') await button.hover();
          if (state === 'focus') { await page.mouse.move(0,0); await page.keyboard.press('Tab'); await button.focus(); }
          const result = await sample(button);
          const expected = theme === 'stone' ? (mode === 'light' ? ['rgb(249, 220, 215)','rgb(88, 65, 62)'] : ['rgb(100, 77, 73)','rgb(249, 220, 215)']) : (mode === 'light' ? ['rgb(118, 0, 12)','rgb(255, 255, 255)'] : ['rgb(255, 196, 190)','rgb(21, 17, 12)']);
          assert.equal(result.background,expected[0]); assert.equal(result.foreground,expected[1]);
          assert(result.ratio >= 4.5, `${browserName}/${pipeline}/${theme}/${mode}/${boundary}/${size}/${kind}/${state}: ${JSON.stringify(result)}`);
          buttons.push({boundary,size,kind,state,...result});
        }
        for (const disabledKind of ['disabled','disabled-link']) {
          const control = page.locator(`[data-boundary=${boundary}] [data-size=${size}][data-kind=${disabledKind}]`).locator('button,span[role=link]');
          assert(await control.evaluate(element => element.matches(':disabled,[aria-disabled=true]')));
          const result = await sample(control); assert.equal(result.opacity, '0.6');
          disabled.push({boundary,size,kind:disabledKind,...result});
        }
      }
      const heroes = await page.locator('article[data-photo]').evaluateAll(elements => elements.map(article => {
        const panel = article.querySelector('.astryx-hero-content'), caption = article.querySelector('figcaption');
        const panelStyle = getComputedStyle(panel), captionStyle = getComputedStyle(caption);
        return {boundary:article.closest('[data-boundary]').dataset.boundary,photo:article.dataset.photo,variant:article.dataset.variant,aspect:article.dataset.aspect,panel:panelStyle.backgroundColor,captionSurface:captionStyle.backgroundColor,captionGap:caption.getBoundingClientRect().top-panel.getBoundingClientRect().bottom,image: {complete: article.querySelector('img').complete, width: article.querySelector('img').naturalWidth}, text: [...article.querySelectorAll('h2,h2 a,.astryx-badge,.astryx-heading-subtitle,.astryx-subheader,.astryx-lead,.astryx-prose,p,small,code,.astryx-prose a,.astryx-cta-group a,figcaption')].map(element => ({tag:element.tagName,text:element.textContent.trim().slice(0,60),...window.contrastSample(element)}))};
      }));
      for (const hero of heroes) {
        assert.equal(hero.panel, 'rgba(255, 255, 255, 0.46)', '54% transparent panel');
        assert.equal(hero.captionSurface, 'rgba(255, 255, 255, 0.46)', '54% transparent caption');
        assert(hero.captionGap >= 0, 'Caption overlaps content'); assert(hero.image.complete && hero.image.width > 0);
        for (const text of hero.text) assert(text.ratio >= 4.5, `${theme}/${mode} Hero ${JSON.stringify(text)}`);
      }
      const focus = [];
      for (const boundary of ['direct','nested']) for (const variant of ['neutral','accent']) {
        const hero = page.locator(`[data-boundary=${boundary}] article[data-photo=busy][data-variant=${variant}]`).first();
        for (const link of await hero.locator('a').all()) {
          await page.mouse.move(0,0); await page.keyboard.press('Tab'); await link.focus();
          const result = await link.evaluate(element => window.focusSample(element));
          assert.equal(result.style,'solid'); assert(parseFloat(result.width) >= 2); assert(result.ratio >= 3, `Focus surface: ${JSON.stringify(result)}`);
          // The outline and its offset must fit on the protective panel and inside Hero clipping.
          assert(await link.evaluate(element => { const panel=element.closest('.astryx-hero-content').getBoundingClientRect(), box=element.getBoundingClientRect(), style=getComputedStyle(element), extent=parseFloat(style.outlineWidth)+parseFloat(style.outlineOffset); return box.left-extent>=panel.left && box.right+extent<=panel.right && box.top-extent>=panel.top && box.bottom+extent<=panel.bottom; }), 'Focus escaped protective panel');
          focus.push({boundary,variant,text:await link.textContent(),...result});
          await link.hover(); const hovered = await sample(link); assert(hovered.ratio >= 4.5, JSON.stringify(hovered)); focus.at(-1).hover = hovered;
        }
      }
      const stress = [];
      await page.evaluate(() => { const sizes=[...document.querySelectorAll('.astryx-hero-content, .astryx-hero-content *, figcaption')].map(element=>[element,parseFloat(getComputedStyle(element).fontSize)]); for(const [element,size] of sizes) element.style.fontSize=`${size*2}px`; });
      for (const width of [390, 240]) {
        await page.setViewportSize({width,height:900});
        await page.addStyleTag({content: '.astryx-hero-content,.astryx-hero-media figcaption{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} .astryx-hero-content p{margin-bottom:2em!important}'});
        const geometry = await page.locator('article[data-photo]').evaluateAll(elements => elements.map(article => {
          const hero=article.querySelector('.astryx-hero'),panel=article.querySelector('.astryx-hero-content'),caption=article.querySelector('figcaption');
          return {host:article.clientWidth,hero:hero.getBoundingClientRect().width,panel:panel.getBoundingClientRect().width,panelScroll:panel.scrollWidth,panelClient:panel.clientWidth,captionScroll:caption.scrollWidth,captionClient:caption.clientWidth,captionGap:caption.getBoundingClientRect().top-panel.getBoundingClientRect().bottom,labelsContained:[...panel.querySelectorAll('.astryx-cta-group a')].every(element=>{const a=element.getBoundingClientRect(),b=element.querySelector('.astryx-button-label').getBoundingClientRect();return b.top>=a.top && b.bottom<=a.bottom;}),overflowElements:[...panel.querySelectorAll('*')].filter(element=>element.getBoundingClientRect().right>panel.getBoundingClientRect().right).map(element=>({tag:element.tagName,class:element.className,width:element.getBoundingClientRect().width,text:element.textContent.slice(0,40)}))};
        }));
        for (const dimensions of geometry) { assert(dimensions.hero <= dimensions.host+1, JSON.stringify(dimensions)); assert(dimensions.panelScroll <= dimensions.panelClient+1, JSON.stringify(dimensions)); assert(dimensions.captionScroll <= dimensions.captionClient+1); assert(dimensions.captionGap >= 0); assert(dimensions.labelsContained, 'Enlarged CTA text escaped its fill'); }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1), 'Horizontal document overflow');
        const stressLink=page.locator('[data-boundary=direct] article[data-photo=busy] .astryx-cta-group a').first(); await page.keyboard.press('Tab'); await stressLink.focus();
        assert(await stressLink.evaluate(element=>{const panel=element.closest('.astryx-hero-content').getBoundingClientRect(),box=element.getBoundingClientRect(),style=getComputedStyle(element),extent=parseFloat(style.outlineWidth)+parseFloat(style.outlineOffset);return box.left-extent>=panel.left && box.right+extent<=panel.right && box.top-extent>=panel.top && box.bottom+extent<=panel.bottom && window.focusSample(element).ratio>=3;}), 'Enlarged focus escaped safe surface');
        stress.push({width,textScale:'200%',textSpacing:true,heroes:geometry.length,status:'passed'});
      }
      await page.setViewportSize({width:390,height:900});
      if(browserName === 'chromium' && pipeline === 'packaged') await page.screenshot({path:`${output}/${theme}-${mode}-mobile.png`,fullPage:false});
      if(browserName === 'chromium' && pipeline === 'packaged') await page.locator('[data-boundary=direct] article[data-photo=busy][data-variant=neutral]').first().screenshot({path:`${output}/${theme}-${mode}-hero.png`});
      assert.deepEqual(errors, []); errors.length=0;
      report.matrix.push({browser:browserName,pipeline,theme,mode,buttons,disabled,heroes,focus,stress});
      await page.setViewportSize({width:1100,height:900}); await page.unroute(url);
    }
    for (const pathname of ['/', '/ueber-uns/hero']) {
      const response = await page.goto(base + pathname, {waitUntil:'networkidle'});
      assert.equal(response.status(),200);
      const loaded = await page.locator('link[rel=stylesheet]').evaluateAll(elements => elements.map(element => element.href));
      assert(loaded.some(url => url.includes('/_assets/')), 'Live TYPO3 emitted production assets');
      const heroes = await page.locator('.astryx-hero').evaluateAll(elements => elements.map(element => ({layout:element.dataset.layout,panel:getComputedStyle(element.querySelector('.astryx-hero-content')).backgroundColor,captions:element.querySelectorAll('figcaption').length})));
      assert(heroes.length > 0, 'Live TYPO3 Hero required');
      for (const hero of heroes) if (hero.layout === 'overlay') assert.equal(hero.panel, 'rgba(255, 255, 255, 0.46)', 'Live overlay is 54% transparent');
      assert.deepEqual(errors, []);
      report.live.push({browser:browserName,path:pathname,status:response.status(),stylesheets:loaded,heroes});
    }
    // The same markup/palette remains protected without JS and with reduced motion.
    const fallback = await browser.newContext({ignoreHTTPSErrors:true,javaScriptEnabled:false,reducedMotion:'reduce'});
    const fallbackPage = await fallback.newPage();
    await fallbackPage.route(`${base}/__astryx-contrast-fallback__`, route => route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="en"><head>${pipelines.packaged.css.map(file=>`<link rel="stylesheet" href="${base+file}">`).join('')}</head><body class="astryx-root" data-astryx-theme="ocean" data-astryx-mode="dark">${fixture}</body></html>`}));
    await fallbackPage.goto(`${base}/__astryx-contrast-fallback__`, {waitUntil:'networkidle'});
    assert.equal(await fallbackPage.locator('article[data-photo] figcaption:visible').count(),24);
    const link = fallbackPage.locator('article[data-photo] .astryx-cta-group a').first(); await link.focus();
    assert(await link.evaluate(element => element === document.activeElement));
    report.live.push({browser:browserName,noJavaScript:true,reducedMotion:true,captions:24,focus:'passed'});
    await fallback.close(); await context.close();
  } finally { await browser.close(); fs.writeFileSync(`${output}/measurements.json`,JSON.stringify(report,null,2)); }
}
const min = samples => Math.min(...samples.map(sample => sample.ratio));
console.log(JSON.stringify({configurations:report.matrix.length,minimumDestructive:min(report.matrix.flatMap(row=>row.buttons)),minimumHeroText:min(report.matrix.flatMap(row=>row.heroes.flatMap(hero=>hero.text))),minimumHeroFocus:min(report.matrix.flatMap(row=>row.focus)),live:report.live,output},null,2));
