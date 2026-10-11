.. _installation:

============
Installation
============

This chapter describes how to install and set up TYPO3 Astryx (``skom/typo3-astryx``) in a
TYPO3 v14 project.

.. _installation_prerequisites:

Prerequisites
=============

System Requirements
-------------------

* **PHP**: ``>= 8.3 < 8.5``
* **TYPO3 Core**: ``~14.3.0`` (including ``typo3/cms-core``, ``typo3/cms-fluid``,
  ``typo3/cms-frontend``, and ``typo3/cms-rte-ckeditor``)
* **MariaDB** or **MySQL**: MariaDB 10.6+ or MySQL 8.0+

Required TYPO3 Extensions
-------------------------

TYPO3 Astryx requires the following Composer packages:

* ``friendsoftypo3/content-blocks``: ``^2.4.10`` (provides the Content Blocks schema and rendering)
* ``b13/container``: ``^4.1`` (powers multi-column and single-column container elements)
* ``skom/stylex-connector``: ``dev-main`` (bridges TYPO3 Fluid with the StyleX manifest)
* ``praetorius/vite-asset-collector``: ``^1.18`` (asset collection and Vite integration)

Conflict with Fluid Styled Content
----------------------------------

..  important::
    **TYPO3 Astryx explicitly conflicts with Fluid Styled Content (FSC).**

    Astryx is designed to completely replace ``typo3/cms-fluid-styled-content``. Both extensions
    cannot be active simultaneously. Before installing Astryx, remove FSC from your Composer
    dependencies and remove its Site Set / TypoScript imports from your site configuration.

Frontend Build Requirements (Optional)
--------------------------------------

If you use the default packaged assets, no Node.js runtime or build step is required. If you
compile custom StyleX styles or consume the extension through Vite:

* **Node.js**: ``v22.x``
* **Vite**: ``^7.3.0``
* **StyleX Compiler**: ``@stylexjs/stylex: 0.19.1``, ``@stylexjs/unplugin``, and ``@babel/parser``

.. _installation_steps:

Installing in a New Project
===========================

Step 1: Require the Package via Composer
----------------------------------------

Run Composer from your project root:

..  code-block:: bash

    # If fluid-styled-content is installed, remove it first:
    composer remove typo3/cms-fluid-styled-content

    # Require TYPO3 Astryx and its pinned dependencies:
    composer require skom/typo3-astryx

Ensure that ``skom/stylex-connector`` is pinned to ``dev-main`` in your root ``composer.json``:

..  code-block:: json

    "require": {
        "skom/typo3-astryx": "^0.1.0",
        "skom/stylex-connector": "dev-main"
    }

Step 2: Activate the Site Set
-----------------------------

TYPO3 Astryx provides a reusable Site Set named ``skom/typo3-astryx``.

Option A: In Your Site Package
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In your custom site package's Site Set configuration
(``packages/my_sitepackage/Configuration/Sets/SitePackage/config.yaml``), declare the dependency:

..  code-block:: yaml

    name: my-vendor/site-package
    label: 'My Site Package'
    dependencies:
      - skom/typo3-astryx

Option B: In the Site Configuration Directly
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Alternatively, add the Site Set directly to your site configuration in
``config/sites/<site-identifier>/config.yaml``:

..  code-block:: yaml

    dependencies:
      - skom/typo3-astryx

Step 3: Update Database Schema and Clear Caches
-----------------------------------------------

Apply the database schema additions and flush system caches:

..  code-block:: bash

    vendor/bin/typo3 cache:flush
    vendor/bin/typo3 extension:setup

..  note::
    ``vendor/bin/typo3 extension:setup`` creates the required database tables, including the
    Content Block collection tables (``tx_astryx_list_item``, ``tx_astryx_table_item``,
    ``tx_astryx_table_cell``, ``tx_astryx_card_grid_item``, ``tx_astryx_accordion_item``,
    and ``tx_astryx_carousel_item``).

Step 4: Select Asset Delivery Mode
----------------------------------

Astryx supports two asset delivery modes:

1. **Packaged Assets (Default)**:
   Pre-compiled frontend and editor stylesheets/scripts are served directly from
   ``EXT:typo3_astryx/Resources/Public/Assets/``. This mode requires no Node build pipeline
   on your web server. Site setting: ``Astryx.useVite: false``.
2. **Consuming Vite Integration**:
   The consuming site package compiles frontend assets via Vite and ``praetorius/vite-asset-collector``,
   reading from ``Configuration/ViteEntrypoints.json``. Site setting: ``Astryx.useVite: true``.

.. _installation_migration:

Migrating an Existing FSC Site
==============================

If you are migrating an existing TYPO3 site from ``typo3/cms-fluid-styled-content`` to Astryx,
follow this structured migration workflow:

Workflow Steps
--------------

1. **Full Backup**:
   Export your database (``mysqldump``) and create a full backup of ``fileadmin/`` and FAL storages.
   Record the current Composer lock state and Git commit hash.
2. **Inventory Records**:
   Audit all existing ``tt_content`` records, checking for CTypes, hidden/deleted records,
   workspace versions, and multi-language records.
3. **Rehearse in an Isolated Environment**:
   Perform the migration first on a staging or local DDEV fixture before touching production.
4. **Switch Composer Requirements**:
   Remove ``typo3/cms-fluid-styled-content`` and add ``skom/typo3-astryx`` in the same Composer
   operation:

   ..  code-block:: bash

       composer remove typo3/cms-fluid-styled-content
       composer require skom/typo3-astryx
       composer update

5. **Flush Caches and Apply Schema**:

   ..  code-block:: bash

       vendor/bin/typo3 cache:flush
       vendor/bin/typo3 extension:setup

6. **Run Migration Dry Run**:
   Execute the migration console command in dry-run mode (read-only):

   ..  code-block:: bash

       vendor/bin/typo3 astryx:migrate

   Review the JSON output. If any records appear under ``manualReview``, investigate them.
   The migration tool refuses to apply changes if unsupported types, deleted records, or draft
   workspace versions are detected.
7. **Apply Migration with Report**:
   When all records are accounted for, run the migration with ``--apply`` and a mandatory
   absolute path for the audit report file:

   ..  code-block:: bash

       vendor/bin/typo3 astryx:migrate --apply --report=/var/backup/astryx-migration-report.json

   ..  caution::
       The report file path must be absolute, must **not** already exist, and must be located
       **outside** the web root (outside ``public/``). It saves the full pre-migration state
       of every modified record before writing changes through TYPO3's ``DataHandler``.

8. **Verify and Flush**:
   Flush caches and run a second dry run, which should report zero pending changes:

   ..  code-block:: bash

       vendor/bin/typo3 cache:flush
       vendor/bin/typo3 astryx:migrate

CType Mapping Matrix
--------------------

The migration command maps supported legacy FSC content types losslessly:

..  table:: CType Migration Mapping
    :widths: 30 35 35

    +-------------------------------+---------------------------+----------------------------------------------+
    | FSC Source CType              | Astryx Target CType       | Handling & Notes                             |
    +===============================+===========================+==============================================+
    | ``header``                    | ``astryx_heading``        | Preserves core header, layout, link, etc.    |
    +-------------------------------+---------------------------+----------------------------------------------+
    | ``text``                      | ``astryx_text``           | Preserves core bodytext and RTE formatting   |
    +-------------------------------+---------------------------+----------------------------------------------+
    | ``textmedia``, ``textpic``,   | ``astryx_textmedia``      | Preserves FAL image and assets relations,    |
    | ``image``                     |                           | bodytext, and orientation settings           |
    +-------------------------------+---------------------------+----------------------------------------------+
    | ``div``                       | ``astryx_divider``        | Maps to Astryx horizontal divider            |
    +-------------------------------+---------------------------+----------------------------------------------+
    | ``uploads``                   | ``astryx_downloads``      | Preserves core ``media`` FAL file relations  |
    +-------------------------------+---------------------------+----------------------------------------------+
    | ``menu_sitemap``,             | Retained CType            | Rendered with native Astryx components       |
    | ``menu_subpages``,            | (same CType identifier)   | (``astryx:treeList``, ``astryx:sideNav``)    |
    | ``menu_pages``                |                           |                                              |
    +-------------------------------+---------------------------+----------------------------------------------+
    | ``shortcut``                  | Retained CType            | Uses native RECORDS reference renderer       |
    +-------------------------------+---------------------------+----------------------------------------------+
    | ``html``                      | Retained CType            | Rendered with sanitized HTML standard wrap   |
    +-------------------------------+---------------------------+----------------------------------------------+
    | ``bullets``, ``table``        | Manual Conversion         | Convert manually to Collection-based list /  |
    |                               |                           | table Content Blocks                         |
    +-------------------------------+---------------------------+----------------------------------------------+
    | Dedicated Plugins             | Unchanged                 | Plugin registration is fully preserved       |
    +-------------------------------+---------------------------+----------------------------------------------+

.. _installation_rollback:

Rollback Procedure
==================

If you must revert a migration:

1. Restore the prior Git commit and Composer lock file.
2. Run ``composer install``.
3. Restore the database dump and FAL storage backup taken prior to migration.
4. Flush caches: ``vendor/bin/typo3 cache:flush``.
5. Verify that legacy FSC rendering is restored.

..  note::
    Do not attempt to replay the JSON migration report directly back into a database where
    TCA definitions have changed. Full recovery relies on the database dump.
