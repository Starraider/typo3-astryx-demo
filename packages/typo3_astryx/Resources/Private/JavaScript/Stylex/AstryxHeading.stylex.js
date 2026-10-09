import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Token import guarantees JavaScript-defined defaults reach the compiled output.
export const styles = stylex.create({
  "root": {
    "fontFamily": tokens['--astryx-font'],
    "color": "var(--astryx-text)",
    "fontWeight": 600,
    "lineHeight": "var(--astryx-heading-line, 1.2413793103)",
    "marginBlock": 0,
    "overflowWrap": "anywhere"
  },
  "size_medium": {
    "fontSize": "var(--astryx-heading-size, 1.8125rem)"
  },
  "size_small": {
    "fontSize": "1.5rem",
    "lineHeight": "1.3333333333"
  },
  "size_large": {
    "fontSize": "2.1875rem",
    "lineHeight": "1.2571428571"
  },
  "size_display": {
    "fontSize": "2.625rem",
    "lineHeight": "1.2380952381"
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
