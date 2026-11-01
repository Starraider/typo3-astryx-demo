import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse} from '@babel/parser';

const extension = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(extension, 'Resources/Private/JavaScript/StyleX');
const contract = JSON.parse(fs.readFileSync(path.join(extension, 'Build/design-tokens.json'), 'utf8'));

function findCalls(file, method) {
  const ast = parse(fs.readFileSync(file, 'utf8'), {sourceType: 'module'});
  const calls = [];
  for (const statement of ast.program.body) {
    const declaration = statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (declaration?.type !== 'VariableDeclaration') continue;
    for (const variable of declaration.declarations) {
      const init = variable.init;
      if (init?.type !== 'CallExpression' || init.callee?.property?.name !== method) continue;
      calls.push({name: variable.id?.name, arguments: init.arguments});
    }
  }
  return calls;
}

function readStaticObject(node, file) {
  assert.equal(node?.type, 'ObjectExpression', `Static object required in ${file}`);
  const values = {};
  for (const property of node.properties) {
    assert.equal(property.type, 'ObjectProperty', `Object spreads/getters are not supported in ${file}`);
    assert.equal(property.key.type, 'StringLiteral', `String token keys required in ${file}`);
    assert.equal(property.value.type, 'StringLiteral', `Static string token values required in ${file}`);
    const key = property.key.value;
    assert(!(key in values), `Duplicate token ${key} in ${file}`);
    values[key] = property.value.value;
  }
  return values;
}

function readTokenGroup(group) {
  const file = path.join(sourceRoot, group.source);
  const declarations = findCalls(file, 'defineVars');
  assert.equal(declarations.length, 1, `Expected one defineVars export in ${group.source}`);
  assert.equal(declarations[0].name, group.export, `Expected export ${group.export} in ${group.source}`);
  return readStaticObject(declarations[0].arguments[0], file);
}

function readThemeOverrides(theme) {
  const file = path.join(sourceRoot, theme.source);
  const declarations = findCalls(file, 'createTheme');
  assert(declarations.length > 0, `Expected at least one createTheme declaration in ${theme.source}`);
  const overrides = {};
  for (const declaration of declarations) {
    const values = readStaticObject(declaration.arguments[1], file);
    for (const [key, value] of Object.entries(values)) {
      assert(!(key in overrides), `Theme ${theme.name} overrides ${key} more than once`);
      overrides[key] = value;
    }
  }
  return overrides;
}

assert.equal(contract.schemaVersion, 1, 'Unsupported design token contract version');
assert.equal(contract.customPropertyPrefix, '--astryx-', 'Unexpected public token prefix');
assert(contract.groups.length > 0, 'At least one token family is required');
assert(contract.themes.length > 0, 'At least one theme is required');

const defaults = {};
for (const group of contract.groups) {
  const tokens = readTokenGroup(group);
  assert(Object.keys(tokens).length > 0, `Empty token family: ${group.name}`);
  for (const [key, value] of Object.entries(tokens)) {
    assert(key.startsWith(contract.customPropertyPrefix), `Token ${key} is outside the public prefix`);
    assert(/^--astryx-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key), `Token must use lowercase kebab-case: ${key}`);
    assert(!(key in defaults), `Token ${key} is defined in more than one family`);
    defaults[key] = value;
  }
}

const defaultKeys = Object.keys(defaults).sort();
const themes = {};
for (const theme of contract.themes) {
  assert(/^[a-z][a-z0-9-]*$/.test(theme.name), `Theme names must be lowercase kebab-case: ${theme.name}`);
  assert(!(theme.name in themes), `Duplicate theme name: ${theme.name}`);
  const overrides = readThemeOverrides(theme);
  for (const key of Object.keys(overrides)) assert(key in defaults, `Theme ${theme.name} contains unknown token ${key}`);
  // Materialize every default at each theme boundary for CSS consumers that nest themes.
  themes[theme.name] = Object.fromEntries(defaultKeys.map(key => [key, overrides[key] ?? defaults[key]]));
  assert.deepEqual(Object.keys(themes[theme.name]).sort(), defaultKeys, `Theme ${theme.name} is missing a default token`);
}

const tokenCss = tokens => Object.entries(tokens)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n');
const themeCss = Object.entries(themes).map(([name, tokens]) => {
  const defaultSelector = name === 'neutral'
    ? ', :where(.ck-content, .astryx-preview):not([data-astryx-theme])'
    : '';
  return `[data-astryx-theme="${name}"]${defaultSelector} {\n${tokenCss(tokens)}\n}`;
}).join('\n');
const css = [
  '@layer astryx-theme {',
  themeCss,
  '[data-astryx-mode="system"] { color-scheme: light dark; }',
  ':where(.ck-content, .astryx-preview):not([data-astryx-mode]) { color-scheme: light; }',
  '[data-astryx-mode="light"] { color-scheme: light; }',
  '[data-astryx-mode="dark"] { color-scheme: dark; }',
  '}',
  '',
].join('\n');

fs.writeFileSync(path.join(extension, 'Build/theme-tokens.json'), `${JSON.stringify(themes, null, 2)}\n`);
fs.writeFileSync(path.join(extension, 'Resources/Private/CSS/themes.css'), css);
console.log(`Generated ${Object.keys(themes).length} complete themes from ${defaultKeys.length} semantic tokens.`);
