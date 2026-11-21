import type { HomeBundle } from './homebundle.ts';
interface Validate { (value: unknown): value is HomeBundle; errors?: null | { keyword: string; instancePath: string; message?: string }[] }
declare const validate: Validate;
export default validate;
export const homeBundleSchema: Record<string, unknown>;
