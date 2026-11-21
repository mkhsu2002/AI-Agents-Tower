// Build-time compilation keeps eval/new Function out of Cloudflare's request runtime.
import { readFile, writeFile } from 'node:fs/promises';
import { Ajv } from 'ajv';
import standalone from 'ajv/dist/standalone/index.js';
const schema = JSON.parse(await readFile(new URL('../public/schema/homebundle-v0.1.schema.json', import.meta.url), 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: true, code: { source: true, esm: true } });
let source = standalone(ajv, ajv.compile(schema));
source = source.replaceAll('require("ajv/dist/runtime/ucs2length").default', 'ucs2length');
if (/require\(|new Function\(|eval\(/.test(source)) throw Error('Unsupported generated runtime dependency.');
source = '// Generated from homebundle-v0.1.schema.json; run npm run generate:domain.\nexport const homeBundleSchema = ' + JSON.stringify(schema) + ';\nconst ucs2length = value => [...value].length;\n' + source + '\n';
const target = new URL('../src/domain/homebundle-validator.js', import.meta.url);
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== source) throw Error('HomeBundle validator is stale. Run npm run generate:domain.');
} else await writeFile(target, source);
