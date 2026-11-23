import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {checkPublicHeaders} from '../../scripts/check-public-headers.mjs';
const resource='/schema/homebundle-v0.1.schema.json';
const rule=resource+'\n  Access-Control-Allow-Origin: *\n';
test('duplicate path blocks are rejected before any folding',()=>{
 assert.throws(()=>checkPublicHeaders(rule+'\n'+rule,[resource]),/DUPLICATE_HEADER_PATH/);
});
test('repeated ACAO in one block is rejected case insensitively',()=>{
 assert.throws(()=>checkPublicHeaders(rule+'  access-control-allow-origin: *\n',[resource]),/DUPLICATE_ALLOW_ORIGIN/);
});
test('overlapping global and exact CORS rules cannot grant twice',()=>{
 assert.throws(()=>checkPublicHeaders('/*\n  Access-Control-Allow-Origin: *\n'+rule,[resource]),/OVERLAPPING_ALLOW_ORIGIN/);
});
test('overlapping directory and exact CORS rules cannot grant twice',()=>{
 assert.throws(()=>checkPublicHeaders('/schema/*\n  Access-Control-Allow-Origin: *\n'+rule,[resource]),/OVERLAPPING_ALLOW_ORIGIN/);
});
test('normal global safety headers and path-specific CORS are allowed',()=>{
 const result=checkPublicHeaders('/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n'+rule,[resource,'/index.html']);
 assert.deepEqual(result.effective.map(r=>r.allowOriginCount),[1,0]);
});
test('global CORS and path-specific non-CORS headers are allowed',()=>{
 assert.equal(checkPublicHeaders('/*\n  Access-Control-Allow-Origin: *\n'+resource+'\n  Content-Type: application/json\n',[resource]).effective[0].allowOriginCount,1);
});
test('disjoint CORS resources are allowed',()=>{
 assert.deepEqual(checkPublicHeaders(rule+'/agents/validator.mjs\n  Access-Control-Allow-Origin: *\n',[resource,'/agents/validator.mjs']).effective.map(r=>r.allowOriginCount),[1,1]);
});
test('comma-combined multiple origins fail even if upstream folded them',()=>{
 assert.throws(()=>checkPublicHeaders(resource+'\n  Access-Control-Allow-Origin: *, *\n',[resource]),/INVALID_ALLOW_ORIGIN/);
});
test('declared exact resources are checked even in a partial static overlay',()=>{
 assert.throws(()=>checkPublicHeaders('/*\n  Access-Control-Allow-Origin: *\n'+rule,[]),/OVERLAPPING_ALLOW_ORIGIN/);
});
test('malformed or unsupported configuration fails closed',()=>{
 assert.throws(()=>checkPublicHeaders('  X-Test: value\n',[resource]),/INVALID_HEADER_LINE/);
 assert.throws(()=>checkPublicHeaders('/schema/:name\n  X-Test: value\n',[resource]),/UNSUPPORTED_HEADER_SELECTOR/);
});
test('actual source has unique single-origin rules and build runs the gate',()=>{
 const result=checkPublicHeaders(readFileSync('public/_headers','utf8'),[resource]);
 assert.equal(result.effective[0].allowOriginCount,1);
 assert.match(JSON.parse(readFileSync('package.json')).scripts.build,/check-public-headers\.mjs/);
 const resultCLI=spawnSync(process.execPath,['scripts/check-public-headers.mjs'],{encoding:'utf8'});
 assert.equal(resultCLI.status,0,resultCLI.stderr);
});
