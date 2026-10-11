.. _content_elements:

================
Content Elements
================

TYPO3 Astryx delivers a comprehensive catalogue of **22 Content Blocks** and **5 retained core
element renderers**. All elements feature custom backend icons, clean form palettes, and
responsive, accessible Fluid templates.

.. _content_elements_shared_controls:

Shared Editorial Controls
=========================

Heading Controls Palette
------------------------

Every Astryx content element displays heading controls grouped cleanly in a single row
via the ``astryx_heading_controls`` palette:

* **Header** (``header``): The text of the heading.
* **Header Layout** (``header_layout``): Controls the semantic HTML level:
  - ``Heading 1 <H1>`` (value ``1``)
  - ``Heading 2 <H2>`` (value ``2``)
  - ``Heading 3 <H3>`` (value ``3``)
  - ``Heading 4 <H4>`` (value ``4``)
  - ``Heading 5 <H5>`` (value ``5``)
  - ``Default`` (value ``0``, falls back to ``<h2>``)
  - ``Hidden`` (value ``100``, suppresses rendering)
* **Alignment** (``header_position``): Controls text alignment for the heading and subheader:
  - ``Default`` (left-aligned)
  - ``Left``
  - ``Center``
  - ``Right``
* **Heading Size** (``heading_size``, available on elements with size control):
  - ``Medium`` (default, proportional to semantic level)
  - ``Small``
  - ``Large``
  - ``Display`` (oversized display style)
* **Header Link** (``header_link``): Links the heading via TYPO3's link browser.
* **Subheader** (``subheader``): Optional secondary subtitle rendered below the heading.

Appearance Spacing Palette
--------------------------

On the **Appearance** tab of every element, the ``astryx_spacing`` palette provides independent
spacing controls using Astryx design tokens:

* **Space Before** (``space_before_class``) and **Space After** (``space_after_class``):
  - ``Default`` (equivalent to Medium: 8px)
  - ``Extra Small`` (2px)
  - ``Small`` (4px)
  - ``Medium`` (8px)
  - ``Large`` (16px)
  - ``Extra Large`` (24px)

..  note::
    Adjacent element margins collapse to the larger value in normal document flow.

.. _content_elements_typical:

Typical Page Content Elements
=============================

Heading (``astryx_heading``)
----------------------------
A standalone section heading with subheader, alignment, link, and visual size selector.
Useful for section dividers, page introductions, and category titles.

Text (``astryx_text``)
----------------------
Rich text content formatted via CKEditor. New records created outside the content wizard
default to this type. Supports paragraphs, formatted headings, bullet/numbered lists, links,
and quotes.

Textmedia (``astryx_textmedia``)
--------------------------------
Combines rich body text with FAL media (images, video, or audio).
* **Media Positions**: Above, below, in-text, or beside-text.
* **Aspect Ratios**: Original, 16:9 (wide), 4:3 (landscape), or 1:1 (square).
* **Video Support**: Supports HTML5 video and audio with controls, and an optional FAL image
  serving as a video poster.

Image Only (``astryx_image_only``)
----------------------------------
A responsive multi-image grid supporting up to 100 FAL images.
* **Columns**: 1, 2, 3 (default), 4, 5, or 6 fixed columns.
* **Aspect Ratio**: ``Original`` (preserves aspect ratio), ``4:3``, ``16:9``, or ``1:1``.
* Fixed 16px token gaps between cells. Incomplete rows maintain cell widths without expanding.

Card (``astryx_card``)
----------------------
A standalone content card with image, title, body, badge, and up to two call-to-action buttons.
* **Variants**: ``Outlined``, ``Elevated``, or ``Flat``.
* **Padding**: ``Normal`` (12px) or ``Compact``.
* **Media Slot**: One FAL image with selectable aspect ratio.
* **Badge**: Optional badge text and variant.
* **CTAs**: Primary CTA (link and label) and secondary CTA (link and label).

Card Grid (``astryx_card_grid``)
--------------------------------
A responsive grid of cards powered by an inline child collection (``tx_astryx_card_grid_item``).
* **Columns**: 2, 3, or 4 columns.
* **Gap**: Normal (16px), Small (8px), or Large (24px).
* Each child item has title, body, optional image, and CTA link.

List (``astryx_list``)
----------------------
A structured list powered by collection items (``tx_astryx_list_item``).
* **List Type**: Unordered (bullets) or Ordered (numbered).
* Each item contains escaped text and an optional link.

Table (``astryx_table``)
------------------------
An accessible structured table (``tx_astryx_table_item`` rows and ``tx_astryx_table_cell`` cells).
* Optional table caption.
* Option to treat the first row as column headers (``<th>``).

Downloads (``astryx_downloads``)
--------------------------------
A downloadable file list using TYPO3's FAL ``media`` relation.
* Displays file title/name, description, file extension icon, and formatted file size.

Hero (``astryx_hero``)
----------------------
An eye-catching hero banner for top-of-page or landing page introductions.
* **Fields**: Eyebrow badge text, heading, subheader, body text, one FAL background/side image,
  and up to two CTA buttons.
* **Layout Presets**:
  - ``Split``: Content and image side-by-side.
  - ``Centered``: Centered text above or below the image.
  - ``Protected Overlay``: Content placed over the full-bleed image on a 54% transparent light panel
    with black text to guarantee WCAG 4.5:1 contrast regardless of the background image.
* **Variant**: ``Neutral`` or ``Accent``.

Notice (``astryx_notice``)
--------------------------
An editorial alert or callout banner with visible status label.
* **Status Variants**: ``Neutral``, ``Accent``, ``Success``, ``Warning``, or ``Error``.
* **Icons**: ``None`` (renders status dot), ``Check``, ``Warning``, ``Error``, or ``Information``.
  Selected icons render as accessible 24px inline vector SVGs beside the status label.
* Heading, rich body text, and optional CTA button.

Accordion (``astryx_accordion``)
--------------------------------
An accessible collapsible disclosure element (``tx_astryx_accordion_item``).
* **Modes**:
  - ``Single``: Each item appears as a separate rounded card with 8px gaps. Only one item can
    be open at a time.
  - ``Multiple``: Items are grouped in a single outer card with 16px gaps. Multiple sections can
    be open simultaneously.
* Built on native HTML ``<details>`` and ``<summary>`` elements, ensuring full readability and
  keyboard disclosure even without JavaScript. JavaScript enhances with smooth height animations.

Carousel (``astryx_carousel``)
------------------------------
A horizontal card slider (``tx_astryx_carousel_item``) with native CSS scroll-snapping.
* **Pagination**: Previous/Next arrows and clickable pagination dots.
* **Pagination Position**: ``Bottom Center`` (default), ``Top Left``, ``Top Center``,
  ``Top Right``, ``Bottom Left``, or ``Bottom Right``.
* **Edge Fade**: Optional gradient fade at track edges indicating scrollable overflow.
* **Accessibility**: No distracting autoplay. Respects ``prefers-reduced-motion``.

Classic Gallery (``astryx_classic_gallery``)
--------------------------------------------
A full-featured photo gallery with category filtering and an accessible fullscreen lightbox.
* **Grid**: 3:2 aspect ratio photo tiles, with 1 to 6 images per row (default 4).
* **Category Filters**: Filter buttons generated automatically from image metadata.
* **Lightbox Dialog**: Uses native HTML ``<dialog>`` with 54% dark backdrop, image counter,
  and keyboard navigation (Escape closes, arrow keys navigate).

.. _content_elements_containers:

Container Elements (b13/container)
==================================

Astryx provides six container elements in the **Container** wizard group:

Container 1-col (``astryx_container_single_col``)
-------------------------------------------------
A single-column content wrapper (``colPos = 201``) with powerful background options:
* **Background Shade**:
  - ``Lighter``: Soft surface tint (mixed with 8% white in light mode, 8% black in dark mode).
  - ``Darker``: Slightly deeper surface tint.
* **Background Image**: Optional FAL image that covers the full container as a decorative responsive background.
* **Width**:
  - ``Constrained`` (default): Stays within the normal site content width.
  - ``Full Viewport Width``: Expands background to the viewport edges while keeping content centered.

Container 2-col 50/50 (``astryx_container_two_col``)
----------------------------------------------------
Two columns (``colPos = 201`` and ``202``).
* **Ratios**: ``50-50``, ``66-33``, or ``33-66``.
* **Gap**: Normal (16px), Small (8px), or Large (24px).

Container 2-col 25/75 (``astryx_container_two_col_25_75``)
----------------------------------------------------------
Fixed 25% left column and 75% right column with gap selector.

Container 2-col 75/25 (``astryx_container_two_col_75_25``)
----------------------------------------------------------
Fixed 75% left column and 25% right column with gap selector.

Container 3-col (``astryx_container_three_col``)
------------------------------------------------
Three equal-width columns (``colPos = 201``, ``202``, and ``203``) with gap selector.

Container 4-col (``astryx_container_four_col``)
------------------------------------------------
Four equal-width columns (``colPos = 201``, ``202``, ``203``, and ``204``) with gap selector.

.. _content_elements_special:

Special Elements
================

Code Block (``astryx_code_block``)
----------------------------------
A syntax-highlighted code display element.
* **Languages**: JavaScript, TypeScript, CSS, HTML, PHP, Python, Rust, Bash, JSON, YAML, and Plain Text.
* **Options**: Optional filename label, line numbers toggle.
* **Features**: Copy-to-clipboard button with visual feedback and keyboard focus preservation.
  Snippets remain escaped and readable without JavaScript.

Divider (``astryx_divider``)
----------------------------
A clean horizontal divider with ``Subtle`` or ``Strong`` styling.

Astryx Shortcut (``shortcut``)
------------------------------
Retained core record reference renderer using TYPO3's ``RECORDS`` content object with
visibility and recursion handling.

Astryx HTML (``html``)
----------------------
Retained raw HTML renderer with automatic ``htmlSanitize = 1`` protection.

.. _content_elements_menus:

Menu Elements
=============

Astryx Sitemap (``menu_sitemap``)
---------------------------------
Renders the site page hierarchy using the accessible ``<astryx:treeList>`` component.
Features interactive expand/collapse chevrons, vertical guide lines, type-ahead search,
and roving tabindex keyboard navigation.

Astryx Menu of Subpages (``menu_subpages``)
-------------------------------------------
Renders subpages of selected parent pages as a clean vertical list using the
``<astryx:sideNav>`` component. Highlights active and current pages.

Astryx Menu of Selected Pages (``menu_pages``)
----------------------------------------------
Allows editors to pick up to 50 specific pages in any order via the core page browser,
rendering them as a vertical SideNav list.
