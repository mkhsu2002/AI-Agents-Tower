import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {protocol,PREFIX} from '../agent-network/server/protocol.mjs';import {META_MODEL} from '../server/meta-policy.ts';
const caller=process.argv[2],peer=process.argv[3],out='artifacts/agent-peer';
if(![caller,peer].every(o=>{try{return new URL(o).origin===o&&new URL(o).protocol==='https:';}catch{return false;}})||caller===peer)throw Error('TWO_EXACT_HTTPS_ORIGINS_REQUIRED');
mkdirSync(out,{recursive:true});const p=protocol(caller,peer,META_MODEL),written=[];
for(const[url,body]of p.artifacts){if(new URL(url).origin!==peer)continue;const path=new URL(url).pathname;const file=out+path;mkdirSync(file.slice(0,file.lastIndexOf('/')),{recursive:true});writeFileSync(file,body);written.push(path);}
const m=JSON.parse(p.artifacts.get(peer+PREFIX+'/agents/agent-manifest.json'));m.networks=m.networks.map(n=>({...n,hocon:PREFIX+'/agents/'+n.hocon}));writeFileSync(out+'/agent-manifest.json',JSON.stringify(m,null,2)+'\n');written.push('/agent-manifest.json');
writeFileSync(out+'/links.json',JSON.stringify({version:1,networks:{workshop:{}}},null,2)+'\n');written.push('/links.json');
writeFileSync(out+'/index.html','<!doctype html><html lang="en"><meta charset="utf-8"><title>Tower Home Network</title><h1>A portable home-building network.</h1><p>This site publishes the Reception and Home builder definitions. Execution and model access remain in the caller browser and its authorized server.</p><p><a href="/agent-manifest.json">Agent manifest</a></p></html>\n');
writeFileSync(out+'/_headers',written.map(path=>path+'\n  Content-Type: application/json; charset=utf-8\n  Access-Control-Allow-Origin: *\n  Access-Control-Allow-Methods: GET, HEAD\n  X-Content-Type-Options: nosniff\n').join('\n'));
writeFileSync(out+'/package-manifest.json',JSON.stringify({caller,peer,exactNetwork:peer+PREFIX+'/agents/workshop',modelRequests:0,bindings:[],files:Object.fromEntries(written.map(path=>[path,createHash('sha256').update(readFileSync(out+path)).digest('hex')]))},null,2)+'\n');console.log('Static peer package ready at '+out+'. No deployment or model call.');
