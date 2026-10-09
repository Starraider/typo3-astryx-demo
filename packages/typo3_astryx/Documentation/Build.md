# Build, deployment and debugging

Run Node commands from the Composer project root. Required build inputs are StyleX 0.19.1, its unplugin, Vite 7.3, Babel parser, Highlight.js 11.12, and the locked StyleX Connector source. The extension does not have a second node_modules installation.

Store every block-owned style source in `ContentBlocks/ContentElements/<block-name>/src/`, including StyleX recipes and supporting CSS. Keep shared native-component recipes, tokens and themes under `Resources/Private/JavaScript/Stylex/`, and shared supporting CSS under `Resources/Private/CSS/`. Block `assets/` is publicly published; do not put compiler inputs there. The `src/` directory is a project convention, not automatic Content Blocks asset discovery.

Import frontend block recipes from `Resources/Private/JavaScript/Main.entry.js` and frontend block CSS from the shared `main.css` aggregator. Import block preview CSS from `preview.entry.css`; preview-specific styles stay in the owning block's `src/preview.css`. All sources still compile through the same Vite pipeline into extension-wide bundles and one StyleX manifest. Use unique StyleX basenames to retain unambiguous aliases. Moving a recipe changes its canonical path-based manifest keys; rebuild and verify aliases/consumers. `Build/verify-style-ownership.mjs`, included in artifact verification, checks source placement, basename uniqueness and entrypoint reachability.

```sh
node packages/typo3_astryx/Build/generate-theme-bridge.mjs
npx vite build --config packages/typo3_astryx/Build/vite.config.mjs
node packages/typo3_astryx/Build/finalize-assets.mjs
node packages/typo3_astryx/Build/verify-artifacts.mjs
```

The bridge reads static StyleX token/theme sources. It regenerates `themes.css` and `Build/theme-tokens.json`. Change the JavaScript sources, not generated CSS or manifests.
The production build preserves StyleX priority layers. Finalization creates portable Assets/astryx.css and editor stylesheets, then pairs their SHA-256 checksums with the StyleX manifest. The verifier checks all finite keys/selectors, tokens, editor CSS, asset existence, portable paths and absence of a React/development runtime.
Build/use Vite locally with one `vite:asset` call in the rendered shell, `Astryx.useVite: true`, and the extension's ViteEntrypoints.json. Load virtual StyleX CSS once after module imports in development. Site product CSS/JS uses its own entrypoint and must not re-import the extension sources. The integration’s manifest adapters run only during production builds: a lazy Vite development transform must not overwrite the complete PHP/release manifests.

When the rendered page loads `public/_assets/vite` bundles, run `npm run build` from the Composer project root after CSS, JavaScript or recipe changes. This refreshes both the consuming project's assets and the extension's packaged assets. `npm run build:astryx` and the package commands above update only the extension's packaged assets; they do not update the bundles loaded by `vite:asset`. With an active development server, ordinary CSS/JavaScript edits can update through Vite. Verify the asset URLs actually emitted on the page to determine which mode is in use.

Deploy the extension, frontend Assets, backend Css, StylexManifest and the consuming Vite manifest/assets as one versioned unit. Use a staged release directory and switch atomically. Flush TYPO3 caches when generated class names or template/settings output changes. Retain the previous matching unit for rollback.
A package archive must not depend on the integration site's public/_assets/vite path. Packaged manifest artifact paths stay under extension Resources/Public. Native Asset Collector publishes them with cache-busting timestamps.

For missing styles, run `stylex:validate --required-key=AstryxButton.root` and the artifact verifier. Check that the chosen asset path returns CSS and that the manifest's key has a selector in that CSS. A successful HTTP response with empty CSS is insufficient.
For missing rendering, check lowercase Content Block template names and active Site Set paths, then run content-blocks:lint and cache:flush. Do not replace lib.contentBlock's upstream processor. For plugins, retain `tt_content.<signature>.20` and the Generic template contract.
RTE and previews use scoped CSS in .ck-content/.astryx-preview; backend chrome is outside the reset. Frontend controllers are not loaded in previews.

## Test runbook

The integration project provides `npm run build`, `npm run build:astryx` and `npm run test:astryx`. The isolated `var/astryx-fixture` restores the starter database/FAL backup and installs Astryx without FSC. Use a DDEV project named `astryx-fixture`; destructive fixture scripts refuse other names. Run from that fixture root:

```sh
vendor/bin/typo3 cache:flush
vendor/bin/typo3 extension:setup
php packages/typo3_astryx/Tests/Fixtures/provision.php
php packages/typo3_astryx/Tests/Fixtures/enrich.php
php packages/typo3_astryx/Tests/Functional/parse-fluid.php
php packages/typo3_astryx/Tests/Functional/page-tsconfig.php 1
php packages/typo3_astryx/Tests/Functional/collection-schema.php
php packages/typo3_astryx/Tests/Functional/container-lifecycle.php
```

`records.php` requires a second site language with ID 1; its `--workspace` mode also requires EXT:workspaces. `permissions.php` constructs a restricted editor and checks permitted and denied DataHandler edits. Fixture credentials/content are not packaged. Browser tests use `ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS` and `ASTRYX_TEST_OUTPUT` overrides and save screenshots and JSON results.

Run the header navigation regression against a site with a submenu, sufficient content to scroll, and the default enabled theme switcher and sticky header:

```sh
ASTRYX_TEST_URL=https://typo3-astryx.ddev.site ASTRYX_TEST_BROWSERS=chromium,webkit node packages/typo3_astryx/Tests/Browser/navigation.mjs
```

This checks dropdown keyboard and dismissal behavior, sticky positioning, saved color mode, active/current links, mobile dialog focus and resize, navigation without JavaScript, failed assets and header accessibility. It writes screenshots and a JSON report to `/tmp/astryx-navigation-evidence` by default. The browser override excludes Firefox on macOS hosts affected by the existing profile-folder launch failure.

The backend browser check uses a disposable administrator created by `Tests/Fixtures/backend-user.php`. Copy its private `var/backend-fixture.json` to `/tmp/astryx-backend-fixture.json` with mode 0600 before running `Tests/Browser/backend.mjs` from the integration project. Keep those credentials outside Git and the archive; disable the test administrator after use.

Assemble the archive from the project root with `python3 packages/typo3_astryx/Build/package.py`. This verifies packaged CSS checksums, embeds the RC version in the archive's Composer metadata and writes a SHA-256 sidecar. Packaging excludes Tests, private data, dependencies and temporary artifacts.

Code Block regression (read-only; no content records are created):

```sh
ddev exec php packages/typo3_astryx/Tests/Functional/code-block.php --html > /tmp/astryx-code-block-fixtures.html
node packages/typo3_astryx/Tests/Browser/code-block.mjs
```

The browser check verifies packaged and consuming Vite bundles in Chromium and WebKit, all language choices, clipboard contents, denied-clipboard fallback and failure feedback, six theme/color combinations, mobile overflow and readable no-JavaScript output. Set `ASTRYX_CODE_BLOCK_HTML`, `ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS` or `ASTRYX_TEST_OUTPUT` to override its defaults. Keep the generated `code-highlighter-*.js` chunk alongside the main script when deploying.

Content spacing regression (read-only; no content records are created):

```sh
ddev exec php packages/typo3_astryx/Tests/Functional/spacing.php --html > /tmp/astryx-spacing-fixtures.html
node packages/typo3_astryx/Tests/Browser/spacing.mjs
```

This checks the Appearance tab and core selectors for all Astryx CTypes, real TYPO3/Content Blocks record transformation, all 36 before/after combinations, Default/Medium equivalence, and computed margins in Chromium and WebKit at desktop/mobile widths with packaged and consuming Vite CSS. Set `ASTRYX_SPACING_HTML`, `ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS` or `ASTRYX_TEST_OUTPUT` to override the defaults.

Run `node packages/typo3_astryx/Tests/Browser/heading-spacing.mjs` to check heading/subheader/body spacing using actual Heading and text-only Textmedia markup from `/page-2`. Override `ASTRYX_TEST_URL` for another page with both elements. Chromium/WebKit check both CSS bundles at desktop/mobile widths, with and without a subheader, zero heading/subheader margins, an 8px body gap, and full-width text without an empty media slot. Consuming Vite checks include its extracted shared StyleX stylesheet.

Heading alignment and link regression (read-only; no content records are created):

```sh
ddev exec php packages/typo3_astryx/Tests/Functional/heading-backend.php
ddev exec php packages/typo3_astryx/Tests/Functional/heading.php --html > /tmp/astryx-heading-fixtures.html
node packages/typo3_astryx/Tests/Browser/heading.mjs
```

This checks all 20 CTypes, the core Alignment/Link fields, four alignment choices, TYPO3 link resolution and target/title options, hidden/empty headings, semantic levels and escaped text. Chromium/WebKit verify physical left/center/right alignment in LTR/RTL at desktop/mobile widths, subheader alignment, theme link colors and keyboard focus with both packaged and consuming Vite CSS. Set `ASTRYX_HEADING_HTML`, `ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS` or `ASTRYX_TEST_OUTPUT` to override defaults.
