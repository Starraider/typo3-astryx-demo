import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": typographyTokens["--astryx-typography-font-family-body"],
    "border": 0,
    "borderTopWidth": 1,
    "borderTopStyle": "solid",
    "marginBlock": spacingTokens["--astryx-spacing-6"]
  },
  "variant_subtle": {
    "borderTopColor": colorTokens["--astryx-color-border-default"]
  },
  "variant_strong": {
    "borderTopColor": colorTokens["--astryx-color-border-strong"]
  }
});
