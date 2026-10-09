import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import php from 'highlight.js/lib/languages/php';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';

const languages = {javascript, typescript, css, html: xml, php, python, rust, bash, json, yaml};
for (const [name, grammar] of Object.entries(languages)) hljs.registerLanguage(name, grammar);

export function highlight(code, language) {
  if (!Object.hasOwn(languages, language)) return null;
  return hljs.highlight(code, {language, ignoreIllegals: true}).value;
}
