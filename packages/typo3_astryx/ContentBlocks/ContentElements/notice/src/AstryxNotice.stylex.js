import * as stylex from '@stylexjs/stylex';
import {tokens} from '../../../../Resources/Private/JavaScript/Stylex/tokens.stylex.js';
// Use public variables so nested theme attributes control the recipe.
export const styles = stylex.create({
  "root": {
    "fontFamily": "var(--astryx-font)",
    "padding": "var(--astryx-notice-padding)",
    "borderRadius": "var(--astryx-radius-container)",
    "borderInlineStartWidth": "var(--astryx-notice-border-width)",
    "borderInlineStartStyle": "solid",
    "backgroundColor": "var(--astryx-surface)"
  },
  "variant_neutral": {
    "borderInlineStartColor": "var(--astryx-notice-neutral-border)",
    "backgroundColor": "var(--astryx-notice-neutral-background)",
    "--astryx-text": "var(--astryx-notice-neutral-text)",
    "--astryx-secondary": "var(--astryx-notice-neutral-secondary)"
  },
  "variant_accent": {
    "borderInlineStartColor": "var(--astryx-notice-accent-border)",
    "backgroundColor": "var(--astryx-notice-accent-background)",
    "--astryx-text": "var(--astryx-notice-accent-text)",
    "--astryx-secondary": "var(--astryx-notice-accent-secondary)"
  },
  "variant_success": {
    "borderInlineStartColor": "var(--astryx-notice-success-border)",
    "backgroundColor": "var(--astryx-notice-success-background)",
    "--astryx-text": "var(--astryx-notice-success-text)",
    "--astryx-secondary": "var(--astryx-notice-success-secondary)"
  },
  "variant_warning": {
    "borderInlineStartColor": "var(--astryx-notice-warning-border)",
    "backgroundColor": "var(--astryx-notice-warning-background)",
    "--astryx-text": "var(--astryx-notice-warning-text)",
    "--astryx-secondary": "var(--astryx-notice-warning-secondary)"
  },
  "variant_error": {
    "borderInlineStartColor": "var(--astryx-notice-error-border)",
    "backgroundColor": "var(--astryx-notice-error-background)",
    "--astryx-text": "var(--astryx-notice-error-text)",
    "--astryx-secondary": "var(--astryx-notice-error-secondary)"
  }
});
