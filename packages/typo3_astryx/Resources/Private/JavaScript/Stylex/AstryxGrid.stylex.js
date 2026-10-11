import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": "var(--astryx-font)",
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
  "ratio_25_75": {
    "gridTemplateColumns": "minmax(0, 1fr) minmax(0, 3fr)"
  },
  "ratio_75_25": {
    "gridTemplateColumns": "minmax(0, 3fr) minmax(0, 1fr)"
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
  "columns_three": {
    "gridTemplateColumns": "repeat(3, minmax(0, 1fr))"
  },
  "columns_four": {
    "gridTemplateColumns": "repeat(4, minmax(0, 1fr))"
  }
});
