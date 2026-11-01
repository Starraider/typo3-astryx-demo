.. _styling-token-migration:

Token naming migration
======================

The public CSS custom-property names now use explicit semantic families. Update sitepackage ``@layer product`` overrides and custom templates to use the new name. The extension does not emit old-name aliases.

.. list-table:: Previous and current token names
   :header-rows: 1
   :widths: 50 50

   * - Previous name
     - Current name
   * - ``--astryx-accent``
     - ``--astryx-color-accent``
   * - ``--astryx-on-accent``
     - ``--astryx-color-on-accent``
   * - ``--astryx-body``
     - ``--astryx-color-background-body``
   * - ``--astryx-surface``
     - ``--astryx-color-background-surface``
   * - ``--astryx-muted``
     - ``--astryx-color-background-muted``
   * - ``--astryx-text``
     - ``--astryx-color-text-primary``
   * - ``--astryx-secondary``
     - ``--astryx-color-text-secondary``
   * - ``--astryx-border``
     - ``--astryx-color-border-default``
   * - ``--astryx-border-strong``
     - ``--astryx-color-border-strong``
   * - ``--astryx-success``
     - ``--astryx-color-status-success``
   * - ``--astryx-warning``
     - ``--astryx-color-status-warning``
   * - ``--astryx-error``
     - ``--astryx-color-status-error``
   * - ``--astryx-shadow-color``
     - ``--astryx-effect-shadow-color``
   * - ``--astryx-font``
     - ``--astryx-typography-font-family-body``
   * - ``--astryx-link``
     - ``--astryx-color-text-link``
   * - ``--astryx-font-size-body``
     - ``--astryx-typography-body-font-size``
   * - ``--astryx-font-size-label``
     - ``--astryx-typography-label-font-size``
   * - ``--astryx-font-size-supporting``
     - ``--astryx-typography-supporting-font-size``
   * - ``--astryx-line-body``
     - ``--astryx-typography-body-line-height``
   * - ``--astryx-line-label``
     - ``--astryx-typography-label-line-height``
   * - ``--astryx-font-code``
     - ``--astryx-typography-font-family-code``
   * - ``--astryx-radius-element``
     - ``--astryx-shape-radius-element``
   * - ``--astryx-radius-container``
     - ``--astryx-shape-radius-container``
   * - ``--astryx-radius-page``
     - ``--astryx-shape-radius-page``
   * - ``--astryx-space-1``
     - ``--astryx-spacing-1``
   * - ``--astryx-space-2``
     - ``--astryx-spacing-2``
   * - ``--astryx-space-3``
     - ``--astryx-spacing-3``
   * - ``--astryx-space-4``
     - ``--astryx-spacing-4``
   * - ``--astryx-space-6``
     - ``--astryx-spacing-6``
   * - ``--astryx-space-8``
     - ``--astryx-spacing-8``
   * - ``--astryx-space-12``
     - ``--astryx-spacing-12``
   * - ``--astryx-content-width``
     - ``--astryx-layout-content-max-width``
   * - ``--astryx-prose-width``
     - ``--astryx-layout-prose-max-width``
   * - ``--astryx-nav-hover``
     - ``--astryx-color-navigation-state-hover``
   * - ``--astryx-nav-pressed``
     - ``--astryx-color-navigation-state-pressed``
   * - ``--astryx-nav-selected``
     - ``--astryx-color-navigation-state-selected``
   * - ``--astryx-nav-width``
     - ``--astryx-layout-navigation-width``
   * - ``--astryx-detail-width``
     - ``--astryx-layout-detail-width``
   * - ``--astryx-duration``
     - ``--astryx-motion-duration-fast``
   * - ``--astryx-easing``
     - ``--astryx-motion-easing-standard``
   * - ``--astryx-shadow``
     - ``--astryx-effect-shadow-default``
   * - ``--astryx-font-heading``
     - ``--astryx-typography-font-family-heading``
   * - ``--astryx-line-supporting``
     - ``--astryx-typography-supporting-line-height``
   * - ``--astryx-radius-inner``
     - ``--astryx-shape-radius-inner``
   * - ``--astryx-radius-full``
     - ``--astryx-shape-radius-full``
   * - ``--astryx-card``
     - ``--astryx-color-background-card``
   * - ``--astryx-popover``
     - ``--astryx-color-background-popover``
   * - ``--astryx-overlay``
     - ``--astryx-color-overlay-scrim``
   * - ``--astryx-card-border``
     - ``--astryx-color-border-card``
   * - ``--astryx-card-padding``
     - ``--astryx-component-card-padding``
   * - ``--astryx-header-shadow``
     - ``--astryx-component-header-shadow``
   * - ``--astryx-popover-shadow``
     - ``--astryx-component-popover-shadow``
   * - ``--astryx-button-radius``
     - ``--astryx-component-button-radius``
   * - ``--astryx-button-secondary-background``
     - ``--astryx-component-button-variant-secondary-background``
   * - ``--astryx-button-secondary-hover``
     - ``--astryx-component-button-variant-secondary-background-hover``
   * - ``--astryx-button-destructive-background``
     - ``--astryx-component-button-variant-destructive-background``
   * - ``--astryx-button-destructive-text``
     - ``--astryx-component-button-variant-destructive-foreground``
   * - ``--astryx-button-small-size``
     - ``--astryx-component-button-size-small-font-size``
   * - ``--astryx-button-large-size``
     - ``--astryx-component-button-size-large-font-size``
   * - ``--astryx-badge-line``
     - ``--astryx-component-badge-line-height``
   * - ``--astryx-badge-border-width``
     - ``--astryx-component-badge-border-width``
   * - ``--astryx-notice-border-width``
     - ``--astryx-component-notice-border-width``
   * - ``--astryx-notice-padding``
     - ``--astryx-component-notice-padding``
   * - ``--astryx-code-background``
     - ``--astryx-color-code-surface``
   * - ``--astryx-h1-size``
     - ``--astryx-typography-heading-1-font-size``
   * - ``--astryx-h1-line``
     - ``--astryx-typography-heading-1-line-height``
   * - ``--astryx-h1-weight``
     - ``--astryx-typography-heading-1-font-weight``
   * - ``--astryx-h2-size``
     - ``--astryx-typography-heading-2-font-size``
   * - ``--astryx-h2-line``
     - ``--astryx-typography-heading-2-line-height``
   * - ``--astryx-h2-weight``
     - ``--astryx-typography-heading-2-font-weight``
   * - ``--astryx-h3-size``
     - ``--astryx-typography-heading-3-font-size``
   * - ``--astryx-h3-line``
     - ``--astryx-typography-heading-3-line-height``
   * - ``--astryx-h3-weight``
     - ``--astryx-typography-heading-3-font-weight``
   * - ``--astryx-h4-size``
     - ``--astryx-typography-heading-4-font-size``
   * - ``--astryx-h4-line``
     - ``--astryx-typography-heading-4-line-height``
   * - ``--astryx-h4-weight``
     - ``--astryx-typography-heading-4-font-weight``
   * - ``--astryx-h5-size``
     - ``--astryx-typography-heading-5-font-size``
   * - ``--astryx-h5-line``
     - ``--astryx-typography-heading-5-line-height``
   * - ``--astryx-h5-weight``
     - ``--astryx-typography-heading-5-font-weight``
   * - ``--astryx-h6-size``
     - ``--astryx-typography-heading-6-font-size``
   * - ``--astryx-h6-line``
     - ``--astryx-typography-heading-6-line-height``
   * - ``--astryx-h6-weight``
     - ``--astryx-typography-heading-6-font-weight``
   * - ``--astryx-display-size``
     - ``--astryx-typography-display-font-size``
   * - ``--astryx-display-line``
     - ``--astryx-typography-display-line-height``
   * - ``--astryx-display-weight``
     - ``--astryx-typography-display-font-weight``
   * - ``--astryx-heading-large-size``
     - ``--astryx-typography-heading-large-font-size``
   * - ``--astryx-heading-large-line``
     - ``--astryx-typography-heading-large-line-height``
   * - ``--astryx-badge-neutral-background``
     - ``--astryx-component-badge-variant-neutral-background``
   * - ``--astryx-badge-neutral-text``
     - ``--astryx-component-badge-variant-neutral-foreground``
   * - ``--astryx-badge-neutral-border``
     - ``--astryx-component-badge-variant-neutral-border-color``
   * - ``--astryx-notice-neutral-background``
     - ``--astryx-component-notice-variant-neutral-background``
   * - ``--astryx-notice-neutral-text``
     - ``--astryx-component-notice-variant-neutral-foreground``
   * - ``--astryx-notice-neutral-secondary``
     - ``--astryx-component-notice-variant-neutral-supporting-text-color``
   * - ``--astryx-notice-neutral-border``
     - ``--astryx-component-notice-variant-neutral-border-color``
   * - ``--astryx-badge-accent-background``
     - ``--astryx-component-badge-variant-accent-background``
   * - ``--astryx-badge-accent-text``
     - ``--astryx-component-badge-variant-accent-foreground``
   * - ``--astryx-badge-accent-border``
     - ``--astryx-component-badge-variant-accent-border-color``
   * - ``--astryx-notice-accent-background``
     - ``--astryx-component-notice-variant-accent-background``
   * - ``--astryx-notice-accent-text``
     - ``--astryx-component-notice-variant-accent-foreground``
   * - ``--astryx-notice-accent-secondary``
     - ``--astryx-component-notice-variant-accent-supporting-text-color``
   * - ``--astryx-notice-accent-border``
     - ``--astryx-component-notice-variant-accent-border-color``
   * - ``--astryx-badge-success-background``
     - ``--astryx-component-badge-variant-success-background``
   * - ``--astryx-badge-success-text``
     - ``--astryx-component-badge-variant-success-foreground``
   * - ``--astryx-badge-success-border``
     - ``--astryx-component-badge-variant-success-border-color``
   * - ``--astryx-notice-success-background``
     - ``--astryx-component-notice-variant-success-background``
   * - ``--astryx-notice-success-text``
     - ``--astryx-component-notice-variant-success-foreground``
   * - ``--astryx-notice-success-secondary``
     - ``--astryx-component-notice-variant-success-supporting-text-color``
   * - ``--astryx-notice-success-border``
     - ``--astryx-component-notice-variant-success-border-color``
   * - ``--astryx-badge-warning-background``
     - ``--astryx-component-badge-variant-warning-background``
   * - ``--astryx-badge-warning-text``
     - ``--astryx-component-badge-variant-warning-foreground``
   * - ``--astryx-badge-warning-border``
     - ``--astryx-component-badge-variant-warning-border-color``
   * - ``--astryx-notice-warning-background``
     - ``--astryx-component-notice-variant-warning-background``
   * - ``--astryx-notice-warning-text``
     - ``--astryx-component-notice-variant-warning-foreground``
   * - ``--astryx-notice-warning-secondary``
     - ``--astryx-component-notice-variant-warning-supporting-text-color``
   * - ``--astryx-notice-warning-border``
     - ``--astryx-component-notice-variant-warning-border-color``
   * - ``--astryx-badge-error-background``
     - ``--astryx-component-badge-variant-error-background``
   * - ``--astryx-badge-error-text``
     - ``--astryx-component-badge-variant-error-foreground``
   * - ``--astryx-badge-error-border``
     - ``--astryx-component-badge-variant-error-border-color``
   * - ``--astryx-notice-error-background``
     - ``--astryx-component-notice-variant-error-background``
   * - ``--astryx-notice-error-text``
     - ``--astryx-component-notice-variant-error-foreground``
   * - ``--astryx-notice-error-secondary``
     - ``--astryx-component-notice-variant-error-supporting-text-color``
   * - ``--astryx-notice-error-border``
     - ``--astryx-component-notice-variant-error-border-color``
   * - ``--astryx-accent-muted``
     - ``--astryx-color-accent-subtle``
   * - ``--astryx-text-disabled``
     - ``--astryx-color-text-disabled``
   * - ``--astryx-text-accent``
     - ``--astryx-color-text-accent``
   * - ``--astryx-on-dark``
     - ``--astryx-color-on-dark``
   * - ``--astryx-on-light``
     - ``--astryx-color-on-light``
   * - ``--astryx-on-success``
     - ``--astryx-color-on-status-success``
   * - ``--astryx-on-error``
     - ``--astryx-color-on-status-error``
   * - ``--astryx-on-warning``
     - ``--astryx-color-on-status-warning``
   * - ``--astryx-icon-accent``
     - ``--astryx-color-icon-accent``
   * - ``--astryx-icon-primary``
     - ``--astryx-color-icon-primary``
   * - ``--astryx-icon-secondary``
     - ``--astryx-color-icon-secondary``
   * - ``--astryx-icon-disabled``
     - ``--astryx-color-icon-disabled``
   * - ``--astryx-background-inverted``
     - ``--astryx-color-background-inverse``
   * - ``--astryx-success-muted``
     - ``--astryx-color-status-success-subtle``
   * - ``--astryx-error-muted``
     - ``--astryx-color-status-error-subtle``
   * - ``--astryx-warning-muted``
     - ``--astryx-color-status-warning-subtle``
   * - ``--astryx-skeleton``
     - ``--astryx-color-background-skeleton``
   * - ``--astryx-tint-hover``
     - ``--astryx-color-state-tint-hover``
   * - ``--astryx-background-blue``
     - ``--astryx-color-category-blue-background``
   * - ``--astryx-border-blue``
     - ``--astryx-color-category-blue-border``
   * - ``--astryx-icon-blue``
     - ``--astryx-color-category-blue-icon``
   * - ``--astryx-text-blue``
     - ``--astryx-color-category-blue-text``
   * - ``--astryx-background-cyan``
     - ``--astryx-color-category-cyan-background``
   * - ``--astryx-border-cyan``
     - ``--astryx-color-category-cyan-border``
   * - ``--astryx-icon-cyan``
     - ``--astryx-color-category-cyan-icon``
   * - ``--astryx-text-cyan``
     - ``--astryx-color-category-cyan-text``
   * - ``--astryx-background-gray``
     - ``--astryx-color-category-gray-background``
   * - ``--astryx-border-gray``
     - ``--astryx-color-category-gray-border``
   * - ``--astryx-icon-gray``
     - ``--astryx-color-category-gray-icon``
   * - ``--astryx-text-gray``
     - ``--astryx-color-category-gray-text``
   * - ``--astryx-background-green``
     - ``--astryx-color-category-green-background``
   * - ``--astryx-border-green``
     - ``--astryx-color-category-green-border``
   * - ``--astryx-icon-green``
     - ``--astryx-color-category-green-icon``
   * - ``--astryx-text-green``
     - ``--astryx-color-category-green-text``
   * - ``--astryx-background-orange``
     - ``--astryx-color-category-orange-background``
   * - ``--astryx-border-orange``
     - ``--astryx-color-category-orange-border``
   * - ``--astryx-icon-orange``
     - ``--astryx-color-category-orange-icon``
   * - ``--astryx-text-orange``
     - ``--astryx-color-category-orange-text``
   * - ``--astryx-background-pink``
     - ``--astryx-color-category-pink-background``
   * - ``--astryx-border-pink``
     - ``--astryx-color-category-pink-border``
   * - ``--astryx-icon-pink``
     - ``--astryx-color-category-pink-icon``
   * - ``--astryx-text-pink``
     - ``--astryx-color-category-pink-text``
   * - ``--astryx-background-purple``
     - ``--astryx-color-category-purple-background``
   * - ``--astryx-border-purple``
     - ``--astryx-color-category-purple-border``
   * - ``--astryx-icon-purple``
     - ``--astryx-color-category-purple-icon``
   * - ``--astryx-text-purple``
     - ``--astryx-color-category-purple-text``
   * - ``--astryx-background-red``
     - ``--astryx-color-category-red-background``
   * - ``--astryx-border-red``
     - ``--astryx-color-category-red-border``
   * - ``--astryx-icon-red``
     - ``--astryx-color-category-red-icon``
   * - ``--astryx-text-red``
     - ``--astryx-color-category-red-text``
   * - ``--astryx-background-teal``
     - ``--astryx-color-category-teal-background``
   * - ``--astryx-border-teal``
     - ``--astryx-color-category-teal-border``
   * - ``--astryx-icon-teal``
     - ``--astryx-color-category-teal-icon``
   * - ``--astryx-text-teal``
     - ``--astryx-color-category-teal-text``
   * - ``--astryx-background-yellow``
     - ``--astryx-color-category-yellow-background``
   * - ``--astryx-border-yellow``
     - ``--astryx-color-category-yellow-border``
   * - ``--astryx-icon-yellow``
     - ``--astryx-color-category-yellow-icon``
   * - ``--astryx-text-yellow``
     - ``--astryx-color-category-yellow-text``
   * - ``--astryx-radius-none``
     - ``--astryx-shape-radius-none``
   * - ``--astryx-shadow-med``
     - ``--astryx-effect-shadow-medium``
   * - ``--astryx-shadow-high``
     - ``--astryx-effect-shadow-high``
   * - ``--astryx-shadow-inset-hover``
     - ``--astryx-effect-shadow-inset-hover``
   * - ``--astryx-shadow-inset-selected``
     - ``--astryx-effect-shadow-inset-selected``
   * - ``--astryx-shadow-inset-success``
     - ``--astryx-effect-shadow-inset-success``
   * - ``--astryx-shadow-inset-warning``
     - ``--astryx-effect-shadow-inset-warning``
   * - ``--astryx-shadow-inset-error``
     - ``--astryx-effect-shadow-inset-error``
   * - ``--astryx-syntax-keyword``
     - ``--astryx-color-code-syntax-keyword``
   * - ``--astryx-syntax-string``
     - ``--astryx-color-code-syntax-string``
   * - ``--astryx-syntax-comment``
     - ``--astryx-color-code-syntax-comment``
   * - ``--astryx-syntax-number``
     - ``--astryx-color-code-syntax-number``
   * - ``--astryx-syntax-function``
     - ``--astryx-color-code-syntax-function``
   * - ``--astryx-syntax-type``
     - ``--astryx-color-code-syntax-type``
   * - ``--astryx-syntax-variable``
     - ``--astryx-color-code-syntax-variable``
   * - ``--astryx-syntax-operator``
     - ``--astryx-color-code-syntax-operator``
   * - ``--astryx-syntax-constant``
     - ``--astryx-color-code-syntax-constant``
   * - ``--astryx-syntax-tag``
     - ``--astryx-color-code-syntax-tag``
   * - ``--astryx-syntax-attribute``
     - ``--astryx-color-code-syntax-attribute``
   * - ``--astryx-syntax-property``
     - ``--astryx-color-code-syntax-property``
   * - ``--astryx-syntax-punctuation``
     - ``--astryx-color-code-syntax-punctuation``
   * - ``--astryx-syntax-background``
     - ``--astryx-color-code-syntax-background``
   * - ``--astryx-header-selected``
     - ``--astryx-color-navigation-header-state-selected``
   * - ``--astryx-header-hover``
     - ``--astryx-color-navigation-header-state-hover``
   * - ``--astryx-code-border``
     - ``--astryx-color-code-border``
   * - ``--astryx-code-header``
     - ``--astryx-color-code-header-background``
   * - ``--astryx-code-title``
     - ``--astryx-color-code-title``
   * - ``--astryx-button-small-height``
     - ``--astryx-component-button-size-small-height``
   * - ``--astryx-button-small-min-height``
     - ``--astryx-component-button-size-small-min-height``
   * - ``--astryx-button-small-padding``
     - ``--astryx-component-button-size-small-padding``
   * - ``--astryx-button-medium-height``
     - ``--astryx-component-button-size-medium-height``
   * - ``--astryx-button-medium-min-height``
     - ``--astryx-component-button-size-medium-min-height``
   * - ``--astryx-button-medium-padding``
     - ``--astryx-component-button-size-medium-padding``
   * - ``--astryx-button-large-height``
     - ``--astryx-component-button-size-large-height``
   * - ``--astryx-button-large-min-height``
     - ``--astryx-component-button-size-large-min-height``
   * - ``--astryx-button-large-padding``
     - ``--astryx-component-button-size-large-padding``
   * - ``--astryx-button-border-width``
     - ``--astryx-component-button-border-width``
   * - ``--astryx-button-secondary-border-width``
     - ``--astryx-component-button-variant-secondary-border-width``
   * - ``--astryx-button-secondary-border-color``
     - ``--astryx-component-button-variant-secondary-border-color``
   * - ``--astryx-code-preview-size``
     - ``--astryx-component-code-preview-font-size``
   * - ``--astryx-code-preview-line``
     - ``--astryx-component-code-preview-line-height``
