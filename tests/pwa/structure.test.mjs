import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
const source=new URL('../../public/pwa/',import.meta.url), output=new URL('../../docs/pwa/',import.meta.url);
test('manifest uses project-safe relative scope and assets',async()=>{
 const m=JSON.parse(await readFile(new URL('manifest.webmanifest',source)));
 for(const key of ['id','start_url','scope']) assert.equal(m[key],'./'); assert.equal(m.display,'standalone');
 for(const icon of m.icons) { assert(icon.src.startsWith('./'));const data=await readFile(new URL(icon.src,source));assert(data.length>100); }
 assert(m.icons.some(i=>i.purpose==='maskable'));
});
test('every app file is exported byte-for-byte',async()=>{
 for(const name of await readdir(source,{recursive:true})) { if(!name.includes('.'))continue; assert.deepEqual(await readFile(new URL(name,source)),await readFile(new URL(name,output)),name); }
});
test('service worker precaches assets and stays inside pwa scope',async()=>{
 const sw=await readFile(new URL('service-worker.js',source),'utf8');
 const assets=[...sw.matchAll(/'((?:\.\/)[^']*)'/g)].map(x=>x[1]);
 for(const asset of assets.filter(x=>x!=='./')) await readFile(new URL(asset,source));
 assert.match(sw,/startsWith\(self.registration.scope\)/); assert.match(sw,/startsWith\(PREFIX\)/);
 assert.doesNotMatch(sw,/indexedDB|localStorage|skipWaiting\(/);
 const app=await readFile(new URL('app.js',source),'utf8');assert.match(app,/register\('\.\/service-worker.js', \{ scope: '\.\/'/);
 for(const name of ['app.js','datetime.js','ics.js','storage.js']){const text=await readFile(new URL(name,source),'utf8');assert.doesNotMatch(text,/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/);}
});
test('native landing pages retain all original content except PWA navigation',async()=>{
 const {createHash}=await import('node:crypto');
 const originals = {'docs/index.html': 'fffc211ef458ff601fdd5f18120449cb8dc234d76f54a1ed05cc9f0162e95955', 'docs/windows.html': '3d861022a49aa478958ee5dd6a71cc6c56e6451e405da7f71cb9ca22ba7108d9', 'public/windows.html': '3d861022a49aa478958ee5dd6a71cc6c56e6451e405da7f71cb9ca22ba7108d9'};
 for(const [path,hash] of Object.entries(originals)) {
  const after=await readFile(new URL('../../'+path,import.meta.url),'utf8');
  assert.equal(createHash('sha256').update(after.replace('<a href="./pwa/">ブラウザ版を今すぐ使う</a>','')).digest('hex'),hash,path);
 }
});
