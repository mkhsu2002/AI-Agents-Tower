import './agent-guide.css';
import {parseBundle,exportBundle} from './domain/homebundle.ts';
import example from '../public/examples/welcome.homebundle.json';
const input=document.querySelector<HTMLTextAreaElement>('#bundle-input')!;
const status=document.querySelector<HTMLElement>('#check-status')!;
const receipt=document.querySelector<HTMLElement>('#validation-receipt')!;
const download=document.querySelector<HTMLButtonElement>('#download-bundle')!;
let canonical:string|undefined,validatedInput:string|undefined,epoch=0;
function invalidate(){epoch++;canonical=undefined;validatedInput=undefined;download.disabled=true;receipt.textContent='';status.textContent='Ready to validate. Nothing has been imported or saved.';}
input.addEventListener('input',invalidate);
document.querySelector<HTMLButtonElement>('#example')!.addEventListener('click',()=>{input.value=JSON.stringify(example,null,2)+'\n';invalidate();});
document.querySelector<HTMLButtonElement>('#check')!.addEventListener('click',()=>{void check();});
async function check(){
 invalidate();const generation=epoch,text=input.value;const parsed=parseBundle(text);
 if(!parsed.ok){status.textContent='Validation failed. '+parsed.errors.map(e=>`${e.code} ${e.path}: ${e.message}`).join(' ');return;}
 const serialized=exportBundle(parsed.value);if(!serialized.ok){status.textContent='Validation failed. '+serialized.errors.map(e=>e.message).join(' ');return;}
 try{const bytes=new TextEncoder().encode(serialized.value),digest=await crypto.subtle.digest('SHA-256',bytes);if(epoch!==generation||input.value!==text)return;
  canonical=serialized.value;validatedInput=text;receipt.textContent=JSON.stringify({operation:'homebundle.validate',schemaVersion:'0.1',status:'schema_valid',canonicalUtf8Bytes:bytes.byteLength,canonicalSHA256:[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join(''),authority:'local-validation-only'},null,2);status.textContent='Schema validated. Review the content, then download the JSON for Studio.';download.disabled=false;
 }catch{if(epoch===generation)status.textContent='Validation receipt could not be completed. Download remains disabled. Try again in a secure browser context.';}
}
download.addEventListener('click',()=>{if(!canonical)return;if(input.value!==validatedInput){invalidate();status.textContent='JSON changed. Validate it again before downloading.';return;}const url=URL.createObjectURL(new Blob([canonical],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='agent-home.homebundle.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),0);});
document.querySelector<HTMLButtonElement>('#check')!.disabled=false;document.querySelector<HTMLButtonElement>('#example')!.disabled=false;invalidate();
