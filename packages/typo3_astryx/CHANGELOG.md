# Changelog

## Unreleased

- Fix P2-07: propagate caller image sizes through Image/Media and Card slots; use native lazy auto-sizes for actual nested/responsive slots with conservative component fallbacks. Preserve eager policy, FAL crops, source candidates, dimensions and captions; add rendered candidate/byte regressions.

- Fix P2-05: suppress native Heading output when both text and the resolved default slot are empty or whitespace-only. Preserve additive slot markup, escaped text, semantic levels, Typolink and independent subtitles; cover native and scalar-partial empty calls in rendered regressions.

- Fix P2-01: allocate request-scoped occurrence namespaces for repeated content, navigation, native tree lists, Accordions, Carousels and Galleries. Keep one canonical `c<uid>` anchor and distinct repeated wrappers; use complete menu branch paths and independent native Accordion groups. Add real shortcut/nested-container regressions and opt-in authored HTML/plugin ID diagnostics.

- Fix P1-01: pair Neutral/Ocean destructive-button colors in both modes, preserving Stone’s categorical red pair.
- Fix P1-02: protect Hero overlay content and normal-flow FAL captions with 54% transparent light panels and black text in both modes; retain themed primary controls.
- Fix P1-04: retain a translucent gallery lightbox with 54% black backdrop opacity, minimally protected controls/counter, two-tone photo focus and keyboard-scrollable captions; support forced colors.

- Render Single-mode accordion items in separate rounded cards with 8px gaps, matching the Collapsible Group overview; include each card's padding and border in disclosure animations.

- Rename Carousel's Navigation field to Pagination and place Pagination, Pagination Position and Edge Fade together in one backend row.

- Move Notice’s Status and Icon fields above Header in the backend form.

- Restrict Notice's icon picker to Check, Warning, Error and Information plus None. Render the selected inline SVG beside its status label in the frontend and backend preview; preserve the status dot for empty selections. Add the shared Error icon and a circled Information symbol.

- Replace Notice's free-text Icon field with a native selector for Astryx icon names, SVG previews and a clickable icon chooser; retain the existing stored field and empty default.

- Move Card's Variant and Badge fields above Header, and place Aspect ratio immediately after Image in the backend form.

- Place Hero's Layout and Variant selectors side by side above Eyebrow and Header, and move Aspect ratio immediately after Image in the backend form.

- Display Card Grid's Columns and Gap selectors side by side in the backend form using a native TYPO3 palette.

- Group Header Layout, Alignment and Heading Size side by side in backend forms using native TYPO3 palettes; elements without Heading Size group the two available selectors.

- Rename Header Layout choices to `Heading 1 <H1>` through `Heading 5 <H5>`, with German translations, preserving stored values, Default and Hidden.

- Match the language menu trigger to the main menu links without a border, retaining the circular flag before its label.

- Share the main dropdown's compact StyleX rows, surface and label-sized width with the language menu while retaining circular 20px flags, current-language highlighting and disabled translations.

- Match header dropdowns to the Astryx DropdownMenu reference with compact rows, label-sized panels and side fly-outs; add hover/arrow navigation, viewport edge flipping and preserve mobile/native disclosures.

- Show 20px circular language flags before the abbreviated header label and full dropdown names, matching the moon/sun icons; supply vector SVG flags for Britain and Germany and use the British flag for English.
- Keep language dropdowns within the mobile viewport without JavaScript and preserve dropdown link navigation in WebKit.

- Make Container 1-col and its preview offer Lighter/Darker section shades within the active page mode: two light shades in Light mode and two dark shades in Dark mode. Preserve stored values and inherit page text colors; a fine inset outline keeps sections identifiable.

- Keep Container 1-col headings and child content centered at the normal site content width when its background is full-bleed; label the selector Background width.

- Add Container 1-col with Light/Dark backgrounds, a decorative FAL cover image, content/full viewport width choices and one nested-content column.

- Set Stone theme H1–H6 headings to font weight 400 across frontend, rich text and backend previews.

- Hide the 17 unsupported standard content types from the wizard and CType selector on sites using the Astryx Site Set; default new content records to Astryx Text.

- Move all 14 remaining elements from the Astryx backend category into the core Typical page content category in the wizard and content-type selector.

- Move Shortcut, HTML, Divider and Code Block into the core Special elements category in the backend wizard and content-type selector.

- Move Sitemap, Subpages and Selected Pages into the core Menu category in the backend wizard and content-type selector.

- Rename the backend Sitemap element to “Astryx Sitemap” in English and German.

- Match Stone to the official Astryx v0.6.7 typography and full light/dark palette; bundle Montserrat and JetBrains Mono alongside Figtree, theme component variants and verify frontend/editor parity.

- Render Sitemap as a collapsible Astryx Tree List with vertical guide lines, indented children, active-branch expansion, arrow/Home/End and type-ahead navigation, translated controls and a fully visible linked hierarchy without JavaScript.

- Add Container 3-col and Container 4-col with equal-width columns, configurable gaps, matching backend grids and responsive stacking.

- Add Container 2-col 25/75 and Container 2-col 75/25 with fixed responsive splits and matching backend column widths. Rename the existing container to Container 2-col 50/50 while preserving its CType, children and saved ratio options.

- Add Astryx Menu of Selected Pages (`menu_pages`) with an ordered multi-page backend picker, English/German labels, a matching checked-rows icon and the identical Subpages SideNav rendering. Retain existing FSC page selections during migration; empty selections display no links.

- Give all 17 Content Blocks and the Sitemap, Subpages, Shortcut and HTML elements distinct backend SVG icons in a consistent orange, lavender and blue style.

- Rename the backend Subpages menu to “Astryx Menu of Subpages” and add a dedicated vertical-navigation icon.

- Render menu_subpages as a full-width vertical Astryx Side Nav with Figtree 14px links and matching hover/current-page backgrounds, without icons or sections.

- Add Image Only with multiple core FAL images, one to six fixed columns, Original/4:3/16:9/1:1 proportions, aligned rows, captions and an English/German backend preview.

- Render Card's existing secondary link and label as a secondary button alongside the primary action; support both CTAs in the native component and scalar partial.

- Add a consistent 16px gap below shared Card media before the badge or heading, including standalone Cards and Card Grid items.

- Restore Card Grid item titles and the shared Card title fallback while preserving custom and intentionally empty heading slots.

- Replace Carousel numeric pagination with clickable Astryx-style dots and an active-page indicator; add six top/bottom and left/center/right positions, default bottom-center.

- Colocate block-owned StyleX recipes and supporting CSS in each Content Block's private `src/` directory; retain shared component recipes, tokens and themes centrally and validate source ownership during artifact verification.
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
