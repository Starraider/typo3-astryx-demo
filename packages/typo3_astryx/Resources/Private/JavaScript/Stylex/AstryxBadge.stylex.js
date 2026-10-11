import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": "var(--astryx-font)",
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "boxSizing": "border-box",
    "height": 20,
    "verticalAlign": "middle",
    "gap": 4,
    "padding": "0 8px",
    "borderRadius": 9999,
    "fontSize": "var(--astryx-font-size-supporting)",
    "fontWeight": 500,
    "lineHeight": "var(--astryx-badge-line)",
    "whiteSpace": "nowrap"
  },
  "variant_neutral": {
    "backgroundColor": "var(--astryx-badge-neutral-background)",
    "color": "var(--astryx-badge-neutral-text)",
    "borderWidth": "var(--astryx-badge-border-width)",
    "borderStyle": "solid",
    "borderColor": "var(--astryx-badge-neutral-border)"
  },
  "variant_accent": {
    "backgroundColor": "var(--astryx-badge-accent-background)",
    "color": "var(--astryx-badge-accent-text)",
    "borderWidth": "var(--astryx-badge-border-width)",
    "borderStyle": "solid",
    "borderColor": "var(--astryx-badge-accent-border)"
  },
  "variant_success": {
    "backgroundColor": "var(--astryx-badge-success-background)",
    "color": "var(--astryx-badge-success-text)",
    "borderWidth": "var(--astryx-badge-border-width)",
    "borderStyle": "solid",
    "borderColor": "var(--astryx-badge-success-border)"
  },
  "variant_warning": {
    "backgroundColor": "var(--astryx-badge-warning-background)",
    "color": "var(--astryx-badge-warning-text)",
    "borderWidth": "var(--astryx-badge-border-width)",
    "borderStyle": "solid",
    "borderColor": "var(--astryx-badge-warning-border)"
  },
  "variant_error": {
    "backgroundColor": "var(--astryx-badge-error-background)",
    "color": "var(--astryx-badge-error-text)",
    "borderWidth": "var(--astryx-badge-border-width)",
    "borderStyle": "solid",
    "borderColor": "var(--astryx-badge-error-border)"
  }
});
