import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": "var(--astryx-font-heading)",
    "color": "var(--astryx-text)",
    "fontWeight": "var(--astryx-heading-weight, var(--astryx-h2-weight))",
    "lineHeight": "var(--astryx-heading-line, var(--astryx-h2-line))",
    "marginBlock": 0,
    "overflowWrap": "anywhere"
  },
  "size_medium": {
    "fontSize": "var(--astryx-heading-size, var(--astryx-h2-size))"
  },
  "size_small": {
    "fontSize": "var(--astryx-h3-size)",
    "fontWeight": "var(--astryx-h3-weight)",
    "lineHeight": "var(--astryx-h3-line)"
  },
  "size_large": {
    "fontSize": "var(--astryx-heading-large-size)",
    "fontWeight": "var(--astryx-h1-weight)",
    "lineHeight": "var(--astryx-heading-large-line)"
  },
  "size_display": {
    "fontSize": "var(--astryx-display-size)",
    "fontWeight": "var(--astryx-display-weight)",
    "lineHeight": "var(--astryx-display-line)"
  },
  "align_start": {
    "textAlign": "start"
  },
  "align_center": {
    "textAlign": "center"
  },
  "align_end": {
    "textAlign": "end"
  },
  "align_left": {
    "textAlign": "left"
  },
  "align_right": {
    "textAlign": "right"
  }
});
