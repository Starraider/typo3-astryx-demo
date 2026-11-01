import * as stylex from '@stylexjs/stylex';
import { buttonTokens } from '../tokens/components/button-tokens.stylex.js';
import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { motionTokens } from '../tokens/motion-tokens.stylex.js';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": typographyTokens["--astryx-typography-font-family-body"],
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "gap": spacingTokens["--astryx-spacing-2"],
    "borderWidth": buttonTokens["--astryx-component-button-border-width"],
    "borderStyle": "solid",
    "borderColor": "transparent",
    "borderRadius": buttonTokens["--astryx-component-button-radius"],
    "fontWeight": 500,
    "lineHeight": typographyTokens["--astryx-typography-label-line-height"],
    "minWidth": 0,
    "maxWidth": "100%",
    "textDecoration": "none",
    "cursor": "pointer",
    "transitionProperty": "background-color, opacity",
    "transitionDuration": motionTokens["--astryx-motion-duration-fast"],
    ":is(:disabled, [aria-disabled=\"true\"])": {
      "opacity": 0.6,
      "cursor": "default"
    },
    "@media (forced-colors: active)": {
      "borderWidth": 1,
      "borderStyle": "solid",
      "borderColor": "ButtonText"
    }
  },
  "variant_primary": {
    "backgroundColor": colorTokens["--astryx-color-accent"],
    "color": colorTokens["--astryx-color-on-accent"]
  },
  "variant_secondary": {
    "backgroundColor": {"default": buttonTokens["--astryx-component-button-variant-secondary-background"], ":hover": buttonTokens["--astryx-component-button-variant-secondary-background-hover"]},
    "borderWidth": buttonTokens["--astryx-component-button-variant-secondary-border-width"],
    "borderColor": buttonTokens["--astryx-component-button-variant-secondary-border-color"],
    "color": colorTokens["--astryx-color-text-primary"]
  },
  "variant_ghost": {
    "backgroundColor": "transparent",
    "color": colorTokens["--astryx-color-text-primary"]
  },
  "variant_destructive": {
    "backgroundColor": buttonTokens["--astryx-component-button-variant-destructive-background"],
    "color": buttonTokens["--astryx-component-button-variant-destructive-foreground"]
  },
  "size_small": {
    "padding": buttonTokens["--astryx-component-button-size-small-padding"],
    "height": buttonTokens["--astryx-component-button-size-small-height"],
    "minHeight": buttonTokens["--astryx-component-button-size-small-min-height"],
    "fontSize": buttonTokens["--astryx-component-button-size-small-font-size"]
  },
  "size_medium": {
    "padding": buttonTokens["--astryx-component-button-size-medium-padding"],
    "height": buttonTokens["--astryx-component-button-size-medium-height"],
    "minHeight": buttonTokens["--astryx-component-button-size-medium-min-height"],
    "fontSize": typographyTokens["--astryx-typography-label-font-size"]
  },
  "size_large": {
    "padding": buttonTokens["--astryx-component-button-size-large-padding"],
    "height": buttonTokens["--astryx-component-button-size-large-height"],
    "minHeight": buttonTokens["--astryx-component-button-size-large-min-height"],
    "fontSize": buttonTokens["--astryx-component-button-size-large-font-size"]
  }
});
