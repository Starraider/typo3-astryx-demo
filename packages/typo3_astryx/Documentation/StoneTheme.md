# Stone reference validation

Validated on 2026-10-10 against [Astryx Stone](https://astryx.atmeta.com/themes?theme=stone), displayed version 0.6.7, and the official `@astryxdesign/cli@0.6.7` Stone template. Source/package integrity and font download checksums are recorded in `Build/upstream-versions.json` and `Build/stone-fonts.json`.

The generated bridge matches all 91 upstream semantic/categorical/radius/shadow declarations. Its syntax palette also follows the Stone template. Browser expectations use measured reference values rather than the generated local token file. Fractional 1.5px borders are checked against the declared token because browsers can snap the rendered border to device pixels.

Local typography adaptation: all Stone H1–H6 headings use font weight 400, replacing the upstream 600/700 weights. This applies to native components, rich text, RTE and backend previews, including nested Stone boundaries. Display headings already use weight 400. The browser checks verify this adaptation alongside the reference values.

| Validation | Result |
| --- | --- |
| Full `ddev exec npm run build` | Consuming Vite and portable extension builds passed; artifact, stylesheet checksum, recipe selector and style ownership checks passed |
| `content-blocks:lint` | Passed |
| `Tests/Functional/parse-fluid.php` | 88 templates, no failures |
| `Tests/Unit/theme-resolver.php` | Defaults, invalid values, site overrides and independent ancestor inheritance passed |
| `stylex:validate --required-key=AstryxHeading.root --required-key=AstryxButton.variant_secondary` | 192 keys in two manifests validated |
| `Tests/Functional/theme.php` | Native Fluid typography and component fixture rendered |
| `Tests/Browser/stone-theme.mjs` | 42 Chromium/WebKit checks passed: both frontend pipelines, RTE/preview styles, desktop/mobile, light/dark, fonts, semantic/display typography, component/syntax colors, nested boundaries and five real TYPO3 pages |
| `Tests/Functional/sitemap.php` and `Tests/Browser/sitemap.mjs` | Recursive markup plus 56 live/pipeline/viewport/theme/mode checks passed, including keyboard, no-JS, guides, RTL and axe accessibility |
| `git diff --check` | Passed |

Live TYPO3 checks apply Stone to the rendered response only. Existing page/site settings and records are retained. The development root page currently selects Neutral; choose Stone in its Astryx theme field to use the updated design. Unconfigured RTE/backend previews retain the Neutral editor fallback; explicit Stone theme boundaries load Stone typography/colors. This validates theme values and supported native components, rather than reproducing the reference site's React page layout or adding components absent from this extension.

Screenshots and detailed reports were written outside source control to `/tmp/astryx-stone-evidence` and `/tmp/astryx-sitemap-evidence`. To reproduce the checks, follow the Stone reference parity section in [Build.md](Build.md).
