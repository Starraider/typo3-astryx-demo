# Installation and migration

New consumers install the package with TYPO3 14.3, Content Blocks 2.4, container 4.1, StyleX Connector and Vite Asset Collector. FSC must be absent. The current connector has no verified stable 2.0 release; keep the tested `dev-main` commit pinned in the root Composer requirement and lock.
Use Site Set `skom/typo3-astryx`, or make your site package set depend on it. Optional installed sets `typo3/felogin` and `typo3/form` supply their own plugin settings. Site URLs, root IDs and languages belong in `config/sites/<id>/`.

Packaged assets are the default. `Astryx.useVite: true` opts into a consuming Vite pipeline with registered extension entrypoints. Do not load both paths.
Set `Astryx.logo`, `Astryx.logoAlt`, `Astryx.navigationRoot`, `Astryx.footerRoot` and `Astryx.footerContentPage` in site/site-package settings. Navigation root zero means the site root; footer root zero disables that menu. Editorial footer content comes from a configured page, not hardcoded settings.
Override page hierarchy through `Astryx.pageViewPath`. Override component paths with a higher numeric key in your extension's ComponentCollections.php entry for the existing collection namespace. Content Block partial/layout paths use numeric TypoScript keys; preview partial paths use `tx_content_blocks.view.partialRootPaths` in Page TSconfig.

## Existing sites

1. Export the database and back up fileadmin/FAL storage. Record the current source and Composer lock state.
2. Inventory all CTypes, hidden/deleted records, languages, draft versions and nested content. Rehearse in a restored, separate FSC-free fixture.
3. Prepare root and site-package manifests together: remove both FSC requirements and set dependencies, require Astryx through the path repository and resolve Composer in one update.
4. Flush old TCA caches with `vendor/bin/typo3 cache:flush`, then install the extension/schema with `vendor/bin/typo3 extension:setup`. Verify new fields exist before migration. Then run `vendor/bin/typo3 astryx:migrate`. Default behavior is a read-only dry run.
5. Inspect manualReview. The command refuses apply if any record is unsupported, deleted or in a draft workspace. Resolve those records explicitly first.
6. Apply with `vendor/bin/typo3 astryx:migrate --apply --report=/private/path/astryx-before.json`. The report path must be new, absolute and outside public/. It records old CType/layout values before writes. DataHandler performs the changes.
7. Flush caches, rebuild and verify every inventoried page, relations, links, plugins and counts. A second dry run must report no changes.

| Source | Handling |
| --- | --- |
| header, text | heading, text blocks; core fields retained |
| textmedia, textpic, image | textmedia block; both original image/assets FAL fields retained |
| div | divider block |
| uploads | downloads block using original media field |
| menu_sitemap, menu_subpages, menu_pages | retained CType fields with core menu processors |
| shortcut | retained record-reference renderer; TYPO3's RECORDS recursion/visibility handling |
| html | retained sanitized HTML; remove scripts, handlers and unsafe schemes; restrict editor permissions |
| bullets, table | manual structured conversion to Collection-based list/table blocks |
| other menu types | explicit integrator conversion; apply refuses unknown records |
| legacy list_type | TYPO3 14 removed this column; use the original extension's dedicated CType migration |
| dedicated plugins | leave installed plugin registrations and configuration unchanged |

For new image grids, choose **Image Only** (`astryx_image_only`) in the content wizard. It reuses the core image relations but has its own column and aspect selectors. The migration command still maps legacy `image` records to Textmedia; it does not automatically translate FSC image-column, link or layout options into Image Only. Review those options before manually switching an existing record.

The shipped command intentionally does not guess at structured data conversion or draft/deleted records. The provided starter has no such variants; see its inventory and rehearsal evidence. Adding support for another existing site requires its own mappings and tests.

## Rollback

Stop editing, restore the prior Composer manifests/lock and source snapshot, reinstall those exact packages, and restore the database export plus FAL backup together. Flush TYPO3 caches and restore the matching assets/manifests.
Do not replay a CType before-state report into a database with incompatible TCA. Reports are an audit record, not a replacement for a restorable backup. Keep migration reports outside the web root and source control.

## Recovery from the RC.1 collection schema failure

The RC.1 bootstrap could create collection tables before their generated TCA was available, leaving them without uid. Later database updates split the auto-increment column and primary-key additions into separate statements, causing MariaDB's auto-column/key errors. RC.2 declares both in ext_tables.sql so new tables are created with a valid identity from the start.

Back up an affected database and inspect its collection tables. For a table that exists but has no uid column, add the column and its key together in one statement:

```sql
ALTER TABLE tx_astryx_list_item
    ADD COLUMN uid int(11) unsigned NOT NULL AUTO_INCREMENT FIRST,
    ADD PRIMARY KEY (uid);
```

Apply this only to tables confirmed to be missing uid. The six possible tables are tx_astryx_list_item, tx_astryx_table_item, tx_astryx_table_cell, tx_astryx_card_grid_item, tx_astryx_accordion_item and tx_astryx_carousel_item. The statement preserves their existing columns and rows. Then flush system caches, run extension:setup and repeat TYPO3's database comparison. No collection tables need to be dropped.
