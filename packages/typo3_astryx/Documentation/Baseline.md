# Baseline, 5 October 2026

Integration project starts at Git commit 2419ca1. PHP 8.3.30, Node 22.23.3, DDEV 1.25.1.
Database contains 9 text, 3 textpic, 1 menu_sitemap and 1 menu_subpages records.
All 14 records use the default language/live workspace and are visible. TYPO3 14 has no list_type column.
Pages 1–11 use default/subpage layouts and columns 0/1. Preserve footer page 2 and its children.
Database backup: /tmp/typo3-astryx-before-build.sql.gz.
FAL backup: /tmp/typo3-astryx-fileadmin-before-build.tar.gz.
Durable local copies: `var/backups/before-astryx.sql.gz` and `var/backups/before-astryx-fileadmin.tar.gz`. Backups are private and excluded from package/source control.
Root and site package initially required FSC. Their coordinated update now installs Astryx and removes FSC.
