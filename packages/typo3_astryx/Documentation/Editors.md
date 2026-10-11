# Editor guide

Choose Astryx elements in the new-content wizard. Header appearance and semantic level are independent; choose one h1 for the page, then h2/h3 for sections and cards. A hero does not automatically become h1.

The **Header Layout** selector names its explicit levels `Heading 1 <H1>` through `Heading 5 <H5>`. **Default** and **Hidden** retain their existing behavior; the separate **Heading Size** selector controls visual size. **Header Layout**, **Alignment** and **Heading Size** appear side by side in one backend row. Elements without a Heading Size control show Header Layout and Alignment together.

The Astryx Site Set hides the 17 standard TYPO3 content types that have no Astryx renderer from both the new-content wizard and the content-type selector. New records default to Astryx Text. The supported core menu, shortcut and HTML types and installed Form/Login plugins remain available. Existing records are not converted; restored legacy records still require the migration review described in [Installation](Installation.md).

Find Heading, Text, Textmedia, Image Only, Card, Card Grid, List, Table, Downloads, Hero, Notice, Accordion, Carousel and Classic Gallery in **Typical page content** in the new-content wizard and content-type selector. Containers remain in their **Container** category.

Find **Astryx Sitemap**, **Astryx Menu of Subpages** and **Astryx Menu of Selected Pages** in the **Menu** category of the new-content wizard and content-type selector.

Find **Astryx Shortcut**, **Astryx HTML**, **Astryx Divider** and **Code Block** in the **Special elements** category.

All 26 Astryx content types have distinct icons in the wizard, content-type selector and record lists. Orange, lavender and blue shapes with rounded dark outlines identify the element's purpose: images for media, rows for lists and menus, panels for cards and containers, and angle brackets for code and HTML. The element names remain the primary way to choose content; colors do not encode status or permissions.

Every Astryx element has an **Alignment** selector beside its heading: **Default** (left), **Left**, **Center**, or **Right**. This also aligns the subheader. Use the heading **Link** field and TYPO3 link browser to link to a page, file, URL or email address. Linked headings use the active theme’s link color. Empty links leave ordinary heading text; Hidden headings remain hidden. The core selector replaces the former Hero-specific heading alignment control; its stored legacy values are retained. Default headings in Hero and Classic Gallery now align left; select Center to retain a centered introduction.

Every Astryx content element, including containers and the legacy menu, shortcut and HTML elements, has an **Appearance** tab with independent **Space Before** and **Space After** selectors. Choose Default, Extra Small, Small, Medium, Large or Extra Large. Default is identical to Medium, including for existing records with an empty spacing value. The five sizes use Astryx's compact 2px, 4px, 8px, 16px and 24px margins through theme spacing tokens. Default/Medium matches the 8px gap in the [Astryx Heading examples](https://astryx.atmeta.com/components/Heading). Adjacent margins collapse to the larger value in normal document flow. Single-column pages add no extra grid gap between content elements. Container and sidebar column gaps remain independent of these outer margins.

| Element | Editing use |
| --- | --- |
| Heading | Section title/subtitle with a separate visual size |
| Text | Rich text with semantic headings, links, lists, tables, quotes and code |
| Image Only | Multiple FAL images; one to six fixed columns and Original, 4:3, 16:9 or 1:1 aspect ratio |
| Textmedia | Core rich text and FAL image/media metadata, captions, aspect presets, optional video poster and orientation |
| Card | Title, body, one image, optional badge and up to two CTAs; set each link and label together. In the backend, Variant and Badge precede Header, and Aspect ratio follows Image |
| List | Ordered/unordered collection of escaped text items |
| Table | Caption and structured rows/cells; first row can use column headers |
| Code Block | Programming language, plain code, optional filename and line numbers; copy button in the header |
| Divider | Subtle/strong horizontal rule |
| Downloads | FAL files with title/name, description and size |
| Hero | Eyebrow, heading/body, one image, split/centered/overlay layout and up to two CTAs; Overlay uses 54% transparent light text/caption panels with black text in both modes; Layout and Variant share a row above Eyebrow and Header, and Aspect ratio follows Image |
| Card grid | Collection of cards, finite column and gap presets; Columns and Gap appear side by side in the backend form |
| Notice | Status and Icon precede Header in the backend form. Visible status label plus heading/body and CTA; no automatic alert announcement. Choose Check, Warning, Error or Information in the Icon selector; the SVG appears beside the status label in the frontend and backend preview. None retains the status dot. Status controls the Notice colors independently of the icon |
| Accordion | Reorder title/body disclosures; Single shows separate rounded boxes with one item open at a time; Multiple groups items in one box and allows several open; choose default-open items |
| Carousel | Pagination, Pagination Position and Edge Fade share one backend row. Reorder cards; scrollable list, optional arrow/dot controls, no autoplay. Pagination position: top-left, top-center, top-right, bottom-left, bottom-center (default), or bottom-right |
| Classic Gallery | Heading/intro with selectable alignment, image categories as filters, and one to six images per row, default four |
| Container 2-col 50/50 | Equal left/right columns by default; retains the existing 66/33 and 33/66 ratio options and gap selector |
| Container 2-col 25/75 | Fixed 25% left and 75% right columns; choose the gap |
| Container 2-col 75/25 | Fixed 75% left and 25% right columns; choose the gap |
| Container 3-col | Three equal-width columns; choose the gap |
| Container 4-col | Four equal-width columns; choose the gap |

Set CTA links and labels together. Empty links do not create controls. Do not paste generated StyleX classes into rich text. Store ordinary semantic markup; TYPO3 resolves links and sanitizes the frontend output.
Responsive image candidates follow the displayed slot in supporting browsers, including nested Cards, galleries and Textmedia. No extra editorial size field is needed; continue choosing columns, gaps, orientation and FAL crops normally. Older browsers use conservative size estimates and may load larger files.

Supply accurate FAL alternative text and captions. Video content requires captions/transcripts; autoplay is disabled. Avoid moving essential text into images.
Gallery lightboxes retain a transparent background and undimmed photos. White captions sit below the photo on a slightly darker backdrop; controls and the image counter have translucent surfaces. Thumbnail keyboard focus has black-and-white rings. Tab reaches a nonempty lightbox caption; use Home/End or Up/Down to scroll a long description, then Tab to continue through the controls.
Classic Gallery uses 3:2 image tiles with FAL cropping and alternative text. Add one image per entry and an optional category. Repeated categories share a filter, ignoring surrounding spaces and letter case. Uncategorized images appear under All. Maximum images per row is a limit; narrow content areas use fewer columns, and every incomplete row expands evenly to fill the width. Without JavaScript, all images remain visible. Click an image to open the fullscreen lightbox at its position. Previous/Next buttons and arrow keys browse all images in this content element, including images hidden by a category filter. Original images retain their native proportions and ignore thumbnail cropping. Escape, the close button or the backdrop closes the lightbox and restores focus to the clicked image. Image titles identify entries in the backend; image descriptions from FAL metadata appear as lightbox captions. Without JavaScript, image links open the original file.
Image Only defaults to three columns and Original proportions. Select multiple images in the core image field and reorder them there. Six images in three columns form two rows of three. The selected column count stays fixed on desktop and mobile; choose fewer columns when images need more room. An incomplete final row keeps the same cell widths. Original retains each image’s proportions, including its editorial FAL crop. Fixed ratios crop images to fill equal frames without distortion. Images align at the top of each row with a 16px gap; captions remain below the image and wrap within its cell. Optional headings use the standard controls. No JavaScript is required.

Textmedia uses TYPO3's image-position choices: above/below preserves left, center or right alignment; in-text wraps around the media; beside-text keeps separate columns. In narrow content areas, in-text and beside-text stack, with left media before the text and right media after it.
Headings and subheaders sit directly together, matching the Astryx Heading page hierarchy example. The heading group uses an 8px gap before body content. Textmedia without selected media uses the full text area and creates no empty image slot or media gap.
Preview cards summarize structured content without running frontend JavaScript. Collection visibility/language/workspace behavior comes from TYPO3 and Content Blocks. Edit children in their parent container columns and keep nesting to two editorial levels.
Page appearance fields inherit theme and color mode independently from ancestors and then the site default. User mode switching appears only if the integrator enables it.

Deleting a container also deletes its active children. In the Recycler, select the container and its children together when restoring them; restoring only the parent does not automatically restore b13/container children in the tested version.

For restricted editor groups, grant the required `astryx_*` CTypes in the content-type access list, the parent and `tx_astryx_*` collection tables, relevant excluded fields, language access and the intended page mounts. With EXT:workspaces installed, explicitly grant the appropriate live/draft workspace permission. Keep raw HTML unavailable to ordinary editors.

Grant the core excluded fields `space_before_class` and `space_after_class` to editor groups that should control element spacing.

Code Block supports JavaScript, TypeScript, CSS, HTML, PHP, Python, Rust, Bash, JSON, YAML and plain text. Paste code in the plain textarea, choose its language and optionally enter a filename. Line numbers are off by default. Copying preserves the snippet without the header or numbers. HTML/PHP snippets are displayed as text and never executed. Without JavaScript, the escaped snippet and header remain readable.

Grant the core excluded fields `header_position` and `header_link` to editor groups that should control heading alignment and links.

## Sitemap

The **Astryx Sitemap** element displays your page hierarchy as an Astryx Tree List with indented child pages and guide lines. Click a chevron to expand or collapse its child pages; click the page title to visit that page. The current page's branches start open. Other branches start collapsed. Heading and Appearance spacing controls retain their usual behavior.

With keyboard focus in the tree, use Up/Down to move between visible pages, Right to expand or enter a branch, and Left to collapse or return to its parent. Home/End moves to the first/last visible page. Type the beginning of a page title to find it, or press `*` to expand sibling branches. Enter opens the focused page; Space toggles its child pages. Tab leaves the tree. Left/Right follows the opposite direction on RTL sites. Without JavaScript, the entire linked hierarchy stays visible.

## Header dropdowns

The header menu follows the page tree. On desktop, dropdowns fit their page titles and a third level opens beside its parent row on hover or Right Arrow. Left Arrow or Escape closes that branch; clicking a page title follows its link. Narrow screens keep expandable sections inside the navigation dialog. No additional editor settings are needed.

## Subpages menu

Choose **Astryx Menu of Subpages** (German: **Astryx Unterseitenmenü**) with the three-row vertical-menu icon in the backend. The core Subpages menu displays a vertical list styled like Astryx Side Nav, without icons or section labels. It fills its content column or container, uses Figtree 14px labels, and highlights hovered and current/active pages. Long page titles wrap. Select the parent pages with the existing TYPO3 page selector; headings and Appearance spacing still work as before.

## Selected-pages menu

Choose **Astryx Menu of Selected Pages** (German: **Astryx Menü ausgewählter Seiten**) with the checked-menu-rows icon. In **Selected pages**, use the TYPO3 page browser to add up to 50 pages from any permitted part of the page tree. Reorder the selected pages to set their menu order. The menu links to those pages themselves, using the same Side Nav markup, fonts, full-width rows, hover/current states and heading/spacing controls as the Subpages menu. An empty selection displays no links. TYPO3 filters disabled, access-restricted and menu-hidden pages as usual. Grant the `menu_pages` CType and the excluded `pages` field to editor groups that need this element.

## Stone theme

Select **Stone** in the page's Astryx theme field, or set `Astryx.theme: stone` for the site. Empty page choices inherit from the nearest configured ancestor. The default theme is still Neutral.

Stone uses Montserrat headings, Figtree body text and JetBrains Mono code. Its heading scale and 14px body text follow the official Astryx Stone preview. Light and dark modes use the corresponding Stone colors, including pastel notices/badges, pill buttons and neutral card surfaces. Color-mode switching keeps the Stone font and palette selection. No external font service is required. Editor styles support an explicit `data-astryx-theme="stone"` boundary; unconfigured editors retain the Neutral fallback.

## Container 1-col

Choose **Container 1-col** in the Container wizard group and add elements to its **Column 1** area. **Background shade** selects **Lighter** or **Darker** within the current page mode. Light mode offers two light shades; Dark mode offers two dark shades. Both update automatically when the visitor changes mode. Lighter means lighter than the other container shade, and can still be darker than the page background. The section colors and a fine outline keep the container identifiable. An optional **Background image** replaces the color fill and covers the whole container, including when its height grows with the content. Images are decorative: put meaningful image descriptions in a separate content element. Text follows the page mode, so choose an image that keeps the content readable in both modes.

**Background width** defaults to Content width. **Full viewport width** expands the background to the window edges while the heading and child content remain centered at the normal site content width. Use full-bleed sections in the main or stage region for a complete no-JavaScript layout; JavaScript also aligns full-bleed sections placed in off-center sidebar or nested columns. Without JavaScript those off-center sections stay within their parent width. Headers, links, translations, child ordering and before/after spacing work as in the other containers. The preview shows the shade, width and selected image; child elements remain editable below it.

## Links to repeated content

Use TYPO3’s content link picker to link to a record’s stable `#c<uid>` anchor. A record repeated through shortcuts has one canonical target on that page; other occurrences receive separate anchors. Generated Accordion, navigation, Carousel and Gallery IDs can change after a cache rebuild. For authored HTML with IDs, keep every ID unique on the final page, including repeated content, and update its label/ARIA/fragment references together. Your integrator can run the [identifier diagnostic](OccurrenceIdentifiers.md#custom-components-and-external-output) without changing authored references.
