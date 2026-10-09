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
