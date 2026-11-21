// Real local SQLite, shaped like the narrow D1 interface; no Cloudflare service or model.
import { DatabaseSync } from 'node:sqlite';
import type { RuntimeDatabase, Statement } from '../server/live-reviewer.ts';
export function sqliteRuntime() {
  const sql = new DatabaseSync(':memory:');
  const db: RuntimeDatabase = {
    async exec(text) { sql.exec(text); },
    prepare(text) {
      let values: unknown[] = [];
      const statement: Statement = {
        bind(...args) { values = args; return statement; },
        async first<T>() { return (sql.prepare(text).get(...values as never[]) ?? null) as T | null; },
        async run() { const result = sql.prepare(text).run(...values as never[]); return { meta: { changes: Number(result.changes) } }; },
      };
      return statement;
    },
  };
  return { db, sql, close: () => sql.close() };
}
