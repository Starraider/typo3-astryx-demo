import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Token import guarantees JavaScript-defined defaults reach the compiled output.
export const styles = stylex.create({
  "root": {
    "fontFamily": tokens['--astryx-font'],
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "gap": "var(--astryx-space-2)",
    "border": "1px solid transparent",
    "borderRadius": "var(--astryx-radius-element)",
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
    "backgroundColor": "var(--astryx-muted)",
    "color": "var(--astryx-text)"
  },
  "variant_ghost": {
    "backgroundColor": "transparent",
    "color": "var(--astryx-text)"
  },
  "variant_destructive": {
    "backgroundColor": "var(--astryx-error)",
    "color": "white"
  },
  "size_small": {
    "padding": "6px 10px",
    "minHeight": 32,
    "fontSize": ".75rem"
  },
  "size_medium": {
    "padding": "8px 12px",
    "minHeight": 44,
    "fontSize": "var(--astryx-font-size-label)"
  },
  "size_large": {
    "padding": "12px 20px",
    "minHeight": 48,
    "fontSize": "1.0625rem"
  }
});
