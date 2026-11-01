import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/color-tokens.stylex.js';
import { noticeTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/components/notice-tokens.stylex.js';
import { shapeTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/shape-tokens.stylex.js';
import { typographyTokens } from '../../../../Resources/Private/JavaScript/StyleX/tokens/typography-tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": typographyTokens["--astryx-typography-font-family-body"],
    "padding": noticeTokens["--astryx-component-notice-padding"],
    "borderRadius": shapeTokens["--astryx-shape-radius-container"],
    "borderInlineStartWidth": noticeTokens["--astryx-component-notice-border-width"],
    "borderInlineStartStyle": "solid",
    "backgroundColor": colorTokens["--astryx-color-background-surface"]
  },
  "variant_neutral": {
    "borderInlineStartColor": noticeTokens["--astryx-component-notice-variant-neutral-border-color"],
    "backgroundColor": noticeTokens["--astryx-component-notice-variant-neutral-background"],
    "--astryx-color-text-primary": noticeTokens["--astryx-component-notice-variant-neutral-foreground"],
    "--astryx-color-text-secondary": noticeTokens["--astryx-component-notice-variant-neutral-supporting-text-color"]
  },
  "variant_accent": {
    "borderInlineStartColor": noticeTokens["--astryx-component-notice-variant-accent-border-color"],
    "backgroundColor": noticeTokens["--astryx-component-notice-variant-accent-background"],
    "--astryx-color-text-primary": noticeTokens["--astryx-component-notice-variant-accent-foreground"],
    "--astryx-color-text-secondary": noticeTokens["--astryx-component-notice-variant-accent-supporting-text-color"]
  },
  "variant_success": {
    "borderInlineStartColor": noticeTokens["--astryx-component-notice-variant-success-border-color"],
    "backgroundColor": noticeTokens["--astryx-component-notice-variant-success-background"],
    "--astryx-color-text-primary": noticeTokens["--astryx-component-notice-variant-success-foreground"],
    "--astryx-color-text-secondary": noticeTokens["--astryx-component-notice-variant-success-supporting-text-color"]
  },
  "variant_warning": {
    "borderInlineStartColor": noticeTokens["--astryx-component-notice-variant-warning-border-color"],
    "backgroundColor": noticeTokens["--astryx-component-notice-variant-warning-background"],
    "--astryx-color-text-primary": noticeTokens["--astryx-component-notice-variant-warning-foreground"],
    "--astryx-color-text-secondary": noticeTokens["--astryx-component-notice-variant-warning-supporting-text-color"]
  },
  "variant_error": {
    "borderInlineStartColor": noticeTokens["--astryx-component-notice-variant-error-border-color"],
    "backgroundColor": noticeTokens["--astryx-component-notice-variant-error-background"],
    "--astryx-color-text-primary": noticeTokens["--astryx-component-notice-variant-error-foreground"],
    "--astryx-color-text-secondary": noticeTokens["--astryx-component-notice-variant-error-supporting-text-color"]
  }
});
