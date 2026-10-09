import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Token import guarantees JavaScript-defined defaults reach the compiled output.
export const styles = stylex.create({
  "root": {
    "fontFamily": tokens['--astryx-font'],
    "padding": "var(--astryx-space-6)",
    "borderRadius": "var(--astryx-radius-container)",
    "borderInlineStartWidth": 4,
    "borderInlineStartStyle": "solid",
    "backgroundColor": "var(--astryx-surface)"
  },
  "variant_neutral": {
    "borderInlineStartColor": "var(--astryx-secondary)"
  },
  "variant_accent": {
    "borderInlineStartColor": "var(--astryx-accent)"
  },
  "variant_success": {
    "borderInlineStartColor": "var(--astryx-success)"
  },
  "variant_warning": {
    "borderInlineStartColor": "var(--astryx-warning)"
  },
  "variant_error": {
    "borderInlineStartColor": "var(--astryx-error)"
  }
});
