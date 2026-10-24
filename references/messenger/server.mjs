import http from 'node:http';
import https from 'node:https';
import {readFile, writeFile, mkdir, stat, appendFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const capture = process.argv.includes('--capture');
const port = Number(process.env.PORT || 4173);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.ogg':'audio/ogg','.wasm':'application/wasm','.svg':'image/svg+xml','.woff2':'font/woff2'};
const pending = new Map();
function download(url) {
  return new Promise((resolve,reject)=>{
    const request=https.get(url,response=>{
      if(response.statusCode!==200){response.resume();reject(new Error(`Upstream ${response.statusCode}: ${url}`));return;}
      const chunks=[];response.on('data',c=>chunks.push(c));response.on('end',()=>resolve(Buffer.concat(chunks)));response.on('error',reject);
    });
    request.setTimeout(60000,()=>request.destroy(new Error('Download timed out')));request.on('error',reject);
  });
}
async function acquire(pathname, filename) {
  if(!pending.has(filename)) pending.set(filename,(async()=>{
    let data=await download(`https://messenger.abeto.co${pathname}`);
    if(/\.(js|css|html)$/.test(pathname)) data=Buffer.from(data.toString().replaceAll('https://messenger.abeto.co/assets/','/assets/'));
    await mkdir(path.dirname(filename),{recursive:true});await writeFile(filename,data);
    await appendFile(new URL('./capture.log',import.meta.url),`${pathname}\t${data.length}\n`);
    console.log('Saved',pathname,data.length);
  })().finally(()=>pending.delete(filename)));
  return pending.get(filename);
}
http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/{2,}/g,'/');
    const filename=path.resolve(root, '.'+(pathname==='/'?'/index.html':pathname));
    if(!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    try{await stat(filename);}catch{
      if(capture&&pathname.startsWith('/assets/')) await acquire(pathname,filename);
      else {console.error('Missing',pathname);res.writeHead(404).end('Local file missing');return;}
    }
    const data=await readFile(filename);
    res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-cache','Content-Security-Policy':"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; connect-src 'self' data: blob:; worker-src 'self' blob:; img-src 'self' data: blob:; media-src 'self' blob:;"});
    res.end(req.method==='HEAD'?undefined:data);
  }catch(error){console.error(error.message);res.writeHead(502).end(error.message);}
}).listen(port,'127.0.0.1',()=>console.log(`Messenger: http://127.0.0.1:${port} (${capture?'asset acquisition':'offline'})`));
