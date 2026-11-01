import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": typographyTokens["--astryx-typography-font-family-heading"],
    "color": {
      "default": colorTokens["--astryx-color-text-primary"],
      ":has(> a)": colorTokens["--astryx-color-text-link"]
    },
    "fontWeight": "var(--heading-font-weight, var(--astryx-typography-heading-2-font-weight))",
    "lineHeight": "var(--heading-line-height, var(--astryx-typography-heading-2-line-height))",
    "marginBlock": 0,
    "overflowWrap": "anywhere"
  },
  "size_medium": {
    "fontSize": "var(--heading-font-size, var(--astryx-typography-heading-2-font-size))"
  },
  "size_small": {
    "fontSize": typographyTokens["--astryx-typography-heading-3-font-size"],
    "fontWeight": typographyTokens["--astryx-typography-heading-3-font-weight"],
    "lineHeight": typographyTokens["--astryx-typography-heading-3-line-height"]
  },
  "size_large": {
    "fontSize": typographyTokens["--astryx-typography-heading-large-font-size"],
    "fontWeight": typographyTokens["--astryx-typography-heading-1-font-weight"],
    "lineHeight": typographyTokens["--astryx-typography-heading-large-line-height"]
  },
  "size_display": {
    "fontSize": typographyTokens["--astryx-typography-display-font-size"],
    "fontWeight": typographyTokens["--astryx-typography-display-font-weight"],
    "lineHeight": typographyTokens["--astryx-typography-display-line-height"]
  },
  "spacing_after": {
    "marginBlockEnd": spacingTokens["--astryx-spacing-2"]
  },
  "spacing_none": {
    "marginBlockEnd": 0
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
