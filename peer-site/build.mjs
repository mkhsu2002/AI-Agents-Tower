import {spawnSync} from 'node:child_process';
import {peerOrigin} from './origin.mjs';
const peer=peerOrigin(process.env),caller=process.env.TOWER_CALLER_ORIGIN||'https://1st-tower.neobabylon.app';
const result=spawnSync(process.execPath,['--experimental-strip-types','../scripts/package-agent-peer.mjs',caller,peer],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
console.log('Static peer origin: '+peer+'. No Functions, bindings or model API.');
