import {handleNetworkRequest} from '../../../agent-network/server/handler.mjs';
export function onRequest(context:{request:Request;env?:Record<string,unknown>;waitUntil(promise:Promise<unknown>):void}){
 return handleNetworkRequest(context.request,context.env,context);
}
