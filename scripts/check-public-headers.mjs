// Validate this release's path-only Pages header rules without folding duplicate entries.
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {pathToFileURL} from 'node:url';

export function checkPublicHeaders(text,resources){
 const blocks=[],seen=new Set();let current;
 for(const [index,line] of text.split(/\r?\n/).entries()){
  if(!line.trim()||line.trimStart().startsWith('#'))continue;
  if(line.startsWith('/')){
   const selector=line.trim();
   if(seen.has(selector))throw Error('DUPLICATE_HEADER_PATH: '+selector);
   if(/[\s?:]/.test(selector))throw Error('UNSUPPORTED_HEADER_SELECTOR: '+selector);
   seen.add(selector);current={selector,headers:[]};blocks.push(current);
  }else{
   const header=line.match(/^\s+([^:\s]+):\s*(.*?)\s*$/);
   if(!current||!header)throw Error('INVALID_HEADER_LINE: '+(index+1));
   const name=header[1].toLowerCase(),value=header[2];
   if(name==='access-control-allow-origin'){
    if(current.headers.some(h=>h.name===name))throw Error('DUPLICATE_ALLOW_ORIGIN: '+current.selector);
    let valid=value==='*'||value==='null';
    try{valid ||= new URL(value).origin===value&&/^https?:\/\//.test(value);}catch{/* Fail closed below. */}
    if(!valid||value.includes(','))throw Error('INVALID_ALLOW_ORIGIN: '+current.selector);
   }
   current.headers.push({name,value});
  }
 }
 const matches=(selector,path)=>new RegExp('^'+selector.split('*').map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*')+'$').test(path);
 const declaredResources=[...new Set([...resources,...blocks.filter(b=>!b.selector.includes('*')).map(b=>b.selector)])];
 const effective=declaredResources.map(path=>{
  const headers=blocks.filter(b=>matches(b.selector,path)).flatMap(b=>b.headers);
  const origins=headers.filter(h=>h.name==='access-control-allow-origin');
  if(origins.length>1)throw Error('OVERLAPPING_ALLOW_ORIGIN: '+path);
  return {path,allowOriginCount:origins.length};
 });
 return {blocks,effective};
}

function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(resolve(dir,e.name)):[resolve(dir,e.name)]);}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const root=resolve(process.argv[2]||'public');
 const resources=files(root).map(p=>'/'+relative(root,p).replaceAll('\\','/'));
 const result=checkPublicHeaders(readFileSync(resolve(root,'_headers'),'utf8'),resources);
 console.log(JSON.stringify({headerBlocks:result.blocks.length,resourcesChecked:resources.length,duplicatePaths:0,multipleAllowOrigin:0,...(process.argv.includes('--details')?{rules:result.blocks,effective:result.effective}:{})}));
}
