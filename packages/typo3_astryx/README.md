# TYPO3 Astryx

Native Fluid adaptation of Meta Astryx 0.6.5 for TYPO3 14.3 and PHP 8.3–8.4. This package replaces Fluid Styled Content and conflicts with its installation.

```sh
composer require skom/typo3-astryx:@dev
vendor/bin/typo3 cache:flush
vendor/bin/typo3 extension:setup
```

Activate Site Set `skom/typo3-astryx`. An existing site package should depend on that set and own its logo, navigation roots, brand CSS and template overrides.
The connector currently needs `dev-main`; pin the tested commit in the consuming project's lockfile. This development dependency prevents an unqualified stable release.
Packaged frontend/editor assets work without Node or a Vite server. Custom source builds run from the consuming project root.

The extension supplies eight native components, 22 Content Blocks, a single-column container with mode-aware lighter/darker or image backgrounds and content/full viewport width, 50/50, 25/75 and 75/25 two-column nested containers plus equal-width three- and four-column containers, Default/Sidebar/AppShell pages, Neutral/Stone/Ocean themes and system/light/dark modes.
Ordinary editorial pages load no React. Ocean is a local adaptation, not an official upstream theme package.

Read [installation and migration](Documentation/Installation.md), [component contracts](Documentation/Contracts.md), [editor guide](Documentation/Editors.md), [build and deployment](Documentation/Build.md) and [validation evidence](Documentation/Validation.md) before switching an existing site.
