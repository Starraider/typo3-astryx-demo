.. _migration:

=========
Migration
=========

This chapter guides you through auditing and migrating existing TYPO3 installations from
``typo3/cms-fluid-styled-content`` (FSC) to TYPO3 Astryx (``skom/typo3-astryx``).

.. _migration_overview:

Migration Strategy
==================

Astryx replaces Fluid Styled Content completely. Because Content Blocks structure data differently
from legacy FSC templates, the extension provides a built-in migration command:

..  code-block:: bash

    vendor/bin/typo3 astryx:migrate

The command executes safely:
* **Dry Run by Default**: When invoked without ``--apply``, the command performs a read-only audit
  and outputs a JSON report showing proposed changes, retained records, and records requiring
  manual review.
* **Lossless Mappings Only**: It converts only verified, lossless CType mappings.
* **Safety Guards**: The command strictly **refuses** to apply changes if any record requires
  manual review, if records belong to draft workspaces, or if soft-deleted records are detected.
* **Audit Trail**: Applying changes requires a mandatory ``--report`` argument specifying an
  absolute path to a new file outside the web root. It records the exact pre-migration state of
  every record before making changes via TYPO3's ``DataHandler``.

.. _migration_step_by_step:

Step-by-Step Migration Guide
============================

Step 1: Create Full Backups
---------------------------

Before making any changes:

1. Create a full database dump using ``mysqldump``.
2. Create an archive of the entire ``fileadmin/`` directory and any custom FAL storages.
3. Record your current Git commit hash and ``composer.lock`` file.

Step 2: Inventory Existing Content Records
------------------------------------------

Audit your existing ``tt_content`` records to identify all CTypes in use:

..  code-block:: sql

    SELECT CType, COUNT(*) as count FROM tt_content WHERE deleted = 0 GROUP BY CType;

Take note of:
* Standard content types (``header``, ``text``, ``textmedia``, ``textpic``, ``image``, ``uploads``, ``div``).
* Structured elements (``bullets``, ``table``) which require manual conversion.
* Custom plugins or third-party extension elements.
* Records in draft workspaces (``t3ver_wsid != 0``).

Step 3: Rehearse on a Non-Production Instance
---------------------------------------------

Never perform your first migration run directly on production. Restore the database and files into
a local DDEV or staging environment to test the procedure.

Step 4: Update Composer Dependencies
------------------------------------

Remove ``typo3/cms-fluid-styled-content`` and require ``skom/typo3-astryx`` in the same operation:

..  code-block:: bash

    composer remove typo3/cms-fluid-styled-content
    composer require skom/typo3-astryx
    composer update

Ensure ``skom/stylex-connector`` is pinned to ``dev-main`` in your root ``composer.json``.

Step 5: Update Database Schema and Clear Caches
-----------------------------------------------

..  code-block:: bash

    vendor/bin/typo3 cache:flush
    vendor/bin/typo3 extension:setup

This installs the schema for Content Block collection tables and adds Astryx TCA columns.

Step 6: Run Migration Audit (Dry Run)
-------------------------------------

Run the migration command in dry-run mode:

..  code-block:: bash

    vendor/bin/typo3 astryx:migrate

The command outputs a JSON audit with four sections:
* ``mode``: ``"dry-run"``
* ``changes``: Proposed automatic migrations.
* ``retained``: Records whose CType remains identical (e.g. ``menu_sitemap``, ``shortcut``, ``html``).
* ``manualReview``: Records preventing automatic migration.

Step 7: Resolve Manual Review Items
-----------------------------------

If the ``manualReview`` array is not empty, address each reported item:

1. **Draft Workspace Records**: Publish or discard pending workspace changes.
2. **Soft-Deleted Records**: Permanently purge deleted records via the TYPO3 Recycler or a cleanup task.
3. **Structured Types (``bullets``, ``table``)**: Re-create these elements as Astryx List and Astryx
   Table Content Blocks before proceeding.
4. **Unsupported Menu Types**: Convert unsupported menu types (e.g. ``menu_abstract``,
   ``menu_recently_updated``) to standard pages or supported menus.

Step 8: Apply Migration with Audit Report
-----------------------------------------

Once ``manualReview`` is completely empty, run the command with ``--apply`` and specify a private
absolute report path:

..  code-block:: bash

    vendor/bin/typo3 astryx:migrate --apply --report=/var/backup/astryx-migration-before.json

..  caution::
    The ``--report`` path must:
    * Be an **absolute** path (e.g. ``/var/backup/...``).
    * Point to a file that does **not** already exist.
    * Be located **outside** the public web root (outside ``public/``).

TYPO3's ``DataHandler`` applies the changes, ensuring workspace safety, history logging, and
cache tagging are respected.

Step 9: Post-Migration Verification
-----------------------------------

Flush caches and execute another dry run to confirm zero remaining changes:

..  code-block:: bash

    vendor/bin/typo3 cache:flush
    vendor/bin/typo3 astryx:migrate

Inspect all migrated pages in the frontend to verify that media relations, headings, links,
and rich text format correctly.

.. _migration_mapping_details:

Detailed CType Mapping Reference
================================

..  table:: Automatic and Manual CType Mappings
    :widths: 20 25 55

    +-----------------------+-----------------------+-----------------------------------------------------------+
    | FSC CType             | Astryx CType          | Migration Behavior                                        |
    +=======================+=======================+===========================================================+
    | ``header``            | ``astryx_heading``    | Reuses core header, layout, position, and link.           |
    +-----------------------+-----------------------+-----------------------------------------------------------+
    | ``text``              | ``astryx_text``       | Reuses core bodytext; styled with Astryx typography.      |
    +-----------------------+-----------------------+-----------------------------------------------------------+
    | ``textmedia``,        | ``astryx_textmedia``  | Reuses core bodytext, image/assets relations, and image   |
    | ``textpic``,          |                       | orientation settings.                                     |
    | ``image``             |                       |                                                           |
    +-----------------------+-----------------------+-----------------------------------------------------------+
    | ``div``               | ``astryx_divider``    | Maps to Astryx horizontal divider.                        |
    +-----------------------+-----------------------+-----------------------------------------------------------+
    | ``uploads``           | ``astryx_downloads``  | Reuses core ``media`` FAL relation.                       |
    +-----------------------+-----------------------+-----------------------------------------------------------+
    | ``menu_sitemap``      | ``menu_sitemap``      | Retained CType; rendered via ``astryx:treeList``.         |
    +-----------------------+-----------------------+-----------------------------------------------------------+
    | ``menu_subpages``     | ``menu_subpages``     | Retained CType; rendered via ``astryx:sideNav``.          |
    +-----------------------+-----------------------+-----------------------------------------------------------+
    | ``menu_pages``        | ``menu_pages``        | Retained CType; rendered via ``astryx:sideNav``.          |
    +-----------------------+-----------------------+-----------------------------------------------------------+
    | ``shortcut``          | ``shortcut``          | Retained CType; rendered via RECORDS content object.      |
    +-----------------------+-----------------------+-----------------------------------------------------------+
    | ``html``              | ``html``              | Retained CType; rendered with ``htmlSanitize = 1``.       |
    +-----------------------+-----------------------+-----------------------------------------------------------+
    | ``bullets``           | Manual (``astryx_list``)| Convert manually to the Collection-based List block.    |
    +-----------------------+-----------------------+-----------------------------------------------------------+
    | ``table``             | Manual (``astryx_table``)| Convert manually to the Collection-based Table block.   |
    +-----------------------+-----------------------+-----------------------------------------------------------+

Handling Legacy ``image`` Records
---------------------------------

The migration command maps legacy ``image`` records to ``astryx_textmedia``. For dedicated image
galleries without accompanying text, editors can manually convert these records to **Image Only**
(``astryx_image_only``) in the backend to take advantage of multi-column grid layouts and fixed
aspect ratios.

.. _migration_rollback:

Rollback Instructions
=====================

In the event of an unforeseen issue during production migration:

1. Stop editorial work on the site.
2. Restore the previous Git commit and ``composer.lock`` file.
3. Run ``composer install`` to restore ``typo3/cms-fluid-styled-content``.
4. Restore your database dump and FAL storage backup together.
5. Flush system caches: ``vendor/bin/typo3 cache:flush``.
6. Re-verify the frontend output.

..  warning::
    Never attempt to roll back a migration by re-executing the JSON report against a live database.
    The report is an audit record of previous values, not an automated reversal script.
    A reliable rollback always uses the full database dump.
