// Local candidate only: program validation owns import/export; file contents are never executable.
import {parseBundle,exportBundle,MAX_BYTES} from '../../src/domain/homebundle.ts';
const element=id=>document.getElementById(id);
const section=document.createElement('section');
section.className='panel file-panel';section.id='files';
section.innerHTML='<p class="eyebrow">03 · TAKE IT WITH YOU</p><h2>Keep your home. Bring it back.</h2><p class="muted">Download the current draft, or review a file before replacing it.</p><button id="save-home" disabled>Download HomeBundle</button><label>HomeBundle file <input id="home-file" type="file" accept=".json,application/json"></label><button id="apply-file" disabled>Replace draft with reviewed file</button><button id="discard-file">Discard selected file</button><p id="file-status" role="status">Select a file to review. Your current draft is unchanged.</p><pre id="file-review"></pre>';
element('file-slot').append(section);
let pending,revision=0;
const show=(id,text)=>{element(id).textContent=text;};
function refreshExport(){
 const parsed=parseBundle(element('draft').textContent);element('save-home').disabled=!parsed.ok;
 if(!parsed.ok)return;
 const preview=element('home-preview');preview.replaceChildren();
 const add=(tag,value)=>{const node=document.createElement(tag);node.textContent=value;preview.append(node);};
 add('h2',parsed.value.displayName);add('p',parsed.value.introduction);
 for(const block of parsed.value.blocks){add('h3',block.title);add('p',block.text);}
}
function showScope(){try{const scope=JSON.parse(element('scope').textContent);element('caller-origin').textContent=new URL(scope.rootDeclaration.rootUrl).origin;element('peer-origin').textContent=new URL(scope.peer).origin;element('peer-network').textContent=new URL(scope.peer).pathname.split('/').at(-1);element('selected-model').textContent=scope.defaults.model;}catch{/* Real scope is still loading. */}}
function showOutcome(){
 const value=element('out').textContent;show('human-status',value.startsWith('{')?'Validation receipt received. Review the proposal before you apply it.':value);
 element('receipt-card').hidden=true;
 try{const result=JSON.parse(value);if(result.receipt?.status==='succeeded'&&result.receipt.result?.valid===true){element('receipt-card').hidden=false;show('executed-agents',(result.roleCalls||[]).map(role=>role.agent).join(' / ')+' · '+result.calls+' model calls');show('receipt-id',result.receipt.requestId||'See the program receipt in execution details.');}}catch{/* The real status is not a receipt. */}
}
new MutationObserver(showScope).observe(element('scope'),{childList:true,subtree:true,characterData:true});
new MutationObserver(showOutcome).observe(element('out'),{childList:true,subtree:true,characterData:true});
showScope();showOutcome();
new MutationObserver(refreshExport).observe(element('draft'),{childList:true,subtree:true,characterData:true});
element('save-home').addEventListener('click',()=>{
 const parsed=parseBundle(element('draft').textContent);if(!parsed.ok){show('file-status','Export stopped: current draft is invalid.');return;}
 const exported=exportBundle(parsed.value);if(!exported.ok){show('file-status','Export stopped: canonical output rejected.');return;}
 const url=URL.createObjectURL(new Blob([exported.value],{type:'application/json'})),link=document.createElement('a');
 link.href=url;link.download='atlas.homebundle.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),0);
 show('file-status','HomeBundle downloaded. Nothing was saved online.');
});
function discard(){revision++;pending=undefined;element('apply-file').disabled=true;element('home-file').value='';show('file-review','');show('file-status','File discarded. Current draft is unchanged.');}
element('discard-file').addEventListener('click',discard);
element('home-file').addEventListener('change',async()=>{
 const generation=++revision;pending=undefined;element('apply-file').disabled=true;show('file-review','');
 const file=element('home-file').files?.[0];if(!file){show('file-status','No file selected. Current draft is unchanged.');return;}
 if(file.size>MAX_BYTES){show('file-status','Import stopped: file exceeds 65,536 bytes. Current draft is unchanged.');return;}
 try{
  const text=await file.text();if(generation!==revision)return;
  const parsed=parseBundle(text);if(!parsed.ok){show('file-status','Import stopped: '+parsed.errors.map(error=>error.code+': '+error.message).join(' ')+'. Current draft is unchanged.');return;}
  const exported=exportBundle(parsed.value);if(!exported.ok)throw Error('CANONICAL_OUTPUT_REJECTED');
  pending={text:exported.value,generation};show('file-review',exported.value);show('file-status','Schema validated. Review the file, then explicitly replace the draft.');element('apply-file').disabled=false;
 }catch{if(generation===revision)show('file-status','Import stopped: file could not be read. Current draft is unchanged.');}
});
element('apply-file').addEventListener('click',()=>{
 if(!pending||pending.generation!==revision)return;
 const parsed=parseBundle(pending.text);if(!parsed.ok){discard();return;}
 show('draft',pending.text);discard();refreshExport();show('file-status','Reviewed file applied to this local draft.');
});
refreshExport();
