import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Token import guarantees JavaScript-defined defaults reach the compiled output.
export const styles = stylex.create({
  "root": {
    "fontFamily": tokens['--astryx-font'],
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "boxSizing": "border-box",
    "height": 20,
    "verticalAlign": "middle",
    "gap": 4,
    "padding": "0 8px",
    "borderRadius": 9999,
    "fontSize": ".75rem",
    "fontWeight": 500,
    "lineHeight": "20px",
    "whiteSpace": "nowrap"
  },
  "variant_neutral": {
    "backgroundColor": "var(--astryx-muted)",
    "color": "var(--astryx-text)",
    "border": "1px solid var(--astryx-secondary)"
  },
  "variant_accent": {
    "backgroundColor": "var(--astryx-muted)",
    "color": "var(--astryx-text)",
    "border": "1px solid var(--astryx-accent)"
  },
  "variant_success": {
    "backgroundColor": "var(--astryx-muted)",
    "color": "var(--astryx-text)",
    "border": "1px solid var(--astryx-success)"
  },
  "variant_warning": {
    "backgroundColor": "var(--astryx-muted)",
    "color": "var(--astryx-text)",
    "border": "1px solid var(--astryx-warning)"
  },
  "variant_error": {
    "backgroundColor": "var(--astryx-muted)",
    "color": "var(--astryx-text)",
    "border": "1px solid var(--astryx-error)"
  }
});
