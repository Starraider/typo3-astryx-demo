import fs from 'node:fs';
import './verify-style-ownership.mjs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const extension = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => JSON.parse(fs.readFileSync(path.join(extension, relative), 'utf8'));
const publicDir = path.join(extension, 'Resources/Public');
const manifest = read('Resources/Public/StylexManifest/stylex-manifest.json');
const css = fs.readFileSync(path.join(publicDir, 'Assets/astryx.css'), 'utf8');
const recipes = read('Build/recipes.json');
const toKebab = value => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

for (const [name, dimensions] of Object.entries(recipes)) {
  const module = toKebab(name);
  const keys = [`${module}.root`, ...Object.entries(dimensions)
    .flatMap(([dimension, values]) => values.map(value => `${module}.${dimension}_${value.replaceAll('-', '_')}`))];
  for (const key of keys) {
    const entry = manifest.styles[key];
    if (!entry) throw new Error(`Missing recipe key: ${key}`);
    for (const className of entry.className.split(/\s+/).filter(Boolean)) {
      if (!css.includes(`.${className}`)) throw new Error(`Missing selector for ${key}: ${className}`);
    }
  }
}

for (const artifact of manifest.artifacts) {
  const absolute = path.resolve(publicDir, 'StylexManifest', artifact.path);
  if (!absolute.startsWith(publicDir + path.sep)) throw new Error(`Nonportable manifest path: ${artifact.path}`);
  if (crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex') !== artifact.sha256) {
    throw new Error(`Artifact checksum mismatch: ${artifact.path}`);
  }
  for (const [, url] of fs.readFileSync(absolute, 'utf8').matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    if (/^(?:data:|https?:|#)/.test(url)) continue;
    if (url.startsWith('/') || !fs.existsSync(path.resolve(path.dirname(absolute), url))) {
      throw new Error(`Missing or nonportable CSS asset in ${artifact.path}: ${url}`);
    }
  }
}

const vite = read('Resources/Public/Assets/.vite/manifest.json');
for (const entry of Object.values(vite)) {
  for (const file of [entry.file, ...(entry.css ?? [])]) {
    if (!fs.existsSync(path.join(publicDir, 'Assets', file))) throw new Error(`Missing Vite asset: ${file}`);
  }
}

const themes = read('Build/theme-tokens.json');
const themeNames = Object.keys(themes);
if (themeNames.length === 0) throw new Error('No generated themes found');
const tokenNames = Object.keys(themes[themeNames[0]]).sort();
for (const [name, tokens] of Object.entries(themes)) {
  if (Object.keys(tokens).sort().join('\n') !== tokenNames.join('\n')) throw new Error(`Theme ${name} is incomplete`);
  if (!css.includes(`[data-astryx-theme="${name}"]`) && !css.includes(`[data-astryx-theme=${name}]`)) {
    throw new Error(`Missing theme selector: ${name}`);
  }
  for (const key of tokenNames) {
    if (!/^--astryx-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) throw new Error(`Invalid token name: ${key}`);
    if (!css.includes(`${key}:`)) throw new Error(`Missing public token: ${key}`);
  }
}

for (const file of ['rte-tokens.css', 'backend-preview.css']) {
  const text = fs.readFileSync(path.join(publicDir, 'Css', file), 'utf8');
  if (!text.includes('--astryx-color-text-primary:') || !text.includes('.ck-content')) {
    throw new Error(`Incomplete editor tokens: ${file}`);
  }
}

if (/react|react-dom|localhost|@vite\/client/.test(fs.readFileSync(path.join(publicDir, 'Assets/astryx.js'), 'utf8'))) {
  throw new Error('Unexpected development/React runtime in packaged frontend');
}
console.log(JSON.stringify({
  status: 'passed',
  recipes: Object.keys(recipes).length,
  tokens: tokenNames.length,
  themes: themeNames.length,
  styles: Object.keys(manifest.styles).length,
  pairedArtifacts: manifest.artifacts.length,
  frontendCssBytes: Buffer.byteLength(css),
  frontendJsBytes: fs.statSync(path.join(publicDir, 'Assets/astryx.js')).size,
}, null, 2));
