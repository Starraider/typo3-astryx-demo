.. _styling_css_entrypoints:

==========================
StyleX and CSS integration
==========================

StyleX recipes are the default for styling markup controlled by Astryx. Use
``stylex.defineVars`` token groups for shared values and ``stylex.create`` recipes for component
layout, typography, color, responsive behavior, state and variants. A token defines a value; it
does not apply that value to an element. Fluid templates apply compiled recipes through the
``ax:recipe`` ViewHelper.

Avoid hand-authored CSS for ordinary component styling. A block-specific selector is not by itself
a reason to create a CSS file, and an existing CSS import does not mean its declarations need to
remain in CSS. Prefer migrating controlled block and preview markup to StyleX recipes that consume
the shared tokens.

Use CSS only for a concrete browser or integration requirement that the pinned StyleX compiler and
the current Fluid/build path cannot express or reliably apply. Keep each exception small, scoped to
its integration surface, and documented beside the source. Use existing ``--astryx-*`` variables in
CSS; do not maintain a parallel set of design values in CSS. Any deliberate override of a public
token must be a narrow, documented integration contract.

.. _styling_source_routing:

Source of truth and quick routing
=================================

Paths in this table are relative to the ``typo3_astryx`` extension root unless marked
``astryx_sitepackage``.

.. list-table:: Where to make a design change
   :header-rows: 1

   * - Change
     - Authored source
   * - Text, surface, border, accent or status color
     - ``Resources/Private/JavaScript/StyleX/tokens/color-tokens.stylex.js``
   * - Category palette colors
     - ``Resources/Private/JavaScript/StyleX/tokens/category-color-tokens.stylex.js``
   * - Code surface and syntax colors
     - ``Resources/Private/JavaScript/StyleX/tokens/code-color-tokens.stylex.js``
   * - Typography, spacing, layout, shape, shadow or motion
     - The matching ``Resources/Private/JavaScript/StyleX/tokens/<family>-tokens.stylex.js``
   * - Deliberately themeable component contract
     - ``Resources/Private/JavaScript/StyleX/tokens/components/<component>-tokens.stylex.js``
   * - Built-in theme override
     - ``Resources/Private/JavaScript/StyleX/themes/<theme>-theme.stylex.js``
   * - Reusable component or page-chrome styling
     - ``Resources/Private/JavaScript/StyleX/components/<recipe>.stylex.js``
   * - Recipe used by one Content Block only
     - ``ContentBlocks/ContentElements/<block-name>/src/<recipe>.stylex.js``
   * - Site-only component or product styling
     - ``astryx_sitepackage/Resources/Private/JavaScript/StyleX/components/``
   * - Rich-text HTML styling
     - ``Resources/Private/CSS/prose.css``; keep rules scoped to ``.ck-content`` or
       ``.astryx-prose`` and use shared tokens
   * - Native dialog backdrop
     - ``Resources/Private/CSS/navigation-backdrop.css``
   * - Single-column no-JavaScript browser fallback
     - ``ContentBlocks/ContentElements/container-single-col/src/container-single-col.css``

``Build/design-tokens.json`` is the registry for token families and built-in themes. Add a new
token family there and add its ``defineVars`` module to
``Resources/Private/JavaScript/StyleX/tokens/index.js`` so RTE and preview builds include the
variable group. Public CSS custom properties use the ``--astryx-`` prefix and lowercase kebab-case
semantic names, for example ``--astryx-color-text-primary`` or
``--astryx-component-button-size-large-font-size``. Name a value for its role, not its current hex,
theme, mode or incidental selector. Keep one-off values inside the recipe that uses them.

Use a component token family only when its values form a deliberate, reusable themeable contract.
Keep implementation-only custom properties private to their component or block, with a local name
that does not use the public ``--astryx-`` namespace.

Recipe files use lowercase kebab-case and the ``.stylex.js`` suffix. Keep every basename unique in
the generated manifest because Fluid-facing aliases are derived from the basename; changing a
basename can therefore require changing template keys. Keep recipe keys finite and synchronize
``Build/recipes.json``, ``Classes/ViewHelpers/RecipeViewHelper.php`` and Fluid recipe choices.
Never put StyleX compiler input under a Content Block's published ``assets/`` folder.

Theme identity and color mode
=============================

Theme identity and color mode are separate choices. The built-in identities are ``neutral``,
``stone`` and ``ocean``; modes are ``system``, ``light`` and ``dark``. Keep mode and theme out of
token names. A semantic role such as ``--astryx-color-text-primary`` keeps the same contract in each
theme. Color roles that vary only by mode use CSS ``light-dark()`` values and the resolved
``color-scheme``.

Theme source modules use ``stylex.createTheme`` to override the relevant token groups. Overrides
may be sparse; ``Build/generate-theme-bridge.mjs`` reads the registered defaults and overrides and
emits complete token sets at each theme boundary. This prevents nested themes, RTE content and
backend previews from depending on an unrelated ancestor's variables. Do not edit the generated
``Build/theme-tokens.json`` or ``Resources/Private/CSS/themes.css``.

Adding a theme updates the StyleX source and the TYPO3 runtime allowlist together:

#. Add ``Resources/Private/JavaScript/StyleX/themes/<name>-theme.stylex.js`` and import only the
   token groups it overrides.
#. Register the lowercase identity and source file in ``Build/design-tokens.json``.
#. Import the theme module from ``Resources/Private/JavaScript/frontend.entry.js``.
#. Add the same identity to ``Classes/Configuration/ThemeResolver.php`` and the page field choices
   in ``Configuration/TCA/Overrides/pages.php``. Add its label to
   ``Resources/Private/Language/locallang.xlf`` and update :doc:`../Configuration/Index`.
#. Regenerate the bridge and build the extension. Verify the theme in light/dark modes and at
   nested boundaries in the frontend, RTE and backend preview. Record upstream source and local
   adaptations in ``Build/upstream-versions.json``, ``Build/adaptations.json`` and
   ``THIRD_PARTY_NOTICES.md`` when applicable.

Consumer branding should use a deliberate existing theme contract or site-owned StyleX recipe
where that fits. Do not copy the extension's token files into the sitepackage. A global CSS
override is an exception: use it only for a specific integration surface the current StyleX path
cannot express, and record the limitation. The sitepackage's ``Resources/Private/CSS/main.css`` is
currently a declaration-free ``@layer product;`` anchor for Vite, not a place for component rules.

CSS policy and current exceptions
=================================

These are the CSS sources currently connected to the extension build. This list describes the
existing integration boundaries; it is not a recommendation to add more CSS.

.. list-table:: Authored and generated CSS sources
   :header-rows: 1

   * - Source
     - Role and rule
     - Included by
   * - ``Resources/Private/CSS/main.css``
     - Import aggregator only. Do not add component or page rules.
     - ``Resources/Private/JavaScript/frontend.entry.js``
   * - ``Resources/Private/CSS/rte.entry.css``
     - CSS-only foundation imports for layers, fonts, reset, generated theme variables and prose.
     - Frontend aggregator, RTE entry and preview entry
   * - ``Resources/Private/CSS/preview.entry.css``
     - Reuses the RTE foundation; preview component layout is StyleX.
     - ``Resources/Private/JavaScript/backend-preview.entry.js``
   * - ``Resources/Private/CSS/layers.css``
     - Declares cascade-layer order. Keep the ordering contract; do not add component rules.
     - ``rte.entry.css``
   * - ``Resources/Private/CSS/fonts.css``
     - ``@font-face`` registration for packaged font files.
     - ``rte.entry.css``
   * - ``Resources/Private/CSS/reset.css``
     - Scoped baseline and broad reduced-motion/forced-colors rules for arbitrary CMS and
       browser-owned markup.
     - ``rte.entry.css``
   * - ``Resources/Private/CSS/prose.css``
     - Semantic descendants of CKEditor and arbitrary rich-text/prose HTML. Scope these rules and
       use StyleX token variables for design values.
     - ``rte.entry.css``
   * - ``Resources/Private/CSS/navigation-backdrop.css``
     - ``::backdrop`` for the native dialog; StyleX 0.19 does not compile pseudo-elements.
     - ``main.css``
   * - ``Resources/Private/CSS/themes.css``
     - Generated theme variable bridge. Never edit by hand.
     - Generated by ``Build/generate-theme-bridge.mjs``; imported by ``rte.entry.css``
   * - ``ContentBlocks/ContentElements/container-single-col/src/container-single-col.css``
     - ``@property`` sizing and ancestor ``:has()`` query-container fallback for full-bleed layout
       before JavaScript enhancement. Keep only these browser-level declarations here.
     - ``main.css``
   * - Block preview recipes
     - Controlled preview wrappers and parts are StyleX; there are no per-block preview CSS files.
     - ``backend-preview.entry.js`` imports each ``src/*-preview.stylex.js`` module

The Content Block ``src/`` directory is the private source location for a block-owned recipe and
for a justified block-specific CSS exception. It is not a reason to use CSS: layout, spacing,
colors, responsive behavior, states and variants for controlled markup belong in a StyleX recipe.
Add a CSS import only after documenting the specific browser or integration requirement and why a
recipe cannot handle it. Keep the CSS beside its owner, preserve required cascade layers, and use
existing public tokens in its declarations.

How the entrypoints connect
===========================

The extension uses separate Vite entries because frontend, CKEditor and TYPO3 backend preview
consume different combinations of styles:

.. code-block:: text

   frontend.entry.js
     └── CSS/main.css
         ├── CSS/rte.entry.css
         │   ├── layers.css
         │   ├── fonts.css
         │   ├── reset.css
         │   ├── themes.css (generated)
         │   └── prose.css
         ├── CSS/navigation-backdrop.css
         └── container-single-col/src/container-single-col.css
     ├── shared StyleX component/page recipes
     ├── ContentBlocks/*/src/*.stylex.js frontend recipes
     └── StyleX/themes/*-theme.stylex.js

   rte-editor.entry.js
     ├── CSS/rte.entry.css
     └── StyleX/tokens/index.js

   backend-preview.entry.js
     ├── CSS/preview.entry.css → CSS/rte.entry.css
     ├── StyleX/tokens/index.js
     ├── shared preview/media recipes
     └── ContentBlocks/*/src/*-preview.stylex.js recipes

``StyleX/tokens/index.js`` is a side-effect barrel for token modules. The editor/preview builds
include these declarations with their CSS foundations. Import a frontend recipe from
``frontend.entry.js``; import a preview recipe from ``backend-preview.entry.js``. A source that is
not reachable from its Vite entry is not compiled. Keep the frontend and backend preview class
requirements in their correct entrypoints and manifest.

The sitepackage imports its site-owned StyleX recipe from ``site.entry.js``. Its CSS ``main.css``
only declares the Vite layer anchor. Keep site-specific rules in the site-owned StyleX recipe and
use the shared extension entry/asset integration rather than adding another asset include for the
same compiled CSS.

Generated assets and TYPO3 links
================================

Generated CSS and manifests are outputs from the token bridge, StyleX/Vite compiler and finalizer.
Edit authored tokens, recipes, CSS exceptions or entry imports; never hand-edit generated class
names, CSS bundles, manifests or checksums.

.. list-table:: Generated style artifacts
   :header-rows: 1

   * - Generated file
     - Runtime link
   * - ``Resources/Private/CSS/themes.css`` and ``Build/theme-tokens.json``
     - Bridge outputs generated from ``defineVars``, registered ``createTheme`` overrides and
       ``Build/design-tokens.json``.
   * - ``Resources/Public/Assets/astryx.css`` and ``astryx.js``
     - Packaged frontend output loaded by ``PageView/Layouts/AstryxPageLayout.html`` when Vite mode
       is disabled.
   * - ``Resources/Public/Css/rte-tokens.css``
     - Generated RTE stylesheet linked by ``Configuration/RTE/Default.yaml`` through
       ``editor.config.contentsCss``.
   * - ``Resources/Public/Css/backend-preview.css``
     - Generated preview stylesheet linked by Content Block backend-preview templates using
       ``<f:asset.css>``.
   * - ``Resources/Public/Assets/rte.css`` and ``preview.css``
     - Generated paired Vite CSS artifacts retained and checksummed by the StyleX manifest/build
       contract.
   * - ``Resources/Public/StylexManifest/stylex-manifest.json``
     - Generated key-to-class mapping and artifact checksums consumed by the StyleX Connector.

When ``Astryx.useVite: true``, ``AstryxPageLayout.html`` loads the registered extension
``frontend.entry.js`` through ``vite:asset`` and the consuming project's Vite manifest supplies
the asset URLs. Otherwise, the layout loads packaged ``astryx.css`` and ``astryx.js``. Select one
path for the extension frontend; do not load both. The RTE and preview use their separate
generated stylesheets as configured above.

Build and verification
======================

From ``typo3-astryx-demo/``, regenerate tokens before the full build after changing token or theme
sources, then let the build regenerate paired CSS, JS and manifests:

.. code-block:: bash

   ddev exec node packages/typo3_astryx/Build/generate-theme-bridge.mjs
   ddev exec npm run build
   ddev exec node packages/typo3_astryx/Build/verify-style-ownership.mjs
   ddev exec node packages/typo3_astryx/Build/verify-artifacts.mjs

Run ``ddev exec vendor/bin/typo3 stylex:validate --required-key=button.root`` when a recipe or
manifest key changes. Flush TYPO3 caches after manifest classes or rendered settings change. Keep
the CSS and matching StyleX manifest from one successful build together when deploying.

Related guidance: :ref:`styling`, :ref:`styling_themes` and :doc:`../Configuration/Index`.


Upstream references
===================

* `StyleX authoring principles <https://stylexjs.com/docs/learn/thinking-in-stylex/>`_
* `StyleX and Vite <https://stylexjs.com/docs/learn/installation/vite/>`_
* `StyleX API and theming <https://stylexjs.com/docs/api>`_
* `StyleX authoring reference <https://github.com/meta/stylex/blob/main/packages/docs/static/llm/stylex-authoring.md>`_
