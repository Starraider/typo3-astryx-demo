import * as stylex from '@stylexjs/stylex';

export const shadowTokens = stylex.defineVars({
  "--astryx-effect-shadow-color": "light-dark(#0000001A, #0000004D)",
  "--astryx-effect-shadow-default": "0 2px 12px var(--astryx-effect-shadow-color)",
  "--astryx-effect-shadow-medium": "var(--astryx-effect-shadow-default)",
  "--astryx-effect-shadow-high": "var(--astryx-effect-shadow-default)",
  "--astryx-effect-shadow-inset-hover": "var(--astryx-effect-shadow-default)",
  "--astryx-effect-shadow-inset-selected": "var(--astryx-effect-shadow-default)",
  "--astryx-effect-shadow-inset-success": "var(--astryx-effect-shadow-default)",
  "--astryx-effect-shadow-inset-warning": "var(--astryx-effect-shadow-default)",
  "--astryx-effect-shadow-inset-error": "var(--astryx-effect-shadow-default)",
});
