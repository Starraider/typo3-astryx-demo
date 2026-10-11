import {chromium, webkit} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Expected values measured on https://astryx.atmeta.com/themes?theme=stone,
// light/dark preview, 2026-10-10; cross-checked with @astryxdesign/cli 0.6.7.
// Local adaptation: H1–H6 use weight 400 instead of upstream 600/700.
// No records or site settings are changed by this check.
const base = new URL(process.env.ASTRYX_TEST_URL ?? 'https://typo3-astryx.ddev.site').origin;
const fixture = fs.readFileSync(process.env.ASTRYX_THEME_HTML ?? '/tmp/astryx-theme-fixtures.html', 'utf8');
const output = process.env.ASTRYX_TEST_OUTPUT ?? '/tmp/astryx-stone-evidence';
fs.mkdirSync(output, {recursive: true});
const asset = fs.readdirSync('public/_assets').find(name => fs.lstatSync(`public/_assets/${name}`).isSymbolicLink() && /typo3[-_]astryx/.test(fs.readlinkSync(`public/_assets/${name}`)));
assert(asset);
const manifest = JSON.parse(fs.readFileSync('public/_assets/vite/.vite/manifest.json', 'utf8'));
const entry = Object.entries(manifest).find(([key]) => /typo3[-_]astryx\/Resources\/Private\/JavaScript\/Main\.entry\.js$/.test(key))?.[1];
assert(entry);
const shared = Object.values(manifest).filter(item => item.src?.startsWith('_') && item.file.endsWith('.css')).map(item => item.file);
const paths = {packaged: [`_assets/${asset}/Assets/astryx.css`], vite: [...new Set([...entry.css, ...shared])].map(file => `_assets/vite/${file}`), rte: [`_assets/${asset}/Css/rte-tokens.css`], preview: [`_assets/${asset}/Css/backend-preview.css`]};
const colors = {
  light: {text: 'rgb(37, 37, 42)', secondary: 'rgb(94, 94, 99)', body: 'rgb(243, 243, 245)', card: 'rgb(255, 255, 255)', border: 'rgb(226, 226, 232)', strong: 'rgb(131, 131, 138)', on: 'rgb(255, 255, 255)', code: 'rgb(243, 243, 245)', keyword: 'rgb(100, 90, 114)', string: 'rgb(78, 99, 87)', comment: 'rgb(94, 94, 94)', hues: {neutral: ['rgb(226, 226, 232)', 'rgb(70, 70, 75)'], accent: ['rgb(215, 228, 245)', 'rgb(60, 72, 86)'], success: ['rgb(208, 233, 206)', 'rgb(55, 76, 54)'], warning: ['rgb(244, 225, 183)', 'rgb(82, 70, 34)'], error: ['rgb(249, 220, 215)', 'rgb(88, 65, 62)']}},
  dark: {text: 'rgb(243, 243, 245)', secondary: 'rgb(171, 171, 176)', body: 'rgb(17, 16, 21)', card: 'rgb(36, 35, 37)', border: 'rgba(243, 243, 245, 0.1)', strong: 'rgb(94, 94, 97)', on: 'rgb(37, 37, 42)', code: 'rgb(23, 23, 25)', keyword: 'rgb(178, 167, 193)', string: 'rgb(155, 177, 154)', comment: 'rgb(171, 171, 176)', hues: {neutral: ['rgb(82, 82, 87)', 'rgb(226, 226, 232)'], accent: ['rgb(72, 83, 98)', 'rgb(215, 228, 245)'], success: ['rgb(66, 88, 65)', 'rgb(208, 233, 206)'], warning: ['rgb(94, 81, 45)', 'rgb(244, 225, 183)'], error: ['rgb(100, 77, 73)', 'rgb(249, 220, 215)']}}
};
const report = [];
const style = async (page, selector) => page.locator(selector).first().evaluate(el => {
  const c = getComputedStyle(el);
  return Object.fromEntries(['fontFamily','fontSize','fontWeight','lineHeight','color','backgroundColor','borderRadius','borderTopWidth','borderTopColor','paddingTop','height'].map(k => [k,c[k]]));
});
const close = (actual, expected, message) => assert(Math.abs(parseFloat(actual) - expected) < .02, `${message}: ${actual} != ${expected}`);
const headings = async (page, scope, expectedColor) => {
  for (const [index, size] of [27,22,18,14,11,9].entries()) {
    const c = await style(page, `${scope} > h${index+1}`);
    assert(c.fontFamily.startsWith('Montserrat,'), c.fontFamily);
    assert.equal(c.fontSize, `${size}px`);
    assert.equal(c.fontWeight, '400');
    close(c.lineHeight, [35.9991,31.999,28.0008,20.0004,15.9995,16.0002][index], `h${index+1} leading`);
    assert.equal(c.color, expectedColor);
  }
};
for (const name of (process.env.ASTRYX_TEST_BROWSERS ?? 'chromium,webkit').split(',')) {
  const browser = await ({chromium,webkit}[name]).launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    const page = await browser.newPage({ignoreHTTPSErrors:true,deviceScaleFactor:2});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => {if(r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);});
    for (const [pipeline, css] of Object.entries(paths)) for (const mode of ['light','dark']) {
      const editor = ['rte','preview'].includes(pipeline);
      const scope = editor ? (pipeline === 'rte' ? 'ck-content' : 'astryx-preview') : 'astryx-root';
      let content = editor ? '<section class="theme-example">'+[1,2,3,4,5,6].map(i=>`<h${i}>Heading ${i}</h${i}>`).join('')+'<p>Figtree body text — ÄÖÜ ß</p><small>Supporting text</small><p><code>const theme = "stone";</code></p></section>' : fixture;
      if(pipeline === 'preview') content = content.replace('<p><code>', '<pre class="astryx-code-preview"><code>').replace('</code></p>', '</code></pre>');
      const body = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${base}/"><title>Stone theme verification</title>${css.map(file=>`<link rel="stylesheet" href="${file}">`).join('')}<style>body{margin:0}.theme-example{display:grid;gap:16px;max-width:900px;padding:24px;margin:auto}.example-row{display:flex;flex-wrap:wrap;gap:8px}.astryx-code-block{padding:16px} .theme-example p{margin:0}aside{display:grid;gap:8px}</style></head><body class="${scope}" data-astryx-theme="stone" data-astryx-mode="${mode}">${content}${editor?'':`<section id="nested-neutral" class="astryx-root" data-astryx-theme="neutral" data-astryx-mode="light"><h1>Neutral boundary</h1><div class="astryx-root" id="nested-stone" data-astryx-theme="stone" data-astryx-mode="dark"><h1>Stone boundary</h1></div></section>`}</body></html>`;
      await page.route(base+'/__astryx-stone-test__', route=>route.fulfill({contentType:'text/html',body}));
      await page.goto(base+'/__astryx-stone-test__', {waitUntil:'networkidle'});
      await page.evaluate(()=>document.fonts.ready);
      const fontChecks = await page.evaluate(()=>Object.fromEntries(['400 27px Montserrat','400 18px Montserrat','400 14px "JetBrains Mono"','400 14px Figtree'].map(font=>[font,document.fonts.check(font)])));
      assert(Object.values(fontChecks).every(Boolean), `${name}/${pipeline}/${mode} bundled fonts: ${JSON.stringify(fontChecks)}`);
      for (const width of [1280,390]) {
        await page.setViewportSize({width,height:1000});
        const c = colors[mode];
        if(!editor) assert.equal((await style(page,'body')).backgroundColor,c.body);
        await headings(page,'.theme-example',c.text);
        const text = await style(page, editor ? '.theme-example > p' : '.theme-example > .astryx-prose');
        assert(text.fontFamily.startsWith('Figtree,')); assert.equal(text.fontSize,'14px'); close(text.lineHeight,20.0004,'body leading');
        const code = await style(page,'.astryx-prose code, .theme-example code'); assert(code.fontFamily.replaceAll('"','').startsWith('JetBrains Mono,'), `${name}/${pipeline}/${mode}: ${code.fontFamily}`); assert.equal(code.fontSize,'14px');
        if(!editor) {
          const lead = await style(page,'.astryx-lead'); assert.equal(lead.color,c.secondary);
          const display = await style(page,'[data-test="display"] > h2'); assert.equal(display.fontSize,'43px',`${name}/${pipeline}/${mode}/${width} display size`); assert.equal(display.fontWeight,'400'); close(display.lineHeight,51.9999,'display leading');
          for (const [variant,[bg,color]] of Object.entries(c.hues)) {
            const badge = await style(page,`[data-badge="${variant}"] > span`); assert.equal(badge.backgroundColor,bg); assert.equal(badge.color,color); assert.equal(badge.borderTopWidth,'0px'); assert.equal(badge.fontSize,'12px'); close(badge.lineHeight,17.454,'badge leading');
            if(variant !== 'neutral') {const notice = await style(page,`[data-notice="${variant}"]`); assert.equal(notice.backgroundColor,bg); assert.equal((await style(page,`[data-notice="${variant}"] .astryx-prose`)).color,color); assert.equal((await style(page,`[data-notice="${variant}"] h4`)).color,color);}
          }
          const primary = await style(page,'[data-button="primary"] button'); assert.equal(primary.backgroundColor,c.text); assert.equal(primary.color,c.on); assert.equal(primary.fontSize,'14px'); assert.equal(primary.borderRadius,'9999px'); assert.equal(primary.height,'32px');
          const secondary = await style(page,'[data-button="secondary"] button'); assert.equal(secondary.backgroundColor,'rgba(0, 0, 0, 0)'); // Engines snap fractional borders to device pixels; the theme value must stay exact.
          assert.equal(await page.locator('[data-button="secondary"] button').evaluate(el=>getComputedStyle(el).getPropertyValue('--astryx-button-secondary-border-width').trim()),'1.5px');
          assert(['1px','1.5px','2px'].includes(secondary.borderTopWidth),`${name}/${pipeline}/${mode} fractional border`); assert.equal(secondary.borderTopColor,c.strong);
          const destructive = await style(page,'[data-button="destructive"] button'); assert.equal(destructive.backgroundColor,c.hues.error[0]); assert.equal(destructive.color,c.hues.error[1]);
          const card = await style(page,'.astryx-card'); assert.equal(card.backgroundColor,c.card); assert.equal(card.borderTopColor,c.border); assert.equal(card.paddingTop,'12px');
          assert.equal((await style(page,'.astryx-code-block')).backgroundColor,c.code);
          for(const token of ['keyword','string','comment']) assert.equal((await style(page,`.hljs-${token}`)).color,c[token]);
          const neutral = await style(page,'#nested-neutral > h1'); assert(neutral.fontFamily.startsWith('Figtree,')); assert.equal(neutral.fontSize,'42px'); assert.equal(neutral.fontWeight,'600');
          const nested = await style(page,'#nested-stone > h1'); assert(nested.fontFamily.startsWith('Montserrat,')); assert.equal(nested.fontSize,'27px'); assert.equal(nested.fontWeight,'400'); assert.equal(nested.color,colors.dark.text);
          const supporting = await style(page,'.astryx-prose small'); close(supporting.lineHeight,17.454,'supporting leading');
          await page.locator('[data-button="primary"] button').focus(); assert(await page.locator('[data-button="primary"] button').evaluate(el=>el===document.activeElement));
        }
        assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),'No horizontal overflow');
        report.push({browser:name,pipeline,mode,width,status:'passed'});
        if(name==='chromium' && pipeline==='vite') await page.screenshot({path:`${output}/stone-${mode}-${width}.png`});
      }
    }
    await page.setViewportSize({width:1280,height:1000});
    // Rendered TYPO3 pages with a response-only Stone theme boundary; DB settings stay untouched.
    for(const path of ['/','/text','/code/card','/ueber-uns/notice','/code']) {
      await page.route(base+path, async route=>{
        const response=await route.fetch();
        const html=(await response.text()).replace('data-astryx-theme="neutral"','data-astryx-theme="stone"');
        await route.fulfill({response,body:html});
      });
      await page.goto(base+path,{waitUntil:'networkidle'});
      const heading=await style(page,'.astryx-heading'); assert(heading.fontFamily.startsWith('Montserrat,')); assert.equal(heading.fontWeight,'400');
      assert(await page.locator('.astryx-root[data-astryx-theme="stone"]').count());
      report.push({browser:name,livePage:path,status:'passed'});
      if(name==='chromium' && path==='/') await page.screenshot({path:`${output}/stone-typo3-page.png`,fullPage:true});
    }
    assert.deepEqual(errors,[]);
  } finally {await browser.close();}
}
fs.writeFileSync(`${output}/report.json`,JSON.stringify(report,null,2)+'\n');
console.log(`Stone reference parity: ${report.length} Chromium/WebKit desktop/mobile, light/dark, frontend/editor and live TYPO3 checks passed.`);
