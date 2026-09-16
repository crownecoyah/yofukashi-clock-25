import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
const tests=readdirSync(new URL('../tests/pwa/',import.meta.url)).filter(x=>x.endsWith('.test.mjs')).map(x=>`tests/pwa/${x}`);
for(const zone of ['Asia/Tokyo','America/New_York','Australia/Lord_Howe']){
 console.log(`\nTime zone: ${zone}`);
 const result=spawnSync(process.execPath,['--test',...tests],{cwd:new URL('../',import.meta.url),env:{...process.env,TZ:zone},stdio:'inherit'});
 if(result.status!==0)process.exit(result.status||1);
}
