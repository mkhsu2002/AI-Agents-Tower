// Fixed local proof for executing the exact two-role peer network; no production route or credential.
import {canonical} from '../client/canonical.mjs';
import {parseAgentResponse} from '../../spikes/m2/vendor/runtime/cruse.js';
export {canonical};
export const PREFIX='/api/agent-network';
export const INPUT='Create a reading room for Atlas, a fictional research agent.';
const RECEPTION='Reception: delegate the fixed reading-room request to home_builder, then return its exact draft and read-only validation proposal.';
const BUILDER='Builder: return the fixed fictional reading room JSON and read-only validation proposal.';
export const sha=async text=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))].map(n=>n.toString(16).padStart(2,'0')).join('');
const parameters={type:'object',properties:{request:{type:'string'}},required:['request'],additionalProperties:false};
const agent=(name,instructions,tools)=>({name,instructions,tools,function:{description:name,parameters}});
export function protocol(origin,peer,providerModel){
 const model=providerModel||'published-synthetic-model',base=origin+PREFIX,other=peer+PREFIX,executionNetworkUrl=other+'/agents/workshop';
 const manifest=(name,front,router,peers)=>({networks:[{name,front_man:front,hocon:name+'.network.json'}],llm_router:{base_url:router,mock:false},allowed_peers:peers,deployment:{mode:'static'},metadata:{warning:'Caller-owned inference. Fixed fictional HomeBundle collaboration; peer publishes data only.'}});
 const network=(tools,selectedModel)=>({metadata:{description:'Fixed fictional Atlas example'},max_steps:3,llm_config:{model_name:selectedModel},tools});
 const artifacts=new Map([
  [base+'/agents/agent-manifest.json',JSON.stringify(manifest('caller','reception',base+'/llm/v1',[peer]))],
  [base+'/agents/caller.network.json',JSON.stringify(network([agent('reception','Caller policy entry: select the exact approved workshop network.',[executionNetworkUrl])],model))],
  [other+'/agents/agent-manifest.json',JSON.stringify(manifest('workshop','reception',other+'/llm/v1',[]))],
  [other+'/agents/workshop.network.json',JSON.stringify(network([agent('reception',RECEPTION,['home_builder']),agent('home_builder',BUILDER,[])],model))]
 ]);
 const bundle=JSON.stringify({schemaVersion:'0.1',displayName:'Atlas Worker-native draft',introduction:INPUT,blocks:[{type:'text',title:'Reading room',text:'Fixed fictional reading notes.'}]});
 const result=bundle+'\n```cruse-ui\n'+JSON.stringify({version:1,components:[{kind:'action',id:'validate',action:base+'/agents/caller#validate_home_bundle',label:'Validate draft',arguments:{bundleJson:bundle}}]})+'\n```';
 const handoff={id:'synthetic-handoff',type:'function',function:{name:'home_builder',arguments:JSON.stringify({request:INPUT})}};
 const tools=[{type:'function',function:{name:'home_builder',description:'home_builder',parameters}}];
 const expected=(phase,invocation='cruse-2',prior={})=>({model,messages:phase===1?[{role:'system',content:BUILDER},{role:'user',content:INPUT}]:[{role:'system',content:RECEPTION},{role:'user',content:INPUT},...(phase===2?[{role:'assistant',content:null,tool_calls:[prior.callId?{id:prior.callId,type:'function',function:{name:'home_builder',arguments:prior.args}}:handoff]},{role:'tool',tool_call_id:prior.callId||handoff.id,name:'home_builder',content:JSON.stringify(parseAgentResponse(prior.bundle||bundle,{origin:new URL(peer).host,network:'workshop',agent:'home_builder',invocation}))}]:[])],stream:true,...(phase===1?{}:{tools,tool_choice:'auto'})});
 const scope=async()=>({executionNetworkUrl,callerOrigin:origin,router:base+'/llm/v1',model,inputHash:await sha(INPUT),artifacts:await Promise.all([...artifacts].sort(([a],[b])=>a.localeCompare(b)).map(async([url,text])=>({url,hash:await sha(text)}))),operations:[{name:'validate_home_bundle',effect:'read'}],maxCalls:3});
 return {artifacts,model,bundle,result,handoff,expected,scope,canonical};
}
