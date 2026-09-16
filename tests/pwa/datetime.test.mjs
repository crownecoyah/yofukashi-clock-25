import test from 'node:test';
import assert from 'node:assert/strict';
import { toActual, toLogical, shiftDate, dateLabel, validateRange } from '../../public/pwa/datetime.js';
const local = d => `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
for (const [date,time,expected] of [
 ['2027-01-01','25:00','2027/01/02 01:00'],['2027-01-01','28:00','2027/01/02 04:00'],
 ['2027-01-31','25:00','2027/02/01 01:00'],['2027-12-31','25:00','2028/01/01 01:00'],
 ['2028-02-28','25:00','2028/02/29 01:00'],['2028-02-29','25:00','2028/03/01 01:00']]) {
 test(`${date} ${time} → ${expected}`, () => assert.equal(local(toActual(date,time)), expected));
}
test('normal, extended time, just before and at boundary, and weekday', () => {
 for(const [time,date,hour] of [['01:25','2027-07-07',25],['04:59','2027-07-07',28],['05:00','2027-07-08',5],['12:00','2027-07-08',12]]) {
  const result=toLogical(toActual('2027-07-08',time),5); assert.equal(result.date,date); assert.equal(result.hour,hour);
 }
 assert.equal(dateLabel('2027-07-07'),'2027年7月7日（水）');
});
test('boundary 0 and 12; changing it does not change saved instant', () => {
 const actual=toActual('2027-01-01','25:00').toISOString();
 assert.equal(toLogical(actual,0).date,'2027-01-02'); assert.equal(toLogical(actual,5).date,'2027-01-01');
 assert.equal(toLogical(toActual('2027-01-02','11:59'),12).time,'35:59');
 assert.equal(toLogical(toActual('2027-01-02','12:00'),12).time,'12:00');
 assert.throws(()=>toLogical(actual,13));
});
test('invalid dates, times and ranges are rejected rather than normalized', () => {
 for(const [d,t] of [['2027-02-29','25:00'],['2028-02-30','00:00'],['2027-13-01','25:00'],['2027-01-01','36:00'],['2027-01-01','25:60'],['2027-01-01','-1:00'],['2027-01-01','1:2'],['2027-01-01','NaN']]) assert.throws(()=>toActual(d,t));
 assert.throws(()=>validateRange('2027-01-01','25:00','2027-01-01','25:00'));
 assert.throws(()=>validateRange('2027-01-01','25:00','2027-01-01','01:00'));
 assert.equal(validateRange('2027-01-01','23:00','2027-01-01','28:00').end.getHours(),4);
 assert.equal(validateRange('2027-01-01','23:00','2027-01-02','04:00').end.getHours(),4);
});
test('calendar day arithmetic roundtrips across month/year/leap dates', () => {
 for(const date of ['2027-01-01','2027-01-31','2027-12-31','2028-02-29']) for(const boundary of [0,5,12]) for(const time of ['00:00','04:59','05:00','11:59','12:00','23:59']) {
  const d=toActual(date,time), logical=toLogical(d,boundary); assert.equal(+toActual(logical.date,logical.time),+d);
 }
 assert.equal(shiftDate('2028-03-01',-1),'2028-02-29');
});
if(process.env.TZ==='America/New_York') {
 test('DST gap rejects nonexistent extended time',()=>assert.throws(()=>toActual('2027-03-13','26:30'),/存在しません/));
 test('DST calendar increment preserves wall time',()=>assert.equal(local(toActual('2027-03-13','28:00')),'2027/03/14 04:00'));
 test('fall-back permits earlier/later and preserves distinct actual instants',()=>{
  const early=toActual('2027-11-06','25:30','earlier'), late=toActual('2027-11-06','25:30','later');
  assert.equal(late-early,3600000); assert.equal(early.toISOString(),'2027-11-07T05:30:00.000Z'); assert.equal(late.toISOString(),'2027-11-07T06:30:00.000Z');
 });
}
if(process.env.TZ==='Australia/Lord_Howe') {
 test('half-hour DST transitions are supported',()=>{
  assert.throws(()=>toActual('2027-10-02','26:15'),/存在しません/);
  assert.equal(toActual('2027-04-03','25:45','later')-toActual('2027-04-03','25:45','earlier'),1800000);
 });
}
