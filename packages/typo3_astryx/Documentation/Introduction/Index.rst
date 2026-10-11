.. _introduction:

============
Introduction
============

TYPO3 Astryx (``skom/typo3-astryx``) delivers an editorial design system, Content Blocks,
and PAGEVIEW page layouts for TYPO3 14.3. It replaces ``typo3/cms-fluid-styled-content`` (FSC)
with an atomic CSS architecture powered by **StyleX** and ``skom/stylex-connector``.

Key Highlights
==============

* **FSC Replacement**: Replaces legacy Fluid Styled Content templates with structured Content
  Blocks (``friendsoftypo3/content-blocks``) and native Fluid components.
* **StyleX CSS-in-JS Architecture**: Styles are authored in StyleX modules and compiled by Vite
  into atomic CSS with deterministic specificity and zero runtime overhead.
* **Progressive Enhancement**: Editorial pages work without client-side JavaScript. Interactive
  features—such as header navigation dropdowns, mobile navigation dialogs, accordion disclosure
  animations, code block copying, and carousel scroll snapping—enhance the page progressively
  when JavaScript is available and degrade gracefully when disabled.
* **Built-in Theme & Mode Switching**:
  - Themes: **Neutral** (default), **Stone** (Montserrat typography and warm neutral palette),
    and **Ocean** (cool palette).
  - Modes: **System** (follows operating system), **Light**, and **Dark**.
  - Client-side theme switcher toggle in the site header with saved visitor preference.
  - Page-level theme and mode inheritance via rootline fields in Page properties.
* **Accessible by Design (WCAG 2.2 AA)**:
  - Contrast ratios meet or exceed 4.5:1 for normal text and 3:1 for user interface controls.
  - Keyboard navigation with visible focus rings and proper focus restoration on modals.
  - Explicit ARIA landmarks, roles, and live region announcements.
  - Respect for user motion preferences (``prefers-reduced-motion`` disables transitions).
* **Native Fluid Component Architecture**:
  - Registered Fluid namespace ``<astryx:*>`` for composable UI primitives:
    ``<astryx:button>``, ``<astryx:badge>``, ``<astryx:statusDot>``, ``<astryx:icon>``,
    ``<astryx:heading>``, ``<astryx:text>``, ``<astryx:divider>``, ``<astryx:card>``,
    ``<astryx:sideNav>``, and ``<astryx:treeList>``.
  - Extension ViewHelpers under ``<ax:*>``: ``<ax:recipe>`` for atomic class resolution and
    ``<ax:imageSizes>`` for responsive image slot calculation.
* **Flexible Page & Container Layouts**:
  - 3 Backend Layouts: **Default** (Stage, Main), **Astryx Sidebar** (Stage, Main, Detail),
    and **Astryx App Shell** (Stage, Editorial Navigation, Main, Detail).
  - 6 Container Content Elements powered by ``b13/container``: Single Column (with lighter/darker
    surface shades and full-bleed breakout), 2-Col 50/50, 2-Col 25/75, 2-Col 75/25, 3-Col,
    and 4-Col.
* **Rich Content Element Suite**: 22 Content Blocks plus 5 retained core element renderers
  (Sitemap, Subpages, Selected Pages, Shortcut, Sanitized HTML) covering all modern editorial needs.

Architecture Overview
=====================

TYPO3 Astryx is built on three interconnected layers:

..  code-block:: text

    +-------------------------------------------------------------+
    |                     TYPO3 Frontend (PAGEVIEW)               |
    |  Layouts, Templates, Content Blocks, Native Fluid Components |
    +-------------------------------------------------------------+
                                  |
                                  v
    +-------------------------------------------------------------+
    |           skom/stylex-connector (StylexRegistry)            |
    |  Resolves <ax:recipe> and <stylex:class> keys to classes    |
    |  via stylex-manifest.json generated during build            |
    +-------------------------------------------------------------+
                                  |
                                  v
    +-------------------------------------------------------------+
    |              StyleX Compiler & Vite Build Pipeline          |
    |  StyleX modules (.stylex.js) -> Atomic CSS (@layer)         |
    |  Themes (Neutral, Stone, Ocean) -> CSS variables (--astryx-) |
    +-------------------------------------------------------------+

1. **Content Blocks**: Content elements are authored as TYPO3 Content Blocks in
   ``ContentBlocks/ContentElements/<block-name>/``. Each block owns its configuration,
   frontend Fluid template, backend preview template, local XLF labels, and block-owned
   StyleX sources.
2. **StyleX Connector**: Connects TYPO3's PHP/Fluid rendering engine with the compiled StyleX
   manifest. Rather than hardcoding generated atomic CSS class names, Fluid templates request
   semantic recipe keys (such as ``AstryxButton.root`` or ``AstryxButton.variant_primary``),
   which ``StylexManifestService`` resolves to atomic class strings at render time.
3. **Design Tokens & Theme Bridge**: Design tokens are declared in JavaScript modules
   (``tokens.stylex.js``, ``Themes/Neutral.stylex.js``, ``Themes/Stone.stylex.js``, etc.).
   A build-time bridge generates ``themes.css`` containing scoped CSS custom properties
   (``--astryx-*``) that adapt dynamically to the active theme and color mode.
