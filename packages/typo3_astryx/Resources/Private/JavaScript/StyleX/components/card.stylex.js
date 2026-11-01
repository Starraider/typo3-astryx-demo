import * as stylex from '@stylexjs/stylex';
import { cardTokens } from '../tokens/components/card-tokens.stylex.js';
import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { shadowTokens } from '../tokens/shadow-tokens.stylex.js';
import { shapeTokens } from '../tokens/shape-tokens.stylex.js';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": typographyTokens["--astryx-typography-font-family-body"],
    "minWidth": 0,
    "borderRadius": shapeTokens["--astryx-shape-radius-container"],
    "backgroundColor": colorTokens["--astryx-color-background-card"],
    "color": colorTokens["--astryx-color-text-primary"],
    "overflowWrap": "anywhere"
  },
  "variant_outlined": {
    "borderWidth": 1,
    "borderStyle": "solid",
    "borderColor": colorTokens["--astryx-color-border-card"]
  },
  "variant_elevated": {
    "boxShadow": shadowTokens["--astryx-effect-shadow-default"]
  },
  "variant_flat": {
    "borderWidth": 0
  },
  "padding_normal": {
    "padding": cardTokens["--astryx-component-card-padding"]
  },
  "padding_compact": {
    "padding": spacingTokens["--astryx-spacing-3"]
  }
});
