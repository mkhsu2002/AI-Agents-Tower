export interface ConsentInfo { kind: string; phase?: string; peerOrigin: string; requestText?: string; url?: string; signal?: AbortSignal }
export class Engine {
  constructor(options: { originUrl: string; networkName?: string; routerOverride?: string; modelAdapter?: unknown; trace?: unknown; timeoutMs?: number });
  onConsent: ((info: ConsentInfo) => Promise<string>) | null;
  runTurn(input: string): Promise<{ text: string }>;
  cancel(): void;
}
