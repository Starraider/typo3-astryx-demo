import * as stylex from '@stylexjs/stylex';

export const codeColorTokens = stylex.defineVars({
  "--astryx-color-code-surface": "var(--astryx-color-background-surface)",
  "--astryx-color-code-syntax-keyword": "light-dark(#a626a4, #d2a8ff)",
  "--astryx-color-code-syntax-string": "light-dark(#116329, #a7cfa0)",
  "--astryx-color-code-syntax-comment": "light-dark(#57606a, #a0a0a0)",
  "--astryx-color-code-syntax-number": "light-dark(#0550ae, #a5c8ff)",
  "--astryx-color-code-syntax-function": "light-dark(#6639ba, #b9c7ef)",
  "--astryx-color-code-syntax-type": "light-dark(#0550ae, #a5c8ff)",
  "--astryx-color-code-syntax-variable": "light-dark(#0550ae, #a5c8ff)",
  "--astryx-color-code-syntax-operator": "var(--astryx-color-text-primary)",
  "--astryx-color-code-syntax-constant": "light-dark(#a626a4, #d2a8ff)",
  "--astryx-color-code-syntax-tag": "light-dark(#6639ba, #b9c7ef)",
  "--astryx-color-code-syntax-attribute": "light-dark(#0550ae, #a5c8ff)",
  "--astryx-color-code-syntax-property": "var(--astryx-color-text-primary)",
  "--astryx-color-code-syntax-punctuation": "var(--astryx-color-text-primary)",
  "--astryx-color-code-syntax-background": "var(--astryx-color-background-muted)",
  "--astryx-color-code-border": "light-dark(var(--astryx-color-border-strong), var(--astryx-color-border-default))",
  "--astryx-color-code-header-background": "light-dark(color-mix(in srgb, var(--astryx-color-background-muted) 92%, var(--astryx-color-text-primary)), var(--astryx-color-background-muted))",
  "--astryx-color-code-title": "light-dark(color-mix(in srgb, var(--astryx-color-text-secondary) 85%, var(--astryx-color-text-primary)), var(--astryx-color-text-secondary))",
});
