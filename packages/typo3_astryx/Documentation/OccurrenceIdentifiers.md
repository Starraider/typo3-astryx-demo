# Occurrence identifiers

Astryx identifies rendered occurrences separately from database records. The frontend middleware creates one `Rendering\OccurrenceIdentifiers` object in the request attribute of the same class name. TYPO3 request clones retain that object, including the requests used by `RECORDS`, `f:render.record` and lazy `f:render.contentArea`. No record fields, relations, localization or workspace overlays are changed. Middleware registration follows the [TYPO3 14 request lifecycle](https://docs.typo3.org/m/typo3/reference-coreapi/14.3/en-us/ApiOverview/RequestLifeCycle/Middlewares.html).

The shared content layout allocates `astryxOccurrence` once before rendering its Main section:

- `namespace` is an ASCII identifier containing a readable prefix, random rendering generation and request-local sequence. Generation separation keeps fresh component IDs distinct from cached component IDs.
- `id` is the wrapper anchor. The first allocation for a rendered `data.uid` claims `c<uid>`; later occurrences use `c<uid>-<namespace>`. First means rendering order, including eager shortcut rendering, rather than an assumption that the original always precedes its shortcuts.
- `canonicalId` is `c<uid>` for every occurrence of that record. External content links should use this stable anchor. A shortcut-only record still has one canonical target on the rendered page. Occurrence anchors and internal component IDs are valid for the current rendered document and can change after cache regeneration.

Wrappers expose `data-astryx-record-anchor`, `data-astryx-occurrence` and, where available, `data-astryx-record-type` for inspection. The canonical anchor belongs to exactly one wrapper; no extra hidden anchor or focus stop is added. Existing heading links, spacing and dedicated plugin dispatch are retained.

Accordion uses the content namespace for item IDs, control targets and its native single-mode `name`. Carousel passes the same namespace to both pagination positions. Classic Gallery uses it for the image list and lightbox. All six containers inherit wrapper allocation; each lazy child render allocates its own occurrence through the same request state. The Shortcut renderer keeps core `RECORDS` behavior.

Main Menu allocates a namespace for each root render, then appends every ancestor's iteration index when recursing. `prefix` still selects desktop/mobile styling. Language Menu and Header allocate independently for language panels and mobile dialogs. TreeList allocates once per native component call and uses complete index paths for recursive children. Its optional `id` argument is now a readable prefix (default `tree`), rather than a promised literal DOM ID; `data-astryx-tree-prefix` retains that prefix for inspection.

## Custom components and external output

Use the content layout's `astryxOccurrence.namespace` in a block. A separately reusable component should allocate once at its own rendering boundary, then pass the namespace to every section/partial that creates IDs or references:

```html
<f:variable name="ids" value="{ax:occurrence(prefix: 'example')}" />
<button type="button" aria-controls="{ids.namespace}-panel">…</button>
<div id="{ids.namespace}-panel">…</div>
```

Use the same value for `id`, `for`, ARIA references, same-document fragment links and native group names. Do not allocate independently for a control and its target. Native core render helpers already propagate the request; adapters rendering outside the frontend middleware must attach one shared `OccurrenceIdentifiers` object to their request before cloning it. Standalone Fluid rendering has a WeakMap fallback scoped to its request or rendering context, without retaining state across HTTP requests.

Authored HTML and external plugins own their IDs and references. Astryx preserves these values, including intentional external fragment destinations. Plugin adapters can use `ax:occurrence` or the request allocator when they control both ends of a reference. Independently cached HTML fragments must preserve a common allocation contract; copying already-rendered HTML bypasses the rendering boundary.

For post-sanitization/plugin diagnostics, run from the consuming project root:

```sh
ASTRYX_TEST_URL=https://your-site.example/page node packages/typo3_astryx/Tests/Browser/identifier-diagnostics.mjs
```

The read-only Playwright diagnostic reports duplicate/empty IDs and missing or ambiguous `aria-controls`, `aria-labelledby`, `aria-describedby`, `aria-owns`, `aria-activedescendant`, `for`, `list`, `headers` and same-document fragment targets. Reports include the nearest record anchor, CType and occurrence where available. It exits unsuccessfully when issues exist and never rewrites the document. Fix authored IDs in the content or plugin adapter after checking whether external links intentionally depend on them.

## Regression fixture

`Tests/Fixtures/identifiers.php` refuses to run outside the isolated `astryx-fixture` project. It creates a dedicated page with original-plus-shortcut content, all six container variants repeated through shortcuts, and nested single-column shortcuts. Each source record renders 14 times. The dedicated page overrides Development mode’s `config.no_cache` setting to enable the server page cache without changing other pages. Its page-specific template repeats Header, Language Menu and TreeList and feeds Main Menu the same page in two branches. IDs are saved privately in `var/identifiers-fixture.json`.

`Tests/Browser/identifiers.mjs` exercises the real TYPO3 response and warm page cache in Chromium/WebKit, packaged/Vite assets, desktop/mobile and JavaScript/native modes. It checks unique IDs, resolved references, canonical/occurrence fragments, independent Accordion/TreeList/Carousel/Gallery/mobile-dialog state, keyboard operation, native Accordion grouping and external-output diagnostics. See [Build.md](Build.md) for commands. This focused regression does not certify arbitrary plugin or authored HTML semantics.
