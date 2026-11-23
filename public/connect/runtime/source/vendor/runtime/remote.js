// Tower local patch, 2026-11-17: strict bounded artifact loading, no redirects.
// Original nsdeploy license and attribution retained; see ../PATCHES.md.
// remote.js — the RemoteNetworkLoader intrinsic: fetch a peer origin's published
// agent network (manifest + HOCON + coded-tool bundle) and make it runnable
// locally. This is the "fetch-and-run-locally" cross-origin composition model:
// there is no agent server — the caller's browser runs the peer's published files.

import { strictJson, validateManifest, checkedUrl, policyError } from "../../safety.js";

export async function fetchManifest(originUrl, operation) {
  const base = checkedUrl(originUrl).href.replace(/\/$/, "");
  const url = `${base}/agent-manifest.json`;
  const manifest = validateManifest(strictJson(await fetchText(url, operation)), base);
  return { manifest, base, url };
}
export async function fetchText(url, operation) {
  if (!operation) throw new Error("Artifact loading requires an active bounded operation.");
  if (operation.approvedArtifacts) { if (!operation.approvedArtifacts.has(url)) throw policyError("Artifact was not preflight-approved."); return operation.approvedArtifacts.get(url); }
  const response = await operation.fetch(url);
  if (!response.ok) throw new Error(`Artifact fetch failed with HTTP ${response.status}.`);
  const bytes = await operation.read(response.arrayBuffer());
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw policyError('Artifacts must contain valid UTF-8 JSON.'); }
}
export function resolveUrl(base, path) { return checkedUrl(path, `${base.replace(/\/$/, "")}/`).href; }

// Caches compiled peer sessions and enforces cycle + depth limits across hops.
export class RemoteRegistry {
  constructor({ maxDepth = 5, trace } = {}) {
    this.maxDepth = maxDepth;
    this.trace = trace;
    this.cache = new Map(); // key: `${origin}::${agentName}` -> Session
  }

  cacheKey(origin, agentName) {
    return `${origin}::${agentName}`;
  }

  get(origin, agentName) {
    return this.cache.get(this.cacheKey(origin, agentName));
  }

  set(origin, agentName, session) {
    this.cache.set(this.cacheKey(origin, agentName), session);
  }

  checkCycle(chain, origin, agentName) {
    const key = this.cacheKey(origin, agentName);
    if (chain.includes(key)) {
      const error = new Error(`composition cycle detected: ${[...chain, key].join(" -> ")}`);
      error.code = "COMPOSITION_CYCLE";
      throw error;
    }
    if (chain.length >= this.maxDepth) {
      const error = new Error(`composition depth limit (${this.maxDepth}) exceeded`);
      error.code = "COMPOSITION_DEPTH";
      throw error;
    }
  }
}
