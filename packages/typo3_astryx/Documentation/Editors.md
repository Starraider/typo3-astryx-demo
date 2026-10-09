# Editor guide

Choose Astryx elements in the new-content wizard. Header appearance and semantic level are independent; choose one h1 for the page, then h2/h3 for sections and cards. A hero does not automatically become h1.

Every Astryx element has an **Alignment** selector beside its heading: **Default** (left), **Left**, **Center**, or **Right**. This also aligns the subheader. Use the heading **Link** field and TYPO3 link browser to link to a page, file, URL or email address. Linked headings use the active theme’s link color. Empty links leave ordinary heading text; Hidden headings remain hidden. The core selector replaces the former Hero-specific heading alignment control; its stored legacy values are retained. Default headings in Hero and Classic Gallery now align left; select Center to retain a centered introduction.

Every Astryx content element, including containers and the legacy menu, shortcut and HTML elements, has an **Appearance** tab with independent **Space Before** and **Space After** selectors. Choose Default, Extra Small, Small, Medium, Large or Extra Large. Default is identical to Medium, including for existing records with an empty spacing value. The five sizes use Astryx's compact 2px, 4px, 8px, 16px and 24px margins through theme spacing tokens. Default/Medium matches the 8px gap in the [Astryx Heading examples](https://astryx.atmeta.com/components/Heading). Adjacent margins collapse to the larger value in normal document flow. Single-column pages add no extra grid gap between content elements. Container and sidebar column gaps remain independent of these outer margins.

| Element | Editing use |
| --- | --- |
| Heading | Section title/subtitle with a separate visual size |
| Text | Rich text with semantic headings, links, lists, tables, quotes and code |
| Textmedia | Core rich text and FAL image/media metadata, captions, aspect presets, optional video poster and orientation |
| Card | Title, body, one image, optional badge and explicit CTA |
| List | Ordered/unordered collection of escaped text items |
| Table | Caption and structured rows/cells; first row can use column headers |
| Code Block | Programming language, plain code, optional filename and line numbers; copy button in the header |
| Divider | Subtle/strong horizontal rule |
| Downloads | FAL files with title/name, description and size |
| Hero | Eyebrow, heading/body, one image, split/centered/overlay layout and up to two CTAs |
| Card grid | Collection of cards, finite column and gap presets |
| Notice | Visible status label plus heading/body and CTA; no automatic alert announcement |
| Accordion | Reorder title/body disclosures; multiple/single mode and default-open choices |
| Carousel | Reorder cards; scrollable list, optional controls, no autoplay |
| Classic Gallery | Heading/intro with selectable alignment, image categories as filters, and one to six images per row, default four |
| Two-column container | Nested content in left/right columns; choose ratio and gap |

Set CTA links and labels together. Empty links do not create controls. Do not paste generated StyleX classes into rich text. Store ordinary semantic markup; TYPO3 resolves links and sanitizes the frontend output.
Supply accurate FAL alternative text and captions. Video content requires captions/transcripts; autoplay is disabled. Avoid moving essential text into images.
Classic Gallery uses 3:2 image tiles with FAL cropping and alternative text. Add one image per entry and an optional category. Repeated categories share a filter, ignoring surrounding spaces and letter case. Uncategorized images appear under All. Maximum images per row is a limit; narrow content areas use fewer columns, and every incomplete row expands evenly to fill the width. Without JavaScript, all images remain visible. Click an image to open the fullscreen lightbox at its position. Previous/Next buttons and arrow keys browse all images in this content element, including images hidden by a category filter. Original images retain their native proportions and ignore thumbnail cropping. Escape, the close button or the backdrop closes the lightbox and restores focus to the clicked image. Image titles identify entries in the backend; image descriptions from FAL metadata appear as lightbox captions. Without JavaScript, image links open the original file.
Textmedia uses TYPO3's image-position choices: above/below preserves left, center or right alignment; in-text wraps around the media; beside-text keeps separate columns. In narrow content areas, in-text and beside-text stack, with left media before the text and right media after it.
Headings and subheaders sit directly together, matching the Astryx Heading page hierarchy example. The heading group uses an 8px gap before body content. Textmedia without selected media uses the full text area and creates no empty image slot or media gap.
Preview cards summarize structured content without running frontend JavaScript. Collection visibility/language/workspace behavior comes from TYPO3 and Content Blocks. Edit children in their parent container columns and keep nesting to two editorial levels.
Page appearance fields inherit theme and color mode independently from ancestors and then the site default. User mode switching appears only if the integrator enables it.

Deleting a container also deletes its active children. In the Recycler, select the container and its children together when restoring them; restoring only the parent does not automatically restore b13/container children in the tested version.

For restricted editor groups, grant the required `astryx_*` CTypes in the content-type access list, the parent and `tx_astryx_*` collection tables, relevant excluded fields, language access and the intended page mounts. With EXT:workspaces installed, explicitly grant the appropriate live/draft workspace permission. Keep raw HTML unavailable to ordinary editors.

Grant the core excluded fields `space_before_class` and `space_after_class` to editor groups that should control element spacing.

Code Block supports JavaScript, TypeScript, CSS, HTML, PHP, Python, Rust, Bash, JSON, YAML and plain text. Paste code in the plain textarea, choose its language and optionally enter a filename. Line numbers are off by default. Copying preserves the snippet without the header or numbers. HTML/PHP snippets are displayed as text and never executed. Without JavaScript, the escaped snippet and header remain readable.

Grant the core excluded fields `header_position` and `header_link` to editor groups that should control heading alignment and links.
