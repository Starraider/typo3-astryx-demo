import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from '@babel/parser';
const extension=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sources=path.join(extension,'Resources/Private/JavaScript/Stylex');
function extract(file,method) {
 const ast=parse(fs.readFileSync(file,'utf8'),{sourceType:'module'});
 const declarations=ast.program.body.flatMap(node=>node.declaration?.declarations??[]);
 const call=declarations.find(declaration=>declaration.init?.callee?.property?.name===method)?.init;
 const object=call?.arguments[method==='defineVars'?0:1];
 if(object?.type!=='ObjectExpression')throw new Error(`Static token object required in ${file}`);
 return Object.fromEntries(object.properties.map(property=>{
  if(property.key.type!=='StringLiteral'||property.value.type!=='StringLiteral')throw new Error(`Static string tokens required in ${file}`);
  return [property.key.value,property.value.value];
 }));
}
const defaults=extract(path.join(sources,'tokens.stylex.js'),'defineVars');
const themes=Object.fromEntries(['Neutral','Stone','Ocean'].map(name=>[name.toLowerCase(),{...defaults,...extract(path.join(sources,`Themes/${name}.stylex.js`),'createTheme')}]));
for(const tokens of Object.values(themes))for(const key of Object.keys(defaults))if(!tokens[key])throw new Error(`Missing ${key}`);
fs.writeFileSync(path.join(extension,'Build/theme-tokens.json'),JSON.stringify(themes,null,2)+'\n');
const css='@layer astryx-theme {\n'+Object.entries(themes).map(([name,tokens])=>`[data-astryx-theme="${name}"]${name==='neutral'?', :where(.ck-content, .astryx-preview):not([data-astryx-theme])':''} {\n`+Object.entries(tokens).map(([key,value])=>`  ${key}: ${value};`).join('\n')+'\n}').join('\n')+'\n[data-astryx-mode="system"] { color-scheme: light dark; }\n[data-astryx-mode="light"], :where(.ck-content, .astryx-preview):not([data-astryx-mode]) { color-scheme: light; }\n[data-astryx-mode="dark"] { color-scheme: dark; }\n}\n';
fs.writeFileSync(path.join(extension,'Resources/Private/CSS/themes.css'),css);
