export interface ConsentInfo { kind: string; phase?: string; peerOrigin: string; requestText?: string; url?: string; signal?: AbortSignal }
export interface ActionComponent { id: string; kind: string; action?: string; arguments?: Record<string, unknown> }
export interface ActionPlan { action: string; effect: string; arguments: Record<string, unknown> }
export interface ActionReceipt { action: string; status: string; result?: Record<string, unknown> }
export class Engine {
  constructor(options: { originUrl: string; networkName?: string; routerOverride?: string; modelAdapter?: unknown; trustedAdapterOrigin?: string; trace?: unknown; timeoutMs?: number });
  onConsent: ((info: ConsentInfo) => Promise<string>) | null;
  actions: { register(scope: { base: string; network: string }, definition: unknown, execute: (args: Record<string, unknown>) => Promise<unknown>): string };
  onActionConfirm: (plan: ActionPlan[]) => Promise<boolean>;
  submitActions(input: { turnId: string; componentId: string }): Promise<ActionReceipt[] | null>;
  runTurn(input: string): Promise<{ text: string; turnId: string; presentation?: { components: ActionComponent[] } }>;
  cancel(): void;
}
