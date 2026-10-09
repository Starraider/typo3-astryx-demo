import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Token import guarantees JavaScript-defined defaults reach the compiled output.
export const styles = stylex.create({
  "root": {
    "fontFamily": tokens['--astryx-font'],
    "fontSize": "var(--astryx-font-size-body)",
    "fontWeight": 400,
    "lineHeight": "var(--astryx-line-body)",
    "color": "var(--astryx-text)"
  },
  "width_prose": {
    "maxWidth": "var(--astryx-prose-width)"
  },
  "width_full": {
    "maxWidth": "none"
  },
  "density_normal": {
    "lineHeight": "var(--astryx-line-body)"
  },
  "density_compact": {
    "lineHeight": 1.4
  }
});
