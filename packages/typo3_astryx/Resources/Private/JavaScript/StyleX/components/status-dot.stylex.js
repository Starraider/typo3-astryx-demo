import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": typographyTokens["--astryx-typography-font-family-body"],
    "display": "inline-block",
    "width": 8,
    "height": 8,
    "borderRadius": 9999,
    "flexShrink": 0
  },
  "variant_neutral": {
    "backgroundColor": colorTokens["--astryx-color-text-secondary"]
  },
  "variant_accent": {
    "backgroundColor": colorTokens["--astryx-color-accent"]
  },
  "variant_success": {
    "backgroundColor": colorTokens["--astryx-color-status-success"]
  },
  "variant_warning": {
    "backgroundColor": colorTokens["--astryx-color-status-warning"]
  },
  "variant_error": {
    "backgroundColor": colorTokens["--astryx-color-status-error"]
  }
});
