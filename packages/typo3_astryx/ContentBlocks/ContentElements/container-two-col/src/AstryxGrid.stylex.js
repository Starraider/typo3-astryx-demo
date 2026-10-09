import * as stylex from '@stylexjs/stylex';
import {tokens} from '../../../../Resources/Private/JavaScript/Stylex/tokens.stylex.js';
// Token import guarantees JavaScript-defined defaults reach the compiled output.
export const styles = stylex.create({
  "root": {
    "fontFamily": tokens['--astryx-font'],
    "display": "grid",
    "minWidth": 0
  },
  "ratio_50_50": {
    "gridTemplateColumns": "repeat(2, minmax(0, 1fr))"
  },
  "ratio_66_33": {
    "gridTemplateColumns": "minmax(0, 2fr) minmax(0, 1fr)"
  },
  "ratio_33_66": {
    "gridTemplateColumns": "minmax(0, 1fr) minmax(0, 2fr)"
  },
  "gap_normal": {
    "gap": "var(--astryx-space-6)"
  },
  "gap_small": {
    "gap": "var(--astryx-space-3)"
  },
  "gap_large": {
    "gap": "var(--astryx-space-8)"
  },
  "columns_auto": {},
  "columns_two": {},
  "columns_three": {},
  "columns_four": {}
});
