.. _styling:

=======
Styling
=======

TYPO3 Astryx uses **StyleX** for component recipes and design variables, with
``skom/stylex-connector`` resolving compiled classes in native Fluid templates. This guide
defines the source layout, naming rules, theme model and build steps for the extension and its
consuming sitepackage.

StyleX and upstream Astryx document APIs and design principles; neither mandates a particular
folder hierarchy for this TYPO3 project. The conventions below are the project's source contract.

.. _styling_architecture:

Architecture and source layout
==============================

Keep authored sources under the package that owns them. The reusable extension owns shared UI,
semantic token families and built-in themes. A Content Block owns a recipe or supporting rule
that is used only by that block. The consuming sitepackage owns its brand styles and assets.

..  code-block:: text

    packages/
      typo3_astryx/
        Resources/Private/JavaScript/
          frontend.entry.js
          rte-editor.entry.js
          backend-preview.entry.js
          StyleX/
            components/             # reusable native Fluid and page recipes
            tokens/                 # defineVars modules grouped by semantic family
              components/           # component-specific public token families
            themes/                 # one lowercase theme module per theme identity
        ContentBlocks/ContentElements/<block-name>/
          src/                      # styles owned by this block only
        Resources/Private/CSS/
          themes.css                # generated complete CSS token bridge
          layers.css                # cascade layer contract
      astryx_sitepackage/
        Resources/Private/JavaScript/
          site.entry.js
          StyleX/components/        # sitepackage-owned recipes, when needed
        Resources/Private/CSS/
          main.css                  # product-layer overrides and site CSS

Use lowercase kebab-case for StyleX source folders and filenames. Give every ``.stylex.js``
file a unique basename within its package manifest because the connector also creates basename
aliases from those names. Fluid component filenames and the public Fluid recipe names remain
PascalCase; their manifest keys use the lowercase recipe module basename, for example ``Button``
resolves to ``button.root``.

Use the source folder for authored files and the ``Resources/Public`` folders for generated
assets. Never edit the generated StyleX manifests, compiled CSS or JavaScript, checksums,
``Build/theme-tokens.json`` or ``Resources/Private/CSS/themes.css`` by hand.

Token groups and StyleX recipes
===============================

Token sources use ``stylex.defineVars`` and one named export per file. The family is both a
discovery boundary and a variable group that themes may override. ``Build/design-tokens.json``
lists every family and theme source; the bridge and ownership verifier use this explicit contract.

..  list-table:: Token source families
    :header-rows: 1

    * - Family
      - Source location
      - Example public names
    * - Color roles
      - ``StyleX/tokens/color-tokens.stylex.js``
      - ``--astryx-color-text-primary``, ``--astryx-color-background-surface``
    * - Category and code colors
      - ``StyleX/tokens/category-color-tokens.stylex.js`` and ``code-color-tokens.stylex.js``
      - ``--astryx-color-category-blue-background``, ``--astryx-color-code-syntax-keyword``
    * - Typography, spacing, layout, shape, shadow and motion
      - ``StyleX/tokens/<family>-tokens.stylex.js``
      - ``--astryx-typography-heading-1-font-size``, ``--astryx-spacing-4``
    * - Component tokens
      - ``StyleX/tokens/components/<component>-tokens.stylex.js``
      - ``--astryx-component-button-size-large-font-size``

Name public CSS variables with the stable namespace ``--astryx-`` followed by lowercase
kebab-case semantic segments. Use a predictable order:

``--astryx-{domain}-{role}-{variant-or-state}-{property}``

Not every token needs every segment. Examples include ``--astryx-color-accent``,
``--astryx-color-status-success``, ``--astryx-shape-radius-container``,
``--astryx-motion-duration-fast`` and ``--astryx-component-notice-variant-error-foreground``.
Choose names by intended role, not by a current hex value, theme, mode or a component's incidental
CSS declaration. Add a component segment only for a deliberate themeable component contract.

Keep mode and theme identity out of token names. A semantic token such as
``--astryx-color-text-primary`` resolves in Neutral, Stone and Ocean and may use paired
``light-dark()`` values. This keeps recipes independent of a selected theme.

In StyleX recipes, import the ``defineVars`` export and reference the token directly. Avoid
spelling public ``var(--astryx-...)`` references in recipe declarations:

..  code-block:: javascript

    import * as stylex from '@stylexjs/stylex';
    import {colorTokens} from '../tokens/color-tokens.stylex.js';

    export const styles = stylex.create({
      root: {
        color: colorTokens['--astryx-color-text-primary'],
        backgroundColor: colorTokens['--astryx-color-background-surface'],
      },
    });

Use CSS custom properties in supporting CSS where CSS must consume a public token. A recipe-local
custom property is an implementation detail: keep it in its owning recipe or block stylesheet and
do not add it to the public token families. Site-specific overrides belong in the final
``product`` cascade layer.

.. _styling_themes:

Theme strategy
==============

Theme identity and color mode are independent axes. **Neutral**, **Stone** and **Ocean** are
theme identities; ``system``, ``light`` and ``dark`` are modes. The selected theme maps stable
semantic roles to values, while mode-aware color values use ``light-dark()`` and the element's
``color-scheme``. Do not create separate Ocean Light/Ocean Dark theme identities.

Each theme lives in a lowercase kebab-case file under ``StyleX/themes/`` and uses
``stylex.createTheme`` to override the relevant variable groups. Keep theme inputs sparse when a
token should inherit its default. Themes share the same public token schema; the bridge resolves
all defaults and overrides into a complete set for each theme. This complete output is required
for nested theme boundaries and for TYPO3 editor/preview CSS.

When adding a theme:

#. Create a file such as ``themes/forest-theme.stylex.js``. Import only the token groups it
   overrides and export a named ``createTheme`` value for each changed group.
#. Add its lowercase name and source path to ``Build/design-tokens.json``.
#. Import the theme module from ``Resources/Private/JavaScript/frontend.entry.js`` so StyleX compiles
   it into the frontend manifest.
#. Run ``Build/generate-theme-bridge.mjs``. It validates the static source contract and generates
   the fully resolved theme map and scoped CSS bridge.
#. Build and verify frontend, RTE and backend preview output. Check the new theme in light and dark
   modes and in a nested theme boundary.

Theme variables are scoped to ``[data-astryx-theme="<name>"]``. The Neutral values also provide
the default scope for ``.ck-content`` and ``.astryx-preview``. Keep editor and preview styling
scoped so theme values do not leak into unrelated TYPO3 backend chrome. The page theme and mode
fields, system settings and optional visitor preference are resolved by the extension; preserve
that runtime contract when changing the theme catalogue.

The palettes should map to semantic roles such as text, surface, border, accent, status, code and
category colors. Review foreground/background pairings together for contrast. Treat generated
palette values as candidates: map them to roles and review the resulting pairings before adding
them to a theme. Record upstream sources, licenses and local adaptations in the existing
provenance files.

.. _styling_site_overrides:

Sitepackage overrides
=====================

Put product branding in the consuming site's CSS and the final ``product`` layer. This is useful
for packaged and Vite assets alike:

..  code-block:: css

    @layer product {
      :root {
        --astryx-color-accent: light-dark(#6a287e, #e9acf7);
        --astryx-color-on-accent: light-dark(#ffffff, #31103b);
        --astryx-shape-radius-element: 6px;
        --astryx-layout-content-max-width: 80rem;
      }
    }

Prefer overriding semantic variables to targeting generated atomic class names. Keep the source
under the sitepackage; do not copy extension token modules or generated styles into the consuming
package. If the site needs its own reusable StyleX recipe, place it under
``astryx_sitepackage/Resources/Private/JavaScript/StyleX/components/`` and import it from that
package's ``site.entry.js``.

Recipe ownership and naming
===========================

Use these ownership rules:

* Keep reusable native Fluid component recipes such as ``button.stylex.js`` and
  ``heading.stylex.js`` in ``Resources/Private/JavaScript/StyleX/components/``.
* Keep page chrome recipes centrally when they are consumed by page templates.
* Keep recipes used only by one Content Block in
  ``ContentBlocks/ContentElements/<block-name>/src/<recipe-name>.stylex.js``. Name the module
  after its component or styling responsibility. A generic name does not make a one-block recipe
  shared.
* Keep block-owned CSS and preview CSS in the same block's ``src/`` directory.
* Import every frontend recipe from ``frontend.entry.js``. RTE and preview entrypoints import the
  token index and their scoped CSS entrypoint.
* Use finite static recipe keys. Keep the Fluid ``ax:recipe`` allowlist, module exports and
  ``Build/recipes.json`` synchronized; never hard-code generated atomic class names.

The connector exposes aliases based on the lowercase module basename, for example
``button.root``, ``notice.variant_error`` and ``carousel-control.kind_arrow``. Public Fluid
components can retain PascalCase names such as ``Button`` for template readability.

The public CSS variable rename in this refactor is breaking for custom CSS, templates and themes
that used the former token names. There are no compatibility aliases. Update those consumers using
the [token migration table](TokenMigration.rst).

Build and verification
======================

Run commands from the consuming TYPO3 project root, using DDEV for the project's pinned runtime:

..  code-block:: bash

    # Regenerate complete theme CSS from source tokens and sparse theme overrides.
    ddev exec node packages/typo3_astryx/Build/generate-theme-bridge.mjs

    # Full Vite and extension asset build, finalization and verification.
    ddev exec npm run build

    # Run the StyleX source ownership and generated artifact audits directly.
    ddev exec node packages/typo3_astryx/Build/verify-style-ownership.mjs
    ddev exec node packages/typo3_astryx/Build/verify-artifacts.mjs

The build updates the consuming site's and extension's Vite assets and StyleX manifests. Deploy
the resulting CSS, JavaScript, fonts, lazy chunks and manifests together. If a recipe basename or
source path changes, rebuild both manifests and flush TYPO3 caches so Fluid resolves the new
aliases.

For additional StyleX and integration details, see the [build runbook](../../../../doc/Build.md).

.. toctree::
    :hidden:

    TokenMigration
