import * as stylex from '@stylexjs/stylex';
import { colorTokens } from '../tokens/color-tokens.stylex.js';
import { typographyTokens } from '../tokens/typography-tokens.stylex.js';
import { spacingTokens } from '../tokens/spacing-tokens.stylex.js';
import { layoutTokens } from '../tokens/layout-tokens.stylex.js';
import { shapeTokens } from '../tokens/shape-tokens.stylex.js';
import { shadowTokens } from '../tokens/shadow-tokens.stylex.js';
import { motionTokens } from '../tokens/motion-tokens.stylex.js';
import { buttonTokens } from '../tokens/components/button-tokens.stylex.js';

export const colorTheme = stylex.createTheme(colorTokens, {
  "--astryx-color-accent": "light-dark(#005a85, #8edafa)",
  "--astryx-color-background-body": "light-dark(#eef7fb, #071b27)",
  "--astryx-color-background-muted": "light-dark(#dceef6, #193d4e)",
  "--astryx-color-background-surface": "light-dark(#ffffff, #102b3a)",
  "--astryx-color-border-default": "light-dark(#b7d3e0, #365c6e)",
  "--astryx-color-border-strong": "light-dark(#d4d4d4, #525252)",
  "--astryx-color-navigation-state-hover": "light-dark(#0000000D, #ffffff0D)",
  "--astryx-color-navigation-state-pressed": "light-dark(#0000001A, #ffffff1A)",
  "--astryx-color-navigation-state-selected": "light-dark(#0000000F, #ffffff1A)",
  "--astryx-color-on-accent": "light-dark(#ffffff, #15110c)",
  "--astryx-color-status-error": "light-dark(#76000c, #ffc4be)",
  "--astryx-color-status-success": "light-dark(#00490b, #a4d6a3)",
  "--astryx-color-status-warning": "light-dark(#4b3900, #f8d36a)",
  "--astryx-color-text-primary": "light-dark(#15110c, #dfe2e5)",
  "--astryx-color-text-secondary": "light-dark(#4e606f, #aaafb5)",
});

export const typographyTheme = stylex.createTheme(typographyTokens, {
  "--astryx-typography-font-family-body": "Figtree, \"Figtree Variable\", system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
  "--astryx-typography-font-family-code": "\"SF Mono\", Monaco, Consolas, monospace",
});

export const spacingTheme = stylex.createTheme(spacingTokens, {
  "--astryx-spacing-1": "4px",
  "--astryx-spacing-12": "48px",
  "--astryx-spacing-2": "8px",
  "--astryx-spacing-3": "12px",
  "--astryx-spacing-4": "16px",
  "--astryx-spacing-6": "24px",
  "--astryx-spacing-8": "32px",
});

export const layoutTheme = stylex.createTheme(layoutTokens, {
  "--astryx-layout-content-max-width": "72rem",
  "--astryx-layout-detail-width": "20rem",
  "--astryx-layout-navigation-width": "16rem",
  "--astryx-layout-prose-max-width": "68ch",
});

export const shapeTheme = stylex.createTheme(shapeTokens, {
  "--astryx-shape-radius-container": "12px",
  "--astryx-shape-radius-element": "8px",
  "--astryx-shape-radius-page": "28px",
});

export const shadowTheme = stylex.createTheme(shadowTokens, {
  "--astryx-effect-shadow-color": "light-dark(#0000001A, #0000004D)",
  "--astryx-effect-shadow-default": "0 2px 12px var(--astryx-effect-shadow-color)",
});

export const motionTheme = stylex.createTheme(motionTokens, {
  "--astryx-motion-duration-fast": "125ms",
  "--astryx-motion-easing-standard": "cubic-bezier(0.24, 1, 0.4, 1)",
});

export const buttonTheme = stylex.createTheme(buttonTokens, {
  "--astryx-component-button-variant-destructive-background": "light-dark(#76000c, #ffc4be)",
  "--astryx-component-button-variant-destructive-foreground": "light-dark(#ffffff, #15110c)",
});
