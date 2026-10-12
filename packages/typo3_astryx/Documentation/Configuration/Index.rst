.. _configuration:

=============
Configuration
=============

TYPO3 Astryx is configured using TYPO3 Site Settings, Page properties (TCA overrides),
TypoScript, and Page TSconfig.

.. _configuration_site_settings:

Site Settings
=============

Site settings are managed through the TYPO3 backend module **Site Management > Settings**
or by editing ``config/sites/<site-identifier>/settings.yaml``.

All settings are grouped under the category **Astryx**.

Available Site Settings
------------------------

..  table:: Astryx Site Settings Reference
    :widths: 25 15 15 45

    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | Setting Key                   | Type    | Default                                     | Description & Usage                                                |
    +===============================+=========+=============================================+====================================================================+
    | ``Astryx.theme``              | string  | ``"neutral"``                               | The default design theme for the site. Available values:           |
    |                               |         |                                             | ``"neutral"``, ``"stone"``, or ``"ocean"``. Can be overridden      |
    |                               |         |                                             | on individual pages via page properties.                           |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.mode``               | string  | ``"system"``                                | The default color mode. Available values: ``"system"``,            |
    |                               |         |                                             | ``"light"``, or ``"dark"``. ``system`` follows the visitor's       |
    |                               |         |                                             | OS/browser preference.                                             |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.allowUserMode``      | bool    | ``true``                                    | Shows the light/dark mode switcher button in the header and        |
    |                               |         |                                             | saves the visitor's choice in browser local storage. Set to        |
    |                               |         |                                             | ``false`` to enforce the configured page or site color mode.       |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.showLanguageMenu``   | bool    | ``true``                                    | Shows the language selector in the header when the site has        |
    |                               |         |                                             | more than one enabled language in its site configuration.          |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.contentWidth``       | string  | ``"72rem"``                                 | Maximum content container width (e.g. ``"72rem"``,                 |
    |                               |         |                                             | ``"1280px"``). Constrains standard page and container grids.       |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.navigationRoot``     | int     | ``0``                                       | UID of the root page for the main top navigation menu.             |
    |                               |         |                                             | Value ``0`` defaults to the current site root.                     |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.footerRoot``         | int     | ``0``                                       | UID of the parent page for the footer navigation menu.             |
    |                               |         |                                             | Value ``0`` disables the footer link menu.                         |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.footerContentPage``  | int     | ``0``                                       | UID of a page containing editorial content elements (in            |
    |                               |         |                                             | ``colPos = 0``) to render as footer content. Value ``0``           |
    |                               |         |                                             | disables editorial footer rendering.                               |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.logo``               | string  | ``""``                                      | Relative path or extension reference to the site logo image        |
    |                               |         |                                             | (e.g. ``"EXT:my_site/Resources/Public/Images/logo.svg"``).         |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.logoAlt``            | string  | ``"Home"``                                  | Accessible alternative text for the logo link. Defaults to         |
    |                               |         |                                             | ``"Home"``.                                                        |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.pageViewPath``       | string  | ``"EXT:typo3_astryx/Resources/Private/``    | Path override for the PAGEVIEW template hierarchy (contains        |
    |                               |         | ``PageView/"``                              | ``Pages/``, ``Layouts/``, and ``Partials/``).                      |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.pinnedHeader``       | bool    | ``true``                                    | When enabled, keeps the main navigation header pinned to the       |
    |                               |         |                                             | top of the viewport during scrolling.                              |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.pinnedFooter``       | bool    | ``false``                                   | When enabled, keeps the footer bar pinned to the bottom of         |
    |                               |         |                                             | the viewport.                                                      |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+
    | ``Astryx.useVite``            | bool    | ``false``                                   | When enabled, loads frontend bundles built by the consuming        |
    |                               |         |                                             | project's Vite pipeline (``public/_assets/vite/``) rather          |
    |                               |         |                                             | than packaged extension assets.                                    |
    +-------------------------------+---------+---------------------------------------------+--------------------------------------------------------------------+

Example ``config/sites/<site-identifier>/settings.yaml``
--------------------------------------------------------

..  code-block:: yaml

    Astryx.theme: 'stone'
    Astryx.mode: 'system'
    Astryx.allowUserMode: true
    Astryx.showLanguageMenu: true
    Astryx.contentWidth: '72rem'
    Astryx.navigationRoot: 0
    Astryx.footerRoot: 14
    Astryx.footerContentPage: 15
    Astryx.logo: 'EXT:astryx_sitepackage/Resources/Public/Images/logo.svg'
    Astryx.logoAlt: 'Astryx Demo'
    Astryx.pinnedHeader: true
    Astryx.pinnedFooter: false
    Astryx.useVite: false

.. _configuration_page_properties:

Page-Level Theme and Mode Inheritance
=====================================

TYPO3 Astryx extends the ``pages`` table with two fields placed directly after the
**Backend Layout** selector in Page Properties:

1. **Astryx Theme** (``tx_astryx_theme``):
   - Options: ``Inherit`` (empty), ``Neutral`` (``neutral``), ``Stone`` (``stone``),
     or ``Ocean`` (``ocean``).
2. **Astryx Color Mode** (``tx_astryx_mode``):
   - Options: ``Inherit`` (empty), ``System`` (``system``), ``Light`` (``light``),
     or ``Dark`` (``dark``).

Inheritance Rules
-----------------

* Both fields inherit independently along the rootline.
* The nearest configured ancestor page wins.
* If all ancestors are set to ``Inherit``, the values fall back to the site settings
  ``Astryx.theme`` and ``Astryx.mode``.
* The selected theme sets the HTML root attribute ``data-astryx-theme="<theme>"``.
* The selected mode sets ``data-astryx-mode="<mode>"`` on ``<html>``.
* If ``Astryx.allowUserMode: true`` is enabled, a visitor's saved browser preference
  overrides the page color mode in the client.

.. _configuration_backend_layouts:

Backend Layouts
===============

Astryx supplies three backend layouts configured in Page TSconfig
(``Configuration/Sets/Astryx/PageTsConfig/backend_layouts.tsconfig``):

1. **Astryx Default** (``default``):
   - **Stage** (``colPos = 1``): Top full-width hero or header area.
   - **Main** (``colPos = 0``): Main page content.
2. **Astryx Sidebar** (``astryx_sidebar``):
   - **Stage** (``colPos = 1``): Top full-width stage area.
   - **Main** (``colPos = 0``): Main content area.
   - **Detail** (``colPos = 2``): Sidebar / secondary column. Stacks below Main on small viewports
     and displays alongside at ``60rem`` viewport width.
3. **Astryx App Shell** (``astryx_app_shell``):
   - **Stage** (``colPos = 1``): Stage area.
   - **Editorial Navigation** (``colPos = 3``): Left-hand navigation panel.
   - **Main** (``colPos = 0``): Central content.
   - **Detail** (``colPos = 2``): Right-hand detail panel. Displayed beside Main starting at ``90rem``
     viewport width.

.. _configuration_page_tsconfig:

Page TSconfig Settings
======================

The Astryx Site Set automatically includes:

* ``backend_layouts.tsconfig``: Registers the layout records and SVG icons.
* ``content_types.tsconfig``:
  - Hides the 17 standard FSC types that lack an Astryx renderer from the new content wizard
    and the CType dropdown (via ``TCEFORM.tt_content.CType.removeItems``).
  - Configures new content elements to default to Astryx Text:
    ``TCAdefaults.tt_content.CType = astryx_text``.
* ``rte.tsconfig``: Sets ``RTE.default.preset = astryx``.

.. _configuration_rte:

Rich Text Editor (CKEditor) Preset
==================================

Astryx provides a dedicated CKEditor preset registered in ``ext_localconf.php`` at
``EXT:typo3_astryx/Configuration/RTE/Default.yaml``.

Features:
* Clean semantic markup without inline style attributes or legacy font tags.
* Editor contents are scoped inside ``.ck-content`` with custom styling matching frontend typography.
* Scoped tokens from ``Resources/Public/Css/rte-tokens.css``.
* Supports bold, italic, strikethrough, headings (H2–H4), bullet/numbered lists, links (via TYPO3 Link Browser),
  tables, blockquotes, and code snippets.

.. _configuration_overrides:

Overriding Templates and Components
===================================

Overriding Page Layouts
-----------------------

Set ``Astryx.pageViewPath`` in your site settings to point to your custom site package directory:

..  code-block:: yaml

    Astryx.pageViewPath: 'EXT:my_sitepackage/Resources/Private/PageView/'

Overriding Native Fluid Components
----------------------------------

In your site package's ``Configuration/Fluid/ComponentCollections.php``, register your template
path under the ``Skom\Typo3Astryx\Components`` collection with a higher numeric priority:

..  code-block:: php

    <?php
    return [
        'Skom\Typo3Astryx\Components' => [
            'templatePaths' => [
                10 => 'EXT:typo3_astryx/Resources/Private/Components/',
                20 => 'EXT:my_sitepackage/Resources/Private/Components/',
            ],
            'templateNamePattern' => '{path}/{name}',
            'additionalArgumentsAllowed' => false,
        ],
    ];

Overriding Content Block Templates
----------------------------------

Content Block frontend and preview templates can be customized via TypoScript root paths:

..  code-block:: typoscript

    lib.contentBlock {
        partialRootPaths.20 = EXT:my_sitepackage/Resources/Private/Partials/
        layoutRootPaths.20 = EXT:my_sitepackage/Resources/Private/Layouts/
    }
