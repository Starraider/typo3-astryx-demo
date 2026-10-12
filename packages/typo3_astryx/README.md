# TYPO3 Astryx (`typo3_astryx`)

<img src="Resources/Public/Icons/Extension.svg" alt="TYPO3 Astryx Logo" width="160" height="160">

Native Fluid and Content Blocks adaptation of Meta Astryx for TYPO3 14.3 and PHP 8.3–8.4, styled with **StyleX**.

This package replaces `typo3/cms-fluid-styled-content` (FSC) and explicitly conflicts with it.

## Key Features

- **Fluid Styled Content Replacement**: Complete modern replacement for legacy Fluid Styled Content templates using structured Content Blocks (`friendsoftypo3/content-blocks`).
- **StyleX Architecture**: Component styling authored in StyleX modules and compiled into atomic CSS with zero runtime JavaScript required for reading.
- **Progressive Enhancement**: Full WCAG 2.2 AA accessibility, responsive behavior, keyboard-accessible navigation and dialogs, degrading gracefully without JavaScript.
- **Native Fluid Components**: Registered `<astryx:*>` components (Button, Badge, StatusDot, Icon, Heading, Text, Divider, Card, SideNav, TreeList).
- **Rich Content Blocks**: 22 Content Blocks and 5 retained core renderers (Text, Text & Media, Heading, List, Table, Downloads, Card, Card Grid, Hero, Notice, Accordion, Carousel, Code Block, Classic Gallery, Image Only, Container 1-col, 2-col 50/50, 25/75, 75/25, 3-col, 4-col, Sitemap, Subpages, Selected Pages, Shortcut, HTML).
- **Themes & Modes**: Neutral, Stone, and Ocean themes; System, Light, and Dark color modes with seamless page inheritance and visitor toggle.

## Installation

```sh
composer require skom/typo3-astryx
vendor/bin/typo3 cache:flush
vendor/bin/typo3 extension:setup
```

Activate the Site Set `skom/typo3-astryx` in your site configuration (`config/sites/<site-identifier>/config.yaml` or through the backend Site Management module).

> **Important**: Remove `typo3/cms-fluid-styled-content` and its Site Set dependency before activating TYPO3 Astryx.

Packaged frontend and editor assets (`Resources/Public/Assets/`) are precompiled and work out of the box without requiring Node.js or a Vite dev server.

## Documentation

Full documentation is available in the [`Documentation/`](Documentation/Index.rst) directory and on [docs.typo3.org](https://docs.typo3.org/p/skom/typo3-astryx/main/en-us/):

- [Introduction](Documentation/Introduction/Index.rst)
- [Installation Guide](Documentation/Installation/Index.rst)
- [Configuration Reference](Documentation/Configuration/Index.rst)
- [Styling & Design System](Documentation/Styling/Index.rst)
- [Content Elements](Documentation/ContentElements/Index.rst)
- [Migration from Fluid Styled Content](Documentation/Migration/Index.rst)

## Privacy and Data Protection

- **Personal Data**: TYPO3 Astryx does not collect, store, or transmit any personally identifiable information (PII).
- **Cookies & Storage**: A client-side browser cookie or local storage item is used solely to remember the visitor's explicit color mode preference (Light/Dark/System) across visits when user mode switching is enabled (`Astryx.allowUserMode: true`). No tracking, analytics, or profiling is performed.
- **External Services**: No assets or fonts are loaded from third-party CDNs; all fonts (Figtree, Montserrat, JetBrains Mono) and scripts are self-hosted within the extension.

## Security

If you discover a security vulnerability in TYPO3 Astryx, please send an email to Sven Kalbhenn at **sven@skom.de** rather than opening a public issue. We follow responsible disclosure and coordinate security releases.

## License

This project is licensed under the [GNU General Public License version 2 or later (GPL-2.0-or-later)](LICENSE).
Third-party font and design system notices are documented in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
