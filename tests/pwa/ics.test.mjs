import test from 'node:test';
import assert from 'node:assert/strict';
import { makeICS, escapeText, foldLine, exportICS } from '../../public/pwa/ics.js';
import { validateRange } from '../../public/pwa/datetime.js';
const { start,end }=validateRange('2027-01-01','25:00','2027-01-01','28:00');
const event={id:'test-123',title:'深夜作業,確認;\\準備',note:'日本語\n次の行\r\nさらに続く',start:start.toISOString(),end:end.toISOString()};
test('required fields, normal UTC timestamps, Japanese and escaping',()=>{
 const ics=makeICS([event],new Date('2026-09-16T00:00:00Z'));
 for(const term of ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:test-123@','DTSTAMP:20260916T000000Z','SUMMARY:深夜作業\\,確認\\;\\\\準備','DESCRIPTION:日本語\\n次の行\\nさらに続く','END:VEVENT','END:VCALENDAR']) assert(ics.includes(term),term);
 const utc = d=>d.toISOString().replace(/[-:]/g,'').replace('.000Z','');
 assert(ics.includes(`DTSTART:${utc(start)}Z`)); assert(ics.includes(`DTEND:${utc(end)}Z`));
 if(process.env.TZ==='Asia/Tokyo'){assert(ics.includes('DTSTART:20270101T160000Z'));assert(ics.includes('DTEND:20270101T190000Z'));}
 assert.doesNotMatch(ics,/VALUE=DATE\b/); assert.doesNotMatch(ics.replaceAll('\r\n',''),/[\r\n]/);
});
test('75 octet folding retains complete UTF-8 and unfolds exactly',()=>{
 const text='SUMMARY:'+ '日本語😀,;\\'.repeat(100), folded=foldLine(text);
 assert.equal(folded.replaceAll('\r\n ',''),text);
 for(const line of folded.split('\r\n')) assert(Buffer.byteLength(line)<=75);
 assert.equal(new TextDecoder('utf-8',{fatal:true}).decode(new TextEncoder().encode(folded)),folded);
});
test('escaped newlines cannot inject calendar properties',()=>{
 assert.equal(escapeText('x\r\nEND:VEVENT\ny'), 'x\\nEND:VEVENT\\ny');
 assert.throws(()=>makeICS([{...event,id:'bad\r\n'}]));
 assert.throws(()=>makeICS([{...event,end:event.start}]));
});
test('all-event backup and stable unique UID',()=>{
 const output=makeICS([event,{...event,id:'second'}]); assert.equal((output.match(/BEGIN:VEVENT/g)||[]).length,2);
 assert.match(output,/UID:second@/);
});
test('sharing unsupported, failure, success, and cancellation',async()=>{
 const originalNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 let downloads=0;
 const oldDocument=globalThis.document, oldTimeout=globalThis.setTimeout;
 globalThis.document={body:{append(){}},createElement:()=>({click(){downloads++;},remove(){}})};
 globalThis.setTimeout=(fn)=>{fn();return 0;};
 try {
  Object.defineProperty(globalThis,'navigator',{value:{},configurable:true}); assert.match(await exportICS([event]),/共有を利用できない/); assert.equal(downloads,1);
  Object.defineProperty(globalThis,'navigator',{value:{canShare:()=>true,share:async()=>{throw new Error('failed');}},configurable:true}); assert.match(await exportICS([event]),/切り替え/); assert.equal(downloads,2);
  navigator.share=async()=>{}; assert.match(await exportICS([event]),/共有画面/); assert.equal(downloads,2);
  navigator.share=async()=>{throw Object.assign(new Error(),{name:'AbortError'});}; assert.match(await exportICS([event]),/キャンセル/); assert.equal(downloads,2);
 }finally{Object.defineProperty(globalThis,'navigator',originalNavigator);globalThis.document=oldDocument;globalThis.setTimeout=oldTimeout;}
});
