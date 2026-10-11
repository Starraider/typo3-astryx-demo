# Build, deployment and debugging


Run Node commands from the Composer project root. Required build inputs are StyleX 0.19.1, its unplugin, Vite 7.3, Babel parser, Highlight.js 11.12, and the locked StyleX Connector source. The extension does not have a second node_modules installation.

Store every block-owned style source in `ContentBlocks/ContentElements/<block-name>/src/`, including StyleX recipes and supporting CSS. Keep recipes shared by multiple independent blocks (including AstryxGrid), shared native-component recipes, tokens and themes under `Resources/Private/JavaScript/Stylex/`, and shared supporting CSS under `Resources/Private/CSS/`. Block `assets/` is publicly published; do not put compiler inputs there. The `src/` directory is a project convention, not automatic Content Blocks asset discovery.

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

The page tree must include a third-level branch. The suite also verifies 4px panel padding, 32px desktop rows, width changes with longer titles, independent side fly-outs, pointer/arrow activation, edge flipping and nested mobile/native disclosures. Repeat with `ASTRYX_NAVIGATION_ASSETS=packaged` and a separate `ASTRYX_TEST_OUTPUT` directory to substitute the current packaged CSS/JS into the actual TYPO3 response at its published URLs. This leaves site records/settings unchanged. The default checks the consuming Vite assets. Use a site currently serving production Vite bundles for this substitution.

Language-menu checks require the header language selector and configured flags for the site's enabled languages. They verify shared compact spacing, 32px desktop/44px mobile rows, label-sized panels, loaded circular 20px flags, current-language state, viewport containment, Escape focus recovery and native mobile disclosure without JavaScript. Screenshots include `*-language-desktop.png`, `*-language-mobile.png` and `*-language-mobile-no-js.png`.

The backend browser check uses a disposable administrator created by `Tests/Fixtures/backend-user.php`. Copy its private `var/backend-fixture.json` to `/tmp/astryx-backend-fixture.json` with mode 0600 before running `Tests/Browser/backend.mjs` from the integration project. Keep those credentials outside Git and the archive; disable the test administrator after use.

Assemble the archive from the project root with `python3 packages/typo3_astryx/Build/package.py`. This verifies packaged CSS checksums, embeds the RC version in the archive's Composer metadata and writes a SHA-256 sidecar. Packaging excludes Tests, private data, dependencies and temporary artifacts.

Notice icon regression (read-only; no content records are created):

```sh
ddev exec php packages/typo3_astryx/Tests/Functional/notice.php
```

Checks the backend choices, distinct SVG geometry and preview parity for Check, Warning, Error and Information, decorative accessibility, visible status labels, escaping, and empty/unknown stored values.

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

This checks all installed Astryx CTypes and retained core renderers, the core Alignment/Link fields, four alignment choices, TYPO3 link resolution and target/title options, hidden/empty headings, semantic levels and escaped text. It also renders 33 native/scalar-partial cases for absent/empty/whitespace text, empty/conditional/whitespace slots, composed markup, additive text, `0`, subtitle-only output, linked slots and all levels/fallback. Chromium/WebKit verify physical left/center/right alignment in LTR/RTL at desktop/mobile widths, subheader alignment, theme link colors and keyboard focus with both packaged and consuming Vite CSS. They check native heading presence and nonempty text, plus no-JavaScript/reduced-motion output. Set `ASTRYX_HEADING_HTML`, `ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS` or `ASTRYX_TEST_OUTPUT` to override defaults. The final live-page smoke check uses the site root; set `ASTRYX_HEADING_PAGE` to another path with a heading.


Carousel pagination regression (read-only; no content records are created):

```sh
ddev exec php packages/typo3_astryx/Tests/Functional/carousel.php --html > /tmp/astryx-carousel-fixtures.html
node packages/typo3_astryx/Tests/Browser/carousel.mjs
```

The functional check compiles the actual new-record backend form, validates the six translated position choices and bottom-center default, and renders frontend/backend templates. Chromium/WebKit check all positions and fallback values with packaged and consuming Vite CSS/JS (including extracted shared StyleX CSS), desktop/mobile, LTR/RTL, keyboard activation, native scrolling, the terminal page, resize/all-fit behavior, six theme/color combinations, accessibility, reduced motion and no-JavaScript readability. Override `ASTRYX_CAROUSEL_HTML`, `ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS` or `ASTRYX_TEST_OUTPUT` as needed. Evidence defaults to `/tmp/astryx-carousel-evidence`.


Image Only regression (read-only; no content records are created):

```sh
ddev exec php packages/typo3_astryx/Tests/Functional/image-only.php --html > /tmp/astryx-image-only-fixtures.html
node packages/typo3_astryx/Tests/Browser/image-only.mjs
```

This compiles the editor form, verifies multiple-image FAL configuration, six column choices, four ratio choices and defaults, and renders real frontend/backend Fluid with existing image references. Generated field mapping is checked through Content Blocks record processing; existing core image relations are also resolved when the site has them. Chromium/WebKit verify all column/ratio combinations and fallbacks, six images in two rows of three, incomplete rows, original proportions, fixed crops, caption wrapping, row alignment and 16px gaps with packaged and consuming Vite CSS at desktop/mobile widths, with JavaScript disabled and reduced motion enabled. Override `ASTRYX_IMAGE_ONLY_HTML`, `ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS` or `ASTRYX_TEST_OUTPUT` as needed. Evidence defaults to `/tmp/astryx-image-only-evidence`.

Subpages SideNav regression (read-only):

```sh
ddev exec php packages/typo3_astryx/Tests/Functional/subpages.php --html > /tmp/astryx-subpages-fixtures.html
node packages/typo3_astryx/Tests/Browser/subpages.mjs
```

Checks real Fluid links, current/active states, escaping and targets. Chromium/WebKit verify both asset pipelines at desktop/mobile widths in light/dark modes, full container width, long-label wrapping, hover/pressed/selected backgrounds and keyboard focus. The live `/code/menues` smoke check uses the installed Subpages record, without JavaScript and with reduced motion. Set `ASTRYX_TEST_URL`, `ASTRYX_SUBPAGES_HTML`, `ASTRYX_TEST_BROWSERS` or `ASTRYX_TEST_OUTPUT` to override defaults; screenshots and the report default to `/tmp/astryx-subpages-evidence`.

Selected-pages menu regression:

```sh
# Read-only editor-form check, from the integration project root.
ddev exec php packages/typo3_astryx/Tests/Functional/selected-pages.php

# Only in the isolated astryx-fixture project, with the current extension installed.
ddev exec php packages/typo3_astryx/Tests/Fixtures/selected-pages.php
ddev exec vendor/bin/typo3 cache:flush

# Back in the integration project root, using its Playwright installation.
node packages/typo3_astryx/Tests/Browser/selected-pages.mjs
```

The fixture must load the current extension source through its Composer path repository, or a current release archive; an older installed archive does not pick up edits to the fixture's `packages/` directory. The fixture script creates only a dedicated test subtree and records its IDs in private `var/selected-pages-fixture.json`. The backend form check verifies the ordered multi-page picker, page browser, English/German labels and icon. Chromium/WebKit verify actual TYPO3-rendered selection order, visibility/access filtering, empty selections, link targets, current-page state, translated titles/links, identical Subpages link markup/classes, desktop/mobile sizing, wrapping and keyboard focus without JavaScript and with reduced motion. Override `ASTRYX_SELECTED_PAGES_FIXTURE` for another ID file; `ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS` and `ASTRYX_TEST_OUTPUT` configure the browser run. Evidence defaults to `/tmp/astryx-selected-pages-evidence`.


Container variants regression:

```sh
# Integration project (read-only editor form/TCA checks).
ddev exec php packages/typo3_astryx/Tests/Functional/containers.php
# Isolated astryx-fixture project only, with the current extension installed.
ddev exec vendor/bin/typo3 cache:flush
ddev exec vendor/bin/typo3 extension:setup
ddev exec php packages/typo3_astryx/Tests/Fixtures/containers.php
ddev exec vendor/bin/typo3 cache:flush
ddev exec php packages/typo3_astryx/Tests/Functional/container-lifecycle.php --all-variants
# Back in the integration project.
node packages/typo3_astryx/Tests/Browser/containers.mjs
```

The dedicated fixture page has all five containers and gap choices, both saved legacy ratios and nested two-/three-column containers. Chromium/WebKit check actual TYPO3-rendered children, width ratios, nested content-width stacking, desktop/mobile reflow, keyboard order and no-JavaScript behavior with reduced motion. The packaged path uses the fixture's emitted assets; the Vite check serves the integration project's current CSS at same-origin fixture URLs to preserve TYPO3's Content Security Policy. Override `ASTRYX_TEST_URL`, `ASTRYX_VITE_ASSET_URL`, `ASTRYX_CONTAINERS_FIXTURE`, `ASTRYX_TEST_BROWSERS` or `ASTRYX_TEST_OUTPUT` as needed. Evidence defaults to `/tmp/astryx-containers-evidence`.

## Single-column container checks

```sh
# Integration project: read-only editor forms, labels, FAL and preview checks.
ddev exec php packages/typo3_astryx/Tests/Functional/single-column.php
# Isolated astryx-fixture project, with the current extension source and assets.
ddev exec vendor/bin/typo3 cache:flush
ddev exec vendor/bin/typo3 extension:setup
ddev exec php packages/typo3_astryx/Tests/Fixtures/single-column.php
ddev exec vendor/bin/typo3 cache:flush
ddev exec php packages/typo3_astryx/Tests/Functional/container-lifecycle.php --single-column
# Integration project: real TYPO3-rendered page, using both asset pipelines.
node packages/typo3_astryx/Tests/Browser/single-column.mjs
```

The dedicated fixture page covers Light/Dark, content/full viewport width, with/without a FAL image, invalid-value fallbacks and a nested full-bleed container. Chromium/WebKit check child rendering exactly once, background viewport edges, child content aligned to the normal and overridden site content widths, responsive cover images that grow with content, inherited page text palettes, ordered lighter/darker section shades with readable text contrast and a fine outline in all three themes and both page modes, desktop/mobile, keyboard navigation, reduced motion and no-JavaScript centered breakouts. JavaScript additionally aligns off-center nested full-bleed sections. `ASTRYX_SINGLE_COLUMN_FIXTURE`, `ASTRYX_TEST_URL`, `ASTRYX_VITE_ASSET_URL`, `ASTRYX_TEST_BROWSERS` and `ASTRYX_TEST_OUTPUT` override the defaults; evidence is saved in `/tmp/astryx-single-column-evidence`.

## Sitemap TreeList checks

After the full production build, run these from the integration project root:

```bash
ddev exec php packages/typo3_astryx/Tests/Functional/sitemap.php
ddev exec php packages/typo3_astryx/Tests/Functional/sitemap.php --html > /tmp/astryx-sitemap-fixtures.html
ddev exec vendor/bin/typo3 cache:flush
node packages/typo3_astryx/Tests/Browser/sitemap.mjs
```

The PHP check renders four nested levels, multiple components and an empty tree using native Fluid, verifies branch/label IDs, escaped titles, translated controls and TYPO3 link targets, and produces the read-only browser fixture with `--html`. Regenerate that HTML after every build that changes StyleX classes. No database fixture construction is required.

The Chromium/WebKit suite checks the actual `/sitemap` page, production Vite assets, no-JavaScript output, reduced motion, keyboard expansion and axe accessibility. It also loads the Fluid fixture with consuming and packaged bundles at desktop/mobile widths in Neutral/Stone/Ocean light/dark modes; checks guide/leaf alignment, long titles, four-level navigation, roving focus, type-ahead, collapse focus recovery, independent trees, RTL and link targets. Override `ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS`, `ASTRYX_SITEMAP_HTML` or `ASTRYX_TEST_OUTPUT` as needed. Evidence defaults to `/tmp/astryx-sitemap-evidence`.

### Stone reference parity

After token or typography changes, regenerate the theme bridge before the full production build:

```sh
ddev exec node packages/typo3_astryx/Build/generate-theme-bridge.mjs
ddev exec npm run build
ddev exec vendor/bin/typo3 cache:flush
ddev exec php packages/typo3_astryx/Tests/Functional/theme.php
ddev exec cat /tmp/astryx-theme-fixtures.html > /tmp/astryx-theme-fixtures.html
node packages/typo3_astryx/Tests/Browser/stone-theme.mjs
```

The read-only fixture renders native Fluid components without creating records. Chromium/WebKit compare typography, colors, buttons, badges, cards, notices and syntax against values measured on the v0.6.7 Stone reference, including packaged/Vite CSS, RTE/preview styles, desktop/mobile, light/dark and nested Neutral/Stone boundaries. Bundled fonts must load successfully. Live TYPO3 pages are checked with a response-only Stone boundary; database theme settings are not changed. `ASTRYX_THEME_HTML`, `ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS` and `ASTRYX_TEST_OUTPUT` override defaults. Evidence defaults to `/tmp/astryx-stone-evidence`. Font origins/checksums are recorded in `Build/stone-fonts.json`; OFL licenses are in `Resources/Private/Fonts/`.

The heading-weight checks expect the local Stone adaptation of 400 for H1–H6. Recorded results and scope: [Stone reference validation](StoneTheme.md).

## Button and Hero contrast regressions

Run the read-only Fluid/FAL fixture and focused browser matrix from the consuming project root after rebuilding both asset pipelines:

```sh
ddev exec php packages/typo3_astryx/Tests/Functional/contrast.php --html > /tmp/astryx-contrast-fixtures.html
node packages/typo3_astryx/Tests/Browser/contrast.mjs
```

The fixture requires one existing FAL image reference; it overrides metadata only in memory and creates no CMS records. Its limited `parseFunc_RTE` setup exercises paragraph, inline-link and supporting-text rendering. Chromium/WebKit load the actual packaged/Vite CSS and JavaScript, including Vite's extracted shared StyleX stylesheet. Response-only solid white/black and busy image pixels replace the fixture image; FAL markup and captions remain intact. All three themes and modes cover destructive actions/links at every size in normal/hover/focus, disabled behavior separately, and nested theme/mode boundaries. Hero checks cover Neutral/Accent variants, four aspect presets, alignment choices, secondary text, links, CTAs, 54% transparent panels/captions, image-aware alpha-composited contrast and focus protection, 390px/240px viewports with actual font sizes doubled and text spacing, plus no-JavaScript/reduced-motion fallback.

`ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS`, `ASTRYX_CONTRAST_HTML` and `ASTRYX_TEST_OUTPUT` override defaults. JSON and screenshots default to `/tmp/astryx-contrast-evidence`; the retained audit follow-up records the measured palette pairs. Shared Button label reflow remains a separate P2 task.

## Gallery contrast regression

After rebuilding both asset pipelines, run from the consuming project root:

```sh
ddev exec php packages/typo3_astryx/Tests/Functional/classic-gallery.php --html > /tmp/astryx-gallery-fixtures.html
node packages/typo3_astryx/Tests/Browser/gallery.mjs
```

The read-only fixture uses existing FAL references without creating records. Chromium/WebKit test packaged/Vite assets, all three themes in light/dark modes, 1100px/390px viewports and white/black/busy image pixels. Browser-only image/description substitutions exercise worst-case alpha-composited caption/counter and enabled icon/control-focus contrast, adjacent photo-focus rings, caption placement and keyboard scrolling, modal Tab/Shift+Tab, arrow navigation, Escape and opener focus return. Live `/ueber-uns/gallery` checks emitted assets and open/Escape behavior; no-JavaScript/reduced-motion checks retain original-file links and thumbnail focus. Chromium also emulates light/dark forced colors. This does not establish a real Windows high-contrast or assistive-technology session.

`ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS`, `ASTRYX_GALLERY_HTML` and `ASTRYX_TEST_OUTPUT` override defaults. JSON and synthetic-image screenshots default to `/tmp/astryx-gallery-evidence`. See [P1-04 validation](ComponentAudit/GalleryContrastFix.md).


Occurrence identifier regression:

```sh
# Read-only allocator/request-clone checks, in the integration project.
ddev exec php packages/typo3_astryx/Tests/Unit/occurrence-identifiers.php
# Isolated astryx-fixture only, using the current extension source.
ddev exec vendor/bin/typo3 cache:flush
ddev exec php packages/typo3_astryx/Tests/Fixtures/identifiers.php
ddev exec vendor/bin/typo3 cache:flush
# Back in the integration project, using its Playwright dependencies.
node packages/typo3_astryx/Tests/Browser/identifiers.mjs
```

This uses actual TYPO3 rendering and warm page-cache responses for originals, shortcuts, all six repeated container variants and nested lazy areas. Chromium/WebKit check both asset pipelines at 1440/390px, with JavaScript enabled/disabled and reduced motion. Override `ASTRYX_TEST_URL`, `ASTRYX_VITE_ASSET_URL`, `ASTRYX_IDENTIFIERS_FIXTURE`, `ASTRYX_TEST_BROWSERS` or `ASTRYX_TEST_OUTPUT` as needed. Screenshots and JSON evidence default to `/tmp/astryx-identifiers-evidence`. The fixture stores record IDs privately in `var/identifiers-fixture.json`; its page-specific template is excluded from releases with the other tests. See [OccurrenceIdentifiers.md](OccurrenceIdentifiers.md) for the public contract and the independent read-only authored/plugin diagnostic.


Responsive image slot regression (P2-07):

```sh
# Integration project, read-only existing FAL references and actual TYPO3 Fluid rendering.
ddev exec php packages/typo3_astryx/Tests/Functional/responsive-images.php --html > /tmp/astryx-responsive-images-fixtures.html
node packages/typo3_astryx/Tests/Browser/responsive-images.mjs
```

The functional check renders 38 consumers: three Card variants, all Card Grid column/gap choices and a single item, Carousel, one–six-column Gallery and Image Only (plus invalid Image Only fallback), ten Textmedia orientations and its assets-image path. It checks explicit/empty sizes, eager/lazy propagation, the Card slot, FAL metadata and escaped captions. Chromium/WebKit measure actual slots, selected srcset widths and image response-body bytes with packaged/consuming Vite CSS, desktop/mobile/nested hosts and DPR 1/2. Lazy loading stays enabled during measurement; per-consumer query strings avoid reuse of another consumer's cached larger candidate. Additional resolution checks cover Neutral/Stone/Ocean in light/dark modes. The cold-request comparison covers the old/new sizes contract and no-JavaScript output in Stone dark mode; live `/code/images` checks verify loaded assets. Byte counts are response-body sizes, not total network transfer including headers. No-JavaScript rendering can fetch a fallback before layout and a second `auto` candidate; its byte reduction is not asserted. Set `ASTRYX_RESPONSIVE_IMAGES_HTML`, `ASTRYX_RESPONSIVE_IMAGES_PAGE`, `ASTRYX_TEST_URL`, `ASTRYX_TEST_BROWSERS` or `ASTRYX_TEST_OUTPUT` to override defaults; evidence defaults to `/tmp/astryx-responsive-images-evidence`. `ASTRYX_RESPONSIVE_IMAGES_COMPARISON_ONLY=1` runs just the comparison, theme and live-page checks, retaining any earlier matrix report.
