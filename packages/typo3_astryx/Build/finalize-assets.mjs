import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const extension=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const publicDir=path.join(extension,'Resources/Public');
const assets=path.join(publicDir,'Assets');
const vitePath=path.join(assets,'.vite/manifest.json');
const vite=JSON.parse(fs.readFileSync(vitePath));
for(const [entry, target] of [['Main','astryx.css'],['Rte','../Css/rte-tokens.css'],['Preview','../Css/backend-preview.css']]) {
 const key=Object.keys(vite).find(key=>key.endsWith(`/${entry}.entry.js`));
 if(!key || !vite[key].css?.length) throw new Error(`Missing CSS for ${entry}`);
 const source=path.join(assets,vite[key].css[0]);
 const dest=path.resolve(assets,target);fs.mkdirSync(path.dirname(dest),{recursive:true});
 // Editor CSS lives in Css/, while its bundled fonts live in Assets/.
 const css=fs.readFileSync(source,'utf8').replace(/url\((["']?)([^"')]+)\1\)/g,(match,quote,url)=>{
  if(/^(?:data:|https?:|\/|#)/.test(url))return match;
  const asset=path.resolve(path.dirname(source),url);
  return `url(${quote}${path.relative(path.dirname(dest),asset).split(path.sep).join('/')}${quote})`;
 });
 fs.writeFileSync(dest,css);
 if(entry==='Main') { delete vite['_astryx2.css']; vite[key].css=[target]; if(source!==dest)fs.unlinkSync(source); }
}
fs.writeFileSync(vitePath,JSON.stringify(vite,null,2)+'\n');
const manifestPath=path.join(publicDir,'StylexManifest/stylex-manifest.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath));
manifest.artifacts=['Assets/astryx.css','Assets/rte.css','Assets/preview.css','Css/rte-tokens.css','Css/backend-preview.css'].map(relative=>({path:'../'+relative,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(publicDir,relative))).digest('hex')}));
manifest.generation=crypto.createHash('sha256').update(JSON.stringify({styles:manifest.styles,artifacts:manifest.artifacts})).digest('hex');
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
