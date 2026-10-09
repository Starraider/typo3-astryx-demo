import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Token import guarantees JavaScript-defined defaults reach the compiled output.
export const styles = stylex.create({
  "root": {
    "fontFamily": tokens['--astryx-font'],
    "border": 0,
    "borderTopWidth": 1,
    "borderTopStyle": "solid",
    "marginBlock": "var(--astryx-space-6)"
  },
  "variant_subtle": {
    "borderTopColor": "var(--astryx-border)"
  },
  "variant_strong": {
    "borderTopColor": "var(--astryx-border-strong)"
  }
});
