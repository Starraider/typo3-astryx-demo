import {chromium} from '@playwright/test';
import {fileURLToPath} from 'node:url';

// Self-contained so Playwright can execute it against the final, sanitized DOM.
// Diagnostics deliberately leave authored HTML and external plugin references intact.
export function inspectIdentifiers() {
  const ids = new Map();
  const describe = node => {
    const record = node.closest('[data-astryx-record-anchor]');
    return {tag: node.tagName.toLowerCase(), record: record?.dataset.astryxRecordAnchor ?? null,
      type: record?.dataset.astryxRecordType ?? null, occurrence: record?.dataset.astryxOccurrence ?? null};
  };
  for (const node of document.querySelectorAll('[id]')) {
    const group = ids.get(node.id) ?? [];
    group.push(node);
    ids.set(node.id, group);
  }
  const duplicates = [...ids].filter(([id, nodes]) => !id || nodes.length > 1)
    .map(([id, nodes]) => ({id, occurrences: nodes.map(describe)}));
  const references = [];
  for (const node of document.querySelectorAll('*')) {
    for (const name of ['aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-owns', 'aria-activedescendant', 'for', 'list', 'headers']) {
      for (const id of (node.getAttribute(name) ?? '').trim().split(/\s+/).filter(Boolean)) {
        if ((ids.get(id)?.length ?? 0) !== 1) references.push({attribute: name, id, targets: ids.get(id)?.length ?? 0, source: describe(node)});
      }
    }
    const href = node.getAttribute('href');
    let fragment = '';
    if (href) {
      try {
        const target = new URL(href, document.baseURI);
        if (target.origin === location.origin && target.pathname === location.pathname && target.search === location.search) fragment = target.hash.slice(1);
      } catch {}
    }
    if (fragment) {
      let id;
      try { id = decodeURIComponent(fragment); } catch { id = fragment; }
      if ((ids.get(id)?.length ?? 0) !== 1) references.push({attribute: 'href', id, targets: ids.get(id)?.length ?? 0, source: describe(node)});
    }
  }
  return {duplicates, references};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const browser = await chromium.launch({env: {...process.env, TMPDIR: '/tmp'}});
  try {
    const page = await browser.newPage({ignoreHTTPSErrors: true});
    await page.goto(process.env.ASTRYX_TEST_URL ?? 'https://typo3-astryx.ddev.site', {waitUntil: 'networkidle'});
    const report = await page.evaluate(inspectIdentifiers);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.duplicates.length || report.references.length ? 1 : 0;
  } finally { await browser.close(); }
}
