import {createNetworkCore} from './core.mjs';
import {protocol,PREFIX,INPUT} from './protocol.mjs';
import {liveConfigured} from '../../server/live-reviewer.ts';
import {META_MODEL} from '../../server/meta-policy.ts';
const json=(status,data,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
export function createNetworkHandler({transport=fetch,fixtureLabel=false}={}){
 const core=createNetworkCore(transport);
 return async function handle(request,env={},context){
  const url=new URL(request.url),origin=url.origin;
  let peer;try{const p=new URL(env.TOWER_AGENT_PEER_ORIGIN);if(p.origin!==env.TOWER_AGENT_PEER_ORIGIN||p.origin===origin||['https://1st-tower.neobabylon.app','https://ai-agents-tower.pages.dev'].includes(p.origin)||p.username||p.password||(!['https:'].includes(p.protocol)&&!(p.protocol==='http:'&&p.hostname==='127.0.0.1')))throw Error();peer=p.origin;}catch{return json(503,{enabled:false,code:'PEER_NOT_CONFIGURED'});}
  const configured=env.TOWER_AGENT_NETWORK_ENABLE==='enabled'&&liveConfigured(env);
  if(request.method==='GET'&&url.pathname===PREFIX+'/config'){
   const entry=url.searchParams.get('entry');if(!['entry-a','entry-b'].includes(entry)||[...url.searchParams.keys()].some(k=>k!=='entry'))return json(400,{code:'CONFIGURATION_DENIED'});
   return json(200,{enabled:configured,code:configured?'NETWORK_CONFIGURED':'NETWORK_DISABLED',input:INPUT,peer,connectionVerified:false,executionLabel:fixtureLabel?'Local synthetic fixture; no real inference':'Configured Meta model route; no automatic fallback',authorization:{issuer:origin+PREFIX+'/authorize/'+entry,revoke:origin+PREFIX+'/revoke'}});
  }
  // Public discovery is data only. It does not grant model authority or contact the peer.
  if(request.method==='GET'&&!url.search&&!request.headers.has('Authorization')&&!request.headers.has('Cookie')){
   const p=protocol(origin,peer,META_MODEL),artifact=p.artifacts.get(request.url);
   if(artifact)return new Response(artifact,{headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff'}});
   if(url.pathname===PREFIX+'/links.json')return json(200,{version:1,networks:{caller:{}}},{'Access-Control-Allow-Origin':'*'});
  }
  if(!configured)return json(503,{enabled:false,code:'NETWORK_DISABLED'});
  // Same in-place server bindings as the existing demo; no private Worker migration or key copy.
  return core.fetch(request,{CANDIDATE_ENABLE:'provider-candidate',CANDIDATE_TRANSPORT:'meta-responses',CANDIDATE_ROLE:'caller',CALLER_ORIGIN:origin,PEER_ORIGIN:peer,CANDIDATE_DB:env.TOWER_RUNTIME,CANDIDATE_META_API_KEY:env.META_API_KEY},context);
 };
}
export const handleNetworkRequest=createNetworkHandler();
