# Public contracts

Package `skom/typo3-astryx`, extension `typo3_astryx`, namespace `Skom\Typo3Astryx`, set `skom/typo3-astryx`.
Native components use the global `astryx` namespace. Helper ViewHelpers use `ax`; StyleX uses the connector's global namespace.

| Component | Arguments and defaults | Slots |
| --- | --- | --- |
| Button | required label; href empty; variant primary/secondary/ghost/destructive; size small/medium/large; type button/submit/reset; disabled/loading/iconOnly false; icon empty | start, end |
| Badge | required text; variant neutral/accent/success/warning/error; icon empty | none |
| StatusDot | required label; same status variants | none |
| Icon | allowlisted name; size small/medium/large; label empty for decorative icons | none |
| Heading | text empty; semantic level 2; levels 1–6; size medium/small/large/display; align start/center/end; subtitle empty | default |
| Text | text/richText empty; width prose/full; density normal/compact | default |
| Divider | variant subtle/strong | none |
| Card | title/body/href/label/badge empty; heading level 3; variant outlined/elevated/flat; padding normal/compact | media, default, footer |

Unknown component arguments raise Fluid errors. Invalid recipe values fall back to the first value in each dimension; Heading falls back to h2. Invalid button types become button. Unknown icons become the information symbol.
The allowlisted icons are menu, close, arrow-left, arrow-right, download, info, check, warning and sun. No stored SVG or arbitrary markup is accepted.
Links go through TYPO3 typolink. Disabled links have no href. Disabled/loading buttons emit the disabled attribute; enabled buttons omit it. Icon-only controls keep their label as accessible text.
Text's richText and Card's body explicitly use TYPO3 parseFunc_RTE. Plain text and component slots keep Fluid escaping. Named slots accept composed component markup.
Partials in `Partials/Astryx` are scalar bridges to the same component implementation. Use native components for named slots.

## Records and layouts

Content Block names are `astryx/<name>` with explicit `astryx_<name>` CTypes. The catalogue is heading, text, textmedia, card, list, table, divider, downloads, hero, card-grid, notice, accordion, carousel and container-two-col.
Core header/bodytext/image/assets/media fields are reused where appropriate. Collection tables have stable `tx_astryx_*` identities; Content Blocks owns localization, workspace and relation metadata. Do not manipulate relation counters directly outside fixture construction.

| Backend identifier | Template | Regions |
| --- | --- | --- |
| default | Default | stage 1, main 0 |
| astryx_sidebar | AstryxSidebar, resolver alias Astryx_sidebar | stage 1, main 0, detail 2 |
| astryx_app_shell | AstryxAppShell, resolver alias Astryx_app_shell | stage 1, editorial navigation 3, main 0, detail 2 |

Container columns are 201 and 202. Ratios are 50-50, 66-33 and 33-66; gaps normal, small and large. TYPO3 14 lazy ContentAreas render children, retaining language, visibility, sorting and container cache behavior. Page regions never include those column positions as top-level content.
Nesting is supported to two editorial levels as a usability policy; deeper nesting is not prevented automatically. Container CSS stacks at less than 40rem of available content width. No-JS layouts remain grids with narrow-screen fallbacks.
Sidebar uses a detail column at 60rem. AppShell places navigation beside main at 60rem and adds the detail panel at 90rem, otherwise the panel follows main. All regions stay in the document. Header/footer pinning is optional. There are no independent scroll areas that trap zoomed content.

## Theme and cascade

Site settings `Astryx.theme` and `Astryx.mode` default to neutral/system. Rootline overrides `tx_astryx_theme` and `tx_astryx_mode` inherit independently, with the nearest valid page value winning. Invalid stored values are ignored.
`Astryx.allowUserMode`, enabled by default, shows the header icon toggle and enables a saved browser preference which wins over page/site mode. Storage failure still permits in-page switching. The color mode is saved; the Neutral, Stone or Ocean palette remains a site/page setting.
Public tokens use explicit `--astryx-*` names. Source token declarations and theme declarations generate the attribute bridge and editor CSS. Each nested theme boundary repeats the complete token set so it does not inherit a sibling or parent theme's palette.
Layer order is reset, astryx-base, StyleX priority1 through priority5, astryx-theme, product. The compiler's actual priority layers are preserved. Product overrides belong in the final layer. Unlayered third-party styles follow the CSS cascade normally.
Neutral/Stone adapt verified upstream 0.6.5 values. Ocean is local. See `Build/adaptations.json`, `Build/upstream-versions.json` and `THIRD_PARTY_NOTICES.md`. `Documentation/Examples/Brand.css` demonstrates a custom brand boundary.

## Browser and accessibility scope

Target browsers support light-dark(), native dialog, ResizeObserver and CSS scroll snap: Chromium 123+, Firefox 120+ and Safari 17.5+. Container queries have a viewport fallback. These are support targets; tested versions are recorded separately in Validation.md.
WCAG 2.2 AA verification includes keyboard, focus return, names, landmarks, semantic headings, readable status labels, contrast and responsive reflow. Editors remain responsible for image alternatives, video captions and heading hierarchy.
The Accordion follows the Collapsible overview: one compact bordered card, 16px gaps, 14px semibold triggers, secondary body text, and an end chevron that turns upward when expanded. Native details provides Enter/Space disclosure behavior before JavaScript. Single mode uses native named disclosures without JavaScript and normalizes multiple defaults to the first open item with JavaScript; zero open items is allowed. The controller animates expansion and collapse using the theme duration and easing, synchronizes aria-expanded, and makes closing content inert. Reduced motion skips both height and chevron animations. Multiple mode preserves independently opened sections. Carousel has no autoplay; controls preserve focus and announce numeric position. Mobile navigation uses native modal focus handling and closes on Escape or a desktop breakpoint change.

## Initial media scope

Hero supports one image, split/centered/protected-overlay layout, neutral/accent treatment and logical text alignment. Its text overlay uses a theme surface background with 70% transparency (30% opacity), while text and controls remain fully opaque. Hero video and decorative/autoplay video are outside the initial contract. Textmedia supports TYPO3's standard image/video/audio renderers with controls; an optional FAL image supplies a video poster. The shared image partial retains TYPO3's default FAL crop variant, captions and alternative text, emits 480/960/1200 srcsets and dimensions, and offers original/wide/landscape/square display ratios. No lightbox is advertised or loaded.

## Header navigation

The header contains the configured logo and the TYPO3 page-tree menu with up to three levels. Parent pages remain links. The adjacent disclosure opens their submenu with a mouse click, touch, Enter or Space. Escape closes the submenu and restores focus. Outside clicks and moving focus outside the submenu close it. On small screens the menu opens in a modal dialog. Native disclosures and page links remain usable without JavaScript.

The following typed settings are available in the TYPO3 site settings editor. Override them per site in `config/sites/<site>/settings.yaml` using flat keys:

```yaml
Astryx.pinnedHeader: true
Astryx.allowUserMode: true
Astryx.showLanguageMenu: true
```

`Astryx.pinnedHeader` keeps the bar visible while scrolling. Set `Astryx.allowUserMode` to `false` to hide the theme switcher and ignore stored visitor preferences. The configured site or page color mode then applies. Set `Astryx.showLanguageMenu` to `false` to disable the language menu and its data processor. All three settings default to `true`.

The language selector only appears when the site has more than one enabled language. Languages and translated URLs come from TYPO3 site handling. Missing translations appear as disabled text. Add languages to the site's `config.yaml` and translate pages in the backend to make those links available.

The theme control follows the Astryx documentation header: one borderless 44px button with a 20px moon or sun icon. It toggles between light and dark, naming the next action in its translated accessible label and tooltip. System mode follows the operating system until a visitor chooses an explicit mode; changes in system preference also update the icon. Saved preferences and `Astryx.allowUserMode: false` retain their behavior. The control stays hidden when JavaScript is unavailable.

Code Block uses a dedicated plain textarea without RTE or trimming. Its language, optional filename and line-number flag belong to `astryx/code-block` (`astryx_code_block`). Fluid escapes snippets and filenames. The controller loads only the eleven supported language choices, renders a nonselectable, screen-reader-hidden gutter and copies the original code text. The optional Clipboard API fallback restores keyboard focus and reports failure through the live status. No-JavaScript output retains the code and header; the unavailable copy button stays hidden.
