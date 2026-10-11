# Validation record

Updated 5 October 2026 for 0.1.0-rc.2. This is a development release candidate. Implementation and verified behavior are distinguished from outstanding release gates below.

## Dependency and source baseline

TYPO3 14.3.7, Fluid 5.3.2, PHP 8.3.30 in DDEV and 8.4.5 on the host, Content Blocks 2.4.10, container 4.1.0, Vite 7.3.6 and StyleX 0.19.1. StyleX Connector uses the pinned dev-main commit recorded in the consuming Composer lock. Official Astryx core/Neutral/Stone 0.6.5 provenance, integrity and license records are in Build/upstream-versions.json and THIRD_PARTY_NOTICES.md; Ocean is a documented local adaptation.

## Completed checks

| Area | Recorded result |
| --- | --- |
| Metadata | Strict Composer validation passes; versioned archive excludes dependencies, private data and tests |
| PHP | Syntax validation and PHPStan level 5 pass for the extension classes |
| Database schema | RC.2 explicitly defines uid and its primary key for all six collections. The regression fails against the previous SQL, passes fresh temporary-table creation and auto-increment inserts, and confirms no pending Astryx additions/changes in TYPO3. Existing starter content, pages, FAL and collection records match the private pre-repair backup |
| Definitions | All 14 Content Blocks pass schema lint; 24 YAML and 16 XLIFF documents parse; starter XML parses |
| Backend configuration | Resolved Page TSconfig preserves Default (1/0), Sidebar (1/0/2) and AppShell (1/3/0/2) columns and activates the Astryx RTE preset; malformed inline Default-row syntax was corrected |
| Fluid | All 71 component, frontend, page and preview templates parse with the installed TYPO3/Fluid rendering context |
| StyleX | Development-server startup no longer overwrites release manifests; packaging rejects incomplete recipes/artifacts. Ten finite recipes, 126 canonical/alias style entries and five paired CSS artifacts pass checks; consuming Vite CSS contains the same recipe selectors |
| Source rebuild | Extracted sources rebuilt separately; all ten recipes, 126 keys, public tokens and five artifact checks pass |
| Tokens | Public tokens, full theme boundaries, priority1–priority5 layers and independent editor token/prose CSS are present |
| Browser | Chromium 153.0.8010.12 and WebKit 26.6 pass populated catalogue, mobile/no-JS navigation, accordion, carousel, region preservation and form submission checks |
| Accessibility | Automated WCAG 2/2.1/2.2 A/AA tagged scans report zero violations on the populated fixture; this does not replace manual accessibility review |
| Themes | Both tested engines produce the expected distinct light/dark values for Neutral, Stone and Ocean; nested theme boundaries override their parent |
| FAL | Real image and download references render with preserved alternatives/captions; image srcsets and intrinsic dimensions are emitted |
| Containers | DataHandler copy/paste includes both children; column and page moves, deletion and grouped restoration pass; frontend children render once |
| Localization | German page, accordion/card-grid collection and container-child localization passes through DataHandler |
| Workspaces | Draft edits of content and accordion items create draft versions while preserving live values |
| Permissions | A non-admin editor can save allowed content within its page mount; edits outside the mount are denied |
| Plugins | Dedicated felogin markup and the dedicated Form CType render without FSC; Form submission reaches its confirmation finisher |
| Starter | Built frontend assets return HTTP 200, expected logo sizing, zero browser script errors and zero failed assets |
| Migration | The starter's 12 text/textpic records and inherited subpage layout migrate through DataHandler; two menu records are retained; second dry run proposes no changes |
| Build size | Packaged frontend CSS: 32,069 bytes (about 6.06 kB gzip); frontend JavaScript: 4,588 bytes (about 1.74 kB gzip); no React runtime |

Original database and FAL backups and the migration before-state report are retained privately under the integration project's var/backups. Source browser reports and screenshots are under var/validation and the local browser evidence directory. These are excluded from the release package.

## Package verification

The reproducible archive embeds the RC version and includes portable prebuilt frontend/editor CSS, JavaScript and manifest checksums. Artifact paths are restricted to Resources/Public and do not point at the starter's public/_assets/vite directory. Composer installs 0.1.0-rc.1 from the ZIP into vendor/skom/typo3-astryx as an extracted directory. The consumer has no Node build and uses the packaged delivery path. Chromium and WebKit pass the same catalogue, form, no-JS and accessibility checks there, plus the custom brand example and German card-grid rendering. The release archive has explicit directory permissions and a SHA-256 sidecar. Final documentation/build-only updates preserve the 185 runtime files tested from the installed ZIP; the subsequent Default Page TSconfig correction was separately validated against TYPO3’s resolved configuration.

## Outstanding release gates

- Firefox 155 cannot start on this macOS host: Playwright reports that its temporary profile folder cannot be found. Selected minimum browser versions remain unverified.
- Manual Page Module drag/drop, CKEditor save/reload and preview appearance, full keyboard/screen-reader review, forced-colors, 200%/400% browser zoom and touch-device testing remain unverified.
- Actual backend workspace preview and deployed frontend cache invalidation after theme/child/asset changes remain unverified; the record and cache-tag implementation has functional coverage but is not a substitute for those scenarios.
- A clean starter XML import and a full source/Composer/database/FAL rollback rehearsal remain unverified. Backup restoration and the controlled migration were exercised in the isolated fixture.
- Local video/poster rendering, failed-media edge cases, repeated/empty interactive instances and every appearance preset still need the full visual acceptance matrix.
- The connector's development dependency remains a release constraint. Its Site Set emits TypoScript condition warnings when TYPO3 converts false boolean settings to empty constants; rendered Astryx assets remain functional. This upstream condition handling and a stable connector constraint need resolution before a stable release.

Restore a deleted container and its children together in the Recycler. The tested b13/container version deletes children with their parent but does not automatically restore them when only the parent is restored. Hero video, decorative/autoplay video and a lightbox are outside the initial media contract.

## Header navigation checks, 5 October 2026

The sticky header, parent links and dropdown submenus, desktop keyboard dismissal, mobile dialog focus and resize, saved System/Light/Dark mode and navigation without JavaScript pass in Chromium and WebKit on the integration site. Header-only WCAG A/AA scans report zero violations. There are no browser script errors or failed local assets in those flows. The root and packaged asset builds and artifact verification pass; all 70 Fluid templates parse.

Temporary site overrides confirm that the theme switcher and language menu can be disabled, disabled user mode ignores saved browser preferences, and header pinning can be disabled. A temporary second site language confirms the active-language label and link, disabled missing translations, language dropdown keyboard behavior, dark appearance and exclusion of disabled languages. The original site configuration was restored. Switching remains functional when localStorage access fails. The existing Firefox profile-folder launch error persists, including with `/tmp` as its temporary directory.

The reproducible navigation test is `Tests/Browser/navigation.mjs`; its screenshots and report are outside the repository in `/tmp/astryx-navigation-evidence`.

## Icon theme toggle checks, 5 October 2026

The text selector is replaced by a standalone icon-only button matching the moon/sun toggle in the Astryx documentation header. Chromium and WebKit pass native Enter/Space activation, translated action labels, icon visibility, a 44px click target, saved light/dark preferences, system-preference changes and explicit override precedence. Header scans in light and dark report zero WCAG A/AA violations. Invalid stored values and disabled storage retain working in-page switching. The navigation regression also passes desktop/mobile interactions and hides the unavailable toggle without JavaScript. Disabling `Astryx.allowUserMode` removes the button and ignores saved preferences. Both asset builds pass and all 71 Fluid templates parse.

## Textmedia orientation checks, 5 October 2026

The actual Fluid template passes all ten core `imageorient` values and the unknown-value fallback. Chromium and WebKit verify above/below placement, left/center/right alignment, text wrapping versus separate columns, and stacking within 1120px and 480px content containers. Two images per element render once and retain their sequence; position styles apply to the media wrapper rather than nested figures. Existing FAL images render on the integration site, with no script errors or failed local assets. Content Blocks lint, PHP syntax, Fluid parsing and both asset builds pass.

Run the regression from the consuming project root:

```sh
ddev exec php packages/typo3_astryx/Tests/Functional/textmedia-orientation.php --html > /tmp/astryx-textmedia-orientations.html
node packages/typo3_astryx/Tests/Browser/textmedia-orientation.mjs
```

Set `ASTRYX_TEST_URL` to a page containing Textmedia with an image when using another integration site. The tests do not change database records. Screenshots and the browser report are written to `/tmp/astryx-textmedia-evidence`.

## Code Block checks, 9 October 2026

Content Blocks lint, extension setup, all Fluid templates and both production asset builds pass. Read-only rendering verifies the registered TCA, all eleven language choices, optional filenames, exact code whitespace, escaped snippets/filenames, English/German frontend labels and escaped backend previews. Chromium and WebKit pass with packaged and consuming Vite assets: syntax highlighting, exact clipboard contents (real Clipboard API in Chromium), keyboard copying, denied-clipboard fallback, failure feedback, focus restoration, six theme/color combinations, mobile scrolling, readable no-JavaScript output and no asset/script errors. Syntax grammars load once on snippet pages and are absent on pages without code. The dedicated regression commands are in the build runbook.

## Content spacing checks, 9 October 2026

All 16 Content Blocks pass lint after adding the shared spacing Basic; extension setup and both production asset builds pass. All 75 Fluid templates parse. Read-only checks confirm exactly one Appearance tab containing the two core spacing selectors for all 20 extension CTypes, the six original core options/defaults, and preserved values through actual TYPO3 Record and Content Blocks data processing. All 36 before/after combinations render the expected FSC class names, with empty Default values mapped to Medium. Chromium and WebKit verify computed 1em–5em margins, Default/Medium equivalence, adjacent margin collapsing and removal of fixed wrapper padding at 1280px and 390px with both packaged and consuming Vite CSS. The live frontend renders the default medium classes. Browser checks report no failed assets or page errors. The dedicated regression commands are in the build runbook.

Follow-up spacing correction: the initial FSC 1em–5em scale is replaced by Astryx token sizes of 2px, 4px, 8px, 16px and 24px. Default remains identical to Medium at 8px, matching the measured gap in the upstream Heading demo. Default/Subpage content regions now use normal block flow so adjacent element margins collapse, instead of adding two margins and a 32px grid gap. Sidebar/app regions retain their grid columns and gaps. The regression uses the actual `.astryx-regions` wrapper to cover this failure. Production builds pass; all 36 combinations pass in Chromium/WebKit at desktop/mobile widths with both CSS bundles. The live `/page-2` page measures 8px between all adjacent blocks.

Heading/Textmedia follow-up: the native Heading recipe now uses zero margins; subheaders also have zero vertical margins. Supporting text sits directly below its heading, as in the upstream Page Hierarchy example; the group has an 8px gap before body content. Empty Textmedia media slots are omitted and text-only content spans the available columns. Both production builds and all 75 Fluid templates pass. Chromium/WebKit verify actual Heading/Textmedia markup, optional subheaders, full-width text-only content and the compact gaps at 1280px/390px using packaged CSS and the complete consuming Vite CSS (including its shared StyleX asset).

## Heading alignment and link checks, 9 October 2026

All 16 Content Blocks pass lint, extension setup succeeds, all 75 Fluid templates parse and both production asset builds pass. Read-only rendering checks the four core alignment choices and Link field for all 20 CTypes using actual TYPO3/Content Blocks data processing and each frontend template. Actual backend FormEngine compilation confirms the translated Alignment/Link labels and Default/Left/Center/Right choices on all 20 CTypes; the duplicate legacy Hero selector is hidden. All 160 type/alignment/link combinations render one correctly escaped heading; empty and hidden headings stay absent. Semantic h1–h6/default levels, page/URL/email Typolinks and external target/title attributes pass.

Chromium and WebKit verify computed physical left/center/right alignment (including Default = left) in LTR and RTL at 1280px/390px with both packaged and consuming Vite CSS. Subheaders follow the chosen alignment; linked heading text and its anchor match an overridden theme link color. Heading links accept keyboard focus and the live frontend renders without script or local asset errors. Existing spacing, Classic Gallery and Code Block functional checks and the Heading/Textmedia browser spacing regression pass. The dedicated commands are in the build runbook.

## Single-column container checks, 10 October 2026

Container 1-col is registered with one editable column at colPos 201. English/German FormEngine forms and rendered previews pass: Light/Dark choices, content/full viewport width choices, defaults and invalid-value fallbacks, a single core FAL image picker, shared heading/link controls and spacing. Its lazy child area renders each child exactly once on the dedicated TYPO3 fixture page. Copy, move, deletion and joint restoration of the container and child pass in the isolated fixture.

The exact checks run from the integration project were:

```sh
ddev exec vendor/bin/typo3 cache:flush
ddev exec vendor/bin/typo3 extension:setup
ddev exec vendor/bin/typo3 content-blocks:lint
ddev exec npm run build
ddev exec php packages/typo3_astryx/Tests/Functional/parse-fluid.php
ddev exec php packages/typo3_astryx/Tests/Functional/single-column.php
ddev exec php packages/typo3_astryx/Tests/Functional/containers.php
ddev exec php packages/typo3_astryx/Tests/Functional/heading.php
ddev exec php packages/typo3_astryx/Tests/Functional/spacing.php
ddev exec vendor/bin/typo3 stylex:validate --required-key=AstryxSingleColumn.width_full_bleed
node packages/typo3_astryx/Tests/Browser/single-column.mjs
git diff --check
```

The full build verifies both asset pipelines, paired manifest/CSS checksums, portable assets and style ownership. All 91 Fluid templates parse. Heading and spacing regressions cover all 27 supported CTypes. The isolated fixture was updated through cache flush/extension setup and `Tests/Fixtures/single-column.php`; `Tests/Functional/container-lifecycle.php --single-column` passed there.

Chromium/WebKit pass at 1440px, 900px and 390px with packaged and consuming Vite assets, with/without JavaScript and reduced motion enabled. Checks cover viewport edges, parent-width constraints, zero horizontal overflow, RTL edges, nested resize alignment, decorative FAL alternatives, responsive sources, image loading and cover sizing after content height grows. Nested heading/body palettes match the selected Light/Dark mode across Neutral/Stone/Ocean and both page modes. Child links retain keyboard order. There are no failed local asset requests or browser script errors. Screenshots and the eight-case report remain outside source control at `/tmp/astryx-single-column-evidence`.

Centered main/stage full-bleed sections work without JavaScript. Off-center sidebar/nested sections require the alignment controller for viewport width and remain readable at parent width without JavaScript. Images are decorative and have no automatic contrast overlay; editors choose a readable image/palette combination.

Full-bleed content-width correction: the heading and child area now use the same `astryx-shell-width` wrapper as the page, while the background retains viewport width. `ddev exec npm run build`, `ddev exec php packages/typo3_astryx/Tests/Functional/single-column.php`, `ddev exec php packages/typo3_astryx/Tests/Functional/parse-fluid.php`, `node packages/typo3_astryx/Tests/Browser/single-column.mjs` and `git diff --check` pass after this correction. Chromium/WebKit compare heading/child area edges directly with the normal site shell at 1440px, 900px and 390px, including a 48rem site-width override, RTL, nested containers and both asset/JavaScript paths. Background images still cover the whole viewport-width surface and grow with content. The English/German selector is labeled Background width/Hintergrundbreite.

Section background correction: solid Container 1-col backgrounds and previews now use the local Light/Dark theme surface color with a 1px inset theme-border outline. The section fill differs from the page body in Neutral/Stone/Ocean for both page modes and both container modes; browser checks require a difference of at least eight RGB channel levels and a visible solid 1px outline. `ddev exec npm run build`, `ddev exec php packages/typo3_astryx/Tests/Functional/single-column.php`, `node packages/typo3_astryx/Tests/Browser/single-column.mjs` and `git diff --check` pass. Chromium/WebKit cover both asset pipelines at desktop/mobile sizes, with/without JavaScript. Existing child-width, image-cover, theme-text, resize, RTL and keyboard checks continue to pass. The matching Light-on-Light Stone view is captured in `/tmp/astryx-single-column-evidence/stone-light-sections.png`.

Relative-shade correction: Container 1-col now inherits the active page mode. Stored light/dark values select Lighter/Darker backgrounds, mixing the active theme surface with 8% white/black, rather than imposing a local mode. Both shades remain light in Light mode and dark in Dark mode, and Lighter is brighter than Darker in Neutral/Stone/Ocean. This supersedes the local-mode behavior recorded above. English/German editor labels and previews reflect the relative shade choice. Chromium/WebKit pass with packaged/Vite assets, with/without JavaScript, at 1440px, 900px and 390px. The browser checks require ordered shade luminance, inherited heading/body colors, at least 4.5:1 text contrast over solid fills, distinct section fills and inset outlines. Image coverage, constrained inner content, nested resizing, RTL and keyboard checks continue to pass.

Checks run for this correction: `ddev exec npm run build`, `ddev exec vendor/bin/typo3 cache:flush`, `ddev exec vendor/bin/typo3 content-blocks:lint`, `ddev exec php packages/typo3_astryx/Tests/Functional/parse-fluid.php` (91 templates), `ddev exec php packages/typo3_astryx/Tests/Functional/single-column.php`, `ddev exec vendor/bin/typo3 stylex:validate --required-key=AstryxSingleColumn.background_dark`, `node packages/typo3_astryx/Tests/Browser/single-column.mjs` (eight browser/asset/JavaScript cases) and `git diff --check`. The isolated fixture received the rebuilt extension and a cache flush; no record migration was necessary. Mode-specific screenshots and the report remain in `/tmp/astryx-single-column-evidence`. Image contrast depends on the chosen photograph; there is no automatic overlay.

## Header dropdown reference adaptation — 11 October 2026

The actual `https://typo3-astryx.ddev.site/` page passes the expanded navigation regression in Chromium and WebKit with both consuming Vite and packaged assets. Packaged checks substitute published extension asset URLs into the real TYPO3 response without changing site settings or records. The visual reference displayed DropdownMenu v0.6.8.

Commands run from the integration project root:

```sh
ddev exec npm run build
ddev exec php packages/typo3_astryx/Tests/Functional/parse-fluid.php
ddev exec vendor/bin/typo3 cache:flush
ddev exec vendor/bin/typo3 stylex:validate --required-key=AstryxDropdown.part_panel
git diff --check
ASTRYX_TEST_URL=https://typo3-astryx.ddev.site ASTRYX_TEST_BROWSERS=chromium,webkit node packages/typo3_astryx/Tests/Browser/navigation.mjs
ASTRYX_TEST_URL=https://typo3-astryx.ddev.site ASTRYX_TEST_BROWSERS=chromium,webkit ASTRYX_NAVIGATION_ASSETS=packaged ASTRYX_TEST_OUTPUT=/tmp/astryx-navigation-packaged-evidence node packages/typo3_astryx/Tests/Browser/navigation.mjs
```

The full build includes consuming StyleX verification, theme generation, packaged finalization, source-ownership and artifact checks. Fluid parses 92 templates without failures. Artifact verification reports 18 recipes, 208 styles and five paired artifacts; runtime validation reports 212 keys across two registered manifests.

Both engines/pipelines verify 4px panel padding, 32px desktop rows, content-sized widths with longer labels, independent adjacent fly-outs, hover/click activation, crossing the pointer gap, keyboard focus and branch dismissal, viewport-edge flipping, RTL direction, reduced-motion chevrons, current-page links, mobile nested disclosures, desktop resize and native no-JavaScript desktop/mobile disclosure. Existing sticky-header, saved-mode, outside-click, header accessibility and failed-asset checks also pass. No browser errors or failed assets were observed. JSON reports and screenshots are saved under `/tmp/astryx-navigation-evidence` and `/tmp/astryx-navigation-packaged-evidence`; Firefox was not run.

### Language dropdown follow-up — 11 October 2026

The language menu now uses the same Dropdown panel/row/link StyleX recipe. The expanded navigation suite passes in Chromium and WebKit for both Vite and packaged assets: 4px panel padding, 2px row margins, 32px desktop and 44px mobile rows, 6px/8px desktop padding, an 8px flag/label gap, content-based panel widths, loaded circular 20px flags, current-language state and mobile viewport containment. Both enabled links on the site root and disabled translation rows on the child page were rendered; native mobile disclosure without JavaScript and Escape focus recovery pass. Screenshots use the `*-language-*.png` names in the evidence directories above.

Repeated the same full build, Fluid parsing, cache flush, diff check and both browser commands listed above. Runtime validation for this follow-up used:

```sh
ddev exec vendor/bin/typo3 stylex:validate --required-key=AstryxDropdown.part_link
```

The initial packaged run caught a timing-sensitive assertion in the existing RTL fly-out check; that assertion now waits for disclosure positioning to finish. The rerun passes both engines. Fluid still parses all 92 templates; all artifact/ownership checks pass. Firefox was not run.

## P2-01 occurrence identifiers — 11 October 2026

The request allocator, shared wrappers and affected native/supporting components passed the focused PHP checks, Content Blocks lint, all 92 Fluid templates and the full production build/artifact verification. The real TYPO3 fixture rendered each source record 14 times through shortcuts and all six repeated/nested container variants. Sixteen Chromium/WebKit combinations covered packaged/Vite assets, desktop/mobile and JavaScript/native behavior, including unique IDs, references targeting their own occurrence, canonical/occurrence fragments, independent state and stable namespaces on warm page-cache hits. The integration-site navigation regression also passed in both browsers. Authored/plugin collisions are diagnosed without rewriting their IDs. See [the exact checks and scope](ComponentAudit/P2-01.md) and [the public identifier contract](OccurrenceIdentifiers.md).
