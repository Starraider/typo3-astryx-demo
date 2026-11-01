import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const extension = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(extension, 'Resources/Public');
const assetsDir = path.join(publicDir, 'Assets');
const viteManifestPath = path.join(assetsDir, '.vite/manifest.json');
const viteManifest = JSON.parse(fs.readFileSync(viteManifestPath, 'utf8'));

const cssEntries = [
  {source: 'frontend.entry.js', target: 'Assets/astryx.css'},
  {source: 'rte-editor.entry.js', target: 'Css/rte-tokens.css'},
  {
    source: 'backend-preview.entry.js',
    target: 'Css/backend-preview.css',
    packagedAsset: 'Assets/preview.css',
  },
];

for (const entry of cssEntries) {
  const manifestKey = Object.keys(viteManifest).find(key => key.endsWith(`/${entry.source}`));
  if (!manifestKey || viteManifest[manifestKey].css?.length !== 1) {
    throw new Error(`Expected one generated CSS file for ${entry.source}`);
  }

  const actualAsset = viteManifest[manifestKey].css[0];
  const sourcePath = path.join(assetsDir, actualAsset);
  const outputPath = path.resolve(publicDir, entry.target);
  fs.mkdirSync(path.dirname(outputPath), {recursive: true});

  // Editor CSS is published outside Assets/, so preserve relative font URLs.
  const css = fs.readFileSync(sourcePath, 'utf8').replace(/url\((["']?)([^"')]+)\1\)/g, (match, quote, url) => {
    if (/^(?:data:|https?:|\/|#)/.test(url)) return match;
    const assetPath = path.resolve(path.dirname(sourcePath), url);
    return `url(${quote}${path.relative(path.dirname(outputPath), assetPath).split(path.sep).join('/')}${quote})`;
  });
  fs.writeFileSync(outputPath, css);

  // Keep a stable packaged preview stylesheet name even when Vite adds a suffix
  // to avoid colliding with the preview entry's imported CSS basename.
  if (entry.packagedAsset) {
    fs.copyFileSync(sourcePath, path.join(publicDir, entry.packagedAsset));
    if (sourcePath !== path.join(assetsDir, entry.packagedAsset)) fs.rmSync(sourcePath);
    for (const [key, value] of Object.entries(viteManifest)) {
      if (key.startsWith('_') && value.file === actualAsset) delete viteManifest[key];
    }
    viteManifest[manifestKey].css = [path.relative(assetsDir, path.join(publicDir, entry.packagedAsset)).split(path.sep).join('/')];
  }

  // Vite can deduplicate the RTE and preview stylesheet entries when the
  // preview entry contains only the shared RTE foundation. Keep the stable
  // packaged RTE filename and manifest reference in that case.
  if (entry.source === 'rte-editor.entry.js') {
    const packagedRteCss = path.join(assetsDir, 'rte.css');
    if (sourcePath !== packagedRteCss) fs.copyFileSync(sourcePath, packagedRteCss);
    viteManifest[manifestKey].css = ['rte.css'];
  }

  if (entry.source === 'frontend.entry.js') {
    viteManifest[manifestKey].css = ['astryx.css'];
    for (const [key, value] of Object.entries(viteManifest)) {
      if (key.startsWith('_') && value.file !== 'astryx.css') delete viteManifest[key];
    }
  }
}

// The StyleX Vite plugin emits the shared atomic rules alongside the preview
// token entry in this multi-entry extension build. Frontend markup resolves
// those recipes from the same manifest, so package the shared rules with the
// frontend stylesheet as well.
const frontendCssPath = path.join(assetsDir, 'astryx.css');
const previewCssPath = path.join(assetsDir, 'preview.css');
const frontendCss = fs.readFileSync(frontendCssPath, 'utf8');
const previewCss = fs.readFileSync(previewCssPath, 'utf8');
if (!frontendCss.includes(previewCss)) {
  fs.writeFileSync(frontendCssPath, `${frontendCss}\n${previewCss}`);
}

fs.writeFileSync(viteManifestPath, `${JSON.stringify(viteManifest, null, 2)}\n`);

const stylexManifestPath = path.join(publicDir, 'StylexManifest/stylex-manifest.json');
const stylexManifest = JSON.parse(fs.readFileSync(stylexManifestPath, 'utf8'));
stylexManifest.artifacts = [
  'Assets/astryx.css',
  'Assets/rte.css',
  'Assets/preview.css',
  'Css/rte-tokens.css',
  'Css/backend-preview.css',
].map(relative => ({
  path: `../${relative}`,
  sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(publicDir, relative))).digest('hex'),
}));
stylexManifest.generation = crypto.createHash('sha256')
  .update(JSON.stringify({styles: stylexManifest.styles, artifacts: stylexManifest.artifacts}))
  .digest('hex');
fs.writeFileSync(stylexManifestPath, `${JSON.stringify(stylexManifest, null, 2)}\n`);
