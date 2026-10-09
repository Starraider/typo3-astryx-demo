import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Token import guarantees JavaScript-defined defaults reach the compiled output.
export const styles = stylex.create({
  "root": {
    "fontFamily": tokens['--astryx-font'],
    "minWidth": 0,
    "borderRadius": "var(--astryx-radius-container)",
    "backgroundColor": "var(--astryx-surface)",
    "color": "var(--astryx-text)",
    "overflowWrap": "anywhere"
  },
  "variant_outlined": {
    "border": "1px solid var(--astryx-border-strong)"
  },
  "variant_elevated": {
    "boxShadow": "var(--astryx-shadow)"
  },
  "variant_flat": {
    "border": 0
  },
  "padding_normal": {
    "padding": "var(--astryx-space-6)"
  },
  "padding_compact": {
    "padding": "var(--astryx-space-3)"
  }
});
