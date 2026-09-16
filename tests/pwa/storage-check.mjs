import test from 'node:test';
import assert from 'node:assert/strict';
await import(process.env.PWA_INDEXEDDB_MODULE || 'fake-indexeddb/auto');
import {openStore,listEvents,writeEvent,readSettings,saveSettings} from '../../public/pwa/storage.js';
test('IndexedDB add, edit, conflict, reopen and delete',async()=>{
 let db=await openStore();
 const event={id:'id-1',title:'深夜作業',start:'2027-01-01T16:00:00Z',end:'2027-01-01T19:00:00Z',note:'メモ',createdAt:'a',updatedAt:'a'};
 await writeEvent(db,event);assert.equal((await listEvents(db))[0].title,'深夜作業');
 const next={...event,title:'編集済み',updatedAt:'b'};await writeEvent(db,next,event);
 await assert.rejects(writeEvent(db,{...next,updatedAt:'c'},event),/ほかの画面/);
 db.close();db=await openStore();assert.equal((await listEvents(db))[0].title,'編集済み');
 await writeEvent(db,next,next,true);assert.deepEqual(await listEvents(db),[]);db.close();
});
test('settings persist, validate invalid fields, and expose storage failure',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 saveSettings({boundary:12,seconds:false,font:'serif',size:'large'},storage);
 assert.deepEqual(readSettings(storage),{boundary:12,seconds:false,font:'serif',size:'large'});
 saveSettings({boundary:99,font:'broken'},storage);assert.equal(readSettings(storage).boundary,5);
 assert.throws(()=>saveSettings({}, {setItem(){throw new Error('blocked');}}));
});
