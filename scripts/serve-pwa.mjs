import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root=resolve(import.meta.dirname,'../docs');
const base='/yofukashi-clock-25/';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  if(!url.pathname.startsWith(base)){res.writeHead(404);res.end();return;}
  let file=resolve(root,decodeURIComponent(url.pathname.slice(base.length)));
  if(file!==root&&!file.startsWith(root+'/'))throw new Error();
  if((await stat(file)).isDirectory()){
   if(!url.pathname.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search});res.end();return;}
   file=resolve(file,'index.html');
  }
  const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(4173,'127.0.0.1',()=>console.log('http://localhost:4173/yofukashi-clock-25/pwa/'));
