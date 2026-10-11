.. _styling:

=======
Styling
=======

TYPO3 Astryx uses **StyleX** for component styling, backed by ``skom/stylex-connector`` to
integrate compiled atomic classes seamlessly into TYPO3 Fluid templates.

This chapter details the styling architecture, the design token system, and how to adapt,
customize, and extend styles for your project.

.. _styling_stylex_architecture:

StyleX Architecture in TYPO3
============================

Why StyleX?
-----------

* **Atomic CSS**: Every CSS declaration is compiled to a single atomic utility class. No CSS
  is duplicated, keeping bundle sizes minimal regardless of site scale.
* **Deterministic Specificity**: Specificity collisions are eliminated at compile time by sorting
  declarations into CSS Cascade Layers (``priority1`` through ``priority5``).
* **Zero Runtime Overhead**: All class names and CSS rules are computed ahead of time during
  the Vite build. The browser executes no styling JavaScript at runtime.
* **Type-Safe Design Tokens**: Colors, spacing, radii, and typography are defined in structured
  JavaScript modules and shared across components and themes.

How ``skom/stylex-connector`` Works
------------------------------------

The connector bridges the Vite/StyleX build pipeline with TYPO3's PHP rendering engine:

1. **Build Step**: During the build, the StyleX unplugin compiles all ``.stylex.js`` modules
   and generates a JSON manifest (``Resources/Public/StylexManifest/stylex-manifest.json``).
   This manifest maps human-readable recipe keys (such as ``AstryxButton.root`` or
   ``AstryxButton.variant_primary``) to generated atomic class strings (e.g. ``x1j234 x5k998``).
2. **Registration in TYPO3**: The extension registers its manifest in ``ext_localconf.php``:

   ..  code-block:: php

       \Vendor\StylexConnector\Configuration\StylexRegistry::registerManifest(
           'typo3_astryx',
           'EXT:typo3_astryx/Resources/Public/StylexManifest/stylex-manifest.json'
       );

3. **Fluid Resolution**: Fluid templates resolve classes dynamically through the connector:

   Using the Recipe ViewHelper (Recommended for Astryx components):

   ..  code-block:: html

       <button class="{ax:recipe(name: 'Button', options: {variant: 'primary', size: 'large'})}">
           Click Me
       </button>

   Using the Connector's Direct ViewHelper:

   ..  code-block:: html

       <div class="{stylex:class(key: 'AstryxCard.root')}">
           Card Content
       </div>

.. _styling_cascade_layers:

CSS Cascade Layers and Specificity
==================================

Astryx organizes all styles into explicit CSS cascade layers defined in
``Resources/Private/CSS/layers.css``:

..  code-block:: css

    @layer reset, astryx-base, priority1, priority2, priority3, priority4, priority5, astryx-theme, product;

Layer Hierarchy (from lowest to highest priority):
1. ``reset``: Box sizing, baseline normalization, and margin resets.
2. ``astryx-base``: Core typography, prose rules, and layout containers.
3. ``priority1`` to ``priority5``: **Reserved for StyleX atomic CSS rules.** The compiler assigns
   classes to priority layers based on property importance.
4. ``astryx-theme``: Scoped theme variables (``--astryx-*``) generated from theme sources.
5. ``product``: **Reserved for sitepackage branding and integrator overrides.**

..  important::
    Because ``product`` is the highest cascade layer, any CSS written in ``@layer product``
    overrides StyleX atomic rules cleanly and deterministically—without resorting to
    ``!important`` or overly complex CSS selectors.

.. _styling_design_tokens:

Design Tokens and Themes
========================

Built-in Themes
---------------

Astryx includes three pre-configured themes in ``Resources/Private/JavaScript/Stylex/Themes/``:

* **Neutral** (Default): A clean, modern neutral palette with Figtree typography and balanced
  grays.
* **Stone**: Adapted from upstream Astryx design system (v0.6.7). Uses **Montserrat** for headings,
  **Figtree** for body text, and **JetBrains Mono** for code. Features warm neutral backgrounds,
  pill buttons, and pastel status surfaces.
* **Ocean**: A cool, refined corporate palette featuring ocean blues and crisp borders.

Color Modes
-----------

Each theme defines complete token sets for both **Light** and **Dark** modes:

* Selected via ``Astryx.mode`` site setting (``system``, ``light``, ``dark``).
* Inherited per page via the ``tx_astryx_mode`` page property.
* Toggled interactively by visitors via the header theme toggle (when ``Astryx.allowUserMode`` is true).
* Stored in the browser's ``localStorage`` and applied via ``data-astryx-mode="dark|light"`` on the
  ``<html>`` element.

Core Token Reference (``--astryx-*``)
--------------------------------------

Tokens are declared in ``tokens.stylex.js`` and exposed as CSS custom properties:

* **Surfaces & Backgrounds**: ``--astryx-body``, ``--astryx-surface``, ``--astryx-card``,
  ``--astryx-popover``
* **Text & Accents**: ``--astryx-text``, ``--astryx-text-secondary``, ``--astryx-accent``,
  ``--astryx-on-accent``
* **Borders**: ``--astryx-border``, ``--astryx-border-emphasis``
* **Border Radii**: ``--astryx-radius-sm``, ``--astryx-radius-md``, ``--astryx-radius-lg``,
  ``--astryx-radius-pill``
* **Spacing Tokens**: ``--astryx-space-1`` (2px), ``--astryx-space-2`` (4px), ``--astryx-space-3`` (8px),
  ``--astryx-space-4`` (16px), ``--astryx-space-5`` (24px)
* **Status Colors**: Categorical pairs for neutral, accent, success, warning, and error states.

.. _styling_adaptation_methods:

How to Adapt Styles to Your Requirements
========================================

Depending on your project's needs, there are three primary ways to customize Astryx styles:

Method 1: Sitepackage Branding via ``@layer product`` (No Build Required)
--------------------------------------------------------------------------

If you use packaged assets and want to adjust brand colors, fonts, or element radii, you can
simply override CSS tokens in your sitepackage stylesheet wrapped in ``@layer product``.

Example: ``packages/my_sitepackage/Resources/Public/Css/brand.css``:

..  code-block:: css

    @layer product {
        :root {
            /* Change primary brand accent */
            --astryx-accent: light-dark(#6a287e, #e9acf7);
            --astryx-on-accent: light-dark(#ffffff, #31103b);

            /* Adjust button and card corner roundness */
            --astryx-radius-element: 6px;

            /* Override site content maximum width */
            --astryx-content-width: 80rem;
        }

        /* Scoped brand theme for specific sections */
        .my-brand-section {
            --astryx-surface: light-dark(#fdf8ff, #1d1421);
            --astryx-border: light-dark(#e3d0eb, #43304d);
        }
    }

Include this CSS in your sitepackage's layout or TypoScript after the Astryx stylesheet.

Method 2: Customizing Themes and Tokens in JavaScript
-----------------------------------------------------

To modify the core token declarations or add a new theme:

1. **Edit or Add Theme Sources**:
   Create a new theme file under ``Resources/Private/JavaScript/Stylex/Themes/Custom.stylex.js``:

   ..  code-block:: javascript

       import * as stylex from '@stylexjs/stylex';
       import { colors, tokens } from '../tokens.stylex.js';

       export const customTheme = stylex.createTheme(tokens, {
           accent: { default: '#0066cc', [stylex.media.dark]: '#66b2ff' },
           onAccent: { default: '#ffffff', [stylex.media.dark]: '#001a33' },
           body: { default: '#f8fafc', [stylex.media.dark]: '#0f172a' },
           surface: { default: '#ffffff', [stylex.media.dark]: '#1e293b' },
       });

2. **Regenerate the Theme Bridge**:
   Run the theme bridge script from the Composer project root:

   ..  code-block:: bash

       node packages/typo3_astryx/Build/generate-theme-bridge.mjs

   This updates ``Resources/Private/CSS/themes.css`` and ``Build/theme-tokens.json``.
3. **Rebuild the Frontend Assets**:

   ..  code-block:: bash

       npm run build:astryx

Method 3: Creating and Extending StyleX Recipes
-----------------------------------------------

When building new Content Blocks or extending existing components with custom StyleX styles,
follow these project conventions:

Style Ownership Rules
~~~~~~~~~~~~~~~~~~~~~

* **Block-Owned Styles**: Any style or recipe used exclusively by one Content Block **must** be
  placed in ``ContentBlocks/ContentElements/<block-name>/src/Astryx<BlockName>.stylex.js``.
* **Shared Styles**: Recipes used by multiple independent blocks or native Fluid components live in
  ``Resources/Private/JavaScript/Stylex/``.
* **Unique Basenames**: Every ``.stylex.js`` file must have an extension-wide unique basename
  (e.g. ``AstryxNotice.stylex.js``).
* **Entrypoint Reachability**: All recipes must be imported in
  ``Resources/Private/JavaScript/Main.entry.js`` so Vite and the StyleX compiler process them.

Creating a Recipe
~~~~~~~~~~~~~~~~~

Example: ``ContentBlocks/ContentElements/promo-banner/src/AstryxPromoBanner.stylex.js``:

..  code-block:: javascript

    import * as stylex from '@stylexjs/stylex';
    import { tokens } from '../../../../Resources/Private/JavaScript/Stylex/tokens.stylex.js';

    export const promoBanner = stylex.create({
        root: {
            display: 'flex',
            alignItems: 'center',
            padding: tokens.space4,
            borderRadius: tokens.radiusMd,
            backgroundColor: tokens.surface,
            border: `1px solid ${tokens.border}`,
        },
        variant_highlight: {
            backgroundColor: tokens.accent,
            color: tokens.onAccent,
        },
        variant_subtle: {
            backgroundColor: tokens.body,
        },
    });

Registering the Recipe in ``Build/recipes.json``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Update ``Build/recipes.json`` to define the finite allowed options:

..  code-block:: json

    {
      "PromoBanner": {
        "variant": ["highlight", "subtle"]
      }
    }

Registering in ``RecipeViewHelper.php``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Add the recipe to ``Classes/ViewHelpers/RecipeViewHelper.php``:

..  code-block:: php

    'PromoBanner' => [
        'variant' => ['highlight', 'subtle'],
    ],

Importing in ``Main.entry.js``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Add the import to ``Resources/Private/JavaScript/Main.entry.js``:

..  code-block:: javascript

    import '../../../ContentBlocks/ContentElements/promo-banner/src/AstryxPromoBanner.stylex.js';

Consuming in Fluid
~~~~~~~~~~~~~~~~~~

In the Content Block's frontend template:

..  code-block:: html

    <div class="{ax:recipe(name: 'PromoBanner', options: {variant: data.banner_variant})}">
        <f:format.raw>{data.bodytext}</f:format.raw>
    </div>

.. _styling_build_pipeline:

Building and Verifying Assets
=============================

Available Build Commands
------------------------

Run commands from the consuming project root (e.g. within DDEV via ``ddev exec``):

..  code-block:: bash

    # Full production build: consuming Vite bundles + packaged extension assets
    ddev exec npm run build

    # Packaged extension assets only: theme bridge, Vite, finalization, verification
    ddev exec npm run build:astryx

    # Regenerate theme bridge CSS from StyleX token sources
    ddev exec node packages/typo3_astryx/Build/generate-theme-bridge.mjs

Pipeline Verification Commands
------------------------------

Verify your StyleX assets, recipes, and manifest integrity:

..  code-block:: bash

    # Validate that StyleX manifest contains required component keys:
    ddev exec vendor/bin/typo3 stylex:validate --required-key=AstryxButton.root

    # Verify style ownership conventions (checks location and unique basenames):
    ddev exec node packages/typo3_astryx/Build/verify-style-ownership.mjs

    # Verify built artifacts and checksums:
    ddev exec node packages/typo3_astryx/Build/verify-artifacts.mjs
