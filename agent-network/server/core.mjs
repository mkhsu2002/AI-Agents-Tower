// Fixed-network execution core. Provider injection is server-owned; no automatic fixture fallback.
import { PREFIX, INPUT, protocol, sha } from './protocol.mjs';
import { canonical } from '../client/canonical.mjs';
import { sendCheckedMeta, CandidateProviderError } from './meta-transport.ts';
import { META_MODEL } from '../../server/meta-policy.ts';
import { strictJson } from '../../spikes/m2/safety.js';
const SCHEMA=`CREATE TABLE IF NOT EXISTS tower_runtime_budget(day TEXT PRIMARY KEY,reserved INTEGER NOT NULL CHECK(reserved BETWEEN 0 AND 60));
CREATE TABLE IF NOT EXISTS candidate_offers(hash TEXT PRIMARY KEY,scope TEXT NOT NULL,entry TEXT NOT NULL,expires INTEGER NOT NULL,used INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS candidate_runs(hash TEXT PRIMARY KEY,offer TEXT NOT NULL UNIQUE,scope TEXT NOT NULL,origin TEXT NOT NULL,day TEXT NOT NULL,expires INTEGER NOT NULL,phase INTEGER NOT NULL DEFAULT 0 CHECK(phase BETWEEN 0 AND 3),state TEXT NOT NULL DEFAULT 'READY',epoch INTEGER NOT NULL DEFAULT 0,completions INTEGER NOT NULL DEFAULT 0,call_id TEXT,args TEXT,bundle TEXT,input_usage INTEGER NOT NULL DEFAULT 0,output_usage INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS candidate_metrics(name TEXT PRIMARY KEY,n INTEGER NOT NULL);
CREATE TRIGGER IF NOT EXISTS candidate_reserve BEFORE INSERT ON candidate_runs BEGIN INSERT OR IGNORE INTO tower_runtime_budget(day,reserved) VALUES(NEW.day,0); SELECT CASE WHEN (SELECT reserved FROM tower_runtime_budget WHERE day=NEW.day)>57 THEN RAISE(ABORT,'DAILY_LIMIT') END; UPDATE tower_runtime_budget SET reserved=reserved+3 WHERE day=NEW.day AND reserved<=57; UPDATE candidate_offers SET used=1 WHERE hash=NEW.offer AND used=0; SELECT CASE WHEN changes()!=1 THEN RAISE(ABORT,'CONSENT_SPENT') END; END;`;
const initialized=new WeakMap(),inflight=new Map();
const json=(status,value,headers={})=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const random=()=>[...crypto.getRandomValues(new Uint8Array(24))].map(n=>n.toString(16).padStart(2,'0')).join('');
const metric=(db,name)=>db.prepare('INSERT INTO candidate_metrics(name,n) VALUES(?,1) ON CONFLICT(name) DO UPDATE SET n=n+1').bind(name).run();
async function bodyOf(request,operation){const reader=request.body?.getReader();if(!reader)throw Error('BODY_REQUIRED');operation.reader=reader;const decoder=new TextDecoder('utf-8',{fatal:true});let text='',bytes=0;try{for(;;){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>12000)throw Error('BODY_LIMIT');text+=decoder.decode(part.value,{stream:true});}return strictJson(text+decoder.decode());}finally{void reader.cancel().catch(()=>{});}}
async function execute(request,env,operation,transport){
 const url=new URL(request.url);if(!url.pathname.startsWith(PREFIX+'/'))return json(404,{code:'OUTSIDE_CANDIDATE'});
 // Missing configuration never creates an authority, schema or public model entry.
 if(!['synthetic-only','provider-candidate'].includes(env.CANDIDATE_ENABLE)||!['caller','peer'].includes(env.CANDIDATE_ROLE)||!env.CALLER_ORIGIN||!env.PEER_ORIGIN)return json(503,{code:'CANDIDATE_DISABLED'});
 const origin=env.CALLER_ORIGIN,peer=env.PEER_ORIGIN;
 if([origin,peer].some(s=>{try{const u=new URL(s);return u.origin!==s||!['http:','https:'].includes(u.protocol)||u.username||u.password||(u.protocol==='http:'&&u.hostname!=='127.0.0.1');}catch{return true;}}))return json(503,{code:'CONFIGURATION_DENIED'});
 const providerMode=env.CANDIDATE_TRANSPORT==='meta-responses';
 if(env.CANDIDATE_TRANSPORT!==undefined&&!['fixture','meta-responses'].includes(env.CANDIDATE_TRANSPORT))return json(503,{code:'TRANSPORT_NOT_CONFIGURED'});
 if((providerMode&&env.CANDIDATE_ENABLE!=='provider-candidate')||(!providerMode&&env.CANDIDATE_ENABLE!=='synthetic-only'))return json(503,{code:'TRANSPORT_NOT_CONFIGURED'});
 const p=protocol(origin,peer,providerMode?META_MODEL:undefined),artifact=p.artifacts.get(request.url);
 if(env.CANDIDATE_ROLE==='peer'){if(request.method!=='GET'||request.headers.has('authorization')||request.headers.has('cookie'))return json(403,{code:'PEER_CREDENTIAL_DENIED'});return artifact?new Response(artifact,{headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':origin,'Cache-Control':'no-store'}}):json(404,{});}
 if(url.origin!==origin||!env.CANDIDATE_DB)return json(503,{code:'CONFIGURATION_DENIED'});
 if(request.method==='GET'&&artifact)return new Response(artifact,{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
 if(request.method==='GET'&&url.pathname===PREFIX+'/fixture-config.json'){const entry=url.searchParams.get('entry');return ['entry-a','entry-b'].includes(entry)?json(200,{input:INPUT,peer,executionLabel:providerMode?'Meta Responses protocol candidate; inference not independently verified':'Local scripted SSE only',authorization:{issuer:origin+PREFIX+'/authorize/'+entry,revoke:origin+PREFIX+'/revoke'}}):json(403,{});}
 const api=url.pathname.startsWith(PREFIX+'/authorize/')||[PREFIX+'/revoke',PREFIX+'/llm/v1/chat/completions'].includes(url.pathname);
 if(!api){if(request.method==='GET'&&env.ASSETS)return env.ASSETS.fetch(request);return json(404,{});}
 if(providerMode&&(typeof env.CANDIDATE_META_API_KEY!=='string'||!env.CANDIDATE_META_API_KEY.trim()||env.CANDIDATE_META_API_KEY.length>8192||/\s/.test(env.CANDIDATE_META_API_KEY)))return json(503,{code:'PROVIDER_NOT_CONFIGURED'});
 if(request.method!=='POST'||url.search||request.headers.get('Origin')!==origin||request.headers.has('cookie')||request.headers.get('Content-Type')!=='application/json')return json(403,{code:'ORIGIN_OR_FORMAT_DENIED'});
 const db=env.CANDIDATE_DB;let setup=initialized.get(db);if(!setup){setup=db.exec(SCHEMA);initialized.set(db,setup);setup.catch(()=>initialized.delete(db));}try{await setup;operation.assert();}catch{return json(503,{code:'STORE_UNAVAILABLE'});}
 try{
  const body=await bodyOf(request,operation);operation.assert();const now=Date.now(),scopeHash=await sha(canonical(await p.scope()));
  if(url.pathname.startsWith(PREFIX+'/authorize/')){
   const entry=url.pathname.split('/').at(-1);if(!['entry-a','entry-b'].includes(entry)||request.headers.has('authorization')||canonical(body.scope)!==canonical(await p.scope())||body.acknowledgement!==scopeHash)return json(403,{code:'SCOPE_DENIED'});
   const keys=Object.keys(body).sort().join(',');
   if(keys==='acknowledgement,scope'){const challenge=random();await db.prepare('INSERT INTO candidate_offers(hash,scope,entry,expires) VALUES(?,?,?,?)').bind(await sha(challenge),scopeHash,entry,now+30000).run();return json(200,{challenge});}
   if(keys!=='acknowledgement,challenge,consent,scope'||body.consent!==true||typeof body.challenge!=='string'||!/^[a-f0-9]{48}$/.test(body.challenge))return json(403,{code:'CONSENT_DENIED'});
   const token=random(),id=await sha(token),challenge=await sha(body.challenge),day=new Date(now).toISOString().slice(0,10);
   // ONE INSERT is the transaction boundary: reservation and consent consumption occur in its trigger.
   try{const issued=await db.prepare("INSERT INTO candidate_runs(hash,offer,scope,origin,day,expires) SELECT ?,hash,scope,?,?,? FROM candidate_offers WHERE hash=? AND scope=? AND entry=? AND used=0 AND expires>? RETURNING hash").bind(id,origin,day,now+30000,challenge,scopeHash,entry,now).first();if(issued?.hash!==id)return json(403,{code:'CONSENT_SPENT_OR_EXPIRED'});}catch(e){if(String(e.message).includes('DAILY_LIMIT'))return json(429,{code:'DAILY_LIMIT'});return json(503,{code:'ADMISSION_FAILED'});}
   return json(200,{token_type:'Bearer',access_token:token,expires_in:30});
  }
  const bearer=request.headers.get('Authorization')||'';if(!/^Bearer [a-f0-9]{48}$/.test(bearer))return json(401,{code:'AUTHORIZATION_REQUIRED'});const id=await sha(bearer.slice(7));operation.target={db,id,scopeHash,origin};operation.assert();
  if(url.pathname===PREFIX+'/revoke'){if(canonical(body)!=='{}')return json(400,{});await db.prepare("UPDATE candidate_runs SET state='REVOKED',epoch=epoch+1,call_id=NULL,args=NULL,bundle=NULL WHERE hash=? AND scope=? AND origin=? AND state IN ('READY','RUNNING')").bind(id,scopeHash,origin).run();inflight.get(id)?.abort();await metric(db,'revocations');return json(200,{revoked:true});}
  await metric(db,'modelHttp');if(canonical(body).includes('PRIVATE-CANARY'))return json(403,{code:'PRIVATE_DATA_DENIED'});
  const run=await db.prepare('SELECT phase,state,epoch,expires,call_id,args,bundle FROM candidate_runs WHERE hash=? AND scope=? AND origin=?').bind(id,scopeHash,origin).first();if(!run||run.state!=='READY'||run.expires<=now||run.phase>2)return json(409,{code:'RUN_STOPPED'});
  const phase=Number(run.phase);if(providerMode&&phase>0&&(typeof run.call_id!=='string'||!/[\w-]{1,100}/.test(run.call_id)||typeof run.args!=='string'||(phase===2&&typeof run.bundle!=='string')))return json(409,{code:'PROVIDER_STATE_MISSING'});let invocation='cruse-2';if(phase===2){try{invocation=strictJson(body.messages?.[3]?.content).source?.invocation;}catch{return json(403,{code:'CHILD_PROTOCOL_INVALID'});}if(typeof invocation!=='string'||!/^cruse-[1-9][0-9]{0,8}$/.test(invocation))return json(403,{code:'CHILD_PROTOCOL_INVALID'});}
  if(canonical(body)!==canonical(p.expected(phase,invocation,{callId:run.call_id,args:run.args,bundle:run.bundle})))return json(403,{code:'FIXED_TRANSCRIPT_REQUIRED'});
  operation.assert();const claim=await db.prepare("UPDATE candidate_runs SET state='RUNNING',phase=phase+1 WHERE hash=? AND scope=? AND origin=? AND state='READY' AND phase=? AND expires>? RETURNING epoch").bind(id,scopeHash,origin,phase,now).first();if(!claim)return json(409,{code:'CLAIM_DENIED'});
  let checked;
  if(providerMode){
   inflight.set(id,operation.controller);
   try{await metric(db,'providerDispatches');checked=await sendCheckedMeta({phase,origin,prior:{callId:run.call_id,args:run.args,bundle:run.bundle},key:env.CANDIDATE_META_API_KEY,signal:operation.controller.signal,transport});}
   catch(error){await db.prepare("UPDATE candidate_runs SET state='ERROR',epoch=epoch+1,call_id=NULL,args=NULL,bundle=NULL WHERE hash=? AND state='RUNNING' AND phase=? AND epoch=?").bind(id,phase+1,claim.epoch).run();return json(error instanceof CandidateProviderError?error.status:502,{code:error instanceof CandidateProviderError?error.code:'PROVIDER_FAILED'});}
   finally{inflight.delete(id);}
  }
  if(env.CANDIDATE_HOLD_FIRST_MS&&phase===0)await new Promise(resolve=>setTimeout(resolve,Math.min(Number(env.CANDIDATE_HOLD_FIRST_MS),1500)));
  operation.assert();const done=await db.prepare("UPDATE candidate_runs SET state=?,completions=completions+1,call_id=?,args=?,bundle=?,input_usage=input_usage+?,output_usage=output_usage+? WHERE hash=? AND scope=? AND origin=? AND state='RUNNING' AND phase=? AND epoch=? AND expires>? RETURNING phase").bind(phase===2?'COMPLETED':'READY',phase===2?null:(checked?.stored.callId||run.call_id),phase===2?null:(checked?.stored.args||run.args),phase===2?null:(checked?.stored.bundle||run.bundle),checked?.usage.input||0,checked?.usage.output||0,id,scopeHash,origin,phase+1,claim.epoch,Date.now()).first();if(!done){await metric(db,'lateRejected');return json(409,{code:'LATE_RESULT_DENIED'});}
  const frames=[],emit=(delta,finish=null)=>frames.push('data: '+JSON.stringify({model:p.model,choices:[{index:0,delta,finish_reason:finish}]})+'\n\n');if(phase===0)emit({tool_calls:[{index:0,...(providerMode?checked.handoff:p.handoff)}]},'tool_calls');else{const text=providerMode?checked.content:(phase===1?p.bundle:p.result);for(let i=0;i<text.length;i+=37)emit({content:text.slice(i,i+37)});emit({},'stop');}frames.push('data: [DONE]\n\n');return new Response(frames.join(''),{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-store','X-Nsdeploy-LLM-Route':providerMode?'meta-responses':'mock'}});
 }catch{return json(400,{code:'CANDIDATE_REQUEST_FAILED'});}
}
export function createNetworkCore(transport=fetch){return {async fetch(request,env,context){
 const operation={controller:new AbortController(),stopped:false,reader:null,target:null,assert(){if(this.stopped)throw Error('REQUEST_DEADLINE');}};
 let timer;
 const deadline=new Promise(resolve=>{timer=setTimeout(()=>{
  operation.stopped=true;operation.controller.abort();void operation.reader?.cancel().catch(()=>{});
  const target=operation.target;
  if(target){const cleanup=target.db.prepare("UPDATE candidate_runs SET state='TIMED_OUT',epoch=epoch+1,call_id=NULL,args=NULL,bundle=NULL WHERE hash=? AND scope=? AND origin=? AND state IN ('READY','RUNNING')").bind(target.id,target.scopeHash,target.origin).run().catch(()=>{});context?.waitUntil(cleanup);}
  resolve(json(504,{code:'REQUEST_DEADLINE'}));
 },10000);});
 try{return await Promise.race([execute(request,env,operation,transport),deadline]);}finally{clearTimeout(timer);}
}};}
export default createNetworkCore();
