import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const extension = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blocks = path.join(extension, 'ContentBlocks/ContentElements');
const shared = path.join(extension, 'Resources/Private/JavaScript/Stylex');
const components = path.join(extension, 'Resources/Private/Components');
const entrypoints = ['Main', 'Preview', 'Rte'].map(name => path.join(extension, `Resources/Private/JavaScript/${name}.entry.js`));
const blockNames = fs.readdirSync(blocks).filter(name => fs.existsSync(path.join(blocks, name, 'config.yaml')));
const aliases = new Map();
const aliasesForBlocks = {'table': ['table-scroll'], 'classic-gallery': ['gallery-lightbox'], 'code-block': ['code-copy-buffer', 'code-preview']};
const componentNames = new Set(fs.readdirSync(components).filter(name => name.endsWith('.html')).map(name => name.slice(0, -5).toLowerCase()));
const selectorOwners = blockNames.filter(name => !componentNames.has(name)).flatMap(name => [name, ...(aliasesForBlocks[name] ?? [])].map(selector => [selector, name]));
const usesSelector = (source, selector) => new RegExp(`\\.astryx-${selector}(?=[^a-zA-Z0-9_-]|-|$)`).test(source);

function files(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}

// Shared block recipes must have multiple independent consumers, not just a generic name.
const recipeConsumers = new Map();
for (const block of blockNames) {
  for (const file of files(path.join(blocks, block)).filter(file => file.endsWith('.html'))) {
    for (const [, recipe] of fs.readFileSync(file, 'utf8').matchAll(/ax:recipe\(name:\s*'([^']+)'/g)) {
      if (!recipeConsumers.has(recipe)) recipeConsumers.set(recipe, new Set());
      recipeConsumers.get(recipe).add(block);
    }
  }
}
assert((recipeConsumers.get('Grid')?.size ?? 0) >= 2, 'Shared .astryx-grid CSS requires multiple block consumers.');

// Walk the source graph rather than assuming that creating src/ compiles it.
const reachable = new Set();
function visit(file) {
  if (reachable.has(file)) return;
  assert(fs.existsSync(file), `Missing style import: ${file}`);
  reachable.add(file);
  const source = fs.readFileSync(file, 'utf8');
  const imports = file.endsWith('.css')
    ? [...source.matchAll(/@import\s+['"]([^'"]+)['"]/g)]
    : [...source.matchAll(/\b(?:import\s+(?:[^;\n]*?\s+from\s+)?|export\s+[^;\n]*?\s+from\s+)['"]([^'"]+)['"]/g)];
  for (const [,specifier] of imports) {
    if (specifier.startsWith('.')) visit(path.resolve(path.dirname(file), specifier));
  }
}
entrypoints.forEach(visit);

// Page chrome (for example header navigation) is reusable extension UI, not block-owned.
const pageRecipes = new Set(files(path.join(extension, 'Resources/Private/PageView'))
  .filter(file => file.endsWith('.html'))
  .flatMap(file => [...fs.readFileSync(file, 'utf8').matchAll(/ax:recipe\(name:\s*'([^']+)'/g)].map(match => match[1])));

for (const file of files(shared)) {
  if (!file.endsWith('.stylex.js')) continue;
  const basename = path.basename(file, '.stylex.js');
  if (basename === 'tokens' || path.dirname(file) === path.join(shared, 'Themes')) continue;
  assert(basename.startsWith('Astryx') && (fs.existsSync(path.join(components, basename.slice(6) + '.html'))
    || pageRecipes.has(basename.slice(6))
    || (recipeConsumers.get(basename.slice(6))?.size ?? 0) >= 2),
    `Block-only recipe must live in its owning block's src/: ${file}`);
}
for (const file of files(path.join(extension, 'Resources/Private/CSS'))) {
  if (!file.endsWith('.css')) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const [selector] of selectorOwners) {
    assert(!usesSelector(source, selector),
      `Block-specific .astryx-${selector} styles must live in the block's src/: ${file}`);
  }
}
for (const block of blockNames) {
  for (const file of files(path.join(blocks, block))) {
    if (!file.endsWith('.stylex.js') && !file.endsWith('.css')) continue;
    assert(file.startsWith(path.join(blocks, block, 'src') + path.sep), `Block style source must live in src/: ${file}`);
    assert(reachable.has(file), `Block style source is not imported by a frontend/editor entrypoint: ${file}`);
    if (file.endsWith('.css')) {
      const source = fs.readFileSync(file, 'utf8');
      for (const [selector, owner] of selectorOwners) {
        assert(owner === block || !usesSelector(source, selector), `Styles for ${owner} are stored in ${block}: ${file}`);
      }
    }
  }
}
for (const file of files(path.join(extension, 'Resources/Private')).concat(files(blocks))) {
  if (!file.endsWith('.stylex.js')) continue;
  const component = path.basename(file, '.stylex.js').replace(/^Astryx/, '');
  if (fs.existsSync(path.join(components, component + '.html'))) {
    assert(path.dirname(file) === shared, `Reusable native-component recipe must live centrally: ${file}`);
  }
  if (file.includes(path.join('Resources', 'Private') + path.sep)) {
    assert(file.startsWith(shared + path.sep), `Shared StyleX source must live in the central Stylex directory: ${file}`);
  }
  const basename = path.basename(file);
  assert(!aliases.has(basename), `Duplicate StyleX basename ${basename}: ${file} and ${aliases.get(basename)}`);
  aliases.set(basename, file);
}
console.log(`Style ownership verified: ${blockNames.length} blocks, ${aliases.size} uniquely named StyleX modules.`);
