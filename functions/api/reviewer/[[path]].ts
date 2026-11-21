// Cloudflare Pages adapter. All reviewer API paths remain hard disabled.
// No environment binding, request data or provider credential is read here.
import reviewer from '../../../api/reviewer.ts';
export const onRequest = () => reviewer.fetch();
