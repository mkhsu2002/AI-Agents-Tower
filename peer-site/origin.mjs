// Public build metadata only; never reads credentials or cloud bindings.
export function peerOrigin(env){
 const explicit=env.TOWER_PEER_ORIGIN;
 if(explicit){const u=new URL(explicit);if(u.origin!==explicit||u.protocol!=='https:')throw Error('EXACT_HTTPS_PEER_ORIGIN_REQUIRED');return u.origin;}
 if(!env.CF_PAGES_URL)throw Error('CF_PAGES_URL_OR_TOWER_PEER_ORIGIN_REQUIRED');
 const u=new URL(env.CF_PAGES_URL),parts=u.hostname.split('.');
 if(u.protocol!=='https:'||u.username||u.password||!u.hostname.endsWith('.pages.dev')||parts.length<3||parts.length>4)throw Error('PAGES_DEPLOYMENT_URL_REQUIRED');
 const project=parts.at(-3);if(!/^[a-z0-9][a-z0-9-]*$/.test(project))throw Error('PAGES_PROJECT_NAME_REQUIRED');
 return 'https://'+project+'.pages.dev';
}
