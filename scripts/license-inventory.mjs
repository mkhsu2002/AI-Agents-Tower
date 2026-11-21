// Local package metadata inventory only; no license selection, network call or legal certification.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
const packages = Object.entries(lock.packages).filter(([path]) => path).map(([path, metadata]) => ({ path, version: metadata.version, development: metadata.dev === true, declaredLicense: metadata.license || 'UNDECLARED' }));
const report = { projectLicense: 'UNSELECTED_OWNER_DECISION', source: 'checked-in package-lock.json', vendoredRuntime: { license: 'Apache-2.0', notices: 'spikes/m2/vendor/LICENSE.txt and provenance.json' }, artwork: 'See docs/ASSETS.md; no blanket code-license grant inferred.', packages };
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(new URL('../artifacts/dependency-license-inventory.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(`Inventoried ${packages.length} local package records. Project license remains unselected.`);
