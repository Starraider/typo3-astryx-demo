import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": "var(--astryx-font)",
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
