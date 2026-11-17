import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const provenance = JSON.parse(await readFile(new URL('./vendor/provenance.json', import.meta.url), 'utf8'));
for (const file of provenance.files) {
  const bytes = await readFile(new URL(`./vendor/${file.path}`, import.meta.url));
  const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (blob !== (file.patchedGitBlob || file.gitBlob)) throw new Error(`Recorded source blob mismatch: ${file.path}: ${blob}`);
  if (file.patchedGitBlob) execFileSync(process.execPath, ['--check', new URL(`./vendor/${file.path}`, import.meta.url).pathname]);
}
const patched = provenance.files.filter(file => file.patchedGitBlob).length;
console.log(`Verified ${provenance.files.length - patched} unchanged upstream files and ${patched} recorded Tower patches; upstream ${provenance.commit}.`);
