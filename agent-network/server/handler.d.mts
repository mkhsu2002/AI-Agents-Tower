export function createNetworkHandler(options?:{transport?:typeof fetch;fixtureLabel?:boolean}):(request:Request,env?:Record<string,unknown>,context?:{waitUntil(promise:Promise<unknown>):void})=>Promise<Response>;
export const handleNetworkRequest:ReturnType<typeof createNetworkHandler>;
