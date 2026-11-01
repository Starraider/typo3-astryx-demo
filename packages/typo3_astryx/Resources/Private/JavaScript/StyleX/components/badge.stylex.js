import * as stylex from '@stylexjs/stylex';
import { badgeTokens } from '../tokens/components/badge-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": typographyTokens["--astryx-typography-font-family-body"],
    "display": "inline-flex",
    "alignItems": "center",
    "justifyContent": "center",
    "boxSizing": "border-box",
    "height": 20,
    "verticalAlign": "middle",
    "gap": 4,
    "padding": "0 8px",
    "borderRadius": 9999,
    "fontSize": typographyTokens["--astryx-typography-supporting-font-size"],
    "fontWeight": 500,
    "lineHeight": badgeTokens["--astryx-component-badge-line-height"],
    "whiteSpace": "nowrap"
  },
  "variant_neutral": {
    "backgroundColor": badgeTokens["--astryx-component-badge-variant-neutral-background"],
    "color": badgeTokens["--astryx-component-badge-variant-neutral-foreground"],
    "borderWidth": badgeTokens["--astryx-component-badge-border-width"],
    "borderStyle": "solid",
    "borderColor": badgeTokens["--astryx-component-badge-variant-neutral-border-color"]
  },
  "variant_accent": {
    "backgroundColor": badgeTokens["--astryx-component-badge-variant-accent-background"],
    "color": badgeTokens["--astryx-component-badge-variant-accent-foreground"],
    "borderWidth": badgeTokens["--astryx-component-badge-border-width"],
    "borderStyle": "solid",
    "borderColor": badgeTokens["--astryx-component-badge-variant-accent-border-color"]
  },
  "variant_success": {
    "backgroundColor": badgeTokens["--astryx-component-badge-variant-success-background"],
    "color": badgeTokens["--astryx-component-badge-variant-success-foreground"],
    "borderWidth": badgeTokens["--astryx-component-badge-border-width"],
    "borderStyle": "solid",
    "borderColor": badgeTokens["--astryx-component-badge-variant-success-border-color"]
  },
  "variant_warning": {
    "backgroundColor": badgeTokens["--astryx-component-badge-variant-warning-background"],
    "color": badgeTokens["--astryx-component-badge-variant-warning-foreground"],
    "borderWidth": badgeTokens["--astryx-component-badge-border-width"],
    "borderStyle": "solid",
    "borderColor": badgeTokens["--astryx-component-badge-variant-warning-border-color"]
  },
  "variant_error": {
    "backgroundColor": badgeTokens["--astryx-component-badge-variant-error-background"],
    "color": badgeTokens["--astryx-component-badge-variant-error-foreground"],
    "borderWidth": badgeTokens["--astryx-component-badge-border-width"],
    "borderStyle": "solid",
    "borderColor": badgeTokens["--astryx-component-badge-variant-error-border-color"]
  }
});
