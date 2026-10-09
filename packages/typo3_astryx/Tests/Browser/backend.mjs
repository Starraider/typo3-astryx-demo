import {chromium} from '@playwright/test';import fs from 'node:fs';import assert from 'node:assert/strict';
const credentials=JSON.parse(fs.readFileSync('/tmp/astryx-backend-fixture.json','utf8'));
const baseUrl=process.env.ASTRYX_BACKEND_TEST_URL || 'https://astryx-fixture.ddev.site';
const browser=await chromium.launch();try {
 const page=await browser.newPage({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});page.setDefaultTimeout(240000);page.setDefaultNavigationTimeout(240000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>console.log('FAILED '+r.url().split('?')[0]+' '+r.failure()?.errorText));
 await page.goto(baseUrl+'/typo3/',{waitUntil:'domcontentloaded'});
 await page.locator('#t3-username').fill(credentials.username);await page.locator('#t3-password').fill(credentials.password);await page.locator('button[type=submit]').first().click();
 await page.waitForURL(url=>!url.pathname.includes('login'));
 await page.goto(baseUrl+'/typo3/module/web/layout?id=12',{waitUntil:'domcontentloaded'});
 console.log('Layout module '+page.url().split('?')[0]);
 await page.screenshot({path:'/tmp/astryx-browser-evidence/backend-shell.png',fullPage:true});
 await page.locator('#typo3-contentIframe').waitFor();
 const content=page.frameLocator('#typo3-contentIframe');
 await content.locator('.astryx-preview').first().waitFor();
 const previewCount=await content.locator('.astryx-preview').count();
 assert(previewCount>0,'Missing Content Blocks previews');
 assert(await content.getByText('Unused elements detected on this page',{exact:true}).count()===0,'Default layout has unused columns');
 console.log(JSON.stringify({backendPreviewCount:previewCount}));
 await page.screenshot({path:'/tmp/astryx-browser-evidence/backend-page.png',fullPage:true});
 await page.goto(baseUrl+'/typo3/record/edit?edit[tt_content][16]=edit',{waitUntil:'domcontentloaded'});
 await page.locator('#typo3-contentIframe').waitFor();
 const editing=page.frameLocator('#typo3-contentIframe');
 const editor=editing.locator('.ck-editor__editable').first();await editor.waitFor();
 assert(await editing.locator('link[href*="rte-tokens.css"]').count()>0,'RTE stylesheet not loaded');
 console.log(JSON.stringify({errors,editorColor:await editor.evaluate(e=>getComputedStyle(e).color)}));
 await page.screenshot({path:'/tmp/astryx-browser-evidence/backend-rte.png',fullPage:true});
} finally {await browser.close();}
