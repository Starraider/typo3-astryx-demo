import * as stylex from '@stylexjs/stylex';
import {tokens} from './tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": "var(--astryx-font)",
    "minWidth": 0,
    "borderRadius": "var(--astryx-radius-container)",
    "backgroundColor": "var(--astryx-card)",
    "color": "var(--astryx-text)",
    "overflowWrap": "anywhere"
  },
  "variant_outlined": {
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": "var(--astryx-card-border)"
  },
  "variant_elevated": {
    "boxShadow": "var(--astryx-shadow)"
  },
  "variant_flat": {
    "borderWidth": 0
  },
  "padding_normal": {
    "padding": "var(--astryx-card-padding)"
  },
  "padding_compact": {
    "padding": "var(--astryx-space-3)"
  }
});
