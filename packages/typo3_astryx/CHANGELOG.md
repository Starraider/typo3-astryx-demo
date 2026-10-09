# Changelog

## Unreleased

- Add TYPO3's core heading Alignment and Link fields to all 20 content types; Default aligns left, and linked headings use the theme link color.
- Share heading rendering across Card, Hero, Classic Gallery, Code Block, Divider and legacy elements; replace Hero's editor-facing heading alignment control while retaining its stored legacy values.
- Add a Classic Gallery lightbox with original image proportions, previous/next navigation, image counter, FAL captions and keyboard controls.
- Add Classic Gallery with a centered intro, category filters and rounded 3:2 image tiles.
- Allow one to six images per row, default four; expand incomplete rows evenly, including filtered results.
- Include a thumbnail backend preview, translated controls, keyboard filtering and a gallery that remains visible without JavaScript.

## 0.1.0-rc.2

- Define uid and its primary key explicitly for all six collection tables, including installation before generated TCA is cached.
- Add a database regression check for fresh identity allocation and the resolved TYPO3 schema comparison.
- Document recovery of partially installed collection tables without dropping data.

## 0.1.0-rc.1

Initial native Fluid adaptation for TYPO3 14.3, with 14 Content Blocks, three page layouts and three themes.
