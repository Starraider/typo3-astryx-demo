import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const extension = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blocks = path.join(extension, 'ContentBlocks/ContentElements');
const shared = path.join(extension, 'Resources/Private/JavaScript/StyleX');
const components = path.join(extension, 'Resources/Private/Components');
const entrypoints = ['frontend', 'rte-editor', 'backend-preview'].map(name => path.join(extension, `Resources/Private/JavaScript/${name}.entry.js`));
const blockNames = fs.readdirSync(blocks).filter(name => fs.existsSync(path.join(blocks, name, 'config.yaml')));
const aliasesForBlocks = {'table': ['table-scroll'], 'classic-gallery': ['gallery-lightbox'], 'code-block': ['code-copy-buffer', 'code-preview']};
const toKebab = value => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const componentNames = new Set(fs.readdirSync(components)
  .filter(name => name.endsWith('.html'))
  .map(name => toKebab(name.slice(0, -5))));
const selectorOwners = blockNames.filter(name => !componentNames.has(name))
  .flatMap(name => [name, ...(aliasesForBlocks[name] ?? [])].map(selector => [selector, name]));
const usesSelector = (source, selector) => new RegExp(`\\.astryx-${selector}(?=[^a-zA-Z0-9_-]|-|$)`).test(source);

function files(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });
}

for (const entrypoint of entrypoints) assert(fs.existsSync(entrypoint), `Missing entrypoint: ${entrypoint}`);
const contract = JSON.parse(fs.readFileSync(path.join(extension, 'Build/design-tokens.json'), 'utf8'));
assert.equal(contract.schemaVersion, 1);
assert.equal(contract.customPropertyPrefix, '--astryx-');
assert.deepEqual(['components', 'tokens', 'themes'].sort(), fs.readdirSync(shared).sort(),
  'Central StyleX source must contain only components/, tokens/ and themes/.');

const tokenBasenames = new Set();
const publicTokenNames = new Set();
for (const group of contract.groups) {
  const file = path.join(shared, group.source);
  assert(fs.existsSync(file), `Missing token family source: ${file}`);
  assert(/^tokens\/(?:components\/)?[a-z0-9]+(?:-[a-z0-9]+)*-tokens\.stylex\.js$/.test(group.source),
    `Token family files must use lowercase kebab-case: ${group.source}`);
  assert(!tokenBasenames.has(path.basename(file)), `Duplicate StyleX basename: ${file}`);
  tokenBasenames.add(path.basename(file));
  for (const [, token] of fs.readFileSync(file, 'utf8').matchAll(/"(--astryx-[a-z0-9-]+)"\s*:/g)) {
    assert(!publicTokenNames.has(token), `Public token is defined in more than one family: ${token}`);
    assert(/^--astryx-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(token), `Public token must use lowercase kebab-case: ${token}`);
    publicTokenNames.add(token);
  }
}
for (const theme of contract.themes) {
  const file = path.join(shared, theme.source);
  assert(fs.existsSync(file), `Missing theme source: ${file}`);
  assert(/^themes\/[a-z0-9]+(?:-[a-z0-9]+)*-theme\.stylex\.js$/.test(theme.source),
    `Theme files must use lowercase kebab-case and the -theme suffix: ${theme.source}`);
  assert(!tokenBasenames.has(path.basename(file)), `Duplicate StyleX basename: ${file}`);
  tokenBasenames.add(path.basename(file));
}

// Block recipes stay with their blocks; recipes shared with Fluid components or page chrome stay central.
const recipeConsumers = new Map();
for (const block of blockNames) {
  for (const file of files(path.join(blocks, block)).filter(file => file.endsWith('.html'))) {
    for (const [, recipe] of fs.readFileSync(file, 'utf8').matchAll(/ax:recipe\(name:\s*'([^']+)'/g)) {
      if (!recipeConsumers.has(recipe)) recipeConsumers.set(recipe, new Set());
      recipeConsumers.get(recipe).add(block);
    }
  }
}
assert((recipeConsumers.get('Grid')?.size ?? 0) >= 2, 'The Grid StyleX recipe must have multiple independent block consumers.');

const reachable = new Set();
function visit(file) {
  if (reachable.has(file)) return;
  assert(fs.existsSync(file), `Missing style import: ${file}`);
  reachable.add(file);
  const source = fs.readFileSync(file, 'utf8');
  const imports = file.endsWith('.css')
    ? [...source.matchAll(/@import\s+['"]([^'"]+)['"]/g)]
    : [...source.matchAll(/\b(?:import\s+(?:[^;\n]*?\s+from\s+)?|export\s+[^;\n]*?\s+from\s+)['"]([^'"]+)['"]/g)];
  for (const [, specifier] of imports) if (specifier.startsWith('.')) visit(path.resolve(path.dirname(file), specifier));
}
entrypoints.forEach(visit);

const pageRecipes = new Set(['PageView', 'Layouts', 'Partials'].flatMap(directory => files(path.join(extension, `Resources/Private/${directory}`)))
  .filter(file => file.endsWith('.html'))
  .flatMap(file => [...fs.readFileSync(file, 'utf8').matchAll(/ax:recipe\(name:\s*'([^']+)'/g)].map(match => toKebab(match[1]))));
const componentRecipes = new Set(files(components).filter(file => file.endsWith('.html'))
  .flatMap(file => [...fs.readFileSync(file, 'utf8').matchAll(/ax:recipe\(name:\s*'([^']+)'/g)].map(match => toKebab(match[1]))));
const sharedRecipes = files(path.join(shared, 'components')).filter(file => file.endsWith('.stylex.js'));
for (const file of sharedRecipes) {
  const basename = path.basename(file, '.stylex.js');
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(basename), `Shared recipe must use lowercase kebab-case: ${file}`);
  const nativeComponent = componentNames.has(basename);
  const pageChrome = pageRecipes.has(basename);
  const componentRecipe = componentRecipes.has(basename);
  const independentBlockConsumers = [...recipeConsumers]
    .some(([name, consumers]) => toKebab(name) === basename && consumers.size >= 2);
  assert(nativeComponent || pageChrome || componentRecipe || independentBlockConsumers,
    `Block-only recipe must live in its owning block's src/: ${file}`);
}

for (const file of files(path.join(extension, 'Resources/Private/CSS'))) {
  if (!file.endsWith('.css')) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const [selector] of selectorOwners) assert(!usesSelector(source, selector),
    `Block-specific .astryx-${selector} styles must live in the block's src/: ${file}`);
}

for (const block of blockNames) {
  for (const file of files(path.join(blocks, block))) {
    if (!file.endsWith('.stylex.js') && !file.endsWith('.css')) continue;
    assert(file.startsWith(path.join(blocks, block, 'src') + path.sep), `Block style source must live in src/: ${file}`);
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:stylex\.js|css)$/.test(path.basename(file)),
      `Block style source must use lowercase kebab-case: ${file}`);
    assert(reachable.has(file), `Block style source is not imported by a frontend/editor entrypoint: ${file}`);
    if (file.endsWith('.css')) {
      const source = fs.readFileSync(file, 'utf8');
      for (const [selector, owner] of selectorOwners) assert(owner === block || !usesSelector(source, selector),
        `Styles for ${owner} are stored in ${block}: ${file}`);
    }
  }
}

const sourceFiles = files(path.join(extension, 'Resources/Private')).concat(files(blocks));
const aliases = new Map();
for (const file of sourceFiles.filter(file => file.endsWith('.stylex.js'))) {
  const basename = path.basename(file, '.stylex.js');
  assert(!aliases.has(basename), `Duplicate StyleX basename ${basename}: ${file} and ${aliases.get(basename)}`);
  aliases.set(basename, file);
  if (file.startsWith(path.join(extension, 'Resources/Private') + path.sep)) {
    assert(file.startsWith(shared + path.sep), `Shared StyleX source must live under the central StyleX tree: ${file}`);
    const relative = path.relative(shared, file).split(path.sep);
    assert(['components', 'tokens', 'themes'].includes(relative[0]), `Unexpected central StyleX folder: ${file}`);
  }
}
for (const file of sourceFiles.filter(file => ['.js', '.css'].includes(path.extname(file)))) {
  const source = fs.readFileSync(file, 'utf8');
  for (const [, token] of source.matchAll(/(--astryx-[a-z0-9-]+)/g)) {
    assert(publicTokenNames.has(token), `Unknown or component-local variable must not use the public token prefix: ${token} in ${file}`);
  }
}

console.log(`Style ownership verified: ${blockNames.length} blocks, ${aliases.size} uniquely named StyleX modules.`);
