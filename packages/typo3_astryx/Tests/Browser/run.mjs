import {chromium,firefox,webkit} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {verifyAccordion} from './accordion.mjs';
const base=process.env.ASTRYX_TEST_URL??'https://astryx-fixture.ddev.site';
const directory=process.env.ASTRYX_TEST_OUTPUT??'/tmp/astryx-browser-evidence';fs.mkdirSync(directory,{recursive:true});
const brandCss=fs.readFileSync(new URL('../../Documentation/Examples/Brand.css',import.meta.url),'utf8');
const engines=(process.env.ASTRYX_TEST_BROWSERS??'chromium,firefox,webkit').split(',');
const report=[];
for(const name of engines) {
 const browser=await ({chromium,firefox,webkit}[name]).launch({env:{...process.env,TMPDIR:'/tmp'}});
 try {
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});
  const page=await context.newPage();page.setDefaultNavigationTimeout(120000);page.setDefaultTimeout(120000);const errors=[];const badAssets=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.url().startsWith(base)&&response.status()>=400)badAssets.push(response.url());});
  await page.goto(base+'/astryx-showcase',{waitUntil:'networkidle'});
  assert.match(await page.title(),/Astryx showcase/);
  assert(await page.getByLabel('Email address').isVisible());
  await page.getByLabel('Email address').fill('fixture@example.com');
  await page.getByRole('button',{name:'Submit fixture'}).click();
  await page.getByText('Astryx form submitted',{exact:true}).waitFor();
  await page.goto(base+'/astryx-showcase',{waitUntil:'networkidle'});
  assert(!await page.locator('body').innerText().then(text=>/no rendering definition|Oops, an error|Vite Error/.test(text)));
  assert.equal(await page.locator('main').count(),1);assert.equal(await page.locator('html').count(),1);
  assert.equal(await page.getByText('Left child',{exact:true}).count(),1);assert.equal(await page.getByText('Right child',{exact:true}).count(),1);
  assert.equal(await page.locator('.astryx-card-grid > article').count(),3);
  assert(await page.locator('table th').count()>0);assert.equal(await page.locator('.astryx-carousel-track > li').count(),5);
  const accordion=page.locator('[data-astryx-accordion]').first();
  assert.equal(await accordion.locator('details[open]').count(),1);
  await verifyAccordion(accordion);
  const carousel=page.locator('[data-astryx-carousel]').first();
  await carousel.locator('[data-next]').click();await page.waitForTimeout(350);
  const pages = await carousel.locator('[data-carousel-page]:visible').count();
  assert.equal(await carousel.locator('[data-position]').innerText(), `Page 2 of ${pages}`);
  assert.equal(await carousel.locator('[data-carousel-page][aria-current="page"]').getAttribute('data-carousel-page'), '1');
  const modeEvidence=[];
  for(const theme of ['neutral','stone','ocean'])for(const mode of ['system','light','dark']) {
    await page.locator('.astryx-root').evaluate((root,{theme,mode})=>{root.dataset.astryxTheme=theme;root.dataset.astryxMode=mode;},{theme,mode});
    modeEvidence.push({theme,mode,...await page.locator('.astryx-root').evaluate(root=>({background:getComputedStyle(root).backgroundColor,color:getComputedStyle(root).color,scheme:getComputedStyle(root).colorScheme}))});
  }
  assert.notEqual(modeEvidence.find(row=>row.theme==='neutral'&&row.mode==='light').background,modeEvidence.find(row=>row.theme==='neutral'&&row.mode==='dark').background);
  // Nested boundaries must override inherited values without changing the parent.
  const nested=await page.locator('.astryx-root').evaluate(root=>{
   root.dataset.astryxTheme='neutral';root.dataset.astryxMode='light';
   const outer=getComputedStyle(root).getPropertyValue('--astryx-accent');
   const child=document.createElement('div');child.dataset.astryxTheme='ocean';root.append(child);
   const inner=getComputedStyle(child).getPropertyValue('--astryx-accent');child.remove();return {outer,inner};
  });assert.notEqual(nested.outer,nested.inner);
  await page.addStyleTag({content:brandCss});
  await page.locator('.astryx-root').evaluate(root=>root.classList.add('product-brand'));
  assert.match(await page.locator('.astryx-root').evaluate(root=>getComputedStyle(root).getPropertyValue('--astryx-radius-element')),/6px/);
  await page.locator('.astryx-root').evaluate(root=>root.classList.remove('product-brand'));
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  const violations=axe.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>n.target)}));
  await page.screenshot({path:`${directory}/${name}-desktop.png`,fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert(await page.locator('[data-nav-open]').isVisible());
  await page.locator('[data-nav-open]').click();assert(await page.locator('dialog').evaluate(dialog=>dialog.open));
  await page.keyboard.press('Escape');assert(!await page.locator('dialog').evaluate(dialog=>dialog.open));
  assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-nav-open')),true);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
  await page.screenshot({path:`${directory}/${name}-mobile.png`,fullPage:true});
  for(const [route,expected] of [['/astryx-sidebar','Sidebar detail'],['/astryx-app','App detail']]) {
    await page.goto(base+route,{waitUntil:'networkidle'});assert(await page.getByText(expected,{exact:true}).count()===1);
  }
  await page.goto(base+'/de/astryx-showcase',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.astryx-card-grid > article').count(),3);
  assert.equal(await page.locator('main').count(),1);
  await context.close();
  const noJs=await browser.newContext({ignoreHTTPSErrors:true,javaScriptEnabled:false,viewport:{width:390,height:844}});
  const fallback=await noJs.newPage();fallback.setDefaultNavigationTimeout(120000);await fallback.goto(base+'/astryx-showcase');
  assert(await fallback.locator('.astryx-navigation > .astryx-menu').isVisible());
  assert(await fallback.locator('.astryx-carousel-track').isVisible());
  assert.equal(await fallback.locator('details').count(),3);await noJs.close();
  report.push({browser:name,version:browser.version(),status:violations.length?'accessibility-failed':'passed',errors,badAssets,violations,themes:modeEvidence});
  assert.deepEqual(errors,[]);assert.deepEqual(badAssets,[]);assert.deepEqual(violations,[]);
 } catch(error) { report.push({browser:name,status:'failed',error:error.stack});throw error; }
 finally { await browser.close(); fs.writeFileSync(`${directory}/report.json`,JSON.stringify(report,null,2)+'\n'); }
}
console.log(JSON.stringify(report,null,2));
