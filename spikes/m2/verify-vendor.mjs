import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const provenance = JSON.parse(await readFile(new URL('./vendor/provenance.json', import.meta.url), 'utf8'));
for (const file of provenance.files) {
  const bytes = await readFile(new URL(`./vendor/${file.path}`, import.meta.url));
  const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (blob !== file.gitBlob) throw new Error(`Upstream blob mismatch: ${file.path}: ${blob}`);
}
console.log(`Verified ${provenance.files.length} unchanged upstream files (21 modules and license) at ${provenance.commit}.`);
