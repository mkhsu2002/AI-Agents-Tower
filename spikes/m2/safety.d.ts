export function checkedUrl(value: string, base?: string): URL;
export function strictJson(text: string): unknown;
export class Operation {
  constructor(timeoutMs?: number);
  signal: AbortSignal;
  assert(): void;
  cancel(message?: string): void;
  dispose(): void;
  fetch(url: string, options?: RequestInit): Promise<Response>;
  wait<T>(promise: Promise<T>): Promise<T>;
  read<T>(promise: Promise<T>): Promise<T>;
}
export function validateDefinition(value: unknown): unknown;
export function validateManifest(value: unknown, base: string): unknown;

export function policyError(message: string): Error & { code: 'RUNTIME_POLICY' };
