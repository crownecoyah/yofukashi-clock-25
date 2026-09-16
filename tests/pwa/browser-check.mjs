// Optional integration QA. Install Playwright separately; no runtime app dependency.
import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const { chromium } = await import(process.env.PWA_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PWA_TEST_URL || 'http://localhost:4173/yofukashi-clock-25/pwa/';
const artifacts = process.env.PWA_TEST_OUTPUT || join(tmpdir(),'yofukashi-pwa-qa');
await mkdir(artifacts,{recursive:true});
const profile = await mkdtemp(join(tmpdir(),'yofukashi-profile-'));
const options={ headless:true, viewport:{width:1200,height:900}, timezoneId:'Asia/Tokyo', acceptDownloads:true };
if(process.env.PWA_CHROME_PATH) options.executablePath=process.env.PWA_CHROME_PATH;
let context=await chromium.launchPersistentContext(profile,options);
let page=await context.newPage();
const errors=[],external=[],checks=[];
const pass=name=>{checks.push(name);console.log('PASS',name);};
function observe(p){p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(new URL(base).origin))external.push(r.url());});}
observe(page);
const ready=async()=>{await page.waitForFunction(()=>!document.querySelector('#add').disabled);};
async function fillEvent(title='深夜作業'){await page.locator('#title').fill(title);await page.locator('#start-date').fill('2027-01-01');await page.locator('#start-time').fill('25:00');await page.locator('#end-date').fill('2027-01-01');await page.locator('#end-time').fill('28:00');}
try {
 await page.goto(base);await ready();await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 assert.match(await page.locator('#offline-state').textContent(),/準備ができました/);pass('startup and offline cache ready');
 const scope=await page.evaluate(async()=>(await navigator.serviceWorker.getRegistration()).scope);assert.equal(scope,base);pass('SW scoped to project /pwa/');
 const cdp=await context.newCDPSession(page);const manifest=await cdp.send('Page.getAppManifest');assert.equal(manifest.errors.length,0);const installability=await cdp.send('Page.getInstallabilityErrors');assert.deepEqual(installability.installabilityErrors,[]);pass('manifest and Chrome installability audit');
 await page.locator('#add').click();await page.locator('#save').click();assert.match(await page.locator('#form-error').textContent(),/タイトル/);
 await fillEvent();await page.locator('#end-time').fill('25:00');await page.locator('#save').click();assert.match(await page.locator('#form-error').textContent(),/開始日時より後/);pass('title and end-before-start validation');
 await page.locator('#end-time').fill('28:00');assert.match(await page.locator('#actual-preview').textContent(),/2027\/01\/02 01:00.*2027\/01\/02 04:00/s);
 await page.locator('#note').fill('日本語,;\\\n<script>alert(1)</script>');await page.locator('#save').click();await page.waitForFunction(()=>!document.querySelector('#editor').open);
 assert.match(await page.locator('#events').innerText(),/25:00 ～ 28:00/);pass('25-hour event add and actual preview');
 await page.getByRole('button',{name:'編集',exact:true}).click();await page.locator('#title').fill('深夜作業・編集');await page.locator('#save').click();await page.waitForFunction(()=>!document.querySelector('#editor').open);assert.match(await page.locator('#events').innerText(),/編集/);pass('event edit and safe text rendering');
 await page.locator('#settings summary').click();await page.locator('#boundary').selectOption('0');await page.locator('#font').selectOption('serif');await page.locator('#seconds').uncheck();assert.match(await page.locator('#events').innerText(),/01:00 ～ 04:00/);assert.equal(await page.locator('#digital .seconds').count(),0);pass('boundary, font, seconds');
 await page.reload();await ready();assert.equal(await page.locator('#boundary').inputValue(),'0');assert.equal(await page.locator('#font').inputValue(),'serif');assert.match(await page.locator('#events').innerText(),/深夜作業・編集/);pass('reload persistence');
 const dl=page.waitForEvent('download');await page.getByRole('button',{name:'カレンダーに追加',exact:true}).click();const download=await dl;const ics=await readFile(await download.path(),'utf8');assert(ics.includes('DTSTART:20270101T160000Z'));assert(ics.includes('DTEND:20270101T190000Z'));assert(ics.includes('SUMMARY:深夜作業・編集'));assert(ics.includes('日本語\\,\\;\\\\\\n'));pass('share fallback download, UTC, Japanese and escaping');
 await page.screenshot({path:join(artifacts,'desktop.png'),fullPage:true});
 for(const [width,height] of [[320,568],[390,844],[768,1024],[844,390]]){
  await page.setViewportSize({width,height});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} overflow`);
  await page.locator('#add').click();await page.locator('#note').fill('キーボード入力');await page.locator('#save').scrollIntoViewIfNeeded();assert(await page.locator('#save').isVisible());await page.screenshot({path:join(artifacts,`editor-${width}.png`),fullPage:true});await page.locator('#cancel').click();
  await page.screenshot({path:join(artifacts,`screen-${width}.png`),fullPage:true});
 }pass('320,390,768,844px responsive and short landscape dialog');
 await context.setOffline(true);await page.reload();await ready();assert.match(await page.locator('#events').innerText(),/深夜作業・編集/);
 await page.locator('#add').click();await fillEvent('オフライン予定');await page.locator('#save').click();await page.waitForFunction(()=>!document.querySelector('#editor').open);assert.equal(await page.locator('.event').count(),2);
 await page.locator('.event').filter({has:page.getByRole('heading',{name:'オフライン予定',exact:true})}).getByRole('button',{name:'編集',exact:true}).click();await page.locator('#title').fill('オフライン編集');await page.locator('#save').click();await page.waitForFunction(()=>!document.querySelector('#editor').open);
 const offlineDL=page.waitForEvent('download');await page.getByRole('button',{name:'ICSを保存',exact:true}).last().click();assert((await readFile(await (await offlineDL).path(),'utf8')).includes('BEGIN:VEVENT'));
 await page.locator('.event').filter({has:page.getByRole('heading',{name:'オフライン編集',exact:true})}).getByRole('button',{name:'削除',exact:true}).click();await page.locator('#confirm-delete').click();await page.waitForFunction(()=>!document.querySelector('#delete-dialog').open);assert.equal(await page.locator('.event').count(),1);pass('offline reload, add, edit, delete and ICS');
 await context.close();context=await chromium.launchPersistentContext(profile,options);await context.setOffline(true);page=await context.newPage();observe(page);await page.goto(base);await ready();assert.match(await page.locator('#events').innerText(),/深夜作業・編集/);assert.equal(await page.locator('#boundary').inputValue(),'0');pass('browser process restart offline retains events and settings');
 await context.setOffline(false);
 for(const name of ['index.html','windows.html']){await page.goto(new URL('../'+name,base).href);assert.equal(await page.evaluate(()=>navigator.serviceWorker.controller),null);assert(await page.locator('h1').count()>0);await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:join(artifacts,name+'.png'),fullPage:true});assert.equal(await page.getByRole('link',{name:'ブラウザ版を今すぐ使う',exact:true}).count(),1);}
 pass('Mac and Windows pages are outside SW control');assert.deepEqual(errors,[]);assert.deepEqual(external,[]);pass('no page exceptions or external requests');
 await writeFile(join(artifacts,'results.json'),JSON.stringify({browser:context.browser()?.version(),checks,errors,external,installability,scope},null,2));
} finally {await context.close();}
