import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": "var(--astryx-font)",
    "display": "inline-block",
    "width": 8,
    "height": 8,
    "borderRadius": 9999,
    "flexShrink": 0
  },
  "variant_neutral": {
    "backgroundColor": "var(--astryx-secondary)"
  },
  "variant_accent": {
    "backgroundColor": "var(--astryx-accent)"
  },
  "variant_success": {
    "backgroundColor": "var(--astryx-success)"
  },
  "variant_warning": {
    "backgroundColor": "var(--astryx-warning)"
  },
  "variant_error": {
    "backgroundColor": "var(--astryx-error)"
  }
});
