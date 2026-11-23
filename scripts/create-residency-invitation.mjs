import { randomBytes, createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [directory] = process.argv.slice(2);
if (!directory || process.argv.length !== 3) throw Error('Usage: node scripts/create-residency-invitation.mjs <new-private-directory>');
const destination = resolve(directory);
await mkdir(destination, { mode: 0o700 });
const invitation = 'invite.' + randomBytes(32).toString('hex');
const hash = createHash('sha256').update(invitation).digest('hex');
const expires = Date.now() + 48 * 60 * 60 * 1000;
await writeFile(resolve(destination, 'invite.txt'), invitation + '\n', { mode: 0o600, flag: 'wx' });
await writeFile(resolve(destination, 'invite.sql'), `INSERT INTO residency_pilot (invite_hash, expires_at) VALUES ('${hash}', ${expires});\n`, { mode: 0o600, flag: 'wx' });
console.log('Created a private invitation and its database seed. It expires in 48 hours.');
