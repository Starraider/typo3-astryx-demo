import * as stylex from '@stylexjs/stylex';

export const buttonTokens = stylex.defineVars({
  "--astryx-component-button-radius": "var(--astryx-shape-radius-element)",
  "--astryx-component-button-variant-secondary-background": "var(--astryx-color-background-muted)",
  "--astryx-component-button-variant-secondary-background-hover": "var(--astryx-color-navigation-state-hover)",
  "--astryx-component-button-variant-destructive-background": "light-dark(#76000c, #ffc4be)",
  "--astryx-component-button-variant-destructive-foreground": "light-dark(#ffffff, #15110c)",
  "--astryx-component-button-size-small-font-size": ".75rem",
  "--astryx-component-button-size-large-font-size": "1.0625rem",
  "--astryx-component-button-size-small-height": "auto",
  "--astryx-component-button-size-small-min-height": "32px",
  "--astryx-component-button-size-small-padding": "6px 10px",
  "--astryx-component-button-size-medium-height": "auto",
  "--astryx-component-button-size-medium-min-height": "44px",
  "--astryx-component-button-size-medium-padding": "8px 12px",
  "--astryx-component-button-size-large-height": "auto",
  "--astryx-component-button-size-large-min-height": "48px",
  "--astryx-component-button-size-large-padding": "12px 20px",
  "--astryx-component-button-border-width": "1px",
  "--astryx-component-button-variant-secondary-border-width": "1px",
  "--astryx-component-button-variant-secondary-border-color": "transparent",
});
