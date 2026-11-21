// Server-only persistence core. Not imported by the frontend or deployed as an API.
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { validateBundle } from '../src/domain/homebundle.ts';
import type { HomeBundle } from '../src/domain/homebundle.ts';
export class HomeError extends Error {
  code: string; status: number;
  constructor(code: string, status: number) { super(code); this.code = code; this.status = status; }
}
export interface Identity { issuer: string; subject: string }
export type Authenticator = (context: unknown) => Promise<Identity | null>;
export interface PrivateHome { id: string; revision: number; bundle: HomeBundle; digest: string }
export interface Receipt { requestKey: string; operation: string; status: 'succeeded' | 'rejected'; result?: Record<string, unknown>; error?: string }
type Command = { operation: 'create' | 'update' | 'publish' | 'unpublish'; requestKey: string; homeId?: string; snapshotId?: string; expectedRevision?: number; reviewedDigest?: string; bundle?: HomeBundle };
const fail = (code: string, status = 400): never => { throw new HomeError(code, status); };
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (object(value)) return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
const json = (value: unknown) => JSON.stringify(canonical(value));
const hash = (value: unknown) => createHash('sha256').update(json(value)).digest('hex');
function fields(value: unknown, allowed: string[]): Record<string, unknown> {
  if (!object(value) || Object.keys(value).some(key => !allowed.includes(key)) || allowed.some(key => !Object.hasOwn(value, key))) fail('INVALID_COMMAND');
  return value as Record<string, unknown>;
}
function key(value: unknown): string { if (typeof value !== 'string' || !/^[\w.:-]{8,120}$/.test(value)) fail('INVALID_REQUEST_KEY'); return value as string; }
function id(value: unknown): string { if (typeof value !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(value)) fail('INVALID_ID'); return value as string; }
function revision(value: unknown): number { if (!Number.isSafeInteger(value) || Number(value) < 1) fail('INVALID_REVISION'); return value as number; }
function bundle(value: unknown): HomeBundle { const checked = validateBundle(value); if (!checked.ok) return fail('INVALID_BUNDLE'); return checked.value; }

export class HomeStore {
  private db: DatabaseSync;
  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=1000;
      CREATE TABLE IF NOT EXISTS homes(id TEXT PRIMARY KEY,owner TEXT NOT NULL,revision INTEGER NOT NULL,bundle TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS receipts(owner TEXT NOT NULL,request_key TEXT NOT NULL,operation TEXT NOT NULL,input_hash TEXT NOT NULL,receipt TEXT NOT NULL,PRIMARY KEY(owner,request_key));
      CREATE TABLE IF NOT EXISTS snapshots(id TEXT PRIMARY KEY,home_id TEXT NOT NULL REFERENCES homes(id),owner TEXT NOT NULL,revision INTEGER NOT NULL,bundle TEXT NOT NULL,active INTEGER NOT NULL CHECK(active IN(0,1)));`);
  }
  close() { this.db.close(); }
  get(owner: string, homeId: string): PrivateHome {
    const row = this.db.prepare('SELECT id,revision,bundle FROM homes WHERE owner=? AND id=?').get(owner, homeId);
    if (!row) return fail('NOT_FOUND', 404);
    const content = JSON.parse(String(row.bundle)) as HomeBundle;
    return { id: String(row.id), revision: Number(row.revision), bundle: content, digest: hash(content) };
  }
  receipt(owner: string, requestKey: string): Receipt | null {
    const row = this.db.prepare('SELECT receipt FROM receipts WHERE owner=? AND request_key=?').get(owner, requestKey);
    return row ? JSON.parse(String(row.receipt)) as Receipt : null;
  }
  publicSnapshot(snapshotId: string) {
    const row = this.db.prepare('SELECT id,bundle FROM snapshots WHERE id=? AND active=1').get(snapshotId);
    if (!row) return null;
    return { id: String(row.id), bundle: JSON.parse(String(row.bundle)) as HomeBundle, cacheControl: 'no-store' as const };
  }
  mutate(owner: string, command: Command): Receipt {
    let begun = false;
    try {
      this.db.exec('BEGIN IMMEDIATE'); begun = true;
      const fingerprint = hash(command);
      const previous = this.db.prepare('SELECT input_hash,receipt FROM receipts WHERE owner=? AND request_key=?').get(owner, command.requestKey);
      if (previous) {
        if (previous.input_hash !== fingerprint) fail('IDEMPOTENCY_CONFLICT', 409);
        const receipt = JSON.parse(String(previous.receipt)) as Receipt;
        this.db.exec('COMMIT'); return receipt;
      }
      let receipt: Receipt;
      this.db.exec('SAVEPOINT home_change');
      try {
        const result = this.apply(owner, command);
        receipt = { requestKey: command.requestKey, operation: command.operation, status: 'succeeded', result };
        this.db.exec('RELEASE home_change');
      } catch (error) {
        this.db.exec('ROLLBACK TO home_change'); this.db.exec('RELEASE home_change');
        if (!(error instanceof HomeError)) throw error;
        receipt = { requestKey: command.requestKey, operation: command.operation, status: 'rejected', error: error.code };
      }
      this.db.prepare('INSERT INTO receipts(owner,request_key,operation,input_hash,receipt) VALUES(?,?,?,?,?)').run(owner, command.requestKey, command.operation, fingerprint, JSON.stringify(receipt));
      this.db.exec('COMMIT'); return receipt;
    } catch (error) {
      if (begun) { try { this.db.exec('ROLLBACK'); } catch { /* A commit outcome must be recovered by request key, never assumed. */ } }
      if (error instanceof HomeError) throw error;
      return fail('STORAGE_UNAVAILABLE_CHECK_RECEIPT', 503);
    }
  }
  private apply(owner: string, command: Command): Record<string, unknown> {
    if (command.operation === 'create') {
      const homeId = randomUUID();
      this.db.prepare('INSERT INTO homes(id,owner,revision,bundle) VALUES(?,?,1,?)').run(homeId, owner, json(command.bundle));
      return { homeId, revision: 1 };
    }
    if (command.operation === 'unpublish') {
      const row = this.db.prepare('SELECT id FROM snapshots WHERE owner=? AND id=?').get(owner, command.snapshotId!);
      if (!row) return fail('NOT_FOUND', 404);
      this.db.prepare('UPDATE snapshots SET active=0 WHERE owner=? AND id=?').run(owner, command.snapshotId!);
      return { snapshotId: command.snapshotId!, active: false };
    }
    const current = this.get(owner, command.homeId!);
    if (current.revision !== command.expectedRevision) return fail('REVISION_CONFLICT', 409);
    if (command.operation === 'update') {
      const changed = this.db.prepare('UPDATE homes SET revision=revision+1,bundle=? WHERE owner=? AND id=? AND revision=?').run(json(command.bundle), owner, current.id, current.revision);
      if (Number(changed.changes) !== 1) return fail('REVISION_CONFLICT', 409);
      return { homeId: current.id, revision: current.revision + 1 };
    }
    if (command.reviewedDigest !== current.digest) return fail('REVIEW_MISMATCH', 409);
    const snapshotId = randomUUID();
    this.db.prepare('UPDATE snapshots SET active=0 WHERE owner=? AND home_id=?').run(owner, current.id);
    this.db.prepare('INSERT INTO snapshots(id,home_id,owner,revision,bundle,active) VALUES(?,?,?,?,?,1)').run(snapshotId, current.id, owner, current.revision, json(current.bundle));
    return { snapshotId, reviewedRevision: current.revision };
  }
}

export class HomeService {
  private store: HomeStore; private authenticate?: Authenticator;
  constructor(store: HomeStore, authenticate?: Authenticator) { this.store = store; this.authenticate = authenticate; }
  private async owner(context: unknown): Promise<string> {
    if (!this.authenticate) return fail('AUTH_NOT_CONFIGURED', 503);
    let identity: Identity | null;
    try { identity = await this.authenticate(context); }
    catch { return fail('AUTH_UNAVAILABLE', 503); }
    if (!identity || typeof identity.issuer !== 'string' || typeof identity.subject !== 'string' || !identity.subject.trim() || identity.subject.length > 512 || !/^https:\/\/[^\s]+$/.test(identity.issuer)) return fail('UNAUTHENTICATED', 401);
    return hash({ issuer: identity.issuer, subject: identity.subject });
  }
  async get(context: unknown, homeId: string) { return this.store.get(await this.owner(context), id(homeId)); }
  async receipt(context: unknown, requestKey: string) { return this.store.receipt(await this.owner(context), key(requestKey)); }
  publicSnapshot(snapshotId: string) { return this.store.publicSnapshot(id(snapshotId)); }
  async create(context: unknown, input: unknown) {
    const owner = await this.owner(context); const value = fields(input, ['requestKey', 'bundle']);
    return this.store.mutate(owner, { operation: 'create', requestKey: key(value.requestKey), bundle: bundle(value.bundle) });
  }
  async update(context: unknown, input: unknown) {
    const owner = await this.owner(context); const value = fields(input, ['requestKey', 'homeId', 'expectedRevision', 'bundle']);
    return this.store.mutate(owner, { operation: 'update', requestKey: key(value.requestKey), homeId: id(value.homeId), expectedRevision: revision(value.expectedRevision), bundle: bundle(value.bundle) });
  }
  async publish(context: unknown, input: unknown) {
    const owner = await this.owner(context); const value = fields(input, ['requestKey', 'homeId', 'expectedRevision', 'reviewedDigest']);
    if (typeof value.reviewedDigest !== 'string' || !/^[a-f0-9]{64}$/.test(value.reviewedDigest)) return fail('INVALID_REVIEW');
    return this.store.mutate(owner, { operation: 'publish', requestKey: key(value.requestKey), homeId: id(value.homeId), expectedRevision: revision(value.expectedRevision), reviewedDigest: value.reviewedDigest });
  }
  async unpublish(context: unknown, input: unknown) {
    const owner = await this.owner(context); const value = fields(input, ['requestKey', 'snapshotId']);
    return this.store.mutate(owner, { operation: 'unpublish', requestKey: key(value.requestKey), snapshotId: id(value.snapshotId) });
  }
}
