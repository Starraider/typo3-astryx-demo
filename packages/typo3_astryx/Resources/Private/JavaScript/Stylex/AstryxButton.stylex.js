import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": "var(--astryx-font)",
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "gap": "var(--astryx-space-2)",
    "borderWidth": "var(--astryx-button-border-width)",
    "borderStyle": "solid",
    "borderColor": "transparent",
    "borderRadius": "var(--astryx-button-radius)",
    "fontWeight": 500,
    "lineHeight": "var(--astryx-line-label)",
    "minWidth": 0,
    "maxWidth": "100%",
    "textDecoration": "none",
    "cursor": "pointer",
    "transitionProperty": "background-color, opacity",
    "transitionDuration": "var(--astryx-duration)"
  },
  "variant_primary": {
    "backgroundColor": "var(--astryx-accent)",
    "color": "var(--astryx-on-accent)"
  },
  "variant_secondary": {
    "backgroundColor": {"default": "var(--astryx-button-secondary-background)", ":hover": "var(--astryx-button-secondary-hover)"},
    "borderWidth": "var(--astryx-button-secondary-border-width)",
    "borderColor": "var(--astryx-button-secondary-border-color)",
    "color": "var(--astryx-text)"
  },
  "variant_ghost": {
    "backgroundColor": "transparent",
    "color": "var(--astryx-text)"
  },
  "variant_destructive": {
    "backgroundColor": "var(--astryx-button-destructive-background)",
    "color": "var(--astryx-button-destructive-text)"
  },
  "size_small": {
    "padding": "var(--astryx-button-small-padding)",
    "height": "var(--astryx-button-small-height)",
    "minHeight": "var(--astryx-button-small-min-height)",
    "fontSize": "var(--astryx-button-small-size)"
  },
  "size_medium": {
    "padding": "var(--astryx-button-medium-padding)",
    "height": "var(--astryx-button-medium-height)",
    "minHeight": "var(--astryx-button-medium-min-height)",
    "fontSize": "var(--astryx-font-size-label)"
  },
  "size_large": {
    "padding": "var(--astryx-button-large-padding)",
    "height": "var(--astryx-button-large-height)",
    "minHeight": "var(--astryx-button-large-min-height)",
    "fontSize": "var(--astryx-button-large-size)"
  }
});
