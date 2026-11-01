import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { layoutTokens } from '../tokens/layout-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": typographyTokens["--astryx-typography-font-family-body"],
    "fontSize": typographyTokens["--astryx-typography-body-font-size"],
    "fontWeight": 400,
    "lineHeight": typographyTokens["--astryx-typography-body-line-height"],
    "color": colorTokens["--astryx-color-text-primary"]
  },
  "width_prose": {
    "maxWidth": layoutTokens["--astryx-layout-prose-max-width"]
  },
  "width_full": {
    "maxWidth": "none"
  },
  "density_normal": {
    "lineHeight": typographyTokens["--astryx-typography-body-line-height"]
  },
  "density_compact": {
    "lineHeight": 1.4
  },
  "align_start": {
    "textAlign": "start"
  },
  "align_center": {
    "textAlign": "center",
    "marginInline": "auto"
  },
  "align_end": {
    "textAlign": "end",
    "marginInlineStart": "auto",
    "marginInlineEnd": 0
  }
});
