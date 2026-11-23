// Local intercepted upstream only. No actual service credential or network operation.
import {META_ENDPOINT,META_MODEL} from '../../server/meta-policy.ts';
import {INPUT} from '../../agent-network/server/protocol.mjs';
export const TEST_PLACEHOLDER='synthetic-offline-placeholder-not-a-service-key';
export function fakeMeta(origin,scenario='success'){
 const counts={calls:0,returned:0,redirectTargets:0,fixedEndpoint:true,fixedModel:true,credentialScoped:true,maxTokens:[],phases:[],cancelledBodies:0};
 const bundle=JSON.stringify({schemaVersion:'0.1',displayName:'Atlas from upstream protocol',introduction:INPUT,blocks:[{type:'text',title:'Upstream reading room',text:'Fictional fixture data, not model inference.'}]});
 const send=async request=>{
  counts.calls++;counts.fixedEndpoint&&=request.url===META_ENDPOINT;counts.credentialScoped&&=request.headers.get('Authorization')==='Bearer '+TEST_PLACEHOLDER;
  if(request.url!==META_ENDPOINT){counts.redirectTargets++;throw Error('UNAPPROVED_OUTBOUND');}
  const body=await request.json();counts.fixedModel&&=body.model===META_MODEL;counts.maxTokens.push(body.max_output_tokens);
  const phase=body.tools?.length?0:body.instructions.startsWith('You are Home builder')?1:2;counts.phases.push(phase);
  if(Object.keys(body).some(k=>!['model','store','max_output_tokens','reasoning','instructions','input','tools','tool_choice','parallel_tool_calls'].includes(k))||body.model!==META_MODEL||body.store!==false||body.tool_choice!=='auto'||(phase===0&&body.parallel_tool_calls!==false)||body.input!==(phase===2?bundle:INPUT))throw Error('FIXED_OUTBOUND_CONTRACT_FAILED');
  if(scenario==='cancel')await new Promise(resolve=>setTimeout(resolve,1500));
  counts.returned++;
  if(scenario==='reject'||scenario==='quota')return new Response('PRIVATE-UPSTREAM-DETAILS',{status:scenario==='quota'?429:400});
  if(scenario==='redirect')return new Response(null,{status:302,headers:{Location:'https://unapproved.invalid'}});
  if(scenario==='malformed')return new Response('{oops',{headers:{'Content-Type':'application/json'}});
  if(scenario==='wrong-type')return new Response('<html>private</html>',{headers:{'Content-Type':'text/html'}});
  if(scenario==='oversized')return new Response('X'.repeat(32769),{headers:{'Content-Type':'application/json'}});
  if(scenario==='timeout')return new Response(new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('{'));},cancel(){counts.cancelledBodies++;}}),{headers:{'Content-Type':'application/json'}});
  const output=scenario==='refusal'?[{type:'message',role:'assistant',content:[{type:'refusal',refusal:'Synthetic refusal, not real provider output.'}]}]:phase===0?[{type:'reasoning',summary:[]},{type:'message',role:'assistant',status:'completed',content:[{type:'output_text',text:'INERT-FIXTURE-NARRATION-NEVER-FORWARDED'}]},{type:'function_call',name:body.tools[0].name,call_id:'upstream-protocol-call-97',arguments:JSON.stringify({request:INPUT})}]:[{type:'message',role:'assistant',content:[{type:'output_text',text:scenario==='wrong-action'&&phase===2?'UNAPPROVED OUTPUT':bundle}]}];
  return Response.json({model:META_MODEL,status:'completed',output,usage:{input_tokens:scenario==='bad-usage'?8193:120,output_tokens:150}});
 };
 return {counts,send};
}
