// Production is deliberately hard OFF. No environment reads, provider imports or activation flags.
export default {
  fetch(): Response {
    return Response.json({ error: 'Live reviewer inference is disabled.' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  },
};
