import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
test('published two-module validator works without a checkout, package or developer runtime',async()=>{
 const temp=mkdtempSync(join(tmpdir(),'tower-public-validator-'));try{
  for(const name of ['validator.mjs','homebundle-validator.mjs'])copyFileSync('public/agents/'+name,join(temp,name));
  const {parseBundle,exportBundle}=await import(pathToFileURL(join(temp,'validator.mjs')).href);const example=JSON.parse(readFileSync('public/examples/welcome.homebundle.json'));const input=JSON.stringify(example);const parsed=parseBundle(input);assert.equal(parsed.ok,true);assert.deepEqual(JSON.parse(exportBundle(parsed.value).value),example);
  for(const bad of ['{','{"schemaVersion":"0.1","schemaVersion":"0.1"}',JSON.stringify({...example,ownerId:'forged'}),JSON.stringify({...example,schemaVersion:'2.0'}),' '.repeat(65537)])assert.equal(parseBundle(bad).ok,false);
  const text='<script>alert(1)</script>';assert.equal(parseBundle(JSON.stringify({...example,introduction:text})).value.introduction,text);
  writeFileSync(join(temp,'result.json'),JSON.stringify({validated:true}));
 }finally{rmSync(temp,{recursive:true,force:true});}
});
test('public capability index resolves only anonymous static resources and advertises no write/model API',()=>{
 const index=JSON.parse(readFileSync('public/agents/capabilities.json'));assert.equal(index.contractVersion,'1.0');assert.equal(index.operations['homebundle.author'].availability,'available');assert.equal(index.operations['portableNetwork.run'].availability,'unavailable');assert.equal(index.requestPolicy.writeApi,null);assert.equal(index.requestPolicy.modelApi,null);
 const author=index.operations['homebundle.author'];for(const path of [author.schema,author.example,author.validatorModule])assert.ok(readFileSync('public'+path).length);assert.ok(readFileSync('agents/start.html','utf8').includes('parseBundle(jsonText)'));assert.ok(readFileSync('index.html','utf8').includes('/agents/start.html'));
 const headers=readFileSync('public/_headers','utf8');for(const path of ['/agents/capabilities.json','/agents/validator.mjs','/agents/homebundle-validator.mjs','/examples/welcome.homebundle.json'])assert.ok(headers.includes('\n'+path+'\n'));assert.ok(!headers.includes('Allow-Credentials'));assert.ok(!headers.includes('POST'));
});
