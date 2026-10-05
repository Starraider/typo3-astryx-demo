# TYPO3 Astryx

This TYPO3 v14 project was created with `typo3-auto-install`.

## Development

`ddev start` starts TYPO3 and its database. Use `ddev vite dev` for the Vite
development server and `ddev vite build` for a production asset build.

StyleX sources live in `packages/astryx_sitepackage/Resources/Private/JavaScript/Stylex/`.
Import each new `*.stylex.js` source in `Main.entry.js`, using a unique basename.
Fluid resolves its compiled classes with `{stylex:class(styles: 'Site.shell')}`.

Run `ddev npm run build` after changing styles. This builds CSS and JavaScript,
writes the version 2 StyleX manifest, and checks Fluid CSS selectors and CSS checksums.
Then run `ddev typo3 stylex:validate --required-key Site.shell --required-key Site.content`
and `ddev typo3 cache:flush`. Installation and dependency updates run these commands automatically.
The manifest adapter comes from the Composer-installed connector. Legacy aliases keep
the supplied Fluid keys working alongside canonical module/object keys.
The root Composer requirement is `skom/stylex-connector:dev-main#701d870b9ae55e8c434af24532b95c10f7e54ef2`.
Deploy `public/_assets/vite/` and
`packages/astryx_sitepackage/Resources/Public/StylexManifest/stylex-manifest.json` together.
Development disables page caching so Fluid class names follow live StyleX edits.
The generated .env uses TYPO3_CONTEXT=Development and expects the Vite dev server.
Use TYPO3_CONTEXT=Production to serve the built assets without it.
Fluid Styled Content supplies the standard content styles, layouts, templates, and partials.

Useful TYPO3 commands:

`ddev typo3 cache:flush`

`ddev typo3 database:updateschema`
