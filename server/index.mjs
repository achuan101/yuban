import { createServer } from 'node:http'
import { readFile,stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve,extname,sep } from 'node:path'
import { handleApi } from './api.mjs'
try{process.loadEnvFile(resolve(fileURLToPath(new URL('..',import.meta.url)),'.env'))}catch{}
const root=fileURLToPath(new URL('../dist/',import.meta.url)),types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'}
const server=createServer(async(req,res)=>{
 try{
  if(req.url.startsWith('/api/')){
   const buffers=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>64000){res.writeHead(413,{'content-type':'application/json'});res.end(JSON.stringify({error:'请求内容过大'}));return}buffers.push(chunk)}
   const request=new Request(`http://${req.headers.host}${req.url}`,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(buffers)})}),response=await handleApi(request,process.env)
   res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,`.${path}`)
  if(file!==resolve(root)&&!file.startsWith(resolve(root)+sep)){res.writeHead(403);res.end();return}
  let target=file;try{if(!(await stat(target)).isFile())target=resolve(root,'index.html')}catch{if(extname(path)){res.writeHead(404);res.end();return}target=resolve(root,'index.html')}
  res.writeHead(200,{'content-type':types[extname(target)]||'application/octet-stream','x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin'});res.end(req.method==='HEAD'?undefined:await readFile(target))
 }catch{res.writeHead(500,{'content-type':'application/json'});res.end(JSON.stringify({error:'服务请求失败'}))}
})
server.listen(Number(process.env.PORT)||8788,'127.0.0.1',()=>console.log(`语伴 × Alex: http://127.0.0.1:${Number(process.env.PORT)||8788}`))
