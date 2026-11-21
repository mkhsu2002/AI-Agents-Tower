// Test-only Worker. The host replaces all outbound fetches; only synthetic bindings are supplied.
import { createLiveReviewer } from '../../server/live-reviewer.ts';
import type { LiveBindings } from '../../server/live-reviewer.ts';
import { META_ENDPOINT } from '../../server/meta-policy.ts';
const gateway = createLiveReviewer({ transport: fetch });
export default {
  async fetch(request: Request, env: LiveBindings) {
    if (new URL(request.url).pathname === '/fixture/request-modes') {
      let errorRejected = false; let manualAccepted = false;
      try { new Request(META_ENDPOINT, { method: 'POST', redirect: 'error' }); } catch { errorRejected = true; }
      try { new Request(META_ENDPOINT, { method: 'POST', redirect: 'manual', credentials: 'omit' }); manualAccepted = true; } catch { /* Report a capability boolean only. */ }
      return Response.json({ errorRejected, manualAccepted });
    }
    try { return await gateway(request, env); }
    catch (error) { return Response.json({ fixtureUncaught: true, signalRelated: error instanceof Error && error.message.includes('signal') }, { status: 500 }); }
  },
};
