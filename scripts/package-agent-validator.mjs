// Publish the actual Studio validator as browser-compatible modules, without model/runtime code.
import {readFileSync,writeFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync('src/domain/homebundle.ts','utf8');
const module=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText.replace("'./homebundle-validator.js'","'./homebundle-validator.mjs'");
const outputs={'public/agents/validator.mjs':'// Generated from the Studio domain module. Run node scripts/package-agent-validator.mjs.\n'+module,'public/agents/homebundle-validator.mjs':readFileSync('src/domain/homebundle-validator.js','utf8')};
for(const[path,text]of Object.entries(outputs)){
 if(process.argv.includes('--check')){if(readFileSync(path,'utf8')!==text)throw Error('PUBLIC_VALIDATOR_OUT_OF_DATE: '+path);}
 else writeFileSync(path,text);
}
