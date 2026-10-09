import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Token import guarantees JavaScript-defined defaults reach the compiled output.
export const styles = stylex.create({
  "root": {
    "fontFamily": tokens['--astryx-font'],
    "display": "inline-block",
    "flexShrink": 0,
    "verticalAlign": "middle",
    "fill": "none",
    "stroke": "currentColor",
    "strokeWidth": 2
  },
  "size_small": {
    "width": 16,
    "height": 16
  },
  "size_medium": {
    "width": 20,
    "height": 20
  },
  "size_large": {
    "width": 24,
    "height": 24
  }
});
